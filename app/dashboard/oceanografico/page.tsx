import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { OceanographicDataPanel } from '@/components/oceanograficos/OceanographicDataPanel'
import { PageHeader } from '@/components/dashboard/PageHeader'

// Zonas predefinidas de Chiloé para análisis
const ZONAS_PREDEFINIDAS = [
  { nombre: 'Castro', lat: -42.48, lon: -73.77 },
  { nombre: 'Ancud', lat: -41.87, lon: -73.82 },
  { nombre: 'Quellón', lat: -43.12, lon: -73.62 },
  { nombre: 'Dalcahue', lat: -42.39, lon: -73.69 },
  { nombre: 'Puerto Montt', lat: -41.33, lon: -72.76 },
  { nombre: 'La Unión', lat: -40.31, lon: -72.24 },
  { nombre: 'Puerto Varas', lat: -41.31, lon: -72.59 },
  { nombre: 'Osorno', lat: -40.58, lon: -72.53 },
]

export default async function OceanograficoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const centrosUsuario = await db.centro.findMany({
    where: { userId: session.user.id },
  })

  // Usar los centros del usuario, o las zonas predefinidas si no tiene
  const zonasAMostrar = centrosUsuario.length > 0
    ? centrosUsuario.map((c) => ({
        nombre: c.nombre,
        lat: c.latitud,
        lon: c.longitud,
      }))
    : ZONAS_PREDEFINIDAS

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Análisis Oceanográfico"
        title="Datos integrados del mar"
        description="Fuentes combinadas: Copernicus, NOAA HAB, IFOP y SHOA"
      />

      <div className="grid grid-cols-1 gap-6">
        {zonasAMostrar.map((zona) => (
          <div key={`${zona.lat}-${zona.lon}`}>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-4 w-1 rounded-full bg-primary" />
              <h2 className="font-heading text-xl font-semibold text-foreground">{zona.nombre}</h2>
              <p className="font-mono text-xs tabular-nums text-muted-foreground">
                {zona.lat.toFixed(2)}°, {zona.lon.toFixed(2)}°
              </p>
            </div>
            <OceanographicDataPanel
              lat={zona.lat}
              lon={zona.lon}
              zona={zona.nombre}
            />
          </div>
        ))}
      </div>

      {/* Information Footer */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5">
        <h3 className="mb-3 font-heading font-semibold text-foreground">Fuentes de Datos</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Copernicus Marine:</span> Temperatura superficial del mar (TSM),
            anomalías de temperatura y concentración de clorofila-a
          </li>
          <li>
            <span className="font-medium text-foreground">NOAA HAB:</span> Pronósticos de mareas rojas y probabilidad
            de floraciones de algas nocivas
          </li>
          <li>
            <span className="font-medium text-foreground">IFOP:</span> Monitoreo de mareas rojas con niveles de
            toxicidad y alertas sanitarias de Chile
          </li>
          <li>
            <span className="font-medium text-foreground">SHOA:</span> Predicciones de mareas, estado del mar y
            recomendaciones de navegación
          </li>
        </ul>
      </div>

      {/* Risk Level Guide */}
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/5">
        <h3 className="mb-4 font-heading font-semibold text-foreground">Guía de Niveles de Riesgo</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border-l-2 border-emerald-500 bg-emerald-500/10 p-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-300">VERDE · Riesgo Bajo</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Condiciones oceanográficas normales. Continúe con operaciones habituales y monitoreo
              rutinario.
            </p>
          </div>
          <div className="rounded-lg border-l-2 border-amber-500 bg-amber-500/10 p-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-300">AMARILLO · Riesgo Moderado</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Se detectan factores de riesgo moderados. Monitoree continuamente y esté preparado
              para acciones defensivas.
            </p>
          </div>
          <div className="rounded-lg border-l-2 border-red-500 bg-red-500/10 p-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-red-300">ROJO · Riesgo Alto</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Múltiples factores de riesgo detectados. Considere cosecha inmediata o solicite
              confirmación oficial.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
