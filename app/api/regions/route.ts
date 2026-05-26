import { NextResponse } from 'next/server'
import { REGIONS } from '@/lib/regional-zones'

export async function GET() {
  try {
    const regions = REGIONS.map(region => ({
      id: region.id,
      nombre: region.nombre,
      pais: region.pais,
      upwellingPoint: region.upwellingPoint,
      descripcion: region.descripcion,
      zonas: region.zonas.map(z => ({
        id: z.id,
        nombre: z.nombre,
        lat: z.lat,
        lon: z.lon,
        tipo: z.tipo,
        cultivos: z.cultivos
      }))
    }))

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalRegions: regions.length,
      regions,
      usage: {
        example_all_zones: '/api/fan-data',
        example_peru_norte: '/api/fan-data?region=peru_norte',
        example_chile_lagos: '/api/fan-data?region=chile_lagos',
        example_enhanced: '/api/enhanced-oceanographic-data?region=peru_central',
        example_explicit_coords: '/api/enhanced-oceanographic-data?lat=-42.48&lon=-73.77'
      }
    })
  } catch (error) {
    console.error('Error fetching regions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    )
  }
}
