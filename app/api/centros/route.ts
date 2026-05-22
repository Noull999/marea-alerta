import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const centros = await db.centro.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      centros: centros.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        latitud: c.latitud,
        longitud: c.longitud,
      })),
    })
  } catch (error) {
    console.error('Error fetching centros:', error)
    return NextResponse.json(
      { error: 'Error fetching centros' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre, latitud, longitud, comuna } = body

    if (!nombre || latitud === undefined || longitud === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const centro = await db.centro.create({
      data: {
        nombre,
        latitud,
        longitud,
        comuna: comuna || 'N/A',
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      {
        id: centro.id,
        nombre: centro.nombre,
        latitud: centro.latitud,
        longitud: centro.longitud,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating centro:', error)
    return NextResponse.json(
      { error: 'Error creating centro' },
      { status: 500 }
    )
  }
}
