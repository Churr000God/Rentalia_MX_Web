'use client'

import { useState, KeyboardEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { AMENITIES } from '@/lib/amenities'

interface Ubicacion {
  id: string
  nombre: string
  zona: string | null
}

interface RoomFormData {
  nombre: string
  descripcion: string
  zona: string
  ubicacion_id: string
  tipo: 'privada' | 'compartida' | 'estudio' | ''
  status: 'available' | 'occupied' | 'maintenance' | ''
  precio_min: string
  precio_max: string
  imagen_principal: string
  imagenes: string[]
  amenities: string[]
  tags: string[]
  incluye: string[]
  orden: string
  piso: string
  metros_cuadrados: string
  fecha_disponibilidad: string
}

interface RoomFormProps {
  mode: 'create' | 'edit'
  ubicaciones?: Ubicacion[]
  initialData?: {
    id: string
    nombre: string
    descripcion: string | null
    zona: string | null
    ubicacion_id: string | null
    tipo: string | null
    status: string | null
    precio_min: number | null
    precio_max: number | null
    imagen_principal: string | null
    imagenes: string[] | null
    amenities: string[] | null
    tags: string[] | null
    incluye: string[] | null
    orden: number | null
    piso: number | null
    metros_cuadrados: number | null
    fecha_disponibilidad: string | null
  }
}

export default function RoomForm({ mode, initialData, ubicaciones = [] }: RoomFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<RoomFormData>({
    nombre: initialData?.nombre ?? '',
    descripcion: initialData?.descripcion ?? '',
    zona: initialData?.zona ?? '',
    ubicacion_id: initialData?.ubicacion_id ?? '',
    tipo: (initialData?.tipo as RoomFormData['tipo']) ?? '',
    status: (initialData?.status as RoomFormData['status']) ?? '',
    precio_min: initialData?.precio_min != null ? String(initialData.precio_min) : '',
    precio_max: initialData?.precio_max != null ? String(initialData.precio_max) : '',
    imagen_principal: initialData?.imagen_principal ?? '',
    imagenes: initialData?.imagenes ?? [],
    amenities: initialData?.amenities ?? [],
    tags: initialData?.tags ?? [],
    incluye: initialData?.incluye ?? [],
    orden: initialData?.orden != null ? String(initialData.orden) : '',
    piso: initialData?.piso != null ? String(initialData.piso) : '',
    metros_cuadrados: initialData?.metros_cuadrados != null ? String(initialData.metros_cuadrados) : '',
    fecha_disponibilidad: initialData?.fecha_disponibilidad ?? '',
  })
  const [tagInput, setTagInput] = useState('')
  const [incluyeInput, setIncluyeInput] = useState('')
  const [imagenInput, setImagenInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
    if (e.key === ',' || e.key === ';') {
      e.preventDefault()
      addTag()
    }
  }

  function addTag() {
    const trimmed = tagInput.trim()
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }))
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  function handleIncluyeKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault()
      addIncluye()
    }
  }

  function addIncluye() {
    const trimmed = incluyeInput.trim()
    if (trimmed && !form.incluye.includes(trimmed)) {
      setForm((prev) => ({ ...prev, incluye: [...prev.incluye, trimmed] }))
    }
    setIncluyeInput('')
  }

  function removeIncluye(item: string) {
    setForm((prev) => ({ ...prev, incluye: prev.incluye.filter((i) => i !== item) }))
  }

  function handleImagenKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addImagen() }
  }

  function addImagen() {
    const trimmed = imagenInput.trim()
    if (trimmed && !form.imagenes.includes(trimmed)) {
      setForm((prev) => ({ ...prev, imagenes: [...prev.imagenes, trimmed] }))
    }
    setImagenInput('')
  }

  function removeImagen(url: string) {
    setForm((prev) => ({ ...prev, imagenes: prev.imagenes.filter((u) => u !== url) }))
  }

  function toggleAmenity(slug: string) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(slug)
        ? prev.amenities.filter((s) => s !== slug)
        : [...prev.amenities, slug],
    }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.nombre.trim()) {
      setError('El nombre de la habitación es obligatorio.')
      return
    }

    setLoading(true)

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      zona: form.zona.trim() || null,
      ubicacion_id: form.ubicacion_id || null,
      tipo: form.tipo || null,
      status: form.status || null,
      precio_min: form.precio_min !== '' ? Number(form.precio_min) : null,
      precio_max: form.precio_max !== '' ? Number(form.precio_max) : null,
      imagen_principal: form.imagen_principal.trim() || null,
      imagenes: form.imagenes,
      amenities: form.amenities,
      tags: form.tags.length > 0 ? form.tags : null,
      incluye: form.incluye,
      orden: form.orden !== '' ? Number(form.orden) : null,
      piso: form.piso !== '' ? Number(form.piso) : null,
      metros_cuadrados: form.metros_cuadrados !== '' ? Number(form.metros_cuadrados) : null,
      fecha_disponibilidad: form.fecha_disponibilidad.trim() || null,
    }

    const supabase = createClient()

    if (mode === 'create') {
      const { error: dbError } = await supabase
        .from('habitaciones')
        .insert([payload])

      if (dbError) {
        setError(`Error al crear la habitación: ${dbError.message}`)
        setLoading(false)
        return
      }

      setSuccess('Habitación creada correctamente.')
      setTimeout(() => router.push('/dashboard/habitaciones'), 1000)
    } else {
      const { error: dbError } = await supabase
        .from('habitaciones')
        .update(payload)
        .eq('id', initialData!.id)

      if (dbError) {
        setError(`Error al actualizar la habitación: ${dbError.message}`)
        setLoading(false)
        return
      }

      setSuccess('Habitación actualizada correctamente.')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert--success" role="status">
          {success}
        </div>
      )}

      {/* Section: Información básica */}
      <div className="form-section-title">Información básica</div>

      <div className="form-grid">
        {/* Nombre */}
        <div className="form-group form-grid--full">
          <label className="form-label" htmlFor="nombre">
            Nombre <span>*</span>
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            className="form-input"
            value={form.nombre}
            onChange={handleChange}
            required
            placeholder="Ej. Habitación Jardín Norte"
          />
        </div>

        {/* Descripción */}
        <div className="form-group form-grid--full">
          <label className="form-label" htmlFor="descripcion">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            className="form-textarea"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción de la habitación, amenidades destacadas…"
            rows={4}
          />
        </div>

        {/* Ubicación */}
        <div className="form-group">
          <label className="form-label" htmlFor="ubicacion_id">
            Ubicación
          </label>
          <select
            id="ubicacion_id"
            name="ubicacion_id"
            className="form-select"
            value={form.ubicacion_id}
            onChange={handleChange}
          >
            <option value="">— Sin ubicación —</option>
            {ubicaciones.map(u => (
              <option key={u.id} value={u.id}>
                {u.nombre}{u.zona ? ` — ${u.zona}` : ''}
              </option>
            ))}
          </select>
          <span className="form-hint">
            Agrupa la habitación bajo una propiedad. Define el mapa y amenidades de la casa compartidas.
          </span>
        </div>

        {/* Zona */}
        <div className="form-group">
          <label className="form-label" htmlFor="zona">
            Zona / Colonia
          </label>
          <input
            id="zona"
            name="zona"
            type="text"
            className="form-input"
            value={form.zona}
            onChange={handleChange}
            placeholder="Ej. Condesa"
          />
        </div>

        {/* Tipo */}
        <div className="form-group">
          <label className="form-label" htmlFor="tipo">
            Tipo de habitación
          </label>
          <select
            id="tipo"
            name="tipo"
            className="form-select"
            value={form.tipo}
            onChange={handleChange}
          >
            <option value="">— Seleccionar —</option>
            <option value="privada">Privada</option>
            <option value="compartida">Compartida</option>
            <option value="estudio">Estudio</option>
          </select>
        </div>
      </div>

      {/* Section: Precio y estado */}
      <div className="form-section-title">Precio y estado</div>

      <div className="form-grid">
        {/* Precio mín */}
        <div className="form-group">
          <label className="form-label" htmlFor="precio_min">
            Precio mínimo (MXN / mes)
          </label>
          <input
            id="precio_min"
            name="precio_min"
            type="number"
            className="form-input"
            value={form.precio_min}
            onChange={handleChange}
            min={0}
            placeholder="Ej. 6500"
          />
        </div>

        {/* Precio máx */}
        <div className="form-group">
          <label className="form-label" htmlFor="precio_max">
            Precio máximo (MXN / mes)
          </label>
          <input
            id="precio_max"
            name="precio_max"
            type="number"
            className="form-input"
            value={form.precio_max}
            onChange={handleChange}
            min={0}
            placeholder="Ej. 8500"
          />
        </div>

        {/* Status */}
        <div className="form-group">
          <label className="form-label" htmlFor="status">
            Estado
          </label>
          <select
            id="status"
            name="status"
            className="form-select"
            value={form.status}
            onChange={handleChange}
          >
            <option value="">— Seleccionar —</option>
            <option value="available">Disponible</option>
            <option value="occupied">Ocupada</option>
            <option value="maintenance">En mantenimiento</option>
          </select>
        </div>

        {/* Orden */}
        <div className="form-group">
          <label className="form-label" htmlFor="orden">
            Orden (carrusel)
          </label>
          <input
            id="orden"
            name="orden"
            type="number"
            className="form-input"
            value={form.orden}
            onChange={handleChange}
            min={0}
            placeholder="Ej. 1"
          />
          <span className="form-hint">Menor número = aparece primero</span>
        </div>
      </div>

      {/* Section: Detalles del cuarto */}
      <div className="form-section-title">Detalles del cuarto</div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="piso">Piso</label>
          <input
            id="piso"
            name="piso"
            type="number"
            className="form-input"
            value={form.piso}
            onChange={handleChange}
            min={1}
            placeholder="Ej. 1"
          />
          <span className="form-hint">Número de piso dentro del inmueble.</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="metros_cuadrados">Metros cuadrados</label>
          <input
            id="metros_cuadrados"
            name="metros_cuadrados"
            type="number"
            className="form-input"
            value={form.metros_cuadrados}
            onChange={handleChange}
            min={1}
            placeholder="Ej. 16"
          />
          <span className="form-hint">Superficie aproximada en m².</span>
        </div>

        <div className="form-group form-grid--full">
          <label className="form-label" htmlFor="fecha_disponibilidad">Disponibilidad</label>
          <input
            id="fecha_disponibilidad"
            name="fecha_disponibilidad"
            type="text"
            className="form-input"
            value={form.fecha_disponibilidad}
            onChange={handleChange}
            placeholder="Ej. Disponible ahora  /  1 de agosto"
          />
          <span className="form-hint">
            Texto libre que aparece en la tarjeta. Ej: "Disponible ahora", "1 de julio".
          </span>
        </div>
      </div>

      {/* Section: Imágenes */}
      <div className="form-section-title">Imágenes</div>

      <div className="form-grid">
        {/* Imagen principal */}
        <div className="form-group form-grid--full">
          <label className="form-label" htmlFor="imagen_principal">
            URL de imagen principal
          </label>
          <input
            id="imagen_principal"
            name="imagen_principal"
            type="url"
            className="form-input"
            value={form.imagen_principal}
            onChange={handleChange}
            placeholder="https://…"
          />
          <span className="form-hint">
            Se muestra como foto destacada en la tarjeta. JPG, PNG o WebP.
          </span>
        </div>

        {/* Galería */}
        <div className="form-group form-grid--full">
          <label className="form-label" htmlFor="imagen-gallery-input">
            Galería de fotos adicionales
          </label>
          <div
            className="tag-input-container"
            onClick={() => document.getElementById('imagen-gallery-input')?.focus()}
          >
            {form.imagenes.map((url) => (
              <span key={url} className="tag-chip" title={url}>
                📷 {url.length > 40 ? '…' + url.slice(-30) : url}
                <button
                  type="button"
                  className="tag-chip__remove"
                  onClick={() => removeImagen(url)}
                  aria-label="Eliminar imagen"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="imagen-gallery-input"
              type="url"
              className="tag-text-input"
              value={imagenInput}
              onChange={(e) => setImagenInput(e.target.value)}
              onKeyDown={handleImagenKeyDown}
              onBlur={addImagen}
              placeholder={form.imagenes.length === 0 ? 'Pega una URL y presiona Enter…' : ''}
            />
          </div>
          <span className="form-hint">
            Agrega varias URLs. Aparecen como dots navegables en la tarjeta del carrusel.
          </span>
        </div>
      </div>

      {/* Section: Amenidades */}
      <div className="form-section-title">Amenidades</div>

      <div className="form-grid">
        <div className="form-group form-grid--full">

          {/* Grupo 1: con ícono en la tarjeta del catálogo */}
          <label className="form-label">
            Con ícono en la tarjeta del catálogo
          </label>
          <p className="form-hint" style={{ marginBottom: 8 }}>
            Aparecen como íconos en <strong>/alternativas</strong> (máx 4 visibles + contador).
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 20 }}>
            {AMENITIES.filter(a => a.showInCard).map((amenity) => {
              const active = form.amenities.includes(amenity.slug)
              return (
                <button
                  key={amenity.slug}
                  type="button"
                  onClick={() => toggleAmenity(amenity.slug)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: active ? '2px solid #1E4D3C' : '1px solid #c0c8c2',
                    background: active ? 'rgba(30,77,60,.1)' : 'transparent',
                    color: active ? '#143528' : '#555',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: active ? 600 : 400,
                    transition: 'all 140ms',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{amenity.icon}</span>
                  {amenity.label}
                </button>
              )
            })}
          </div>

          {/* Grupo 2: solo visibles en el detalle */}
          <label className="form-label">
            Solo visibles en Características del detalle
          </label>
          <p className="form-hint" style={{ marginBottom: 8 }}>
            No generan ícono en la tarjeta del catálogo. Aparecen en la grilla de características de la página de detalle.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {AMENITIES.filter(a => !a.showInCard).map((amenity) => {
              const active = form.amenities.includes(amenity.slug)
              return (
                <button
                  key={amenity.slug}
                  type="button"
                  onClick={() => toggleAmenity(amenity.slug)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: active ? '2px solid #1E4D3C' : '1px solid #c0c8c2',
                    background: active ? 'rgba(30,77,60,.1)' : 'transparent',
                    color: active ? '#143528' : '#555',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: active ? 600 : 400,
                    transition: 'all 140ms',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{amenity.icon}</span>
                  {amenity.label}
                </button>
              )
            })}
          </div>

        </div>
      </div>

      {/* Section: Qué incluye la renta */}
      <div className="form-section-title">Qué incluye la renta</div>

      <div className="form-grid">
        <div className="form-group form-grid--full">
          <label className="form-label" htmlFor="incluye-input">
            Ítems incluidos
          </label>
          <div
            className="tag-input-container"
            onClick={() => document.getElementById('incluye-input')?.focus()}
          >
            {form.incluye.map((item) => (
              <span key={item} className="tag-chip">
                {item}
                <button
                  type="button"
                  className="tag-chip__remove"
                  onClick={() => removeIncluye(item)}
                  aria-label={`Eliminar ${item}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="incluye-input"
              type="text"
              className="tag-text-input"
              value={incluyeInput}
              onChange={(e) => setIncluyeInput(e.target.value)}
              onKeyDown={handleIncluyeKeyDown}
              onBlur={addIncluye}
              placeholder={
                form.incluye.length === 0
                  ? 'Ej. Amueblado completo · presiona Enter para agregar…'
                  : ''
              }
            />
          </div>
          <span className="form-hint">
            Se muestra en "Qué incluye tu renta" del detalle. Ej: "Amueblado completo", "WiFi de alta velocidad".
          </span>
        </div>
      </div>

      {/* Section: Etiquetas */}
      <div className="form-section-title">Etiquetas</div>

      <div className="form-grid">
        {/* Tags */}
        <div className="form-group form-grid--full">
          <label className="form-label" htmlFor="tag-input">
            Etiquetas libres
          </label>
          <div
            className="tag-input-container"
            onClick={() => document.getElementById('tag-input')?.focus()}
          >
            {form.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
                <button
                  type="button"
                  className="tag-chip__remove"
                  onClick={() => removeTag(tag)}
                  aria-label={`Eliminar etiqueta ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="tag-input"
              type="text"
              className="tag-text-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder={form.tags.length === 0 ? 'Escribe y presiona Enter…' : ''}
            />
          </div>
          <span className="form-hint">
            Ej. "Sin aval", "Estancia flexible", "Limpieza semanal". Presiona Enter o coma para agregar.
          </span>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          marginTop: '32px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading
            ? mode === 'create'
              ? 'Creando…'
              : 'Guardando…'
            : mode === 'create'
            ? 'Crear habitación'
            : 'Guardar cambios'}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => router.push('/dashboard/habitaciones')}
          disabled={loading}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
