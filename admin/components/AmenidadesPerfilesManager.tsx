'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export interface PerfilItem {
  id: string
  slug: string
  role_label: string
  titulo: string
  descripcion: string
  puntos: string[]
  icono: string
  activo: boolean
}

type Msg = { type: 'ok' | 'err'; text: string }

const SLUG_LABEL: Record<string, string> = {
  estudiantes:    'Estudiantes',
  profesionistas: 'Profesionistas',
  viajeros:       'Viajeros',
}

interface Props { perfiles: PerfilItem[] }

export default function AmenidadesPerfilesManager({ perfiles: initPerfiles }: Props) {
  const [perfiles, setPerfiles] = useState<PerfilItem[]>(
    [...initPerfiles].sort((a, b) => {
      const order = ['estudiantes', 'profesionistas', 'viajeros']
      return order.indexOf(a.slug) - order.indexOf(b.slug)
    })
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [msgs,   setMsgs]   = useState<Record<string, Msg>>({})

  function updatePerfil(id: string, field: keyof PerfilItem, val: string | boolean | string[]) {
    setPerfiles(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p))
  }

  function updatePunto(id: string, idx: number, val: string) {
    const perfil = perfiles.find(p => p.id === id)
    if (!perfil) return
    const newPuntos = [...perfil.puntos]
    newPuntos[idx] = val
    updatePerfil(id, 'puntos', newPuntos)
  }

  function addPunto(id: string) {
    const perfil = perfiles.find(p => p.id === id)
    if (!perfil) return
    updatePerfil(id, 'puntos', [...perfil.puntos, ''])
  }

  function removePunto(id: string, idx: number) {
    const perfil = perfiles.find(p => p.id === id)
    if (!perfil) return
    updatePerfil(id, 'puntos', perfil.puntos.filter((_, i) => i !== idx))
  }

  async function savePerfil(id: string) {
    const p = perfiles.find(p => p.id === id)
    if (!p) return
    setSaving(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('amenidades_perfiles')
      .update({
        role_label:  p.role_label,
        titulo:      p.titulo,
        descripcion: p.descripcion,
        puntos:      p.puntos.filter(s => s.trim()),
        icono:       p.icono,
        activo:      p.activo,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', id)
    setSaving(null)
    setMsgs(prev => ({
      ...prev,
      [id]: error
        ? { type: 'err', text: 'Error al guardar.' }
        : { type: 'ok',  text: 'Guardado.' },
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Los 3 perfiles</h2>
          <p className="card__subtitle">
            Edita el contenido de cada tarjeta. El icono es un nombre de Material Symbols Outlined
            (p. ej. <code>school</code>, <code>laptop</code>, <code>travel_explore</code>).
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {perfiles.map(p => {
            const msg      = msgs[p.id]
            const isSaving = saving === p.id
            const slugName = SLUG_LABEL[p.slug] || p.slug
            return (
              <div
                key={p.id}
                style={{
                  padding: '1rem', borderRadius: 12,
                  background: p.activo ? 'var(--surface-2, #f5f5f0)' : 'rgba(0,0,0,.035)',
                  opacity: p.activo ? 1 : 0.65,
                  display: 'flex', flexDirection: 'column', gap: '.65rem',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--selva, #1E4D3C)' }}>
                    {slugName}
                  </span>
                  <code style={{ fontSize: '.72rem', color: 'var(--text-3)', background: 'rgba(0,0,0,.06)', padding: '2px 7px', borderRadius: 4 }}>
                    {p.slug}
                  </code>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginLeft: 'auto' }}>
                    <input type="checkbox" checked={p.activo}
                      onChange={e => updatePerfil(p.id, 'activo', e.target.checked)} />
                    <span className="form-label" style={{ margin: 0 }}>Activo</span>
                  </label>
                </div>

                {/* Etiqueta + Icono */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`role-${p.id}`}>Etiqueta del perfil</label>
                    <input id={`role-${p.id}`} type="text" className="form-input"
                      placeholder="Para estudiantes"
                      value={p.role_label}
                      onChange={e => updatePerfil(p.id, 'role_label', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`icono-${p.id}`}>
                      Icono <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(Material Symbols)</span>
                    </label>
                    <input id={`icono-${p.id}`} type="text" className="form-input"
                      placeholder="school"
                      value={p.icono}
                      onChange={e => updatePerfil(p.id, 'icono', e.target.value)} />
                  </div>
                </div>

                {/* Título */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`titulo-${p.id}`}>Título de la tarjeta</label>
                  <input id={`titulo-${p.id}`} type="text" className="form-input"
                    value={p.titulo}
                    onChange={e => updatePerfil(p.id, 'titulo', e.target.value)} />
                </div>

                {/* Descripción */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`desc-${p.id}`}>Descripción</label>
                  <textarea id={`desc-${p.id}`} className="form-input" rows={2}
                    style={{ resize: 'vertical' }}
                    value={p.descripcion}
                    onChange={e => updatePerfil(p.id, 'descripcion', e.target.value)} />
                </div>

                {/* Puntos (bullets) */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Puntos destacados</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
                    {p.puntos.map((pt, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-3)', fontSize: '.8rem', minWidth: 16, textAlign: 'center' }}>
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          className="form-input"
                          style={{ flex: 1 }}
                          value={pt}
                          onChange={e => updatePunto(p.id, idx, e.target.value)}
                          placeholder="Escribe el punto…"
                        />
                        <button
                          type="button"
                          onClick={() => removePunto(p.id, idx)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'var(--color-error, #c0392b)', fontSize: '1rem', lineHeight: 1 }}
                          aria-label="Eliminar punto"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => addPunto(p.id)}
                      style={{ alignSelf: 'flex-start', marginTop: '.2rem' }}
                    >
                      + Añadir punto
                    </button>
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => savePerfil(p.id)}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Guardando…' : 'Guardar perfil'}
                  </button>
                  {msg && (
                    <span style={{ fontSize: '.8rem', color: msg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>
                      {msg.text}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
