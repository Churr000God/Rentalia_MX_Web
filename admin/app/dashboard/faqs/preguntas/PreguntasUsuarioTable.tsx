'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { PreguntaUsuario } from './page'

type Status = PreguntaUsuario['status']

const STATUS_MAP: Record<Status, { label: string; cls: string }> = {
  pendiente:   { label: 'Pendiente',   cls: 'badge--maintenance' },
  respondida:  { label: 'Respondida',  cls: 'badge--available'   },
  publicada:   { label: 'Publicada',   cls: 'badge--available'   },
  descartada:  { label: 'Descartada',  cls: 'badge--occupied'    },
}

const ALL_STATUSES: Status[] = ['pendiente', 'respondida', 'publicada', 'descartada']

const CATEGORIAS = [
  { key: 'renta',       label: 'La renta'        },
  { key: 'contrato',    label: 'Contrato y pagos' },
  { key: 'convivencia', label: 'Convivencia'       },
  { key: 'casa',        label: 'La casa'           },
]

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

interface Props {
  preguntas: PreguntaUsuario[]
  maxOrdenActual: number
}

export default function PreguntasUsuarioTable({ preguntas: initial, maxOrdenActual }: Props) {
  const router = useRouter()
  const [preguntas,     setPreguntas]     = useState<PreguntaUsuario[]>(initial)
  const [loadingId,     setLoadingId]     = useState<string | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<PreguntaUsuario | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error,         setError]         = useState<string | null>(null)

  // ── Editor inline de respuesta y notas ───────────────────────
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [editField,   setEditField]   = useState<'respuesta' | 'notas' | null>(null)
  const [editValue,   setEditValue]   = useState('')
  const [editSaving,  setEditSaving]  = useState(false)

  // ── Estado de "publicar como FAQ" ─────────────────────────────
  const [publishingId,   setPublishingId]   = useState<string | null>(null)
  const [publishCat,     setPublishCat]     = useState<Record<string, string>>({})
  const [publishingLoading, setPublishingLoading] = useState(false)
  const [publishMsg,     setPublishMsg]     = useState<Record<string, { type: 'ok' | 'err'; text: string }>>({})

  // ── Cambiar status ────────────────────────────────────────────
  async function handleStatusChange(id: string, status: Status) {
    setLoadingId(id)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('faq_preguntas_usuario')
      .update({ status })
      .eq('id', id)

    if (err) {
      setError(`Error al actualizar: ${err.message}`)
    } else {
      setPreguntas(prev => prev.map(p => p.id === id ? { ...p, status } : p))
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
      .from('faq_preguntas_usuario')
      .delete()
      .eq('id', deleteTarget.id)

    if (err) {
      setError(`Error al eliminar: ${err.message}`)
    } else {
      setPreguntas(prev => prev.filter(p => p.id !== deleteTarget.id))
      router.refresh()
    }
    setDeleteTarget(null)
    setDeleteLoading(false)
  }

  // ── Edit inline (respuesta / notas) ──────────────────────────
  function startEdit(pregunta: PreguntaUsuario, field: 'respuesta' | 'notas') {
    setEditingId(pregunta.id)
    setEditField(field)
    setEditValue(pregunta[field] ?? '')
  }

  async function saveEdit(id: string) {
    if (!editField) return
    setEditSaving(true)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('faq_preguntas_usuario')
      .update({ [editField]: editValue || null })
      .eq('id', id)

    if (!err) {
      setPreguntas(prev =>
        prev.map(p => p.id === id ? { ...p, [editField]: editValue || null } : p)
      )
    }
    setEditingId(null)
    setEditField(null)
    setEditSaving(false)
  }

  // ── Publicar como FAQ pública ─────────────────────────────────
  function togglePublishPanel(id: string) {
    setPublishingId(prev => prev === id ? null : id)
    if (!publishCat[id]) {
      setPublishCat(prev => ({ ...prev, [id]: 'renta' }))
    }
  }

  async function publishAsFaq(pregunta: PreguntaUsuario) {
    const cat = (publishCat[pregunta.id] || 'renta') as 'renta' | 'contrato' | 'convivencia' | 'casa'
    if (!pregunta.respuesta?.trim()) {
      setPublishMsg(prev => ({ ...prev, [pregunta.id]: { type: 'err', text: 'Añade una respuesta antes de publicar.' } }))
      return
    }
    setPublishingLoading(true)
    const supabase = createClient()

    // Insertar en faq_items
    const { error: insertErr } = await supabase
      .from('faq_items')
      .insert({
        categoria:     cat,
        pregunta:      pregunta.pregunta,
        respuesta:     pregunta.respuesta,
        orden:         maxOrdenActual + 10,
        activo:        true,
        por_confirmar: false,
      })

    if (insertErr) {
      setPublishMsg(prev => ({ ...prev, [pregunta.id]: { type: 'err', text: 'Error al publicar.' } }))
      setPublishingLoading(false)
      return
    }

    // Marcar pregunta como "publicada"
    await supabase
      .from('faq_preguntas_usuario')
      .update({ status: 'publicada' })
      .eq('id', pregunta.id)

    setPreguntas(prev => prev.map(p => p.id === pregunta.id ? { ...p, status: 'publicada' } : p))
    setPublishingId(null)
    setPublishMsg(prev => ({ ...prev, [pregunta.id]: { type: 'ok', text: '¡Publicada como FAQ!' } }))
    setPublishingLoading(false)
    router.refresh()
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      {error && (
        <div className="alert alert--error" style={{ margin: '16px 16px 0' }} role="alert">
          {error}
        </div>
      )}

      {preguntas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">💬</div>
          <p className="empty-state__text">Aún no hay preguntas de usuarios.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Pregunta</th>
                <th>Estado</th>
                <th style={{ width: 220 }}>Cambiar estado</th>
                <th style={{ width: 220 }}>Respuesta interna</th>
                <th style={{ width: 160 }}>Notas</th>
                <th style={{ width: 120 }}>Publicar como FAQ</th>
                <th style={{ width: 80 }}>Fecha</th>
                <th style={{ width: 90 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {preguntas.map(pregunta => {
                const info      = STATUS_MAP[pregunta.status]
                const isLoading = loadingId === pregunta.id
                const isEditing = editingId === pregunta.id
                const pMsg      = publishMsg[pregunta.id]

                return (
                  <tr key={pregunta.id} style={{ opacity: isLoading ? 0.5 : 1 }}>

                    {/* Usuario */}
                    <td style={{ fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 600 }}>{pregunta.nombre}</div>
                      <a href={`mailto:${pregunta.email}`} style={{ color: 'var(--gray-600)', fontSize: '0.8rem' }}>
                        {pregunta.email}
                      </a>
                    </td>

                    {/* Pregunta */}
                    <td style={{ fontSize: '0.85rem', maxWidth: 200 }}>
                      {pregunta.pregunta}
                    </td>

                    {/* Estado */}
                    <td>
                      <span className={`badge ${info.cls}`}>{info.label}</span>
                    </td>

                    {/* Cambiar estado */}
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {ALL_STATUSES
                          .filter(s => s !== pregunta.status && s !== 'publicada')
                          .map(s => (
                            <button
                              key={s}
                              className="btn btn--ghost btn--sm"
                              disabled={isLoading}
                              onClick={() => handleStatusChange(pregunta.id, s)}
                            >
                              {STATUS_MAP[s].label}
                            </button>
                          ))}
                      </div>
                    </td>

                    {/* Respuesta interna */}
                    <td style={{ fontSize: '0.82rem' }}>
                      {isEditing && editField === 'respuesta' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <textarea
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: '4px 8px', fontSize: '0.82rem', border: '1.5px solid var(--border)', borderRadius: 6, resize: 'vertical' }}
                            autoFocus
                          />
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn--primary btn--sm" disabled={editSaving} onClick={() => saveEdit(pregunta.id)}>
                              {editSaving ? '…' : 'Guardar'}
                            </button>
                            <button className="btn btn--ghost btn--sm" onClick={() => { setEditingId(null); setEditField(null) }}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => startEdit(pregunta, 'respuesta')}
                          title="Clic para editar respuesta"
                          style={{ cursor: 'pointer', minHeight: 24, color: pregunta.respuesta ? 'var(--text-primary)' : 'var(--gray-400)', borderBottom: '1px dashed var(--border)', whiteSpace: 'pre-wrap' }}
                        >
                          {pregunta.respuesta ?? 'Añadir respuesta…'}
                        </div>
                      )}
                    </td>

                    {/* Notas */}
                    <td style={{ fontSize: '0.82rem' }}>
                      {isEditing && editField === 'notas' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <textarea
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            rows={2}
                            style={{ width: '100%', padding: '4px 8px', fontSize: '0.82rem', border: '1.5px solid var(--border)', borderRadius: 6, resize: 'vertical' }}
                            autoFocus
                          />
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn--primary btn--sm" disabled={editSaving} onClick={() => saveEdit(pregunta.id)}>
                              {editSaving ? '…' : 'Guardar'}
                            </button>
                            <button className="btn btn--ghost btn--sm" onClick={() => { setEditingId(null); setEditField(null) }}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => startEdit(pregunta, 'notas')}
                          title="Clic para editar notas"
                          style={{ cursor: 'pointer', minHeight: 24, color: pregunta.notas ? 'var(--text-primary)' : 'var(--gray-400)', borderBottom: '1px dashed var(--border)' }}
                        >
                          {pregunta.notas ?? 'Agregar nota…'}
                        </div>
                      )}
                    </td>

                    {/* Publicar como FAQ */}
                    <td>
                      {pregunta.status === 'publicada' ? (
                        <span className="badge badge--available" style={{ fontSize: '0.72rem' }}>Ya publicada</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {publishingId === pregunta.id ? (
                            <>
                              <select
                                value={publishCat[pregunta.id] || 'renta'}
                                onChange={e => setPublishCat(prev => ({ ...prev, [pregunta.id]: e.target.value }))}
                                style={{ fontSize: '0.78rem', padding: '4px 6px', border: '1.5px solid var(--border)', borderRadius: 6, background: 'var(--surface)' }}
                              >
                                {CATEGORIAS.map(c => (
                                  <option key={c.key} value={c.key}>{c.label}</option>
                                ))}
                              </select>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                  className="btn btn--primary btn--sm"
                                  disabled={publishingLoading}
                                  onClick={() => publishAsFaq(pregunta)}
                                >
                                  {publishingLoading ? '…' : 'Publicar'}
                                </button>
                                <button
                                  className="btn btn--ghost btn--sm"
                                  onClick={() => setPublishingId(null)}
                                >
                                  ✕
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              className="btn btn--secondary btn--sm"
                              onClick={() => togglePublishPanel(pregunta.id)}
                            >
                              Publicar como FAQ
                            </button>
                          )}
                          {pMsg && (
                            <span style={{ fontSize: '0.75rem', color: pMsg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>
                              {pMsg.text}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Fecha */}
                    <td style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                      {fmtDate(pregunta.created_at)}
                    </td>

                    {/* Acciones */}
                    <td>
                      <button
                        className="btn btn--danger btn--sm"
                        disabled={isLoading}
                        onClick={() => { setError(null); setDeleteTarget(pregunta) }}
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
        <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dlg-preg-title">
          <div className="dialog-box">
            <h2 className="dialog-box__title" id="dlg-preg-title">Eliminar pregunta</h2>
            <p className="dialog-box__body">
              ¿Eliminar la pregunta de <strong>{deleteTarget.nombre}</strong> ({deleteTarget.email})?
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
