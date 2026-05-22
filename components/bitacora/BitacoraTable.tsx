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
          <div key={i} className="h-12 bg-gray-200 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!entries.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Sin registros en la bitácora</p>
      </div>
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'ROJO': return 'bg-red-100 text-red-800'
      case 'AMARILLO': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left px-4 py-3 font-semibold text-gray-700">
              Fecha
            </th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">
              Riesgo
            </th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">
              Observación
            </th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">
              Recomendación
            </th>
            {onDelete && (
              <th className="text-center px-4 py-3 font-semibold text-gray-700">
                Acción
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900">
                {new Date(entry.fecha).toLocaleDateString('es-CL')}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(
                    entry.riesgo
                  )}`}
                >
                  {entry.riesgo}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                {entry.observacion}
              </td>
              <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                {entry.recomendacion}
              </td>
              {onDelete && (
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition inline-block"
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
