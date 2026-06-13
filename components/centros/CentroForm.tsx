'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface CentroFormProps {
  initialData?: {
    id: string
    nombre: string
    latitud: number
    longitud: number
  }
  onSubmit: (data: {
    nombre: string
    latitud: number
    longitud: number
  }) => Promise<void>
  onCancel?: () => void
}

export function CentroForm({
  initialData,
  onSubmit,
  onCancel,
}: CentroFormProps) {
  const [nombre, setNombre] = useState(initialData?.nombre || '')
  const [latitud, setLatitud] = useState(initialData?.latitud?.toString() || '')
  const [longitud, setLongitud] = useState(initialData?.longitud?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    if (!latitud || !longitud) {
      setError('Las coordenadas son requeridas')
      return
    }

    const lat = parseFloat(latitud)
    const lon = parseFloat(longitud)

    if (isNaN(lat) || isNaN(lon)) {
      setError('Las coordenadas deben ser números válidos')
      return
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Coordenadas fuera de rango')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        nombre: nombre.trim(),
        latitud: lat,
        longitud: lon,
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
          Nombre del Centro
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Centro de Cultivo A"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Latitud
          </label>
          <input
            type="number"
            value={latitud}
            onChange={(e) => setLatitud(e.target.value)}
            placeholder="-42.5"
            step="0.0001"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
            disabled={loading}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Longitud
          </label>
          <input
            type="number"
            value={longitud}
            onChange={(e) => setLongitud(e.target.value)}
            placeholder="-73.5"
            step="0.0001"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/40"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialData ? 'Actualizar' : 'Crear'} Centro
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
