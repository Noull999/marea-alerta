// Función del servidor para enviar notificaciones push

export async function sendPushNotification(
  title: string,
  body: string,
  zona: string,
  nivel: 'VERDE' | 'AMARILLO' | 'ROJO',
  url?: string
) {
  if (!process.env.INTERNAL_API_KEY) {
    console.error('INTERNAL_API_KEY no configurada')
    return
  }

  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/push/send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
        },
        body: JSON.stringify({
          title,
          body,
          zona,
          nivel,
          url,
        }),
      }
    )

    if (!response.ok) {
      console.error('Error enviando notificaciones push:', response.statusText)
      return
    }

    const result = await response.json()
    console.log(
      `Notificaciones enviadas: ${result.sent}/${result.total} (${result.failed} fallidas)`
    )
    return result
  } catch (error) {
    console.error('Error en sendPushNotification:', error)
  }
}
