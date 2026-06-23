'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface StatPair  { num: string; label: string }
interface ConfigData {
  amenidades_header_eyebrow: string
  amenidades_header_h1:      string
  amenidades_header_sub:     string
  amenidades_pills:          string
  amenidades_stats:          StatPair[]
  amenidades_mapa_h2:        string
  amenidades_mapa_p:         string
  amenidades_mapa_stats:     StatPair[]
  amenidades_perfiles_h2:    string
  amenidades_perfiles_sub:   string
}

interface Props { initialData: ConfigData }

type SectionMsg = { type: 'ok' | 'err'; text: string } | null

function emptyStats(n: number): StatPair[] {
  return Array.from({ length: n }, () => ({ num: '', label: '' }))
}

export default function AmenidadesConfigForm({ initialData }: Props) {
  const supabase = createClient()

  /* ── Encabezado ─────────────────────────────────────────────── */
  const [eyebrow,    setEyebrow]    = useState(initialData.amenidades_header_eyebrow)
  const [h1,         setH1]         = useState(initialData.amenidades_header_h1)
  const [sub,        setSub]        = useState(initialData.amenidades_header_sub)
  const [pills,      setPills]      = useState(initialData.amenidades_pills)
  const [headerMsg,  setHeaderMsg]  = useState<SectionMsg>(null)
  const [headerSave, setHeaderSave] = useState(false)

  /* ── Stats strip ─────────────────────────────────────────────── */
  const [stats,      setStats]      = useState<StatPair[]>(
    initialData.amenidades_stats.length ? initialData.amenidades_stats : emptyStats(4)
  )
  const [statsMsg,   setStatsMsg]   = useState<SectionMsg>(null)
  const [statsSave,  setStatsSave]  = useState(false)

  /* ── Mapa ────────────────────────────────────────────────────── */
  const [mapaH2,     setMapaH2]     = useState(initialData.amenidades_mapa_h2)
  const [mapaP,      setMapaP]      = useState(initialData.amenidades_mapa_p)
  const [mapaStats,  setMapaStats]  = useState<StatPair[]>(
    initialData.amenidades_mapa_stats.length ? initialData.amenidades_mapa_stats : emptyStats(4)
  )
  const [mapaMsg,    setMapaMsg]    = useState<SectionMsg>(null)
  const [mapaSave,   setMapaSave]   = useState(false)

  /* ── Perfiles header ────────────────────────────────────────── */
  const [perfilesH2,  setPerfilesH2]  = useState(initialData.amenidades_perfiles_h2)
  const [perfilesSub, setPerfilesSub] = useState(initialData.amenidades_perfiles_sub)
  const [perfilesMsg,  setPerfilesMsg]  = useState<SectionMsg>(null)
  const [perfilesSave, setPerfilesSave] = useState(false)

  /* ── Upsert helper ──────────────────────────────────────────── */
  async function upsertKeys(pairs: [string, string][]) {
    const now = new Date().toISOString()
    const rows = pairs.map(([key, value]) => ({ key, value, updated_at: now }))
    const { error } = await supabase.from('site_config').upsert(rows, { onConflict: 'key' })
    return error
  }

  /* ── Save: Encabezado ───────────────────────────────────────── */
  async function saveHeader() {
    setHeaderSave(true)
    setHeaderMsg(null)
    const error = await upsertKeys([
      ['amenidades_header_eyebrow', eyebrow],
      ['amenidades_header_h1',      h1],
      ['amenidades_header_sub',     sub],
      ['amenidades_pills',          pills],
    ])
    setHeaderSave(false)
    setHeaderMsg(error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' })
  }

  /* ── Save: Stats strip ──────────────────────────────────────── */
  async function saveStats() {
    setStatsSave(true)
    setStatsMsg(null)
    const error = await upsertKeys([
      ['amenidades_stats', JSON.stringify(stats)],
    ])
    setStatsSave(false)
    setStatsMsg(error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' })
  }

  /* ── Save: Mapa ─────────────────────────────────────────────── */
  async function saveMapa() {
    setMapaSave(true)
    setMapaMsg(null)
    const error = await upsertKeys([
      ['amenidades_mapa_h2',    mapaH2],
      ['amenidades_mapa_p',     mapaP],
      ['amenidades_mapa_stats', JSON.stringify(mapaStats)],
    ])
    setMapaSave(false)
    setMapaMsg(error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' })
  }

  /* ── Save: Perfiles header ──────────────────────────────────── */
  async function savePerfiles() {
    setPerfilesSave(true)
    setPerfilesMsg(null)
    const error = await upsertKeys([
      ['amenidades_perfiles_h2',  perfilesH2],
      ['amenidades_perfiles_sub', perfilesSub],
    ])
    setPerfilesSave(false)
    setPerfilesMsg(error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' })
  }

  /* ── Helpers de render ──────────────────────────────────────── */
  function StatRow({ pair, onChange }: { pair: StatPair; onChange: (p: StatPair) => void }) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '.6rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Número</label>
          <input type="text" className="form-input" placeholder="8"
            value={pair.num}
            onChange={e => onChange({ ...pair, num: e.target.value })} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Etiqueta</label>
          <input type="text" className="form-input" placeholder="min — Metro Etiopía"
            value={pair.label}
            onChange={e => onChange({ ...pair, label: e.target.value })} />
        </div>
      </div>
    )
  }

  function SectionMsg({ msg }: { msg: SectionMsg }) {
    if (!msg) return null
    return (
      <span style={{ fontSize: '.8rem', color: msg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>
        {msg.text}
      </span>
    )
  }

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Encabezado de la página */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Encabezado de la página</h2>
          <p className="card__subtitle">Eyebrow, título principal, subtítulo y píldoras (JSON).</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="ey">Eyebrow</label>
            <input id="ey" type="text" className="form-input" placeholder="Vive dentro y fuera"
              value={eyebrow} onChange={e => setEyebrow(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="h1">Título (H1)</label>
            <input id="h1" type="text" className="form-input" placeholder="Todo lo que te rodea"
              value={h1} onChange={e => setH1(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sub">Subtítulo</label>
            <textarea id="sub" className="form-input" rows={2} style={{ resize: 'vertical' }}
              value={sub} onChange={e => setSub(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="pills">
              Píldoras{' '}
              <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>
                (JSON: {`[{"icon":"pin","text":"Narvarte Poniente"},…]`})
              </span>
            </label>
            <textarea id="pills" className="form-input" rows={3} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '.8rem' }}
              value={pills} onChange={e => setPills(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button className="btn btn--primary btn--sm" onClick={saveHeader} disabled={headerSave}>
              {headerSave ? 'Guardando…' : 'Guardar encabezado'}
            </button>
            <SectionMsg msg={headerMsg} />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Barra de estadísticas</h2>
          <p className="card__subtitle">4 datos que aparecen debajo del encabezado (número grande + etiqueta).</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {stats.map((s, i) => (
            <StatRow
              key={i}
              pair={s}
              onChange={updated => setStats(prev => prev.map((p, j) => j === i ? updated : p))}
            />
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button className="btn btn--primary btn--sm" onClick={saveStats} disabled={statsSave}>
              {statsSave ? 'Guardando…' : 'Guardar stats'}
            </button>
            <SectionMsg msg={statsMsg} />
          </div>
        </div>
      </div>

      {/* Sección Mapa */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Sección Mapa</h2>
          <p className="card__subtitle">Título, párrafo y 4 datos de la columna izquierda del mapa.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="mh2">Título (H2)</label>
            <input id="mh2" type="text" className="form-input"
              value={mapaH2} onChange={e => setMapaH2(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="mp">Párrafo</label>
            <textarea id="mp" className="form-input" rows={3} style={{ resize: 'vertical' }}
              value={mapaP} onChange={e => setMapaP(e.target.value)} />
          </div>
          <p className="form-label" style={{ marginBottom: '.3rem', marginTop: '.25rem' }}>
            Stats del mapa{' '}
            <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>
              (usa <code>\n</code> en la etiqueta para salto de línea)
            </span>
          </p>
          {mapaStats.map((s, i) => (
            <StatRow
              key={i}
              pair={s}
              onChange={updated => setMapaStats(prev => prev.map((p, j) => j === i ? updated : p))}
            />
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button className="btn btn--primary btn--sm" onClick={saveMapa} disabled={mapaSave}>
              {mapaSave ? 'Guardando…' : 'Guardar mapa'}
            </button>
            <SectionMsg msg={mapaMsg} />
          </div>
        </div>
      </div>

      {/* Perfiles header */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Encabezado sección &ldquo;Perfiles&rdquo;</h2>
          <p className="card__subtitle">Título y subtítulo de la sección &ldquo;Perfecto para ti, seas quien seas&rdquo;.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="ph2">Título (H2)</label>
            <input id="ph2" type="text" className="form-input"
              value={perfilesH2} onChange={e => setPerfilesH2(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="psub">Subtítulo</label>
            <textarea id="psub" className="form-input" rows={2} style={{ resize: 'vertical' }}
              value={perfilesSub} onChange={e => setPerfilesSub(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button className="btn btn--primary btn--sm" onClick={savePerfiles} disabled={perfilesSave}>
              {perfilesSave ? 'Guardando…' : 'Guardar encabezado perfiles'}
            </button>
            <SectionMsg msg={perfilesMsg} />
          </div>
        </div>
      </div>

    </div>
  )
}
