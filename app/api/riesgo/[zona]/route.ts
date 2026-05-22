import { NextResponse } from 'next/server'
import { calcularRiesgo } from '@/lib/risk-calculator'
import { fetchVedasActivas } from '@/lib/subpesca'
import { fetchFANPorZonaIFOP } from '@/lib/ifop'
import { db } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: { zona: string } }
) {
  const zona = decodeURIComponent(params.zona)

  try {
    const [vedas, fanHistorico, cacheEntry] = await Promise.all([
      fetchVedasActivas(),
      fetchFANPorZonaIFOP(zona),
      db.fanDataCache.findFirst({
        where: { zona, validUntil: { gt: new Date() } },
      }),
    ])

    const vedaActiva = vedas.some(
      (v) => v.estado === 'ACTIVA' && v.zona.toLowerCase().includes(zona.toLowerCase())
    )

    // Datos oceánicos del cache (o valores por defecto si no hay datos aún)
    const datosCache = cacheEntry?.datos as { waveHeight?: number[] } | null
    const waveHeightPromedio = datosCache?.waveHeight?.slice(0, 24).reduce((a, b) => a + b, 0) ?? 0
    const waveHeightMedia = datosCache?.waveHeight?.length
      ? waveHeightPromedio / Math.min(24, (datosCache.waveHeight as number[]).length)
      : 1.0

    // Historial FAN (eventos en últimos 30 días)
    const ahora = new Date()
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
    const eventosFANRecientes = fanHistorico.filter(
      (e) => new Date(e.fecha) > hace30Dias
    ).length

    const resultado = calcularRiesgo({
      vedaActiva,
      sstAnomalia: 1.2, // TODO: integrar Copernicus SST cuando esté disponible
      waveHeight: waveHeightMedia,
      historialFAN: eventosFANRecientes,
    })

    return NextResponse.json({
      zona,
      ...resultado,
      vedaActiva,
      eventosRecientes: eventosFANRecientes,
      oleajePromedio: waveHeightMedia.toFixed(2),
    })
  } catch (error) {
    console.error(`Error calculating risk for ${zona}:`, error)
    return NextResponse.json(
      { error: 'Error calculating risk' },
      { status: 500 }
    )
  }
}
