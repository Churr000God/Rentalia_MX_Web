'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type {
  GaleriaItem,
  Testimonio,
  Pilar,
  Evento,
  Cuidamos,
  SiteConfigTextos,
} from '@/app/dashboard/comunidad/page'

type Msg = { type: 'ok' | 'err'; text: string }

interface Props {
  galeriaInit:     GaleriaItem[]
  testimoniosInit: Testimonio[]
  pilaresInit:     Pilar[]
  eventosInit:     Evento[]
  cuidamosInit:    Cuidamos[]
  textosInit:      SiteConfigTextos
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
            border: value === k ? '2px solid var(--selva, #1E4D3C)' : '1px solid var(--border)',
            background: value === k ? 'rgba(30,77,60,.1)' : 'var(--surface-2, #f5f5f0)',
            color: value === k ? 'var(--selva, #1E4D3C)' : 'var(--gray-700)',
          }}>
          <IconPreview name={k} size={16} />
        </button>
      ))}
    </div>
  )
}

/* ── Botones ↑↓ reutilizables ─────────────────────────── */
function MoveButtons({
  onUp, onDown, disableUp, disableDown,
}: { onUp: () => void; onDown: () => void; disableUp: boolean; disableDown: boolean }) {
  const base: React.CSSProperties = {
    background: 'none', border: '1px solid var(--border)', borderRadius: 4,
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

/* ── Componente principal ─────────────────────────────── */
export default function ComunidadManager({
  galeriaInit, testimoniosInit, pilaresInit, eventosInit, cuidamosInit, textosInit,
}: Props) {
  const supabase = createClient()

  /* ── TEXTOS ──────────────────────────────────────────────────── */
  const [textos,     setTextos]     = useState<SiteConfigTextos>(textosInit)
  const [textosSave, setTextosSave] = useState(false)
  const [textosMsg,  setTextosMsg]  = useState<Msg | null>(null)

  async function upsertKeys(pairs: [string, string][]) {
    const now = new Date().toISOString()
    const rows = pairs.map(([key, value]) => ({ key, value, updated_at: now }))
    const { error } = await supabase.from('site_config').upsert(rows, { onConflict: 'key' })
    return error
  }

  async function saveTextos() {
    setTextosSave(true); setTextosMsg(null)
    const error = await upsertKeys([
      ['comunidad_eyebrow',            textos.comunidad_eyebrow],
      ['comunidad_h1',                 textos.comunidad_h1],
      ['comunidad_sub',                textos.comunidad_sub],
      ['comunidad_galeria_titulo',     textos.comunidad_galeria_titulo],
      ['comunidad_testimonios_titulo', textos.comunidad_testimonios_titulo],
      ['comunidad_cta_titulo',         textos.comunidad_cta_titulo],
      ['comunidad_cta_texto',          textos.comunidad_cta_texto],
      ['comunidad_eventos_eyebrow',    textos.comunidad_eventos_eyebrow],
      ['comunidad_eventos_titulo',     textos.comunidad_eventos_titulo],
      ['comunidad_cuida_eyebrow',      textos.comunidad_cuida_eyebrow],
      ['comunidad_cuida_titulo',       textos.comunidad_cuida_titulo],
    ])
    setTextosSave(false)
    setTextosMsg(error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' })
  }

  /* ── NARVARTE AFUERA ─────────────────────────────────────────── */
  const [connSave, setConnSave] = useState(false)
  const [connMsg,  setConnMsg]  = useState<Msg | null>(null)

  async function saveConn() {
    setConnSave(true); setConnMsg(null)
    const error = await upsertKeys([
      ['comunidad_conn_eyebrow',   textos.comunidad_conn_eyebrow],
      ['comunidad_conn_titulo',    textos.comunidad_conn_titulo],
      ['comunidad_conn_texto',     textos.comunidad_conn_texto],
      ['comunidad_conn_link_text', textos.comunidad_conn_link_text],
      ['comunidad_conn_link_url',  textos.comunidad_conn_link_url],
      ['comunidad_conn_foto1_url', textos.comunidad_conn_foto1_url],
      ['comunidad_conn_foto1_alt', textos.comunidad_conn_foto1_alt],
      ['comunidad_conn_foto2_url', textos.comunidad_conn_foto2_url],
      ['comunidad_conn_foto2_alt', textos.comunidad_conn_foto2_alt],
    ])
    setConnSave(false)
    setConnMsg(error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' })
  }

  /* ── GALERÍA ─────────────────────────────────────────────────── */
  const [galeria,   setGaleria]   = useState<GaleriaItem[]>(galeriaInit)
  const [galSave,   setGalSave]   = useState<string | null>(null)
  const [galMsgs,   setGalMsgs]   = useState<Record<string, Msg>>({})
  const [addingGal, setAddingGal] = useState(false)

  function updateGal(id: string, field: keyof GaleriaItem, val: string | boolean | number | null) {
    setGaleria(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g))
  }
  async function saveGal(id: string) {
    const item = galeria.find(g => g.id === id); if (!item) return
    setGalSave(id)
    const { error } = await supabase.from('comunidad_galeria').update({
      imagen_url: item.imagen_url, alt_text: item.alt_text || null,
      caption: item.caption || null, orden: item.orden, activo: item.activo,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setGalSave(null)
    setGalMsgs(prev => ({ ...prev, [id]: error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' } }))
  }
  async function deleteGal(id: string) {
    if (!confirm('¿Eliminar esta foto?')) return
    const { error } = await supabase.from('comunidad_galeria').delete().eq('id', id)
    if (!error) setGaleria(prev => prev.filter(g => g.id !== id))
    else setGalMsgs(prev => ({ ...prev, [id]: { type: 'err', text: 'Error al eliminar.' } }))
  }
  async function addGal() {
    if (galeria.length >= 5) return
    setAddingGal(true)
    const { data, error } = await supabase.from('comunidad_galeria')
      .insert({ imagen_url: '', alt_text: null, caption: null, orden: galeria.length + 1, activo: true })
      .select('id, imagen_url, alt_text, caption, orden, activo').single()
    setAddingGal(false)
    if (!error && data) setGaleria(prev => [...prev, data as GaleriaItem])
  }

  /* ── TESTIMONIOS ─────────────────────────────────────────────── */
  const [testimonios,  setTestimonios]  = useState<Testimonio[]>(testimoniosInit)
  const [testSave,     setTestSave]     = useState<string | null>(null)
  const [testMsgs,     setTestMsgs]     = useState<Record<string, Msg>>({})
  const [addingTest,   setAddingTest]   = useState(false)

  function updateTest(id: string, field: keyof Testimonio, val: string | boolean | number | null) {
    setTestimonios(prev => prev.map(t => t.id === id ? { ...t, [field]: val } : t))
  }
  async function saveTest(id: string) {
    const item = testimonios.find(t => t.id === id); if (!item) return
    setTestSave(id)
    const { error } = await supabase.from('comunidad_testimonios').update({
      nombre: item.nombre, detalle: item.detalle || null, foto_url: item.foto_url || null,
      texto: item.texto, rating: item.rating ?? null, orden: item.orden, activo: item.activo,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setTestSave(null)
    setTestMsgs(prev => ({ ...prev, [id]: error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' } }))
  }
  async function deleteTest(id: string) {
    if (!confirm('¿Eliminar este testimonio?')) return
    const { error } = await supabase.from('comunidad_testimonios').delete().eq('id', id)
    if (!error) setTestimonios(prev => prev.filter(t => t.id !== id))
    else setTestMsgs(prev => ({ ...prev, [id]: { type: 'err', text: 'Error al eliminar.' } }))
  }
  async function addTest() {
    setAddingTest(true)
    const { data, error } = await supabase.from('comunidad_testimonios')
      .insert({ nombre: 'Nuevo residente', texto: '', orden: testimonios.length + 1, activo: false })
      .select('id, nombre, detalle, foto_url, texto, rating, orden, activo').single()
    setAddingTest(false)
    if (!error && data) setTestimonios(prev => [...prev, data as Testimonio])
  }

  /* ── PILARES ─────────────────────────────────────────────────── */
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
    const { error } = await supabase.from('comunidad_pilares').update({
      nombre: item.nombre, descripcion: item.descripcion || null, icono: item.icono || null,
      orden: item.orden, activo: item.activo, updated_at: new Date().toISOString(),
    }).eq('id', id)
    setPilarSave(null)
    setPilarMsgs(prev => ({ ...prev, [id]: error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' } }))
  }
  async function deletePilar(id: string) {
    if (!confirm('¿Eliminar este pilar?')) return
    const { error } = await supabase.from('comunidad_pilares').delete().eq('id', id)
    if (!error) setPilares(prev => prev.filter(p => p.id !== id))
    else setPilarMsgs(prev => ({ ...prev, [id]: { type: 'err', text: 'Error al eliminar.' } }))
  }
  async function addPilar() {
    setAddingPilar(true)
    const { data, error } = await supabase.from('comunidad_pilares')
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
      supabase.from('comunidad_pilares').update({ orden: p.orden, updated_at: new Date().toISOString() }).eq('id', p.id)
    ))
  }

  /* ── EVENTOS ─────────────────────────────────────────────────── */
  const [eventos,      setEventos]      = useState<Evento[]>(eventosInit)
  const [eventoSave,   setEventoSave]   = useState<string | null>(null)
  const [eventoMsgs,   setEventoMsgs]   = useState<Record<string, Msg>>({})
  const [addingEvento, setAddingEvento] = useState(false)

  function updateEvento(id: string, field: keyof Evento, val: string | boolean | number | null) {
    setEventos(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e))
  }
  async function saveEvento(id: string) {
    const item = eventos.find(e => e.id === id); if (!item) return
    setEventoSave(id)
    const { error } = await supabase.from('comunidad_eventos').update({
      nombre: item.nombre, descripcion: item.descripcion || null, icono: item.icono || null,
      tiempo: item.tiempo || null, color: item.color, por_confirmar: item.por_confirmar,
      orden: item.orden, activo: item.activo, updated_at: new Date().toISOString(),
    }).eq('id', id)
    setEventoSave(null)
    setEventoMsgs(prev => ({ ...prev, [id]: error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' } }))
  }
  async function deleteEvento(id: string) {
    if (!confirm('¿Eliminar este evento?')) return
    const { error } = await supabase.from('comunidad_eventos').delete().eq('id', id)
    if (!error) setEventos(prev => prev.filter(e => e.id !== id))
    else setEventoMsgs(prev => ({ ...prev, [id]: { type: 'err', text: 'Error al eliminar.' } }))
  }
  async function addEvento() {
    setAddingEvento(true)
    const { data, error } = await supabase.from('comunidad_eventos')
      .insert({ nombre: 'Nuevo evento', descripcion: null, icono: 'calendario', tiempo: null, color: 'selva', por_confirmar: false, orden: eventos.length + 1, activo: false })
      .select('id, nombre, descripcion, icono, tiempo, color, por_confirmar, orden, activo').single()
    setAddingEvento(false)
    if (!error && data) setEventos(prev => [...prev, data as Evento])
  }
  async function moveEvento(id: string, dir: 'up' | 'down') {
    const sorted = [...eventos].sort((a, b) => a.orden - b.orden)
    const idx = sorted.findIndex(e => e.id === id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const reordered = [...sorted]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
    const updated = reordered.map((e, i) => ({ ...e, orden: i + 1 }))
    setEventos(updated)
    await Promise.all(updated.map(e =>
      supabase.from('comunidad_eventos').update({ orden: e.orden, updated_at: new Date().toISOString() }).eq('id', e.id)
    ))
  }

  /* ── CÓMO CUIDAMOS ───────────────────────────────────────────── */
  const [cuidamos,    setCuidamos]    = useState<Cuidamos[]>(cuidamosInit)
  const [cuidaSave,   setCuidaSave]   = useState<string | null>(null)
  const [cuidaMsgs,   setCuidaMsgs]   = useState<Record<string, Msg>>({})
  const [addingCuida, setAddingCuida] = useState(false)

  function updateCuida(id: string, field: keyof Cuidamos, val: string | boolean | number | null) {
    setCuidamos(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c))
  }
  async function saveCuida(id: string) {
    const item = cuidamos.find(c => c.id === id); if (!item) return
    setCuidaSave(id)
    const { error } = await supabase.from('comunidad_cuidamos').update({
      titulo: item.titulo, descripcion: item.descripcion || null, icono: item.icono || null,
      orden: item.orden, activo: item.activo, updated_at: new Date().toISOString(),
    }).eq('id', id)
    setCuidaSave(null)
    setCuidaMsgs(prev => ({ ...prev, [id]: error ? { type: 'err', text: 'Error al guardar.' } : { type: 'ok', text: 'Guardado.' } }))
  }
  async function deleteCuida(id: string) {
    if (!confirm('¿Eliminar este ítem?')) return
    const { error } = await supabase.from('comunidad_cuidamos').delete().eq('id', id)
    if (!error) setCuidamos(prev => prev.filter(c => c.id !== id))
    else setCuidaMsgs(prev => ({ ...prev, [id]: { type: 'err', text: 'Error al eliminar.' } }))
  }
  async function addCuida() {
    setAddingCuida(true)
    const { data, error } = await supabase.from('comunidad_cuidamos')
      .insert({ titulo: 'Nuevo ítem', descripcion: null, icono: 'casa', orden: cuidamos.length + 1, activo: false })
      .select('id, titulo, descripcion, icono, orden, activo').single()
    setAddingCuida(false)
    if (!error && data) setCuidamos(prev => [...prev, data as Cuidamos])
  }
  async function moveCuida(id: string, dir: 'up' | 'down') {
    const sorted = [...cuidamos].sort((a, b) => a.orden - b.orden)
    const idx = sorted.findIndex(c => c.id === id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const reordered = [...sorted]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
    const updated = reordered.map((c, i) => ({ ...c, orden: i + 1 }))
    setCuidamos(updated)
    await Promise.all(updated.map(c =>
      supabase.from('comunidad_cuidamos').update({ orden: c.orden, updated_at: new Date().toISOString() }).eq('id', c.id)
    ))
  }

  /* ── RENDER ──────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Bloque 1: Textos de la página ── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Textos de la página</h2>
          <p className="card__subtitle">Encabezados y copys de la página pública Comunidad.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="eyebrow">Eyebrow (etiqueta pequeña — hero)</label>
              <input id="eyebrow" type="text" className="form-input"
                value={textos.comunidad_eyebrow}
                onChange={e => setTextos(p => ({ ...p, comunidad_eyebrow: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="h1">Título principal — H1 (hero)</label>
              <input id="h1" type="text" className="form-input"
                value={textos.comunidad_h1}
                onChange={e => setTextos(p => ({ ...p, comunidad_h1: e.target.value }))} />
            </div>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="sub">Subtítulo / descripción (hero)</label>
            <input id="sub" type="text" className="form-input"
              value={textos.comunidad_sub}
              onChange={e => setTextos(p => ({ ...p, comunidad_sub: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="galTitulo">Título sección galería</label>
              <input id="galTitulo" type="text" className="form-input"
                value={textos.comunidad_galeria_titulo}
                onChange={e => setTextos(p => ({ ...p, comunidad_galeria_titulo: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="testTitulo">Título sección testimonios</label>
              <input id="testTitulo" type="text" className="form-input"
                value={textos.comunidad_testimonios_titulo}
                onChange={e => setTextos(p => ({ ...p, comunidad_testimonios_titulo: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="evEyebrow">Eyebrow sección Agenda</label>
              <input id="evEyebrow" type="text" className="form-input"
                value={textos.comunidad_eventos_eyebrow}
                onChange={e => setTextos(p => ({ ...p, comunidad_eventos_eyebrow: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="evTitulo">Título sección Agenda</label>
              <input id="evTitulo" type="text" className="form-input"
                value={textos.comunidad_eventos_titulo}
                onChange={e => setTextos(p => ({ ...p, comunidad_eventos_titulo: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="cuidaEyebrow">Eyebrow sección Cómo cuidamos</label>
              <input id="cuidaEyebrow" type="text" className="form-input"
                value={textos.comunidad_cuida_eyebrow}
                onChange={e => setTextos(p => ({ ...p, comunidad_cuida_eyebrow: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="cuidaTitulo">Título sección Cómo cuidamos</label>
              <input id="cuidaTitulo" type="text" className="form-input"
                value={textos.comunidad_cuida_titulo}
                onChange={e => setTextos(p => ({ ...p, comunidad_cuida_titulo: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="ctaTitulo">CTA — título</label>
              <input id="ctaTitulo" type="text" className="form-input"
                value={textos.comunidad_cta_titulo}
                onChange={e => setTextos(p => ({ ...p, comunidad_cta_titulo: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="ctaTexto">CTA — texto de apoyo</label>
              <input id="ctaTexto" type="text" className="form-input"
                value={textos.comunidad_cta_texto}
                onChange={e => setTextos(p => ({ ...p, comunidad_cta_texto: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <button className="btn btn--primary btn--sm" onClick={saveTextos} disabled={textosSave}>
              {textosSave ? 'Guardando…' : 'Guardar textos'}
            </button>
            {textosMsg && <span style={{ fontSize: '.8rem', color: textosMsg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>{textosMsg.text}</span>}
          </div>
        </div>
      </div>

      {/* ── Bloque 2: Narvarte afuera ── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Narvarte afuera</h2>
          <p className="card__subtitle">
            Sección &ldquo;La comunidad no termina en la puerta&rdquo;. Si no pones URL de foto, se muestra un gradiente de color.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="connEyebrow">Eyebrow</label>
              <input id="connEyebrow" type="text" className="form-input"
                value={textos.comunidad_conn_eyebrow}
                onChange={e => setTextos(p => ({ ...p, comunidad_conn_eyebrow: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="connTitulo">Título</label>
              <input id="connTitulo" type="text" className="form-input"
                value={textos.comunidad_conn_titulo}
                onChange={e => setTextos(p => ({ ...p, comunidad_conn_titulo: e.target.value }))} />
            </div>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="connTexto">Párrafo descriptivo</label>
            <input id="connTexto" type="text" className="form-input"
              value={textos.comunidad_conn_texto}
              onChange={e => setTextos(p => ({ ...p, comunidad_conn_texto: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="connLinkText">Texto del enlace</label>
              <input id="connLinkText" type="text" className="form-input"
                value={textos.comunidad_conn_link_text}
                onChange={e => setTextos(p => ({ ...p, comunidad_conn_link_text: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="connLinkUrl">URL del enlace</label>
              <input id="connLinkUrl" type="text" className="form-input"
                placeholder="/pages/amenidades.html"
                value={textos.comunidad_conn_link_url}
                onChange={e => setTextos(p => ({ ...p, comunidad_conn_link_url: e.target.value }))} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <p className="form-label" style={{ marginBottom: '.5rem', fontWeight: 600 }}>Fotos</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { urlKey: 'comunidad_conn_foto1_url' as const, altKey: 'comunidad_conn_foto1_alt' as const, label: 'Foto 1', idUrl: 'connFoto1Url', idAlt: 'connFoto1Alt' },
                { urlKey: 'comunidad_conn_foto2_url' as const, altKey: 'comunidad_conn_foto2_alt' as const, label: 'Foto 2', idUrl: 'connFoto2Url', idAlt: 'connFoto2Alt' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={f.idUrl}>{f.label} — URL</label>
                    <input id={f.idUrl} type="url" className="form-input"
                      placeholder="https://… (vacío → gradiente)"
                      value={textos[f.urlKey]}
                      onChange={e => setTextos(p => ({ ...p, [f.urlKey]: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={f.idAlt}>{f.label} — Alt text</label>
                    <input id={f.idAlt} type="text" className="form-input"
                      value={textos[f.altKey]}
                      onChange={e => setTextos(p => ({ ...p, [f.altKey]: e.target.value }))} />
                  </div>
                  {textos[f.urlKey] && (
                    <div style={{ borderRadius: 8, overflow: 'hidden', height: 100 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={textos[f.urlKey]} alt={textos[f.altKey]}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <button className="btn btn--primary btn--sm" onClick={saveConn} disabled={connSave}>
              {connSave ? 'Guardando…' : 'Guardar Narvarte afuera'}
            </button>
            {connMsg && <span style={{ fontSize: '.8rem', color: connMsg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>{connMsg.text}</span>}
          </div>
        </div>
      </div>

      {/* ── Bloque 3: Pilares del manifiesto ── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Pilares del manifiesto</h2>
          <p className="card__subtitle">
            Los valores que aparecen bajo el texto del manifiesto. Usa las flechas ↑↓ para reordenar.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[...pilares].sort((a, b) => a.orden - b.orden).map((item, idx, arr) => {
            const msg = pilarMsgs[item.id]; const isSaving = pilarSave === item.id
            return (
              <div key={item.id} style={{ padding: '1rem', borderRadius: 12, border: '1px solid var(--border)', background: item.activo ? 'var(--surface-2, #f5f5f0)' : 'rgba(0,0,0,.035)', opacity: item.activo ? 1 : 0.65, display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <MoveButtons onUp={() => movePilar(item.id, 'up')} onDown={() => movePilar(item.id, 'down')} disableUp={idx === 0} disableDown={idx === arr.length - 1} />
                  <span style={{ fontWeight: 600, fontSize: '.9rem', flex: 1 }}>{item.nombre || 'Sin nombre'}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <input type="checkbox" checked={item.activo} onChange={e => updatePilar(item.id, 'activo', e.target.checked)} />
                    <span className="form-label" style={{ margin: 0 }}>Visible</span>
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`pnombre-${item.id}`}>Nombre</label>
                    <input id={`pnombre-${item.id}`} type="text" className="form-input" value={item.nombre} onChange={e => updatePilar(item.id, 'nombre', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`pdesc-${item.id}`}>Descripción</label>
                    <input id={`pdesc-${item.id}`} type="text" className="form-input" value={item.descripcion ?? ''} onChange={e => updatePilar(item.id, 'descripcion', e.target.value || null)} />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Icono</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                    <IconPreview name={item.icono} size={20} />
                    <span style={{ fontSize: '.8rem', color: 'var(--gray-600)' }}>{item.icono ? (ICONO_LABELS[item.icono] || item.icono) : 'Sin icono'}</span>
                  </div>
                  <IconSelector value={item.icono} onChange={v => updatePilar(item.id, 'icono', v)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <button className="btn btn--primary btn--sm" onClick={() => savePilar(item.id)} disabled={isSaving}>{isSaving ? 'Guardando…' : 'Guardar'}</button>
                  <button className="btn btn--sm" onClick={() => deletePilar(item.id)} style={{ color: 'var(--color-error, #c0392b)', background: 'transparent', border: '1px solid currentColor' }}>Eliminar</button>
                  {msg && <span style={{ fontSize: '.8rem', color: msg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>{msg.text}</span>}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button className="btn btn--secondary btn--sm" onClick={addPilar} disabled={addingPilar}>
            {addingPilar ? 'Añadiendo…' : '+ Añadir pilar'}
          </button>
        </div>
      </div>

      {/* ── Bloque 4: Agenda / Eventos ── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Agenda de la casa</h2>
          <p className="card__subtitle">Eventos y actividades recurrentes de la comunidad. Usa las flechas ↑↓ para reordenar.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[...eventos].sort((a, b) => a.orden - b.orden).map((item, idx, arr) => {
            const msg = eventoMsgs[item.id]; const isSaving = eventoSave === item.id
            return (
              <div key={item.id} style={{ padding: '1rem', borderRadius: 12, border: '1px solid var(--border)', background: item.activo ? 'var(--surface-2, #f5f5f0)' : 'rgba(0,0,0,.035)', opacity: item.activo ? 1 : 0.65, display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <MoveButtons onUp={() => moveEvento(item.id, 'up')} onDown={() => moveEvento(item.id, 'down')} disableUp={idx === 0} disableDown={idx === arr.length - 1} />
                  <span style={{ fontWeight: 600, fontSize: '.9rem', flex: 1 }}>{item.nombre || 'Sin nombre'}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <input type="checkbox" checked={item.activo} onChange={e => updateEvento(item.id, 'activo', e.target.checked)} />
                    <span className="form-label" style={{ margin: 0 }}>Visible</span>
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`enombre-${item.id}`}>Nombre del evento</label>
                    <input id={`enombre-${item.id}`} type="text" className="form-input" value={item.nombre} onChange={e => updateEvento(item.id, 'nombre', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`etiempo-${item.id}`}>Horario <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(ej. &quot;Jueves · 19:00 h&quot;)</span></label>
                    <input id={`etiempo-${item.id}`} type="text" className="form-input" placeholder="Jueves · 19:00 h" value={item.tiempo ?? ''} onChange={e => updateEvento(item.id, 'tiempo', e.target.value || null)} />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`edesc-${item.id}`}>Descripción</label>
                  <input id={`edesc-${item.id}`} type="text" className="form-input" value={item.descripcion ?? ''} onChange={e => updateEvento(item.id, 'descripcion', e.target.value || null)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Color del icono</label>
                  <div style={{ display: 'flex', gap: '.5rem', marginTop: '.35rem' }}>
                    {(['selva', 'barro'] as const).map(c => (
                      <button key={c} type="button" onClick={() => updateEvento(item.id, 'color', c)}
                        style={{ padding: '4px 14px', borderRadius: 20, fontSize: '.8rem', cursor: 'pointer', border: item.color === c ? '2px solid var(--selva, #1E4D3C)' : '1px solid var(--border)', background: item.color === c ? (c === 'selva' ? 'rgba(30,77,60,.15)' : 'rgba(94,50,22,.15)') : 'var(--surface-2)', color: c === 'selva' ? '#1E4D3C' : '#BC6B43', fontWeight: item.color === c ? 700 : 400 }}>
                        {c === 'selva' ? 'Verde selva' : 'Barro'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Icono</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                    <IconPreview name={item.icono} size={20} />
                    <span style={{ fontSize: '.8rem', color: 'var(--gray-600)' }}>{item.icono ? (ICONO_LABELS[item.icono] || item.icono) : 'Sin icono'}</span>
                  </div>
                  <IconSelector value={item.icono} onChange={v => updateEvento(item.id, 'icono', v)} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={item.por_confirmar} onChange={e => updateEvento(item.id, 'por_confirmar', e.target.checked)} />
                  <span className="form-label" style={{ margin: 0 }}>Mostrar badge &quot;Por confirmar&quot;</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <button className="btn btn--primary btn--sm" onClick={() => saveEvento(item.id)} disabled={isSaving}>{isSaving ? 'Guardando…' : 'Guardar'}</button>
                  <button className="btn btn--sm" onClick={() => deleteEvento(item.id)} style={{ color: 'var(--color-error, #c0392b)', background: 'transparent', border: '1px solid currentColor' }}>Eliminar</button>
                  {msg && <span style={{ fontSize: '.8rem', color: msg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>{msg.text}</span>}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button className="btn btn--secondary btn--sm" onClick={addEvento} disabled={addingEvento}>
            {addingEvento ? 'Añadiendo…' : '+ Añadir evento'}
          </button>
        </div>
      </div>

      {/* ── Bloque 5: Cómo cuidamos la convivencia ── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Cómo cuidamos la convivencia</h2>
          <p className="card__subtitle">Ítems que explican qué hace Rentalia para garantizar una buena convivencia. Usa las flechas ↑↓ para reordenar.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[...cuidamos].sort((a, b) => a.orden - b.orden).map((item, idx, arr) => {
            const msg = cuidaMsgs[item.id]; const isSaving = cuidaSave === item.id
            return (
              <div key={item.id} style={{ padding: '1rem', borderRadius: 12, border: '1px solid var(--border)', background: item.activo ? 'var(--surface-2, #f5f5f0)' : 'rgba(0,0,0,.035)', opacity: item.activo ? 1 : 0.65, display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <MoveButtons onUp={() => moveCuida(item.id, 'up')} onDown={() => moveCuida(item.id, 'down')} disableUp={idx === 0} disableDown={idx === arr.length - 1} />
                  <span style={{ fontWeight: 600, fontSize: '.9rem', flex: 1 }}>{item.titulo || 'Sin título'}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <input type="checkbox" checked={item.activo} onChange={e => updateCuida(item.id, 'activo', e.target.checked)} />
                    <span className="form-label" style={{ margin: 0 }}>Visible</span>
                  </label>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`ctitulo-${item.id}`}>Título</label>
                  <input id={`ctitulo-${item.id}`} type="text" className="form-input" value={item.titulo} onChange={e => updateCuida(item.id, 'titulo', e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`cdesc-${item.id}`}>Descripción</label>
                  <textarea id={`cdesc-${item.id}`} className="form-input" rows={2} value={item.descripcion ?? ''} onChange={e => updateCuida(item.id, 'descripcion', e.target.value || null)} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Icono</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                    <IconPreview name={item.icono} size={20} />
                    <span style={{ fontSize: '.8rem', color: 'var(--gray-600)' }}>{item.icono ? (ICONO_LABELS[item.icono] || item.icono) : 'Sin icono'}</span>
                  </div>
                  <IconSelector value={item.icono} onChange={v => updateCuida(item.id, 'icono', v)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <button className="btn btn--primary btn--sm" onClick={() => saveCuida(item.id)} disabled={isSaving}>{isSaving ? 'Guardando…' : 'Guardar'}</button>
                  <button className="btn btn--sm" onClick={() => deleteCuida(item.id)} style={{ color: 'var(--color-error, #c0392b)', background: 'transparent', border: '1px solid currentColor' }}>Eliminar</button>
                  {msg && <span style={{ fontSize: '.8rem', color: msg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>{msg.text}</span>}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button className="btn btn--secondary btn--sm" onClick={addCuida} disabled={addingCuida}>
            {addingCuida ? 'Añadiendo…' : '+ Añadir ítem'}
          </button>
        </div>
      </div>

      {/* ── Bloque 6: Galería de fotos ── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Galería de fotos</h2>
          <p className="card__subtitle">
            Pega la URL de cada imagen. El campo <strong>Orden</strong> (1–5) determina la secuencia.
            La posición <strong>1</strong> y la <strong>4</strong> se muestran como fotos <strong>verticales</strong>; el resto cuadradas.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {(() => {
            const sorted = [...galeria].sort((a, b) => a.orden - b.orden)
            return sorted.map((item, posIdx) => {
              const msg = galMsgs[item.id]; const isSaving = galSave === item.id
              const posNum = posIdx + 1
              const isTall = posIdx === 0 || posIdx === 3
              return (
                <div key={item.id} style={{ padding: '1rem', borderRadius: 12, border: '1px solid var(--border)', background: item.activo ? 'var(--surface-2, #f5f5f0)' : 'rgba(0,0,0,.035)', opacity: item.activo ? 1 : 0.65, display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                  <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '.9rem', flex: 1 }}>{item.caption || item.alt_text || 'Sin título'}</span>
                    <span style={{ fontSize: '.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: isTall ? 'rgba(30,77,60,.12)' : 'rgba(0,0,0,.07)', color: isTall ? 'var(--selva, #1E4D3C)' : 'var(--gray-600)' }}>
                      Pos {posNum} {isTall ? '· Vertical' : '· Cuadrada'}
                    </span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <input type="checkbox" checked={item.activo} onChange={e => updateGal(item.id, 'activo', e.target.checked)} />
                      <span className="form-label" style={{ margin: 0 }}>Visible</span>
                    </label>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`gurl-${item.id}`}>URL de la imagen</label>
                    <input id={`gurl-${item.id}`} type="url" className="form-input" placeholder="https://…/foto.jpg" value={item.imagen_url} onChange={e => updateGal(item.id, 'imagen_url', e.target.value)} />
                  </div>
                  {item.imagen_url && (
                    <div style={{ borderRadius: 8, overflow: 'hidden', height: 120 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imagen_url} alt={item.alt_text ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" htmlFor={`gcap-${item.id}`}>Caption</label>
                      <input id={`gcap-${item.id}`} type="text" className="form-input" placeholder="La terraza" value={item.caption ?? ''} onChange={e => updateGal(item.id, 'caption', e.target.value || null)} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" htmlFor={`galt-${item.id}`}>Alt text</label>
                      <input id={`galt-${item.id}`} type="text" className="form-input" placeholder="Descripción accesible" value={item.alt_text ?? ''} onChange={e => updateGal(item.id, 'alt_text', e.target.value || null)} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" htmlFor={`gord-${item.id}`}>Orden</label>
                      <input id={`gord-${item.id}`} type="number" className="form-input" min={1} max={5} value={item.orden} onChange={e => updateGal(item.id, 'orden', Math.min(5, Math.max(1, Number(e.target.value))))} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <button className="btn btn--primary btn--sm" onClick={() => saveGal(item.id)} disabled={isSaving}>{isSaving ? 'Guardando…' : 'Guardar'}</button>
                    <button className="btn btn--sm" onClick={() => deleteGal(item.id)} style={{ color: 'var(--color-error, #c0392b)', background: 'transparent', border: '1px solid currentColor' }}>Eliminar</button>
                    {msg && <span style={{ fontSize: '.8rem', color: msg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>{msg.text}</span>}
                  </div>
                </div>
              )
            })
          })()}
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <button className="btn btn--secondary btn--sm" onClick={addGal} disabled={addingGal || galeria.length >= 5}>
            {addingGal ? 'Añadiendo…' : '+ Añadir foto'}
          </button>
          <span style={{ fontSize: '.8rem', color: 'var(--gray-500)' }}>
            {galeria.length}/5 fotos{galeria.length >= 5 && ' — máximo alcanzado'}
          </span>
        </div>
      </div>

      {/* ── Bloque 7: Testimonios ── */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Testimonios</h2>
          <p className="card__subtitle">Citas de residentes reales. Actívalos solo cuando tengas el texto definitivo.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {testimonios.map(item => {
            const msg = testMsgs[item.id]; const isSaving = testSave === item.id
            return (
              <div key={item.id} style={{ padding: '1rem', borderRadius: 12, border: '1px solid var(--border)', background: item.activo ? 'var(--surface-2, #f5f5f0)' : 'rgba(0,0,0,.035)', opacity: item.activo ? 1 : 0.65, display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--selva, #1E4D3C)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                    {item.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.foto_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                    ) : item.nombre?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '.9rem', flex: 1 }}>{item.nombre || 'Sin nombre'}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <input type="checkbox" checked={item.activo} onChange={e => updateTest(item.id, 'activo', e.target.checked)} />
                    <span className="form-label" style={{ margin: 0 }}>Visible</span>
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`tnombre-${item.id}`}>Nombre</label>
                    <input id={`tnombre-${item.id}`} type="text" className="form-input" placeholder="María, 27" value={item.nombre} onChange={e => updateTest(item.id, 'nombre', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`tdetalle-${item.id}`}>Detalle <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(rol/tiempo)</span></label>
                    <input id={`tdetalle-${item.id}`} type="text" className="form-input" placeholder="Diseñadora · 8 meses aquí" value={item.detalle ?? ''} onChange={e => updateTest(item.id, 'detalle', e.target.value || null)} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`tfoto-${item.id}`}>URL foto de perfil <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(opcional)</span></label>
                    <input id={`tfoto-${item.id}`} type="url" className="form-input" placeholder="https://…/foto.jpg" value={item.foto_url ?? ''} onChange={e => updateTest(item.id, 'foto_url', e.target.value || null)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`torden-${item.id}`}>Orden</label>
                    <input id={`torden-${item.id}`} type="number" className="form-input" value={item.orden} onChange={e => updateTest(item.id, 'orden', Number(e.target.value))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`trating-${item.id}`}>Rating <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(1-5)</span></label>
                    <input id={`trating-${item.id}`} type="number" className="form-input" min={1} max={5} placeholder="—" value={item.rating ?? ''} onChange={e => updateTest(item.id, 'rating', e.target.value ? Number(e.target.value) : null)} />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`ttexto-${item.id}`}>Testimonio / cita</label>
                  <textarea id={`ttexto-${item.id}`} className="form-input" rows={3} placeholder="Vivir aquí cambió cómo entiendo el hogar…" value={item.texto} onChange={e => updateTest(item.id, 'texto', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <button className="btn btn--primary btn--sm" onClick={() => saveTest(item.id)} disabled={isSaving}>{isSaving ? 'Guardando…' : 'Guardar'}</button>
                  <button className="btn btn--sm" onClick={() => deleteTest(item.id)} style={{ color: 'var(--color-error, #c0392b)', background: 'transparent', border: '1px solid currentColor' }}>Eliminar</button>
                  {msg && <span style={{ fontSize: '.8rem', color: msg.type === 'ok' ? 'var(--color-success, #1a8a4a)' : 'var(--color-error, #c0392b)' }}>{msg.text}</span>}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button className="btn btn--secondary btn--sm" onClick={addTest} disabled={addingTest}>
            {addingTest ? 'Añadiendo…' : '+ Añadir testimonio'}
          </button>
        </div>
      </div>

    </div>
  )
}
