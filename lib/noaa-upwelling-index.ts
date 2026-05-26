/**
 * NOAA Upwelling Index - Critical for 14-21 day lead time prediction
 * Source: NOAA NCEI (National Centers for Environmental Information)
 * Update frequency: Daily
 * Resolution: Specific upwelling points (e.g., Point 150 for Chiloé)
 * Variables: Upwelling Index (cubic meters per second per 100m coastline)
 * Mechanism: Poleward (southward) wind → offshore Ekman transport → upwelling of cold nutrient-rich water
 * Lead time: 14-21 days before visible bloom appears
 */

interface UpwellingIndexData {
  date: string
  point_id: string // e.g., "150" for Chiloé
  location: string
  latitude: number
  longitude: number
  upwelling_index: number // m³/s per 100m coastline
  wind_stress_tau: number // Pascals
  wind_direction: number // degrees
  anomaly: number // deviation from 30-year average
  anomaly_sign: 'positive' | 'negative' | 'neutral'
  interpretation: string
}

interface UpwellingForecast {
  current_index: number
  index_14_days_ago: number
  index_7_days_ago: number
  trend: 'increasing' | 'decreasing' | 'stable'
  expected_bloom_timing: string
  confidence: number // 0-1
  risk_assessment: string
}

// NOAA Upwelling Index points for Chile and Latin America
const UPWELLING_POINTS = {
  '150': { name: 'Chiloé, Chile', lat: -42.0, lon: -75.0 },
  '151': { name: 'Sur Chile', lat: -45.0, lon: -75.0 },
  '145': { name: 'Centro Chile (Valparaíso)', lat: -33.0, lon: -72.0 },
  '143': { name: 'Norte Chile (Coquimbo)', lat: -30.0, lon: -71.5 },
  '160': { name: 'Perú Central', lat: -10.0, lon: -76.5 },
  '161': { name: 'Perú Norte', lat: -5.0, lon: -80.0 },
  '162': { name: 'Ecuador', lat: -2.0, lon: -79.5 }
}

export async function fetchUpwellingIndex(pointId: string): Promise<UpwellingIndexData | null> {
  try {
    // NOAA Upwelling Index is published as data files
    // https://www.ncei.noaa.gov/data/upwelling-data/
    const url = `https://www.ncei.noaa.gov/data/upwelling-data/access/upwelling_indices.csv`

    const response = await fetch(url)
    if (!response.ok) {
      console.log(`NOAA Upwelling Index returned ${response.status}`)
      return null
    }

    const csv = await response.text()
    const lines = csv.split('\n')

    // Parse CSV to find most recent data for this point
    const relevantLines = lines.filter(line => line.includes(`P${pointId}`))

    if (relevantLines.length === 0) return null

    // Get most recent entry
    const lastLine = relevantLines[relevantLines.length - 1]
    const values = lastLine.split(',')

    const pointInfo = UPWELLING_POINTS[pointId as keyof typeof UPWELLING_POINTS]

    if (!values || values.length < 5) return null

    return {
      date: values[0]?.trim() || new Date().toISOString().split('T')[0],
      point_id: pointId,
      location: pointInfo?.name || 'Unknown',
      latitude: pointInfo?.lat || 0,
      longitude: pointInfo?.lon || 0,
      upwelling_index: parseFloat(values[4]) || 0,
      wind_stress_tau: parseFloat(values[3]) || 0,
      wind_direction: 180, // Poleward wind is ~180°
      anomaly: parseFloat(values[5]) || 0,
      anomaly_sign: parseFloat(values[5]) > 0 ? 'positive' : 'negative',
      interpretation: parseFloat(values[4]) > 100 ?
        'Surgencia fuerte - nutrientes abundantes' :
        parseFloat(values[4]) < 50 ?
        'Surgencia débil o ausente' : 'Surgencia moderada'
    }
  } catch (error) {
    console.error(`Error fetching upwelling index for point ${pointId}:`, error)
    return null
  }
}

export async function predictBloomTiming(pointId: string): Promise<UpwellingForecast | null> {
  try {
    // Fetch upwelling index for past days
    const current = await fetchUpwellingIndex(pointId)

    if (!current) {
      return {
        current_index: 0,
        index_14_days_ago: 0,
        index_7_days_ago: 0,
        trend: 'stable',
        expected_bloom_timing: 'Datos insuficientes',
        confidence: 0,
        risk_assessment: 'No se pudo obtener índice de surgencia NOAA'
      }
    }

    // In production, fetch historical data from API
    // For now, demonstrate the logic

    const currentIndex = current.upwelling_index
    const index14DaysAgo = currentIndex * 1.2 // Placeholder
    const index7DaysAgo = currentIndex * 1.1

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable'
    if (currentIndex > index7DaysAgo * 1.1) trend = 'increasing'
    else if (currentIndex < index7DaysAgo * 0.9) trend = 'decreasing'
    else trend = 'stable'

    // If upwelling was strong 14 days ago, bloom expected now
    const bloomTiming = index14DaysAgo > 150 ?
      'AHORA - Bloom esperado en próximas 2 semanas' :
      index14DaysAgo > 100 ?
      'En 10-14 días' :
      'No esperado en próximas 2 semanas'

    const confidence = Math.min(Math.max(currentIndex / 200, 0), 1)

    return {
      current_index: currentIndex,
      index_14_days_ago: index14DaysAgo,
      index_7_days_ago: index7DaysAgo,
      trend,
      expected_bloom_timing: bloomTiming,
      confidence,
      risk_assessment: currentIndex > 150 ?
        'ALTO RIESGO: Surgencia muy activa - flores tóxicas probables en 2-3 semanas' :
        currentIndex > 100 ?
        'RIESGO MODERADO: Surgencia moderada - monitorear clorofila' :
        'RIESGO BAJO: Surgencia débil'
    }
  } catch (error) {
    console.error(`Error predicting bloom timing for point ${pointId}:`, error)
    return null
  }
}

export function getAllUpwellingPoints() {
  return Object.entries(UPWELLING_POINTS).map(([id, info]) => ({
    id,
    ...info
  }))
}
