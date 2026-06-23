import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import BarrioFotosManager, { type BarrioFotoSlot } from '@/components/BarrioFotosManager'

async function getSlots(): Promise<BarrioFotoSlot[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('barrio_fotos')
    .select('id, slot, label, photo_url, alt_text, active')
    .order('slot', { ascending: true })
  if (error || !data) return []
  return data as BarrioFotoSlot[]
}

export default async function BarrioFotosPage() {
  const slots = await getSlots()
  const conFoto = slots.filter(s => s.photo_url).length

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Fotos del barrio</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Fotos del barrio</h1>
            <p className="page-header__subtitle">
              {conFoto} de {slots.length} slots con foto — collage de 5 imágenes en la página Amenidades
            </p>
          </div>
        </div>

        <BarrioFotosManager slots={slots} />
      </main>
    </>
  )
}
