'use client'

import Link from 'next/link'
import { Route } from 'next'
import { usePathname } from 'next/navigation'
import {
  MapPin,
  AlertTriangle,
  BookOpen,
  MessageSquare,
  Settings,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

const PRIMARY: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: MapPin },
  { href: '/dashboard/alertas', label: 'Alertas', icon: AlertTriangle },
  { href: '/dashboard/centros', label: 'Mis Centros', icon: MapPin },
  { href: '/dashboard/oceanografico', label: 'Oceanografía', icon: Waves },
  { href: '/dashboard/bitacora', label: 'Bitácora', icon: BookOpen },
  { href: '/dashboard/asistente', label: 'Asistente', icon: MessageSquare },
]

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href as Route}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
        active
          ? 'bg-accent text-foreground'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      )}
    >
      {/* Active marker — red signal bar on the rail */}
      <span
        className={cn(
          'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary transition-opacity',
          active ? 'opacity-100' : 'opacity-0'
        )}
      />
      <Icon
        className={cn(
          'h-[18px] w-[18px] flex-shrink-0 transition-colors',
          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )}
      />
      <span className="text-sm font-medium">{item.label}</span>
    </Link>
  )
}

export function DashboardNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <nav className="space-y-1">
      <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
        Monitoreo
      </p>
      {PRIMARY.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(item.href)} />
      ))}
      <div className="my-3 h-px bg-border" />
      <NavLink
        item={{ href: '/dashboard/configuracion', label: 'Configuración', icon: Settings }}
        active={isActive('/dashboard/configuracion')}
      />
    </nav>
  )
}
