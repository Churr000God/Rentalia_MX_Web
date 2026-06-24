import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import NosotrosManager from '@/components/NosotrosManager'

/* ─── Tipos ──────────────────────────────────────────────── */
export interface EquipoItem {
  id: string
  nombre: string
  rol: string | null
  bio: string | null
  foto_url: string | null
  orden: number
  activo: boolean
}

export interface Pilar {
  id: string
  nombre: string
  descripcion: string | null
  icono: string | null
  orden: number
  activo: boolean
}

export interface Valor {
  id: string
  nombre: string
  descripcion: string | null
  icono: string | null
  orden: number
  activo: boolean
}

export interface SiteConfigTextos {
  nosotros_hero_pill: string
  nosotros_hero_h1: string
  nosotros_hero_sub: string
  nosotros_hero_foto_url: string
  nosotros_hero_badge_titulo: string
  nosotros_hero_badge_sub: string
  nosotros_hist_titulo: string
  nosotros_hist_p1: string
  nosotros_hist_p2: string
  nosotros_hist_p3: string
  nosotros_hist_foto_url: string
  nosotros_hist_quote: string
  nosotros_filo_eyebrow: string
  nosotros_filo_tagline: string
  nosotros_casa_eyebrow: string
  nosotros_casa_titulo: string
  nosotros_casa_sub: string
  nosotros_casa_texto: string
  nosotros_casa_stat_ubicaciones: string
  nosotros_casa_stat_habitaciones: string
  nosotros_casa_foto1_url: string
  nosotros_casa_foto1_alt: string
  nosotros_casa_foto2_url: string
  nosotros_casa_foto2_alt: string
  nosotros_casa_foto3_url: string
  nosotros_casa_foto3_alt: string
  nosotros_casa_foto4_url: string
  nosotros_casa_foto4_alt: string
  nosotros_valores_eyebrow: string
  nosotros_valores_titulo: string
  nosotros_equipo_eyebrow: string
  nosotros_equipo_titulo: string
  nosotros_equipo_sub: string
  nosotros_crece_eyebrow: string
  nosotros_crece_titulo: string
  nosotros_crece_texto: string
  nosotros_crece_badge: string
  nosotros_bridge_titulo: string
  nosotros_bridge_texto: string
  nosotros_cta_titulo: string
  nosotros_cta_sub: string
}

const TEXT_KEYS = [
  'nosotros_hero_pill',
  'nosotros_hero_h1',
  'nosotros_hero_sub',
  'nosotros_hero_foto_url',
  'nosotros_hero_badge_titulo',
  'nosotros_hero_badge_sub',
  'nosotros_hist_titulo',
  'nosotros_hist_p1',
  'nosotros_hist_p2',
  'nosotros_hist_p3',
  'nosotros_hist_foto_url',
  'nosotros_hist_quote',
  'nosotros_filo_eyebrow',
  'nosotros_filo_tagline',
  'nosotros_casa_eyebrow',
  'nosotros_casa_titulo',
  'nosotros_casa_sub',
  'nosotros_casa_texto',
  'nosotros_casa_stat_ubicaciones',
  'nosotros_casa_stat_habitaciones',
  'nosotros_casa_foto1_url',
  'nosotros_casa_foto1_alt',
  'nosotros_casa_foto2_url',
  'nosotros_casa_foto2_alt',
  'nosotros_casa_foto3_url',
  'nosotros_casa_foto3_alt',
  'nosotros_casa_foto4_url',
  'nosotros_casa_foto4_alt',
  'nosotros_valores_eyebrow',
  'nosotros_valores_titulo',
  'nosotros_equipo_eyebrow',
  'nosotros_equipo_titulo',
  'nosotros_equipo_sub',
  'nosotros_crece_eyebrow',
  'nosotros_crece_titulo',
  'nosotros_crece_texto',
  'nosotros_crece_badge',
  'nosotros_bridge_titulo',
  'nosotros_bridge_texto',
  'nosotros_cta_titulo',
  'nosotros_cta_sub',
] as const

