// Utilidades para manejar notificaciones push

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers no soportado')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    console.log('Service Worker registrado:', registration)
    return registration
  } catch (error) {
    console.error('Error registrando Service Worker:', error)
    throw error
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error('Notificaciones no soportadas en este navegador')
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    throw new Error('Permisos de notificación denegados')
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export async function subscribeToPushNotifications(
  vapidPublicKey: string
) {
  const registration = await registerServiceWorker()
  if (!registration) throw new Error('Service Worker no disponible')

  const permission = await requestNotificationPermission()
  if (!permission) throw new Error('Permiso de notificación no otorgado')

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
  })

  // Enviar suscripción al servidor
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })

  if (!response.ok) throw new Error('Error al guardar suscripción')

  return subscription
}

export async function unsubscribeFromPushNotifications() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (!subscription) return

  await subscription.unsubscribe()

  // Notificar al servidor
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })
}

export async function checkPushPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission as 'granted' | 'denied' | 'default'
}

export async function getActiveSubscription() {
  if (!('serviceWorker' in navigator)) return null

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  return subscription
}

// Helper para convertir VAPID key de base64 a Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
