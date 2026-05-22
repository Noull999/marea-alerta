import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { NotificationToggle } from '@/components/notifications/NotificationToggle'

export default async function ConfiguracionPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Administra tus preferencias y notificaciones</p>
      </div>

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
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 border-gray-300 rounded text-blue-600"
            />
            <span className="text-gray-700">
              Alertas de riesgo ROJO (críticas)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 border-gray-300 rounded text-blue-600"
            />
            <span className="text-gray-700">
              Alertas de riesgo AMARILLO (precaución)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 border-gray-300 rounded text-blue-600"
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
            <strong>Versión:</strong> 1.0.0
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
