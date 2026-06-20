import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import RoomForm from '@/components/RoomForm'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getHabitacion(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('habitaciones')
    .select(
      'id, nombre, descripcion, zona, ubicacion_id, tipo, status, precio_min, precio_max, imagen_principal, imagenes, amenities, tags, incluye, orden, piso, metros_cuadrados, fecha_disponibilidad'
    )
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

async function getUbicaciones() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ubicaciones')
    .select('id, nombre, zona')
    .eq('activo', true)
    .order('orden', { ascending: true })
  return data ?? []
}

export default async function EditarHabitacionPage({ params }: PageProps) {
  const { id } = await params
  const [habitacion, ubicaciones] = await Promise.all([
    getHabitacion(id),
    getUbicaciones(),
  ])

  if (!habitacion) {
    notFound()
  }

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <Link href="/dashboard/habitaciones">Habitaciones</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Editar</span>
        </nav>
      </header>

      <main className="page-content">
        <Link href="/dashboard/habitaciones" className="back-link">
          ← Volver a habitaciones
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-header__title">Editar habitación</h1>
            <p className="page-header__subtitle">{habitacion.nombre}</p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 780 }}>
          <RoomForm
            mode="edit"
            ubicaciones={ubicaciones}
            initialData={{
              id: habitacion.id,
              nombre: habitacion.nombre,
              descripcion: habitacion.descripcion,
              zona: habitacion.zona,
              ubicacion_id: habitacion.ubicacion_id,
              tipo: habitacion.tipo,
              status: habitacion.status,
              precio_min: habitacion.precio_min,
              precio_max: habitacion.precio_max,
              imagen_principal: habitacion.imagen_principal,
              imagenes: habitacion.imagenes,
              amenities: habitacion.amenities,
              tags: habitacion.tags,
              incluye: habitacion.incluye,
              orden: habitacion.orden,
              piso: habitacion.piso,
              metros_cuadrados: habitacion.metros_cuadrados,
              fecha_disponibilidad: habitacion.fecha_disponibilidad,
            }}
          />
        </div>
      </main>
    </>
  )
}
