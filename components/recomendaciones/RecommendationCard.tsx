'use client'
import { AlertTriangle, AlertCircle, CheckCircle, Cloud } from 'lucide-react'

interface RecommendationCardProps {
  zona: string
  nivel: 'VERDE' | 'AMARILLO' | 'ROJO'
  recomendacion: string
  temperatura?: number
  oleaje?: number
}

export function RecommendationCard({
  zona,
  nivel,
  recomendacion,
  temperatura,
  oleaje,
}: RecommendationCardProps) {
  const getIcon = (nivel: string) => {
    switch (nivel) {
      case 'ROJO':
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      case 'AMARILLO':
        return <AlertCircle className="h-6 w-6 text-yellow-600" />
      default:
        return <CheckCircle className="h-6 w-6 text-green-600" />
    }
  }

  const getStyles = (nivel: string) => {
    switch (nivel) {
      case 'ROJO':
        return 'border-l-4 border-red-500 bg-red-50'
      case 'AMARILLO':
        return 'border-l-4 border-yellow-500 bg-yellow-50'
      default:
        return 'border-l-4 border-green-500 bg-green-50'
    }
  }

  const getRiskColor = (nivel: string) => {
    switch (nivel) {
      case 'ROJO':
        return 'text-red-700 font-bold'
      case 'AMARILLO':
        return 'text-yellow-700 font-bold'
      default:
        return 'text-green-700 font-bold'
    }
  }

  return (
    <div className={`p-4 rounded-lg ${getStyles(nivel)}`}>
      <div className="flex items-start gap-3">
        {getIcon(nivel)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{zona}</h3>
            <span className={`text-xs px-2 py-1 rounded ${getRiskColor(nivel)}`}>
              {nivel}
            </span>
          </div>
          <p className="text-sm mt-2 text-gray-700">{recomendacion}</p>

          {/* Data meteorológica */}
          {(temperatura !== undefined || oleaje !== undefined) && (
            <div className="mt-3 pt-3 border-t border-current border-opacity-10 grid grid-cols-2 gap-2 text-xs">
              {temperatura !== undefined && (
                <div className="flex items-center gap-1">
                  <Cloud className="h-3 w-3" />
                  <span>Temp: {temperatura.toFixed(1)}°C</span>
                </div>
              )}
              {oleaje !== undefined && (
                <div className="flex items-center gap-1">
                  <Cloud className="h-3 w-3" />
                  <span>Oleaje: {oleaje.toFixed(1)}m</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
