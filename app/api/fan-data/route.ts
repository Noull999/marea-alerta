import { NextResponse } from 'next/server'
import { fetchMarineData } from '@/lib/open-meteo'
import { db } from '@/lib/db'

const ZONAS_REFERENCIA = [
  { nombre: 'Chiloé Norte', lat: -41.9, lon: -73.7 },
  { nombre: 'Chiloé Sur', lat: -43.1, lon: -73.6 },
  { nombre: 'Calbuco', lat: -41.8, lon: -73.1 },
  { nombre: 'Cochamó', lat: -41.5, lon: -72.3 },
  { nombre: 'Hualaihué', lat: -42.0, lon: -72.6 },
]

interface ZonaRiesgo {
  nombre: string
  lat: number
  lon: number
  nivel: 'VERDE' | 'AMARILLO' | 'ROJO'
  recomendacion: string
}

function calcularNivelRiesgo(waveHeight: number): ZonaRiesgo['nivel'] {
  if (waveHeight < 0.5) return 'AMARILLO'
  if (waveHeight < 1.5) return 'VERDE'
  return 'VERDE'
}

function getRecomendacion(nivel: ZonaRiesgo['nivel']): string {
  const recomendaciones: Record<string, string> = {
    ROJO: 'Alto riesgo: evalúe cosechar de inmediato o espere confirmación oficial.',
    AMARILLO: 'Riesgo moderado: monitoree diariamente y esté listo para cosechar si el riesgo aumenta.',
    VERDE: 'Condiciones normales. Continúe operación habitual.',
  }
  return recomendaciones[nivel] || 'Sin información disponible'
}

export async function GET() {
  try {
    const resultados = await Promise.all(
      ZONAS_REFERENCIA.map(async (zona): Promise<ZonaRiesgo> => {
        try {
          let marineData = null

          // Verificar cache en DB (válido por 6h)
          const cached = await db.fanDataCache.findFirst({
            where: {
              zona: zona.nombre,
              fuente: 'open-meteo',
              validUntil: { gt: new Date() },
            },
          })

          if (cached) {
            marineData = cached.datos
          } else {
            // Fetch fresco
            marineData = await fetchMarineData(zona.lat, zona.lon)

            // Guardar en cache
            await db.fanDataCache.upsert({
              where: { id: `${zona.nombre}-open-meteo` },
              create: {
                id: `${zona.nombre}-open-meteo`,
                fuente: 'open-meteo',
                zona: zona.nombre,
                datos: marineData as any,
                validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000),
              },
              update: {
                datos: marineData as any,
                fetchedAt: new Date(),
                validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000),
              },
            })
          }

          const waveHeights = (marineData as any)?.waveHeight || []
          const latestWaveHeight = waveHeights[waveHeights.length - 1] || 1.0
          const nivel = calcularNivelRiesgo(latestWaveHeight)

          return {
            nombre: zona.nombre,
            lat: zona.lat,
            lon: zona.lon,
            nivel,
            recomendacion: getRecomendacion(nivel),
          }
        } catch (error) {
          console.error(`Error processing ${zona.nombre}:`, error)
          return {
            nombre: zona.nombre,
            lat: zona.lat,
            lon: zona.lon,
            nivel: 'VERDE',
            recomendacion: 'Datos no disponibles en este momento',
          }
        }
      })
    )

    return NextResponse.json({ zonas: resultados, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Error in fan-data endpoint:', error)
    return NextResponse.json(
      { zonas: [], error: 'Error fetching data' },
      { status: 500 }
    )
  }
}
