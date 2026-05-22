import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const centro = await db.centro.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!centro) {
      return NextResponse.json({ error: 'Centro not found' }, { status: 404 })
    }

    const body = await request.json()
    const { nombre, latitud, longitud } = body

    if (!nombre || latitud === undefined || longitud === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const updated = await db.centro.update({
      where: { id: params.id },
      data: { nombre, latitud, longitud },
    })

    return NextResponse.json({
      id: updated.id,
      nombre: updated.nombre,
      latitud: updated.latitud,
      longitud: updated.longitud,
    })
  } catch (error) {
    console.error('Error updating centro:', error)
    return NextResponse.json(
      { error: 'Error updating centro' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const centro = await db.centro.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!centro) {
      return NextResponse.json({ error: 'Centro not found' }, { status: 404 })
    }

    await db.centro.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting centro:', error)
    return NextResponse.json(
      { error: 'Error deleting centro' },
      { status: 500 }
    )
  }
}
