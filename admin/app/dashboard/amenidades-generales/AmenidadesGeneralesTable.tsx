'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface LocationAmenity {
  id: string
  slug: string
  label: string
  description: string | null
  icon: string
  category: string
  active: boolean
  orden: number
}

const CATEGORY_LABEL: Record<string, string> = {
  interior:  'Interior',
  exterior:  'Exterior',
  servicios: 'Servicios',
  comunidad: 'Comunidad',
  general:   'General',
}

export default function AmenidadesGeneralesTable({
  amenidades: initial,
}: {
  amenidades: LocationAmenity[]
}) {
  const router = useRouter()
  const [amenidades, setAmenidades] = useState(initial)
  const [toggling, setToggling] = useState<string | null>(null)

  async function toggleActive(a: LocationAmenity) {
    setToggling(a.id)
    const supabase = createClient()
    await supabase
      .from('location_amenities')
      .update({ active: !a.active })
      .eq('id', a.id)

    setAmenidades(prev =>
      prev.map(item => item.id === a.id ? { ...item, active: !item.active } : item)
    )
    setToggling(null)
  }

  async function handleDelete(a: LocationAmenity) {
    if (!confirm(`¿Eliminar "${a.label}"? Esta acción no se puede deshacer.`)) return
    const supabase = createClient()
    await supabase.from('location_amenities').delete().eq('id', a.id)
    setAmenidades(prev => prev.filter(item => item.id !== a.id))
    router.refresh()
  }

  if (!amenidades.length) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
        Sin amenidades. <Link href="/dashboard/amenidades-generales/nueva">Crea la primera.</Link>
      </div>
    )
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Ícono</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Categoría</th>
          <th>Orden</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {amenidades.map(a => (
          <tr key={a.id} style={{ opacity: a.active ? 1 : 0.55 }}>
            <td style={{ width: 48 }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, color: 'var(--selva, #1E4D3C)', verticalAlign: 'middle' }}
              >
                {a.icon}
              </span>
            </td>
            <td>
              <strong>{a.label}</strong>
              <div style={{ fontSize: '.75rem', color: 'var(--gray-400)', marginTop: 2 }}>
                {a.slug}
              </div>
            </td>
            <td style={{ color: 'var(--gray-400)', fontSize: '.85rem', maxWidth: 220 }}>
              {a.description ?? '—'}
            </td>
            <td>
              <span className="badge">{CATEGORY_LABEL[a.category] ?? a.category}</span>
            </td>
            <td style={{ textAlign: 'center' }}>{a.orden}</td>
            <td>
              <button
                className={`badge ${a.active ? 'badge--available' : 'badge--maintenance'}`}
                onClick={() => toggleActive(a)}
                disabled={toggling === a.id}
                style={{ cursor: 'pointer', border: 'none' }}
                title={a.active ? 'Desactivar' : 'Activar'}
              >
                {toggling === a.id ? '…' : a.active ? 'Activa' : 'Inactiva'}
              </button>
            </td>
            <td>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <Link
                  href={`/dashboard/amenidades-generales/${a.id}`}
                  className="btn btn--secondary btn--sm"
                >
                  Editar
                </Link>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => handleDelete(a)}
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
