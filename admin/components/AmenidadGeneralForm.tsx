'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Ubicacion {
  id: string
  nombre: string
}

interface AmenidadGeneralFormProps {
  mode: 'create' | 'edit'
  ubicaciones?: Ubicacion[]
  initialData?: {
    id: string
    slug: string
    label: string
    description: string | null
    icon: string
    category: string
    active: boolean
    orden: number
    ubicacion_id: string | null
  }
}

const CATEGORIES = [
  { value: 'interior',  label: 'Interior' },
  { value: 'exterior',  label: 'Exterior' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'comunidad', label: 'Comunidad' },
]

const ICON_SUGGESTIONS = [
  'wifi', 'cooking', 'weekend', 'deck', 'yard', 'local_laundry_service',
  'directions_car', 'security', 'pets', 'celebration', 'verified_user',
  'chair', 'fitness_center', 'elevator', 'balcony', 'pool',
  'outdoor_grill', 'meeting_room', 'work', 'bolt',
]

export default function AmenidadGeneralForm({ mode, initialData, ubicaciones = [] }: AmenidadGeneralFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    slug:         initialData?.slug         ?? '',
    label:        initialData?.label        ?? '',
    description:  initialData?.description  ?? '',
    icon:         initialData?.icon         ?? 'home',
    category:     initialData?.category     ?? 'interior',
    active:       initialData?.active       ?? true,
    orden:        initialData?.orden        ?? 0,
    ubicacion_id: initialData?.ubicacion_id ?? '',
  })

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function autoSlug(label: string) {
    return label
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 40)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const supabase = createClient()
    const payload = {
      slug:         form.slug || autoSlug(form.label),
      label:        form.label,
      description:  form.description || null,
      icon:         form.icon,
      category:     form.category,
      active:       form.active,
      orden:        Number(form.orden),
      ubicacion_id: form.ubicacion_id || null,
    }

    let err
    if (mode === 'create') {
      const res = await supabase.from('location_amenities').insert(payload)
      err = res.error
    } else {
      const res = await supabase
        .from('location_amenities')
        .update(payload)
        .eq('id', initialData!.id)
      err = res.error
    }

    setSaving(false)
    if (err) { setError(err.message); return }
    router.push('/dashboard/amenidades-generales')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert--error">{error}</div>
      )}

      {/* ── Información básica ── */}
      <p className="form-section-title">Información básica</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">
            Nombre <span>*</span>
          </label>
          <input
            className="form-input"
            type="text"
            required
            placeholder="Ej. Terraza con vista"
            value={form.label}
            onChange={e => {
              set('label', e.target.value)
              if (!initialData) set('slug', autoSlug(e.target.value))
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Slug{' '}
            <span style={{ color: 'var(--gray-500)', fontWeight: 400, fontSize: '.8rem' }}>
              (identificador único)
            </span>
          </label>
          <input
            className="form-input"
            type="text"
            placeholder="terraza_vista"
            value={form.slug}
            onChange={e => set('slug', e.target.value)}
          />
          <p className="form-hint">Solo letras minúsculas, números y guiones bajos.</p>
        </div>

        <div className="form-group">
          <label className="form-label">Descripción corta</label>
          <input
            className="form-input"
            type="text"
            placeholder="Ej. Azotea con vista y área de convivencia"
            maxLength={120}
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>
      </div>

      {/* ── Ícono ── */}
      <p className="form-section-title">Ícono</p>

      <div className="form-group">
        <label className="form-label">Nombre del ícono (Material Symbols)</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            className="form-input"
            type="text"
            placeholder="Ej. wifi, cooking, deck"
            value={form.icon}
            onChange={e => set('icon', e.target.value)}
            style={{ flex: 1 }}
          />
          <div style={{
            width: 48, height: 48, flexShrink: 0,
            background: 'var(--selva)', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--hueso)' }}>
              {form.icon || 'help'}
            </span>
          </div>
        </div>
        <p className="form-hint" style={{ marginTop: 10, marginBottom: 8 }}>
          Haz clic para seleccionar:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ICON_SUGGESTIONS.map(s => (
            <button
              key={s}
              type="button"
              title={s}
              onClick={() => set('icon', s)}
              style={{
                width: 40, height: 40,
                border: form.icon === s
                  ? '2px solid var(--selva)'
                  : '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                background: form.icon === s
                  ? 'rgba(30, 77, 60, 0.08)'
                  : 'var(--white)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 20,
                  color: form.icon === s ? 'var(--selva)' : 'var(--gray-700)',
                }}
              >
                {s}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Ubicación ── */}
      <p className="form-section-title">Ubicación</p>

      <div className="form-group">
        <label className="form-label">Asociar a una ubicación</label>
        <select
          className="form-select"
          value={form.ubicacion_id}
          onChange={e => set('ubicacion_id', e.target.value)}
        >
          <option value="">— Global (aplica a todas las ubicaciones) —</option>
          {ubicaciones.map(u => (
            <option key={u.id} value={u.id}>{u.nombre}</option>
          ))}
        </select>
        <p className="form-hint">
          Si seleccionas una ubicación, esta amenidad solo aparecerá en los cuartos de esa propiedad.
          Dejarlo en "Global" la aplica a todas.
        </p>
      </div>

      {/* ── Configuración ── */}
      <p className="form-section-title">Configuración</p>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Categoría</label>
          <select
            className="form-select"
            value={form.category}
            onChange={e => set('category', e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Orden</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={form.orden}
            onChange={e => set('orden', e.target.value)}
          />
        </div>
      </div>

      {/* Toggle visible */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          role="switch"
          aria-checked={form.active}
          onClick={() => set('active', !form.active)}
          style={{
            width: 44, height: 24, borderRadius: 12, flexShrink: 0,
            background: form.active ? 'var(--selva)' : 'var(--gray-300)',
            border: 'none', cursor: 'pointer', position: 'relative',
            transition: 'background 0.2s',
          }}
        >
          <span style={{
            position: 'absolute', top: 3,
            left: form.active ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--white)',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
        <div>
          <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--tinta)' }}>
            Visible en el sitio
          </div>
          <div className="form-hint">
            {form.active ? 'Se mostrará en la home pública.' : 'No se mostrará en la home pública.'}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div style={{
        display: 'flex', gap: '1rem', marginTop: '2rem',
        paddingTop: '1.5rem', borderTop: '1px solid var(--gray-200)',
      }}>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Guardando…' : mode === 'create' ? 'Crear amenidad' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => router.push('/dashboard/amenidades-generales')}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
