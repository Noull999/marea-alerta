export enum NivelRiesgo {
  VERDE = 'VERDE',
  AMARILLO = 'AMARILLO',
  ROJO = 'ROJO',
}

export interface FactoresRiesgo {
  vedaActiva?: boolean
  sstAnomalia: number
  waveHeight: number
  historialFAN?: number
  // New factors from oceanographic integration
  clorofilaNivel?: 'low' | 'moderate' | 'high'
  probabilidadHAB?: number // 0-1
  alertasIFOPActivas?: number
  tideVariability?: number // cm
}

export interface ResultadoRiesgo {
  nivel: NivelRiesgo
  score: number
  factores: string[]
  recomendacion: string
}

export function calcularRiesgo(factores: FactoresRiesgo): ResultadoRiesgo {
  if (factores.vedaActiva) {
    return {
      nivel: NivelRiesgo.ROJO,
      score: 100,
      factores: ['Veda sanitaria activa en la zona'],
      recomendacion: 'Prohibido cosechar. Contactar SERNAPESCA para más información.',
    }
  }

  let score = 0
  const factoresActivos: string[] = []

  // Anomalía de temperatura superficial del mar
  if (factores.sstAnomalia > 2) {
    score += 30
    factoresActivos.push(
      `Temperatura del mar ${Math.abs(factores.sstAnomalia).toFixed(1)}°C sobre lo normal`
    )
  } else if (factores.sstAnomalia > 1) {
    score += 15
    factoresActivos.push(`Temperatura del mar levemente elevada (+${factores.sstAnomalia.toFixed(1)}°C)`)
  } else if (factores.sstAnomalia < -1) {
    score += 5
    factoresActivos.push(
      `Temperatura del mar más fría de lo normal (${factores.sstAnomalia.toFixed(1)}°C)`
    )
  }

  // Historial reciente de FAN en la zona
  const historialFAN = factores.historialFAN || 0
  if (historialFAN >= 2) {
    score += 35
    factoresActivos.push(`${historialFAN} eventos FAN recientes en la zona`)
  } else if (historialFAN === 1) {
    score += 20
    factoresActivos.push('1 evento FAN reciente en la zona')
  }

  // Condiciones de oleaje (baja mezcla favorece FAN)
  if (factores.waveHeight < 0.5) {
    score += 10
    factoresActivos.push('Mar en calma (condición favorable para FAN)')
  } else if (factores.waveHeight > 1.5) {
    score += 5
    factoresActivos.push('Oleaje moderado a fuerte')
  }

  // Chlorophyll-a levels (fitoplancton abundante)
  if (factores.clorofilaNivel === 'high') {
    score += 25
    factoresActivos.push('Concentración alta de clorofila (alimento para dinoflagelados)')
  } else if (factores.clorofilaNivel === 'moderate') {
    score += 12
    factoresActivos.push('Concentración moderada de clorofila')
  }

  // NOAA HAB probability
  const habProb = factores.probabilidadHAB || 0
  if (habProb > 0.6) {
    score += Math.round(habProb * 25)
    factoresActivos.push(`Probabilidad alta de HAB (${(habProb * 100).toFixed(0)}%)`)
  } else if (habProb > 0.3) {
    score += Math.round(habProb * 15)
    factoresActivos.push(`Probabilidad moderada de HAB (${(habProb * 100).toFixed(0)}%)`)
  }

  // IFOP active alerts
  const ifopAlerts = factores.alertasIFOPActivas || 0
  if (ifopAlerts > 0) {
    score += Math.min(ifopAlerts * 20, 40)
    factoresActivos.push(
      `${ifopAlerts} alerta${ifopAlerts > 1 ? 's' : ''} activa${ifopAlerts > 1 ? 's' : ''} de IFOP`
    )
  }

  // Tide variability (高variability = 低mixing = favorable para HAB)
  const tideVar = factores.tideVariability || 100
  if (tideVar > 200) {
    score += 10
    factoresActivos.push(`Alta variabilidad de mareas (${tideVar.toFixed(0)} cm)`)
  }

  // Normalize score to 0-100
  const normalizedScore = Math.min(score, 100)

  const nivel =
    normalizedScore >= 70 ? NivelRiesgo.ROJO :
    normalizedScore >= 40 ? NivelRiesgo.AMARILLO :
    NivelRiesgo.VERDE

  const recomendacion =
    nivel === NivelRiesgo.ROJO
      ? 'RIESGO ALTO: Se detectan múltiples factores de riesgo. Considere cosechar inmediatamente o solicitar confirmación oficial.'
      : nivel === NivelRiesgo.AMARILLO
      ? 'RIESGO MODERADO: Monitoree continuamente. Esté preparado para cosechar si el riesgo aumenta.'
      : 'RIESGO NORMAL: Condiciones operacionales. Continúe vigilancia rutinaria.'

  return { nivel, score: normalizedScore, factores: factoresActivos, recomendacion }
}
