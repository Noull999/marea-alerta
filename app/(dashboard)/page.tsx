import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { RiskMap } from '@/components/mapa/RiskMap'
import { AlertList } from '@/components/alertas/AlertList'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [zonas, centrosUsuario, alertas] = await Promise.all([
    fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/fan-data`)
      .then((r) => r.json())
      .catch(() => ({ zonas: [] })),
    db.centro.findMany({
      where: { userId: session.user.id },
    }).catch((err: any) => {
      console.error('Error fetching centros:', err)
      return []
    }),
    db.alerta.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }).catch((err: any) => {
      console.error('Error fetching alertas:', err)
      return []
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600 mt-1">Monitoreo de riesgo de marea roja en tiempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-sm font-medium">Tus Centros</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {centrosUsuario.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-sm font-medium">Alertas Activas</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {alertas.filter((a) => a.nivel === 'ROJO').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-sm font-medium">En Precaución</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {alertas.filter((a) => a.nivel === 'AMARILLO').length}
            </p>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mapa de Riesgo</h2>
            <RiskMap
              zonas={zonas.zonas || []}
              centrosUsuario={centrosUsuario.map((c) => ({
                id: c.id,
                nombre: c.nombre,
                latitud: c.latitud,
                longitud: c.longitud,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recientes</h2>
        <AlertList
          alertas={alertas.map((a) => ({
            id: a.id,
            zona: a.zona,
            nivel: a.nivel as any,
            descripcion: a.mensaje,
            createdAt: a.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}
