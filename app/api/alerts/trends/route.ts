import { NextResponse } from 'next/server'
import { generateTrendAnalysis } from '@/lib/oceanographic-alert-engine'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const zona = searchParams.get('zona')
    const days = parseInt(searchParams.get('days') || '7')

    if (!zona) {
      return NextResponse.json({ error: 'zona parameter is required' }, { status: 400 })
    }

    const trend = await generateTrendAnalysis(zona, days)

    return NextResponse.json({
      zona,
      trend,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error generating trend analysis:', error)
    return NextResponse.json({ error: 'Failed to generate trend' }, { status: 500 })
  }
}
