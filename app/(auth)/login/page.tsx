import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🦪</div>
          <CardTitle className="text-2xl">MareaAlerta</CardTitle>
          <p className="text-sm text-muted-foreground">Inicia sesión para ver tus alertas</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {!process.env.GOOGLE_ID && (
            <div className="p-3 bg-blue-100 border border-blue-300 rounded text-xs text-blue-800">
              <p className="font-semibold mb-1">⚠️ Modo Demo</p>
              <p>Google OAuth no está configurado. Usando login de demostración.</p>
            </div>
          )}
          <form action={handleGoogleSignIn}>
            <Button type="submit" className="w-full" variant="outline">
              {process.env.GOOGLE_ID ? 'Continuar con Google' : 'Ingresar (Demo)'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