const DEFAULT_TEXTOS: SiteConfigTextos = {
  nosotros_hero_pill:              '',
  nosotros_hero_h1:                '',
  nosotros_hero_sub:               '',
  nosotros_hero_foto_url:          '',
  nosotros_hero_badge_titulo:      '',
  nosotros_hero_badge_sub:         '',
  nosotros_hist_titulo:            '',
  nosotros_hist_p1:                '',
  nosotros_hist_p2:                '',
  nosotros_hist_p3:                '',
  nosotros_hist_foto_url:          '',
  nosotros_hist_quote:             '',
  nosotros_filo_eyebrow:           '',
  nosotros_filo_tagline:           '',
  nosotros_casa_eyebrow:           '',
  nosotros_casa_titulo:            '',
  nosotros_casa_sub:               '',
  nosotros_casa_texto:             '',
  nosotros_casa_stat_ubicaciones:  '',
  nosotros_casa_stat_habitaciones: '',
  nosotros_casa_foto1_url:         '',
  nosotros_casa_foto1_alt:         '',
  nosotros_casa_foto2_url:         '',
  nosotros_casa_foto2_alt:         '',
  nosotros_casa_foto3_url:         '',
  nosotros_casa_foto3_alt:         '',
  nosotros_casa_foto4_url:         '',
  nosotros_casa_foto4_alt:         '',
  nosotros_valores_eyebrow:        '',
  nosotros_valores_titulo:         '',
  nosotros_equipo_eyebrow:         '',
  nosotros_equipo_titulo:          '',
  nosotros_equipo_sub:             '',
  nosotros_crece_eyebrow:          '',
  nosotros_crece_titulo:           '',
  nosotros_crece_texto:            '',
  nosotros_crece_badge:            '',
  nosotros_bridge_titulo:          '',
  nosotros_bridge_texto:           '',
  nosotros_cta_titulo:             '',
  nosotros_cta_sub:                '',
}

async function getData() {
  const supabase = await createClient()

  const [
    { data: equipoData },
    { data: pilaresData },
    { data: valoresData },
    { data: configData },
  ] = await Promise.all([
    supabase
      .from('nosotros_equipo')
      .select('id, nombre, rol, bio, foto_url, orden, activo')
      .order('orden'),
    supabase
      .from('nosotros_pilares')
      .select('id, nombre, descripcion, icono, orden, activo')
      .order('orden'),
    supabase
      .from('nosotros_valores')
      .select('id, nombre, descripcion, icono, orden, activo')
      .order('orden'),
    supabase
      .from('site_config')
      .select('key, value')
      .in('key', TEXT_KEYS),
  ])

  const configMap: Record<string, string> = {}
  for (const row of configData ?? []) configMap[row.key] = row.value ?? ''

  const textos: SiteConfigTextos = { ...DEFAULT_TEXTOS }
  for (const key of TEXT_KEYS) {
    if (key in configMap) (textos as unknown as Record<string, string>)[key] = configMap[key]
  }

  return {
    equipo:  (equipoData  ?? []) as EquipoItem[],
    pilares: (pilaresData ?? []) as Pilar[],
    valores: (valoresData ?? []) as Valor[],
    textos,
  }
}

export default async function NosotrosPage() {
  const { equipo, pilares, valores, textos } = await getData()

  const equipoActivo  = equipo.filter(e => e.activo).length
  const pilaresActivos = pilares.filter(p => p.activo).length
  const valoresActivos = valores.filter(v => v.activo).length

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Nosotros</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Nosotros</h1>
            <p className="page-header__subtitle">
              {equipo.length} persona{equipo.length !== 1 ? 's' : ''} en equipo ·{' '}
              <strong>{equipoActivo}</strong> visible{equipoActivo !== 1 ? 's' : ''} ·{' '}
              {pilaresActivos} pilar{pilaresActivos !== 1 ? 'es' : ''} ·{' '}
              {valoresActivos} valor{valoresActivos !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>

        <NosotrosManager
          equipoInit={equipo}
          pilaresInit={pilares}
          valoresInit={valores}
          textosInit={textos}
        />
      </main>
    </>
  )
}
