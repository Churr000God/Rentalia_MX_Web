import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import RoomForm from '@/components/RoomForm'

async function getUbicaciones() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ubicaciones')
    .select('id, nombre, zona')
    .eq('activo', true)
    .order('orden', { ascending: true })
  return data ?? []
}

export default async function NuevaHabitacionPage() {
  const ubicaciones = await getUbicaciones()

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <Link href="/dashboard/habitaciones">Habitaciones</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Nueva</span>
        </nav>
      </header>

      <main className="page-content">
        <Link href="/dashboard/habitaciones" className="back-link">
          ← Volver a habitaciones
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-header__title">Nueva habitación</h1>
            <p className="page-header__subtitle">
              Completa los campos para agregar una nueva habitación al catálogo.
            </p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 780 }}>
          <RoomForm mode="create" ubicaciones={ubicaciones} />
        </div>
      </main>
    </>
  )
}
