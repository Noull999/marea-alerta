'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface BitacoraFormProps {
  onSubmit: (data: {
    fecha: string
    observacion: string
    riesgo: 'VERDE' | 'AMARILLO' | 'ROJO'
    recomendacion: string
  }) => Promise<void>
  onCancel?: () => void
}

export function BitacoraForm({ onSubmit, onCancel }: BitacoraFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [fecha, setFecha] = useState(today)
  const [observacion, setObservacion] = useState('')
  const [riesgo, setRiesgo] = useState<'VERDE' | 'AMARILLO' | 'ROJO'>('VERDE')
  const [recomendacion, setRecomendacion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!observacion.trim()) {
      setError('La observación es requerida')
      return
    }

    if (!recomendacion.trim()) {
      setError('La recomendación es requerida')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        fecha: new Date(fecha).toISOString(),
        observacion: observacion.trim(),
        riesgo,
        recomendacion: recomendacion.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Fecha
        </label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
          disabled={loading}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Nivel de Riesgo
        </label>
        <select
          value={riesgo}
          onChange={(e) => setRiesgo(e.target.value as any)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
          disabled={loading}
        >
          <option value="VERDE">Verde - Sin riesgo</option>
          <option value="AMARILLO">Amarillo - Precaución</option>
          <option value="ROJO">Rojo - Alto riesgo</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Observación
        </label>
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          placeholder="Describe lo observado en el agua..."
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
          disabled={loading}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Recomendación
        </label>
        <textarea
          value={recomendacion}
          onChange={(e) => setRecomendacion(e.target.value)}
          placeholder="Acción recomendada..."
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
          disabled={loading}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar Registro
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
