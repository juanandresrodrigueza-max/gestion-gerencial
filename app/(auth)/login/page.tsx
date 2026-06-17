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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            G
          </div>
          <h1 className="text-2xl font-bold text-white">Gestión Gerencial</h1>
          <p className="text-blue-300 text-sm mt-1">Bigsys — Panel de control</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@bigsys.com.ar" required autoFocus
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button type="submit" disabled={cargando}
            className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60
              disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm">
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-xs text-center text-gray-400 pt-1">
            Si olvidaste tu contraseña, contactá al administrador.
          </p>
        </form>

        <p className="text-center text-blue-400 text-xs mt-6">
          Bigsys © 2025 — Plataforma de Gestión Gerencial
        </p>
      </div>
    </div>
  )
}
