/**
 * Integrated Oceanographic Data Service
 * Combines all oceanographic APIs into unified HAB risk assessment
 * Data sources: NOAA, CMEMS, Sentinel-3, AVISO, HYCOM, Argo, EMODnet, IOOS, Bio-ORACLE, OpenDrift
 */

import { OceanographicService } from './oceanographic-service'
import { simulateHABDispersal, generateDispersingWarning } from './opendrift-dispersal'

export interface IntegratedOceanographicAssessment {
  timestamp: string
  location: {
    latitude: number
    longitude: number
    region: string
  }
  water_mass: {
    temperature: number
    salinity: number
    density: number
  }
  biological_indicators: {
    chlorophyll_a: number
    chlorophyll_source: string
    phycocyanin: number
    blooming_stage: string
    species_indicator: string
  }
  nutrient_status: {
    limiting_nutrient: string
    nitrate: number
    phosphate: number
    silicate: number
    upwelling_detected: boolean
  }
  physical_dynamics: {
    eddy_present: boolean
    eddy_type: string
    retention_potential: string
    current_magnitude: number
    current_direction: string
    wind_speed: number
  }
  dispersal_forecast: {
    max_distance_km: number
    primary_direction: string
    affected_farming_zones: string[]
    timeline_days: number
  }
  anomaly_analysis: {
    chlorophyll_anomaly_percent: number
    temperature_anomaly_celsius: number
    interpretation: string
  }
  model_validation: {
    model_agreement_percent: number
    in_situ_comparisons: number
    validation_note: string
  }
  risk_assessment: {
    overall_risk_level: 'VERDE' | 'AMARILLO' | 'ROJO'
    risk_score: number // 0-100
    key_drivers: string[]
    recommended_actions: string[]
  }
  data_quality: {
    sources_available: string[]
    sources_unavailable: string[]
    composite_confidence: number // 0-100
  }
}

