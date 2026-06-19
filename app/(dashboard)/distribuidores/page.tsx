'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Distribuidor { id: string; nombre: string }
interface Rendicion {
  id: string
  distribuidor_id: string
  fecha: string
  periodo_desde: string
  periodo_hasta: string
  clientes_nuevos: number
  clientes_actualizados: number
  monto_total: number
  observaciones: string
}

const BS_GRAD = { background: 'linear-gradient(135deg, #e4003f 0%, #a42785 50%, #4f3089 100%)' }
const BS_INPUT = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a42785]/30 focus:border-[#a42785] transition-colors bg-white"

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const fmtFecha = (f: string) =>
  new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })

const hoy = new Date().toISOString().split('T')[0]
const anioActual = new Date().getFullYear()
const mesActual  = new Date().getMonth() + 1

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function DistribuidoresPage() {
  const [distribuidores, setDistribuidores] = useState<Distribuidor[]>([])
  const [rendiciones, setRendiciones]       = useState<Rendicion[]>([])
  const [anioVista, setAnioVista]           = useState(anioActual)
  const [mesVista, setMesVista]             = useState<number | 'todos'>('todos')
  const [editando, setEditando]             = useState<string | null>(null)
  const [estado, setEstado]                 = useState<'idle'|'guardando'|'ok'|'error'>('idle')
  const [filtroDistribuidor, setFiltroDistribuidor] = useState<string>('todos')

  const [form, setForm] = useState({
    distribuidor_id:       '',
    fecha:                 hoy,
    periodo_desde:         '',
    periodo_hasta:         hoy,
    clientes_nuevos:       '',
    clientes_actualizados: '',
    monto_total:           '',
    observaciones:         ''
  })

  const supabase = createClient()

  const cargarDatos = useCallback(async () => {
    const { data: dist } = await supabase
      .from('distribuidores').select('*').eq('activo', true).order('nombre')

    const { data: rend } = await supabase
      .from('rendiciones_distribuidores').select('*')
      .gte('fecha', `${anioVista}-01-01`)
      .lte('fecha', `${anioVista}-12-31`)
      .order('fecha', { ascending: false })

    if (dist) {
      setDistribuidores(dist)
      if (!form.distribuidor_id && dist.length > 0)
        setForm(f => ({ ...f, distribuidor_id: dist[0].id }))
    }
    if (rend) setRendiciones(rend)
  }, [anioVista])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  function cargarParaEditar(r: Rendicion) {
    setEditando(r.id)
    setForm({
      distribuidor_id:       r.distribuidor_id,
      fecha:                 r.fecha,
      periodo_desde:         r.periodo_desde ?? '',
      periodo_hasta:         r.periodo_hasta ?? '',
      clientes_nuevos:       String(r.clientes_nuevos),
      clientes_actualizados: String(r.clientes_actualizados),
      monto_total:           String(r.monto_total),
      observaciones:         r.observaciones ?? ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicion() {
    setEditando(null)
    setForm(f => ({
      ...f, fecha: hoy, periodo_desde: '', periodo_hasta: hoy,
      clientes_nuevos: '', clientes_actualizados: '', monto_total: '', observaciones: ''
    }))
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar esta rendición?')) return
    await supabase.from('rendiciones_distribuidores').delete().eq('id', id)
    await cargarDatos()
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setEstado('guardando')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload: any = {
        distribuidor_id:       form.distribuidor_id,
        fecha:                 form.fecha,
        periodo_desde:         form.periodo_desde || null,
        periodo_hasta:         form.periodo_hasta || null,
        clientes_nuevos:       parseInt(form.clientes_nuevos)       || 0,
        clientes_actualizados: parseInt(form.clientes_actualizados) || 0,
        monto_total:           parseFloat(form.monto_total)         || 0,
        observaciones:         form.observaciones,
        cargado_por:           user?.id,
        actualizado_en:        new Date().toISOString()
      }
      if (editando) {
        const { error } = await supabase.from('rendiciones_distribuidores').update(payload).eq('id', editando)
        if (error) throw error
        setEditando(null)
      } else {
        const { error } = await supabase.from('rendiciones_distribuidores').insert(payload)
        if (error) throw error
      }
      setEstado('ok')
      setForm(f => ({ ...f, periodo_desde: '', clientes_nuevos: '', clientes_actualizados: '', monto_total: '', observaciones: '' }))
      await cargarDatos()
      setTimeout(() => setEstado('idle'), 3000)
    } catch (err) {
      console.error(err)
      setEstado('error')
    }
  }

  function totales(did: string) {
    const rs = rendicionesFiltradas.filter(r => r.distribuidor_id === did)
    return {
      nuevos:       rs.reduce((s, r) => s + r.clientes_nuevos, 0),
      actualizados: rs.reduce((s, r) => s + r.clientes_actualizados, 0),
      monto:        rs.reduce((s, r) => s + Number(r.monto_total), 0),
      visitas:      rs.length
    }
  }

  const rendicionesFiltradas = rendiciones.filter(r => {
    const porDist = filtroDistribuidor === 'todos' || r.distribuidor_id === filtroDistribuidor
    if (mesVista === 'todos') return porDist
    const mes = new Date(r.fecha + 'T12:00:00').getMonth() + 1
    return porDist && mes === mesVista
  })

  const nombreDist = (id: string) => distribuidores.find(d => d.id === id)?.nombre ?? '—'

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white" style={BS_GRAD}>
        <h1 className="text-xl font-bold">🤝 Distribuidores</h1>
        <p className="text-white/70 text-sm mt-0.5">
          Rendiciones de Horacio y Julio — podés cargar cada vez que vengan, con fecha libre.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span style={{ color: '#a42785' }}>{editando ? '✏️' : '➕'}</span>
          {editando ? 'Editando rendición' : 'Registrar rendición'}
        </h2>

        <form onSubmit={guardar} className="space-y-4">

          {/* Fila 1: distribuidor + fecha de carga */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#a42785' }}>
                Distribuidor
              </label>
              <select value={form.distribuidor_id} onChange={set('distribuidor_id')} required className={BS_INPUT}>
                {distribuidores.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#a42785' }}>
                Fecha de carga
              </label>
              <input type="date" value={form.fecha} onChange={set('fecha')} required className={BS_INPUT} />
              <p className="text-xs text-gray-400 mt-0.5">Día en que se registra la rendición.</p>
            </div>
          </div>

          {/* Fila 2: período desde/hasta */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#a42785' }}>
                Período — Desde
              </label>
              <input type="date" value={form.periodo_desde} onChange={set('periodo_desde')} className={BS_INPUT} />
              <p className="text-xs text-gray-400 mt-0.5">Inicio del período que cubre esta rendición.</p>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#a42785' }}>
                Período — Hasta
              </label>
              <input type="date" value={form.periodo_hasta} onChange={set('periodo_hasta')} className={BS_INPUT} />
              <p className="text-xs text-gray-400 mt-0.5">Fin del período que cubre esta rendición.</p>
            </div>
          </div>

          {/* Fila 3: números */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#a42785' }}>
                Clientes nuevos
              </label>
              <input type="number" min="0" value={form.clientes_nuevos} onChange={set('clientes_nuevos')}
                placeholder="0" className={BS_INPUT} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#a42785' }}>
                Clientes actualizados
              </label>
              <input type="number" min="0" value={form.clientes_actualizados} onChange={set('clientes_actualizados')}
                placeholder="0" className={BS_INPUT} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#a42785' }}>
                Monto total rendido ($)
              </label>
              <input type="number" min="0" step="0.01" value={form.monto_total} onChange={set('monto_total')}
                placeholder="0.00" className={BS_INPUT} />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: '#a42785' }}>
              Observaciones
            </label>
            <textarea rows={2} value={form.observaciones} onChange={set('observaciones')}
              placeholder="Novedades, acuerdos, contexto de la visita..."
              className={BS_INPUT + " resize-none"} />
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button type="submit" disabled={estado === 'guardando'}
              className="flex-1 py-3 text-white font-bold rounded-xl transition-all disabled:opacity-60 text-sm hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
              style={BS_GRAD}>
              {estado === 'guardando' ? 'Guardando...' : estado === 'ok' ? '✓ Guardado correctamente' : editando ? 'Actualizar rendición' : 'Guardar rendición'}
            </button>
            {editando && (
              <button type="button" onClick={cancelarEdicion}
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-colors text-sm">
                Cancelar
              </button>
            )}
          </div>

          {estado === 'error' && (
            <p className="text-sm text-red-600 text-center bg-red-50 rounded-xl py-2">
              Error al guardar. Verificá los datos e intentá de nuevo.
            </p>
          )}
        </form>
      </div>

      {/* Filtros: año + mes */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
        {/* Años */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wide w-10" style={{ color: '#a42785' }}>Año</span>
          {[anioActual - 1, anioActual, anioActual + 1].map(a => (
            <button key={a} onClick={() => setAnioVista(a)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={anioVista === a ? BS_GRAD : { background: '#f3f4f6', color: '#6b7280' }}>
              <span style={anioVista === a ? { color: 'white' } : {}}>{a}</span>
            </button>
          ))}
        </div>

        {/* Meses */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wide w-10" style={{ color: '#a42785' }}>Mes</span>
          <button onClick={() => setMesVista('todos')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={mesVista === 'todos' ? BS_GRAD : { background: '#f3f4f6', color: '#6b7280' }}>
            <span style={mesVista === 'todos' ? { color: 'white' } : {}}>Todos</span>
          </button>
          {MESES.map((m, i) => (
            <button key={i} onClick={() => setMesVista(i + 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={mesVista === i + 1 ? BS_GRAD : { background: '#f3f4f6', color: '#6b7280' }}>
              <span style={mesVista === i + 1 ? { color: 'white' } : {}}>{m.substring(0, 3)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resumen por distribuidor */}
      <div className="grid sm:grid-cols-2 gap-4">
        {distribuidores.map(d => {
          const t = totales(d.id)
          return (
            <div key={d.id} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={BS_GRAD}>
                  {d.nombre.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{d.nombre}</h3>
                  <p className="text-xs text-gray-400">
                    {t.visitas} rendición{t.visitas !== 1 ? 'es' : ''}
                    {mesVista !== 'todos' ? ` en ${MESES[mesVista - 1]}` : ''} {anioVista}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 text-center" style={{ background: '#fdf0f4' }}>
                  <div className="text-2xl font-bold" style={{ color: '#e4003f' }}>{t.nuevos}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#a42785' }}>Clientes nuevos</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: '#f5eef9' }}>
                  <div className="text-2xl font-bold" style={{ color: '#a42785' }}>{t.actualizados}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#4f3089' }}>Actualizados</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: '#eeebf7' }}>
                  <div className="text-base font-bold" style={{ color: '#4f3089' }}>{fmt(t.monto)}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#4f3089' }}>Total rendido</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Historial */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-gray-800">
            Historial — {mesVista === 'todos' ? anioVista : `${MESES[mesVista - 1]} ${anioVista}`}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Filtrar:</span>
            <select value={filtroDistribuidor} onChange={e => setFiltroDistribuidor(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#a42785]/30">
              <option value="todos">Todos</option>
              {distribuidores.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
        </div>

        {rendicionesFiltradas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm">No hay rendiciones para este período.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100" style={{ background: '#fdf0f4' }}>
                  {['Fecha carga','Período','Distribuidor','Nuevos','Actualizados','Monto','Obs.',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: '#a42785' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rendicionesFiltradas.map((r, i) => (
                  <tr key={r.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                    <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{fmtFecha(r.fecha)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {r.periodo_desde && r.periodo_hasta
                        ? `${fmtFecha(r.periodo_desde)} → ${fmtFecha(r.periodo_hasta)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-white" style={BS_GRAD}>
                        {nombreDist(r.distribuidor_id)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm"
                        style={{ background: '#fdf0f4', color: '#e4003f' }}>
                        {r.clientes_nuevos}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm"
                        style={{ background: '#f5eef9', color: '#a42785' }}>
                        {r.clientes_actualizados}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-right whitespace-nowrap" style={{ color: '#4f3089' }}>
                      {fmt(Number(r.monto_total))}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[160px] truncate">{r.observaciones || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => cargarParaEditar(r)}
                          className="text-xs font-semibold hover:underline" style={{ color: '#a42785' }}>
                          Editar
                        </button>
                        <button onClick={() => eliminar(r.id)}
                          className="text-xs font-semibold text-gray-300 hover:text-red-500">
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
