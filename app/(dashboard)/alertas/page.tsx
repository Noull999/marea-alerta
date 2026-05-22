import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { AlertList } from '@/components/alertas/AlertList'

export default async function AlertasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const alertas = await db.alerta.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
        <p className="text-gray-600 mt-1">Historial de todas las alertas de riesgo de marea roja</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-gray-600 text-sm font-medium">Críticas</p>
            <p className="text-2xl font-bold text-red-600">
              {alertas.filter((a) => a.nivel === 'ROJO').length}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Precaución</p>
            <p className="text-2xl font-bold text-yellow-600">
              {alertas.filter((a) => a.nivel === 'AMARILLO').length}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Sin Riesgo</p>
            <p className="text-2xl font-bold text-green-600">
              {alertas.filter((a) => a.nivel === 'VERDE').length}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <AlertList
            alertas={alertas.map((a) => ({
              id: a.id,
              zona: a.zona,
              nivel: a.nivel as any,
              descripcion: a.descripcion,
              createdAt: a.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>
    </div>
  )
}