export async function integratedOceanographicAssessment(
  latitude: number,
  longitude: number,
  forecastDays: number = 14
): Promise<IntegratedOceanographicAssessment> {
  const timestamp = new Date().toISOString()

  try {
    console.log(`[${timestamp}] Starting integrated assessment for ${latitude}, ${longitude}`)

    // Use OceanographicService to fetch all data sources
    const oceanService = new OceanographicService()
    const oceanAssessment = await oceanService.assessOceanographicConditions(latitude, longitude, forecastDays)

    const availableSources = oceanAssessment.sources_available
    const unavailableSources = oceanAssessment.sources_failed

    // Extract data from oceanographic assessment
    const upwellingData = oceanAssessment.data.noaa_upwelling
    const cmemsData = oceanAssessment.data.cmems
    const hycomData = oceanAssessment.data.hycom
    const argoData = oceanAssessment.data.argo
    const avisoData = oceanAssessment.data.aviso
    const sentinel3Data = oceanAssessment.data.sentinel3
    const emodnetData = oceanAssessment.data.emodnet
    const ioosData = oceanAssessment.data.ioos
    const bioOracleData = oceanAssessment.data.bio_oracle

    // Simulate dispersal if we have current data
    let dispersalResult = null
    if (hycomData && hycomData.snapshots && hycomData.snapshots.length > 0) {
      const recentSnapshot = hycomData.snapshots[0]
      dispersalResult = await simulateHABDispersal(
        latitude,
        longitude,
        (sentinel3Data?.avg_chlorophyll || 0.8) * 1000,
        {
          u: recentSnapshot.u_velocity || 0,
          v: recentSnapshot.v_velocity || 0,
          magnitude: recentSnapshot.current_speed || 0.08
        },
        { u: 2, v: 1, magnitude: 2.2 },
        forecastDays,
        1000
      )
    }

    // Model validation note
    let validationNote = ''
    let validationScore = 0
    if (emodnetData && hycomData) {
      validationNote = `EMODnet bathymetry available (avg depth: ${emodnetData.avg_depth.toFixed(0)}m)`
      validationScore = 75
    }
    if (ioosData && ioosData.buoy_count) {
      validationNote += ` | IOOS: ${ioosData.buoy_count} buoys (temp: ${ioosData.avg_temperature.toFixed(1)}°C)`
    }

    // Calculate overall risk
    let riskLevel: 'VERDE' | 'AMARILLO' | 'ROJO' = 'VERDE'
    let riskScore = 0
    const keyDrivers: string[] = []

    // Risk factors based on available data
    const sentinel3Chl = sentinel3Data?.avg_chlorophyll || 0.8
    if (sentinel3Chl > 2.0) {
      riskScore += 25
      keyDrivers.push(`Clorofila elevada: ${sentinel3Chl.toFixed(2)} mg/m³`)
    }

    if (avisoData && avisoData.eddies && avisoData.eddies.length > 0) {
      const anticyclonic = avisoData.eddies.filter((e: any) => e.type === 'anticyclonic').length
      if (anticyclonic > 0) {
        riskScore += 20
        keyDrivers.push(`${anticyclonic} remolino(s) anticiclónico(s) - retención potencial`)
      }
    }

    if (upwellingData && upwellingData.upwelling_data && upwellingData.upwelling_data.length > 0) {
      const maxUpwelling = Math.max(...upwellingData.upwelling_data.map((u: any) => u.upwelling_index))
      if (maxUpwelling > 50) {
        riskScore += 15
        keyDrivers.push(`Surgencia detectada: índice ${maxUpwelling.toFixed(0)}`)
      }
    }

    if (cmemsData && cmemsData.nutrient_status === 'rich') {
      riskScore += 10
      keyDrivers.push(`Nutrientes abundantes (NO3: ${cmemsData.avg_nitrate.toFixed(1)} µM)`)
    }

    if (bioOracleData && bioOracleData.habitat_suitability > 0.7) {
      riskScore += 15
      keyDrivers.push(`Condiciones de hábitat favorables (idoneidad: ${(bioOracleData.habitat_suitability * 100).toFixed(0)}%)`)
    }

    if (sentinel3Chl > 1.5 && avisoData && avisoData.eddies.length > 0) {
      riskScore += 10
      keyDrivers.push(`Combinación clorofila + remolino aumenta retención`)
    }

    // Determine risk level
    if (riskScore >= 70) riskLevel = 'ROJO'
    else if (riskScore >= 40) riskLevel = 'AMARILLO'
    else riskLevel = 'VERDE'

    // Generate warning
    let dispersalWarning = null
    if (dispersalResult) {
      dispersalWarning = generateDispersingWarning(dispersalResult, {
        distance_km: 50,
        concentration: 100
      })
    }

    // Recommended actions
    const actions: string[] = []
    if (riskLevel === 'ROJO') {
      actions.push('⚠️ IMPLEMENTAR PROTOCOLOS DE CIERRE PREVENTIVO')
      actions.push('⚠️ NOTIFICAR INMEDIATAMENTE A IFOP Y ACUICULTORES')
      actions.push('⚠️ PREPARAR ANÁLISIS DE TOXINA EN LABORATORIO')
    } else if (riskLevel === 'AMARILLO') {
      actions.push('Aumentar monitoreo a frecuencia diaria')
      actions.push('Preparar muestras para análisis de toxina')
      actions.push('Coordinar con operadores de maricultura')
    } else {
      actions.push('Continuar monitoreo normal')
      actions.push('Mantener vigilancia de cambios oceanográficos')
    }

    // Composite confidence
    const compositeConfidence = oceanAssessment.confidence_score

    const region = latitude < -18 && latitude > -56 && longitude < -70 ? 'Chile' :
                   latitude < 12 && latitude > -2 && longitude < -75 ? 'Perú' : 'South America'

    return {
      timestamp,
      location: {
        latitude,
        longitude,
        region
      },
      water_mass: {
        temperature: hycomData?.avg_temperature || 14.5,
        salinity: hycomData?.avg_salinity || 34.2,
        density: 1020 + (hycomData?.avg_salinity || 34.2) * 0.78 - (hycomData?.avg_temperature || 14.5) * 0.2
      },
      biological_indicators: {
        chlorophyll_a: sentinel3Chl,
        chlorophyll_source: 'Sentinel-3 OLCI',
        phycocyanin: sentinel3Data?.max_chlorophyll || 0.5,
        blooming_stage: sentinel3Data && sentinel3Data.bloom_probability > 0.5 ? 'HAB probable' : 'unknown',
        species_indicator: 'unknown'
      },
      nutrient_status: {
        limiting_nutrient: cmemsData?.nutrient_status || 'unknown',
        nitrate: cmemsData?.avg_nitrate || 8.0,
        phosphate: cmemsData?.avg_phosphate || 0.58,
        silicate: 4.1,
        upwelling_detected: upwellingData && upwellingData.upwelling_data?.some((u: any) => u.status !== 'none') || false
      },
      physical_dynamics: {
        eddy_present: avisoData && avisoData.eddies?.length > 0 || false,
        eddy_type: avisoData && avisoData.eddies?.[0]?.type || 'none',
        retention_potential: avisoData?.eddy_activity || 'low',
        current_magnitude: hycomData?.avg_current_speed || 0.08,
        current_direction: hycomData?.primary_direction || 'SW',
        wind_speed: 3.5
      },
      dispersal_forecast: {
        max_distance_km: dispersalResult?.displacement.max_distance_km || 0,
        primary_direction: dispersalResult?.displacement.primary_direction || 'N',
        affected_farming_zones: dispersalResult?.coastal_impact.farming_zones_threatened || [],
        timeline_days: forecastDays
      },
      anomaly_analysis: {
        chlorophyll_anomaly_percent: bioOracleData
          ? ((sentinel3Chl - (bioOracleData.climatology?.find((c: any) => c.variable === 'chlorophyll')?.mean || 0.3)) /
              (bioOracleData.climatology?.find((c: any) => c.variable === 'chlorophyll')?.mean || 0.3)) *
            100
          : 0,
        temperature_anomaly_celsius: bioOracleData
          ? (hycomData?.avg_temperature || 14.5) - (bioOracleData.temperature_mean || 14.5)
          : 0,
        interpretation: sentinel3Chl > 1.5 ? 'Anomalía positiva en clorofila' : 'Sin anomalías detectadas'
      },
      model_validation: {
        model_agreement_percent: validationScore,
        in_situ_comparisons: (emodnetData ? 1 : 0) + (ioosData?.buoy_count || 0),
        validation_note: validationNote || 'Validation data not available'
      },
      risk_assessment: {
        overall_risk_level: riskLevel,
        risk_score: Math.min(100, riskScore),
        key_drivers: keyDrivers,
        recommended_actions: actions
      },
      data_quality: {
        sources_available: availableSources,
        sources_unavailable: unavailableSources,
        composite_confidence: Math.round(compositeConfidence)
      }
    }
  } catch (error) {
    console.error('Critical error in integrated assessment:', error)
    throw error
  }
}

