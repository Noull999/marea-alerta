import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entries = await db.bitacoraEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { fecha: 'desc' },
    })

    return NextResponse.json({
      entries: entries.map((e) => ({
        id: e.id,
        fecha: e.fecha.toISOString(),
        observacion: e.observacion,
        riesgo: e.riesgo,
        recomendacion: e.recomendacion,
      })),
    })
  } catch (error) {
    console.error('Error fetching bitacora:', error)
    return NextResponse.json(
      { error: 'Error fetching bitacora' },
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
    const { fecha, observacion, riesgo, recomendacion } = body

    if (!fecha || !observacion || !riesgo || !recomendacion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const entry = await db.bitacoraEntry.create({
      data: {
        fecha: new Date(fecha),
        observacion,
        riesgo,
        recomendacion,
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      {
        id: entry.id,
        fecha: entry.fecha.toISOString(),
        observacion: entry.observacion,
        riesgo: entry.riesgo,
        recomendacion: entry.recomendacion,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating bitacora entry:', error)
    return NextResponse.json(
      { error: 'Error creating entry' },
      { status: 500 }
    )
  }
}
