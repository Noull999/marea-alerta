import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    let preferences = await db.alertPreference.findUnique({
      where: { userId: session.user.id },
    })

    if (!preferences) {
      preferences = await db.alertPreference.create({
        data: {
          userId: session.user.id,
          alertaRojo: true,
          alertaAmarillo: true,
          alertaVerde: false,
        },
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Error al obtener preferencias' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { alertaRojo, alertaAmarillo, alertaVerde } = await req.json()

    const preferences = await db.alertPreference.upsert({
      where: { userId: session.user.id },
      update: {
        alertaRojo,
        alertaAmarillo,
        alertaVerde,
      },
      create: {
        userId: session.user.id,
        alertaRojo,
        alertaAmarillo,
        alertaVerde,
      },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Error al guardar preferencias' },
      { status: 500 }
    )
  }
}
