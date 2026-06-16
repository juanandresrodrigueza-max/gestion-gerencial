'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SoportePage() {
  const [form, setForm] = useState({
    tickets_recibidos: '', tickets_resueltos: '',
    tiempo_prom_respuesta_hs: '', tiempo_prom_resolucion_hs: '',
    problemas_recurrentes: '', observaciones: ''
  })
  const [estado, setEstado] = useState<'idle'|'guardando'|'ok'|'error'>('idle')

  const recibidos = parseInt(form.tickets_recibidos) || 0
  const resueltos = parseInt(form.tickets_resueltos) || 0
  const pctResolucion = recibidos > 0 ? ((resueltos / recibidos) * 100).toFixed(1) + '%' : '—'

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setEstado('guardando')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')
      const { data: semana } = await supabase.rpc('get_or_create_semana')
      const { error } = await supabase.from('carga_soporte').upsert({
        semana_id: semana, usuario_id: user.id,
        tickets_recibidos: parseInt(form.tickets_recibidos)||0,
        tickets_resueltos: parseInt(form.tickets_resueltos)||0,
        tiempo_prom_respuesta_hs: parseFloat(form.tiempo_prom_respuesta_hs)||0,
        tiempo_prom_resolucion_hs: parseFloat(form.tiempo_prom_resolucion_hs)||0,
        problemas_recurrentes: form.problemas_recurrentes,
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">🛠️ Soporte Técnico — Carga semanal</h1>
      <p className="text-sm text-gray-400 mb-4">Registrá la actividad del área de soporte.</p>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center mb-6">
        <div className="text-2xl font-bold text-amber-700">{pctResolucion}</div>
        <div className="text-xs text-amber-600">% de resolución (calculado automáticamente)</div>
      </div>

      <form onSubmit={guardar} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['tickets_recibidos','Tickets recibidos','Total de consultas o reclamos ingresados.'],
            ['tickets_resueltos','Tickets resueltos','Tickets cerrados satisfactoriamente.'],
            ['tiempo_prom_respuesta_hs','Tiempo prom. respuesta (hs)','Promedio en horas hasta la primera respuesta.'],
            ['tiempo_prom_resolucion_hs','Tiempo prom. resolución (hs)','Promedio en horas hasta el cierre del ticket.'],
          ].map(([k, label, ayuda]) => (
            <div key={k}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
              <input type="number" min="0" step="0.1"
                value={(form as any)[k]} onChange={set(k)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
              <p className="text-xs text-gray-400 mt-0.5">{ayuda}</p>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Problemas recurrentes detectados</label>
          <textarea rows={2} value={form.problemas_recurrentes} onChange={set('problemas_recurrentes')}
            placeholder="Describí los temas que se repiten con más frecuencia..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea rows={2} value={form.observaciones} onChange={set('observaciones')}
            placeholder="Comentarios adicionales..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none" />
        </div>
        <button type="submit" disabled={estado === 'guardando'}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
          {estado === 'guardando' ? 'Guardando...' : estado === 'ok' ? '✓ Guardado' : 'Guardar carga semanal'}
        </button>
        {estado === 'error' && <p className="text-sm text-red-600 text-center">Error al guardar.</p>}
      </form>
    </div>
  )
}
