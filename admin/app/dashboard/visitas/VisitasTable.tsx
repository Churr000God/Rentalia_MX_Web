'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Visita } from './page'

type Status = Visita['status']

const STATUS_MAP: Record<Status, { label: string; cls: string }> = {
  pendiente:   { label: 'Pendiente',   cls: 'badge--maintenance' },
  contactado:  { label: 'Contactado',  cls: 'badge--available'   },
  agendado:    { label: 'Agendado',    cls: 'badge--available'   },
  descartado:  { label: 'Descartado',  cls: 'badge--occupied'    },
}

const ALL_STATUSES: Status[] = ['pendiente', 'contactado', 'agendado', 'descartado']

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

interface Props {
  visitas: Visita[]
  initialNotifyEmail: string
}

export default function VisitasTable({ visitas: initial, initialNotifyEmail }: Props) {
  const router = useRouter()
  const [visitas,     setVisitas]     = useState<Visita[]>(initial)
  const [loadingId,   setLoadingId]   = useState<string | null>(null)
  const [deleteTarget,setDeleteTarget]= useState<Visita | null>(null)
  const [deleteLoading,setDeleteLoading] = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  // ── Notas inline ─────────────────────────────────────────────
  const [editingNotasId, setEditingNotasId] = useState<string | null>(null)
  const [notasValue,     setNotasValue]     = useState('')
  const [notasSaving,    setNotasSaving]    = useState(false)

  // ── Config: correo de notificación del equipo ─────────────────
  const [notifyEmail,    setNotifyEmail]    = useState(initialNotifyEmail)
  const [notifyOriginal, setNotifyOriginal] = useState(initialNotifyEmail)
  const [notifySaving,   setNotifySaving]   = useState(false)
  const [notifyMsg,      setNotifyMsg]      = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // ── Cambiar status ────────────────────────────────────────────
  async function handleStatusChange(id: string, status: Status) {
    setLoadingId(id)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('visitas')
      .update({ status })
      .eq('id', id)

    if (err) {
      setError(`Error al actualizar: ${err.message}`)
    } else {
      setVisitas(prev => prev.map(v => v.id === id ? { ...v, status } : v))
    }
    setLoadingId(null)
  }

  // ── Eliminar ──────────────────────────────────────────────────
  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('visitas')
      .delete()
      .eq('id', deleteTarget.id)

    if (err) {
      setError(`Error al eliminar: ${err.message}`)
    } else {
      setVisitas(prev => prev.filter(v => v.id !== deleteTarget.id))
      router.refresh()
    }
    setDeleteTarget(null)
    setDeleteLoading(false)
  }

  // ── Notas ─────────────────────────────────────────────────────
  function startEditNotas(visita: Visita) {
    setEditingNotasId(visita.id)
    setNotasValue(visita.notas ?? '')
  }

  async function saveNotas(id: string) {
    setNotasSaving(true)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('visitas')
      .update({ notas: notasValue || null })
      .eq('id', id)

    if (!err) {
      setVisitas(prev => prev.map(v => v.id === id ? { ...v, notas: notasValue || null } : v))
    }
    setEditingNotasId(null)
    setNotasSaving(false)
  }

  // ── Correo de notificación del equipo ────────────────────────
  async function saveNotifyEmail() {
    setNotifySaving(true)
    setNotifyMsg(null)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('site_config')
      .upsert({ key: 'visitas_notify_email', value: notifyEmail.trim(), updated_at: new Date().toISOString() })

    setNotifySaving(false)
    if (err) {
      setNotifyMsg({ type: 'err', text: 'Error al guardar. Intenta de nuevo.' })
    } else {
      setNotifyOriginal(notifyEmail.trim())
      setNotifyMsg({ type: 'ok', text: 'Correo de notificación actualizado.' })
      setTimeout(() => setNotifyMsg(null), 3000)
    }
  }

  // ── Config panel ──────────────────────────────────────────────
  const configChanged = notifyEmail.trim() !== notifyOriginal.trim()

  return (
    <>
      {/* Config: correo de notificación */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--gray-500)', marginBottom: 8 }}>
          Notificaciones por correo
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="email"
            value={notifyEmail}
            onChange={e => setNotifyEmail(e.target.value)}
            placeholder="hola@rentalia.mx"
            style={{ flex: '1 1 220px', padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.875rem', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }}
            aria-label="Correo de notificación del equipo"
          />
          <button
            className="btn btn--primary btn--sm"
            onClick={saveNotifyEmail}
            disabled={notifySaving || !configChanged}
          >
            {notifySaving ? 'Guardando…' : 'Guardar'}
          </button>
          {notifyMsg && (
            <span className={`alert alert--${notifyMsg.type === 'ok' ? 'success' : 'error'}`}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 6 }}>
              {notifyMsg.text}
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 6 }}>
          El FastAPI enviará la notificación a este correo cuando llegue una solicitud nueva.
        </p>
      </div>

      {error && (
        <div className="alert alert--error" style={{ margin: '16px 16px 0' }} role="alert">
          {error}
        </div>
      )}

      {visitas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🗓</div>
          <p className="empty-state__text">Aún no hay solicitudes de visita.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Cuarto</th>
                <th>Preferencia / Mensaje</th>
                <th>Estado</th>
                <th style={{ width: 220 }}>Cambiar estado</th>
                <th style={{ width: 200 }}>Notas internas</th>
                <th style={{ width: 80 }}>Fecha</th>
                <th style={{ width: 90 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visitas.map(visita => {
                const info      = STATUS_MAP[visita.status]
                const isLoading = loadingId === visita.id

                return (
                  <tr key={visita.id} style={{ opacity: isLoading ? 0.5 : 1 }}>

                    {/* Nombre */}
                    <td style={{ fontWeight: 600 }}>{visita.nombre}</td>

                    {/* Contacto */}
                    <td style={{ fontSize: '0.85rem' }}>
                      <div>
                        <a href={`https://wa.me/${visita.whatsapp.replace(/\D/g, '')}`}
                           target="_blank" rel="noopener noreferrer"
                           style={{ color: 'var(--primary)', fontWeight: 600, display: 'block' }}>
                          📱 {visita.whatsapp}
                        </a>
                        <a href={`mailto:${visita.email}`}
                           style={{ color: 'var(--gray-600)', fontSize: '0.8rem' }}>
                          {visita.email}
                        </a>
                      </div>
                    </td>

                    {/* Cuarto */}
                    <td style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                      {visita.habitacion_nombre ?? <span style={{ color: 'var(--gray-400)' }}>—</span>}
                    </td>

                    {/* Preferencia / Mensaje */}
                    <td style={{ fontSize: '0.82rem', color: 'var(--gray-600)', maxWidth: 160 }}>
                      {visita.fecha_preferida && (
                        <div style={{ fontWeight: 500, marginBottom: 2 }}>
                          🗓 {visita.fecha_preferida}
                        </div>
                      )}
                      {visita.mensaje && (
                        <div style={{ color: 'var(--gray-500)', whiteSpace: 'pre-wrap' }}>
                          {visita.mensaje.length > 80
                            ? visita.mensaje.slice(0, 80) + '…'
                            : visita.mensaje}
                        </div>
                      )}
                      {!visita.fecha_preferida && !visita.mensaje && (
                        <span style={{ color: 'var(--gray-400)' }}>—</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td>
                      <span className={`badge ${info.cls}`}>{info.label}</span>
                    </td>

                    {/* Cambiar estado */}
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {ALL_STATUSES
                          .filter(s => s !== visita.status)
                          .map(s => (
                            <button
                              key={s}
                              className="btn btn--ghost btn--sm"
                              disabled={isLoading}
                              onClick={() => handleStatusChange(visita.id, s)}
                            >
                              {STATUS_MAP[s].label}
                            </button>
                          ))}
                      </div>
                    </td>

                    {/* Notas internas */}
                    <td style={{ fontSize: '0.82rem' }}>
                      {editingNotasId === visita.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <textarea
                            value={notasValue}
                            onChange={e => setNotasValue(e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: '4px 8px', fontSize: '0.82rem', border: '1.5px solid var(--border)', borderRadius: 6, resize: 'vertical' }}
                            autoFocus
                          />
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              className="btn btn--primary btn--sm"
                              disabled={notasSaving}
                              onClick={() => saveNotas(visita.id)}
                            >
                              {notasSaving ? '…' : 'Guardar'}
                            </button>
                            <button
                              className="btn btn--ghost btn--sm"
                              onClick={() => setEditingNotasId(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => startEditNotas(visita)}
                          title="Clic para editar notas"
                          style={{ cursor: 'pointer', minHeight: 24, color: visita.notas ? 'var(--text-primary)' : 'var(--gray-400)', borderBottom: '1px dashed var(--border)' }}
                        >
                          {visita.notas ?? 'Agregar nota…'}
                        </div>
                      )}
                    </td>

                    {/* Fecha */}
                    <td style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                      {fmtDate(visita.created_at)}
                    </td>

                    {/* Acciones */}
                    <td>
                      <button
                        className="btn btn--danger btn--sm"
                        disabled={isLoading}
                        onClick={() => { setError(null); setDeleteTarget(visita) }}
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
      )}

      {/* Diálogo de confirmación de eliminación */}
      {deleteTarget && (
        <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dlg-vis-title">
          <div className="dialog-box">
            <h2 className="dialog-box__title" id="dlg-vis-title">Eliminar solicitud</h2>
            <p className="dialog-box__body">
              ¿Eliminar la solicitud de <strong>{deleteTarget.nombre}</strong> ({deleteTarget.email})?
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
