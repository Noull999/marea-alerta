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
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <p className="text-sm text-muted-foreground">
          Las notificaciones push no están soportadas en este navegador
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium text-foreground">Notificaciones Push</p>
            <p className="text-sm text-muted-foreground">
              {isEnabled
                ? 'Recibirás alertas en tiempo real'
                : 'Habilita para recibir alertas'}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
            isEnabled
              ? 'bg-primary text-primary-foreground hover:bg-primary/85'
              : 'border border-border bg-secondary text-secondary-foreground hover:bg-muted'
          }`}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEnabled ? 'Desactivar' : 'Activar'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {isEnabled
          ? 'Las notificaciones están habilitadas. Recibirás alertas sobre cambios de nivel de riesgo en zonas monitoreadas.'
          : 'Habilita las notificaciones para recibir alertas inmediatas cuando cambien los niveles de riesgo.'}
      </p>
    </div>
  )
}
