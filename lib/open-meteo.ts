export interface MarineData {
  latitude: number
  longitude: number
  waveHeight: number[]
  waveDirection: number[]
  windSpeed: number[]
  times: string[]
}

export async function fetchMarineData(lat: number, lon: number): Promise<MarineData> {
  const url = new URL('https://marine-api.open-meteo.com/v1/marine')
  url.searchParams.set('latitude', lat.toString())
  url.searchParams.set('longitude', lon.toString())
  url.searchParams.set('hourly', 'wave_height,wave_direction,wind_wave_height')
  url.searchParams.set('forecast_days', '7')
  url.searchParams.set('timezone', 'America/Santiago')

  const res = await fetch(url.toString(), { next: { revalidate: 21600 } })
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)

  const data = await res.json()
  return {
    latitude: lat,
    longitude: lon,
    waveHeight: data.hourly?.wave_height ?? [],
    waveDirection: data.hourly?.wave_direction ?? [],
    windSpeed: data.hourly?.wind_wave_height ?? [],
    times: data.hourly?.time ?? [],
  }
}
