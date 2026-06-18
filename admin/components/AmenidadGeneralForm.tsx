'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface AmenidadGeneralFormProps {
  mode: 'create' | 'edit'
  initialData?: {
    id: string
    slug: string
    label: string
    description: string | null
    icon: string
    category: string
    active: boolean
    orden: number
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

export default function AmenidadGeneralForm({ mode, initialData }: AmenidadGeneralFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    slug:        initialData?.slug        ?? '',
    label:       initialData?.label       ?? '',
    description: initialData?.description ?? '',
    icon:        initialData?.icon        ?? 'home',
    category:    initialData?.category    ?? 'interior',
    active:      initialData?.active      ?? true,
    orden:       initialData?.orden       ?? 0,
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
      slug:        form.slug || autoSlug(form.label),
      label:       form.label,
      description: form.description || null,
      icon:        form.icon,
      category:    form.category,
      active:      form.active,
      orden:       Number(form.orden),
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
    if (err) { setError(err.message); return; }
    router.push('/dashboard/amenidades-generales')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert--error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Label */}
      <div className="form-field">
        <label className="form-field__label">Nombre *</label>
        <input
          className="form-field__input"
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

      {/* Slug */}
      <div className="form-field">
        <label className="form-field__label">Slug (identificador único)</label>
        <input
          className="form-field__input"
          type="text"
          placeholder="terraza_vista"
          value={form.slug}
          onChange={e => set('slug', e.target.value)}
        />
        <p className="form-field__hint">Solo letras minúsculas, números y guiones bajos.</p>
      </div>

      {/* Description */}
      <div className="form-field">
        <label className="form-field__label">Descripción corta</label>
        <input
          className="form-field__input"
          type="text"
          placeholder="Ej. Azotea con vista y área de convivencia"
          maxLength={120}
          value={form.description}
          onChange={e => set('description', e.target.value)}
        />
      </div>

      {/* Icon + preview */}
      <div className="form-field">
        <label className="form-field__label">Ícono (Material Symbols)</label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            className="form-field__input"
            type="text"
            placeholder="Ej. wifi, cooking, deck"
            value={form.icon}
            onChange={e => set('icon', e.target.value)}
            style={{ flex: 1 }}
          />
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 32, color: 'var(--selva, #1E4D3C)', flexShrink: 0 }}
          >
            {form.icon || 'help'}
          </span>
        </div>
        <p className="form-field__hint">Sugerencias:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginTop: '.4rem' }}>
          {ICON_SUGGESTIONS.map(s => (
            <button
              key={s}
              type="button"
              title={s}
              onClick={() => set('icon', s)}
              style={{
                border: form.icon === s ? '2px solid var(--selva, #1E4D3C)' : '1px solid #e0e0e0',
                borderRadius: 8, background: '#fafafa', padding: '.3rem .5rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '.75rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{s}</span>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Category + orden */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-field">
          <label className="form-field__label">Categoría</label>
          <select
            className="form-field__input"
            value={form.category}
            onChange={e => set('category', e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="form-field__label">Orden</label>
          <input
            className="form-field__input"
            type="number"
            min={0}
            value={form.orden}
            onChange={e => set('orden', e.target.value)}
          />
        </div>
      </div>

      {/* Active */}
      <div className="form-field" style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        <input
          id="active-check"
          type="checkbox"
          checked={form.active}
          onChange={e => set('active', e.target.checked)}
          style={{ width: 18, height: 18, cursor: 'pointer' }}
        />
        <label htmlFor="active-check" style={{ cursor: 'pointer', fontWeight: 500 }}>
          Visible en el sitio
        </label>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
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
