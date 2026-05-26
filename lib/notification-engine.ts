import { db } from './db'
import { NivelRiesgo } from './risk-calculator'

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag: string
  data: {
    zona: string
    nivel: NivelRiesgo
    url: string
  }
}

export async function sendPushNotificationToZone(
  zona: string,
  nivel: NivelRiesgo,
  mensaje: string
) {
  try {
    // Obtener centros en la zona
    const centros = await db.centro.findMany({
      where: { nombre: { contains: zona, mode: 'insensitive' } },
    })

    // Obtener usuarios de esos centros
    const usuarios = await db.user.findMany({
      where: {
        centros: {
          some: {
            id: {
              in: centros.map((c) => c.id),
            },
          },
        },
      },
      include: {
        suscripciones: true,
        alertPreference: true,
      },
    })

    const titulo =
      nivel === NivelRiesgo.ROJO
        ? '🚨 ALERTA CRÍTICA: HAB Detectado'
        : nivel === NivelRiesgo.AMARILLO
          ? '⚠️ PRECAUCIÓN: Condiciones de Riesgo'
          : '✅ NORMAL: Sin Riesgo Detectado'

    const notificaciones = []

    for (const usuario of usuarios) {
      // Verificar preferencias del usuario
      if (
        (nivel === NivelRiesgo.ROJO && !usuario.alertPreference?.alertaRojo) ||
        (nivel === NivelRiesgo.AMARILLO && !usuario.alertPreference?.alertaAmarillo) ||
        (nivel === NivelRiesgo.VERDE && !usuario.alertPreference?.alertaVerde)
      ) {
        continue
      }

      for (const suscripcion of usuario.suscripciones) {
        const payload: NotificationPayload = {
          title: titulo,
          body: mensaje,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: `alert-${zona}-${nivel}`,
          data: {
            zona,
            nivel,
            url: `/dashboard/alertas?zona=${encodeURIComponent(zona)}`,
          },
        }

        // Enviar notificación push
        try {
          // TODO: Implementar envío real de push notifications
          // await webPush.sendNotification(suscripcion, JSON.stringify(payload))
          console.log(`[NOTIFICATION] Enviado a ${usuario.email}:`, payload)
          notificaciones.push({ usuario: usuario.email, status: 'sent' })
        } catch (error) {
          console.error(`Error sending notification to ${usuario.email}:`, error)
          notificaciones.push({ usuario: usuario.email, status: 'failed' })
        }
      }
    }

    return notificaciones
  } catch (error) {
    console.error('Error sending zone notifications:', error)
    throw error
  }
}

export async function sendAlertUpdateToWebhooks(
  zona: string,
  nivel: NivelRiesgo,
  detalles: any
) {
  try {
    // TODO: Uncomment after running: npx prisma generate
    // const webhooks = await db.webhook.findMany({
    //   where: {
    //     activo: true,
    //     zonas: {
    //       has: zona,
    //     },
    //   },
    // })

    // for (const webhook of webhooks) {
    //   try {
    //     const payload = {
    //       evento: 'alerta_oceanografica',
    //       zona,
    //       nivel,
    //       timestamp: new Date().toISOString(),
    //       detalles,
    //     }

    //     const response = await fetch(webhook.url, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'X-Webhook-Token': webhook.token,
    //       },
    //       body: JSON.stringify(payload),
    //     })

    //     if (!response.ok) {
    //       console.error(`Webhook failed for ${webhook.url}: ${response.status}`)
    //     }
    //   } catch (error) {
    //     console.error(`Error calling webhook ${webhook.url}:`, error)
    //   }
    // }

    console.log('[WEBHOOK] Alert update pending implementation:', { zona, nivel })
  } catch (error) {
    console.error('Error sending webhooks:', error)
  }
}
