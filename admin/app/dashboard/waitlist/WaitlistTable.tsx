'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Status = 'pendiente' | 'contactado' | 'descartado'

interface WaitlistEntry {
  id: string
  email: string
  status: Status
  created_at: string
}

const STATUS_MAP: Record<Status, { label: string; cls: string }> = {
  pendiente:   { label: 'Pendiente',   cls: 'badge--maintenance' },
  contactado:  { label: 'Contactado',  cls: 'badge--available' },
  descartado:  { label: 'Descartado',  cls: 'badge--occupied' },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function WaitlistTable({ entries: initial }: { entries: WaitlistEntry[] }) {
  const router = useRouter()
  const [entries, setEntries] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WaitlistEntry | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStatusChange(id: string, status: Status) {
    setLoadingId(id)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('waitlist')
      .update({ status })
      .eq('id', id)

    if (err) {
      setError(`Error al actualizar: ${err.message}`)
    } else {
      setEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
    }
    setLoadingId(null)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('waitlist')
      .delete()
      .eq('id', deleteTarget.id)

    if (err) {
      setError(`Error al eliminar: ${err.message}`)
    } else {
      setEntries(prev => prev.filter(e => e.id !== deleteTarget.id))
      router.refresh()
    }
    setDeleteTarget(null)
    setDeleteLoading(false)
  }

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">✉️</div>
        <p className="empty-state__text">Aún no hay registros en la lista de espera.</p>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="alert alert--error" style={{ margin: '16px 16px 0' }} role="alert">
          {error}
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Correo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th style={{ width: 200 }}>Cambiar estado</th>
              <th style={{ width: 90 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const info = STATUS_MAP[entry.status]
              const isLoading = loadingId === entry.id
              return (
                <tr key={entry.id} style={{ opacity: isLoading ? 0.5 : 1 }}>
                  <td style={{ fontWeight: 500 }}>{entry.email}</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                    {fmtDate(entry.created_at)}
                  </td>
                  <td>
                    <span className={`badge ${info.cls}`}>{info.label}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(['pendiente', 'contactado', 'descartado'] as Status[])
                        .filter(s => s !== entry.status)
                        .map(s => (
                          <button
                            key={s}
                            className="btn btn--ghost btn--sm"
                            disabled={isLoading}
                            onClick={() => handleStatusChange(entry.id, s)}
                          >
                            {STATUS_MAP[s].label}
                          </button>
                        ))}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn--danger btn--sm"
                      disabled={isLoading}
                      onClick={() => { setError(null); setDeleteTarget(entry) }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
          <div className="dialog-box">
            <h2 className="dialog-box__title" id="dlg-title">Eliminar registro</h2>
            <p className="dialog-box__body">
              ¿Eliminar <strong>{deleteTarget.email}</strong> de la lista de espera?
              Esta acción no se puede deshacer.
            </p>
            <div className="dialog-box__actions">
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button
                className="btn btn--danger btn--sm"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
