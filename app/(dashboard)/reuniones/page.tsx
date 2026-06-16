'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReunionesPage() {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    participantes: '', resumen_semana: '', principales_logros: '',
    principales_problemas: '', riesgos_detectados: '', oportunidades: '', decisiones_tomadas: ''
  })
  const [compromisos, setCompromisos] = useState([{ accion: '', responsable: '', fecha_limite: '', estado: 'pendiente' }])
  const [estado, setEstado] = useState<'idle'|'guardando'|'ok'|'error'>('idle')

  const addCompromiso = () => setCompromisos(c => [...c, { accion: '', responsable: '', fecha_limite: '', estado: 'pendiente' }])
  const setC = (i: number, k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setCompromisos(cs => cs.map((c, idx) => idx === i ? { ...c, [k]: e.target.value } : c))
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setEstado('guardando')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')
      const { data: semana } = await supabase.rpc('get_or_create_semana')
      const { data: reunion, error } = await supabase.from('reuniones').insert({
        semana_id: semana, creado_por: user.id, tipo: 'semanal',
        fecha: form.fecha,
        participantes: form.participantes.split(',').map(p => p.trim()).filter(Boolean),
        resumen_semana: form.resumen_semana, principales_logros: form.principales_logros,
        principales_problemas: form.principales_problemas, riesgos_detectados: form.riesgos_detectados,
        oportunidades: form.oportunidades, decisiones_tomadas: form.decisiones_tomadas
      }).select().single()
      if (error) throw error
      const comps = compromisos.filter(c => c.accion.trim())
      if (comps.length > 0 && reunion) {
        await supabase.from('compromisos').insert(comps.map(c => ({ ...c, reunion_id: reunion.id })))
      }
      setEstado('ok')
      setTimeout(() => setEstado('idle'), 3000)
    } catch { setEstado('error') }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">📋 Reunión Semanal de Gestión</h1>
      <p className="text-sm text-gray-400 mb-6">Documentá la reunión y registrá los compromisos.</p>

      <form onSubmit={guardar} className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" value={form.fecha} onChange={set('fecha')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Participantes (separados por coma)</label>
              <input type="text" value={form.participantes} onChange={set('participantes')}
                placeholder="Juan, María, Carlos..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
          {[
            ['resumen_semana','Resumen de la semana'],
            ['principales_logros','Principales logros'],
            ['principales_problemas','Principales problemas'],
            ['riesgos_detectados','Riesgos detectados'],
            ['oportunidades','Oportunidades detectadas'],
            ['decisiones_tomadas','Decisiones tomadas'],
          ].map(([k, label]) => (
            <div key={k}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
              <textarea rows={2} value={(form as any)[k]} onChange={set(k)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Compromisos</h2>
            <button type="button" onClick={addCompromiso}
              className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              + Agregar compromiso
            </button>
          </div>
          <div className="space-y-3">
            {compromisos.map((c, i) => (
              <div key={i} className="grid sm:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-xl">
                <input placeholder="Acción a realizar" value={c.accion} onChange={setC(i,'accion')}
                  className="sm:col-span-2 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                <input placeholder="Responsable" value={c.responsable} onChange={setC(i,'responsable')}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                <input type="date" value={c.fecha_limite} onChange={setC(i,'fecha_limite')}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={estado === 'guardando'}
          className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
          {estado === 'guardando' ? 'Guardando...' : estado === 'ok' ? '✓ Reunión guardada' : 'Guardar reunión'}
        </button>
        {estado === 'error' && <p className="text-sm text-red-600 text-center">Error al guardar.</p>}
      </form>
    </div>
  )
}
