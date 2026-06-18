import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import AmenidadesGeneralesTable from './AmenidadesGeneralesTable'

interface LocationAmenity {
  id: string
  slug: string
  label: string
  description: string | null
  icon: string
  category: string
  active: boolean
  orden: number
}

async function getAmenidades(): Promise<LocationAmenity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('location_amenities')
    .select('id, slug, label, description, icon, category, active, orden')
    .order('orden', { ascending: true })

  if (error || !data) return []
  return data
}

export default async function AmenidadesGeneralesPage() {
  const amenidades = await getAmenidades()
  const activas = amenidades.filter(a => a.active).length

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Amenidades generales</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Amenidades generales</h1>
            <p className="page-header__subtitle">
              {activas} activa{activas !== 1 ? 's' : ''} · {amenidades.length} en total — se muestran en la sección de la home
            </p>
          </div>
          <Link href="/dashboard/amenidades-generales/nueva" className="btn btn--primary">
            + Nueva amenidad
          </Link>
        </div>

        <div className="card card--flat" style={{ padding: 0, overflow: 'hidden' }}>
          <AmenidadesGeneralesTable amenidades={amenidades} />
        </div>
      </main>
    </>
  )
}
