/**
 * ARGO FLOATS - In-situ vertical profiles of T, S, and sometimes nutrients
 * Source: IFREMER CORIOLIS, NOAA
 * Update frequency: Variable (floats report ~every 10 days)
 * Resolution: Individual float profiles, sparse coverage
 * Variables: Temperature, Salinity, Nutrients (some)
 */

interface ARGOProfile {
  float_id: string
  profile_number: number
  latitude: number
  longitude: number
  measurement_date: string
  profile_data: {
    depth: number // meters
    temperature: number // Celsius
    salinity: number // PSU
    dissolved_oxygen?: number // umol/kg
    nitrate?: number // umol/kg
  }[]
  distance_to_target: number // km
}

export async function fetchNearestARGOFloats(
  targetLat: number,
  targetLon: number,
  maxDistance: number = 200 // km
): Promise<ARGOProfile[]> {
  try {
    // IFREMER CORIOLIS endpoint for ARGO data
    const url = `https://www.ifremer.fr/erddap/search/index.html?page=1&itemsPerPage=1000&searchFor=ARGO&institution=IFREMER&minLat=${targetLat - 5}&maxLat=${targetLat + 5}&minLon=${targetLon - 5}&maxLon=${targetLon + 5}`

    const response = await fetch(url)
    if (!response.ok) return []

    // This would require parsing HTML/JSON response
    // For now, return empty as ARGO API is complex
    // In production, use ERDDAP client library

    return []
  } catch (error) {
    console.error('Error fetching ARGO floats:', error)
    return []
  }
}

export async function analyzeStratificationFromARGO(
  profiles: ARGOProfile[]
): Promise<{
  stratification_strength: 'weak' | 'moderate' | 'strong'
  mixed_layer_depth: number
  thermocline_depth: number
  risk_assessment: string
}> {
  if (profiles.length === 0) {
    return {
      stratification_strength: 'moderate',
      mixed_layer_depth: 20,
      thermocline_depth: 30,
      risk_assessment: 'Sin datos ARGO disponibles - usar estimación Copernicus'
    }
  }

  const firstProfile = profiles[0]
  const profileData = firstProfile.profile_data.sort((a, b) => a.depth - b.depth)

  // Find mixed layer depth (where density changes)
  let mldDepth = 20 // default
  let thermoclineDepth = 30

  for (let i = 0; i < profileData.length - 1; i++) {
    const tempDiff = profileData[i].temperature - profileData[i + 1].temperature
    if (tempDiff > 0.5) { // 0.5°C change threshold
      mldDepth = profileData[i].depth
      thermoclineDepth = profileData[i + 1].depth
      break
    }
  }

  const stratificationStrength = mldDepth < 15 ? 'strong' : mldDepth < 30 ? 'moderate' : 'weak'

  return {
    stratification_strength: stratificationStrength,
    mixed_layer_depth: mldDepth,
    thermocline_depth: thermoclineDepth,
    risk_assessment: stratificationStrength === 'strong' ?
      'Agua muy estratificada - ALTO RIESGO para concentración de células' :
      'Estratificación moderada - RIESGO MODERADO'
  }
}
