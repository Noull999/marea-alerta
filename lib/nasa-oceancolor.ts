/**
 * NASA OCEANCOLOR - High resolution chlorophyll data (1km - 300m)
 * Source: OB.DAAC (Ocean Biology Distributed Active Archive Center)
 * Update frequency: 24-48 hours
 * Resolution: 1km (MODIS), 300m (Sentinel-3)
 * Variables: Chlorophyll, albedo, particulate matter
 */

interface NASAOceancolorResponse {
  date: string
  latitude: number
  longitude: number
  chlorophyll_concentration: number // mg/m³
  chlorophyll_source: 'MODIS' | 'Sentinel3'
  confidence: number // 0-1
  cloud_percentage: number
  quality_flag: string
}

export async function fetchNASAOceancolorData(
  lat: number,
  lon: number
): Promise<NASAOceancolorResponse | null> {
  try {
    // NASA OceanColor provides data via ERDDAP
    // Standard endpoint for Chlorophyll data
    const url = `https://oceandata.sci.gsfc.nasa.gov/api/class/MODIS-Aqua/L3SMI?params=chlor_a&north=${lat + 0.5}&south=${lat - 0.5}&west=${lon - 0.5}&east=${lon + 0.5}&timeRange=recent&format=json`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MareaAlerta/1.0'
      }
    })

    if (!response.ok) {
      console.log(`NASA OceanColor API returned ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data && data.response && data.response.body) {
      const result = data.response.body[0]
      return {
        date: new Date().toISOString().split('T')[0],
        latitude: lat,
        longitude: lon,
        chlorophyll_concentration: parseFloat(result.chlor_a) || 0,
        chlorophyll_source: 'MODIS',
        confidence: result.l2_flags ? 0.8 : 0.6,
        cloud_percentage: result.qual_sst || 0,
        quality_flag: result.l2_flags || 'UNKNOWN'
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching NASA OceanColor data:', error)
    return null
  }
}

export async function compareChlorophyllSources(
  lat: number,
  lon: number,
  copernicusValue: number
) {
  // Compare NASA data with Copernicus for validation
  const nasaData = await fetchNASAOceancolorData(lat, lon)

  if (!nasaData) return null

  return {
    copernicus: copernicusValue,
    nasa_oceancolor: nasaData.chlorophyll_concentration,
    difference_percent: Math.abs(copernicusValue - nasaData.chlorophyll_concentration) /
                       ((copernicusValue + nasaData.chlorophyll_concentration) / 2) * 100,
    source_info: {
      nasaResolution: '1km (MODIS)',
      copernicusResolution: '0.25° (~27km)',
      nasaLatency: '24-48h',
      copernicusLatency: '1-3 days'
    }
  }
}
