'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/')
      router.refresh()
    } catch {
      setError('Email o contraseña incorrectos. Verificá tus datos.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #e4003f 0%, #a42785 50%, #4f3089 100%)' }}>

      <div className="w-full max-w-sm">

        {/* Logo BigSys */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-2xl mb-5">
            <span className="text-3xl font-black tracking-tighter"
              style={{ background: 'linear-gradient(135deg, #e4003f, #4f3089)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BS
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">BigSys</h1>
          <p className="text-white/70 text-sm mt-1">Panel de Gestión Gerencial</p>
        </div>

        {/* Card login */}
        <form onSubmit={handleLogin}
          className="bg-white rounded-3xl p-7 shadow-2xl space-y-4">

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Correo electrónico
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@bigsys.com.ar" required autoFocus
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl
                focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ '--tw-ring-color': '#a42785' } as any} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Contraseña
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl
                focus:outline-none focus:ring-2 focus:border-transparent transition-all" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={cargando}
            className="w-full py-3.5 text-white font-bold rounded-2xl transition-all
              disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg
              hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: 'linear-gradient(135deg, #e4003f 0%, #a42785 50%, #4f3089 100%)' }}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-xs text-center text-gray-400 pt-1">
            Si olvidaste tu contraseña, contactá al administrador.
          </p>
        </form>

        <p className="text-center text-white/40 text-xs mt-6">
          BigSys © 2025 — Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
