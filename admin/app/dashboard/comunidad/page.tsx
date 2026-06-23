import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import ComunidadManager from '@/components/ComunidadManager'

export interface GaleriaItem {
  id: string
  imagen_url: string
  alt_text: string | null
  caption: string | null
  orden: number
  activo: boolean
}

export interface Testimonio {
  id: string
  nombre: string
  detalle: string | null
  foto_url: string | null
  texto: string
  rating: number | null
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

export interface Evento {
  id: string
  nombre: string
  descripcion: string | null
  icono: string | null
  tiempo: string | null
  color: string
  por_confirmar: boolean
  orden: number
  activo: boolean
}

export interface Cuidamos {
  id: string
  titulo: string
  descripcion: string | null
  icono: string | null
  orden: number
  activo: boolean
}

export interface SiteConfigTextos {
  comunidad_eyebrow: string
  comunidad_h1: string
  comunidad_sub: string
  comunidad_galeria_titulo: string
  comunidad_testimonios_titulo: string
  comunidad_cta_titulo: string
  comunidad_cta_texto: string
  /* Secciones dinámicas */
  comunidad_eventos_eyebrow: string
  comunidad_eventos_titulo: string
  comunidad_cuida_eyebrow: string
  comunidad_cuida_titulo: string
  /* Narvarte afuera */
  comunidad_conn_eyebrow: string
  comunidad_conn_titulo: string
  comunidad_conn_texto: string
  comunidad_conn_link_text: string
  comunidad_conn_link_url: string
  comunidad_conn_foto1_url: string
  comunidad_conn_foto1_alt: string
  comunidad_conn_foto2_url: string
  comunidad_conn_foto2_alt: string
}

const TEXT_KEYS = [
  'comunidad_eyebrow',
  'comunidad_h1',
  'comunidad_sub',
  'comunidad_galeria_titulo',
  'comunidad_testimonios_titulo',
  'comunidad_cta_titulo',
  'comunidad_cta_texto',
  'comunidad_eventos_eyebrow',
  'comunidad_eventos_titulo',
  'comunidad_cuida_eyebrow',
  'comunidad_cuida_titulo',
  'comunidad_conn_eyebrow',
  'comunidad_conn_titulo',
  'comunidad_conn_texto',
  'comunidad_conn_link_text',
  'comunidad_conn_link_url',
  'comunidad_conn_foto1_url',
  'comunidad_conn_foto1_alt',
  'comunidad_conn_foto2_url',
  'comunidad_conn_foto2_alt',
] as const

const DEFAULT_TEXTOS: SiteConfigTextos = {
  comunidad_eyebrow:            '',
  comunidad_h1:                 '',
  comunidad_sub:                '',
  comunidad_galeria_titulo:     '',
  comunidad_testimonios_titulo: '',
  comunidad_cta_titulo:         '',
  comunidad_cta_texto:          '',
  comunidad_eventos_eyebrow:    '',
  comunidad_eventos_titulo:     '',
  comunidad_cuida_eyebrow:      '',
  comunidad_cuida_titulo:       '',
  comunidad_conn_eyebrow:       '',
  comunidad_conn_titulo:        '',
  comunidad_conn_texto:         '',
  comunidad_conn_link_text:     '',
  comunidad_conn_link_url:      '',
  comunidad_conn_foto1_url:     '',
  comunidad_conn_foto1_alt:     '',
  comunidad_conn_foto2_url:     '',
  comunidad_conn_foto2_alt:     '',
}

async function getData() {
  const supabase = await createClient()

  const [
    { data: galeriaData },
    { data: testimoniosData },
    { data: configData },
    { data: pilaresData },
    { data: eventosData },
    { data: cuidamosData },
  ] = await Promise.all([
    supabase
      .from('comunidad_galeria')
      .select('id, imagen_url, alt_text, caption, orden, activo')
      .order('orden'),
    supabase
      .from('comunidad_testimonios')
      .select('id, nombre, detalle, foto_url, texto, rating, orden, activo')
      .order('orden'),
    supabase
      .from('site_config')
      .select('key, value')
      .in('key', TEXT_KEYS),
    supabase
      .from('comunidad_pilares')
      .select('id, nombre, descripcion, icono, orden, activo')
      .order('orden'),
    supabase
      .from('comunidad_eventos')
      .select('id, nombre, descripcion, icono, tiempo, color, por_confirmar, orden, activo')
      .order('orden'),
    supabase
      .from('comunidad_cuidamos')
      .select('id, titulo, descripcion, icono, orden, activo')
      .order('orden'),
  ])

  const configMap: Record<string, string> = {}
  for (const row of configData ?? []) configMap[row.key] = row.value ?? ''

  const textos: SiteConfigTextos = { ...DEFAULT_TEXTOS }
  for (const key of TEXT_KEYS) {
    if (key in configMap) (textos as unknown as Record<string, string>)[key] = configMap[key]
  }

  return {
    galeria:     (galeriaData     ?? []) as GaleriaItem[],
    testimonios: (testimoniosData ?? []) as Testimonio[],
    pilares:     (pilaresData     ?? []) as Pilar[],
    eventos:     (eventosData     ?? []) as Evento[],
    cuidamos:    (cuidamosData    ?? []) as Cuidamos[],
    textos,
  }
}

export default async function ComunidadPage() {
  const { galeria, testimonios, pilares, eventos, cuidamos, textos } = await getData()

  const galeriaActiva      = galeria.filter(g => g.activo).length
  const testimoniosActivos = testimonios.filter(t => t.activo).length
  const pilaresActivos     = pilares.filter(p => p.activo).length
  const eventosActivos     = eventos.filter(e => e.activo).length
  const cuidamosActivos    = cuidamos.filter(c => c.activo).length

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Comunidad</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Comunidad</h1>
            <p className="page-header__subtitle">
              {galeria.length} foto{galeria.length !== 1 ? 's' : ''} ·{' '}
              <strong>{galeriaActiva}</strong> activa{galeriaActiva !== 1 ? 's' : ''} ·{' '}
              {testimonios.length} testimonio{testimonios.length !== 1 ? 's' : ''} ·{' '}
              <strong>{testimoniosActivos}</strong> activo{testimoniosActivos !== 1 ? 's' : ''} ·{' '}
              {pilaresActivos} pilar{pilaresActivos !== 1 ? 'es' : ''} ·{' '}
              {eventosActivos} evento{eventosActivos !== 1 ? 's' : ''} ·{' '}
              {cuidamosActivos} cuida{cuidamosActivos !== 1 ? 'mos' : 'mos'}
            </p>
          </div>
        </div>

        <ComunidadManager
          galeriaInit={galeria}
          testimoniosInit={testimonios}
          pilaresInit={pilares}
          eventosInit={eventos}
          cuidamosInit={cuidamos}
          textosInit={textos}
        />
      </main>
    </>
  )
}
