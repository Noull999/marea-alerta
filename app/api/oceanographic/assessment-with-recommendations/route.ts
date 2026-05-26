import { NextResponse } from 'next/server'
import { integratedOceanographicAssessment } from '@/lib/integrated-oceanographic-data'
import { generateDetailedRecommendations } from '@/lib/oceanographic-alert-engine'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const latitude = parseFloat(searchParams.get('lat') || '0')
    const longitude = parseFloat(searchParams.get('lon') || '0')
    const forecastDays = parseInt(searchParams.get('days') || '14')

    if (latitude === 0 || longitude === 0) {
      return NextResponse.json(
        { error: 'lat and lon parameters are required' },
        { status: 400 }
      )
    }

    const assessment = await integratedOceanographicAssessment(
      latitude,
      longitude,
      forecastDays
    )

    const recommendations = generateDetailedRecommendations(assessment)

    return NextResponse.json({
      assessment,
      recommendations,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error generating assessment with recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    )
  }
}
