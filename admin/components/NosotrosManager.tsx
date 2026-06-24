'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type {
  EquipoItem,
  Pilar,
  Valor,
  SiteConfigTextos,
} from '@/app/dashboard/nosotros/page'

type Msg = { type: 'ok' | 'err'; text: string }

interface Props {
  equipoInit:  EquipoItem[]
  pilaresInit: Pilar[]
  valoresInit: Valor[]
  textosInit:  SiteConfigTextos
}

/* ── Iconos curados (mismas claves que el frontend) ──── */
const ICONOS: Record<string, string> = {
  usuarios:   '<circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/>',
  corazon:    '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
  estrella:   '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  chef:       '<path d="M3 11l19-9-9 19-2-8-8-2z"/>',
  cine:       '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  cafe:       '<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/>',
  idiomas:    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20M2 12h20"/>',
  casa:       '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  escudo:     '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  chat:       '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
  documento:  '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  mapa:       '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>',
  chispa:     '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
}

const ICONO_KEYS = Object.keys(ICONOS)
const ICONO_LABELS: Record<string, string> = {
  usuarios: 'Usuarios', corazon: 'Corazón', estrella: 'Estrella',
  chef: 'Chef/Cocina', cine: 'Cine', cafe: 'Café', idiomas: 'Idiomas',
  casa: 'Casa', escudo: 'Escudo', chat: 'Chat', documento: 'Documento',
  calendario: 'Calendario', mapa: 'Mapa', chispa: 'Chispa',
}

function IconPreview({ name, size = 18 }: { name: string | null; size?: number }) {
  const path = name && ICONOS[name] ? ICONOS[name] : '<circle cx="12" cy="12" r="10"/>'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: path }} />
  )
}

function IconSelector({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginTop: '.35rem' }}>
      {ICONO_KEYS.map(k => (
        <button key={k} type="button" title={ICONO_LABELS[k] || k}
          onClick={() => onChange(k)}
          style={{
            width: 36, height: 36, borderRadius: 8, display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            border: value === k ? '2px solid var(--selva, #1E4D3C)' : '1px solid var(--gray-200)',
            background: value === k ? 'rgba(30,77,60,.1)' : 'var(--gray-50)',
            color: value === k ? 'var(--selva, #1E4D3C)' : 'var(--gray-700)',
          }}>
          <IconPreview name={k} size={16} />
        </button>
      ))}
    </div>
  )
}

function MoveButtons({ onUp, onDown, disableUp, disableDown }: {
  onUp: () => void; onDown: () => void; disableUp: boolean; disableDown: boolean
}) {
  const base: React.CSSProperties = {
    background: 'none', border: '1px solid var(--gray-200)', borderRadius: 4,
    padding: '1px 6px', lineHeight: 1, fontSize: '0.85rem',
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
      <button type="button" onClick={onUp} disabled={disableUp} aria-label="Subir"
        style={{ ...base, cursor: disableUp ? 'default' : 'pointer', opacity: disableUp ? 0.3 : 1 }}>↑</button>
      <button type="button" onClick={onDown} disabled={disableDown} aria-label="Bajar"
        style={{ ...base, cursor: disableDown ? 'default' : 'pointer', opacity: disableDown ? 0.3 : 1 }}>↓</button>
    </div>
  )
}

function FotoField({ url, onChange, label }: { url: string; onChange: (v: string) => void; label: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, marginBottom: '.25rem', color: 'var(--gray-700)' }}>
        {label} <span style={{ fontWeight: 400, color: 'var(--gray-300)' }}>(URL)</span>
      </label>
      <input type="url" value={url} onChange={e => onChange(e.target.value)}
        placeholder="https://..." className="form-input"
        style={{ width: '100%', fontFamily: 'monospace', fontSize: '.78rem' }} />
      {url && (
        <img src={url} alt="" loading="lazy"
          style={{ marginTop: '.5rem', maxHeight: 80, maxWidth: 160, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--gray-200)' }}
          onError={e => (e.currentTarget.style.display = 'none')} />
      )}
    </div>
  )
}

