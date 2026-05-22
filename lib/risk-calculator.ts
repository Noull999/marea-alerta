export enum NivelRiesgo {
  VERDE = 'VERDE',
  AMARILLO = 'AMARILLO',
  ROJO = 'ROJO',
}

export interface FactoresRiesgo {
  vedaActiva: boolean
  sstAnomalia: number
  waveHeight: number
  historialFAN: number
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
    score += 35
    factoresActivos.push(`Temperatura del mar ${factores.sstAnomalia.toFixed(1)}°C sobre lo normal`)
  } else if (factores.sstAnomalia > 1) {
    score += 15
    factoresActivos.push(`Temperatura del mar levemente elevada (+${factores.sstAnomalia.toFixed(1)}°C)`)
  }

  // Historial reciente de FAN en la zona
  if (factores.historialFAN >= 2) {
    score += 40
    factoresActivos.push(`${factores.historialFAN} eventos FAN recientes en la zona`)
  } else if (factores.historialFAN === 1) {
    score += 20
    factoresActivos.push('1 evento FAN reciente en la zona')
  }

  // Condiciones de oleaje (baja mezcla favorece FAN)
  if (factores.waveHeight < 0.5) {
    score += 15
    factoresActivos.push('Mar en calma (condición favorable para FAN)')
  }

  const nivel =
    score >= 60 ? NivelRiesgo.ROJO :
    score >= 30 ? NivelRiesgo.AMARILLO :
    NivelRiesgo.VERDE

  const recomendacion =
    nivel === NivelRiesgo.ROJO
      ? 'Alto riesgo: evalúe cosechar de inmediato o espere confirmación oficial.'
      : nivel === NivelRiesgo.AMARILLO
      ? 'Riesgo moderado: monitoree diariamente y esté listo para cosechar si el riesgo aumenta.'
      : 'Condiciones normales. Continúe operación habitual.'

  return { nivel, score, factores: factoresActivos, recomendacion }
}
