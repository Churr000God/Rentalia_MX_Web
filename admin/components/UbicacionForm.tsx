'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Distancia {
  icon: string
  text: string
}

interface UbicacionFormProps {
  mode: 'create' | 'edit'
  initialData?: {
    id: string
    nombre: string
    zona: string | null
    lat: number | null
    lng: number | null
    direccion: string | null
    distancias: Distancia[]
    activo: boolean
    orden: number
  }
}

const DISTANCE_ICONS = [
  { value: 'directions_walk', label: 'Caminando' },
  { value: 'directions_bus',  label: 'Autobús' },
  { value: 'directions_car',  label: 'Auto' },
  { value: 'subway',          label: 'Metro' },
  { value: 'park',            label: 'Parque' },
  { value: 'shopping_cart',   label: 'Super' },
  { value: 'local_cafe',      label: 'Café' },
  { value: 'school',          label: 'Escuela' },
  { value: 'local_hospital',  label: 'Hospital' },
]

export default function UbicacionForm({ mode, initialData }: UbicacionFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nombre:    initialData?.nombre    ?? '',
    zona:      initialData?.zona      ?? '',
    lat:       initialData?.lat       != null ? String(initialData.lat) : '',
    lng:       initialData?.lng       != null ? String(initialData.lng) : '',
    direccion: initialData?.direccion ?? '',
    activo:    initialData?.activo    ?? true,
    orden:     initialData?.orden     ?? 0,
  })

  const [distancias, setDistancias] = useState<Distancia[]>(
    initialData?.distancias?.length
      ? initialData.distancias
      : [
          { icon: 'directions_walk', text: '' },
          { icon: 'park',            text: '' },
          { icon: 'shopping_cart',   text: '' },
        ]
  )

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function updateDistancia(index: number, field: 'icon' | 'text', value: string) {
    setDistancias(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  function addDistancia() {
    setDistancias(prev => [...prev, { icon: 'directions_walk', text: '' }])
  }

  function removeDistancia(index: number) {
    setDistancias(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setSaving(true)

    const supabase = createClient()
    const payload = {
      nombre:    form.nombre.trim(),
      zona:      form.zona.trim() || null,
      lat:       form.lat !== '' ? Number(form.lat) : null,
      lng:       form.lng !== '' ? Number(form.lng) : null,
      direccion: form.direccion.trim() || null,
      distancias: distancias.filter(d => d.text.trim()),
      activo:    form.activo,
      orden:     Number(form.orden) || 0,
    }

    let err
    if (mode === 'create') {
      const res = await supabase.from('ubicaciones').insert(payload)
      err = res.error
    } else {
      const res = await supabase
        .from('ubicaciones')
        .update(payload)
        .eq('id', initialData!.id)
      err = res.error
    }

    setSaving(false)
    if (err) { setError(err.message); return }
    router.push('/dashboard/ubicaciones')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert--error">{error}</div>}

      {/* Información básica */}
      <p className="form-section-title">Información básica</p>

      <div className="form-grid">
        <div className="form-group form-grid--full">
          <label className="form-label">Nombre <span>*</span></label>
          <input
            className="form-input"
            type="text"
            required
            placeholder="Ej. Casa Narvarte"
            value={form.nombre}
            onChange={e => set('nombre', e.target.value)}
          />
        </div>

        <div className="form-group form-grid--full">
          <label className="form-label">Zona pública</label>
          <input
            className="form-input"
            type="text"
            placeholder="Ej. Narvarte, CDMX"
            value={form.zona}
            onChange={e => set('zona', e.target.value)}
          />
          <p className="form-hint">Se muestra en la página de detalle del cuarto.</p>
        </div>

        <div className="form-group form-grid--full">
          <label className="form-label">Dirección exacta (interna)</label>
          <input
            className="form-input"
            type="text"
            placeholder="Ej. Calle Insurgentes 123, Narvarte Poniente"
            value={form.direccion}
            onChange={e => set('direccion', e.target.value)}
          />
          <p className="form-hint">Solo visible en el panel admin. NO se muestra al público.</p>
        </div>
      </div>

      {/* Coordenadas para el mapa */}
      <p className="form-section-title">Coordenadas del mapa</p>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Latitud</label>
          <input
            className="form-input"
            type="number"
            step="any"
            placeholder="Ej. 19.395"
            value={form.lat}
            onChange={e => set('lat', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Longitud</label>
          <input
            className="form-input"
            type="number"
            step="any"
            placeholder="Ej. -99.156"
            value={form.lng}
            onChange={e => set('lng', e.target.value)}
          />
        </div>
      </div>

      <div
        style={{
          background: 'var(--hueso-2, #f0ece4)',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: '.82rem',
          color: 'var(--tinta)',
          marginBottom: '1.5rem',
        }}
      >
        💡 Para obtener coordenadas exactas: abre{' '}
        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
          Google Maps
        </a>
        , haz clic derecho en la ubicación y copia el par de números (lat, lng). El mapa mostrará
        un{' '}
        <strong>círculo aproximado de ~300 m</strong> para no revelar la dirección exacta.
      </div>

      {/* Distancias */}
      <p className="form-section-title">Puntos de interés cercanos</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {distancias.map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ width: 140, flexShrink: 0 }}
              value={d.icon}
              onChange={e => updateDistancia(i, 'icon', e.target.value)}
            >
              {DISTANCE_ICONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              className="form-input"
              type="text"
              placeholder="Ej. 8 min a Metro Etiopía"
              value={d.text}
              onChange={e => updateDistancia(i, 'text', e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => removeDistancia(i)}
              title="Eliminar"
              style={{ flexShrink: 0 }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn--secondary btn--sm" onClick={addDistancia}>
        + Agregar punto de interés
      </button>

      {/* Configuración */}
      <p className="form-section-title" style={{ marginTop: '1.5rem' }}>Configuración</p>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Orden</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={form.orden}
            onChange={e => set('orden', e.target.value)}
          />
          <p className="form-hint">Menor número = aparece primero.</p>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          role="switch"
          aria-checked={form.activo}
          onClick={() => set('activo', !form.activo)}
          style={{
            width: 44, height: 24, borderRadius: 12, flexShrink: 0,
            background: form.activo ? 'var(--selva)' : 'var(--gray-300)',
            border: 'none', cursor: 'pointer', position: 'relative',
            transition: 'background 0.2s',
          }}
        >
          <span style={{
            position: 'absolute', top: 3,
            left: form.activo ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--white)',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
        <div>
          <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--tinta)' }}>
            Ubicación activa
          </div>
          <div className="form-hint">
            {form.activo ? 'Visible en el sitio.' : 'No se mostrará al público.'}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div style={{
        display: 'flex', gap: '1rem', marginTop: '2rem',
        paddingTop: '1.5rem', borderTop: '1px solid var(--gray-200)',
      }}>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Guardando…' : mode === 'create' ? 'Crear ubicación' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => router.push('/dashboard/ubicaciones')}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
