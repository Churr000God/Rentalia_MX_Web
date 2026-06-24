import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import FooterContactoForm from '@/components/FooterContactoForm'

export interface FooterContacto {
  footer_whatsapp:  string
  footer_email:     string
  footer_instagram: string
  footer_direccion: string
}

const KEYS = [
  'footer_whatsapp',
  'footer_email',
  'footer_instagram',
  'footer_direccion',
] as const

const DEFAULTS: FooterContacto = {
  footer_whatsapp:  '5215523215421',
  footer_email:     'hola@rentalia.mx',
  footer_instagram: 'rentalia.mx',
  footer_direccion: 'C. Palenque 35, Narvarte Poniente, Benito Juárez, CDMX',
}

async function getData(): Promise<FooterContacto> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_config')
    .select('key, value')
    .in('key', KEYS)

  const map: Record<string, string> = {}
  for (const row of data ?? []) map[row.key] = row.value ?? ''

  const contacto = { ...DEFAULTS }
  for (const key of KEYS) {
    if (key in map) (contacto as Record<string, string>)[key] = map[key]
  }
  return contacto
}

export default async function FooterContactoPage() {
  const contacto = await getData()

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Footer / Contacto</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Footer · Datos de contacto</h1>
            <p className="page-header__subtitle">
              Enlace de WhatsApp, email, Instagram y dirección que aparecen en el pie de página del sitio público.
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--secondary btn--sm"
          >
            Ver sitio público ↗
          </a>
        </div>

        <FooterContactoForm contactoInit={contacto} />
      </main>
    </>
  )
}
