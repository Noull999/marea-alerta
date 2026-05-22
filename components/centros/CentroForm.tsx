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
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Centro
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Centro de Cultivo A"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitud
          </label>
          <input
            type="number"
            value={latitud}
            onChange={(e) => setLatitud(e.target.value)}
            placeholder="-42.5"
            step="0.0001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitud
          </label>
          <input
            type="number"
            value={longitud}
            onChange={(e) => setLongitud(e.target.value)}
            placeholder="-73.5"
            step="0.0001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialData ? 'Actualizar' : 'Crear'} Centro
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
