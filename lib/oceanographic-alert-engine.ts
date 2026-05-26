import { OceanographicService } from './oceanographic-service'
import { integratedOceanographicAssessment } from './integrated-oceanographic-data'
import { db } from './db'
import { calcularRiesgo, NivelRiesgo } from './risk-calculator'

export interface AlertTrigger {
  zona: string
  latitude: number
  longitude: number
  centroIds?: string[]
}

export interface OceanographicAlertResult {
  zona: string
  nivel: NivelRiesgo
  score: number
  factores: string[]
  recomendaciones: string[]
  datosOceanograficos: {
    clorofila: number
    surgencia: boolean
    remolinos: number
    confianza: number
    fuentes: string[]
  }
  alertasGeneradas: string[]
}

const RISK_RECOMMENDATIONS: Record<NivelRiesgo, string[]> = {
  [NivelRiesgo.ROJO]: [
    '⚠️ IMPLEMENTAR PROTOCOLOS DE CIERRE PREVENTIVO INMEDIATAMENTE',
    '⚠️ NOTIFICAR A IFOP, SERNAPESCA Y ACUICULTORES EN LA ZONA',
    '⚠️ PREPARAR ANÁLISIS DE TOXINA EN LABORATORIO URGENTEMENTE',
    '⚠️ SUSPENDER COSECHA HASTA CONFIRMACIÓN OFICIAL',
    '⚠️ MONITOREO INTENSIVO CADA 6 HORAS OBLIGATORIO',
  ],
  [NivelRiesgo.AMARILLO]: [
    '🟡 Aumentar frecuencia de monitoreo a DIARIA',
    '🟡 Preparar muestras para análisis de toxina',
    '🟡 Coordinar con operadores de maricultura en la zona',
    '🟡 Revisar histórico reciente de eventos HAB',
    '🟡 Estar listo para escalar a ROJO si indicadores empeoran',
    '🟡 Notificar a IFOP de condiciones anómalas',
  ],
  [NivelRiesgo.VERDE]: [
    '✅ Continuar monitoreo normal',
    '✅ Mantener vigilancia de cambios oceanográficos',
    '✅ Revisar tendencias semanalmente',
    '✅ Coordinar con otros centros de la zona',
    '✅ Documentar condiciones en bitácora',
  ],
}

