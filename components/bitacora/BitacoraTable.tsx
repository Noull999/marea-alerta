'use client'
import { Trash2 } from 'lucide-react'

interface BitacoraEntry {
  id: string
  fecha: string
  observacion: string
  riesgo: 'VERDE' | 'AMARILLO' | 'ROJO'
  recomendacion: string
}

interface BitacoraTableProps {
  entries: BitacoraEntry[]
  onDelete?: (entryId: string) => void
  loading?: boolean
}

export function BitacoraTable({
  entries,
  onDelete,
  loading,
}: BitacoraTableProps) {
  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (!entries.length) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        <p>Sin registros en la bitácora</p>
      </div>
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'ROJO': return 'bg-red-500/15 text-red-300 ring-1 ring-red-500/30'
      case 'AMARILLO': return 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
      default: return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Fecha
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Riesgo
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Observación
            </th>
            <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Recomendación
            </th>
            {onDelete && (
              <th className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Acción
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-border/60 transition-colors hover:bg-muted/40">
              <td className="px-4 py-3 font-mono tabular-nums text-foreground">
                {new Date(entry.fecha).toLocaleDateString('es-CL')}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${getRiskColor(
                    entry.riesgo
                  )}`}
                >
                  {entry.riesgo}
                </span>
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                {entry.observacion}
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                {entry.recomendacion}
              </td>
              {onDelete && (
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="inline-block rounded p-1.5 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
