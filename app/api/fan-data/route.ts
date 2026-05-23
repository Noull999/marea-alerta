import { NextResponse } from 'next/server'
import { fetchMarineData } from '@/lib/open-meteo'
import { db } from '@/lib/db'

// Zonas nombradas principales (ciudades/puertos)
const ZONAS_NOMBRADAS = [
  { nombre: 'Puerto Montt', lat: -41.33, lon: -72.76 },
  { nombre: 'Calbuco', lat: -41.77, lon: -73.15 },
  { nombre: 'Ancud', lat: -41.87, lon: -73.82 },
  { nombre: 'Dalcahue', lat: -42.39, lon: -73.69 },
  { nombre: 'Castro', lat: -42.48, lon: -73.77 },
  { nombre: 'Achao', lat: -42.45, lon: -73.89 },
  { nombre: 'Quellón', lat: -43.12, lon: -73.62 },
  { nombre: 'La Unión', lat: -43.15, lon: -72.58 },
  { nombre: 'Osorno', lat: -40.58, lon: -72.53 },
  { nombre: 'Puerto Varas', lat: -41.31, lon: -72.37 },
]

// Función para generar grid de puntos entre zonas (cada ~20km)
function generateGridPoints() {
  const gridPoints = []
  // Grid a lo largo de la costa de Chiloé (norte-sur)
  const startLat = -40.5
  const endLat = -43.5
  const gridSpacing = 0.18 // ~20km en grados

  for (let lat = startLat; lat <= endLat; lat += gridSpacing) {
    // Costa oeste de Chiloé
    gridPoints.push({
      nombre: `Zona Costa Oeste ${Math.abs(lat).toFixed(1)}°`,
      lat: parseFloat(lat.toFixed(2)),
      lon: -73.85,
    })
    // Costa este de Chiloé
    gridPoints.push({
      nombre: `Zona Costa Este ${Math.abs(lat).toFixed(1)}°`,
      lat: parseFloat(lat.toFixed(2)),
      lon: -72.5,
    })
  }
  return gridPoints
}

const ZONAS_REFERENCIA = [...ZONAS_NOMBRADAS, ...generateGridPoints()]

interface ZonaRiesgo {
  nombre: string
  lat: number
  lon: number
  nivel: 'VERDE' | 'AMARILLO' | 'ROJO'
  recomendacion: string
}

function calcularNivelRiesgo(waveHeight: number): ZonaRiesgo['nivel'] {
  if (waveHeight < 0.5) return 'VERDE'    // Oleaje bajo - seguro
  if (waveHeight < 1.5) return 'AMARILLO' // Oleaje moderado - precaución
  return 'ROJO'                            // Oleaje alto - peligro
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
