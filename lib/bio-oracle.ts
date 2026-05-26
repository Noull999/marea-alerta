/**
 * Bio-ORACLE - Biogeochemical Oracle
 * Source: MARBEC-CNRS / Université de Montpellier
 * Coverage: Global Ocean
 * Resolution: 5 arcminutes (~9.3km)
 * Update frequency: Climatological (updated every 2-3 years)
 * Variables: Chlorophyll, Nutrients, Oxygen, Temperature, Salinity, Currents
 * Advantage: Global biogeochemical climatologies, long-term averages for baseline
 */

interface BioORACLEData {
  latitude: number
  longitude: number
  month: number // 1-12
  chlorophyll_a_mean: number // mg/m³
  chlorophyll_a_std: number // Standard deviation
  nitrate_mean: number // mmol/m³
  phosphate_mean: number // mmol/m³
  silicate_mean: number // mmol/m³
  dissolved_oxygen_mean: number // ml/l
  temperature_mean: number // Celsius
  temperature_range: { min: number; max: number }
  salinity_mean: number // PSU
  current_u_mean: number // m/s
  current_v_mean: number // m/s
  ph_surface: number // pH at surface
  calcite_saturation: number // Omega Aragonite
  data_source: string
}

interface BioORACLEAnomalies {
  chlorophyll_anomaly: number // % deviation from climatology
  temperature_anomaly: number // °C deviation
  oxygen_anomaly: number // ml/l deviation
  nitrate_anomaly: number // mmol/m³ deviation
  anomaly_interpretation: string
  seasonal_phase: 'spring_bloom' | 'summer_peak' | 'fall_decline' | 'winter_low'
}

export async function fetchBioORACLEClimatology(
  lat: number,
  lon: number,
  month: number = new Date().getMonth() + 1
): Promise<BioORACLEData | null> {
  try {
    // Bio-ORACLE uses an ERDDAP server via SDIS (Spatial Data Infrastructure Service)
    const url = new URL('https://www.bio-oracle.org/data/5min/')

    // Available variables in Bio-ORACLE v3
    const variables = [
      'chlorophyll_mean',
      'chlorophyll_std',
      'nitrate_mean',
      'phosphate_mean',
      'silicate_mean',
      'dissolved_oxygen_mean',
      'temperature_mean',
      'salinity_mean',
      'current_u_mean',
      'current_v_mean',
      'ph_surface',
      'calcite_saturation'
    ]

    // Fetch via GeoTIFF or netCDF4 (simplified - would need GIS library in production)
    // For now, use the public API endpoint
    const apiUrl = new URL('https://www.bio-oracle.org/api/query')

    apiUrl.searchParams.set('lat', lat.toString())
    apiUrl.searchParams.set('lon', lon.toString())
    apiUrl.searchParams.set('month', month.toString())
    apiUrl.searchParams.set('format', 'json')

    const response = await fetch(apiUrl.toString(), {
      headers: { 'User-Agent': 'MareaAlerta/1.0' }
    })

    if (!response.ok) {
      console.warn(`Bio-ORACLE returned ${response.status}, using fallback calculation...`)
      return generateBioORACLEFallback(lat, lon, month)
    }

    const data = await response.json()

    return {
      latitude: lat,
      longitude: lon,
      month: month,
      chlorophyll_a_mean: data.chlorophyll_mean || 0.9,
      chlorophyll_a_std: data.chlorophyll_std || 0.4,
      nitrate_mean: data.nitrate_mean || 8.2,
      phosphate_mean: data.phosphate_mean || 0.58,
      silicate_mean: data.silicate_mean || 4.1,
      dissolved_oxygen_mean: data.dissolved_oxygen_mean || 6.0,
      temperature_mean: data.temperature_mean || 14.5,
      temperature_range: {
        min: (data.temperature_mean || 14.5) - 2,
        max: (data.temperature_mean || 14.5) + 2
      },
      salinity_mean: data.salinity_mean || 34.2,
      current_u_mean: data.current_u_mean || 0.05,
      current_v_mean: data.current_v_mean || 0.03,
      ph_surface: data.ph_surface || 8.1,
      calcite_saturation: data.calcite_saturation || 3.5,
      data_source: 'Bio-ORACLE-v3'
    }
  } catch (error) {
    console.error('Error fetching Bio-ORACLE data:', error)
    return generateBioORACLEFallback(lat, lon, month)
  }
}

function generateBioORACLEFallback(
  lat: number,
  lon: number,
  month: number
): BioORACLEData {
  // Fallback: Generate synthetic climatology based on latitude zone
  // Temperate South Pacific (Chilean waters)
  const isChilean = lat < -18 && lat > -56 && lon < -70 && lon > -76

  let baseTemp = 14.5
  let baseChl = 0.9
  let baseNO3 = 8.2

  if (isChilean) {
    // Seasonal variation for Chilean waters
    if (month >= 9 && month <= 11) {
      // Spring bloom
      baseChl = 2.5
      baseNO3 = 15
    } else if (month >= 12 || month <= 2) {
      // Summer
      baseChl = 1.8
      baseTemp = 16
      baseNO3 = 5
    } else if (month >= 3 && month <= 5) {
      // Autumn
      baseChl = 1.2
      baseNO3 = 10
    } else {
      // Winter
      baseChl = 0.8
      baseTemp = 12
      baseNO3 = 12
    }
  }

  return {
    latitude: lat,
    longitude: lon,
    month: month,
    chlorophyll_a_mean: baseChl,
    chlorophyll_a_std: baseChl * 0.5,
    nitrate_mean: baseNO3,
    phosphate_mean: baseNO3 / 15,
    silicate_mean: baseNO3 * 0.5,
    dissolved_oxygen_mean: 6.0,
    temperature_mean: baseTemp,
    temperature_range: {
      min: baseTemp - 2,
      max: baseTemp + 2
    },
    salinity_mean: 34.2,
    current_u_mean: 0.05,
    current_v_mean: 0.03,
    ph_surface: 8.1,
    calcite_saturation: 3.5,
    data_source: 'Bio-ORACLE-Fallback'
  }
}

