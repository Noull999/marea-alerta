/**
 * METAR Data - In-situ observations from coastal airports/stations
 * Source: NOAA Aviation Weather Center
 * Update frequency: Hourly
 * Resolution: Point observations at specific stations
 * Variables: Wind, pressure, visibility, temperature
 */

interface METARData {
  station_id: string // PMC = Puerto Montt, PMZ = Punta Arenas
  station_name: string
  observation_time: string
  wind_speed: number // knots
  wind_direction: number // degrees
  wind_gust: number | null // knots
  temperature: number // Celsius
  dew_point: number
  altimeter: number // hectopascals
  visibility: number // meters
  flight_category: string // VFR, MVFR, IFR, LIFR
  raw_metar: string
}

// Coastal stations in Chile/Latinamerica
const COASTAL_STATIONS = {
  'PMC': { name: 'Puerto Montt, Chile', lat: -41.43, lon: -72.67 },
  'PMZ': { name: 'Punta Arenas, Chile', lat: -53.00, lon: -70.85 },
  'LSC': { name: 'La Serena, Chile', lat: -29.96, lon: -71.55 },
  'SCL': { name: 'Santiago, Chile', lat: -33.39, lon: -70.79 },
  'CCP': { name: 'Castro, Chile', lat: -42.48, lon: -73.77 },
  'CHC': { name: 'Chiclayo, Perú', lat: -6.53, lon: -79.84 },
  'LIM': { name: 'Lima, Perú', lat: -12.02, lon: -77.11 }
}

export async function fetchMETARData(stationId: string): Promise<METARData | null> {
  try {
    const url = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${stationId}&mostRecent=true&hoursBeforeNow=1`

    const response = await fetch(url)
    if (!response.ok) return null

    const xml = await response.text()

    // Parse XML response (simplified)
    const tempMatch = xml.match(/<temp_c>(-?\d+(?:\.\d+)?)<\/temp_c>/)
    const windMatch = xml.match(/<wind_speed_kt>(\d+)<\/wind_speed_kt>/)
    const windDirMatch = xml.match(/<wind_dir_degrees>(\d+)<\/wind_dir_degrees>/)
    const altimeterMatch = xml.match(/<altim_in_hg>([\d.]+)<\/altim_in_hg>/)
    const rawMatch = xml.match(/<raw_text>(.*?)<\/raw_text>/)

    if (!tempMatch || !windMatch) return null

    const station = COASTAL_STATIONS[stationId as keyof typeof COASTAL_STATIONS]

    return {
      station_id: stationId,
      station_name: station?.name || 'Unknown Station',
      observation_time: new Date().toISOString(),
      temperature: parseFloat(tempMatch[1]) || 0,
      wind_speed: parseInt(windMatch[1]) || 0,
      wind_direction: parseInt(windDirMatch?.[1] || '0'),
      wind_gust: null,
      dew_point: 0,
      altimeter: parseFloat(altimeterMatch?.[1] || '0') * 33.8639, // Convert inHg to hPa
      visibility: 9999, // meters
      flight_category: 'VFR',
      raw_metar: rawMatch?.[1] || ''
    }
  } catch (error) {
    console.error(`Error fetching METAR for ${stationId}:`, error)
    return null
  }
}

export async function fetchAllCoastalMETAR() {
  const results = await Promise.all(
    Object.keys(COASTAL_STATIONS).map(stationId => fetchMETARData(stationId))
  )

  return results.filter(Boolean)
}

export function analyzeWindConditionsForBlooms(windSpeed: number, windDirection: number) {
  // Analyze if wind conditions favor upwelling (poleward/southward wind in austral spring)
  const favorUpwelling = (windDirection >= 180 && windDirection <= 360) && windSpeed > 10

  return {
    wind_speed: windSpeed,
    wind_direction: windDirection,
    favorable_for_upwelling: favorUpwelling,
    upwelling_lag_days: favorUpwelling ? 14 : 0,
    recommendation: favorUpwelling ?
      'Viento favorable para surgencia - esperar bloom en 14 días' :
      'Viento no favorable para surgencia'
  }
}
