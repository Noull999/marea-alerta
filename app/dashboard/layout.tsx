import { ReactNode } from 'react'
import Link from 'next/link'
import { Route } from 'next'
import { auth } from '@/lib/auth'
import { signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MapPin, AlertTriangle, BookOpen, MessageSquare, LogOut, Settings } from 'lucide-react'

async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">MareaAlerta</h1>
          </div>
          <form
            action={async () => {
              'use server'
              await signOut()
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition active:bg-gray-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Salir</span>
            </button>
          </form>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Sidebar */}
          <nav className="lg:col-span-1">
            <div className="sticky top-24 space-y-1">
              <Link
                href={"/" as Route}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition active:bg-gray-200"
              >
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium hidden sm:inline">Inicio</span>
              </Link>
              <Link
                href={"/alertas" as Route}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition active:bg-gray-200"
              >
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium hidden sm:inline">Alertas</span>
              </Link>
              <Link
                href={"/centros" as Route}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition active:bg-gray-200"
              >
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium hidden sm:inline">Mis Centros</span>
              </Link>
              <Link
                href={"/bitacora" as Route}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition active:bg-gray-200"
              >
                <BookOpen className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium hidden sm:inline">Bitácora</span>
              </Link>
              <Link
                href={"/asistente" as Route}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition active:bg-gray-200"
              >
                <MessageSquare className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium hidden sm:inline">Asistente</span>
              </Link>
              <div className="border-t border-gray-200 my-2 pt-2">
                <Link
                  href={"/configuracion" as Route}
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition active:bg-gray-200"
                >
                  <Settings className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium hidden sm:inline">Configuración</span>
                </Link>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="lg:col-span-4">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
