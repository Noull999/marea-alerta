'use client'
import { MapPin, Trash2, Edit2 } from 'lucide-react'

interface Centro {
  id: string
  nombre: string
  latitud: number
  longitud: number
}

interface CentroCardProps {
  centro: Centro
  onEdit?: (centro: Centro) => void
  onDelete?: (centroId: string) => void
}

export function CentroCard({ centro, onEdit, onDelete }: CentroCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5 transition-colors hover:border-foreground/15">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-foreground">{centro.nombre}</h3>
          <div className="mt-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="tabular-nums">
              {centro.latitud.toFixed(4)}, {centro.longitud.toFixed(4)}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(centro)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Editar"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(centro.id)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
