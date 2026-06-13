'use client'
import { useState, useEffect } from 'react'
import { BitacoraForm } from '@/components/bitacora/BitacoraForm'
import { BitacoraTable } from '@/components/bitacora/BitacoraTable'
import { PageHeader } from '@/components/dashboard/PageHeader'
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
      <PageHeader
        eyebrow="Bitácora"
        title="Registro de observaciones"
        description="Seguimiento de observaciones de campo"
        action={
          !showForm ? (
            <button
              onClick={() => {
                setShowForm(true)
                setError('')
              }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_0_22px_-6px_oklch(0.6_0.235_25_/_0.8)] transition-colors hover:bg-primary/85"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Registro</span>
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
            <h2 className="font-heading text-lg font-semibold text-foreground">Nuevo Registro</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground transition-colors hover:text-foreground"
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

      <div className="rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/5 sm:p-6">
        <BitacoraTable
          entries={entries}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  )
}
