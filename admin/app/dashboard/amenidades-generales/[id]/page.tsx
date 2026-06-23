import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AmenidadGeneralForm from '@/components/AmenidadGeneralForm'

interface Props {
  params: Promise<{ id: string }>
}

async function getUbicaciones() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ubicaciones')
    .select('id, nombre')
    .eq('activo', true)
    .order('orden', { ascending: true })
  return data ?? []
}

export default async function EditarAmenidadPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data, error }, ubicaciones] = await Promise.all([
    supabase
      .from('location_amenities')
      .select('id, slug, label, description, icon, badge, category, active, orden, ubicacion_id')
      .eq('id', id)
      .single(),
    getUbicaciones(),
  ])

  if (error || !data) notFound()

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <Link href="/dashboard/amenidades-generales">Amenidades generales</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">{data.label}</span>
        </nav>
      </header>

      <main className="page-content">
        <Link href="/dashboard/amenidades-generales" className="back-link">
          ← Volver a amenidades
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-header__title">Editar amenidad</h1>
            <p className="page-header__subtitle">{data.label}</p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 700 }}>
          <AmenidadGeneralForm
            mode="edit"
            ubicaciones={ubicaciones}
            initialData={data}
          />
        </div>
      </main>
    </>
  )
}
