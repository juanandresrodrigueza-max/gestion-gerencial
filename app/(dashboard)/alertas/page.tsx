export default function AlertasPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">🔔 Centro de Alertas</h1>
      <p className="text-sm text-gray-400 mb-6">Las alertas se generan automáticamente al cargar datos cada semana.</p>
      <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🟢</div>
        <p className="text-green-700 font-medium">Las alertas aparecerán aquí automáticamente</p>
        <p className="text-green-600 text-sm mt-1">Una vez que cargues datos en todas las áreas, el sistema evaluará los indicadores y mostrará alertas si alguno está fuera de rango.</p>
      </div>
    </div>
  )
}
