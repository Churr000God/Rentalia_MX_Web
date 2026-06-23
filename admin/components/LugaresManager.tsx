'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export interface LugarItem {
  id: string
  categoria: 'transporte' | 'universidades' | 'parques' | 'comer' | 'compras' | 'cultura'
  nombre: string
  distancia: string
  descripcion: string
  lat: number | null
  lng: number | null
  por_confirmar: boolean
  activo: boolean
  orden: number
}

type Msg = { type: 'ok' | 'err'; text: string }

const CATEGORIAS: { key: LugarItem['categoria']; label: string }[] = [
  { key: 'transporte',    label: 'Transporte'    },
  { key: 'universidades', label: 'Universidades' },
  { key: 'parques',       label: 'Parques'       },
  { key: 'comer',         label: 'Comer y café'  },
  { key: 'compras',       label: 'Compras'       },
  { key: 'cultura',       label: 'Cultura y vida' },
]

interface Props { lugares: LugarItem[] }

const emptyNew = (): Omit<LugarItem, 'id'> => ({
  categoria:     'transporte',
  nombre:        '',
  distancia:     '',
  descripcion:   '',
  lat:           null,
  lng:           null,
  por_confirmar: false,
  activo:        true,
  orden:         0,
})

export default function LugaresManager({ lugares: initLugares }: Props) {
  const [lugares,      setLugares]      = useState<LugarItem[]>(initLugares)
  const [saving,       setSaving]       = useState<string | null>(null)
  const [msgs,         setMsgs]         = useState<Record<string, Msg>>({})
  const [filterCat,    setFilterCat]    = useState<string>('todas')
  const [newLugar,     setNewLugar]     = useState(emptyNew())
  const [addingSaving, setAddingSaving] = useState(false)
  const [addingMsg,    setAddingMsg]    = useState<Msg | null>(null)

  function updateLugar(id: string, field: keyof LugarItem, val: string | number | boolean | null) {
    setLugares(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l))
  }

  async function saveLugar(id: string) {
    const l = lugares.find(l => l.id === id)
    if (!l) return
    setSaving(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('lugares_cercanos')
      .update({
        categoria:     l.categoria,
        nombre:        l.nombre,
        distancia:     l.distancia,
        descripcion:   l.descripcion,
        lat:           l.lat,
        lng:           l.lng,
        por_confirmar: l.por_confirmar,
        activo:        l.activo,
        orden:         l.orden,
        updated_at:    new Date().toISOString(),
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

  async function deleteLugar(id: string) {
    const l = lugares.find(l => l.id === id)
    if (!l) return
    if (!confirm(`¿Eliminar "${l.nombre}"? Esta acción no se puede deshacer.`)) return
    const supabase = createClient()
    const { error } = await supabase.from('lugares_cercanos').delete().eq('id', id)
    if (!error) setLugares(prev => prev.filter(l => l.id !== id))
    else alert('Error al eliminar. Intenta de nuevo.')
  }

  async function addLugar() {
    if (!newLugar.nombre.trim() || !newLugar.distancia.trim()) {
      setAddingMsg({ type: 'err', text: 'Nombre y distancia son obligatorios.' })
      return
    }
    setAddingSaving(true)
    setAddingMsg(null)
    const supabase = createClient()
    const catLugares = lugares.filter(l => l.categoria === newLugar.categoria)
    const maxOrden = catLugares.length
      ? Math.max(...catLugares.map(l => l.orden))
      : 0
    const { data, error } = await supabase
      .from('lugares_cercanos')
      .insert({
        categoria:     newLugar.categoria,
        nombre:        newLugar.nombre,
        distancia:     newLugar.distancia,
        descripcion:   newLugar.descripcion,
        lat:           newLugar.lat,
        lng:           newLugar.lng,
        por_confirmar: newLugar.por_confirmar,
        activo:        true,
        orden:         newLugar.orden || maxOrden + 10,
      })
      .select()
      .single()
    setAddingSaving(false)
    if (data && !error) {
      setLugares(prev => [...prev, data as LugarItem])
      setNewLugar(emptyNew())
      setAddingMsg({ type: 'ok', text: 'Lugar añadido.' })
    } else {
      setAddingMsg({ type: 'err', text: 'Error al añadir.' })
    }
  }

  const visibles = filterCat === 'todas'
    ? lugares
    : lugares.filter(l => l.categoria === filterCat)

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
            {c.label} ({c.key === 'todas' ? lugares.length : lugares.filter(l => l.categoria === c.key).length})
          </button>
        ))}
      </div>

      {/* Lugares list */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Lugares existentes</h2>
          <p className="card__subtitle">
            Edita nombre, distancia, descripción, categoría, coordenadas y estado.
            Solo los activos aparecen en la página pública.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visibles.length === 0 && (
            <p style={{ fontSize: '.875rem', color: 'var(--text-3)' }}>
              No hay lugares{filterCat !== 'todas' ? ' en esta categoría' : ''}. Añade el primero abajo.
            </p>
          )}

          {visibles.map(l => {
            const msg      = msgs[l.id]
            const isSaving = saving === l.id
            return (
              <div
                key={l.id}
                style={{
                  padding: '1rem', borderRadius: 12,
                  background: l.activo ? 'var(--surface-2, #f5f5f0)' : 'rgba(0,0,0,.035)',
                  opacity: l.activo ? 1 : 0.65,
                  display: 'flex', flexDirection: 'column', gap: '.65rem',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Fila: categoría + activo + por_confirmar */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <label className="form-label" htmlFor={`lcat-${l.id}`} style={{ margin: 0, whiteSpace: 'nowrap' }}>
                      Categoría
                    </label>
                    <select
                      id={`lcat-${l.id}`}
                      className="form-input"
                      style={{ paddingBlock: '6px', minWidth: 160 }}
                      value={l.categoria}
                      onChange={e => updateLugar(l.id, 'categoria', e.target.value as LugarItem['categoria'])}
                    >
                      {CATEGORIAS.map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <input type="checkbox" checked={l.activo}
                      onChange={e => updateLugar(l.id, 'activo', e.target.checked)} />
                    <span className="form-label" style={{ margin: 0 }}>Activo</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <input type="checkbox" checked={l.por_confirmar}
                      onChange={e => updateLugar(l.id, 'por_confirmar', e.target.checked)} />
                    <span className="form-label" style={{ margin: 0 }}>Por confirmar</span>
                  </label>
                </div>

                {/* Nombre + Distancia */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`lnombre-${l.id}`}>Nombre</label>
                    <input id={`lnombre-${l.id}`} type="text" className="form-input"
                      value={l.nombre}
                      onChange={e => updateLugar(l.id, 'nombre', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`ldist-${l.id}`}>Distancia</label>
                    <input id={`ldist-${l.id}`} type="text" className="form-input"
                      placeholder="8 min a pie"
                      value={l.distancia}
                      onChange={e => updateLugar(l.id, 'distancia', e.target.value)} />
                  </div>
                </div>

                {/* Descripción */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`ldesc-${l.id}`}>Descripción</label>
                  <input id={`ldesc-${l.id}`} type="text" className="form-input"
                    value={l.descripcion}
                    onChange={e => updateLugar(l.id, 'descripcion', e.target.value)} />
                </div>

                {/* Lat / Lng / Orden */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`llat-${l.id}`}>
                      Latitud <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(para mapa)</span>
                    </label>
                    <input id={`llat-${l.id}`} type="number" step="0.0001" className="form-input"
                      placeholder="19.3978"
                      value={l.lat ?? ''}
                      onChange={e => updateLugar(l.id, 'lat', e.target.value ? parseFloat(e.target.value) : null)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`llng-${l.id}`}>Longitud</label>
                    <input id={`llng-${l.id}`} type="number" step="0.0001" className="form-input"
                      placeholder="-99.1580"
                      value={l.lng ?? ''}
                      onChange={e => updateLugar(l.id, 'lng', e.target.value ? parseFloat(e.target.value) : null)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor={`lorden-${l.id}`}>Orden</label>
                    <input id={`lorden-${l.id}`} type="number" className="form-input"
                      value={l.orden}
                      onChange={e => updateLugar(l.id, 'orden', parseInt(e.target.value, 10) || 0)} />
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginLeft: 'auto' }}>
                  <button className="btn btn--primary btn--sm" onClick={() => saveLugar(l.id)} disabled={isSaving}>
                    {isSaving ? 'Guardando…' : 'Guardar'}
                  </button>
                  <button
                    className="btn btn--sm"
                    onClick={() => deleteLugar(l.id)}
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
            )
          })}
        </div>
      </div>

      {/* Add new lugar */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">Añadir nuevo lugar</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-lcat">Categoría</label>
            <select id="new-lcat" className="form-input" style={{ paddingBlock: '8px' }}
              value={newLugar.categoria}
              onChange={e => setNewLugar(prev => ({ ...prev, categoria: e.target.value as LugarItem['categoria'] }))}>
              {CATEGORIAS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '.75rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-lnombre">Nombre</label>
              <input id="new-lnombre" type="text" className="form-input" placeholder="Metro Etiopía"
                value={newLugar.nombre}
                onChange={e => setNewLugar(prev => ({ ...prev, nombre: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-ldist">Distancia</label>
              <input id="new-ldist" type="text" className="form-input" placeholder="8 min a pie"
                value={newLugar.distancia}
                onChange={e => setNewLugar(prev => ({ ...prev, distancia: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-ldesc">Descripción</label>
            <input id="new-ldesc" type="text" className="form-input" placeholder="Breve descripción del lugar"
              value={newLugar.descripcion}
              onChange={e => setNewLugar(prev => ({ ...prev, descripcion: e.target.value }))} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '.75rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-llat">Latitud <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(opcional)</span></label>
              <input id="new-llat" type="number" step="0.0001" className="form-input" placeholder="19.3978"
                value={newLugar.lat ?? ''}
                onChange={e => setNewLugar(prev => ({ ...prev, lat: e.target.value ? parseFloat(e.target.value) : null }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-llng">Longitud</label>
              <input id="new-llng" type="number" step="0.0001" className="form-input" placeholder="-99.1580"
                value={newLugar.lng ?? ''}
                onChange={e => setNewLugar(prev => ({ ...prev, lng: e.target.value ? parseFloat(e.target.value) : null }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-lorden">Orden</label>
              <input id="new-lorden" type="number" className="form-input" placeholder="auto"
                value={newLugar.orden || ''}
                onChange={e => setNewLugar(prev => ({ ...prev, orden: parseInt(e.target.value, 10) || 0 }))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <input type="checkbox" checked={newLugar.por_confirmar}
                onChange={e => setNewLugar(prev => ({ ...prev, por_confirmar: e.target.checked }))} />
              <span className="form-label" style={{ margin: 0 }}>Marcar como &ldquo;por confirmar&rdquo;</span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button className="btn btn--primary btn--sm" onClick={addLugar} disabled={addingSaving}>
              {addingSaving ? 'Añadiendo…' : 'Añadir lugar'}
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
