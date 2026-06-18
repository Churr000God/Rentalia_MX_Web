import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import HomeConfigForm from '@/components/HomeConfigForm'

interface Habitacion {
  id: string
  nombre: string
  zona: string | null
  precio_min: number | null
  imagen_principal: string | null
  status: string | null
}

interface GallerySlot {
  slot: number
  label: string
  photo_url: string | null
  alt_text: string | null
}

async function getData() {
  const supabase = await createClient()

  const [habRes, galleryRes, configRes] = await Promise.all([
    supabase
      .from('habitaciones')
      .select('id, nombre, zona, precio_min, imagen_principal, status')
      .order('orden', { ascending: true, nullsFirst: false }),
    supabase
      .from('community_gallery')
      .select('slot, label, photo_url, alt_text')
      .order('slot', { ascending: true }),
    supabase
      .from('site_config')
      .select('key, value')
      .eq('key', 'hero_habitacion_id')
      .single(),
  ])

  return {
    habitaciones: (habRes.data ?? []) as Habitacion[],
    gallery: (galleryRes.data ?? []) as GallerySlot[],
    heroRoomId: configRes.data?.value ?? null,
  }
}

export default async function HomeConfigPage() {
  const { habitaciones, gallery, heroRoomId } = await getData()

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Config. Home</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Config. Home</h1>
            <p className="page-header__subtitle">
              Hero del home y galería de la sección Comunidad
            </p>
          </div>
        </div>

        <HomeConfigForm
          habitaciones={habitaciones}
          gallery={gallery}
          heroRoomId={heroRoomId}
        />
      </main>
    </>
  )
}
