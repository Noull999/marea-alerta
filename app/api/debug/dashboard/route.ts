import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticación
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({
        status: 'error',
        reason: 'not_authenticated',
        message: 'No se encontró sesión de usuario',
      }, { status: 401 })
    }

    // Intenta las mismas queries que el dashboard
    const [centrosUsuario, alertas] = await Promise.all([
      db.centro.findMany({
        where: { userId: session.user.id },
      }),
      db.alerta.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    return NextResponse.json({
      status: 'ok',
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      data: {
        centrosCount: centrosUsuario.length,
        alertasCount: alertas.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Dashboard debug failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
