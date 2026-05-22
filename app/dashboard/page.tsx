import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600 mt-1">Hola {session.user.name || session.user.email}</p>
        <p className="text-gray-600 mt-4">La página se está cargando...</p>
      </div>
    </div>
  )
}
