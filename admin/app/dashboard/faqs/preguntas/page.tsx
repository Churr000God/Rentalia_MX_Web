import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import PreguntasUsuarioTable from './PreguntasUsuarioTable'

export interface PreguntaUsuario {
  id: string
  nombre: string
  email: string
  pregunta: string
  status: 'pendiente' | 'respondida' | 'publicada' | 'descartada'
  respuesta: string | null
  notas: string | null
  created_at: string
}

export interface FaqItemPublic {
  id: string
  categoria: 'renta' | 'contrato' | 'convivencia' | 'casa'
  pregunta: string
  respuesta: string
  orden: number
  activo: boolean
  por_confirmar: boolean
}

async function getData(): Promise<{ preguntas: PreguntaUsuario[]; maxOrden: number }> {
  const supabase = await createClient()

  const [preguntasRes, faqsRes] = await Promise.all([
    supabase
      .from('faq_preguntas_usuario')
      .select('id, nombre, email, pregunta, status, respuesta, notas, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('faq_items')
      .select('orden')
      .order('orden', { ascending: false })
      .limit(1),
  ])

  const maxOrden = faqsRes.data?.[0]?.orden ?? 0

  return {
    preguntas: (preguntasRes.data ?? []) as PreguntaUsuario[],
    maxOrden,
  }
}

export default async function PreguntasUsuarioPage() {
  const { preguntas, maxOrden } = await getData()

  const pendientes  = preguntas.filter(p => p.status === 'pendiente').length
  const respondidas = preguntas.filter(p => p.status === 'respondida').length

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <Link href="/dashboard/faqs">Preguntas frecuentes</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Preguntas de usuarios</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Preguntas de usuarios</h1>
            <p className="page-header__subtitle">
              {preguntas.length} pregunta{preguntas.length !== 1 ? 's' : ''} ·{' '}
              <strong>{pendientes}</strong> pendiente{pendientes !== 1 ? 's' : ''} ·{' '}
              {respondidas} respondida{respondidas !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="card card--flat" style={{ padding: 0, overflow: 'hidden' }}>
          <PreguntasUsuarioTable preguntas={preguntas} maxOrdenActual={maxOrden} />
        </div>
      </main>
    </>
  )
}
