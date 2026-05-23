import { NextResponse } from 'next/server'
import { fetchFANAlertasActualesIFOP, fetchFANPorZonaIFOP } from '@/lib/ifop'
import { fetchNOAAHABForecast, calcularProbabilidadHAB } from '@/lib/noaa-hab'
import { fetchCopernicusSSTData } from '@/lib/copernicus'
import { fetchSHOAPrediccionMareas, fetchSHOAEstadoMar, evaluarCondicionesMareas } from '@/lib/shoa'

interface RiskFactors {
  wave_height: number
  sst_anomaly: number
  chlorophyll_level: 'low' | 'moderate' | 'high'
  hab_probability: number
  active_ifop_alerts: number
  tide_variability: number
}

interface OceanographicDataResponse {
  zona: string
  lat: number
  lon: number
  timestamp: string
  wave_data?: {
    height: number
    direction: string
    period: number
  }
  sst?: {
    temperature: number
    anomaly: number
    fetchedAt: string
  }
  chlorophyll?: {
    concentration: number
    fetchedAt: string
  }
  hab_alerts: Array<{
    id: string
    intensity: string
    species: string
  }>
  ifop_events: Array<{
    fecha: string
    especie: string
    toxicidad: number
    nivelAlerta: string
  }>
  tide_prediction?: {
    fecha: string
    nivelPromedio: number
    variabilidad: number
    optimo: boolean
  }
  sea_state?: {
    alturaOlas: string
    direccionViento: string
    velocidadViento: string
    tendencia: string
  }
  risk_level: 'VERDE' | 'AMARILLO' | 'ROJO'
  risk_factors: RiskFactors
}

function calcularRiesgoIntegrado(factors: RiskFactors): 'VERDE' | 'AMARILLO' | 'ROJO' {
  let riesgoScore = 0

  // Wave height component (0-3 puntos)
  if (factors.wave_height > 1.5) riesgoScore += 3
  else if (factors.wave_height > 0.5) riesgoScore += 1.5
  else riesgoScore += 0

  // SST anomaly component (0-2 puntos)
  const absAnomaly = Math.abs(factors.sst_anomaly)
  if (absAnomaly > 2) riesgoScore += 2
  else if (absAnomaly > 1) riesgoScore += 1
  else riesgoScore += 0

  // Chlorophyll component (0-2 puntos)
  if (factors.chlorophyll_level === 'high') riesgoScore += 2
  else if (factors.chlorophyll_level === 'moderate') riesgoScore += 1
  else riesgoScore += 0

  // HAB probability component (0-2 puntos)
  riesgoScore += factors.hab_probability * 2

  // IFOP alerts component (0-2 puntos)
  if (factors.active_ifop_alerts > 0) riesgoScore += Math.min(factors.active_ifop_alerts, 2)

  // Tide variability component (0-1 punto)
  if (factors.tide_variability > 200) riesgoScore += 1

  // Normalize to 0-1 scale
  const normalizedScore = riesgoScore / 12

  // Thresholds: VERDE < 0.4, AMARILLO 0.4-0.7, ROJO > 0.7
  if (normalizedScore < 0.4) return 'VERDE'
  if (normalizedScore < 0.7) return 'AMARILLO'
  return 'ROJO'
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = parseFloat(searchParams.get('lat') || '-42.48')
    const lon = parseFloat(searchParams.get('lon') || '-73.77')
    const zona = searchParams.get('zona') || 'Castro'

    // Fetch all data sources in parallel
    const [
      copernicusData,
      nooaaAlerts,
      ifopEventos,
      ifopActuales,
      shoaMareas,
      shoaEstadoMar,
    ] = await Promise.all([
      fetchCopernicusSSTData(lat, lon),
      fetchNOAAHABForecast(),
      fetchFANPorZonaIFOP(zona, 5),
      fetchFANAlertasActualesIFOP(),
      fetchSHOAPrediccionMareas(zona, 1),
      fetchSHOAEstadoMar(),
    ])

    // Filter relevant NOAA alerts for this zone
    const zoneNOAAAlerts = nooaaAlerts.filter(
      (alert) =>
        Math.abs(alert.lat - lat) < 1 && // Roughly within 100km
        Math.abs(alert.lon - lon) < 1
    )

    // Filter relevant IFOP alerts for this zone
    const zoneIFOPActuales = ifopActuales.filter((e) =>
      e.zona.toLowerCase().includes(zona.toLowerCase())
    )

    // Calculate risk factors
    const chlorophyllConc = copernicusData?.clorofila ?? 0.5
    let chlorophyllLevel: 'low' | 'moderate' | 'high'
    if (chlorophyllConc > 1.5) chlorophyllLevel = 'high'
    else if (chlorophyllConc > 0.5) chlorophyllLevel = 'moderate'
    else chlorophyllLevel = 'low'

    const habProbability = copernicusData
      ? calcularProbabilidadHAB(
          copernicusData.sst,
          copernicusData.clorofila,
          copernicusData.anomalia
        )
      : 0.2

    const tideConditions = shoaMareas[0] ? evaluarCondicionesMareas(shoaMareas[0].puntos) : null

    const riskFactors: RiskFactors = {
      wave_height: 0.8, // Default, would be fetched from Open-Meteo in real implementation
      sst_anomaly: copernicusData?.anomalia ?? 0.5,
      chlorophyll_level: chlorophyllLevel,
      hab_probability: habProbability,
      active_ifop_alerts: zoneIFOPActuales.length,
      tide_variability: tideConditions?.variabilidad ?? 100,
    }

    const riskLevel = calcularRiesgoIntegrado(riskFactors)

    // Find matching sea state for zone
    const matchingSeaState = shoaEstadoMar.find((s) =>
      s.zona.toLowerCase().includes(zona.toLowerCase())
    )

    const response: OceanographicDataResponse = {
      zona,
      lat,
      lon,
      timestamp: new Date().toISOString(),
      sst: copernicusData
        ? {
            temperature: copernicusData.sst,
            anomaly: copernicusData.anomalia,
            fetchedAt: copernicusData.fetchedAt,
          }
        : undefined,
      chlorophyll: copernicusData
        ? {
            concentration: copernicusData.clorofila,
            fetchedAt: copernicusData.fetchedAt,
          }
        : undefined,
      hab_alerts: zoneNOAAAlerts.map((a) => ({
        id: a.id,
        intensity: a.intensity,
        species: a.species,
      })),
      ifop_events: ifopEventos
        .slice(-10) // Last 10 events
        .map((e) => ({
          fecha: e.fecha,
          especie: e.especie,
          toxicidad: e.toxicidad,
          nivelAlerta: e.nivelAlerta,
        })),
      tide_prediction: tideConditions
        ? {
            fecha: shoaMareas[0].fecha,
            nivelPromedio: tideConditions.nivelPromedio,
            variabilidad: tideConditions.variabilidad,
            optimo: tideConditions.optimo,
          }
        : undefined,
      sea_state: matchingSeaState
        ? {
            alturaOlas: matchingSeaState.alturaOlas,
            direccionViento: matchingSeaState.direccionViento,
            velocidadViento: matchingSeaState.velocidadViento,
            tendencia: matchingSeaState.tendencia,
          }
        : undefined,
      risk_level: riskLevel,
      risk_factors: riskFactors,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Oceanographic data endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
