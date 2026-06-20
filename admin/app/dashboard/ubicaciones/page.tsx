import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import UbicacionesTable from './UbicacionesTable'

interface Ubicacion {
  id: string
  nombre: string
  zona: string | null
  lat: number | null
  lng: number | null
  activo: boolean
  orden: number
}

async function getUbicaciones(): Promise<Ubicacion[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ubicaciones')
    .select('id, nombre, zona, lat, lng, activo, orden')
    .order('orden', { ascending: true })

  if (error || !data) return []
  return data
}

export default async function UbicacionesPage() {
  const ubicaciones = await getUbicaciones()
  const activas = ubicaciones.filter(u => u.activo).length

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Ubicaciones</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Ubicaciones</h1>
            <p className="page-header__subtitle">
              {activas} activa{activas !== 1 ? 's' : ''} · {ubicaciones.length} en total
              — cada ubicación agrupa habitaciones y define el mapa, distancias y amenidades de la casa
            </p>
          </div>
          <Link href="/dashboard/ubicaciones/nueva" className="btn btn--primary">
            + Nueva ubicación
          </Link>
        </div>

        <div className="card card--flat" style={{ padding: 0, overflow: 'hidden' }}>
          <UbicacionesTable ubicaciones={ubicaciones} />
        </div>
      </main>
    </>
  )
}
