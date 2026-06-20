'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Ubicacion {
  id: string
  nombre: string
  zona: string | null
  lat: number | null
  lng: number | null
  activo: boolean
  orden: number
}

export default function UbicacionesTable({ ubicaciones: initial }: { ubicaciones: Ubicacion[] }) {
  const router = useRouter()
  const [ubicaciones, setUbicaciones] = useState(initial)
  const [toggling, setToggling] = useState<string | null>(null)

  async function toggleActivo(u: Ubicacion) {
    setToggling(u.id)
    const supabase = createClient()
    await supabase
      .from('ubicaciones')
      .update({ activo: !u.activo })
      .eq('id', u.id)
    setUbicaciones(prev =>
      prev.map(item => item.id === u.id ? { ...item, activo: !item.activo } : item)
    )
    setToggling(null)
  }

  async function handleDelete(u: Ubicacion) {
    if (!confirm(`¿Eliminar "${u.nombre}"? Se desvinculará de todas las habitaciones y amenidades.`)) return
    const supabase = createClient()
    await supabase.from('ubicaciones').delete().eq('id', u.id)
    setUbicaciones(prev => prev.filter(item => item.id !== u.id))
    router.refresh()
  }

  if (!ubicaciones.length) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
        Sin ubicaciones. <Link href="/dashboard/ubicaciones/nueva">Crea la primera.</Link>
      </div>
    )
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Zona pública</th>
          <th>Coordenadas</th>
          <th>Orden</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ubicaciones.map(u => (
          <tr key={u.id} style={{ opacity: u.activo ? 1 : 0.55 }}>
            <td>
              <strong>{u.nombre}</strong>
            </td>
            <td style={{ color: 'var(--gray-400)', fontSize: '.85rem' }}>
              {u.zona ?? '—'}
            </td>
            <td style={{ fontSize: '.82rem', color: 'var(--gray-400)' }}>
              {u.lat != null && u.lng != null
                ? `${u.lat.toFixed(4)}, ${u.lng.toFixed(4)}`
                : '—'}
            </td>
            <td style={{ textAlign: 'center' }}>{u.orden}</td>
            <td>
              <button
                className={`badge ${u.activo ? 'badge--available' : 'badge--maintenance'}`}
                onClick={() => toggleActivo(u)}
                disabled={toggling === u.id}
                style={{ cursor: 'pointer', border: 'none' }}
                title={u.activo ? 'Desactivar' : 'Activar'}
              >
                {toggling === u.id ? '…' : u.activo ? 'Activa' : 'Inactiva'}
              </button>
            </td>
            <td>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <Link
                  href={`/dashboard/ubicaciones/${u.id}`}
                  className="btn btn--secondary btn--sm"
                >
                  Editar
                </Link>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => handleDelete(u)}
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
