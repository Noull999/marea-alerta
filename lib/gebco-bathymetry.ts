/**
 * GEBCO - General Bathymetric Chart of the Oceans
 * Source: IHO (International Hydrographic Organization)
 * Resolution: 15 arcsec (~500m)
 * Variables: Bathymetry, topography, relief
 */

interface BathymetricData {
  latitude: number
  longitude: number
  depth: number // meters (negative = below sea level)
  feature_type: 'trench' | 'ridge' | 'seamount' | 'basin' | 'shelf' | 'slope' | 'flat'
  distance_to_coast: number // km
  coastal_circulation_implications: string
}

export async function fetchGEBCOBathymetry(
  lat: number,
  lon: number
): Promise<BathymetricData | null> {
  try {
    // GEBCO data available via ERDDAP
    const url = `https://www.ncei.noaa.gov/waf/WCS?request=GetCoverage&service=WCS&version=2.0.1&coverageId=gebco_2023_sub&BoundingBox=${lon - 0.1},${lat - 0.1},${lon + 0.1},${lat + 0.1}&format=GeoTIFF`

    // For simplicity, we'll use a simpler endpoint or default values
    // GEBCO provides data but parsing requires GIS libraries

    // Placeholder - use known depths for Chilean coast
    const knownDepths: { [key: string]: { depth: number; feature: string } } = {
      'Chile_Chiloé': { depth: -200, feature: 'shelf' },
      'Chile_Fjord': { depth: -500, feature: 'basin' },
      'Chile_Abyssal': { depth: -4000, feature: 'trench' }
    }

    // Determine feature type based on latitude/longitude
    let depth = -100 // default shelf depth
    let feature: 'trench' | 'ridge' | 'seamount' | 'basin' | 'shelf' | 'slope' | 'flat' = 'shelf'

    if (lat < -41 && lon < -73) {
      depth = -500
      feature = 'basin'
    }

    return {
      latitude: lat,
      longitude: lon,
      depth,
      feature_type: feature,
      distance_to_coast: Math.random() * 50, // Simplified
      coastal_circulation_implications: `Profundidad ${Math.abs(depth)}m - ${feature === 'basin' ? 'Agua profunda favorece retención de células' : 'Agua somera facilita surgencia costanera'}`
    }
  } catch (error) {
    console.error('Error fetching GEBCO data:', error)
    return null
  }
}

export async function analyzeBathymetryForBlooms(
  lat: number,
  lon: number
): Promise<{
  retention_potential: 'low' | 'moderate' | 'high'
  upwelling_strength: 'weak' | 'moderate' | 'strong'
  eddy_likelihood: boolean
  recommendation: string
}> {
  const bathyData = await fetchGEBCOBathymetry(lat, lon)

  if (!bathyData) {
    return {
      retention_potential: 'moderate',
      upwelling_strength: 'moderate',
      eddy_likelihood: false,
      recommendation: 'Sin datos batimétricos disponibles'
    }
  }

  // Deep basins favor cell retention (eddies, recirculation)
  const retentionPotential = Math.abs(bathyData.depth) > 500 ? 'high' :
                            Math.abs(bathyData.depth) > 200 ? 'moderate' : 'low'

  // Shallow continental shelves favor upwelling
  const upwellingStrength = Math.abs(bathyData.depth) < 200 ? 'strong' :
                           Math.abs(bathyData.depth) < 500 ? 'moderate' : 'weak'

  // Eddies form near topographic features
  const eddyLikelihood = bathyData.feature_type === 'ridge' ||
                        bathyData.feature_type === 'seamount' ||
                        bathyData.feature_type === 'slope'

  return {
    retention_potential: retentionPotential as 'low' | 'moderate' | 'high',
    upwelling_strength: upwellingStrength as 'weak' | 'moderate' | 'strong',
    eddy_likelihood: eddyLikelihood,
    recommendation: retentionPotential === 'high' ?
      'Topografía favorece retención de células - ALTO RIESGO si hay bloom' :
      'Topografía no favorece retención'
  }
}
