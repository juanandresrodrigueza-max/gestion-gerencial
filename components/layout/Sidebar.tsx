'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const NAV = [
  { href: '/',               label: 'Dashboard',      icon: '🏠' },
  { href: '/empresa',        label: 'Empresa',        icon: '🏢' },
  { href: '/comercial',      label: 'Comercial',      icon: '📊' },
  { href: '/administracion', label: 'Administración', icon: '💼' },
  { href: '/reactivacion',   label: 'Reactivación',   icon: '🔄' },
  { href: '/soporte',        label: 'Soporte',        icon: '🛠️' },
  { href: '/distribuidores', label: 'Distribuidores', icon: '🤝' },
  { href: '/reuniones',      label: 'Reuniones',      icon: '📋' },
  { href: '/alertas',        label: 'Alertas',        icon: '🔔' },
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
        .from('usuarios').select('nombre, rol').eq('id', user.id).single()
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
    <aside className="w-56 shrink-0 min-h-screen flex flex-col bg-white border-r border-gray-100">

      {/* Header con degradado BigSys */}
      <div className="px-4 py-5" style={{ background: 'linear-gradient(135deg, #e4003f 0%, #a42785 50%, #4f3089 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="text-white font-black text-base tracking-tighter">BS</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">BigSys</p>
            <p className="text-white/60 text-xs">Gestión Gerencial</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const activo = path === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activo
                  ? 'text-white font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              style={activo ? {
                background: 'linear-gradient(135deg, #e4003f 0%, #a42785 100%)',
              } : {}}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Usuario + cerrar sesión */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-2">
        {usuario && (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #e4003f, #4f3089)' }}>
              {usuario.nombre.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{usuario.nombre}</p>
              <p className="text-xs text-gray-400 capitalize">{usuario.rol}</p>
            </div>
          </div>
        )}
        <button onClick={cerrarSesion}
          className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
