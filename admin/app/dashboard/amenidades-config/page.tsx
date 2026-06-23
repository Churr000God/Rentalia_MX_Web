import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import AmenidadesConfigForm from '@/components/AmenidadesConfigForm'

const KEYS = [
  'amenidades_header_eyebrow',
  'amenidades_header_h1',
  'amenidades_header_sub',
  'amenidades_pills',
  'amenidades_stats',
  'amenidades_mapa_h2',
  'amenidades_mapa_p',
  'amenidades_mapa_stats',
  'amenidades_perfiles_h2',
  'amenidades_perfiles_sub',
] as const

type ConfigKey = typeof KEYS[number]

async function getConfig(): Promise<Record<ConfigKey, string>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_config')
    .select('key, value')
    .in('key', [...KEYS])

  const cfg: Partial<Record<ConfigKey, string>> = {}
  if (data) {
    data.forEach(row => {
      if (KEYS.includes(row.key as ConfigKey)) {
        cfg[row.key as ConfigKey] = row.value
      }
    })
  }
  return KEYS.reduce((acc, k) => {
    acc[k] = cfg[k] ?? ''
    return acc
  }, {} as Record<ConfigKey, string>)
}

export default async function AmenidadesConfigPage() {
  const cfg = await getConfig()

  const initialData = {
    amenidades_header_eyebrow: cfg['amenidades_header_eyebrow'],
    amenidades_header_h1:      cfg['amenidades_header_h1'],
    amenidades_header_sub:     cfg['amenidades_header_sub'],
    amenidades_pills:          cfg['amenidades_pills'],
    amenidades_stats:          (() => {
      try { return JSON.parse(cfg['amenidades_stats'] || '[]') } catch { return [] }
    })(),
    amenidades_mapa_h2:        cfg['amenidades_mapa_h2'],
    amenidades_mapa_p:         cfg['amenidades_mapa_p'],
    amenidades_mapa_stats:     (() => {
      try { return JSON.parse(cfg['amenidades_mapa_stats'] || '[]') } catch { return [] }
    })(),
    amenidades_perfiles_h2:    cfg['amenidades_perfiles_h2'],
    amenidades_perfiles_sub:   cfg['amenidades_perfiles_sub'],
  }

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Config. Amenidades</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Config. Amenidades</h1>
            <p className="page-header__subtitle">
              Textos y estadísticas de la página pública /amenidades — encabezado, stats, mapa y perfiles
            </p>
          </div>
        </div>

        <AmenidadesConfigForm initialData={initialData} />
      </main>
    </>
  )
}
