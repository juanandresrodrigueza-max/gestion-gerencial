'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const BS_BTN = "w-full py-3 text-white font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] text-sm"
const BS_INPUT = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a42785]/30 focus:border-[#a42785] transition-colors"
const BS_GRAD = { background: 'linear-gradient(135deg, #e4003f 0%, #a42785 50%, #4f3089 100%)' }
const BS_ACCENT = '#a42785'

export default function EmpresaPage() {
  const [form, setForm] = useState({
    clientes_activos: '', clientes_nuevos: '',
    clientes_perdidos: '', mrr: '', observaciones: ''
  })
  const [estado, setEstado] = useState<'idle'|'guardando'|'ok'|'error'>('idle')

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setEstado('guardando')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')
      const { data: semana } = await supabase.rpc('get_or_create_semana')
      const { error } = await supabase.from('carga_empresa').upsert({
        semana_id: semana, usuario_id: user.id,
        clientes_activos:  parseInt(form.clientes_activos)  || 0,
        clientes_nuevos:   parseInt(form.clientes_nuevos)   || 0,
        clientes_perdidos: parseInt(form.clientes_perdidos) || 0,
        mrr:               parseFloat(form.mrr)             || 0,
        observaciones:     form.observaciones
      }, { onConflict: 'semana_id' })
      if (error) throw error
      setEstado('ok')
      setTimeout(() => setEstado('idle'), 3000)
    } catch { setEstado('error') }
  }

  const campos = [
    { name: 'clientes_activos',  label: 'Clientes activos totales', ayuda: 'Total de clientes con el servicio activo al cierre de la semana.' },
    { name: 'clientes_nuevos',   label: 'Clientes nuevos',          ayuda: 'Clientes que se incorporaron durante la semana.' },
    { name: 'clientes_perdidos', label: 'Clientes perdidos',        ayuda: 'Clientes que dieron de baja el servicio esta semana.' },
    { name: 'mrr',               label: 'MRR actual ($)',           ayuda: 'Ingreso mensual recurrente total en pesos.' },
  ] as const

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="rounded-2xl p-5 text-white mb-6" style={BS_GRAD}>
        <h1 className="text-xl font-bold">🏢 Resumen General de la Empresa</h1>
        <p className="text-white/70 text-sm mt-0.5">Carga semanal — todos los lunes antes de las 10:00 hs.</p>
      </div>

      <form onSubmit={guardar} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {campos.map(c => (
            <div key={c.name}>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: BS_ACCENT }}>
                {c.label}
              </label>
              <input type="number" min="0"
                step={c.name === 'mrr' ? '0.01' : '1'}
                value={form[c.name]}
                onChange={e => setForm(f => ({ ...f, [c.name]: e.target.value }))}
                className={BS_INPUT} />
              <p className="text-xs text-gray-400 mt-0.5">{c.ayuda}</p>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: BS_ACCENT }}>
            Observaciones
          </label>
          <textarea rows={3}
            value={form.observaciones}
            onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
            placeholder="Comentarios relevantes de la semana..."
            className={BS_INPUT + " resize-none"} />
        </div>
        <button type="submit" disabled={estado === 'guardando'} className={BS_BTN} style={BS_GRAD}>
          {estado === 'guardando' ? 'Guardando...' : estado === 'ok' ? '✓ Guardado correctamente' : 'Guardar carga semanal'}
        </button>
        {estado === 'error' && <p className="text-sm text-red-600 text-center">Error al guardar. Verificá que estés conectado.</p>}
      </form>
    </div>
  )
}
