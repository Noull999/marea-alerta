import { NextResponse } from 'next/server'
import {
  fetchFANHistoricoIFOP,
  fetchFANAlertasActualesIFOP,
  fetchFANPorZonaIFOP,
} from '@/lib/ifop'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all' // 'current', 'history', 'zone', 'all'
    const zona = searchParams.get('zona') || undefined
    const años = parseInt(searchParams.get('años') || '5')

    if (type === 'current') {
      const alerts = await fetchFANAlertasActualesIFOP()
      return NextResponse.json({
        type: 'current_alerts',
        alerts,
        timestamp: new Date().toISOString(),
      })
    }

    if (type === 'history') {
      const history = await fetchFANHistoricoIFOP(zona, años)
      return NextResponse.json({
        type: 'history',
        zona: zona || 'all',
        años,
        events: history,
        timestamp: new Date().toISOString(),
      })
    }

    if (type === 'zone' && zona) {
      const zoneData = await fetchFANPorZonaIFOP(zona, años)
      return NextResponse.json({
        type: 'zone_data',
        zona,
        años,
        events: zoneData,
        timestamp: new Date().toISOString(),
      })
    }

    // Retornar alertas actuales e historial por defecto
    const [currentAlerts, history] = await Promise.all([
      fetchFANAlertasActualesIFOP(),
      fetchFANHistoricoIFOP(zona, años),
    ])

    return NextResponse.json({
      current_alerts: currentAlerts,
      historical_events: history,
      zona: zona || 'all',
      años,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('IFOP endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
