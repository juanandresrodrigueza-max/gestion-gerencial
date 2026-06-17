import { KPICard } from '@/components/dashboard/KPICard'

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* Header con degradado BigSys */}
      <div className="rounded-3xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #e4003f 0%, #a42785 50%, #4f3089 100%)' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Gerencial</h1>
            <p className="text-white/70 text-sm mt-0.5">Resumen ejecutivo semanal — BigSys</p>
          </div>
          <div className="text-white/60 text-sm">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Empresa */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: '#a42785' }}>Empresa</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard titulo="Clientes activos" valor="—" icono="👥" accentColor="#e4003f" />
          <KPICard titulo="MRR" valor="—" icono="💰" accentColor="#e4003f" />
          <KPICard titulo="Clientes nuevos" valor="—" icono="✨" subtitulo="esta semana" accentColor="#a42785" />
          <KPICard titulo="Churn semanal" valor="—" icono="📉" accentColor="#4f3089" inverso />
        </div>
      </section>

      {/* Comercial */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: '#a42785' }}>Comercial</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard titulo="Ventas cerradas" valor="—" icono="🤝" accentColor="#e4003f" />
          <KPICard titulo="Monto vendido" valor="—" icono="💵" accentColor="#e4003f" />
          <KPICard titulo="Pipeline total" valor="—" icono="🔥" accentColor="#a42785" />
          <KPICard titulo="Conversión demo" valor="—" icono="📊" accentColor="#4f3089" />
        </div>
      </section>

      {/* Administración */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: '#a42785' }}>Administración</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard titulo="Facturación" valor="—" icono="🧾" accentColor="#e4003f" />
          <KPICard titulo="Cobranza efectiva" valor="—" icono="✅" accentColor="#e4003f" />
          <KPICard titulo="Índice cobrabilidad" valor="—" icono="📈" accentColor="#a42785" />
          <KPICard titulo="Clientes morosos" valor="—" icono="⚠️" accentColor="#4f3089" inverso />
        </div>
      </section>

      {/* Reactivación + Soporte */}
      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: '#a42785' }}>Reactivación</h2>
          <div className="grid grid-cols-2 gap-3">
            <KPICard titulo="Recuperados" valor="—" icono="🔄" accentColor="#e4003f" />
            <KPICard titulo="Ingresos recuperados" valor="—" icono="💜" accentColor="#4f3089" />
          </div>
        </section>
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: '#a42785' }}>Soporte</h2>
          <div className="grid grid-cols-2 gap-3">
            <KPICard titulo="Tickets recibidos" valor="—" icono="🎫" accentColor="#e4003f" inverso />
            <KPICard titulo="% Resolución" valor="—" icono="✔️" accentColor="#a42785" />
          </div>
        </section>
      </div>

      {/* Aviso */}
      <div className="rounded-2xl p-5 text-center border"
        style={{ background: 'linear-gradient(135deg, #fdf0f4, #f5eef9)', borderColor: '#c5bcdd' }}>
        <p className="text-sm font-medium" style={{ color: '#a42785' }}>
          📋 Para ver datos acá, cada responsable de área debe cargar su información semanal usando el menú de la izquierda.
        </p>
      </div>
    </div>
  )
}
