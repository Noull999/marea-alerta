import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { RiskMap } from '@/components/mapa/RiskMap'
import { AlertList } from '@/components/alertas/AlertList'
import { RecommendationCard } from '@/components/recomendaciones/RecommendationCard'
import { OceanographicDataPanel } from '@/components/oceanograficos/OceanographicDataPanel'

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

  const alertasRojas = alertas.filter((a) => a.nivel === 'ROJO').length
  const alertasAmarillas = alertas.filter((a) => a.nivel === 'AMARILLO').length

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Panel de Control
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-foreground">
            Riesgo de marea roja
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitoreo de FAN en tiempo real · Los Lagos, Chile
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            En vivo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 lg:col-span-1 lg:grid-cols-1 lg:gap-4">
          <StatCard
            label="Tus Centros"
            value={centrosUsuario.length}
            tone="neutral"
          />
          <StatCard
            label="Alertas Activas"
            value={alertasRojas}
            tone="danger"
          />
          <StatCard
            label="En Precaución"
            value={alertasAmarillas}
            tone="warning"
          />
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-border bg-card ring-1 ring-foreground/5">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="font-heading text-sm font-semibold text-foreground">
                Mapa de Riesgo
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {Array.isArray(zonas?.zonas) ? zonas.zonas.length : 0} zonas
              </span>
            </div>
            <div className="p-3 sm:p-4">
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
                <div className="flex h-96 items-center justify-center rounded-lg bg-muted/40 md:h-[500px]">
                  <p className="text-sm text-muted-foreground">Cargando datos de zonas...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Datos Oceanográficos Detallados */}
      {centrosUsuario.length > 0 && (
        <div>
          <SectionHeading
            title="Datos Oceanográficos"
            meta={centrosUsuario[0].nombre}
          />
          <OceanographicDataPanel
            lat={centrosUsuario[0].latitud}
            lon={centrosUsuario[0].longitud}
            zona={centrosUsuario[0].nombre}
          />
        </div>
      )}

      {/* Recomendaciones para tus Centros */}
      {centrosUsuario.length > 0 && (
        <div>
          <SectionHeading title="Recomendaciones para tus Centros" />
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
      <div>
        <SectionHeading title="Alertas Recientes" />
        <div className="rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5 sm:p-6">
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
    </div>
  )
}

const TONE_STYLES = {
  neutral: { value: 'text-foreground', bar: 'bg-muted-foreground/40' },
  danger: { value: 'text-primary', bar: 'bg-primary' },
  warning: { value: 'text-amber-400', bar: 'bg-amber-400' },
} as const

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: keyof typeof TONE_STYLES
}) {
  const styles = TONE_STYLES[tone]
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5 transition-colors hover:border-foreground/15 lg:p-5">
      <span className={`absolute left-0 top-0 h-full w-[3px] ${styles.bar}`} />
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground lg:text-xs">
        {label}
      </p>
      <p className={`mt-2 font-heading text-3xl font-bold tabular-nums lg:text-4xl ${styles.value}`}>
        {value}
      </p>
    </div>
  )
}

function SectionHeading({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="h-4 w-1 rounded-full bg-primary" />
      <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
      {meta && (
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          · {meta}
        </span>
      )}
    </div>
  )
}
