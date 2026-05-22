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
})
