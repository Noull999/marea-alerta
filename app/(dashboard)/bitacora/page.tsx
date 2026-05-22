'use client'
import { useState, useEffect } from 'react'
import { BitacoraForm } from '@/components/bitacora/BitacoraForm'
import { BitacoraTable } from '@/components/bitacora/BitacoraTable'
import { Plus, X } from 'lucide-react'

interface BitacoraEntry {
  id: string
  fecha: string
  observacion: string
  riesgo: 'VERDE' | 'AMARILLO' | 'ROJO'
  recomendacion: string
}

export default function BitacoraPage() {
  const [entries, setEntries] = useState<BitacoraEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/bitacora')
      if (!res.ok) throw new Error('Error al cargar bitácora')
      const data = await res.json()
      setEntries(data.entries)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: {
    fecha: string
    observacion: string
    riesgo: 'VERDE' | 'AMARILLO' | 'ROJO'
    recomendacion: string
  }) => {
    try {
      const res = await fetch('/api/bitacora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Error al guardar registro')

      const newEntry = await res.json()
      setEntries((prev) => [newEntry, ...prev])
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return

    try {
      const res = await fetch(`/api/bitacora/${entryId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      setEntries((prev) => prev.filter((e) => e.id !== entryId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bitácora</h1>
          <p className="text-gray-600 mt-1">Registro de observaciones y seguimiento</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true)
              setError('')
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Registro</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Nuevo Registro</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <BitacoraForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <BitacoraTable
          entries={entries}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  )
}
