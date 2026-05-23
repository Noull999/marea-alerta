import { NextResponse } from 'next/server'
import {
  fetchSHOAPrediccionMareas,
  fetchSHOAEstadoMar,
  fetchSHOAPuertosPrincipales,
  evaluarCondicionesMareas,
} from '@/lib/shoa'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all' // 'mareas', 'estado-mar', 'puertos', 'all'
    const puerto = searchParams.get('puerto')
    const dias = parseInt(searchParams.get('dias') || '3')

    if (type === 'mareas') {
      const puertoPrediction = puerto || 'Castro'
      const predicciones = await fetchSHOAPrediccionMareas(puertoPrediction, dias)

      // Evaluar condiciones de mareas
      const condiciones = predicciones.map((pred) => ({
        fecha: pred.fecha,
        ...evaluarCondicionesMareas(pred.puntos),
      }))

      return NextResponse.json({
        type: 'tide_predictions',
        puerto: puertoPrediction,
        dias,
        predicciones,
        condiciones,
        timestamp: new Date().toISOString(),
      })
    }

    if (type === 'estado-mar') {
      const estadoMar = await fetchSHOAEstadoMar()
      return NextResponse.json({
        type: 'sea_state',
        zonas: estadoMar,
        timestamp: new Date().toISOString(),
      })
    }

    if (type === 'puertos') {
      const puertos = await fetchSHOAPuertosPrincipales()
      return NextResponse.json({
        type: 'ports',
        puertos,
        timestamp: new Date().toISOString(),
      })
    }

    // Retornar todos los datos por defecto
    const [predicciones, estadoMar, puertos] = await Promise.all([
      fetchSHOAPrediccionMareas(puerto || 'Castro', dias),
      fetchSHOAEstadoMar(),
      fetchSHOAPuertosPrincipales(),
    ])

    const condiciones = predicciones.map((pred) => ({
      fecha: pred.fecha,
      ...evaluarCondicionesMareas(pred.puntos),
    }))

    return NextResponse.json({
      tide_predictions: predicciones,
      tide_conditions: condiciones,
      sea_state: estadoMar,
      ports: puertos,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('SHOA endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
