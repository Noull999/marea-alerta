'use client'
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'

interface Alerta {
  id: string
  zona: string
  nivel: 'VERDE' | 'AMARILLO' | 'ROJO'
  descripcion: string
  createdAt: string
}

interface AlertListProps {
  alertas: Alerta[]
  loading?: boolean
}

export function AlertList({ alertas, loading }: AlertListProps) {
  if (loading) {
    return <div className="space-y-2 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-lg" />
      ))}
    </div>
  }

  if (!alertas.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
        <p>Sin alertas activas</p>
      </div>
    )
  }

  const getIcon = (nivel: string) => {
    switch (nivel) {
      case 'ROJO': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'AMARILLO': return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default: return <CheckCircle className="h-5 w-5 text-green-600" />
    }
  }

  const getStyles = (nivel: string) => {
    switch (nivel) {
      case 'ROJO': return 'border-l-4 border-red-500 bg-red-50'
      case 'AMARILLO': return 'border-l-4 border-yellow-500 bg-yellow-50'
      default: return 'border-l-4 border-green-500 bg-green-50'
    }
  }

  return (
    <div className="space-y-2">
      {alertas.map((alerta) => (
        <div
          key={alerta.id}
          className={`p-4 rounded-lg ${getStyles(alerta.nivel)}`}
        >
          <div className="flex items-start gap-3">
            {getIcon(alerta.nivel)}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">
                {alerta.zona}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {alerta.descripcion}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(alerta.createdAt).toLocaleDateString('es-CL')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
