import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🦪</div>
          <CardTitle className="text-2xl">MareaAlerta</CardTitle>
          <p className="text-sm text-muted-foreground">Regístrate para empezar</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 text-center">
            El registro está disponible mediante Google OAuth por ahora.
          </p>
          <Link href="/login">
            <Button className="w-full">Ir a Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
