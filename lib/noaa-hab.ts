export interface NOAAHABAlert {
  id: string
  lat: number
  lon: number
  date: string
  intensity: 'LOW' | 'MODERATE' | 'HIGH'
  species: string
  description: string
  source: string
  url?: string
}

export async function fetchNOAAHABForecast(): Promise<NOAAHABAlert[]> {
  try {
    // NOAA HAB Bulletin Forecast
    // https://www.ncei.noaa.gov/products/phytoplankton-harmful-algal-bloom-inshore-forecast/
    const url = 'https://coastalscience.noaa.gov/data/hab/forecast.json'

    const res = await fetch(url, { next: { revalidate: 172800 } }) // 48h cache

    if (!res.ok) {
      console.warn(`NOAA HAB API error: ${res.status}`)
      return []
    }

    const data = await res.json()

    // Parsear respuesta de NOAA HAB
    const alerts: NOAAHABAlert[] = (data.features || [])
      .filter((feature: any) => feature.geometry.type === 'Point')
      .map((feature: any, idx: number) => ({
        id: `noaa-hab-${idx}-${Date.now()}`,
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        date: feature.properties.date || new Date().toISOString(),
        intensity: mapNOAAIntensity(feature.properties.concentration),
        species: feature.properties.species || 'Unknown',
        description: feature.properties.description || 'No description',
        source: 'noaa',
        url: feature.properties.url,
      }))

    return alerts
  } catch (error) {
    console.error('NOAA HAB fetch error:', error)
    return []
  }
}

// Historial de eventos HAB en región Chiloé (datos simulados basados en reportes históricos)
export async function fetchNOAAHABHistory(
  zona?: string,
  days: number = 90
): Promise<NOAAHABAlert[]> {
  try {
    // En producción, esto consultaría base de datos histórica de NOAA
    // Por ahora retornamos datos realistas basados en historial conocido de Chiloé
    const historicalEvents: NOAAHABAlert[] = [
      {
        id: 'hist-1',
        lat: -42.48,
        lon: -73.77,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        intensity: 'HIGH',
        species: 'Pseudo-nitzschia',
        description: 'Harmful diatom bloom detected',
        source: 'noaa',
      },
      {
        id: 'hist-2',
        lat: -41.87,
        lon: -73.82,
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        intensity: 'MODERATE',
        species: 'Gymnodinium catenatum',
        description: 'Paralytic shellfish poison (PSP) risk',
        source: 'noaa',
      },
      {
        id: 'hist-3',
        lat: -43.12,
        lon: -73.62,
        date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
        intensity: 'LOW',
        species: 'Heterocapsa circularisquama',
        description: 'Brown tide event',
        source: 'noaa',
      },
    ]

    return historicalEvents
  } catch (error) {
    console.error('NOAA HAB history error:', error)
    return []
  }
}

function mapNOAAIntensity(
  concentration: number
): 'LOW' | 'MODERATE' | 'HIGH' {
  if (concentration < 100000) return 'LOW'
  if (concentration < 1000000) return 'MODERATE'
  return 'HIGH'
}

// Calcular probabilidad de HAB basada en datos oceanográficos
export function calcularProbabilidadHAB(
  sst: number,
  clorofila: number,
  sstAnomalia: number
): number {
  let probability = 0.1 // Base 10%

  // SST entre 10-18°C favorece HABs
  if (sst >= 10 && sst <= 18) probability += 0.2
  else if (sst >= 15 && sst <= 20) probability += 0.15

  // Anomalía SST positiva (más cálido) = más probabilidad
  if (sstAnomalia > 0) probability += 0.15 * Math.min(sstAnomalia / 2, 1)

  // Clorofila alta (fitoplancton abundante)
  if (clorofila > 1.0) probability += 0.2
  else if (clorofila > 0.5) probability += 0.1

  // Normalizar a 0-1
  return Math.min(probability, 1.0)
}
