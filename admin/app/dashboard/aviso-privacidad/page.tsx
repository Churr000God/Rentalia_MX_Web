import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import AvisoPrivacidadForm from '@/components/AvisoPrivacidadForm'

export interface AvisoTextos {
  aviso_responsable_razon_social: string
  aviso_responsable_domicilio:    string
  aviso_whatsapp:                 string
  aviso_fecha:                    string
  aviso_pasarela:                 string
  aviso_proveedores:              string
}

const KEYS = [
  'aviso_responsable_razon_social',
  'aviso_responsable_domicilio',
  'aviso_whatsapp',
  'aviso_fecha',
  'aviso_pasarela',
  'aviso_proveedores',
] as const

const DEFAULTS: AvisoTextos = {
  aviso_responsable_razon_social: '',
  aviso_responsable_domicilio:    '',
  aviso_whatsapp:                 '+52 1 55 2321 5421',
  aviso_fecha:                    'junio de 2026',
  aviso_pasarela:                 '',
  aviso_proveedores:              '',
}

async function getData(): Promise<AvisoTextos> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_config')
    .select('key, value')
    .in('key', KEYS)

  const map: Record<string, string> = {}
  for (const row of data ?? []) map[row.key] = row.value ?? ''

  const textos = { ...DEFAULTS }
  for (const key of KEYS) {
    if (key in map) (textos as Record<string, string>)[key] = map[key]
  }
  return textos
}

export default async function AvisoPrivacidadPage() {
  const textos = await getData()

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Aviso de privacidad</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Aviso de privacidad</h1>
            <p className="page-header__subtitle">
              Datos legales que aparecen en la página pública del aviso de privacidad.
            </p>
          </div>
          <a
            href="/pages/aviso-privacidad.html"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--secondary btn--sm"
          >
            Ver página pública ↗
          </a>
        </div>

        <AvisoPrivacidadForm textosInit={textos} />
      </main>
    </>
  )
}
