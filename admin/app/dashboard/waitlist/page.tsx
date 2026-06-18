import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import WaitlistTable from './WaitlistTable'

interface WaitlistEntry {
  id: string
  email: string
  status: 'pendiente' | 'contactado' | 'descartado'
  created_at: string
}

async function getWaitlist(): Promise<WaitlistEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('waitlist')
    .select('id, email, status, created_at')
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data
}

export default async function WaitlistPage() {
  const entries = await getWaitlist()
  const pendientes   = entries.filter(e => e.status === 'pendiente').length
  const contactados  = entries.filter(e => e.status === 'contactado').length

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Lista de espera</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-header__title">Lista de espera</h1>
            <p className="page-header__subtitle">
              {entries.length} registro{entries.length !== 1 ? 's' : ''} ·{' '}
              <strong>{pendientes}</strong> pendiente{pendientes !== 1 ? 's' : ''} ·{' '}
              {contactados} contactado{contactados !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="card card--flat" style={{ padding: 0, overflow: 'hidden' }}>
          <WaitlistTable entries={entries} />
        </div>
      </main>
    </>
  )
}
