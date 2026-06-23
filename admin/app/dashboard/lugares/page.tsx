import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import LugaresManager, { type LugarItem } from '@/components/LugaresManager'

async function getLugares(): Promise<LugarItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lugares_cercanos')
    .select('id, categoria, nombre, distancia, descripcion, lat, lng, por_confirmar, activo, orden')
    .order('orden', { ascending: true })
  if (error || !data) return []
  return data as LugarItem[]
}

export default async function LugaresPage() {
  const lugares = await getLugares()
  const activos = lugares.filter(l => l.activo).length

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Lugares cercanos</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Lugares cercanos</h1>
            <p className="page-header__subtitle">
              {activos} activo{activos !== 1 ? 's' : ''} · {lugares.length} en total — se muestran en la sección &ldquo;Narvarte a tu alcance&rdquo;
            </p>
          </div>
        </div>

        <LugaresManager lugares={lugares} />
      </main>
    </>
  )
}
