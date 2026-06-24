'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { TerminosTextos } from '@/app/dashboard/terminos-condiciones/page'

type Msg = { type: 'ok' | 'err'; text: string }

interface Props {
  textosInit: TerminosTextos
}

export default function TerminosCondicionesForm({ textosInit }: Props) {
  const [textos, setTextos] = useState<TerminosTextos>(textosInit)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState<Msg | null>(null)

  function set(key: keyof TerminosTextos, value: string) {
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
            Aparecen en la sección «Quiénes somos y aceptación» (01) del documento público.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="tc-razon-social">
              Razón social
            </label>
            <input
              id="tc-razon-social"
              type="text"
              className="form-input"
              value={textos.terminos_razon_social}
              onChange={e => set('terminos_razon_social', e.target.value)}
              placeholder="Ej: Juan García López / Rentalia Coliving S.A. de C.V."
            />
            <span className="form-hint">Nombre legal de la persona física o moral responsable.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tc-domicilio">
              Domicilio legal
            </label>
            <input
              id="tc-domicilio"
              type="text"
              className="form-input"
              value={textos.terminos_domicilio}
              onChange={e => set('terminos_domicilio', e.target.value)}
              placeholder="Ej: Calle Palenque 35, Col. Narvarte Poniente, Benito Juárez, CDMX"
            />
            <span className="form-hint">Domicilio fiscal o legal completo.</span>
          </div>
        </div>
      </div>

      {/* ── Contacto ────────────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Datos de contacto</h2>
          <p className="card__subtitle">
            Aparecen en el callout de la sección 01 y en la tarjeta de contacto al final (sección 16).
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="tc-email">
              Correo de contacto
            </label>
            <input
              id="tc-email"
              type="email"
              className="form-input"
              value={textos.terminos_email}
              onChange={e => set('terminos_email', e.target.value)}
              placeholder="hola@rentalia.mx"
            />
            <span className="form-hint">Correo principal para consultas sobre los términos.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tc-whatsapp">
              WhatsApp (número con formato)
            </label>
            <input
              id="tc-whatsapp"
              type="text"
              className="form-input"
              value={textos.terminos_whatsapp}
              onChange={e => set('terminos_whatsapp', e.target.value)}
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
            <label className="form-label" htmlFor="tc-fecha">
              Fecha (texto libre)
            </label>
            <input
              id="tc-fecha"
              type="text"
              className="form-input"
              value={textos.terminos_fecha}
              onChange={e => set('terminos_fecha', e.target.value)}
              placeholder="junio de 2026"
            />
            <span className="form-hint">Ej: «junio de 2026» o «1 de julio de 2026».</span>
          </div>
        </div>
      </div>

      {/* ── Habitaciones y precios ──────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Habitaciones y precios</h2>
          <p className="card__subtitle">
            Sección 05. Rango de precios informativo y estancia mínima de sección 07.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="tc-precio-rango">
              Rango de precios
            </label>
            <input
              id="tc-precio-rango"
              type="text"
              className="form-input"
              value={textos.terminos_precio_rango}
              onChange={e => set('terminos_precio_rango', e.target.value)}
              placeholder="$10,000 a $12,500 MXN al mes"
            />
            <span className="form-hint">Rango aproximado que se muestra como informativo en la sección 05.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tc-estancia-minima">
              Estancia mínima
            </label>
            <input
              id="tc-estancia-minima"
              type="text"
              className="form-input"
              value={textos.terminos_estancia_minima}
              onChange={e => set('terminos_estancia_minima', e.target.value)}
              placeholder="1 mes"
            />
            <span className="form-hint">Plazo mínimo de estancia. Aparece en la sección 07.</span>
          </div>
        </div>
      </div>

      {/* ── Pagos y depósito ────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Pagos, depósito y facturación</h2>
          <p className="card__subtitle">
            Sección 08. Información adicional sobre depósito, recargos y pasarela de pago.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="tc-pasarela">
              Pasarela de pago
            </label>
            <input
              id="tc-pasarela"
              type="text"
              className="form-input"
              value={textos.terminos_pasarela}
              onChange={e => set('terminos_pasarela', e.target.value)}
              placeholder="Ej: Stripe, Conekta, Clip…"
            />
            <span className="form-hint">Nombre del proveedor que procesa pagos. Aparece en el punto de pagos en línea.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tc-deposito">
              Detalle del depósito <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(opcional)</span>
            </label>
            <textarea
              id="tc-deposito"
              className="form-textarea"
              rows={2}
              value={textos.terminos_deposito}
              onChange={e => set('terminos_deposito', e.target.value)}
              placeholder="Ej: equivalente a 1 mensualidad, devuelto en 15 días hábiles tras la salida"
            />
            <span className="form-hint">Se añade como aclaración al punto del depósito en garantía.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tc-recargos">
              Política de recargos <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(opcional)</span>
            </label>
            <textarea
              id="tc-recargos"
              className="form-textarea"
              rows={2}
              value={textos.terminos_recargos}
              onChange={e => set('terminos_recargos', e.target.value)}
              placeholder="Ej: 5% adicional por cada semana de retraso, a partir del día 5 del mes"
            />
            <span className="form-hint">Condiciones específicas de recargos por pago tardío. Déjalo vacío si no aplican.</span>
          </div>
        </div>
      </div>

      {/* ── Cancelaciones ───────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Cancelaciones y reembolsos</h2>
          <p className="card__subtitle">
            Sección 09. Texto del callout con la política concreta de cancelación.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="tc-cancelacion">
              Política de cancelación
            </label>
            <textarea
              id="tc-cancelacion"
              className="form-textarea"
              rows={3}
              value={textos.terminos_cancelacion}
              onChange={e => set('terminos_cancelacion', e.target.value)}
              placeholder="Ej: cancelaciones con más de 15 días de anticipación no tienen penalización; con menos de 15 días se retiene el 50% del anticipo."
            />
            <span className="form-hint">Describe plazos y porcentajes retenidos. Si está vacío se muestra el texto genérico.</span>
          </div>
        </div>
      </div>

      {/* ── Convivencia ─────────────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Convivencia: mascotas y visitas</h2>
          <p className="card__subtitle">
            Sección 10. Añade la política específica de mascotas y/o visitas.
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="tc-mascotas">
              Política de mascotas y visitas <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(opcional)</span>
            </label>
            <textarea
              id="tc-mascotas"
              className="form-textarea"
              rows={2}
              value={textos.terminos_mascotas}
              onChange={e => set('terminos_mascotas', e.target.value)}
              placeholder="Ej: No se permiten mascotas. Las visitas deben registrarse y no pueden pernoctar sin autorización previa."
            />
            <span className="form-hint">Se añade tras la mención de reglas de visitas y mascotas. Déjalo vacío para omitirlo.</span>
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
