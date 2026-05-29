import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import webpush from 'web-push'

interface PushPayload {
  title: string
  body: string
  zona: string
  nivel: 'VERDE' | 'AMARILLO' | 'ROJO'
  url?: string
}

export async function POST(request: NextRequest) {
  try {
    // Configurar VAPID keys si están definidas
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:alertas@mareaalerta.cl',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      )
    }

    // Verificar que sea una solicitud autorizada (desde el servidor interno).
    // Falla cerrado si no hay clave configurada para evitar que un header
    // "Bearer undefined" sea aceptado.
    const internalKey = process.env.INTERNAL_API_KEY
    const authHeader = request.headers.get('authorization')
    if (!internalKey || authHeader !== `Bearer ${internalKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: PushPayload = await request.json()

    if (!payload.title || !payload.body || !payload.zona) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Obtener todas las suscripciones activas
    const subscriptions = await db.pushSubscription.findMany()

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions found',
        sent: 0,
      })
    }

    const notificationData = {
      title: payload.title,
      body: payload.body,
      zona: payload.zona,
      nivel: payload.nivel,
      url: payload.url || '/dashboard/alertas',
    }

    let sent = 0
    let failed = 0

    // Enviar notificación a cada suscripción
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(notificationData)
        )
        sent++
      } catch (error) {
        console.error(`Error sending notification to ${sub.endpoint}:`, error)
        // Si el endpoint está expirado, eliminar la suscripción
        if ((error as { statusCode?: number }).statusCode === 410) {
          await db.pushSubscription.delete({ where: { id: sub.id } })
        }
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notificaciones enviadas',
      sent,
      failed,
      total: subscriptions.length,
    })
  } catch (error) {
    console.error('Error sending push notifications:', error)
    return NextResponse.json(
      { error: 'Error sending notifications' },
      { status: 500 }
    )
  }
}
