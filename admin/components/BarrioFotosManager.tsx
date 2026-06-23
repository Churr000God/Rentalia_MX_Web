'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export interface BarrioFotoSlot {
  id: string
  slot: number
  label: string | null
  photo_url: string | null
  alt_text: string | null
  active: boolean
}

type Msg = { type: 'ok' | 'err'; text: string }

const SLOT_NAMES = ['', 'El barrio', 'Café y trabajo', 'Parque Hundido', 'El mercado', 'Tu terraza']

interface Props { slots: BarrioFotoSlot[] }

export default function BarrioFotosManager({ slots: initSlots }: Props) {
  const [slots, setSlots] = useState<BarrioFotoSlot[]>(
    [...initSlots].sort((a, b) => a.slot - b.slot)
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [msgs,   setMsgs]   = useState<Record<string, Msg>>({})

  function updateSlot(id: string, field: keyof BarrioFotoSlot, val: string | boolean | null) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s))
  }

  async function saveSlot(id: string) {
    const slot = slots.find(s => s.id === id)
    if (!slot) return
    setSaving(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('barrio_fotos')
      .update({
        label:      slot.label || null,
        photo_url:  slot.photo_url || null,
        alt_text:   slot.alt_text || null,
        active:     slot.active,
        updated_at: new Date().toISOString(),
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
    <div className="card">
      <div className="card__header">
        <h2 className="card__title">5 slots del collage</h2>
        <p className="card__subtitle">
          Pega la URL de la imagen. Si el campo URL está vacío se muestra un gradiente de placeholder.
          El slot 1 ocupa el ancho completo (foto principal).
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {slots.map(slot => {
          const msg      = msgs[slot.id]
          const isSaving = saving === slot.id
          return (
            <div
              key={slot.id}
              style={{
                padding: '1rem', borderRadius: 12,
                background: slot.active ? 'var(--surface-2, #f5f5f0)' : 'rgba(0,0,0,.035)',
                opacity: slot.active ? 1 : 0.65,
                display: 'flex', flexDirection: 'column', gap: '.65rem',
                border: '1px solid var(--border)',
              }}
            >
              {/* Header del slot */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--selva, #1E4D3C)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '.85rem', flexShrink: 0,
                }}>
                  {slot.slot}
                </div>
                <span style={{ fontWeight: 600, fontSize: '.9rem' }}>
                  {SLOT_NAMES[slot.slot] || `Slot ${slot.slot}`}
                  {slot.slot === 1 && (
                    <span style={{ marginLeft: '.5rem', fontSize: '.65rem', fontWeight: 700, color: 'var(--barro, #bc6b43)',
                      background: 'rgba(188,107,67,.12)', padding: '2px 7px', borderRadius: 999 }}>
                      Foto principal
                    </span>
                  )}
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginLeft: 'auto' }}>
                  <input type="checkbox" checked={slot.active}
                    onChange={e => updateSlot(slot.id, 'active', e.target.checked)} />
                  <span className="form-label" style={{ margin: 0 }}>Visible</span>
                </label>
              </div>

              {/* URL de la imagen */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor={`url-${slot.id}`}>URL de la imagen</label>
                <input
                  id={`url-${slot.id}`}
                  type="url"
                  className="form-input"
                  placeholder="https://…/foto.jpg"
                  value={slot.photo_url ?? ''}
                  onChange={e => updateSlot(slot.id, 'photo_url', e.target.value || null)}
                />
              </div>

              {/* Preview de imagen */}
              {slot.photo_url && (
                <div style={{ borderRadius: 8, overflow: 'hidden', height: 120 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slot.photo_url}
                    alt={slot.alt_text ?? `Slot ${slot.slot}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}

              {/* Caption + Alt text */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`label-${slot.id}`}>Caption</label>
                  <input
                    id={`label-${slot.id}`}
                    type="text"
                    className="form-input"
                    placeholder="El barrio"
                    value={slot.label ?? ''}
                    onChange={e => updateSlot(slot.id, 'label', e.target.value || null)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`alt-${slot.id}`}>
                    Texto alternativo <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(accesibilidad)</span>
                  </label>
                  <input
                    id={`alt-${slot.id}`}
                    type="text"
                    className="form-input"
                    placeholder="Foto del barrio de Narvarte"
                    value={slot.alt_text ?? ''}
                    onChange={e => updateSlot(slot.id, 'alt_text', e.target.value || null)}
                  />
                </div>
              </div>

              {/* Guardar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => saveSlot(slot.id)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Guardando…' : 'Guardar slot'}
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
  )
}
