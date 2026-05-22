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
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha
        </label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nivel de Riesgo
        </label>
        <select
          value={riesgo}
          onChange={(e) => setRiesgo(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="VERDE">Verde - Sin riesgo</option>
          <option value="AMARILLO">Amarillo - Precaución</option>
          <option value="ROJO">Rojo - Alto riesgo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observación
        </label>
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          placeholder="Describe lo observado en el agua..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recomendación
        </label>
        <textarea
          value={recomendacion}
          onChange={(e) => setRecomendacion(e.target.value)}
          placeholder="Acción recomendada..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar Registro
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:bg-gray-100"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
