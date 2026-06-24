import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import TerminosCondicionesForm from '@/components/TerminosCondicionesForm'

export interface TerminosTextos {
  terminos_fecha:           string
  terminos_razon_social:    string
  terminos_domicilio:       string
  terminos_email:           string
  terminos_whatsapp:        string
  terminos_estancia_minima: string
  terminos_precio_rango:    string
  terminos_deposito:        string
  terminos_cancelacion:     string
  terminos_recargos:        string
  terminos_mascotas:        string
  terminos_pasarela:        string
}

const KEYS = [
  'terminos_fecha',
  'terminos_razon_social',
  'terminos_domicilio',
  'terminos_email',
  'terminos_whatsapp',
  'terminos_estancia_minima',
  'terminos_precio_rango',
  'terminos_deposito',
  'terminos_cancelacion',
  'terminos_recargos',
  'terminos_mascotas',
  'terminos_pasarela',
] as const

const DEFAULTS: TerminosTextos = {
  terminos_fecha:           'junio de 2026',
  terminos_razon_social:    '',
  terminos_domicilio:       '',
  terminos_email:           'hola@rentalia.mx',
  terminos_whatsapp:        '+52 1 55 2321 5421',
  terminos_estancia_minima: '1 mes',
  terminos_precio_rango:    '$10,000 a $12,500 MXN al mes',
  terminos_deposito:        '',
  terminos_cancelacion:     '',
  terminos_recargos:        '',
  terminos_mascotas:        '',
  terminos_pasarela:        '',
}

async function getData(): Promise<TerminosTextos> {
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

export default async function TerminosCondicionesPage() {
  const textos = await getData()

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Términos y condiciones</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Términos y condiciones</h1>
            <p className="page-header__subtitle">
              Datos legales que aparecen en la página pública de términos y condiciones.
            </p>
          </div>
          <a
            href="/pages/terminos-condiciones.html"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--secondary btn--sm"
          >
            Ver página pública ↗
          </a>
        </div>

        <TerminosCondicionesForm textosInit={textos} />
      </main>
    </>
  )
}
