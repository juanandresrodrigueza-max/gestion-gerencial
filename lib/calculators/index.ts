export function formatCurrency(v: number | null | undefined): string {
  if (v == null) return '—'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v)
}
export function formatPct(v: number | null | undefined): string {
  if (v == null) return '—'
  return `${(v * 100).toFixed(1)}%`
}
export function formatNumber(v: number | null | undefined): string {
  if (v == null) return '—'
  return new Intl.NumberFormat('es-AR').format(v)
}
