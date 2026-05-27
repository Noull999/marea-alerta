import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function Home() {
  try {
    const authPromise = auth()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 5000)
    )
    const session = await Promise.race([authPromise, timeoutPromise])

    if (session?.user) {
      redirect('/dashboard/alertas')
    } else {
      redirect('/login')
    }
  } catch (error) {
    // Si hay error o timeout en auth, redirigir a login
    redirect('/login')
  }
}
