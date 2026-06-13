import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Waves } from 'lucide-react'

export default function LoginPage() {
  const googleConfigured = Boolean(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET)

  const handleGoogleSignIn = async () => {
    'use server'
    await signIn('google', { redirectTo: '/dashboard' })
  }

  const handleDemoSignIn = async () => {
    'use server'
    await signIn('credentials', {
      email: 'demo@marea-alert.cl',
      redirect: true,
      redirectTo: '/dashboard',
    })
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

          <div className="space-y-3">
            {/* Demo: acceso fiable, siempre disponible */}
            <form action={handleDemoSignIn}>
              <Button type="submit" size="lg" className="h-11 w-full text-sm">
                Ingresar en modo Demo
              </Button>
            </form>

            {/* Google: opción secundaria, solo si está configurado */}
            {googleConfigured && (
              <>
                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-border" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    o
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <form action={handleGoogleSignIn}>
                  <Button
                    type="submit"
                    size="lg"
                    variant="outline"
                    className="h-11 w-full text-sm"
                  >
                    Continuar con Google
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
          Los Lagos · Chile
        </p>
      </div>
    </div>
  )
}
