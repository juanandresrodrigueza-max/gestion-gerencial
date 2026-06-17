'use client'

interface KPICardProps {
  titulo: string
  valor: string | number | null
  subtitulo?: string
  accentColor?: string
  icono?: string
  variacion?: number | null
  inverso?: boolean
}

export function KPICard({
  titulo, valor, subtitulo,
  accentColor = '#e4003f',
  icono, variacion, inverso
}: KPICardProps) {
  const display = valor === null || valor === undefined ? '—' : valor
  const esPositivo = variacion != null
    ? (inverso ? variacion < 0 : variacion > 0)
    : null

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all group relative overflow-hidden">
      {/* Accent line top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />

      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide leading-tight">
          {titulo}
        </span>
        {icono && <span className="text-base">{icono}</span>}
      </div>

      <div className="text-2xl font-bold text-gray-900 mb-1">{display}</div>

      {subtitulo && <div className="text-xs text-gray-400">{subtitulo}</div>}

      {variacion != null && (
        <span className={`inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
          esPositivo
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-600'
        }`}>
          {variacion > 0 ? '↑' : '↓'} {Math.abs(variacion * 100).toFixed(1)}% vs sem. ant.
        </span>
      )}
    </div>
  )
}
