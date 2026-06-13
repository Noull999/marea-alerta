import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Waves,
  Clock,
  Database,
  Bell,
  Map,
  ShieldCheck,
  Fish,
  Building2,
  Anchor,
  Landmark,
  Thermometer,
  Droplets,
  Activity,
  ArrowRight,
} from 'lucide-react'

export const metadata = {
  title: 'MareaAlerta — Anticipa la marea roja antes de que llegue',
  description:
    'Plataforma de monitoreo de floraciones algales nocivas (FAN / marea roja) para la acuicultura. Riesgo por zona con 14–21 días de anticipación, datos oceanográficos integrados y alertas en tiempo real.',
}

const FEATURES = [
  {
    icon: Clock,
    title: '14–21 días de anticipación',
    body: 'Modelo de riesgo de 3 factores que proyecta la probabilidad de marea roja con semanas de adelanto, no cuando ya es tarde.',
  },
  {
    icon: Database,
    title: 'Datos integrados',
    body: 'Combina fuentes oficiales —Copernicus Marine, NOAA HAB, IFOP y SHOA— en una sola evaluación coherente por zona.',
  },
  {
    icon: Bell,
    title: 'Alertas en tiempo real',
    body: 'Notificaciones push cuando el nivel de riesgo cambia en tus centros. Configura qué niveles quieres recibir.',
  },
  {
    icon: Map,
    title: 'Mapa de riesgo por zona',
    body: 'Visualiza el estado de cada zona y centro de cultivo con un semáforo claro: verde, amarillo, rojo.',
  },
  {
    icon: ShieldCheck,
    title: 'Recomendaciones accionables',
    body: 'Cada nivel viene con una acción concreta: monitorear, prepararse o evaluar cosecha inmediata.',
  },
  {
    icon: Activity,
    title: 'Bitácora y seguimiento',
    body: 'Registra tus observaciones de campo y mantén un historial de eventos y decisiones por centro.',
  },
]

const FACTORS = [
  { icon: Thermometer, label: 'Temperatura del mar', detail: 'TSM y anomalías térmicas' },
  { icon: Droplets, label: 'Clorofila-a', detail: 'Indicador de biomasa algal' },
  { icon: Waves, label: 'Condiciones del mar', detail: 'Oleaje, vientos y mareas' },
]

const AUDIENCES = [
  {
    icon: Fish,
    title: 'Cultores de moluscos',
    body: 'Mitilicultores y centros de cultivo que necesitan decidir cuándo cosechar o proteger su producción.',
  },
  {
    icon: Building2,
    title: 'Empresas acuícolas',
    body: 'Operaciones con múltiples centros que requieren monitoreo regional y trazabilidad de riesgo.',
  },
  {
    icon: Anchor,
    title: 'Pescadores artesanales',
    body: 'Comunidades costeras expuestas a vedas por toxinas marinas que afectan su sustento.',
  },
  {
    icon: Landmark,
    title: 'Autoridades sanitarias',
    body: 'Equipos de SERNAPESCA, SUBPESCA y salud que vigilan vedas y alertas sanitarias.',
  },
]

export default function InicioPage() {
  return (
    <div className="grain relative min-h-screen overflow-hidden bg-background">
      {/* Ambient red tide glow */}
      <div className="pointer-events-none absolute -top-1/4 left-1/2 h-[70vh] w-[120vw] -translate-x-1/2 rounded-[100%] bg-primary/12 blur-[130px]" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-[0_0_22px_-4px_oklch(0.6_0.235_25_/_0.7)]">
            <Waves className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            Marea<span className="text-primary">Alerta</span>
          </span>
        </div>
        <Link href="/login">
          <Button variant="outline" size="lg" className="h-10 text-sm">
            Ingresar
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-16 pt-12 text-center sm:px-8 sm:pt-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
          Monitoreo de FAN · Marea Roja
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          Anticipa la marea roja
          <span className="block text-primary text-glow-red">antes de que llegue</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Plataforma de monitoreo de floraciones algales nocivas para la acuicultura.
          Evalúa el riesgo de marea roja por zona con <strong className="font-semibold text-foreground">14 a 21 días de anticipación</strong>,
          integrando datos oceanográficos oficiales y alertas en tiempo real.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="h-12 w-full px-7 text-sm sm:w-auto">
              Probar en modo Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#que-hace" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="h-12 w-full px-7 text-sm sm:w-auto">
              Conocer más
            </Button>
          </a>
        </div>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
          Los Lagos · Chile · Acuicultura de moluscos
        </p>
      </section>

      {/* What it does */}
      <section id="que-hace" className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-primary" />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Qué hace</p>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Una consola de monitoreo, no una alarma tardía
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/5 transition-colors hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3-factor model */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card/60 p-6 ring-1 ring-foreground/5 sm:p-9">
          <div className="signal-line mb-7 h-px w-full opacity-50" />
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">El modelo</p>
              <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Riesgo calculado con 3 factores
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                MareaAlerta cruza variables oceanográficas que preceden a una floración algal,
                generando un nivel de riesgo por zona antes de que la marea roja sea visible.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {FACTORS.map(({ icon: Icon, label, detail }) => (
                <div key={label} className="rounded-xl border border-border bg-background/40 p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-heading text-sm font-semibold text-foreground">{label}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who it helps */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-primary" />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">A quién ayuda</p>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Pensada para quienes viven del mar
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-8 text-center ring-1 ring-foreground/5 sm:p-12">
          <div className="pointer-events-none absolute -bottom-1/2 left-1/2 h-[50vh] w-[80%] -translate-x-1/2 rounded-[100%] bg-primary/15 blur-[90px]" />
          <div className="relative">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
              Mira el riesgo de tu zona ahora
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Entra en modo demostración y explora el mapa, las alertas y los datos oceanográficos
              sin necesidad de configurar nada.
            </p>
            <Link href="/login" className="mt-7 inline-block">
              <Button size="lg" className="h-12 px-8 text-sm">
                Ingresar a MareaAlerta
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-primary" />
            <span className="font-heading text-sm font-semibold text-foreground">
              Marea<span className="text-primary">Alerta</span>
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
            Monitoreo de FAN · Los Lagos, Chile
          </p>
        </div>
      </footer>
    </div>
  )
}