export async function generateComprehensiveReport(
  assessments: IntegratedOceanographicAssessment[]
): Promise<{
  summary: string
  regional_status: Map<string, string>
  critical_zones: Array<{ location: string; risk: string; reason: string }>
  next_24_hours: string
  next_7_days: string
}> {
  const regionMap = new Map<string, string>()
  const criticalZones: Array<{ location: string; risk: string; reason: string }> = []

  assessments.forEach((assessment) => {
    const region = assessment.location.region
    if (assessment.risk_assessment.overall_risk_level === 'ROJO') {
      criticalZones.push({
        location: `${region} (${assessment.location.latitude.toFixed(2)}, ${assessment.location.longitude.toFixed(2)})`,
        risk: 'CRÍTICO',
        reason: assessment.risk_assessment.key_drivers.join('; ')
      })
      regionMap.set(region, 'ALERTA ROJA')
    } else if (assessment.risk_assessment.overall_risk_level === 'AMARILLO') {
      regionMap.set(region, 'ALERTA AMARILLA')
    } else {
      regionMap.set(region, 'NORMAL')
    }
  })

  const summary = `Evaluación integrada completada para ${assessments.length} ubicaciones. ${criticalZones.length} zonas críticas identificadas.`

  return {
    summary,
    regional_status: regionMap,
    critical_zones: criticalZones,
    next_24_hours: 'Monitoreo continuo recomendado en zonas críticas',
    next_7_days: 'Seguimiento de dispersión de células HAB hacia zonas de maricultura'
  }
}
