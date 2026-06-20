import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import AmenidadGeneralForm from '@/components/AmenidadGeneralForm'

async function getUbicaciones() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ubicaciones')
    .select('id, nombre')
    .eq('activo', true)
    .order('orden', { ascending: true })
  return data ?? []
}

export default async function NuevaAmenidadPage() {
  const ubicaciones = await getUbicaciones()

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <Link href="/dashboard/amenidades-generales">Amenidades generales</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Nueva</span>
        </nav>
      </header>

      <main className="page-content">
        <Link href="/dashboard/amenidades-generales" className="back-link">
          ← Volver a amenidades
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-header__title">Nueva amenidad general</h1>
            <p className="page-header__subtitle">
              Agrega una característica de la ubicación visible en la home y detalle.
            </p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 700 }}>
          <AmenidadGeneralForm mode="create" ubicaciones={ubicaciones} />
        </div>
      </main>
    </>
  )
}
