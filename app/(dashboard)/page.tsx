import { KPICard } from '@/components/dashboard/KPICard'

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Gerencial</h1>
        <p className="text-sm text-gray-400 mt-1">Resumen ejecutivo semanal</p>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Empresa</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard titulo="Clientes activos" valor="—" icono="👥" color="#1E3A5F" />
          <KPICard titulo="MRR" valor="—" icono="💰" color="#1E3A5F" />
          <KPICard titulo="Clientes nuevos" valor="—" icono="✨" subtitulo="esta semana" />
          <KPICard titulo="Churn semanal" valor="—" icono="📉" inverso />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Comercial</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard titulo="Ventas cerradas" valor="—" icono="🤝" color="#1A7F5A" />
          <KPICard titulo="Monto vendido" valor="—" icono="💵" color="#1A7F5A" />
          <KPICard titulo="Pipeline total" valor="—" icono="🔥" color="#1A7F5A" />
          <KPICard titulo="Conversión demo" valor="—" icono="📊" color="#1A7F5A" />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Administración</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard titulo="Facturación" valor="—" icono="🧾" color="#2E86AB" />
          <KPICard titulo="Cobranza efectiva" valor="—" icono="✅" color="#2E86AB" />
          <KPICard titulo="Índice cobrabilidad" valor="—" icono="📈" color="#2E86AB" />
          <KPICard titulo="Clientes morosos" valor="—" icono="⚠️" inverso />
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Reactivación</h2>
          <div className="grid grid-cols-2 gap-3">
            <KPICard titulo="Recuperados" valor="—" icono="🔄" color="#7C3AED" />
            <KPICard titulo="Ingresos recuperados" valor="—" icono="💜" color="#7C3AED" />
          </div>
        </section>
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Soporte</h2>
          <div className="grid grid-cols-2 gap-3">
            <KPICard titulo="Tickets recibidos" valor="—" icono="🎫" inverso />
            <KPICard titulo="% Resolución" valor="—" icono="✔️" color="#D97706" />
          </div>
        </section>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
        <p className="text-sm text-blue-600 font-medium">
          📋 Para ver datos acá, cada responsable de área debe cargar su información semanal usando el menú de la izquierda.
        </p>
      </div>
    </div>
  )
}
