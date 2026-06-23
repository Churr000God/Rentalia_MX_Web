import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import AmenidadesPerfilesManager, { type PerfilItem } from '@/components/AmenidadesPerfilesManager'

async function getPerfiles(): Promise<PerfilItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('amenidades_perfiles')
    .select('id, slug, role_label, titulo, descripcion, puntos, icono, activo')
    .order('orden', { ascending: true })
  if (error || !data) return []
  return data.map(p => ({
    ...p,
    puntos: Array.isArray(p.puntos) ? p.puntos : [],
  })) as PerfilItem[]
}

export default async function AmenidadesPerfilesPage() {
  const perfiles = await getPerfiles()

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Perfiles</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Perfiles &ldquo;Perfecto para ti&rdquo;</h1>
            <p className="page-header__subtitle">
              Los 3 perfiles de la sección &ldquo;¿Para quién?&rdquo; de la página Amenidades
            </p>
          </div>
        </div>

        <AmenidadesPerfilesManager perfiles={perfiles} />
      </main>
    </>
  )
}
