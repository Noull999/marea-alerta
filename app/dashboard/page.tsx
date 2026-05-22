import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { RiskMap } from '@/components/mapa/RiskMap'
import { AlertList } from '@/components/alertas/AlertList'
import { RecommendationCard } from '@/components/recomendaciones/RecommendationCard'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  let centrosUsuario: Awaited<ReturnType<typeof db.centro.findMany>> = []
  let alertas: Awaited<ReturnType<typeof db.alerta.findMany>> = []
  let zonas: any = { zonas: [] }

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const results = await Promise.all([
      fetch(`${baseUrl}/api/fan-data`)
        .then((r) => {
          if (!r.ok) {
            console.warn(`fan-data request failed: ${r.status}`)
            return { zonas: [] }
          }
          return r.json()
        })
        .catch((err) => {
          console.error('Error fetching fan-data:', err)
          return { zonas: [] }
        }),
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
    zonas = results[0]
    centrosUsuario = results[1]
    alertas = results[2]
    console.log('Dashboard data loaded:', {
      zonas: zonas?.zonas?.length || 0,
      centros: centrosUsuario.length,
      alertas: alertas.length,
    })
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }

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
            {zonas?.zonas ? (
              <RiskMap
                zonas={Array.isArray(zonas.zonas) ? zonas.zonas : []}
                centrosUsuario={centrosUsuario.map((c) => ({
                  id: c.id,
                  nombre: c.nombre,
                  latitud: c.latitud,
                  longitud: c.longitud,
                }))}
              />
            ) : (
              <div className="h-96 md:h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Cargando datos de zonas...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recomendaciones para tus Centros */}
      {centrosUsuario.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recomendaciones para tus Centros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {centrosUsuario.map((centro) => {
              const zonaData = (zonas?.zonas || []).find(
                (z: any) =>
                  z.nombre.toLowerCase().includes(centro.nombre.toLowerCase()) ||
                  (Math.abs(z.lat - centro.latitud) < 0.5 &&
                    Math.abs(z.lon - centro.longitud) < 0.5)
              )

              return (
                <RecommendationCard
                  key={centro.id}
                  zona={centro.nombre}
                  nivel={zonaData?.nivel || 'VERDE'}
                  recomendacion={
                    zonaData?.recomendacion ||
                    'Monitorea constantemente las condiciones oceanográficas.'
                  }
                />
              )
            })}
          </div>
        </div>
      )}

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
