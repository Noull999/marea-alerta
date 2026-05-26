import { NextResponse } from 'next/server'
import { generateZoneReport } from '@/lib/report-generator'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ zona: string }> }
) {
  try {
    const { zona } = await params
    const decodedZona = decodeURIComponent(zona)

    // Coordenadas aproximadas para zonas comunes
    const zoneCoordinates: Record<string, { lat: number; lon: number }> = {
      'región-de-los-lagos': { lat: -41.5, lon: -72.5 },
      'región-de-aysén': { lat: -45.5, lon: -72.0 },
      'región-de-magallanes': { lat: -52.5, lon: -71.0 },
      'región-de-valparaíso': { lat: -33.0, lon: -71.5 },
      'región-metropolitana': { lat: -33.5, lon: -70.5 },
      'región-del-maule': { lat: -35.0, lon: -71.5 },
      'región-del-bío-bío': { lat: -37.0, lon: -72.5 },
      'región-la-araucanía': { lat: -38.5, lon: -71.5 },
      'perú': { lat: -10.0, lon: -75.0 },
    }

    const coords =
      zoneCoordinates[decodedZona.toLowerCase()] ||
      zoneCoordinates['región-de-los-lagos']

    const report = await generateZoneReport(
      decodedZona,
      coords.lat,
      coords.lon
    )

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating zone report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
