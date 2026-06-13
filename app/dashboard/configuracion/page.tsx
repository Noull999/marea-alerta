'use client'
import { useEffect, useState } from 'react'
import { NotificationToggle } from '@/components/notifications/NotificationToggle'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Check, AlertCircle } from 'lucide-react'

export default function ConfiguracionPage() {
  const [session, setSession] = useState<any>(null)
  const [alertaRojo, setAletaRojo] = useState(true)
  const [alertaAmarillo, setAletaAmarillo] = useState(true)
  const [alertaVerde, setAletaVerde] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const sessionData = await response.json()
        setSession(sessionData)

        if (sessionData?.user?.id) {
          await fetchPreferences()
        }
      } catch (error) {
        console.error('Error loading session:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/preferences')
      if (response.ok) {
        const data = await response.json()
        setAletaRojo(data.alertaRojo)
        setAletaAmarillo(data.alertaAmarillo)
        setAletaVerde(data.alertaVerde)
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }

  const handlePreferenceChange = async (type: string, value: boolean) => {
    setSaving(true)
    setMessage('')

    try {
      const newPreferences = {
        alertaRojo: type === 'rojo' ? value : alertaRojo,
        alertaAmarillo: type === 'amarillo' ? value : alertaAmarillo,
        alertaVerde: type === 'verde' ? value : alertaVerde,
      }

      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences),
      })

      if (response.ok) {
        if (type === 'rojo') setAletaRojo(value)
        if (type === 'amarillo') setAletaAmarillo(value)
        if (type === 'verde') setAletaVerde(value)
        setMessage('Preferencias guardadas exitosamente')
        setMessageType('success')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Error al guardar las preferencias')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      setMessage('Error al guardar las preferencias')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !session?.user) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Configuración" title="Preferencias" description="Cargando..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuración"
        title="Preferencias"
        description="Administra tus notificaciones y cuenta"
      />

      {message && (
        <div className={`flex items-center gap-2 rounded-lg p-4 text-sm ${
          messageType === 'success'
            ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            : 'border border-red-500/30 bg-red-500/10 text-red-300'
        }`}>
          {messageType === 'success' ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message}
        </div>
      )}

      {/* Notificaciones */}
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5">
        <h2 className="mb-6 font-heading text-lg font-semibold text-foreground">
          Notificaciones
        </h2>
        <NotificationToggle />
      </div>

      {/* Información de Cuenta */}
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5">
        <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
          Información de Cuenta
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={session.user?.email || ''}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Nombre
            </label>
            <input
              type="text"
              value={session.user?.name || ''}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Preferencias de Alertas */}
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Preferencias de Alertas
        </h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Selecciona qué niveles de alerta deseas recibir
        </p>
        <div className="space-y-1">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50">
            <input
              type="checkbox"
              checked={alertaRojo}
              onChange={(e) => handlePreferenceChange('rojo', e.target.checked)}
              disabled={saving}
              className="h-4 w-4 rounded border-input accent-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-sm text-foreground">
              Alertas de riesgo <span className="font-mono font-semibold text-red-400">ROJO</span> (críticas)
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50">
            <input
              type="checkbox"
              checked={alertaAmarillo}
              onChange={(e) => handlePreferenceChange('amarillo', e.target.checked)}
              disabled={saving}
              className="h-4 w-4 rounded border-input accent-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-sm text-foreground">
              Alertas de riesgo <span className="font-mono font-semibold text-amber-400">AMARILLO</span> (precaución)
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50">
            <input
              type="checkbox"
              checked={alertaVerde}
              onChange={(e) => handlePreferenceChange('verde', e.target.checked)}
              disabled={saving}
              className="h-4 w-4 rounded border-input accent-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-foreground">
              Alertas de riesgo <span className="font-mono font-semibold text-emerald-400">VERDE</span> (sin riesgo)
            </span>
          </label>
        </div>
      </div>

      {/* Información de la App */}
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5">
        <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
          Acerca de MareaAlerta
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="font-medium text-foreground">Versión:</strong> 1.0.1
          </p>
          <p>
            <strong className="font-medium text-foreground">Última actualización:</strong>{' '}
            {new Date().toLocaleDateString('es-CL')}
          </p>
          <p className="pt-2">
            MareaAlerta es una aplicación web para monitoreo de riesgo de marea roja
            (FAN) en Los Lagos, Chile. Desarrollada para cultores de moluscos.
          </p>
        </div>
      </div>
    </div>
  )
}
