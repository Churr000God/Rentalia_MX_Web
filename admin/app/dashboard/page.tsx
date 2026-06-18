import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

interface RoomStats {
  total: number
  available: number
  occupied: number
  maintenance: number
}

async function getRoomStats(): Promise<RoomStats> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('habitaciones')
    .select('status')

  if (error || !data) {
    return { total: 0, available: 0, occupied: 0, maintenance: 0 }
  }

  return {
    total: data.length,
    available: data.filter((r) => r.status === 'available').length,
    occupied: data.filter((r) => r.status === 'occupied').length,
    maintenance: data.filter((r) => r.status === 'maintenance').length,
  }
}

export default async function DashboardPage() {
  const stats = await getRoomStats()

  return (
    <>
      {/* Top header */}
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <span className="top-header__breadcrumb-current">Dashboard</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Resumen</h1>
            <p className="page-header__subtitle">
              Estado actual del inventario de habitaciones
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__label">Total habitaciones</div>
            <div className="stat-card__value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Disponibles</div>
            <div className="stat-card__value stat-card__value--accent">
              {stats.available}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Ocupadas</div>
            <div className="stat-card__value">{stats.occupied}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Mantenimiento</div>
            <div className="stat-card__value stat-card__value--warn">
              {stats.maintenance}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card" style={{ maxWidth: 480 }}>
          <h2
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              marginBottom: 16,
              color: 'var(--tinta)',
            }}
          >
            Acciones rápidas
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/dashboard/habitaciones" className="btn btn--secondary">
              Ver habitaciones
            </Link>
            <Link href="/dashboard/habitaciones/nueva" className="btn btn--primary">
              + Nueva habitación
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
