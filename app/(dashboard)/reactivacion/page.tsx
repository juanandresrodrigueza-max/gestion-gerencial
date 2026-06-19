'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReactivacionPage() {
  const [form, setForm] = useState({
    clientes_contactados: '', clientes_localizados: '', clientes_no_localizados: '',
    clientes_recuperados: '', clientes_actualizados: '', oportunidades_detectadas: '',
    ingresos_recuperados: '', observaciones: ''
  })
  const [estado, setEstado] = useState<'idle'|'guardando'|'ok'|'error'>('idle')

  const contactados = parseInt(form.clientes_contactados) || 0
  const recuperados = parseInt(form.clientes_recuperados) || 0
  const tasaRec = contactados > 0 ? ((recuperados / contactados) * 100).toFixed(1) + '%' : '—'

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setEstado('guardando')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')
      const { data: semana } = await supabase.rpc('get_or_create_semana')
      const { error } = await supabase.from('carga_reactivacion').upsert({
        semana_id: semana, usuario_id: user.id,
        clientes_contactados: parseInt(form.clientes_contactados)||0,
        clientes_localizados: parseInt(form.clientes_localizados)||0,
        clientes_no_localizados: parseInt(form.clientes_no_localizados)||0,
        clientes_recuperados: parseInt(form.clientes_recuperados)||0,
        clientes_actualizados: parseInt(form.clientes_actualizados)||0,
        oportunidades_detectadas: parseInt(form.oportunidades_detectadas)||0,
        ingresos_recuperados: parseFloat(form.ingresos_recuperados)||0,
        observaciones: form.observaciones
      }, { onConflict: 'semana_id' })
      if (error) throw error
      setEstado('ok')
      setTimeout(() => setEstado('idle'), 3000)
    } catch { setEstado('error') }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">🔄 Reactivación y Customer Success</h1>
      <p className="text-sm text-gray-400 mb-4">Carga semanal de gestión de cartera.</p>

      <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center mb-6">
        <div className="text-2xl font-bold text-purple-700">{tasaRec}</div>
        <div className="text-xs text-purple-600">Tasa de recuperación (calculada automáticamente)</div>
      </div>

      <form onSubmit={guardar} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['clientes_contactados','Clientes contactados','Total de clientes a los que se intentó contactar.'],
            ['clientes_localizados','Clientes localizados','Con quienes se logró comunicación efectiva.'],
            ['clientes_no_localizados','Clientes no localizados','Sin respuesta obtenida.'],
            ['clientes_recuperados','Clientes recuperados','Que retomaron el servicio esta semana.'],
            ['clientes_actualizados','Clientes actualizados de versión','Migrados o actualizados.'],
            ['oportunidades_detectadas','Oportunidades detectadas','Clientes inactivos con potencial.'],
            ['ingresos_recuperados','Ingresos recuperados ($)','Monto generado por reactivaciones.'],
          ].map(([k, label, ayuda]) => (
            <div key={k}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
              <input type="number" min="0" step={k === 'ingresos_recuperados' ? '0.01' : '1'}
                value={(form as any)[k]} onChange={set(k)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
              <p className="text-xs text-gray-400 mt-0.5">{ayuda}</p>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea rows={3} value={form.observaciones} onChange={set('observaciones')}
            placeholder="Novedades de la semana..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none" />
        </div>
        <button type="submit" disabled={estado === 'guardando'}
          className="w-full py-3 text-white font-bold rounded-xl transition-all disabled:opacity-60 hover:shadow-lg text-sm"
          style={{ background: 'linear-gradient(135deg, #e4003f 0%, #a42785 50%, #4f3089 100%)' }}>
          {estado === 'guardando' ? 'Guardando...' : estado === 'ok' ? '✓ Guardado' : 'Guardar carga semanal'}
        </button>
        {estado === 'error' && <p className="text-sm text-red-600 text-center">Error al guardar.</p>}
      </form>
    </div>
  )
}
