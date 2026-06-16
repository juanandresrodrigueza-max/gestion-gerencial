'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',               label: 'Dashboard',      icon: '🏠' },
  { href: '/empresa',        label: 'Empresa',         icon: '🏢' },
  { href: '/comercial',      label: 'Comercial',       icon: '📊' },
  { href: '/administracion', label: 'Administración',  icon: '💼' },
  { href: '/reactivacion',   label: 'Reactivación',    icon: '🔄' },
  { href: '/soporte',        label: 'Soporte',         icon: '🛠️' },
  { href: '/reuniones',      label: 'Reuniones',       icon: '📋' },
  { href: '/alertas',        label: 'Alertas',         icon: '🔔' },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-52 shrink-0 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center text-white text-xs font-bold">G</div>
          <span className="text-sm font-semibold text-gray-900">Gestión</span>
        </div>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
              path === item.href
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
