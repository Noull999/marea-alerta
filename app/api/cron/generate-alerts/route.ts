import { NextResponse } from 'next/server'
import { generateOceanographicAlert } from '@/lib/oceanographic-alert-engine'
import { sendPushNotificationToZone } from '@/lib/notification-engine'
import { db } from '@/lib/db'

// Zonas monitoradas por defecto
const MONITORED_ZONES = [
  { nombre: 'Región de Los Lagos', lat: -41.5, lon: -72.5 },
  { nombre: 'Región de Aysén', lat: -45.5, lon: -72.0 },
  { nombre: 'Región de Magallanes', lat: -52.5, lon: -71.0 },
  { nombre: 'Región de Valparaíso', lat: -33.0, lon: -71.5 },
  { nombre: 'Perú Norte', lat: -8.0, lon: -79.0 },
  { nombre: 'Perú Centro', lat: -12.0, lon: -77.0 },
  { nombre: 'Perú Sur', lat: -15.0, lon: -75.0 },
]

export async function POST(req: Request) {
  // Verificar token de autorización (si está configurado)
  const authToken = req.headers.get('x-cron-token')
  const expectedToken = process.env.CRON_SECRET_TOKEN || 'default-cron-token'

  if (authToken !== expectedToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    console.log('[CRON] Starting automatic alert generation...')

    const results = []

    for (const zone of MONITORED_ZONES) {
      try {
        const alertResult = await generateOceanographicAlert({
          zona: zone.nombre,
          latitude: zone.lat,
          longitude: zone.lon,
        })

        results.push({
          zona: zone.nombre,
          nivel: alertResult.nivel,
          score: alertResult.score,
          alertasGeneradas: alertResult.alertasGeneradas.length,
        })

        // Enviar notificaciones si hay alerta
        if (alertResult.alertasGeneradas.length > 0) {
          await sendPushNotificationToZone(
            zone.nombre,
            alertResult.nivel,
            `${alertResult.recomendaciones[0]} Confianza: ${alertResult.datosOceanograficos.confianza}%`
          )
        }

        console.log(
          `[CRON] ${zone.nombre}: ${alertResult.nivel} (${alertResult.score})`
        )
      } catch (error) {
        console.error(`[CRON] Error processing ${zone.nombre}:`, error)
        results.push({
          zona: zone.nombre,
          error: 'Failed to generate alert',
        })
      }
    }

    // Limpiar alertas expiradas
    await db.alerta.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        activa: true,
      },
      data: { activa: false },
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      zonesProcessed: MONITORED_ZONES.length,
      results,
    })
  } catch (error) {
    console.error('[CRON] Error in automatic alert generation:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}
