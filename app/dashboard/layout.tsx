import { ReactNode } from 'react'
import { auth } from '@/lib/auth'
import { signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogOut, Waves } from 'lucide-react'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="grain relative flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-[0_0_22px_-4px_oklch(0.6_0.235_25_/_0.7)]">
              <Waves className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-none">
              <h1 className="font-heading text-lg font-bold tracking-tight text-foreground">
                Marea<span className="text-primary">Alerta</span>
              </h1>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Consola de Monitoreo · FAN
              </p>
            </div>
          </div>
          <form
            action={async () => {
              'use server'
              await signOut()
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </form>
        </div>
        {/* Red signal line — the memorable anchor under the header */}
        <div className="signal-line h-px w-full opacity-70" />
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <DashboardNav />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-4 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
