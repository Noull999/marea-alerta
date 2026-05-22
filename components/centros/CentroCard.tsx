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
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{centro.nombre}</h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>
              {centro.latitud.toFixed(4)}, {centro.longitud.toFixed(4)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(centro)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Editar"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(centro.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
