'use client'
import { useEffect, useState } from 'react'
import { NotificationToggle } from '@/components/notifications/NotificationToggle'
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Administra tus preferencias y notificaciones</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          messageType === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Notificaciones
        </h2>
        <NotificationToggle />
      </div>

      {/* Información de Cuenta */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Información de Cuenta
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={session.user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={session.user?.name || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Preferencias de Alertas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Preferencias de Alertas
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona qué niveles de alerta deseas recibir
        </p>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={alertaRojo}
              onChange={(e) => handlePreferenceChange('rojo', e.target.checked)}
              disabled={saving}
              className="w-4 h-4 border-gray-300 rounded text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-gray-700">
              Alertas de riesgo ROJO (críticas)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={alertaAmarillo}
              onChange={(e) => handlePreferenceChange('amarillo', e.target.checked)}
              disabled={saving}
              className="w-4 h-4 border-gray-300 rounded text-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-gray-700">
              Alertas de riesgo AMARILLO (precaución)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={alertaVerde}
              onChange={(e) => handlePreferenceChange('verde', e.target.checked)}
              disabled={saving}
              className="w-4 h-4 border-gray-300 rounded text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-gray-700">
              Alertas de riesgo VERDE (sin riesgo)
            </span>
          </label>
        </div>
      </div>

      {/* Información de la App */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acerca de MareaAlerta
        </h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Versión:</strong> 1.0.1
          </p>
          <p>
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CL')}
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
