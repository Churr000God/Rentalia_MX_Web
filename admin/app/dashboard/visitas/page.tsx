import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import VisitasTable from './VisitasTable'

export interface Visita {
  id: string
  nombre: string
  whatsapp: string
  email: string
  habitacion_nombre: string | null
  fecha_preferida: string | null
  mensaje: string | null
  status: 'pendiente' | 'contactado' | 'agendado' | 'descartado'
  notas: string | null
  created_at: string
}

async function getData(): Promise<{ visitas: Visita[]; notifyEmail: string }> {
  const supabase = await createClient()

  const [visitasRes, configRes] = await Promise.all([
    supabase
      .from('visitas')
      .select('id, nombre, whatsapp, email, habitacion_nombre, fecha_preferida, mensaje, status, notas, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('site_config')
      .select('value')
      .eq('key', 'visitas_notify_email')
      .single(),
  ])

  return {
    visitas:     (visitasRes.data ?? []) as Visita[],
    notifyEmail: configRes.data?.value ?? '',
  }
}

export default async function VisitasPage() {
  const { visitas, notifyEmail } = await getData()

  const pendientes  = visitas.filter(v => v.status === 'pendiente').length
  const contactados = visitas.filter(v => v.status === 'contactado').length
  const agendados   = visitas.filter(v => v.status === 'agendado').length

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Visitas agendadas</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Visitas agendadas</h1>
            <p className="page-header__subtitle">
              {visitas.length} solicitud{visitas.length !== 1 ? 'es' : ''} ·{' '}
              <strong>{pendientes}</strong> pendiente{pendientes !== 1 ? 's' : ''} ·{' '}
              {contactados} contactado{contactados !== 1 ? 's' : ''} ·{' '}
              {agendados} agendado{agendados !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="card card--flat" style={{ padding: 0, overflow: 'hidden' }}>
          <VisitasTable visitas={visitas} initialNotifyEmail={notifyEmail} />
        </div>
      </main>
    </>
  )
}
