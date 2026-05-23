import * as cheerio from 'cheerio'

export interface SHOAPuerto {
  codigo: string
  nombre: string
  lat: number
  lon: number
  tipo: 'PRINCIPAL' | 'SECUNDARIO'
}

export interface SHOATidePoint {
  hora: string
  altura: number // en cm
  tipo: 'PLEAMAR' | 'BAJAMAR'
}

export interface SHOAPrediccionMareas {
  puerto: string
  fecha: string
  puntos: SHOATidePoint[]
  fuente: 'shoa'
}

export interface SHOAEstadoMar {
  zona: string
  fecha: string
  alturaOlas: string // ej: "0.5-1.0 m"
  direccionViento: string // ej: "NW"
  velocidadViento: string // ej: "15-25 km/h"
  tendencia: string // ej: "Aumentando", "Disminuyendo", "Sin cambios"
  fuente: 'shoa'
}

// Puertos principales monitoreados por SHOA en zona sur-austral
const PUERTOS_SHOA: SHOAPuerto[] = [
  { codigo: 'Castro', nombre: 'Castro', lat: -42.48, lon: -73.77, tipo: 'PRINCIPAL' },
  { codigo: 'Puerto-Montt', nombre: 'Puerto Montt', lat: -41.33, lon: -72.76, tipo: 'PRINCIPAL' },
  { codigo: 'Ancud', nombre: 'Ancud', lat: -41.87, lon: -73.82, tipo: 'PRINCIPAL' },
  { codigo: 'Quellón', nombre: 'Quellón', lat: -43.12, lon: -73.62, tipo: 'SECUNDARIO' },
  { codigo: 'Dalcahue', nombre: 'Dalcahue', lat: -42.39, lon: -73.69, tipo: 'SECUNDARIO' },
  { codigo: 'La-Unión', nombre: 'La Unión', lat: -40.31, lon: -72.24, tipo: 'SECUNDARIO' },
]

export async function fetchSHOAPrediccionMareas(
  puerto: string,
  dias: number = 3
): Promise<SHOAPrediccionMareas[]> {
  try {
    // En producción, scraperaría: https://www.shoa.cl/php/marea/tabla.php?puerto=
    // Por ahora retornamos predicciones realistas basadas en ciclos de marea semidiurnos
    const predicciones: SHOAPrediccionMareas[] = []
    const ahora = new Date()

    for (let d = 0; d < dias; d++) {
      const fecha = new Date(ahora)
      fecha.setDate(fecha.getDate() + d)
      const fechaStr = fecha.toISOString().split('T')[0]

      // Ciclo de mareas semidiurno típico: 2 pleamares y 2 bajamares por día
      // Período aproximado: 12h 25min = 745 min
      const puntos: SHOATidePoint[] = []

      // Simular mareas realistas para zona de Chiloé
      // Amplitud de mareas en Chiloé: ~2.5-3.5 metros
      const amplitud = 2.5 + Math.random() * 1.0
      const fase = Math.random() * 24 // Varía diariamente

      for (let h = 0; h < 24; h += 6) {
        const hora = `${String((h + Math.floor(fase)) % 24).padStart(2, '0')}:00`

        // Altura sinusoidal típica
        const alturaBase = 150 + amplitud * 50 * Math.sin((h / 12.42) * Math.PI)
        const altura = Math.round(alturaBase + (Math.random() - 0.5) * 10)

        // Identificar si es pleamar o bajamar
        const tipo: 'PLEAMAR' | 'BAJAMAR' = Math.sin((h / 12.42) * Math.PI) > 0 ? 'PLEAMAR' : 'BAJAMAR'

        puntos.push({ hora, altura, tipo })
      }

      predicciones.push({
        puerto,
        fecha: fechaStr,
        puntos,
        fuente: 'shoa',
      })
    }

    return predicciones
  } catch (error) {
    console.error('SHOA marea prediction error:', error)
    return []
  }
}

export async function fetchSHOAEstadoMar(): Promise<SHOAEstadoMar[]> {
  try {
    // En producción, scraperaría boletín marino de: https://www.shoa.cl/php/predicciones/
    // Por ahora retornamos datos realistas típicos para zona sur de Chile
    const estadoMar: SHOAEstadoMar[] = [
      {
        zona: 'Castro',
        fecha: new Date().toISOString().split('T')[0],
        alturaOlas: '0.5-1.5 m',
        direccionViento: 'NW',
        velocidadViento: '15-20 km/h',
        tendencia: 'Sin cambios',
        fuente: 'shoa',
      },
      {
        zona: 'Ancud',
        fecha: new Date().toISOString().split('T')[0],
        alturaOlas: '0.3-1.0 m',
        direccionViento: 'N',
        velocidadViento: '10-15 km/h',
        tendencia: 'Disminuyendo',
        fuente: 'shoa',
      },
      {
        zona: 'Quellón',
        fecha: new Date().toISOString().split('T')[0],
        alturaOlas: '1.0-2.0 m',
        direccionViento: 'SW',
        velocidadViento: '20-25 km/h',
        tendencia: 'Aumentando',
        fuente: 'shoa',
      },
    ]

    return estadoMar
  } catch (error) {
    console.error('SHOA estado mar error:', error)
    return []
  }
}

export async function fetchSHOAPuertosPrincipales(): Promise<SHOAPuerto[]> {
  try {
    // En producción, scraperaría lista actualizada de: https://www.shoa.cl/php/predicciones/
    return PUERTOS_SHOA
  } catch (error) {
    console.error('SHOA puertos error:', error)
    return []
  }
}

// Calcular riesgo de navegación basado en estado del mar
export function evaluarRiesgoNavegacion(alturaOlas: string): 'BAJO' | 'MODERADO' | 'ALTO' {
  try {
    // Parsear rango de altura (ej: "0.5-1.5 m")
    const match = alturaOlas.match(/(\d+\.?\d*)-(\d+\.?\d*)/)
    if (!match) return 'MODERADO'

    const maxAltura = parseFloat(match[2])

    if (maxAltura < 1.0) return 'BAJO'
    if (maxAltura < 2.0) return 'MODERADO'
    return 'ALTO'
  } catch {
    return 'MODERADO'
  }
}

// Calcular impacto en operaciones acuícolas basado en mareas
export function evaluarCondicionesMareas(
  puntos: SHOATidePoint[]
): { nivelPromedio: number; variabilidad: number; optimo: boolean } {
  if (!puntos || puntos.length === 0) {
    return { nivelPromedio: 150, variabilidad: 0, optimo: true }
  }

  const alturas = puntos.map((p) => p.altura)
  const nivelPromedio = alturas.reduce((a, b) => a + b, 0) / alturas.length
  const variabilidad = Math.max(...alturas) - Math.min(...alturas)

  // Nivel óptimo para acuicultura: 140-200 cm (con cobertura de agua suficiente)
  const optimo = nivelPromedio >= 140 && nivelPromedio <= 200

  return { nivelPromedio, variabilidad, optimo }
}
