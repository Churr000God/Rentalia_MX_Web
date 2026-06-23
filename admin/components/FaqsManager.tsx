'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { FaqItem } from '@/app/dashboard/faqs/page'

type Msg = { type: 'ok' | 'err'; text: string }

const CATEGORIAS: { key: FaqItem['categoria']; label: string }[] = [
  { key: 'renta',       label: 'La renta'         },
  { key: 'contrato',    label: 'Contrato y pagos'  },
  { key: 'convivencia', label: 'Convivencia'        },
  { key: 'casa',        label: 'La casa'            },
]

interface Props {
  faqs: FaqItem[]
}

export default function FaqsManager({ faqs: initFaqs }: Props) {
  const [faqs,        setFaqs]        = useState<FaqItem[]>(initFaqs)
  const [faqSaving,   setFaqSaving]   = useState<string | null>(null)
  const [faqMsgs,     setFaqMsgs]     = useState<Record<string, Msg>>({})
  const [filterCat,   setFilterCat]   = useState<string>('todas')

  const [newFaq, setNewFaq] = useState<{
    categoria: FaqItem['categoria']
    pregunta: string
    respuesta: string
    orden: number
    por_confirmar: boolean
  }>({ categoria: 'renta', pregunta: '', respuesta: '', orden: 0, por_confirmar: false })
  const [addingSaving, setAddingSaving] = useState(false)
  const [addingMsg,    setAddingMsg]    = useState<Msg | null>(null)

  // ── Update local field ────────────────────────────────────────
  function updateFaq(id: string, field: keyof FaqItem, val: string | number | boolean) {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: val } : f))
  }

  // ── Save existing FAQ ─────────────────────────────────────────
  async function saveFaq(id: string) {
    const faq = faqs.find(f => f.id === id)
    if (!faq) return
    setFaqSaving(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('faq_items')
      .update({
        categoria:     faq.categoria,
        pregunta:      faq.pregunta,
        respuesta:     faq.respuesta,
        orden:         faq.orden,
        activo:        faq.activo,
        por_confirmar: faq.por_confirmar,
        updated_at:    new Date().toISOString(),
      })
      .eq('id', id)
    setFaqSaving(null)
    setFaqMsgs(prev => ({
      ...prev,
      [id]: error
        ? { type: 'err', text: 'Error al guardar.' }
        : { type: 'ok',  text: 'Guardado.' },
    }))
  }

  // ── Delete FAQ ────────────────────────────────────────────────
  async function deleteFaq(id: string) {
    const faq = faqs.find(f => f.id === id)
    if (!faq) return
    if (!confirm(`¿Eliminar "${faq.pregunta}"? Esta acción no se puede deshacer.`)) return
    const supabase = createClient()
    const { error } = await supabase.from('faq_items').delete().eq('id', id)
    if (!error) setFaqs(prev => prev.filter(f => f.id !== id))
    else alert('Error al eliminar. Intenta de nuevo.')
  }

  // ── Add new FAQ ───────────────────────────────────────────────
  async function addFaq() {
    if (!newFaq.pregunta.trim() || !newFaq.respuesta.trim()) {
      setAddingMsg({ type: 'err', text: 'La pregunta y la respuesta son obligatorias.' })
      return
    }
    setAddingSaving(true)
    setAddingMsg(null)
    const supabase = createClient()
    const maxOrden = faqs.filter(f => f.categoria === newFaq.categoria).length
      ? Math.max(...faqs.filter(f => f.categoria === newFaq.categoria).map(f => f.orden))
      : 0
    const { data, error } = await supabase
      .from('faq_items')
      .insert({
        categoria:     newFaq.categoria,
        pregunta:      newFaq.pregunta,
        respuesta:     newFaq.respuesta,
        orden:         newFaq.orden || maxOrden + 10,
        activo:        true,
        por_confirmar: newFaq.por_confirmar,
      })
      .select()
      .single()
    setAddingSaving(false)
    if (data && !error) {
      setFaqs(prev => [...prev, data as FaqItem])
      setNewFaq({ categoria: newFaq.categoria, pregunta: '', respuesta: '', orden: 0, por_confirmar: false })
      setAddingMsg({ type: 'ok', text: 'Pregunta añadida.' })
    } else {
      setAddingMsg({ type: 'err', text: 'Error al añadir.' })
    }
  }

  // ── Filtered list ─────────────────────────────────────────────
  const visibles = filterCat === 'todas'
    ? faqs
    : faqs.filter(f => f.categoria === filterCat)

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-3)', marginRight: 4 }}>
          Filtrar por:
        </span>
        {[{ key: 'todas', label: 'Todas' }, ...CATEGORIAS].map(c => (
          <button
            key={c.key}
            onClick={() => setFilterCat(c.key)}
            className={`btn btn--sm${filterCat === c.key ? ' btn--primary' : ' btn--ghost'}`}
            style={{ borderRadius: 999 }}
          >
            {c.label} ({c.key === 'todas' ? faqs.length : faqs.filter(f => f.categoria === c.key).length})
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Preguntas existentes</h2>
          <p className="card__subtitle">
            Edita pregunta, respuesta, categoría y orden. Solo las activas aparecen en la página pública.
            La <strong>respuesta</strong> admite HTML básico (&lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;).
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visibles.length === 0 && (
            <p style={{ fontSize: '.875rem', color: 'var(--text-3)' }}>
              No hay preguntas{filterCat !== 'todas' ? ' en esta categoría' : ''}. Añade la primera abajo.
            </p>
          )}

          {visibles.map(faq => {
            const msg      = faqMsgs[faq.id]
            const isSaving = faqSaving === faq.id
            return (
              <div
                key={faq.id}
                style={{
                  padding: '1rem', borderRadius: 12,
                  background: faq.activo ? 'var(--surface-2, #f5f5f0)' : 'rgba(0,0,0,.035)',
                  opacity: faq.activo ? 1 : 0.65,
                  display: 'flex', flexDirection: 'column', gap: '.65rem',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Row: categoría + por_confirmar */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <label className="form-label" htmlFor={`faq-cat-${faq.id}`} style={{ margin: 0, whiteSpace: 'nowrap' }}>
                      Categoría
                    </label>
                    <select
                      id={`faq-cat-${faq.id}`}
                      className="form-input"
                      style={{ paddingBlock: '6px', minWidth: 160 }}
                      value={faq.categoria}
                      onChange={e => updateFaq(faq.id, 'categoria', e.target.value)}
                    >
                      {CATEGORIAS.map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <input
                      id={`faq-act-${faq.id}`}
                      type="checkbox"
                      checked={faq.activo}
                      onChange={e => updateFaq(faq.id, 'activo', e.target.checked)}
                    />
                    <label htmlFor={`faq-act-${faq.id}`} className="form-label" style={{ margin: 0 }}>Activo</label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <input
                      id={`faq-pc-${faq.id}`}
                      type="checkbox"
                      checked={faq.por_confirmar}
                      onChange={e => updateFaq(faq.id, 'por_confirmar', e.target.checked)}
                    />
                    <label htmlFor={`faq-pc-${faq.id}`} className="form-label" style={{ margin: 0 }}>
                      Por confirmar
                    </label>
                  </div>
                </div>

                {/* Pregunta */}
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

                {/* Respuesta */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`faq-r-${faq.id}`}>
                    Respuesta{' '}
                    <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>
                      (admite HTML básico: &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;)
                    </span>
                  </label>
                  <textarea
                    id={`faq-r-${faq.id}`}
                    className="form-input"
                    rows={3}
                    value={faq.respuesta}
                    onChange={e => updateFaq(faq.id, 'respuesta', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Orden + acciones */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <label className="form-label" htmlFor={`faq-o-${faq.id}`} style={{ margin: 0, whiteSpace: 'nowrap' }}>
                      Orden
                    </label>
                    <input
                      id={`faq-o-${faq.id}`}
                      type="number"
                      className="form-input"
                      style={{ width: 72 }}
                      value={faq.orden}
                      onChange={e => updateFaq(faq.id, 'orden', parseInt(e.target.value, 10) || 0)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginLeft: 'auto' }}>
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => saveFaq(faq.id)}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Guardando…' : 'Guardar'}
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
      </div>

      {/* Add new FAQ */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Añadir nueva pregunta</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {/* Categoría */}
          <div className="form-group">
            <label className="form-label" htmlFor="new-faq-cat">Categoría</label>
            <select
              id="new-faq-cat"
              className="form-input"
              style={{ paddingBlock: '8px' }}
              value={newFaq.categoria}
              onChange={e => setNewFaq(prev => ({ ...prev, categoria: e.target.value as FaqItem['categoria'] }))}
            >
              {CATEGORIAS.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Pregunta */}
          <div className="form-group">
            <label className="form-label" htmlFor="new-faq-p">Pregunta</label>
            <input
              id="new-faq-p"
              type="text"
              className="form-input"
              placeholder="¿Cuánto tiempo mínimo…?"
              value={newFaq.pregunta}
              onChange={e => setNewFaq(prev => ({ ...prev, pregunta: e.target.value }))}
            />
          </div>

          {/* Respuesta */}
          <div className="form-group">
            <label className="form-label" htmlFor="new-faq-r">
              Respuesta{' '}
              <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>
                (admite HTML básico: &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;)
              </span>
            </label>
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

          {/* Orden + checkboxes */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <label className="form-label" htmlFor="new-faq-o" style={{ margin: 0, whiteSpace: 'nowrap' }}>
                Orden (opcional)
              </label>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <input
                id="new-faq-pc"
                type="checkbox"
                checked={newFaq.por_confirmar}
                onChange={e => setNewFaq(prev => ({ ...prev, por_confirmar: e.target.checked }))}
              />
              <label htmlFor="new-faq-pc" className="form-label" style={{ margin: 0 }}>
                Marcar como "por confirmar"
              </label>
            </div>
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
