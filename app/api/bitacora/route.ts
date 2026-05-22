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
        centroId: e.centroId,
        cosecha_kg: e.cosecha_kg,
        toxicidad: e.toxicidad,
        notas: e.notas,
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
    const { fecha, centroId, cosecha_kg, toxicidad, notas } = body

    if (!fecha || !centroId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const entry = await db.bitacoraEntry.create({
      data: {
        fecha: new Date(fecha),
        centroId,
        cosecha_kg: cosecha_kg ?? null,
        toxicidad: toxicidad ?? null,
        notas: notas ?? null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      {
        id: entry.id,
        fecha: entry.fecha.toISOString(),
        centroId: entry.centroId,
        cosecha_kg: entry.cosecha_kg,
        toxicidad: entry.toxicidad,
        notas: entry.notas,
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
