import { NextResponse } from 'next/server'
import { generateOceanographicAlert } from '@/lib/oceanographic-alert-engine'

export async function POST(req: Request) {
  try {
    const { zona, latitude, longitude, centroIds } = await req.json()

    if (!zona || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'zona, latitude, and longitude are required' },
        { status: 400 }
      )
    }

    const result = await generateOceanographicAlert({
      zona,
      latitude,
      longitude,
      centroIds,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating alert:', error)
    return NextResponse.json({ error: 'Failed to generate alert' }, { status: 500 })
  }
}
