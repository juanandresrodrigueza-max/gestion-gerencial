'use client'
interface KPICardProps {
  titulo: string
  valor: string | number | null
  subtitulo?: string
  color?: string
  icono?: string
  variacion?: number | null
  inverso?: boolean
}
export function KPICard({ titulo, valor, subtitulo, color = '#2E86AB', icono, variacion, inverso }: KPICardProps) {
  const display = valor === null || valor === undefined ? '—' : valor
  const esPositivo = variacion != null ? (inverso ? variacion < 0 : variacion > 0) : null
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        {icono && <span className="text-base">{icono}</span>}
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{titulo}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{display}</div>
      {subtitulo && <div className="text-xs text-gray-400">{subtitulo}</div>}
      {variacion != null && (
        <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
          esPositivo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {variacion > 0 ? '↑' : '↓'} {Math.abs(variacion * 100).toFixed(1)}% vs sem. ant.
        </span>
      )}
    </div>
  )
}
