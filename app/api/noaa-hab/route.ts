import { NextResponse } from 'next/server'
import { fetchNOAAHABForecast, fetchNOAAHABHistory } from '@/lib/noaa-hab'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'forecast' // 'forecast' o 'history'
    const zona = searchParams.get('zona') || undefined
    const days = parseInt(searchParams.get('days') || '90')

    if (type === 'forecast') {
      const alerts = await fetchNOAAHABForecast()
      return NextResponse.json({
        type: 'forecast',
        alerts,
        timestamp: new Date().toISOString(),
      })
    }

    if (type === 'history') {
      const history = await fetchNOAAHABHistory(zona, days)
      return NextResponse.json({
        type: 'history',
        zona: zona || 'all',
        days,
        events: history,
        timestamp: new Date().toISOString(),
      })
    }

    // Retornar ambos por defecto
    const [forecast, history] = await Promise.all([
      fetchNOAAHABForecast(),
      fetchNOAAHABHistory(zona, days),
    ])

    return NextResponse.json({
      forecast,
      history,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('NOAA HAB endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
