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

export async function GET() {
  const resultados = await Promise.all(
    ZONAS_REFERENCIA.map(async (zona) => {
      try {
        // Verificar cache en DB (válido por 6h)
        const cached = await db.fanDataCache.findFirst({
          where: {
            zona: zona.nombre,
            fuente: 'open-meteo',
            validUntil: { gt: new Date() },
          },
        })
        if (cached) return { zona: zona.nombre, datos: cached.datos }

        // Fetch fresco
        const datos = await fetchMarineData(zona.lat, zona.lon)

        // Guardar en cache
        await db.fanDataCache.upsert({
          where: { id: `${zona.nombre}-open-meteo` },
          create: {
            id: `${zona.nombre}-open-meteo`,
            fuente: 'open-meteo',
            zona: zona.nombre,
            datos: datos as unknown as Record<string, unknown>,
            validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000),
          },
          update: {
            datos: datos as unknown as Record<string, unknown>,
            fetchedAt: new Date(),
            validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000),
          },
        })

        return { zona: zona.nombre, datos }
      } catch (error) {
        console.error(`Error fetching ${zona.nombre}:`, error)
        return { zona: zona.nombre, datos: null, error: 'Fetch failed' }
      }
    })
  )

  return NextResponse.json({ zonas: resultados, timestamp: new Date().toISOString() })
}
