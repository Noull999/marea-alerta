import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🦪</div>
          <CardTitle className="text-2xl">MareaAlerta</CardTitle>
          <p className="text-sm text-muted-foreground">Inicia sesión para ver tus alertas</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={async () => {
            'use server'
            await signIn('google', { redirectTo: '/' })
          }}>
            <Button type="submit" className="w-full" variant="outline">
              Continuar con Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
