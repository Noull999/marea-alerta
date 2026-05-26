/**
 * WAVE DATA - Hybrid model para máxima cobertura
 * Primario: Open-Meteo (gratis, sin credenciales, actualización horaria)
 * Secundario: WAVEWATCH III (NOAA NOMADS - mejor resolución 0.5°, 4x daily)
 *
 * El modelo híbrido asegura cobertura global sin requerer API keys
 * Open-Meteo da 10k req/mes gratis, perfecto para monitoreo de N zonas
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
  source: 'OpenMeteo' | 'WaveWatch3'
}

export async function fetchWaveWatchIII(
  lat: number,
  lon: number
): Promise<WaveWatchData | null> {
  // Intenta WaveWatch III primero (mejor resolución si disponible)
  const wwData = await fetchWaveWatchReal(lat, lon)
  if (wwData) return wwData

  // Fallback: Open-Meteo (gratuito, siempre disponible)
  return fetchWavesViaOpenMeteo(lat, lon)
}

async function fetchWaveWatchReal(
  lat: number,
  lon: number
): Promise<WaveWatchData | null> {
  try {
    // NOAA NOMADS WaveWatch III endpoint
    const url = `https://nomads.ncei.noaa.gov/cgi-bin/wavewatch3/single_point.pl?lat=${lat}&lon=${lon}&format=json`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'MareaAlerta/1.0' },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      console.warn(`WaveWatch III returned ${response.status}, usando fallback`)
      return null
    }

    const text = await response.text()

    // Parse response
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
      wind_wave_height: 0,
      swell_wave_height: 0,
      timestamp: new Date().toISOString(),
      source: 'WaveWatch3'
    }
  } catch (error) {
    console.warn('WaveWatch III error:', error)
    return null
  }
}

async function fetchWavesViaOpenMeteo(
  lat: number,
  lon: number
): Promise<WaveWatchData | null> {
  try {
    // Open-Meteo Marine API (gratuito, sin credenciales)
    const url = `https://api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_period,wave_direction`

    const response = await fetch(url, {
      next: { revalidate: 3600 }
    })

    if (!response.ok) return null

    const data = await response.json()
    const current = data.current

    return {
      date: new Date().toISOString().split('T')[0],
      latitude: lat,
      longitude: lon,
      significant_wave_height: current?.wave_height ?? 0.5,
      wave_direction: current?.wave_direction ?? 0,
      wave_period: current?.wave_period ?? 0,
      wind_wave_height: 0,
      swell_wave_height: 0,
      timestamp: new Date().toISOString(),
      source: 'OpenMeteo'
    }
  } catch (error) {
    console.error('Open-Meteo waves error:', error)
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
    primary_source: wwData.source,
    wavewatch_advantage: 'Higher resolution (0.5° vs global), 4x daily updates',
    recommendation: wwData.significant_wave_height < 0.8 ? 'CALMA - Ideal para proliferación' : 'AGITADO - Dispersa células'
  }
}
