/**
 * WAVEWATCH III - Wave forecast model (0.5° resolution)
 * Source: NOAA NOMADS (National Operational Model Archive Distribution System)
 * Update frequency: 4x daily
 * Resolution: 0.5° global
 * Variables: Wave height, direction, period (much better than Open-Meteo)
 */

interface WaveWatchData {
  date: string
  latitude: number
  longitude: number
  significant_wave_height: number // meters
  wave_direction: number // degrees
  wave_period: number // seconds
  wind_wave_height: number
  swell_wave_height: number
  timestamp: string
}

export async function fetchWaveWatchIII(
  lat: number,
  lon: number
): Promise<WaveWatchData | null> {
  try {
    // NOAA NOMADS WaveWatch III endpoint
    const url = `https://nomads.ncei.noaa.gov/cgi-bin/wavewatch3/single_point.pl?lat=${lat}&lon=${lon}&format=json`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MareaAlerta/1.0'
      }
    })

    if (!response.ok) {
      console.log(`WaveWatch III API returned ${response.status}`)
      return null
    }

    const text = await response.text()

    // Parse HTML response (WaveWatch returns HTML by default)
    // Extract values from response
    const heightMatch = text.match(/Significant Wave Height[^0-9]*([0-9.]+)/)
    const periodMatch = text.match(/Mean Period[^0-9]*([0-9.]+)/)
    const directionMatch = text.match(/Mean Direction[^0-9]*([0-9.]+)/)

    if (!heightMatch) return null

    return {
      date: new Date().toISOString().split('T')[0],
      latitude: lat,
      longitude: lon,
      significant_wave_height: parseFloat(heightMatch[1]) || 0,
      wave_direction: parseInt(directionMatch?.[1] || '0'),
      wave_period: parseFloat(periodMatch?.[1] || '0'),
      wind_wave_height: 0, // Requires parsing from full response
      swell_wave_height: 0, // Requires parsing from full response
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching WaveWatch III data:', error)
    return null
  }
}

export async function compareWaveSources(
  lat: number,
  lon: number,
  openMeteoWaveHeight: number
) {
  const wwData = await fetchWaveWatchIII(lat, lon)

  if (!wwData) return null

  return {
    wavewatch_iii: wwData.significant_wave_height,
    open_meteo: openMeteoWaveHeight,
    difference: Math.abs(wwData.significant_wave_height - openMeteoWaveHeight),
    wavewatch_advantage: 'Higher resolution (0.5° vs ~25km), more frequent updates (4x daily)',
    recommendation: wwData.significant_wave_height < 0.8 ? 'CALMA - Ideal para proliferación' : 'AGITADO - Dispersa células'
  }
}
