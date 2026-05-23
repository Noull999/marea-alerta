import { NextResponse } from 'next/server'
import { fetchCopernicusSSTData } from '@/lib/copernicus'
import { db } from '@/lib/db'

interface ZonasConDatos {
  nombre: string
  lat: number
  lon: number
  sst: number
  clorofila: number
  anomalia: number
  fetchedAt: string
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const zona = searchParams.get('zona')

    // Zonas predefinidas de Chiloé
    const ZONAS_PREDEFINIDAS = [
      { nombre: 'Castro', lat: -42.48, lon: -73.77 },
      { nombre: 'Ancud', lat: -41.87, lon: -73.82 },
      { nombre: 'Quellón', lat: -43.12, lon: -73.62 },
      { nombre: 'Dalcahue', lat: -42.39, lon: -73.69 },
      { nombre: 'Puerto Montt', lat: -41.33, lon: -72.76 },
    ]

    // Si se pasa lat/lon específico
    if (lat && lon) {
      const latNum = parseFloat(lat)
      const lonNum = parseFloat(lon)
      const copernicusData = await fetchCopernicusSSTData(latNum, lonNum)

      if (!copernicusData) {
        return NextResponse.json(
          { error: 'Copernicus data unavailable' },
          { status: 503 }
        )
      }

      // Guardar en cache
      try {
        await db.fanDataCache.upsert({
          where: { id: `copernicus-${latNum}-${lonNum}` },
          create: {
            id: `copernicus-${latNum}-${lonNum}`,
            fuente: 'copernicus',
            zona: `${latNum.toFixed(2)},${lonNum.toFixed(2)}`,
            datos: copernicusData as any,
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          },
          update: {
            datos: copernicusData as any,
            fetchedAt: new Date(),
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        })
      } catch (dbError) {
        console.warn('Cache save failed, returning data anyway:', dbError)
      }

      return NextResponse.json({
        type: 'point',
        data: copernicusData,
      })
    }

    // Si no se especifica, retornar todas las zonas
    const resultados = await Promise.all(
      ZONAS_PREDEFINIDAS.map(async (z): Promise<ZonasConDatos | null> => {
        try {
          // Intentar obtener del cache primero
          const cached = await db.fanDataCache.findFirst({
            where: {
              zona: z.nombre,
              fuente: 'copernicus',
              validUntil: { gt: new Date() },
            },
          })

          if (cached) {
            return cached.datos as unknown as ZonasConDatos
          }

          // Si no está cacheado, fetch desde Copernicus
          const data = await fetchCopernicusSSTData(z.lat, z.lon)
          if (!data) return null

          const zonasData: ZonasConDatos = {
            nombre: z.nombre,
            lat: z.lat,
            lon: z.lon,
            sst: data.sst,
            clorofila: data.clorofila,
            anomalia: data.anomalia,
            fetchedAt: data.fetchedAt,
          }

          // Guardar en cache
          await db.fanDataCache.upsert({
            where: { id: `copernicus-${z.nombre}` },
            create: {
              id: `copernicus-${z.nombre}`,
              fuente: 'copernicus',
              zona: z.nombre,
              datos: zonasData as any,
              validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
            update: {
              datos: zonasData as any,
              fetchedAt: new Date(),
              validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          })

          return zonasData
        } catch (error) {
          console.error(`Error fetching Copernicus data for ${z.nombre}:`, error)
          return null
        }
      })
    )

    const validResults = resultados.filter((r) => r !== null)

    return NextResponse.json({
      type: 'all_zones',
      zonas: validResults,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Copernicus endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
