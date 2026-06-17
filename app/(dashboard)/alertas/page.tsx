export default function AlertasPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="rounded-2xl p-5 text-white mb-6"
        style={{ background: 'linear-gradient(135deg, #e4003f 0%, #a42785 50%, #4f3089 100%)' }}>
        <h1 className="text-xl font-bold">🔔 Centro de Alertas</h1>
        <p className="text-white/70 text-sm mt-0.5">Las alertas se generan automáticamente al cargar datos.</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-3">🟢</div>
        <p className="font-semibold text-gray-700">Las alertas aparecerán aquí automáticamente</p>
        <p className="text-gray-400 text-sm mt-2">Una vez que cargues datos en todas las áreas, el sistema evaluará los indicadores y mostrará alertas si alguno está fuera de rango.</p>
      </div>
    </div>
  )
}
