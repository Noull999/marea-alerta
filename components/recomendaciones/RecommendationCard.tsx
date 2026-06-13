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
        return <AlertTriangle className="h-6 w-6 text-red-400" />
      case 'AMARILLO':
        return <AlertCircle className="h-6 w-6 text-amber-400" />
      default:
        return <CheckCircle className="h-6 w-6 text-emerald-400" />
    }
  }

  const getStyles = (nivel: string) => {
    switch (nivel) {
      case 'ROJO':
        return 'border-l-2 border-red-500 bg-red-500/10'
      case 'AMARILLO':
        return 'border-l-2 border-amber-500 bg-amber-500/10'
      default:
        return 'border-l-2 border-emerald-500 bg-emerald-500/10'
    }
  }

  const getRiskBadge = (nivel: string) => {
    switch (nivel) {
      case 'ROJO':
        return 'bg-red-500/15 text-red-300 ring-1 ring-red-500/30'
      case 'AMARILLO':
        return 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
      default:
        return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
    }
  }

  return (
    <div className={`rounded-lg p-4 ${getStyles(nivel)}`}>
      <div className="flex items-start gap-3">
        {getIcon(nivel)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">{zona}</h3>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${getRiskBadge(nivel)}`}
            >
              {nivel}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{recomendacion}</p>

          {/* Data meteorológica */}
          {(temperatura !== undefined || oleaje !== undefined) && (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
              {temperatura !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Cloud className="h-3 w-3" />
                  <span className="tabular-nums">Temp: {temperatura.toFixed(1)}°C</span>
                </div>
              )}
              {oleaje !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Cloud className="h-3 w-3" />
                  <span className="tabular-nums">Oleaje: {oleaje.toFixed(1)}m</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
