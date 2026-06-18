'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Habitacion {
  id: string
  nombre: string
  zona: string | null
  precio_min: number | null
  imagen_principal: string | null
  status: string | null
}

interface GallerySlot {
  slot: number
  label: string
  photo_url: string | null
  alt_text: string | null
}

interface Props {
  habitaciones: Habitacion[]
  gallery: GallerySlot[]
  heroRoomId: string | null
}

export default function HomeConfigForm({ habitaciones, gallery, heroRoomId }: Props) {
  // ── Hero state ────────────────────────────────────────────────
  const [selectedRoomId, setSelectedRoomId] = useState<string>(heroRoomId ?? '')
  const [heroSaving, setHeroSaving] = useState(false)
  const [heroMsg, setHeroMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // ── Gallery state ─────────────────────────────────────────────
  const [slots, setSlots] = useState<GallerySlot[]>(
    // Ensure all 5 slots are present
    [1, 2, 3, 4, 5].map(n => gallery.find(s => s.slot === n) ?? { slot: n, label: `Slot ${n}`, photo_url: null, alt_text: null })
  )
  const [gallerySaving, setGallerySaving] = useState<number | null>(null)
  const [galleryMsgs, setGalleryMsgs] = useState<Record<number, { type: 'ok' | 'err'; text: string }>>({})

  const selectedRoom = habitaciones.find(h => h.id === selectedRoomId)

  // ── Hero save ─────────────────────────────────────────────────
  async function saveHero() {
    setHeroSaving(true)
    setHeroMsg(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('site_config')
      .upsert({ key: 'hero_habitacion_id', value: selectedRoomId || null, updated_at: new Date().toISOString() })
    setHeroSaving(false)
    setHeroMsg(error
      ? { type: 'err', text: 'Error al guardar. Intenta de nuevo.' }
      : { type: 'ok',  text: 'Hero actualizado correctamente.' }
    )
  }

  // ── Gallery slot save ─────────────────────────────────────────
  async function saveSlot(slot: number) {
    const s = slots.find(x => x.slot === slot)
    if (!s) return
    setGallerySaving(slot)
    setGalleryMsgs(prev => ({ ...prev, [slot]: undefined as any }))
    const supabase = createClient()
    const { error } = await supabase
      .from('community_gallery')
      .update({
        photo_url:  s.photo_url  || null,
        alt_text:   s.alt_text   || null,
        updated_at: new Date().toISOString(),
      })
      .eq('slot', slot)
    setGallerySaving(null)
    setGalleryMsgs(prev => ({
      ...prev,
      [slot]: error
        ? { type: 'err', text: 'Error al guardar.' }
        : { type: 'ok',  text: 'Guardado.' },
    }))
  }

  function updateSlot(slot: number, field: 'photo_url' | 'alt_text', val: string) {
    setSlots(prev => prev.map(s => s.slot === slot ? { ...s, [field]: val } : s))
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── SECCIÓN A: Hero ─────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Hero del home</h2>
          <p className="card__subtitle">
            Selecciona la habitación cuya foto y precio aparecen en el hero de la página principal.
          </p>
        </div>

        <div className="form-section" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Selector */}
          <div className="form-group" style={{ flex: '1 1 260px' }}>
            <label className="form-label" htmlFor="hero-room-select">Habitación destacada</label>
            <select
              id="hero-room-select"
              className="form-input"
              value={selectedRoomId}
              onChange={e => setSelectedRoomId(e.target.value)}
            >
              <option value="">— Sin seleccionar (usa valor por defecto) —</option>
              {habitaciones.map(h => (
                <option key={h.id} value={h.id}>
                  {h.nombre}
                  {h.zona ? ` · ${h.zona}` : ''}
                  {h.precio_min != null ? ` · $${h.precio_min.toLocaleString('es-MX')}/mes` : ''}
                  {h.status !== 'available' ? ' ⚠ no disponible' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          {selectedRoom && (
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {selectedRoom.imagen_principal ? (
                <div
                  style={{
                    width: 120, height: 90,
                    borderRadius: 10,
                    backgroundImage: `url('${selectedRoom.imagen_principal}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1.5px solid var(--border)',
                  }}
                  aria-label={`Preview: ${selectedRoom.nombre}`}
                />
              ) : (
                <div
                  style={{
                    width: 120, height: 90,
                    borderRadius: 10,
                    background: 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.75rem', color: 'var(--text-3)',
                    border: '1.5px dashed var(--border)',
                  }}
                >
                  Sin foto
                </div>
              )}
              {selectedRoom.precio_min != null && (
                <span style={{ fontSize: '.8rem', color: 'var(--text-2)', textAlign: 'center' }}>
                  desde ${selectedRoom.precio_min.toLocaleString('es-MX')}/mes
                </span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
          <button
            className="btn btn--primary"
            onClick={saveHero}
            disabled={heroSaving}
          >
            {heroSaving ? 'Guardando…' : 'Guardar hero'}
          </button>
          {heroMsg && (
            <span style={{ fontSize: '.85rem', color: heroMsg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>
              {heroMsg.text}
            </span>
          )}
        </div>
      </div>

      {/* ── SECCIÓN B: Galería Comunidad ────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Galería Comunidad</h2>
          <p className="card__subtitle">
            5 recuadros de fotos de la sección "Tu casa, tus personas". Pega la URL de cada foto y guarda por slot.
            El slot 1 es el recuadro ancho (izquierda); los slots 2-5 son los cuadrados.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {slots.map(s => {
            const msg = galleryMsgs[s.slot]
            return (
              <div
                key={s.slot}
                style={{
                  display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap',
                  padding: '1rem', borderRadius: 12,
                  background: 'var(--surface-2, #f5f5f0)',
                }}
              >
                {/* Preview foto */}
                <div
                  style={{
                    width: 80, height: 64, flexShrink: 0,
                    borderRadius: 8,
                    background: s.photo_url
                      ? `url('${s.photo_url}') center/cover`
                      : 'var(--surface-3, #e5e5de)',
                    border: '1.5px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {!s.photo_url && (
                    <span style={{ fontSize: '.65rem', color: 'var(--text-3)', textAlign: 'center', padding: '0 4px' }}>
                      {s.label}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '.6rem', minWidth: 200 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text-1)' }}>
                    Slot {s.slot}{s.slot === 1 ? ' — Ancho' : ` — ${s.label}`}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`gallery-url-${s.slot}`}>URL de foto</label>
                    <input
                      id={`gallery-url-${s.slot}`}
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={s.photo_url ?? ''}
                      onChange={e => updateSlot(s.slot, 'photo_url', e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`gallery-alt-${s.slot}`}>Texto alternativo (accesibilidad)</label>
                    <input
                      id={`gallery-alt-${s.slot}`}
                      type="text"
                      className="form-input"
                      placeholder={`Descripción de la foto de ${s.label.toLowerCase()}`}
                      value={s.alt_text ?? ''}
                      onChange={e => updateSlot(s.slot, 'alt_text', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => saveSlot(s.slot)}
                      disabled={gallerySaving === s.slot}
                    >
                      {gallerySaving === s.slot ? 'Guardando…' : 'Guardar slot'}
                    </button>
                    {msg && (
                      <span style={{ fontSize: '.8rem', color: msg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>
                        {msg.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
