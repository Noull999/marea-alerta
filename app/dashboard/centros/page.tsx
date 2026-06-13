'use client'
import { useState, useEffect } from 'react'
import { CentroForm } from '@/components/centros/CentroForm'
import { CentroCard } from '@/components/centros/CentroCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
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
      <PageHeader
        eyebrow="Mis Centros"
        title="Centros de cultivo"
        description="Gestiona tus centros de cultivo de moluscos"
        action={
          !showForm ? (
            <button
              onClick={() => {
                setEditingCentro(null)
                setShowForm(true)
                setError('')
              }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_0_22px_-6px_oklch(0.6_0.235_25_/_0.8)] transition-colors hover:bg-primary/85"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Centro</span>
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-foreground/90">
          {error}
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {editingCentro ? 'Editar Centro' : 'Nuevo Centro'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingCentro(null)
              }}
              className="text-muted-foreground transition-colors hover:text-foreground"
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : centros.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-14 text-center">
          <p className="text-sm text-muted-foreground">No tienes centros registrados</p>
          <button
            onClick={() => {
              setEditingCentro(null)
              setShowForm(true)
            }}
            className="mt-4 font-medium text-primary transition-colors hover:text-primary/80"
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
