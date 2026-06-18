import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import HabitacionesTable from './HabitacionesTable'

interface Habitacion {
  id: string
  nombre: string
  zona: string | null
  tipo: string | null
  precio_min: number | null
  precio_max: number | null
  status: string | null
  orden: number | null
}

async function getHabitaciones(): Promise<Habitacion[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('habitaciones')
    .select('id, nombre, zona, tipo, precio_min, precio_max, status, orden')
    .order('orden', { ascending: true, nullsFirst: false })

  if (error || !data) return []
  return data
}

export default async function HabitacionesPage() {
  const habitaciones = await getHabitaciones()

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Habitaciones</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Habitaciones</h1>
            <p className="page-header__subtitle">
              {habitaciones.length} habitación{habitaciones.length !== 1 ? 'es' : ''} en total
            </p>
          </div>
          <Link href="/dashboard/habitaciones/nueva" className="btn btn--primary">
            + Nueva habitación
          </Link>
        </div>

        <div className="card card--flat" style={{ padding: 0, overflow: 'hidden' }}>
          <HabitacionesTable habitaciones={habitaciones} />
        </div>
      </main>
    </>
  )
}
