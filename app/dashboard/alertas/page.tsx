import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { AlertList } from '@/components/alertas/AlertList'
import { PageHeader } from '@/components/dashboard/PageHeader'

export default async function AlertasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  let alertas: Awaited<ReturnType<typeof db.alerta.findMany>> = []
  try {
    alertas = await db.alerta.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (err) {
    console.error('Error fetching alertas:', err)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Alertas"
        title="Historial de riesgo"
        description="Todas las alertas de riesgo de marea roja registradas"
      />

      <div className="rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/5 sm:p-6">
        <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-lg border-l-2 border-red-500 bg-red-500/10 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Críticas</p>
            <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-red-400">
              {alertas.filter((a) => a.nivel === 'ROJO').length}
            </p>
          </div>
          <div className="rounded-lg border-l-2 border-amber-500 bg-amber-500/10 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Precaución</p>
            <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-amber-400">
              {alertas.filter((a) => a.nivel === 'AMARILLO').length}
            </p>
          </div>
          <div className="rounded-lg border-l-2 border-emerald-500 bg-emerald-500/10 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Sin Riesgo</p>
            <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-emerald-400">
              {alertas.filter((a) => a.nivel === 'VERDE').length}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-6">
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
