// Service Worker para notificaciones push

self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push recibido sin datos')
    return
  }

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.zona || 'alerta',
    requireInteraction: data.nivel === 'ROJO',
    data: {
      url: data.url || '/dashboard',
      zona: data.zona,
      nivel: data.nivel,
    },
    actions: [
      {
        action: 'open',
        title: 'Ver alerta',
      },
      {
        action: 'close',
        title: 'Descartar',
      },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'MareaAlerta', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const clientUrl = event.notification.data.url
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si hay una ventana abierta, redirigir a ella
      for (let client of clientList) {
        if (client.url === clientUrl && 'focus' in client) {
          return client.focus()
        }
      }
      // Si no hay ventana, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(clientUrl)
      }
    })
  )
})

self.addEventListener('notificationclose', (event) => {
  console.log('Notificación cerrada:', event.notification.tag)
})

// Background sync para sincronizar datos offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-alerts') {
    event.waitUntil(
      fetch('/api/alertas/sync')
        .then((res) => res.json())
        .catch((err) => console.error('Sync fallido:', err))
    )
  }
})
