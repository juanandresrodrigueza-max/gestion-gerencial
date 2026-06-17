'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const NAV = [
  { href: '/',                label: 'Dashboard',      icon: '🏠' },
  { href: '/empresa',         label: 'Empresa',        icon: '🏢' },
  { href: '/comercial',       label: 'Comercial',      icon: '📊' },
  { href: '/administracion',  label: 'Administración', icon: '💼' },
  { href: '/reactivacion',    label: 'Reactivación',   icon: '🔄' },
  { href: '/soporte',         label: 'Soporte',        icon: '🛠️' },
  { href: '/distribuidores',  label: 'Distribuidores', icon: '🤝' },
  { href: '/reuniones',       label: 'Reuniones',      icon: '📋' },
  { href: '/alertas',         label: 'Alertas',        icon: '🔔' },
]

export function Sidebar() {
  const path   = usePathname()
  const router = useRouter()
  const [usuario, setUsuario] = useState<{ nombre: string; rol: string } | null>(null)

  useEffect(() => {
    async function cargar() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('usuarios')
        .select('nombre, rol')
        .eq('id', user.id)
        .single()
      if (data) setUsuario(data)
    }
    cargar()
  }, [])

  async function cerrarSesion() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-52 shrink-0 bg-white border-r border-gray-100 min-h-screen flex flex-col">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center text-white text-xs font-bold">
            G
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Gestión</p>
            <p className="text-xs text-gray-400">Bigsys</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
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

      {/* Usuario + cerrar sesión */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-2">
        {usuario && (
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
              {usuario.nombre.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{usuario.nombre}</p>
              <p className="text-xs text-gray-400 capitalize">{usuario.rol}</p>
            </div>
          </div>
        )}
        <button onClick={cerrarSesion}
          className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
