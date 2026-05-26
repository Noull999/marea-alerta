/**
 * GTSPP - Global Temperature-Salinity Profile Program
 * Source: NOAA
 * Variables: Temperature, Salinity profiles (historical and near-real-time)
 * Resolution: Point observations from ships, buoys, CTD profiles
 * Advantage: Validates satellite data against in-situ measurements
 */

interface GTSPPProfile {
  station_id: string
  latitude: number
  longitude: number
  measurement_date: string
  profile_depth: number // deepest measurement in meters
  temperature_profile: {
    depth: number
    temperature: number
  }[]
  salinity_profile: {
    depth: number
    salinity: number
  }[]
  data_source: 'ship' | 'buoy' | 'ctd' | 'autonomous'
  qc_flag: number // Quality control 0-3
}

export async function fetchGTSPPNearestProfile(
  lat: number,
  lon: number,
  daysBack: number = 30
): Promise<GTSPPProfile | null> {
  try {
    // NOAA GTSPP via ERDDAP
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)
    const endDate = new Date()

    const url = `https://www.ncei.noaa.gov/erddap/tabledap/oceans_gtspp.json?&latitude>=${lat - 1}&latitude<=${lat + 1}&longitude>=${lon - 1}&longitude<=${lon + 1}&time>=${startDate.toISOString().split('T')[0]}&time<=${endDate.toISOString().split('T')[0]}&orderByClosest("latitude,longitude,time")`

    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()

    if (!data.table || !data.table.rows || data.table.rows.length === 0) {
      return null
    }

    const row = data.table.rows[0]

    // Parse GTSPP data structure
    return {
      station_id: row[0] || 'UNKNOWN',
      latitude: parseFloat(row[1]) || lat,
      longitude: parseFloat(row[2]) || lon,
      measurement_date: row[3] || new Date().toISOString(),
      profile_depth: 1000, // Default depth
      temperature_profile: [], // Would need to parse full profile
      salinity_profile: [],
      data_source: 'ship',
      qc_flag: 0
    }
  } catch (error) {
    console.error('Error fetching GTSPP profile:', error)
    return null
  }
}

export async function validateSatelliteDataWithGTSPP(
  satelliteSST: number,
  satelliteSalinity: number,
  lat: number,
  lon: number
): Promise<{
  satellite_sst: number
  gtspp_sst: number | null
  difference: number | null
  validation_quality: 'excellent' | 'good' | 'fair' | 'poor'
  recommendation: string
}> {
  const profile = await fetchGTSPPNearestProfile(lat, lon)

  if (!profile || profile.temperature_profile.length === 0) {
    return {
      satellite_sst: satelliteSST,
      gtspp_sst: null,
      difference: null,
      validation_quality: 'poor',
      recommendation: 'Sin datos GTSPP cercanos para validación'
    }
  }

  // Get surface temperature from profile (first measurement)
  const gtspsST = profile.temperature_profile[0]?.temperature || null

  if (!gtspsST) {
    return {
      satellite_sst: satelliteSST,
      gtspp_sst: null,
      difference: null,
      validation_quality: 'poor',
      recommendation: 'Perfil GTSPP incompleto'
    }
  }

  const diff = Math.abs(satelliteSST - gtspsST)
  let quality: 'excellent' | 'good' | 'fair' | 'poor'

  if (diff < 0.5) quality = 'excellent'
  else if (diff < 1.0) quality = 'good'
  else if (diff < 2.0) quality = 'fair'
  else quality = 'poor'

  return {
    satellite_sst: satelliteSST,
    gtspp_sst: gtspsST,
    difference: diff,
    validation_quality: quality,
    recommendation: quality === 'excellent' || quality === 'good' ?
      'Datos satélite validados contra observaciones in-situ' :
      'Considerar calibración de datos satélite'
  }
}
