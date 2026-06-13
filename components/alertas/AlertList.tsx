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
        <div key={i} className="h-16 bg-muted rounded-lg" />
      ))}
    </div>
  }

  if (!alertas.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
        <p className="text-sm">Sin alertas activas</p>
      </div>
    )
  }

  const getIcon = (nivel: string) => {
    switch (nivel) {
      case 'ROJO': return <AlertTriangle className="h-5 w-5 text-red-400" />
      case 'AMARILLO': return <AlertCircle className="h-5 w-5 text-amber-400" />
      default: return <CheckCircle className="h-5 w-5 text-emerald-400" />
    }
  }

  const getStyles = (nivel: string) => {
    switch (nivel) {
      case 'ROJO': return 'border-l-2 border-red-500 bg-red-500/10'
      case 'AMARILLO': return 'border-l-2 border-amber-500 bg-amber-500/10'
      default: return 'border-l-2 border-emerald-500 bg-emerald-500/10'
    }
  }

  return (
    <div className="space-y-2">
      {alertas.map((alerta) => (
        <div
          key={alerta.id}
          className={`rounded-lg p-4 transition-colors ${getStyles(alerta.nivel)}`}
        >
          <div className="flex items-start gap-3">
            {getIcon(alerta.nivel)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {alerta.zona}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {alerta.descripcion}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                {new Date(alerta.createdAt).toLocaleDateString('es-CL')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
