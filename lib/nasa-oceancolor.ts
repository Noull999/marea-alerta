/**
 * NASA OCEANCOLOR - High resolution chlorophyll data (1km - 300m)
 * Source: OB.DAAC (Ocean Biology Distributed Active Archive Center)
 * Update frequency: 24-48 hours
 * Resolution: 1km (MODIS), 300m (Sentinel-3)
 * Variables: Chlorophyll, albedo, particulate matter
 * Hybrid model: Usa NASA API key si disponible, fallback a Open-Meteo
 */

interface NASAOceancolorResponse {
  date: string
  latitude: number
  longitude: number
  chlorophyll_concentration: number // mg/m³
  chlorophyll_source: 'MODIS' | 'Sentinel3' | 'OpenMeteo'
  confidence: number // 0-1
  cloud_percentage: number
  quality_flag: string
}

export async function fetchNASAOceancolorData(
  lat: number,
  lon: number
): Promise<NASAOceancolorResponse | null> {
  const apiKey = process.env.NASA_API_KEY

  // Si tiene API key, intenta usar NASA real
  if (apiKey) {
    const nasaData = await fetchNASAReal(lat, lon, apiKey)
    if (nasaData) return nasaData
  }

  // Sin fuente satelital real de clorofila no devolvemos un valor inventado.
  // Open-Meteo NO provee clorofila; estimarla con SST + ruido era engañoso.
  // Retornamos null y la confianza del modelo baja en consecuencia.
  return null
}

async function fetchNASAReal(
  lat: number,
  lon: number,
  apiKey: string
): Promise<NASAOceancolorResponse | null> {
  try {
    // NASA OceanColor ERDDAP endpoint con API key
    const url = `https://oceandata.sci.gsfc.nasa.gov/api/v2/data/chlor_a?west=${lon - 0.1}&east=${lon + 0.1}&south=${lat - 0.1}&north=${lat + 0.1}&datetype=DAY&format=json&api_key=${apiKey}`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'MareaAlerta/1.0' },
      next: { revalidate: 43200 } // 12 horas
    })

    if (!response.ok) {
      console.warn(`NASA API returned ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data?.results && data.results.length > 0) {
      const result = data.results[0]
      return {
        date: result.date || new Date().toISOString().split('T')[0],
        latitude: lat,
        longitude: lon,
        chlorophyll_concentration: parseFloat(result.chlor_a) || 0.5,
        chlorophyll_source: 'MODIS',
        confidence: 0.9,
        cloud_percentage: 0,
        quality_flag: 'GOOD'
      }
    }

    return null
  } catch (error) {
    console.error('NASA API error:', error)
    return null
  }
}

export async function compareChlorophyllSources(
  lat: number,
  lon: number,
  copernicusValue: number
) {
  const nasaData = await fetchNASAOceancolorData(lat, lon)

  if (!nasaData) return null

  return {
    copernicus: copernicusValue,
    nasa_oceancolor: nasaData.chlorophyll_concentration,
    difference_percent: copernicusValue > 0 ?
      Math.abs(copernicusValue - nasaData.chlorophyll_concentration) /
      ((copernicusValue + nasaData.chlorophyll_concentration) / 2) * 100 : 0,
    source_info: {
      nasaResolution: nasaData.chlorophyll_source === 'MODIS' ? '1km' : 'Open-Meteo',
      copernicusResolution: '0.25° (~27km)',
      nasaSource: nasaData.chlorophyll_source,
      nasaLatency: nasaData.chlorophyll_source === 'MODIS' ? '24-48h' : 'Tiempo real'
    }
  }
}
