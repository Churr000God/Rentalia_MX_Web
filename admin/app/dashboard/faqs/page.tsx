import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import FaqsManager from '@/components/FaqsManager'

export interface FaqItem {
  id: string
  categoria: 'renta' | 'contrato' | 'convivencia' | 'casa'
  pregunta: string
  respuesta: string
  orden: number
  activo: boolean
  por_confirmar: boolean
}

async function getData(): Promise<FaqItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('faq_items')
    .select('id, categoria, pregunta, respuesta, orden, activo, por_confirmar')
    .order('orden')
  return (data ?? []) as FaqItem[]
}

export default async function FaqsPage() {
  const faqs = await getData()

  const activas  = faqs.filter(f => f.activo).length
  const inactivas = faqs.filter(f => !f.activo).length

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Preguntas frecuentes</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Preguntas frecuentes</h1>
            <p className="page-header__subtitle">
              {faqs.length} pregunta{faqs.length !== 1 ? 's' : ''} ·{' '}
              <strong>{activas}</strong> activa{activas !== 1 ? 's' : ''} ·{' '}
              {inactivas} oculta{inactivas !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <Link href="/dashboard/faqs/preguntas" className="btn btn--secondary btn--sm">
              Ver preguntas de usuarios →
            </Link>
          </div>
        </div>

        <FaqsManager faqs={faqs} />
      </main>
    </>
  )
}
