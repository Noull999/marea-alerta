import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const defaultPreferences = {
  id: 'default',
  userId: '',
  alertaRojo: true,
  alertaAmarillo: true,
  alertaVerde: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const preferences = {
      ...defaultPreferences,
      userId: session.user.id,
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

    const preferences = {
      id: 'default',
      userId: session.user.id,
      alertaRojo: alertaRojo !== undefined ? alertaRojo : true,
      alertaAmarillo: alertaAmarillo !== undefined ? alertaAmarillo : true,
      alertaVerde: alertaVerde !== undefined ? alertaVerde : false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Error al guardar preferencias' },
      { status: 500 }
    )
  }
}
