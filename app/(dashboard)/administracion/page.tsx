'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const [form, setForm] = useState({
    facturacion_emitida: '', cobranza_efectiva: '', saldo_pendiente: '',
    clientes_morosos: '', renovaciones_realizadas: '', renovaciones_pendientes: '', observaciones: ''
  })
  const [estado, setEstado] = useState<'idle'|'guardando'|'ok'|'error'>('idle')

  const fact = parseFloat(form.facturacion_emitida) || 0
  const cobr = parseFloat(form.cobranza_efectiva) || 0
  const cobrabilidad = fact > 0 ? ((cobr / fact) * 100).toFixed(1) + '%' : '—'

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setEstado('guardando')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')
      const { data: semana } = await supabase.rpc('get_or_create_semana')
      const { error } = await supabase.from('carga_administracion').upsert({
        semana_id: semana, usuario_id: user.id,
        facturacion_emitida: parseFloat(form.facturacion_emitida)||0,
        cobranza_efectiva: parseFloat(form.cobranza_efectiva)||0,
        saldo_pendiente: parseFloat(form.saldo_pendiente)||0,
        clientes_morosos: parseInt(form.clientes_morosos)||0,
        renovaciones_realizadas: parseInt(form.renovaciones_realizadas)||0,
        renovaciones_pendientes: parseInt(form.renovaciones_pendientes)||0,
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">💼 Administración y Cobranzas</h1>
      <p className="text-sm text-gray-400 mb-4">Carga semanal de indicadores financieros.</p>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center mb-6">
        <div className="text-2xl font-bold text-blue-700">{cobrabilidad}</div>
        <div className="text-xs text-blue-600">Índice de cobrabilidad (calculado automáticamente)</div>
      </div>

      <form onSubmit={guardar} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['facturacion_emitida','Facturación emitida ($)','Total facturado durante la semana.'],
            ['cobranza_efectiva','Cobranza efectiva ($)','Dinero efectivamente cobrado.'],
            ['saldo_pendiente','Saldo pendiente ($)','Total de deuda acumulada sin cobrar.'],
            ['clientes_morosos','Clientes morosos','Cantidad de clientes con deuda vencida.'],
            ['renovaciones_realizadas','Renovaciones realizadas','Contratos renovados esta semana.'],
            ['renovaciones_pendientes','Renovaciones pendientes','Contratos próximos a vencer.'],
          ].map(([k, label, ayuda]) => (
            <div key={k}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
              <input type="number" min="0" step={k.includes('$') || k.includes('factur') || k.includes('cobr') || k.includes('saldo') ? '0.01' : '1'}
                value={(form as any)[k]} onChange={set(k)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              <p className="text-xs text-gray-400 mt-0.5">{ayuda}</p>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea rows={3} value={form.observaciones} onChange={set('observaciones')}
            placeholder="Situaciones relevantes de la semana..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
        </div>
        <button type="submit" disabled={estado === 'guardando'}
          className="w-full py-3 text-white font-semibold disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
          {estado === 'guardando' ? 'Guardando...' : estado === 'ok' ? '✓ Guardado' : 'Guardar carga semanal'}
        </button>
        {estado === 'error' && <p className="text-sm text-red-600 text-center">Error al guardar.</p>}
      </form>
    </div>
  )
}
