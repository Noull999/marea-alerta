import { calcularRiesgo, NivelRiesgo } from '../risk-calculator'

describe('calcularRiesgo', () => {
  it('retorna VERDE cuando no hay vedas y condiciones normales', () => {
    const resultado = calcularRiesgo({
      vedaActiva: false,
      sstAnomalia: 0.5,
      waveHeight: 1.2,
      historialFAN: 0,
    })
    expect(resultado.nivel).toBe(NivelRiesgo.VERDE)
  })

  it('retorna ROJO cuando hay veda activa', () => {
    const resultado = calcularRiesgo({
      vedaActiva: true,
      sstAnomalia: 0,
      waveHeight: 0,
      historialFAN: 0,
    })
    expect(resultado.nivel).toBe(NivelRiesgo.ROJO)
  })

  it('retorna AMARILLO con anomalía de temperatura alta sin veda', () => {
    const resultado = calcularRiesgo({
      vedaActiva: false,
      sstAnomalia: 2.5,
      waveHeight: 0.5,
      historialFAN: 1,
    })
    expect(resultado.nivel).toBe(NivelRiesgo.AMARILLO)
  })

  it('veda activa tiene prioridad y devuelve score 100', () => {
    const resultado = calcularRiesgo({
      vedaActiva: true,
      sstAnomalia: 0,
      waveHeight: 5,
      historialFAN: 0,
    })
    expect(resultado.score).toBe(100)
    expect(resultado.nivel).toBe(NivelRiesgo.ROJO)
  })

  it('respeta el umbral ROJO (>=70) coherente con el prompt del asistente', () => {
    // 30 (sst>2) + 35 (>=2 FAN) + 10 (mar en calma) = 75 -> ROJO
    const resultado = calcularRiesgo({
      vedaActiva: false,
      sstAnomalia: 2.5,
      waveHeight: 0.3,
      historialFAN: 2,
    })
    expect(resultado.score).toBeGreaterThanOrEqual(70)
    expect(resultado.nivel).toBe(NivelRiesgo.ROJO)
  })

  it('respeta el umbral AMARILLO (40-69)', () => {
    // 30 (sst>2) + 20 (1 FAN) = 50 -> AMARILLO
    const resultado = calcularRiesgo({
      vedaActiva: false,
      sstAnomalia: 2.5,
      waveHeight: 1.0,
      historialFAN: 1,
    })
    expect(resultado.score).toBeGreaterThanOrEqual(40)
    expect(resultado.score).toBeLessThan(70)
    expect(resultado.nivel).toBe(NivelRiesgo.AMARILLO)
  })

  it('nunca supera un score de 100', () => {
    const resultado = calcularRiesgo({
      vedaActiva: false,
      sstAnomalia: 5,
      waveHeight: 0.1,
      historialFAN: 5,
      clorofilaNivel: 'high',
      probabilidadHAB: 1,
      alertasIFOPActivas: 5,
      tideVariability: 300,
    })
    expect(resultado.score).toBeLessThanOrEqual(100)
  })

  it('considera factores oceanográficos adicionales (clorofila + HAB)', () => {
    const resultado = calcularRiesgo({
      vedaActiva: false,
      sstAnomalia: 0,
      waveHeight: 1.0,
      historialFAN: 0,
      clorofilaNivel: 'high',
      probabilidadHAB: 0.7,
    })
    expect(resultado.factores.length).toBeGreaterThan(0)
    expect(resultado.score).toBeGreaterThan(0)
  })
})
