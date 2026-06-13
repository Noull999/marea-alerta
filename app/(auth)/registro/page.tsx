import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Waves } from 'lucide-react'

export default function RegistroPage() {
  return (
    <div className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute -bottom-1/3 left-1/2 h-[60vh] w-[120vw] -translate-x-1/2 rounded-[100%] bg-primary/15 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-[0_0_40px_-6px_oklch(0.6_0.235_25_/_0.8)]">
            <Waves className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-foreground">
            Marea<span className="text-primary text-glow-red">Alerta</span>
          </h1>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Crear cuenta
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 p-6 ring-1 ring-foreground/5 backdrop-blur-sm">
          <div className="signal-line mb-6 h-px w-full opacity-60" />
          <p className="mb-5 text-center text-sm text-muted-foreground">
            El registro está disponible mediante Google OAuth por ahora.
          </p>
          <Link href="/login">
            <Button size="lg" className="h-11 w-full text-sm">Ir a Login</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