/* ── Componente principal ─────────────────────────────── */
export default function NosotrosManager({ equipoInit, pilaresInit, valoresInit, textosInit }: Props) {
  const supabase = createClient()

  /* ── TEXTOS singleton ──────────────────────────────────── */
  const [textos,    setTextos]    = useState<SiteConfigTextos>(textosInit)
  const [heroSave,  setHeroSave]  = useState(false)
  const [heroMsg,   setHeroMsg]   = useState<Msg | null>(null)
  const [histSave,  setHistSave]  = useState(false)
  const [histMsg,   setHistMsg]   = useState<Msg | null>(null)
  const [casaSave,  setCasaSave]  = useState(false)
  const [casaMsg,   setCasaMsg]   = useState<Msg | null>(null)
  const [miscSave,  setMiscSave]  = useState(false)
  const [miscMsg,   setMiscMsg]   = useState<Msg | null>(null)

  async function upsertKeys(pairs: [string, string][]) {
    const now = new Date().toISOString()
    const rows = pairs.map(([key, value]) => ({ key, value, updated_at: now }))
    const { error } = await supabase.from('site_config').upsert(rows, { onConflict: 'key' })
    return error
  }

  async function saveHero() {
    setHeroSave(true); setHeroMsg(null)
    const error = await upsertKeys([
      ['nosotros_hero_pill',         textos.nosotros_hero_pill],
      ['nosotros_hero_h1',           textos.nosotros_hero_h1],
      ['nosotros_hero_sub',          textos.nosotros_hero_sub],
      ['nosotros_hero_foto_url',     textos.nosotros_hero_foto_url],
      ['nosotros_hero_badge_titulo', textos.nosotros_hero_badge_titulo],
      ['nosotros_hero_badge_sub',    textos.nosotros_hero_badge_sub],
      ['nosotros_filo_eyebrow',      textos.nosotros_filo_eyebrow],
      ['nosotros_filo_tagline',      textos.nosotros_filo_tagline],
      ['nosotros_valores_eyebrow',   textos.nosotros_valores_eyebrow],
      ['nosotros_valores_titulo',    textos.nosotros_valores_titulo],
      ['nosotros_equipo_eyebrow',    textos.nosotros_equipo_eyebrow],
      ['nosotros_equipo_titulo',     textos.nosotros_equipo_titulo],
      ['nosotros_equipo_sub',        textos.nosotros_equipo_sub],
    ])
    setHeroSave(false)
    setHeroMsg(error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' })
  }

  async function saveHist() {
    setHistSave(true); setHistMsg(null)
    const error = await upsertKeys([
      ['nosotros_hist_titulo',   textos.nosotros_hist_titulo],
      ['nosotros_hist_p1',       textos.nosotros_hist_p1],
      ['nosotros_hist_p2',       textos.nosotros_hist_p2],
      ['nosotros_hist_p3',       textos.nosotros_hist_p3],
      ['nosotros_hist_foto_url', textos.nosotros_hist_foto_url],
      ['nosotros_hist_quote',    textos.nosotros_hist_quote],
    ])
    setHistSave(false)
    setHistMsg(error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' })
  }

  async function saveCasa() {
    setCasaSave(true); setCasaMsg(null)
    const error = await upsertKeys([
      ['nosotros_casa_eyebrow',           textos.nosotros_casa_eyebrow],
      ['nosotros_casa_titulo',            textos.nosotros_casa_titulo],
      ['nosotros_casa_sub',               textos.nosotros_casa_sub],
      ['nosotros_casa_texto',             textos.nosotros_casa_texto],
      ['nosotros_casa_stat_ubicaciones',  textos.nosotros_casa_stat_ubicaciones],
      ['nosotros_casa_stat_habitaciones', textos.nosotros_casa_stat_habitaciones],
      ['nosotros_casa_foto1_url',         textos.nosotros_casa_foto1_url],
      ['nosotros_casa_foto1_alt',         textos.nosotros_casa_foto1_alt],
      ['nosotros_casa_foto2_url',         textos.nosotros_casa_foto2_url],
      ['nosotros_casa_foto2_alt',         textos.nosotros_casa_foto2_alt],
      ['nosotros_casa_foto3_url',         textos.nosotros_casa_foto3_url],
      ['nosotros_casa_foto3_alt',         textos.nosotros_casa_foto3_alt],
      ['nosotros_casa_foto4_url',         textos.nosotros_casa_foto4_url],
      ['nosotros_casa_foto4_alt',         textos.nosotros_casa_foto4_alt],
    ])
    setCasaSave(false)
    setCasaMsg(error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' })
  }

  async function saveMisc() {
    setMiscSave(true); setMiscMsg(null)
    const error = await upsertKeys([
      ['nosotros_crece_eyebrow', textos.nosotros_crece_eyebrow],
      ['nosotros_crece_titulo',  textos.nosotros_crece_titulo],
      ['nosotros_crece_texto',   textos.nosotros_crece_texto],
      ['nosotros_crece_badge',   textos.nosotros_crece_badge],
      ['nosotros_bridge_titulo', textos.nosotros_bridge_titulo],
      ['nosotros_bridge_texto',  textos.nosotros_bridge_texto],
      ['nosotros_cta_titulo',    textos.nosotros_cta_titulo],
      ['nosotros_cta_sub',       textos.nosotros_cta_sub],
    ])
    setMiscSave(false)
    setMiscMsg(error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' })
  }

  function setTexto(key: keyof SiteConfigTextos, val: string) {
    setTextos(prev => ({ ...prev, [key]: val }))
  }

  /* ── EQUIPO ─────────────────────────────────────────────── */
  const [equipo,      setEquipo]      = useState<EquipoItem[]>(equipoInit)
  const [equipoSave,  setEquipoSave]  = useState<string | null>(null)
  const [equipoMsgs,  setEquipoMsgs]  = useState<Record<string, Msg>>({})
  const [addingEq,    setAddingEq]    = useState(false)

  function updateEquipo(id: string, field: keyof EquipoItem, val: string | boolean | number | null) {
    setEquipo(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e))
  }
  async function saveEquipo(id: string) {
    const item = equipo.find(e => e.id === id); if (!item) return
    setEquipoSave(id)
    const { error } = await supabase.from('nosotros_equipo').update({
      nombre: item.nombre, rol: item.rol || null, bio: item.bio || null,
      foto_url: item.foto_url || null, orden: item.orden, activo: item.activo,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setEquipoSave(null)
    setEquipoMsgs(prev => ({ ...prev, [id]: error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' } }))
  }
  async function deleteEquipo(id: string) {
    if (!confirm('¿Eliminar esta persona del equipo?')) return
    const { error } = await supabase.from('nosotros_equipo').delete().eq('id', id)
    if (!error) setEquipo(prev => prev.filter(e => e.id !== id))
    else setEquipoMsgs(prev => ({ ...prev, [id]: { type: 'err', text: 'Error al eliminar.' } }))
  }
  async function addEquipo() {
    setAddingEq(true)
    const { data, error } = await supabase.from('nosotros_equipo')
      .insert({ nombre: 'Nuevo integrante', rol: null, bio: null, foto_url: null, orden: equipo.length + 1, activo: false })
      .select('id, nombre, rol, bio, foto_url, orden, activo').single()
    setAddingEq(false)
    if (!error && data) setEquipo(prev => [...prev, data as EquipoItem])
  }
  async function moveEquipo(id: string, dir: 'up' | 'down') {
    const sorted = [...equipo].sort((a, b) => a.orden - b.orden)
    const idx = sorted.findIndex(e => e.id === id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const reordered = [...sorted]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
    const updated = reordered.map((e, i) => ({ ...e, orden: i + 1 }))
    setEquipo(updated)
    await Promise.all(updated.map(e =>
      supabase.from('nosotros_equipo').update({ orden: e.orden, updated_at: new Date().toISOString() }).eq('id', e.id)
    ))
  }

  /* ── PILARES ─────────────────────────────────────────────── */
  const [pilares,     setPilares]     = useState<Pilar[]>(pilaresInit)
  const [pilarSave,   setPilarSave]   = useState<string | null>(null)
  const [pilarMsgs,   setPilarMsgs]   = useState<Record<string, Msg>>({})
  const [addingPilar, setAddingPilar] = useState(false)

  function updatePilar(id: string, field: keyof Pilar, val: string | boolean | number | null) {
    setPilares(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p))
  }
  async function savePilar(id: string) {
    const item = pilares.find(p => p.id === id); if (!item) return
    setPilarSave(id)
    const { error } = await supabase.from('nosotros_pilares').update({
      nombre: item.nombre, descripcion: item.descripcion || null, icono: item.icono || null,
      orden: item.orden, activo: item.activo, updated_at: new Date().toISOString(),
    }).eq('id', id)
    setPilarSave(null)
    setPilarMsgs(prev => ({ ...prev, [id]: error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' } }))
  }
  async function deletePilar(id: string) {
    if (!confirm('¿Eliminar este pilar?')) return
    const { error } = await supabase.from('nosotros_pilares').delete().eq('id', id)
    if (!error) setPilares(prev => prev.filter(p => p.id !== id))
    else setPilarMsgs(prev => ({ ...prev, [id]: { type: 'err', text: 'Error al eliminar.' } }))
  }
  async function addPilar() {
    setAddingPilar(true)
    const { data, error } = await supabase.from('nosotros_pilares')
      .insert({ nombre: 'Nuevo pilar', descripcion: null, icono: 'estrella', orden: pilares.length + 1, activo: false })
      .select('id, nombre, descripcion, icono, orden, activo').single()
    setAddingPilar(false)
    if (!error && data) setPilares(prev => [...prev, data as Pilar])
  }
  async function movePilar(id: string, dir: 'up' | 'down') {
    const sorted = [...pilares].sort((a, b) => a.orden - b.orden)
    const idx = sorted.findIndex(p => p.id === id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const reordered = [...sorted]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
    const updated = reordered.map((p, i) => ({ ...p, orden: i + 1 }))
    setPilares(updated)
    await Promise.all(updated.map(p =>
      supabase.from('nosotros_pilares').update({ orden: p.orden, updated_at: new Date().toISOString() }).eq('id', p.id)
    ))
  }

  /* ── VALORES ─────────────────────────────────────────────── */
  const [valores,     setValores]     = useState<Valor[]>(valoresInit)
  const [valorSave,   setValorSave]   = useState<string | null>(null)
  const [valorMsgs,   setValorMsgs]   = useState<Record<string, Msg>>({})
  const [addingValor, setAddingValor] = useState(false)

  function updateValor(id: string, field: keyof Valor, val: string | boolean | number | null) {
    setValores(prev => prev.map(v => v.id === id ? { ...v, [field]: val } : v))
  }
  async function saveValor(id: string) {
    const item = valores.find(v => v.id === id); if (!item) return
    setValorSave(id)
    const { error } = await supabase.from('nosotros_valores').update({
      nombre: item.nombre, descripcion: item.descripcion || null, icono: item.icono || null,
      orden: item.orden, activo: item.activo, updated_at: new Date().toISOString(),
    }).eq('id', id)
    setValorSave(null)
    setValorMsgs(prev => ({ ...prev, [id]: error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' } }))
  }
  async function deleteValor(id: string) {
    if (!confirm('¿Eliminar este valor?')) return
    const { error } = await supabase.from('nosotros_valores').delete().eq('id', id)
    if (!error) setValores(prev => prev.filter(v => v.id !== id))
    else setValorMsgs(prev => ({ ...prev, [id]: { type: 'err', text: 'Error al eliminar.' } }))
  }
  async function addValor() {
    setAddingValor(true)
    const { data, error } = await supabase.from('nosotros_valores')
      .insert({ nombre: 'Nuevo valor', descripcion: null, icono: 'estrella', orden: valores.length + 1, activo: false })
      .select('id, nombre, descripcion, icono, orden, activo').single()
    setAddingValor(false)
    if (!error && data) setValores(prev => [...prev, data as Valor])
  }
  async function moveValor(id: string, dir: 'up' | 'down') {
    const sorted = [...valores].sort((a, b) => a.orden - b.orden)
    const idx = sorted.findIndex(v => v.id === id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const reordered = [...sorted]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
    const updated = reordered.map((v, i) => ({ ...v, orden: i + 1 }))
    setValores(updated)
    await Promise.all(updated.map(v =>
      supabase.from('nosotros_valores').update({ orden: v.orden, updated_at: new Date().toISOString() }).eq('id', v.id)
    ))
  }

  /* ─────────────────────────────────────────────────────────
     UI Helpers
  ───────────────────────────────────────────────────────── */
  const fieldStyle: React.CSSProperties = { width: '100%', marginBottom: '.75rem' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '.8rem', fontWeight: 600, marginBottom: '.25rem', color: 'var(--gray-700)' }
  const sectionStyle: React.CSSProperties = { background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }
  const sectionTitleStyle: React.CSSProperties = { fontFamily: '"Young Serif", Georgia, serif', fontSize: '1.05rem', color: 'var(--selva, #1E4D3C)', marginBottom: '1.25rem', paddingBottom: '.6rem', borderBottom: '1px solid var(--gray-200)' }
  const cardStyle: React.CSSProperties = { background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 10, padding: '1.1rem 1.25rem', marginBottom: '.85rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }
  const rowStyle: React.CSSProperties = { display: 'flex', gap: '.6rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '.75rem' }

  function MsgBadge({ msg }: { msg: Msg | null }) {
    if (!msg) return null
    return <span style={{ fontSize: '.8rem', fontWeight: 600, color: msg.type === 'ok' ? 'var(--selva, #1E4D3C)' : '#c0392b' }}>{msg.text}</span>
  }

  function ActiveToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', cursor: 'pointer', fontSize: '.82rem', fontWeight: 500 }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 15, height: 15, accentColor: 'var(--selva, #1E4D3C)' }} />
        Visible en el sitio
      </label>
    )
  }

  const sortedEquipo  = [...equipo].sort((a, b) => a.orden - b.orden)
  const sortedPilares = [...pilares].sort((a, b) => a.orden - b.orden)
  const sortedValores = [...valores].sort((a, b) => a.orden - b.orden)

  /* ── RENDER ────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ══ TEXTOS HERO + FILOSOFÍA + SECCIONES ══════════ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Hero, Filosofía y Secciones de texto</h2>

        {/* Pill + H1 + Sub */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '.75rem' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Pill / eyebrow</label>
            <input type="text" className="form-input" value={textos.nosotros_hero_pill}
              onChange={e => setTexto('nosotros_hero_pill', e.target.value)} placeholder="Quiénes somos" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Título principal (H1)</label>
            <input type="text" className="form-input" value={textos.nosotros_hero_h1}
              onChange={e => setTexto('nosotros_hero_h1', e.target.value)} placeholder="Detrás de Rentalia" />
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Subtítulo del hero</label>
          <textarea className="form-textarea" rows={2} value={textos.nosotros_hero_sub}
            onChange={e => setTexto('nosotros_hero_sub', e.target.value)} style={{ width: '100%' }} />
        </div>
        <FotoField url={textos.nosotros_hero_foto_url} label="Foto del hero"
          onChange={v => setTexto('nosotros_hero_foto_url', v)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginTop: '.75rem' }}>
          <div>
            <label style={labelStyle}>Badge: título (ej. "Casa Narvarte")</label>
            <input type="text" className="form-input" value={textos.nosotros_hero_badge_titulo}
              onChange={e => setTexto('nosotros_hero_badge_titulo', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Badge: subtítulo (ej. "Narvarte Poniente · CDMX")</label>
            <input type="text" className="form-input" value={textos.nosotros_hero_badge_sub}
              onChange={e => setTexto('nosotros_hero_badge_sub', e.target.value)} />
          </div>
        </div>

        {/* Filosofía headers */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
          <p style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.6rem' }}>Sección Filosofía</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '.75rem' }}>
            <div>
              <label style={labelStyle}>Eyebrow</label>
              <input type="text" className="form-input" value={textos.nosotros_filo_eyebrow}
                onChange={e => setTexto('nosotros_filo_eyebrow', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Tagline / frase principal</label>
              <input type="text" className="form-input" value={textos.nosotros_filo_tagline}
                onChange={e => setTexto('nosotros_filo_tagline', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Valores + Equipo headers */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
          <p style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.6rem' }}>Headers — Valores y Equipo</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
            <div>
              <label style={labelStyle}>Valores — eyebrow</label>
              <input type="text" className="form-input" value={textos.nosotros_valores_eyebrow}
                onChange={e => setTexto('nosotros_valores_eyebrow', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Valores — título</label>
              <input type="text" className="form-input" value={textos.nosotros_valores_titulo}
                onChange={e => setTexto('nosotros_valores_titulo', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Equipo — eyebrow</label>
              <input type="text" className="form-input" value={textos.nosotros_equipo_eyebrow}
                onChange={e => setTexto('nosotros_equipo_eyebrow', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Equipo — título</label>
              <input type="text" className="form-input" value={textos.nosotros_equipo_titulo}
                onChange={e => setTexto('nosotros_equipo_titulo', e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: '.6rem' }}>
            <label style={labelStyle}>Equipo — subtítulo</label>
            <input type="text" className="form-input" value={textos.nosotros_equipo_sub}
              onChange={e => setTexto('nosotros_equipo_sub', e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        <div style={rowStyle}>
          <button className="btn btn--primary" onClick={saveHero} disabled={heroSave}>
            {heroSave ? 'Guardando…' : 'Guardar sección hero + filosoía + headers'}
          </button>
          <MsgBadge msg={heroMsg} />
        </div>
      </div>

      {/* ══ HISTORIA ════════════════════════════════════════ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Historia</h2>
        <div style={fieldStyle}>
          <label style={labelStyle}>Título de la sección</label>
          <input type="text" className="form-input" value={textos.nosotros_hist_titulo}
            onChange={e => setTexto('nosotros_hist_titulo', e.target.value)} style={{ width: '100%' }} />
        </div>
        {(['nosotros_hist_p1', 'nosotros_hist_p2', 'nosotros_hist_p3'] as const).map((key, i) => (
          <div key={key} style={fieldStyle}>
            <label style={labelStyle}>Párrafo {i + 1}</label>
            <textarea className="form-textarea" rows={3} value={textos[key]}
              onChange={e => setTexto(key, e.target.value)} style={{ width: '100%' }} />
          </div>
        ))}
        <div style={fieldStyle}>
          <label style={labelStyle}>Frase / cita circular</label>
          <input type="text" className="form-input" value={textos.nosotros_hist_quote}
            onChange={e => setTexto('nosotros_hist_quote', e.target.value)} style={{ width: '100%' }} />
        </div>
        <FotoField url={textos.nosotros_hist_foto_url} label="Foto de la historia (visual lateral)"
          onChange={v => setTexto('nosotros_hist_foto_url', v)} />
        <div style={rowStyle}>
          <button className="btn btn--primary" onClick={saveHist} disabled={histSave}>
            {histSave ? 'Guardando…' : 'Guardar historia'}
          </button>
          <MsgBadge msg={histMsg} />
        </div>
      </div>

      {/* ══ LA CASA DE NARVARTE ════════════════════════════ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>La Casa de Narvarte</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '.75rem' }}>
          <div>
            <label style={labelStyle}>Eyebrow</label>
            <input type="text" className="form-input" value={textos.nosotros_casa_eyebrow}
              onChange={e => setTexto('nosotros_casa_eyebrow', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Título</label>
            <input type="text" className="form-input" value={textos.nosotros_casa_titulo}
              onChange={e => setTexto('nosotros_casa_titulo', e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: '.6rem' }}>
          <label style={labelStyle}>Subtítulo itálico</label>
          <input type="text" className="form-input" value={textos.nosotros_casa_sub}
            onChange={e => setTexto('nosotros_casa_sub', e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: '.6rem' }}>
          <label style={labelStyle}>Texto descriptivo</label>
          <textarea className="form-textarea" rows={3} value={textos.nosotros_casa_texto}
            onChange={e => setTexto('nosotros_casa_texto', e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginTop: '.6rem' }}>
          <div>
            <label style={labelStyle}>Stat: Ubicaciones</label>
            <input type="text" className="form-input" value={textos.nosotros_casa_stat_ubicaciones}
              onChange={e => setTexto('nosotros_casa_stat_ubicaciones', e.target.value)} placeholder="1" />
          </div>
          <div>
            <label style={labelStyle}>Stat: Habitaciones</label>
            <input type="text" className="form-input" value={textos.nosotros_casa_stat_habitaciones}
              onChange={e => setTexto('nosotros_casa_stat_habitaciones', e.target.value)} placeholder="11" />
          </div>
        </div>

        {/* Fotos */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
          <p style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem' }}>Fotos de la casa (4)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {([
              ['nosotros_casa_foto1_url', 'nosotros_casa_foto1_alt', 'Foto 1 (arco zaguan)'],
              ['nosotros_casa_foto2_url', 'nosotros_casa_foto2_alt', 'Foto 2'],
              ['nosotros_casa_foto3_url', 'nosotros_casa_foto3_alt', 'Foto 3'],
              ['nosotros_casa_foto4_url', 'nosotros_casa_foto4_alt', 'Foto 4 (arco invertido)'],
            ] as const).map(([urlKey, altKey, label]) => (
              <div key={urlKey}>
                <FotoField url={textos[urlKey]} label={label}
                  onChange={v => setTexto(urlKey, v)} />
                <label style={{ ...labelStyle, marginTop: '.4rem' }}>Alt / descripción de accesibilidad</label>
                <input type="text" className="form-input" value={textos[altKey]}
                  onChange={e => setTexto(altKey, e.target.value)} style={{ width: '100%' }} />
              </div>
            ))}
          </div>
        </div>

        <div style={rowStyle}>
          <button className="btn btn--primary" onClick={saveCasa} disabled={casaSave}>
            {casaSave ? 'Guardando…' : 'Guardar La Casa de Narvarte'}
          </button>
          <MsgBadge msg={casaMsg} />
        </div>
      </div>

      {/* ══ PILARES (filosofía) ════════════════════════════ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Pilares de la filosofía</h2>
        {sortedPilares.map((p, i) => (
          <div key={p.id} style={cardStyle}>
            <MoveButtons
              onUp={() => movePilar(p.id, 'up')} onDown={() => movePilar(p.id, 'down')}
              disableUp={i === 0} disableDown={i === sortedPilares.length - 1} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '.6rem' }}>
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input type="text" className="form-input" value={p.nombre}
                    onChange={e => updatePilar(p.id, 'nombre', e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={labelStyle}>Icono</label>
                  <IconSelector value={p.icono} onChange={v => updatePilar(p.id, 'icono', v)} />
                </div>
              </div>
              <div style={{ marginTop: '.6rem' }}>
                <label style={labelStyle}>Descripción</label>
                <textarea className="form-textarea" rows={2} value={p.descripcion || ''}
                  onChange={e => updatePilar(p.id, 'descripcion', e.target.value)} style={{ width: '100%' }} />
              </div>
              <div style={rowStyle}>
                <ActiveToggle checked={p.activo} onChange={v => updatePilar(p.id, 'activo', v)} />
                <button className="btn btn--primary btn--sm" onClick={() => savePilar(p.id)} disabled={pilarSave === p.id}>
                  {pilarSave === p.id ? 'Guardando…' : 'Guardar'}
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => deletePilar(p.id)}>Eliminar</button>
                <MsgBadge msg={pilarMsgs[p.id] ?? null} />
              </div>
            </div>
          </div>
        ))}
        <button className="btn btn--secondary" onClick={addPilar} disabled={addingPilar}>
          {addingPilar ? 'Agregando…' : '+ Agregar pilar'}
        </button>
      </div>

      {/* ══ VALORES ════════════════════════════════════════ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Valores</h2>
        {sortedValores.map((v, i) => (
          <div key={v.id} style={cardStyle}>
            <MoveButtons
              onUp={() => moveValor(v.id, 'up')} onDown={() => moveValor(v.id, 'down')}
              disableUp={i === 0} disableDown={i === sortedValores.length - 1} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '.6rem' }}>
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input type="text" className="form-input" value={v.nombre}
                    onChange={e => updateValor(v.id, 'nombre', e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={labelStyle}>Icono</label>
                  <IconSelector value={v.icono} onChange={val => updateValor(v.id, 'icono', val)} />
                </div>
              </div>
              <div style={{ marginTop: '.6rem' }}>
                <label style={labelStyle}>Descripción</label>
                <textarea className="form-textarea" rows={2} value={v.descripcion || ''}
                  onChange={e => updateValor(v.id, 'descripcion', e.target.value)} style={{ width: '100%' }} />
              </div>
              <div style={rowStyle}>
                <ActiveToggle checked={v.activo} onChange={val => updateValor(v.id, 'activo', val)} />
                <button className="btn btn--primary btn--sm" onClick={() => saveValor(v.id)} disabled={valorSave === v.id}>
                  {valorSave === v.id ? 'Guardando…' : 'Guardar'}
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => deleteValor(v.id)}>Eliminar</button>
                <MsgBadge msg={valorMsgs[v.id] ?? null} />
              </div>
            </div>
          </div>
        ))}
        <button className="btn btn--secondary" onClick={addValor} disabled={addingValor}>
          {addingValor ? 'Agregando…' : '+ Agregar valor'}
        </button>
      </div>

      {/* ══ EQUIPO ══════════════════════════════════════════ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Equipo</h2>
        <p style={{ fontSize: '.85rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
          Las personas con <strong>Visible en el sitio</strong> desactivado no aparecen en la página pública. Actívalas cuando tengas datos reales.
        </p>
        {sortedEquipo.map((m, i) => (
          <div key={m.id} style={cardStyle}>
            <MoveButtons
              onUp={() => moveEquipo(m.id, 'up')} onDown={() => moveEquipo(m.id, 'down')}
              disableUp={i === 0} disableDown={i === sortedEquipo.length - 1} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input type="text" className="form-input" value={m.nombre}
                    onChange={e => updateEquipo(m.id, 'nombre', e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={labelStyle}>Rol / cargo</label>
                  <input type="text" className="form-input" value={m.rol || ''}
                    onChange={e => updateEquipo(m.id, 'rol', e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ marginTop: '.6rem' }}>
                <label style={labelStyle}>Biografía corta</label>
                <textarea className="form-textarea" rows={2} value={m.bio || ''}
                  onChange={e => updateEquipo(m.id, 'bio', e.target.value)} style={{ width: '100%' }} />
              </div>
              <div style={{ marginTop: '.6rem' }}>
                <FotoField url={m.foto_url || ''} label="Foto de perfil"
                  onChange={v => updateEquipo(m.id, 'foto_url', v)} />
              </div>
              <div style={rowStyle}>
                <ActiveToggle checked={m.activo} onChange={v => updateEquipo(m.id, 'activo', v)} />
                <button className="btn btn--primary btn--sm" onClick={() => saveEquipo(m.id)} disabled={equipoSave === m.id}>
                  {equipoSave === m.id ? 'Guardando…' : 'Guardar'}
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => deleteEquipo(m.id)}>Eliminar</button>
                <MsgBadge msg={equipoMsgs[m.id] ?? null} />
              </div>
            </div>
          </div>
        ))}
        <button className="btn btn--secondary" onClick={addEquipo} disabled={addingEq}>
          {addingEq ? 'Agregando…' : '+ Agregar integrante'}
        </button>
      </div>

      {/* ══ CRECE + BRIDGE + CTA ════════════════════════════ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>El futuro, Bridge y CTA</h2>

        <p style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem' }}>Sección "El futuro"</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '.75rem' }}>
          <div>
            <label style={labelStyle}>Eyebrow</label>
            <input type="text" className="form-input" value={textos.nosotros_crece_eyebrow}
              onChange={e => setTexto('nosotros_crece_eyebrow', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Título</label>
            <input type="text" className="form-input" value={textos.nosotros_crece_titulo}
              onChange={e => setTexto('nosotros_crece_titulo', e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: '.6rem' }}>
          <label style={labelStyle}>Texto</label>
          <textarea className="form-textarea" rows={3} value={textos.nosotros_crece_texto}
            onChange={e => setTexto('nosotros_crece_texto', e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: '.6rem' }}>
          <label style={labelStyle}>Badge (ej. "Casa activa: Narvarte Poniente · CDMX")</label>
          <input type="text" className="form-input" value={textos.nosotros_crece_badge}
            onChange={e => setTexto('nosotros_crece_badge', e.target.value)} style={{ width: '100%' }} />
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
          <p style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem' }}>Bridge card</p>
          <div style={fieldStyle}>
            <label style={labelStyle}>Título</label>
            <input type="text" className="form-input" value={textos.nosotros_bridge_titulo}
              onChange={e => setTexto('nosotros_bridge_titulo', e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Texto</label>
            <textarea className="form-textarea" rows={2} value={textos.nosotros_bridge_texto}
              onChange={e => setTexto('nosotros_bridge_texto', e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
          <p style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem' }}>CTA banda</p>
          <div style={fieldStyle}>
            <label style={labelStyle}>Título (puede incluir em para énfasis)</label>
            <input type="text" className="form-input" value={textos.nosotros_cta_titulo}
              onChange={e => setTexto('nosotros_cta_titulo', e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Subtítulo</label>
            <input type="text" className="form-input" value={textos.nosotros_cta_sub}
              onChange={e => setTexto('nosotros_cta_sub', e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        <div style={rowStyle}>
          <button className="btn btn--primary" onClick={saveMisc} disabled={miscSave}>
            {miscSave ? 'Guardando…' : 'Guardar El futuro + Bridge + CTA'}
          </button>
          <MsgBadge msg={miscMsg} />
        </div>
      </div>

    </div>
  )
}
