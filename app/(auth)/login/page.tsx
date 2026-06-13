import Link from 'next/link'
import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Waves, AlertTriangle } from 'lucide-react'

// Google se considera configurado con cualquiera de los dos esquemas de nombres
// (next-auth v5 usa AUTH_GOOGLE_*; el proyecto también soporta GOOGLE_*).
const googleConfigured = Boolean(
  (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) ||
    (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)
)

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

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

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                No se pudo iniciar sesión con ese método. Prueba el acceso en modo Demo.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {/* Google: para usuarios autorizados */}
            {googleConfigured && (
              <form action={handleGoogleSignIn}>
                <Button type="submit" size="lg" className="h-11 w-full text-sm">
                  Continuar con Google
                </Button>
              </form>
            )}

            {/* Demo: acceso fiable, siempre disponible */}
            <form action={handleDemoSignIn}>
              <Button
                type="submit"
                size="lg"
                variant={googleConfigured ? 'outline' : 'default'}
                className="h-11 w-full text-sm"
              >
                Ingresar en modo Demo
              </Button>
            </form>
          </div>
        </div>

        <Link
          href="/inicio"
          className="mt-6 block text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 transition-colors hover:text-primary"
        >
          ¿Qué es MareaAlerta? →
        </Link>

        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/40">
          Los Lagos · Chile
        </p>
      </div>
    </div>
  )
}
