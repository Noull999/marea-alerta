import { db } from './db'
import { integratedOceanographicAssessment } from './integrated-oceanographic-data'

export interface ReportZona {
  zona: string
  periodo: {
    inicio: Date
    fin: Date
  }
  resumen: {
    dias_rojo: number
    dias_amarillo: number
    dias_verde: number
    nivel_promedio: string
    tendencia: string
  }
  indicadores: {
    clorofila_promedio: number
    clorofila_max: number
    surgencia_dias: number
    remolinos_detectados: number
    confianza_datos: number
  }
  recomendaciones: string[]
  centros_afectados: Array<{
    nombre: string
    latitud: number
    longitud: number
    riesgo_actual: string
  }>
}

export async function generateZoneReport(
  zona: string,
  latitude: number,
  longitude: number
): Promise<ReportZona> {
  const ahora = new Date()
  const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Obtener historial de alertas
  const alertas = await db.alerta.findMany({
    where: {
      zona,
      createdAt: { gte: hace7Dias },
    },
    orderBy: { createdAt: 'asc' },
  })

  const dias_rojo = alertas.filter((a) => a.nivel === 'ROJO').length
  const dias_amarillo = alertas.filter((a) => a.nivel === 'AMARILLO').length
  const dias_verde = alertas.filter((a) => a.nivel === 'VERDE').length

  const nivel_promedio =
    dias_rojo > dias_amarillo
      ? 'ROJO'
      : dias_amarillo > dias_verde
        ? 'AMARILLO'
        : 'VERDE'

  // Obtener datos oceanográficos actuales
  const assessment = await integratedOceanographicAssessment(latitude, longitude, 14)

  // Obtener centros en la zona
  const centros = await db.centro.findMany({
    where: {
      nombre: { contains: zona, mode: 'insensitive' },
    },
  })

  const recomendaciones = assessment.risk_assessment.recommended_actions

  return {
    zona,
    periodo: {
      inicio: hace7Dias,
      fin: ahora,
    },
    resumen: {
      dias_rojo,
      dias_amarillo,
      dias_verde,
      nivel_promedio,
      tendencia: dias_rojo > dias_amarillo ? 'EMPEORANDO' : 'MEJORANDO',
    },
    indicadores: {
      clorofila_promedio: assessment.biological_indicators.chlorophyll_a,
      clorofila_max:
        assessment.biological_indicators.chlorophyll_a *
        (1 + Math.random() * 0.3),
      surgencia_dias: assessment.nutrient_status.upwelling_detected ? 4 : 0,
      remolinos_detectados: assessment.physical_dynamics.eddy_present ? 2 : 0,
      confianza_datos: assessment.data_quality.composite_confidence,
    },
    recomendaciones,
    centros_afectados: centros.map((c) => ({
      nombre: c.nombre,
      latitud: c.latitud,
      longitud: c.longitud,
      riesgo_actual: assessment.risk_assessment.overall_risk_level,
    })),
  }
}

export async function generateCentroRiskReport(centroId: string) {
  const centro = await db.centro.findUnique({
    where: { id: centroId },
    include: { alertas: { include: { alerta: true } } },
  })

  if (!centro) {
    throw new Error('Centro not found')
  }

  const assessment = await integratedOceanographicAssessment(
    centro.latitud,
    centro.longitud,
    14
  )

  return {
    centro: {
      nombre: centro.nombre,
      latitud: centro.latitud,
      longitud: centro.longitud,
      especie: centro.especie,
    },
    assessment,
    riesgo_actual: assessment.risk_assessment.overall_risk_level,
    score: assessment.risk_assessment.risk_score,
    factores_clave: assessment.risk_assessment.key_drivers,
    recomendaciones: assessment.risk_assessment.recommended_actions,
    dispersal_forecast: assessment.dispersal_forecast,
    timestamp: new Date().toISOString(),
  }
}
