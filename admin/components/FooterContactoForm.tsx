'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { FooterContacto } from '@/app/dashboard/footer-contacto/page'

type Msg = { type: 'ok' | 'err'; text: string }

interface Props {
  contactoInit: FooterContacto
}

export default function FooterContactoForm({ contactoInit }: Props) {
  const [contacto, setContacto] = useState<FooterContacto>(contactoInit)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState<Msg | null>(null)

  function set(key: keyof FooterContacto, value: string) {
    setContacto(prev => ({ ...prev, [key]: value }))
    setMsg(null)
  }

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    const supabase = createClient()
    const now = new Date().toISOString()
    const rows = (Object.entries(contacto) as [string, string][]).map(([key, value]) => ({
      key,
      value,
      updated_at: now,
    }))
    const { error } = await supabase
      .from('site_config')
      .upsert(rows, { onConflict: 'key' })
    setSaving(false)
    setMsg(error
      ? { type: 'err', text: 'Error al guardar. Inténtalo de nuevo.' }
      : { type: 'ok',  text: 'Cambios guardados correctamente.' }
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── WhatsApp ─────────────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">WhatsApp</h2>
          <p className="card__subtitle">
            Número al que apunta el enlace «WhatsApp» del footer.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="footer-whatsapp">
              Número de WhatsApp
            </label>
            <input
              id="footer-whatsapp"
              type="text"
              className="form-input"
              value={contacto.footer_whatsapp}
              onChange={e => set('footer_whatsapp', e.target.value)}
              placeholder="5215523215421"
            />
            <span className="form-hint">
              Solo dígitos con código de país, sin espacios ni <code>+</code>.
              Ej: <code>5215523215421</code> → enlace <code>wa.me/5215523215421</code>.
            </span>
          </div>
        </div>
      </div>

      {/* ── Email ────────────────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Email de contacto</h2>
          <p className="card__subtitle">
            Correo electrónico que se muestra y enlaza en el footer.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="footer-email">
              Dirección de correo
            </label>
            <input
              id="footer-email"
              type="email"
              className="form-input"
              value={contacto.footer_email}
              onChange={e => set('footer_email', e.target.value)}
              placeholder="hola@rentalia.mx"
            />
            <span className="form-hint">
              Se muestra como texto y genera un enlace <code>mailto:</code>.
            </span>
          </div>
        </div>
      </div>

      {/* ── Instagram ────────────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Instagram</h2>
          <p className="card__subtitle">
            Usuario de Instagram que aparece en el footer como <code>@usuario</code>.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="footer-instagram">
              Usuario (sin @)
            </label>
            <input
              id="footer-instagram"
              type="text"
              className="form-input"
              value={contacto.footer_instagram}
              onChange={e => set('footer_instagram', e.target.value)}
              placeholder="rentalia.mx"
            />
            <span className="form-hint">
              Solo el nombre de usuario, sin <code>@</code> ni <code>https://</code>.
              Ej: <code>rentalia.mx</code> → texto <code>@rentalia.mx</code>, enlace <code>instagram.com/rentalia.mx</code>.
            </span>
          </div>
        </div>
      </div>

      {/* ── Dirección ────────────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Dirección</h2>
          <p className="card__subtitle">
            Dirección física que se muestra en el footer y enlaza a Google Maps.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="footer-direccion">
              Dirección completa
            </label>
            <input
              id="footer-direccion"
              type="text"
              className="form-input"
              value={contacto.footer_direccion}
              onChange={e => set('footer_direccion', e.target.value)}
              placeholder="C. Palenque 35, Narvarte Poniente, Benito Juárez, CDMX"
            />
            <span className="form-hint">
              Se muestra como texto y genera un enlace a Google Maps con esta dirección como búsqueda.
            </span>
          </div>
        </div>
      </div>

      {/* ── Guardar ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {msg && (
          <span style={{
            fontSize: '.875rem',
            color: msg.type === 'ok' ? 'var(--success, #1a8a4a)' : 'var(--error, #c0392b)',
          }}>
            {msg.text}
          </span>
        )}
      </div>

    </div>
  )
}
