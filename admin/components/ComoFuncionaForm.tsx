'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Paso {
  paso_num: number
  titulo: string
  descripcion: string
  imagen_url: string | null
}

interface ValorBloque {
  bloque: 'sinaval' | 'flexible'
  titulo: string
  texto: string
  imagen_url: string | null
}

interface FaqItem {
  id: string
  pregunta: string
  respuesta: string
  orden: number
  activo: boolean
}

interface Props {
  pasos: Paso[]
  valor: ValorBloque[]
  faqs: FaqItem[]
}

type Msg = { type: 'ok' | 'err'; text: string }

const PASO_LABELS = ['Elige tu cuarto', 'Agenda tu visita', 'Aplica con lo mínimo', 'Múdate']
const VALOR_LABELS: Record<string, string> = { sinaval: 'Sin aval', flexible: 'Flexible de verdad' }

export default function ComoFuncionaForm({ pasos: initPasos, valor: initValor, faqs: initFaqs }: Props) {

  /* ── Pasos ─────────────────────────────────────────────── */
  const [pasos, setPasos] = useState<Paso[]>(
    [1, 2, 3, 4].map(n => initPasos.find(p => p.paso_num === n) ?? {
      paso_num: n, titulo: PASO_LABELS[n - 1], descripcion: '', imagen_url: null,
    })
  )
  const [pasosSaving, setPasosSaving] = useState<number | null>(null)
  const [pasosMsgs, setPasosMsgs]   = useState<Record<number, Msg>>({})

  function updatePaso(num: number, field: keyof Omit<Paso, 'paso_num'>, val: string) {
    setPasos(prev => prev.map(p => p.paso_num === num ? { ...p, [field]: val } : p))
  }

  async function savePaso(num: number) {
    const paso = pasos.find(p => p.paso_num === num)
    if (!paso) return
    setPasosSaving(num)
    const supabase = createClient()
    const { error } = await supabase
      .from('cf_pasos')
      .update({ titulo: paso.titulo, descripcion: paso.descripcion, imagen_url: paso.imagen_url || null, updated_at: new Date().toISOString() })
      .eq('paso_num', num)
    setPasosSaving(null)
    setPasosMsgs(prev => ({ ...prev, [num]: error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' } }))
  }

  /* ── Valor ─────────────────────────────────────────────── */
  const [valor, setValor] = useState<ValorBloque[]>(
    (['sinaval', 'flexible'] as const).map(b => initValor.find(v => v.bloque === b) ?? {
      bloque: b, titulo: '', texto: '', imagen_url: null,
    })
  )
  const [valorSaving, setValorSaving] = useState<string | null>(null)
  const [valorMsgs, setValorMsgs]     = useState<Record<string, Msg>>({})

  function updateValor(bloque: string, field: keyof Omit<ValorBloque, 'bloque'>, val: string) {
    setValor(prev => prev.map(v => v.bloque === bloque ? { ...v, [field]: val } : v))
  }

  async function saveValor(bloque: string) {
    const blq = valor.find(v => v.bloque === bloque)
    if (!blq) return
    setValorSaving(bloque)
    const supabase = createClient()
    const { error } = await supabase
      .from('cf_valor')
      .update({ titulo: blq.titulo, texto: blq.texto, imagen_url: blq.imagen_url || null, updated_at: new Date().toISOString() })
      .eq('bloque', bloque)
    setValorSaving(null)
    setValorMsgs(prev => ({ ...prev, [bloque]: error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' } }))
  }

  /* ── FAQ ───────────────────────────────────────────────── */
  const [faqs, setFaqs] = useState<FaqItem[]>(initFaqs)
  const [faqSaving, setFaqSaving] = useState<string | null>(null)
  const [faqMsgs, setFaqMsgs]     = useState<Record<string, Msg>>({})

  const [newFaq, setNewFaq]       = useState({ pregunta: '', respuesta: '', orden: 0 })
  const [addingSaving, setAddingSaving] = useState(false)
  const [addingMsg, setAddingMsg]       = useState<Msg | null>(null)

  function updateFaq(id: string, field: keyof FaqItem, val: string | number | boolean) {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: val } : f))
  }

  async function saveFaq(id: string) {
    const faq = faqs.find(f => f.id === id)
    if (!faq) return
    setFaqSaving(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('cf_faq')
      .update({ pregunta: faq.pregunta, respuesta: faq.respuesta, orden: faq.orden, activo: faq.activo, updated_at: new Date().toISOString() })
      .eq('id', id)
    setFaqSaving(null)
    setFaqMsgs(prev => ({ ...prev, [id]: error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' } }))
  }

  async function deleteFaq(id: string) {
    if (!confirm('¿Eliminar esta pregunta? Esta acción no se puede deshacer.')) return
    const supabase = createClient()
    const { error } = await supabase.from('cf_faq').delete().eq('id', id)
    if (!error) setFaqs(prev => prev.filter(f => f.id !== id))
    else alert('Error al eliminar. Intenta de nuevo.')
  }

  async function addFaq() {
    if (!newFaq.pregunta.trim() || !newFaq.respuesta.trim()) {
      setAddingMsg({ type: 'err', text: 'La pregunta y la respuesta son obligatorias.' })
      return
    }
    setAddingSaving(true)
    setAddingMsg(null)
    const supabase = createClient()
    const maxOrden = faqs.length ? Math.max(...faqs.map(f => f.orden)) : 0
    const { data, error } = await supabase
      .from('cf_faq')
      .insert({ pregunta: newFaq.pregunta, respuesta: newFaq.respuesta, orden: newFaq.orden || maxOrden + 10, activo: true })
      .select()
      .single()
    setAddingSaving(false)
    if (data && !error) {
      setFaqs(prev => [...prev, data as FaqItem])
      setNewFaq({ pregunta: '', respuesta: '', orden: 0 })
      setAddingMsg({ type: 'ok', text: 'Pregunta añadida.' })
    } else {
      setAddingMsg({ type: 'err', text: 'Error al añadir.' })
    }
  }

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── SECCIÓN A: El Proceso (4 pasos) ─────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">El Proceso — 4 pasos</h2>
          <p className="card__subtitle">
            Título, descripción y foto de cada paso. Deja la URL vacía para conservar la imagen estática por defecto.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pasos.map(paso => {
            const msg = pasosMsgs[paso.paso_num]
            return (
              <div
                key={paso.paso_num}
                style={{
                  padding: '1rem', borderRadius: 12,
                  background: 'var(--surface-2, #f5f5f0)',
                  display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start',
                }}
              >
                {/* Preview foto */}
                <div
                  style={{
                    width: 72, height: 96, flexShrink: 0,
                    borderRadius: '999px 999px 0 0',
                    background: paso.imagen_url
                      ? `url('${paso.imagen_url}') center/cover`
                      : 'var(--surface-3, #e5e5de)',
                    border: '1.5px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {!paso.imagen_url && (
                    <span style={{ fontSize: '.6rem', color: 'var(--text-3)', textAlign: 'center', padding: '0 4px' }}>
                      Paso {paso.paso_num}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '.6rem', minWidth: 200 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text-1)' }}>
                    Paso {paso.paso_num} — {PASO_LABELS[paso.paso_num - 1]}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`paso-titulo-${paso.paso_num}`}>Título</label>
                    <input
                      id={`paso-titulo-${paso.paso_num}`}
                      type="text"
                      className="form-input"
                      value={paso.titulo}
                      onChange={e => updatePaso(paso.paso_num, 'titulo', e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`paso-desc-${paso.paso_num}`}>Descripción</label>
                    <textarea
                      id={`paso-desc-${paso.paso_num}`}
                      className="form-input"
                      rows={2}
                      value={paso.descripcion}
                      onChange={e => updatePaso(paso.paso_num, 'descripcion', e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`paso-img-${paso.paso_num}`}>URL de foto (arco)</label>
                    <input
                      id={`paso-img-${paso.paso_num}`}
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={paso.imagen_url ?? ''}
                      onChange={e => updatePaso(paso.paso_num, 'imagen_url', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => savePaso(paso.paso_num)}
                      disabled={pasosSaving === paso.paso_num}
                    >
                      {pasosSaving === paso.paso_num ? 'Guardando…' : 'Guardar paso'}
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

      {/* ── SECCIÓN B: Propuesta de valor ───────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Propuesta de valor</h2>
          <p className="card__subtitle">
            Los dos bloques de la sección oscura: "Sin aval" y "Flexible de verdad".
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {valor.map(blq => {
            const msg = valorMsgs[blq.bloque]
            return (
              <div
                key={blq.bloque}
                style={{
                  padding: '1rem', borderRadius: 12,
                  background: 'var(--surface-2, #f5f5f0)',
                  display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start',
                }}
              >
                {/* Preview foto */}
                <div
                  style={{
                    width: 96, height: 64, flexShrink: 0,
                    borderRadius: 8,
                    background: blq.imagen_url
                      ? `url('${blq.imagen_url}') center/cover`
                      : 'var(--surface-3, #e5e5de)',
                    border: '1.5px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {!blq.imagen_url && (
                    <span style={{ fontSize: '.6rem', color: 'var(--text-3)', textAlign: 'center', padding: '0 4px' }}>
                      {VALOR_LABELS[blq.bloque]}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '.6rem', minWidth: 200 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text-1)' }}>
                    {VALOR_LABELS[blq.bloque]}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`valor-titulo-${blq.bloque}`}>Título</label>
                    <input
                      id={`valor-titulo-${blq.bloque}`}
                      type="text"
                      className="form-input"
                      value={blq.titulo}
                      onChange={e => updateValor(blq.bloque, 'titulo', e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`valor-texto-${blq.bloque}`}>Texto</label>
                    <textarea
                      id={`valor-texto-${blq.bloque}`}
                      className="form-input"
                      rows={3}
                      value={blq.texto}
                      onChange={e => updateValor(blq.bloque, 'texto', e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`valor-img-${blq.bloque}`}>URL de foto</label>
                    <input
                      id={`valor-img-${blq.bloque}`}
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={blq.imagen_url ?? ''}
                      onChange={e => updateValor(blq.bloque, 'imagen_url', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => saveValor(blq.bloque)}
                      disabled={valorSaving === blq.bloque}
                    >
                      {valorSaving === blq.bloque ? 'Guardando…' : 'Guardar bloque'}
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

      {/* ── SECCIÓN C: Preguntas frecuentes ─────────────── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Preguntas frecuentes</h2>
          <p className="card__subtitle">
            Las preguntas se muestran en el orden indicado. Solo las activas aparecen en la página.
          </p>
        </div>

        {/* Lista de FAQs existentes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.length === 0 && (
            <p style={{ fontSize: '.875rem', color: 'var(--text-3)' }}>No hay preguntas aún. Añade la primera abajo.</p>
          )}
          {faqs.map(faq => {
            const msg = faqMsgs[faq.id]
            return (
              <div
                key={faq.id}
                style={{
                  padding: '1rem', borderRadius: 12,
                  background: 'var(--surface-2, #f5f5f0)',
                  display: 'flex', flexDirection: 'column', gap: '.6rem',
                }}
              >
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`faq-p-${faq.id}`}>Pregunta</label>
                  <input
                    id={`faq-p-${faq.id}`}
                    type="text"
                    className="form-input"
                    value={faq.pregunta}
                    onChange={e => updateFaq(faq.id, 'pregunta', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`faq-r-${faq.id}`}>Respuesta</label>
                  <textarea
                    id={`faq-r-${faq.id}`}
                    className="form-input"
                    rows={3}
                    value={faq.respuesta}
                    onChange={e => updateFaq(faq.id, 'respuesta', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <label className="form-label" htmlFor={`faq-o-${faq.id}`} style={{ margin: 0, whiteSpace: 'nowrap' }}>Orden</label>
                    <input
                      id={`faq-o-${faq.id}`}
                      type="number"
                      className="form-input"
                      style={{ width: 72 }}
                      value={faq.orden}
                      onChange={e => updateFaq(faq.id, 'orden', parseInt(e.target.value, 10) || 0)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <input
                      id={`faq-a-${faq.id}`}
                      type="checkbox"
                      checked={faq.activo}
                      onChange={e => updateFaq(faq.id, 'activo', e.target.checked)}
                    />
                    <label htmlFor={`faq-a-${faq.id}`} className="form-label" style={{ margin: 0 }}>Activo</label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginLeft: 'auto' }}>
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => saveFaq(faq.id)}
                      disabled={faqSaving === faq.id}
                    >
                      {faqSaving === faq.id ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button
                      className="btn btn--sm"
                      onClick={() => deleteFaq(faq.id)}
                      style={{ background: 'transparent', color: 'var(--color-error, #c0392b)', border: '1px solid currentColor' }}
                    >
                      Eliminar
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

        {/* Añadir nueva pregunta */}
        <div
          style={{
            marginTop: '1.5rem', padding: '1rem', borderRadius: 12,
            border: '1.5px dashed var(--border)',
            display: 'flex', flexDirection: 'column', gap: '.6rem',
          }}
        >
          <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text-2)' }}>
            Añadir nueva pregunta
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="new-faq-p">Pregunta</label>
            <input
              id="new-faq-p"
              type="text"
              className="form-input"
              placeholder="¿Cuánto tiempo…?"
              value={newFaq.pregunta}
              onChange={e => setNewFaq(prev => ({ ...prev, pregunta: e.target.value }))}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="new-faq-r">Respuesta</label>
            <textarea
              id="new-faq-r"
              className="form-input"
              rows={3}
              placeholder="La respuesta…"
              value={newFaq.respuesta}
              onChange={e => setNewFaq(prev => ({ ...prev, respuesta: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <label className="form-label" htmlFor="new-faq-o" style={{ margin: 0, whiteSpace: 'nowrap' }}>Orden (opcional)</label>
            <input
              id="new-faq-o"
              type="number"
              className="form-input"
              style={{ width: 72 }}
              value={newFaq.orden || ''}
              placeholder="auto"
              onChange={e => setNewFaq(prev => ({ ...prev, orden: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button
              className="btn btn--primary btn--sm"
              onClick={addFaq}
              disabled={addingSaving}
            >
              {addingSaving ? 'Añadiendo…' : 'Añadir pregunta'}
            </button>
            {addingMsg && (
              <span style={{ fontSize: '.8rem', color: addingMsg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>
                {addingMsg.text}
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
