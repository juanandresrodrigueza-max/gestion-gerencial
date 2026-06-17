'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Distribuidor { id: string; nombre: string }
interface Rendicion {
  id: string
  distribuidor_id: string
  fecha: string
  clientes_nuevos: number
  clientes_actualizados: number
  monto_total: number
  observaciones: string
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const fmtFecha = (f: string) =>
  new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })

const hoy = new Date().toISOString().split('T')[0]
const anioActual = new Date().getFullYear()

export default function DistribuidoresPage() {
  const [distribuidores, setDistribuidores] = useState<Distribuidor[]>([])
  const [rendiciones, setRendiciones]       = useState<Rendicion[]>([])
  const [anioVista, setAnioVista]           = useState(anioActual)
  const [editando, setEditando]             = useState<string | null>(null)
  const [estado, setEstado]                 = useState<'idle'|'guardando'|'ok'|'error'>('idle')
  const [filtroDistribuidor, setFiltroDistribuidor] = useState<string>('todos')

  const [form, setForm] = useState({
    distribuidor_id: '',
    fecha: hoy,
    clientes_nuevos: '',
    clientes_actualizados: '',
    monto_total: '',
    observaciones: ''
  })

  const supabase = createClient()

  const cargarDatos = useCallback(async () => {
    const { data: dist } = await supabase
      .from('distribuidores')
      .select('*')
      .eq('activo', true)
      .order('nombre')

    const { data: rend } = await supabase
      .from('rendiciones_distribuidores')
      .select('*')
      .gte('fecha', `${anioVista}-01-01`)
      .lte('fecha', `${anioVista}-12-31`)
      .order('fecha', { ascending: false })

    if (dist) {
      setDistribuidores(dist)
      if (!form.distribuidor_id && dist.length > 0) {
        setForm(f => ({ ...f, distribuidor_id: dist[0].id }))
      }
    }
    if (rend) setRendiciones(rend)
  }, [anioVista])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  function cargarParaEditar(r: Rendicion) {
    setEditando(r.id)
    setForm({
      distribuidor_id:       r.distribuidor_id,
      fecha:                 r.fecha,
      clientes_nuevos:       String(r.clientes_nuevos),
      clientes_actualizados: String(r.clientes_actualizados),
      monto_total:           String(r.monto_total),
      observaciones:         r.observaciones ?? ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicion() {
    setEditando(null)
    setForm(f => ({ ...f, fecha: hoy, clientes_nuevos: '', clientes_actualizados: '', monto_total: '', observaciones: '' }))
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
      const payload = {
        distribuidor_id:       form.distribuidor_id,
        fecha:                 form.fecha,
        clientes_nuevos:       parseInt(form.clientes_nuevos)       || 0,
        clientes_actualizados: parseInt(form.clientes_actualizados) || 0,
        monto_total:           parseFloat(form.monto_total)         || 0,
        observaciones:         form.observaciones,
        cargado_por:           user?.id,
        actualizado_en:        new Date().toISOString()
      }

      if (editando) {
        const { error } = await supabase
          .from('rendiciones_distribuidores')
          .update(payload)
          .eq('id', editando)
        if (error) throw error
        setEditando(null)
      } else {
        const { error } = await supabase
          .from('rendiciones_distribuidores')
          .insert(payload)
        if (error) throw error
      }

      setEstado('ok')
      setForm(f => ({ ...f, fecha: hoy, clientes_nuevos: '', clientes_actualizados: '', monto_total: '', observaciones: '' }))
      await cargarDatos()
      setTimeout(() => setEstado('idle'), 3000)
    } catch (err) {
      console.error(err)
      setEstado('error')
    }
  }

  // Totales por distribuidor
  function totales(did: string) {
    const rs = rendiciones.filter(r => r.distribuidor_id === did)
    return {
      nuevos:       rs.reduce((s, r) => s + r.clientes_nuevos, 0),
      actualizados: rs.reduce((s, r) => s + r.clientes_actualizados, 0),
      monto:        rs.reduce((s, r) => s + Number(r.monto_total), 0),
      visitas:      rs.length
    }
  }

  const rendicionesFiltradas = rendiciones.filter(r =>
    filtroDistribuidor === 'todos' || r.distribuidor_id === filtroDistribuidor
  )

  const nombreDist = (id: string) =>
    distribuidores.find(d => d.id === id)?.nombre ?? '—'

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🤝 Distribuidores</h1>
        <p className="text-sm text-gray-400 mt-1">
          Rendiciones de Horacio y Julio — podés cargar cada vez que vengan, sin importar la frecuencia.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-800 mb-4">
          {editando ? '✏️ Editando rendición' : '➕ Registrar rendición'}
        </h2>
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Distribuidor</label>
              <select value={form.distribuidor_id} onChange={set('distribuidor_id')} required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                {distribuidores.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fecha de la rendición
              </label>
              <input type="date" value={form.fecha} onChange={set('fecha')} required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              <p className="text-xs text-gray-400 mt-0.5">
                Podés cargar varias veces el mismo mes con fechas distintas.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Clientes nuevos vendidos</label>
              <input type="number" min="0" value={form.clientes_nuevos} onChange={set('clientes_nuevos')}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Clientes actualizados</label>
              <input type="number" min="0" value={form.clientes_actualizados} onChange={set('clientes_actualizados')}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Monto total rendido ($)</label>
              <input type="number" min="0" step="0.01" value={form.monto_total} onChange={set('monto_total')}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea rows={2} value={form.observaciones} onChange={set('observaciones')}
              placeholder="Novedades, acuerdos, contexto de la visita..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={estado === 'guardando'}
              className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
              {estado === 'guardando' ? 'Guardando...' : estado === 'ok' ? '✓ Guardado' : editando ? 'Actualizar rendición' : 'Guardar rendición'}
            </button>
            {editando && (
              <button type="button" onClick={cancelarEdicion}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl transition-colors text-sm">
                Cancelar
              </button>
            )}
          </div>
          {estado === 'error' && (
            <p className="text-sm text-red-600 text-center">Error al guardar. Verificá los datos e intentá de nuevo.</p>
          )}
        </form>
      </div>

      {/* Selector de año */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-600">Ver año:</span>
        {[anioActual - 1, anioActual, anioActual + 1].map(a => (
          <button key={a} onClick={() => setAnioVista(a)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              anioVista === a ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {a}
          </button>
        ))}
      </div>

      {/* Resumen por distribuidor */}
      <div className="grid sm:grid-cols-2 gap-4">
        {distribuidores.map(d => {
          const t = totales(d.id)
          return (
            <div key={d.id} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {d.nombre.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{d.nombre}</h3>
                  <p className="text-xs text-gray-400">
                    {t.visitas} rendición{t.visitas !== 1 ? 'es' : ''} en {anioVista}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">{t.nuevos}</div>
                  <div className="text-xs text-green-600 mt-0.5">Clientes nuevos</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-blue-700">{t.actualizados}</div>
                  <div className="text-xs text-blue-600 mt-0.5">Actualizados</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="text-base font-bold text-purple-700">{fmt(t.monto)}</div>
                  <div className="text-xs text-purple-600 mt-0.5">Total rendido</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Historial de rendiciones */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-semibold text-gray-800">Historial de rendiciones — {anioVista}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Filtrar:</span>
            <select value={filtroDistribuidor} onChange={e => setFiltroDistribuidor(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option value="todos">Todos</option>
              {distribuidores.map(d => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {rendicionesFiltradas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">No hay rendiciones registradas para este período.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Distribuidor</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nuevos</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actualizados</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Observaciones</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rendicionesFiltradas.map((r, i) => (
                  <tr key={r.id} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{fmtFecha(r.fecha)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                        {nombreDist(r.distribuidor_id)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-700 font-semibold text-sm">
                        {r.clientes_nuevos}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm">
                        {r.clientes_actualizados}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-700">{fmt(Number(r.monto_total))}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{r.observaciones || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => cargarParaEditar(r)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          Editar
                        </button>
                        <button onClick={() => eliminar(r.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-medium">
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
