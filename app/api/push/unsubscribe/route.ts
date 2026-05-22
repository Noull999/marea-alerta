import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await request.json()

    if (!subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      )
    }

    // Eliminar suscripción
    await db.pushSubscription.deleteMany({
      where: {
        endpoint: subscription.endpoint,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Suscripción eliminada',
    })
  } catch (error) {
    console.error('Error removing push subscription:', error)
    return NextResponse.json(
      { error: 'Error removing subscription' },
      { status: 500 }
    )
  }
}
