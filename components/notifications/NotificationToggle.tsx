'use client'
import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  checkPushPermission,
  getActiveSubscription,
} from '@/lib/push-notifications'

export function NotificationToggle() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    checkSupport()
  }, [])

  const checkSupport = async () => {
    try {
      const permission = await checkPushPermission()
      const subscription = await getActiveSubscription()

      if (permission === 'granted' && subscription) {
        setIsEnabled(true)
      } else {
        setIsEnabled(false)
      }

      // Verificar soporte del navegador
      if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        setSupported(false)
      }
    } catch (err) {
      console.error('Error checking notification support:', err)
      setSupported(false)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    setLoading(true)
    setError('')

    try {
      if (isEnabled) {
        // Desuscribirse
        await unsubscribeFromPushNotifications()
        setIsEnabled(false)
      } else {
        // Suscribirse
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidKey) throw new Error('VAPID key no configurada')

        await subscribeToPushNotifications(vapidKey)
        setIsEnabled(true)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      console.error('Error toggling notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!supported) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
        <p className="text-sm text-gray-600">
          Las notificaciones push no están soportadas en este navegador
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <Bell className="h-5 w-5 text-blue-600" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <p className="font-medium text-gray-900">Notificaciones Push</p>
            <p className="text-sm text-gray-600">
              {isEnabled
                ? 'Recibirás alertas en tiempo real'
                : 'Habilita para recibir alertas'}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            isEnabled
              ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-300'
          }`}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEnabled ? 'Desactivar' : 'Activar'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500">
        {isEnabled
          ? 'Las notificaciones están habilitadas. Recibirás alertas sobre cambios de nivel de riesgo en zonas monitoreadas.'
          : 'Habilita las notificaciones para recibir alertas inmediatas cuando cambien los niveles de riesgo.'}
      </p>
    </div>
  )
}
