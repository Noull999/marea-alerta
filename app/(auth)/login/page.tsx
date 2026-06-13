import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Waves } from 'lucide-react'

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    'use server'
    if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
      await signIn('google', { redirectTo: '/dashboard/alertas' })
    } else {
      await signIn('credentials', {
        email: 'demo@marea-alert.cl',
        redirect: true,
        redirectTo: '/dashboard/alertas'
      })
    }
  }

  return (
    <div className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient red tide glow */}
      <div className="pointer-events-none absolute -bottom-1/3 left-1/2 h-[60vh] w-[120vw] -translate-x-1/2 rounded-[100%] bg-primary/15 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-[0_0_40px_-6px_oklch(0.6_0.235_25_/_0.8)]">
            <Waves className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-foreground">
            Marea<span className="text-primary text-glow-red">Alerta</span>
          </h1>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Consola de Monitoreo · FAN
          </p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 p-6 ring-1 ring-foreground/5 backdrop-blur-sm">
          <div className="signal-line mb-6 h-px w-full opacity-60" />
          <p className="mb-5 text-center text-sm text-muted-foreground">
            Inicia sesión para ver el riesgo de marea roja en tus centros.
          </p>

          {!process.env.GOOGLE_ID && (
            <div className="mb-4 rounded-lg border border-primary/25 bg-primary/10 p-3 text-xs text-foreground/90">
              <p className="mb-1 font-mono font-semibold uppercase tracking-wider text-primary">
                Modo Demo
              </p>
              <p className="text-muted-foreground">
                Google OAuth no está configurado. Usando login de demostración.
              </p>
            </div>
          )}

          <form action={handleGoogleSignIn}>
            <Button type="submit" size="lg" className="h-11 w-full text-sm">
              {process.env.GOOGLE_ID ? 'Continuar con Google' : 'Ingresar (Demo)'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
          Los Lagos · Chile
        </p>
      </div>
    </div>
  )
}
