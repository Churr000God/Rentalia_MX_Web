'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { AvisoTextos } from '@/app/dashboard/aviso-privacidad/page'

type Msg = { type: 'ok' | 'err'; text: string }

interface Props {
  textosInit: AvisoTextos
}

export default function AvisoPrivacidadForm({ textosInit }: Props) {
  const [textos, setTextos] = useState<AvisoTextos>(textosInit)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState<Msg | null>(null)

  function set(key: keyof AvisoTextos, value: string) {
    setTextos(prev => ({ ...prev, [key]: value }))
    setMsg(null)
  }

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    const supabase = createClient()
    const now = new Date().toISOString()
    const rows = (Object.entries(textos) as [string, string][]).map(([key, value]) => ({
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

      {/* ── Responsable ─────────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Datos del responsable</h2>
          <p className="card__subtitle">
            Aparecen en la sección «Quién es el responsable» (01) del aviso público.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="aviso-razon-social">
              Razón social
            </label>
            <input
              id="aviso-razon-social"
              type="text"
              className="form-input"
              value={textos.aviso_responsable_razon_social}
              onChange={e => set('aviso_responsable_razon_social', e.target.value)}
              placeholder="Ej: Juan García López / Rentalia Coliving S.A. de C.V."
            />
            <span className="form-hint">Nombre legal de la persona física o moral responsable.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="aviso-domicilio">
              Domicilio legal
            </label>
            <input
              id="aviso-domicilio"
              type="text"
              className="form-input"
              value={textos.aviso_responsable_domicilio}
              onChange={e => set('aviso_responsable_domicilio', e.target.value)}
              placeholder="Ej: Calle Palenque 35, Col. Narvarte Poniente, Benito Juárez, CDMX"
            />
            <span className="form-hint">Domicilio fiscal o legal completo.</span>
          </div>
        </div>
      </div>

      {/* ── Contacto ────────────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Contacto de privacidad</h2>
          <p className="card__subtitle">
            Número de WhatsApp para ejercer derechos ARCO. Aparece en las secciones 04 y 13.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="aviso-whatsapp">
              WhatsApp (número con formato)
            </label>
            <input
              id="aviso-whatsapp"
              type="text"
              className="form-input"
              value={textos.aviso_whatsapp}
              onChange={e => set('aviso_whatsapp', e.target.value)}
              placeholder="+52 1 55 2321 5421"
            />
            <span className="form-hint">
              Escríbelo como quieres que se muestre, ej: <code>+52 1 55 2321 5421</code>.
              El enlace wa.me se genera quitando los espacios y el <code>+</code>.
            </span>
          </div>
        </div>
      </div>

      {/* ── Fecha ────────────────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Fecha de actualización</h2>
          <p className="card__subtitle">
            Aparece en el hero y al pie del documento.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="aviso-fecha">
              Fecha (texto libre)
            </label>
            <input
              id="aviso-fecha"
              type="text"
              className="form-input"
              value={textos.aviso_fecha}
              onChange={e => set('aviso_fecha', e.target.value)}
              placeholder="junio de 2026"
            />
            <span className="form-hint">Ej: «junio de 2026» o «1 de julio de 2026».</span>
          </div>
        </div>
      </div>

      {/* ── Proveedores ─────────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Proveedores de servicio</h2>
          <p className="card__subtitle">
            Sección «Con quién compartimos tus datos» (05). El aviso ya menciona pasarela,
            hospedaje y comunicación — aquí confirmas cuáles.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="aviso-pasarela">
              Pasarela de pago
            </label>
            <input
              id="aviso-pasarela"
              type="text"
              className="form-input"
              value={textos.aviso_pasarela}
              onChange={e => set('aviso_pasarela', e.target.value)}
              placeholder="Ej: Stripe, Conekta, Clip…"
            />
            <span className="form-hint">
              Nombre del proveedor que procesa pagos con tarjeta. Aparece en la tarjeta «De pago» (sección 02).
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="aviso-proveedores">
              Otros proveedores <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(opcional)</span>
            </label>
            <textarea
              id="aviso-proveedores"
              className="form-textarea"
              rows={3}
              value={textos.aviso_proveedores}
              onChange={e => set('aviso_proveedores', e.target.value)}
              placeholder="Ej: hospedaje: Vercel; correo: Mailersend; analítica: ninguna"
            />
            <span className="form-hint">
              Nota complementaria en la sección 05. Déjalo vacío si no necesitas añadir más detalle.
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
