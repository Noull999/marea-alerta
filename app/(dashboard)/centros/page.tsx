'use client'
import { useState, useEffect } from 'react'
import { CentroForm } from '@/components/centros/CentroForm'
import { CentroCard } from '@/components/centros/CentroCard'
import { Plus, X } from 'lucide-react'

interface Centro {
  id: string
  nombre: string
  latitud: number
  longitud: number
}

export default function CentrosPage() {
  const [centros, setCentros] = useState<Centro[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCentro, setEditingCentro] = useState<Centro | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCentros()
  }, [])

  const fetchCentros = async () => {
    try {
      const res = await fetch('/api/centros')
      if (!res.ok) throw new Error('Error al cargar centros')
      const data = await res.json()
      setCentros(data.centros)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: {
    nombre: string
    latitud: number
    longitud: number
  }) => {
    try {
      const method = editingCentro ? 'PUT' : 'POST'
      const url = editingCentro ? `/api/centros/${editingCentro.id}` : '/api/centros'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Error al guardar centro')

      const savedCentro = await res.json()
      if (editingCentro) {
        setCentros((prev) =>
          prev.map((c) => (c.id === editingCentro.id ? savedCentro : c))
        )
      } else {
        setCentros((prev) => [...prev, savedCentro])
      }

      setShowForm(false)
      setEditingCentro(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    }
  }

  const handleDelete = async (centroId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este centro?')) return

    try {
      const res = await fetch(`/api/centros/${centroId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar centro')
      setCentros((prev) => prev.filter((c) => c.id !== centroId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Centros</h1>
          <p className="text-gray-600 mt-1">Gestiona tus centros de cultivo</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingCentro(null)
              setShowForm(true)
              setError('')
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Centro</span>
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
            <h2 className="text-lg font-semibold text-gray-900">
              {editingCentro ? 'Editar Centro' : 'Nuevo Centro'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingCentro(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <CentroForm
            initialData={editingCentro || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditingCentro(null)
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      ) : centros.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No tienes centros registrados</p>
          <button
            onClick={() => {
              setEditingCentro(null)
              setShowForm(true)
            }}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Crear tu primer centro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {centros.map((centro) => (
            <CentroCard
              key={centro.id}
              centro={centro}
              onEdit={(c) => {
                setEditingCentro(c)
                setShowForm(true)
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
