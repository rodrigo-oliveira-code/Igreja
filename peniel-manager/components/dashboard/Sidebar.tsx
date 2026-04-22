'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  CalendarCheck,
  DollarSign,
  Settings,
  Church,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/membros', label: 'Membros', icon: Users },
  { href: '/departamentos', label: 'Departamentos', icon: Building2 },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/escalas', label: 'Escalas', icon: CalendarCheck },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-purple-900 text-white flex flex-col">
      <div className="p-6 border-b border-purple-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Church className="w-6 h-6 text-purple-900" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">Peniel Church</h1>
            <p className="text-purple-300 text-xs">Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-purple-700 text-white'
                  : 'text-purple-200 hover:bg-purple-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-purple-800">
        <p className="text-purple-400 text-xs text-center">Peniel Church Manager v1.0</p>
      </div>
    </aside>
  )
}
