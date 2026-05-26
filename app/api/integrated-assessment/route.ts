import { NextRequest, NextResponse } from 'next/server'
import { integratedOceanographicAssessment, generateComprehensiveReport } from '@/lib/integrated-oceanographic-data'

export const runtime = 'nodejs'
export const revalidate = 3600 // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const latitude = parseFloat(searchParams.get('lat') || '-42')
    const longitude = parseFloat(searchParams.get('lon') || '-74')
    const forecastDays = parseInt(searchParams.get('days') || '14', 10)

    // Validate parameters
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude parameters' },
        { status: 400 }
      )
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Latitude must be -90 to 90, longitude must be -180 to 180' },
        { status: 400 }
      )
    }

    console.log(
      `[API] Integrated assessment requested for ${latitude}, ${longitude} (${forecastDays} days)`
    )

    // Perform integrated assessment
    const startTime = Date.now()
    const assessment = await integratedOceanographicAssessment(latitude, longitude, forecastDays)
    const duration = Date.now() - startTime

    console.log(
      `[API] Assessment completed in ${duration}ms. Risk level: ${assessment.risk_assessment.overall_risk_level}`
    )

    return NextResponse.json(
      {
        success: true,
        data: assessment,
        processing_time_ms: duration,
        timestamp: new Date().toISOString(),
        status: {
          sources_available: assessment.data_quality.sources_available.length,
          sources_unavailable: assessment.data_quality.sources_unavailable.length,
          confidence_percent: assessment.data_quality.composite_confidence
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
          'X-Assessment-Timestamp': new Date().toISOString(),
          'X-Risk-Level': assessment.risk_assessment.overall_risk_level
        }
      }
    )
  } catch (error) {
    console.error('[API] Error in integrated assessment:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Support batch assessment
    if (Array.isArray(body.locations)) {
      const locations = body.locations as Array<{
        latitude: number
        longitude: number
        name?: string
      }>

      const assessments = await Promise.all(
        locations.map((loc) => integratedOceanographicAssessment(loc.latitude, loc.longitude, 14))
      )

      const report = await generateComprehensiveReport(assessments)

      return NextResponse.json(
        {
          success: true,
          data: {
            assessments,
            report: Object.fromEntries(report.regional_status),
            critical_zones: report.critical_zones,
            summary: report.summary
          },
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      )
    }

    // Single assessment
    const { latitude, longitude, forecastDays = 14 } = body

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: latitude, longitude' },
        { status: 400 }
      )
    }

    const assessment = await integratedOceanographicAssessment(latitude, longitude, forecastDays)

    return NextResponse.json(
      {
        success: true,
        data: assessment,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Risk-Level': assessment.risk_assessment.overall_risk_level
        }
      }
    )
  } catch (error) {
    console.error('[API] Error processing POST request:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
