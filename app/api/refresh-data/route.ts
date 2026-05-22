import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Limpiar todo el cache para obtener datos frescos
    await db.fanDataCache.deleteMany({})

    return NextResponse.json({
      success: true,
      message: 'Cache limpiado. Los datos se actualizarán en la próxima solicitud.'
    })
  } catch (error) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      { error: 'Error al limpiar cache' },
      { status: 500 }
    )
  }
}