export function calculateBioORACLEAnomalies(
  currentData: {
    chlorophyll_a: number
    temperature: number
    dissolved_oxygen: number
    nitrate: number
  },
  climatology: BioORACLEData
): BioORACLEAnomalies {
  // Calculate anomalies as % or absolute deviations
  const chlAnomaly = ((currentData.chlorophyll_a - climatology.chlorophyll_a_mean) /
    Math.max(climatology.chlorophyll_a_mean, 0.1)) * 100
  const tempAnomaly = currentData.temperature - climatology.temperature_mean
  const oxyAnomaly = currentData.dissolved_oxygen - climatology.dissolved_oxygen_mean
  const no3Anomaly = currentData.nitrate - climatology.nitrate_mean

  // Interpret anomaly
  let interpretation = ''
  if (chlAnomaly > 50) {
    interpretation = 'Mucha más clorofila que climatología - POSIBLE BLOOM EN CURSO'
  } else if (chlAnomaly > 20) {
    interpretation = 'Clorofila elevada comparada con climatología media'
  } else if (chlAnomaly > -20) {
    interpretation = 'Clorofila dentro de rango normal estacional'
  } else {
    interpretation = 'Clorofila baja para esta época del año'
  }

  // Determine seasonal phase
  let seasonalPhase: 'spring_bloom' | 'summer_peak' | 'fall_decline' | 'winter_low'
  const month = new Date().getMonth() + 1
  if (month >= 9 && month <= 10) seasonalPhase = 'spring_bloom'
  else if (month >= 11 || month <= 2) seasonalPhase = 'summer_peak'
  else if (month >= 3 && month <= 5) seasonalPhase = 'fall_decline'
  else seasonalPhase = 'winter_low'

  return {
    chlorophyll_anomaly: chlAnomaly,
    temperature_anomaly: tempAnomaly,
    oxygen_anomaly: oxyAnomaly,
    nitrate_anomaly: no3Anomaly,
    anomaly_interpretation: interpretation,
    seasonal_phase: seasonalPhase
  }
}

export function assessBloomPotentialVsCLimatology(
  currentObs: {
    chlorophyll_a: number
    nitrate: number
    temperature: number
  },
  climatology: BioORACLEData
): {
  bloom_risk_index: number // 0-100
  favorable_conditions: string[]
  limiting_factors: string[]
  forecast: string
} {
  const riskIndex = 0
  const favorable: string[] = []
  const limiting: string[] = []

  // Check each favorable condition
  let risk = 0

  // High chlorophyll
  if (currentObs.chlorophyll_a > climatology.chlorophyll_a_mean * 1.5) {
    favorable.push(`Clorofila elevada: ${currentObs.chlorophyll_a.toFixed(2)} mg/m³`)
    risk += 25
  } else if (currentObs.chlorophyll_a < climatology.chlorophyll_a_mean * 0.5) {
    limiting.push('Clorofila baja - biomasa todavía limitada')
  }

  // Adequate nutrients
  if (currentObs.nitrate > 5) {
    favorable.push(`Nitrato disponible: ${currentObs.nitrate.toFixed(1)} mmol/m³`)
    risk += 20
  } else {
    limiting.push('Nitrógeno limitante')
  }

  // Optimal temperature
  if (
    currentObs.temperature >= climatology.temperature_range.min &&
    currentObs.temperature <= climatology.temperature_range.max + 1
  ) {
    favorable.push(`Temperatura óptima: ${currentObs.temperature.toFixed(1)}°C`)
    risk += 15
  } else if (currentObs.temperature < climatology.temperature_range.min) {
    limiting.push('Agua muy fría - metabolismo reducido')
  }

  // Oxygen stress
  if (currentObs.chlorophyll_a > 2.0 && climatology.dissolved_oxygen_mean < 4) {
    limiting.push('Posible hipoxia - estrés para fauna')
    risk += 20
  }

  // Assessment
  let forecast = ''
  if (risk > 70) {
    forecast = 'ALTO RIESGO: Condiciones muy favorables para proliferación de HAB'
  } else if (risk > 50) {
    forecast = 'RIESGO MODERADO: Algunas condiciones favorables presentes'
  } else if (risk > 30) {
    forecast = 'RIESGO BAJO: Factores limitantes presentes'
  } else {
    forecast = 'MUY BAJO RIESGO: Bloom improbable en próximas 2 semanas'
  }

  return {
    bloom_risk_index: Math.min(100, risk),
    favorable_conditions: favorable,
    limiting_factors: limiting,
    forecast: forecast
  }
}

export function bioORACLEDataQuality(
  climatology: BioORACLEData
): {
  data_age_years: number
  spatial_uncertainty_km: number
  temporal_resolution: string
  recommended_use: string
  confidence_in_baseline: number // 0-100
} {
  // Bio-ORACLE v3 was released in 2021, typically updated every 2-3 years
  const currentYear = new Date().getFullYear()
  const dataAgeYears = currentYear - 2021 // Approximate

  return {
    data_age_years: dataAgeYears,
    spatial_uncertainty_km: 9.3, // 5 arcminutes
    temporal_resolution: 'Monthly climatology (1980-2020)',
    recommended_use: 'Baseline reference for anomaly detection and seasonal context',
    confidence_in_baseline: Math.max(50, 100 - dataAgeYears * 5) // Decreases with age
  }
}
