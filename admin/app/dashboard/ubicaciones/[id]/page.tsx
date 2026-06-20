import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import UbicacionForm from '@/components/UbicacionForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarUbicacionPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ubicaciones')
    .select('id, nombre, zona, lat, lng, direccion, distancias, activo, orden')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <Link href="/dashboard/ubicaciones">Ubicaciones</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">{data.nombre}</span>
        </nav>
      </header>

      <main className="page-content">
        <Link href="/dashboard/ubicaciones" className="back-link">
          ← Volver a ubicaciones
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-header__title">Editar ubicación</h1>
            <p className="page-header__subtitle">{data.nombre}</p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 700 }}>
          <UbicacionForm
            mode="edit"
            initialData={{
              id: data.id,
              nombre: data.nombre,
              zona: data.zona,
              lat: data.lat,
              lng: data.lng,
              direccion: data.direccion,
              distancias: data.distancias ?? [],
              activo: data.activo,
              orden: data.orden,
            }}
          />
        </div>
      </main>
    </>
  )
}
