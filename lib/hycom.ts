/**
 * HyCOM - Hybrid Coordinate Ocean Model
 * Source: NOAA
 * Resolution: 1/12° (~9km) - Much better than Copernicus (0.25° = 27km)
 * Variables: Temperature, Salinity, Currents, Chlorophyll
 * Update frequency: Daily
 * Advantage: Better coastal resolution, higher detail
 */

interface HyCOMData {
  date: string
  latitude: number
  longitude: number
  temperature: number // Surface temperature
  salinity: number // PSU
  current_u: number // East-West current (m/s)
  current_v: number // North-South current (m/s)
  chlorophyll: number // mg/m³
  mixed_layer_depth: number // meters
  resolution: string // "1/12° (~9km)"
  data_quality: 'good' | 'fair'
}

export async function fetchHyCOMData(
  lat: number,
  lon: number
): Promise<HyCOMData | null> {
  try {
    // NOAA NOMADS HyCOM endpoint
    const url = `https://nomads.ncei.noaa.gov/cgi-bin/hycom/hycom_hybrid.sh?archv=2&region=na&Y=${lat}&X=${lon}&ncoor=0&rl=0.0&au=0&ag=0&av=0&as=0&at=0&ax=0&ay=0&az=0&b=&k=all&output=json`

    const response = await fetch(url)
    if (!response.ok) {
      console.log(`HyCOM API returned ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data && data.surface) {
      return {
        date: new Date().toISOString().split('T')[0],
        latitude: lat,
        longitude: lon,
        temperature: parseFloat(data.surface.temperature) || 0,
        salinity: parseFloat(data.surface.salinity) || 35,
        current_u: parseFloat(data.surface.u) || 0,
        current_v: parseFloat(data.surface.v) || 0,
        chlorophyll: parseFloat(data.surface.chlorophyll) || 0,
        mixed_layer_depth: parseFloat(data.surface.mld) || 20,
        resolution: '1/12° (~9km)',
        data_quality: 'good'
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching HyCOM data:', error)
    return null
  }
}

export async function compareResolutions(
  copernicusData: { sst: number; chlorophyll: number },
  lat: number,
  lon: number
) {
  const hycomData = await fetchHyCOMData(lat, lon)

  if (!hycomData) return null

  return {
    copernicus: {
      sst: copernicusData.sst,
      chlorophyll: copernicusData.chlorophyll,
      resolution: '0.25° (27km)',
      detail_level: 'Regional'
    },
    hycom: {
      sst: hycomData.temperature,
      chlorophyll: hycomData.chlorophyll,
      resolution: '1/12° (9km)',
      detail_level: 'Coastal (3x better resolution)',
      currents: {
        east_west: hycomData.current_u,
        north_south: hycomData.current_v,
        magnitude: Math.sqrt(hycomData.current_u ** 2 + hycomData.current_v ** 2)
      },
      mixed_layer_depth: hycomData.mixed_layer_depth
    },
    advantage_hycom: 'Better resolution reveals coastal features, currents, MLD - critical for red tide prediction',
    recommendation: hycomData.mixed_layer_depth < 15 ?
      'MLD muy superficial (< 15m) - células se concentran fácilmente' :
      'MLD moderado - dispersión posible'
  }
}