export async function generateOceanographicAlert(
  trigger: AlertTrigger
): Promise<OceanographicAlertResult> {
  const assessment = await integratedOceanographicAssessment(
    trigger.latitude,
    trigger.longitude,
    14
  )

  const riesgo = calcularRiesgo({
    sstAnomalia: assessment.anomaly_analysis.temperature_anomaly_celsius,
    clorofilaNivel:
      assessment.biological_indicators.chlorophyll_a > 2.0
        ? 'high'
        : assessment.biological_indicators.chlorophyll_a > 1.0
          ? 'moderate'
          : 'low',
    waveHeight: 1.0,
    probabilidadHAB: assessment.biological_indicators.chlorophyll_a / 5,
    historialFAN: 0,
  })

  const recomendaciones = RISK_RECOMMENDATIONS[riesgo.nivel] || []

  // Generar alerta en BD
  const alertasGeneradas = []

  const existingAlert = await db.alerta.findFirst({
    where: { zona: trigger.zona, activa: true },
  })

  if (!existingAlert || existingAlert.nivel !== riesgo.nivel) {
    // Desactivar alerta anterior si existe
    if (existingAlert) {
      await db.alerta.update({
        where: { id: existingAlert.id },
        data: { activa: false },
      })
    }

    // Crear nueva alerta
    const newAlert = await db.alerta.create({
      data: {
        zona: trigger.zona,
        nivel: riesgo.nivel,
        mensaje: `${riesgo.recomendacion}. Factores: ${riesgo.factores.join('; ')}`,
        fuente: 'oceanographic-engine',
        activa: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    alertasGeneradas.push(newAlert.id)

    // Asociar con centros si se proporciona
    if (trigger.centroIds && trigger.centroIds.length > 0) {
      for (const centroId of trigger.centroIds) {
        await db.alertaCentro.create({
          data: {
            alertaId: newAlert.id,
            centroId,
          },
        })
      }
    }
  }

  return {
    zona: trigger.zona,
    nivel: riesgo.nivel,
    score: riesgo.score,
    factores: riesgo.factores,
    recomendaciones,
    datosOceanograficos: {
      clorofila: assessment.biological_indicators.chlorophyll_a,
      surgencia: assessment.nutrient_status.upwelling_detected,
      remolinos: assessment.physical_dynamics.eddy_present ? 1 : 0,
      confianza: assessment.data_quality.composite_confidence,
      fuentes: assessment.data_quality.sources_available,
    },
    alertasGeneradas,
  }
}

export async function generateTrendAnalysis(
  zona: string,
  days: number = 7
): Promise<{
  tendencia: 'mejorando' | 'empeorando' | 'estable'
  cambio_porcentaje: number
  puntos_datos: Array<{ fecha: Date; score: number }>
}> {
  // Obtener histórico de alertas
  const alertas = await db.alerta.findMany({
    where: { zona },
    orderBy: { createdAt: 'desc' },
    take: days,
  })

  if (alertas.length < 2) {
    return {
      tendencia: 'estable',
      cambio_porcentaje: 0,
      puntos_datos: [],
    }
  }

  const scores = alertas.map((a) => {
    const nivel = a.nivel as NivelRiesgo
    return nivel === NivelRiesgo.ROJO ? 70 : nivel === NivelRiesgo.AMARILLO ? 40 : 10
  })

  const primerScore = scores[scores.length - 1]
  const ultimoScore = scores[0]
  const cambio = ((ultimoScore - primerScore) / primerScore) * 100

  const tendencia =
    cambio > 5 ? 'empeorando' : cambio < -5 ? 'mejorando' : 'estable'

  return {
    tendencia,
    cambio_porcentaje: Math.round(cambio),
    puntos_datos: alertas.map((a) => ({
      fecha: a.createdAt,
      score:
        a.nivel === NivelRiesgo.ROJO ? 70 : a.nivel === NivelRiesgo.AMARILLO ? 40 : 10,
    })),
  }
}

export function generateDetailedRecommendations(
  assessment: Awaited<ReturnType<typeof integratedOceanographicAssessment>>
): {
  inmediatas: string[]
  preventivas: string[]
  monitoreo: string[]
} {
  const inmediatas: string[] = []
  const preventivas: string[] = []
  const monitoreo: string[] = []

  const chl = assessment.biological_indicators.chlorophyll_a
  const upwelling = assessment.nutrient_status.upwelling_detected
  const eddy = assessment.physical_dynamics.eddy_present
  const riskScore = assessment.risk_assessment.risk_score

  // Acciones inmediatas
  if (riskScore >= 70) {
    inmediatas.push('🚨 Activar protocolo de emergencia sanitaria')
    inmediatas.push('🚨 Contactar inmediatamente IFOP/SERNAPESCA')
    inmediatas.push('🚨 Suspender operaciones de cosecha en la zona')
  } else if (riskScore >= 40) {
    inmediatas.push('⚠️ Aumentar muestreo a cada 6-12 horas')
    inmediatas.push('⚠️ Preparar laboratorio para análisis de toxina')
  }

  // Acciones preventivas
  if (upwelling && chl > 1.5) {
    preventivas.push(
      'La surgencia está inyectando nutrientes - alto riesgo de bloom'
    )
    preventivas.push('Preparar planes de contención de cosecha')
  }

  if (eddy && chl > 1.0) {
    preventivas.push('Remolino presente puede retener células HAB')
    preventivas.push('Monitorear desplazamiento del remolino diariamente')
  }

  if (assessment.anomaly_analysis.temperature_anomaly_celsius > 2) {
    preventivas.push('Anomalía térmica positiva favorece proliferación')
    preventivas.push('Evitar cosechas no esenciales')
  }

  // Plan de monitoreo
  if (chl > 2.0) {
    monitoreo.push('Monitorear Sentinel-3 OLCI DIARIAMENTE para clorofila')
  }

  if (upwelling) {
    monitoreo.push('Revisar índice de surgencia NOAA cada 6 horas')
  }

  monitoreo.push('Comparar con climatología Bio-ORACLE semanalmente')
  monitoreo.push('Compartir datos con IFOP en reporte diario')

  return { inmediatas, preventivas, monitoreo }
}
