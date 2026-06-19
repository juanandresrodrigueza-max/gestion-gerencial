'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ComercialPage() {
  const [form, setForm] = useState({
    demos_realizadas: '', presupuestos_enviados: '', seguimientos_realizados: '',
    ventas_cerradas: '', monto_vendido: '', nuevos_clientes: '',
    pipeline_caliente: '', pipeline_tibio: '', pipeline_frio: '', observaciones: ''
  })
  const [estado, setEstado] = useState<'idle'|'guardando'|'ok'|'error'>('idle')

  const demos = parseInt(form.demos_realizadas) || 0
  const ventas = parseInt(form.ventas_cerradas) || 0
  const monto = parseFloat(form.monto_vendido) || 0
  const convDemo = demos > 0 ? ((ventas / demos) * 100).toFixed(1) + '%' : '—'
  const ticket = ventas > 0 ? '$' + (monto / ventas).toLocaleString('es-AR', { maximumFractionDigits: 0 }) : '—'
  const pipeline = (parseInt(form.pipeline_caliente)||0) + (parseInt(form.pipeline_tibio)||0) + (parseInt(form.pipeline_frio)||0)

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setEstado('guardando')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')
      const { data: semana } = await supabase.rpc('get_or_create_semana')
      const { error } = await supabase.from('carga_comercial').upsert({
        semana_id: semana, usuario_id: user.id,
        demos_realizadas: parseInt(form.demos_realizadas)||0,
        presupuestos_enviados: parseInt(form.presupuestos_enviados)||0,
        seguimientos_realizados: parseInt(form.seguimientos_realizados)||0,
        ventas_cerradas: parseInt(form.ventas_cerradas)||0,
        monto_vendido: parseFloat(form.monto_vendido)||0,
        nuevos_clientes: parseInt(form.nuevos_clientes)||0,
        pipeline_caliente: parseInt(form.pipeline_caliente)||0,
        pipeline_tibio: parseInt(form.pipeline_tibio)||0,
        pipeline_frio: parseInt(form.pipeline_frio)||0,
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">📊 Comercial — Carga semanal</h1>
      <p className="text-sm text-gray-400 mb-4">Registrá la actividad comercial de la semana.</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-green-700">{convDemo}</div>
          <div className="text-xs text-green-600">Conv. demo→venta</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-green-700">{ticket}</div>
          <div className="text-xs text-green-600">Ticket promedio</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-green-700">{pipeline}</div>
          <div className="text-xs text-green-600">Pipeline total</div>
        </div>
      </div>

      <form onSubmit={guardar} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['demos_realizadas','Demos realizadas','Demostraciones del producto realizadas.'],
            ['presupuestos_enviados','Presupuestos enviados','Presupuestos formales enviados.'],
            ['seguimientos_realizados','Seguimientos realizados','Contactos de seguimiento a prospectos.'],
            ['ventas_cerradas','Ventas cerradas','Contratos firmados esta semana.'],
            ['monto_vendido','Monto vendido ($)','Suma de contratos cerrados en pesos.'],
            ['nuevos_clientes','Nuevos clientes','Clientes que iniciaron el servicio.'],
            ['pipeline_caliente','Pipeline caliente 🔥','Alta probabilidad de cierre en 30 días.'],
            ['pipeline_tibio','Pipeline tibio 🌤️','En evaluación activa.'],
            ['pipeline_frio','Pipeline frío 🧊','Sin actividad reciente.'],
          ].map(([k, label, ayuda]) => (
            <div key={k}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
              <input type="number" min="0" step={k === 'monto_vendido' ? '0.01' : '1'}
                value={(form as any)[k]} onChange={set(k)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30" />
              <p className="text-xs text-gray-400 mt-0.5">{ayuda}</p>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea rows={3} value={form.observaciones} onChange={set('observaciones')}
            placeholder="Contexto, novedades, obstáculos de la semana..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none" />
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
