import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function Home() {
  let session: { user?: unknown } | null = null

  try {
    const authPromise = auth()
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    )
    session = await Promise.race([authPromise, timeoutPromise])
  } catch {
    // Si hay error o timeout en auth, tratar como no autenticado.
  }

  // IMPORTANTE: redirect() lanza una excepción de control (NEXT_REDIRECT),
  // por eso debe invocarse FUERA del try/catch; de lo contrario el catch
  // capturaría el redirect de usuarios autenticados y los mandaría a /login.
  if (session?.user) {
    redirect('/dashboard/alertas')
  }
  redirect('/login')
}
