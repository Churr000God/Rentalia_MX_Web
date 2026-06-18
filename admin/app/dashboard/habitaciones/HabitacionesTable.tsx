'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Habitacion {
  id: string
  nombre: string
  zona: string | null
  tipo: string | null
  precio_min: number | null
  precio_max: number | null
  status: string | null
  orden: number | null
}

function formatPrecio(min: number | null, max: number | null): string {
  if (!min && !max) return '—'
  const fmt = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `desde ${fmt(min)}`
  return `hasta ${fmt(max!)}`
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span style={{ color: 'var(--gray-400)' }}>—</span>

  const map: Record<string, { label: string; cls: string }> = {
    available: { label: 'Disponible', cls: 'badge--available' },
    occupied: { label: 'Ocupada', cls: 'badge--occupied' },
    maintenance: { label: 'Mantenimiento', cls: 'badge--maintenance' },
  }

  const info = map[status] ?? { label: status, cls: '' }
  return <span className={`badge ${info.cls}`}>{info.label}</span>
}

interface ConfirmDialogProps {
  nombre: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

function ConfirmDialog({ nombre, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
      <div className="dialog-box">
        <h2 className="dialog-box__title" id="dlg-title">
          Eliminar habitación
        </h2>
        <p className="dialog-box__body">
          ¿Estás seguro de que deseas eliminar{' '}
          <strong>&ldquo;{nombre}&rdquo;</strong>? Esta acción no se puede
          deshacer.
        </p>
        <div className="dialog-box__actions">
          <button className="btn btn--secondary btn--sm" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn--danger btn--sm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HabitacionesTable({
  habitaciones: initialHabitaciones,
}: {
  habitaciones: Habitacion[]
}) {
  const router = useRouter()
  const [habitaciones, setHabitaciones] = useState(initialHabitaciones)
  const [deleteTarget, setDeleteTarget] = useState<Habitacion | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setDeleteError(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('habitaciones')
      .delete()
      .eq('id', deleteTarget.id)

    if (error) {
      setDeleteError(`Error al eliminar: ${error.message}`)
      setDeleteLoading(false)
      return
    }

    setHabitaciones((prev) => prev.filter((h) => h.id !== deleteTarget.id))
    setDeleteTarget(null)
    setDeleteLoading(false)
    router.refresh()
  }

  if (habitaciones.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🏠</div>
        <p className="empty-state__text">Aún no hay habitaciones registradas.</p>
        <Link href="/dashboard/habitaciones/nueva" className="btn btn--primary">
          + Crear primera habitación
        </Link>
      </div>
    )
  }

  return (
    <>
      {deleteError && (
        <div className="alert alert--error" style={{ margin: '16px 16px 0' }} role="alert">
          {deleteError}
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>Orden</th>
              <th>Nombre</th>
              <th>Zona</th>
              <th>Precio</th>
              <th>Status</th>
              <th style={{ width: 130 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {habitaciones.map((h) => (
              <tr key={h.id}>
                <td style={{ color: 'var(--gray-500)', textAlign: 'center' }}>
                  {h.orden ?? '—'}
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{h.nombre}</span>
                  {h.tipo && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: '0.75rem',
                        color: 'var(--gray-500)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {h.tipo}
                    </span>
                  )}
                </td>
                <td style={{ color: 'var(--gray-700)' }}>{h.zona ?? '—'}</td>
                <td style={{ color: 'var(--barro)', fontWeight: 600 }}>
                  {formatPrecio(h.precio_min, h.precio_max)}
                </td>
                <td>
                  <StatusBadge status={h.status} />
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Link
                      href={`/dashboard/habitaciones/${h.id}`}
                      className="btn btn--ghost btn--sm"
                      title="Editar"
                    >
                      Editar
                    </Link>
                    <button
                      className="btn btn--danger btn--sm"
                      title="Eliminar"
                      onClick={() => {
                        setDeleteError(null)
                        setDeleteTarget(h)
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          nombre={deleteTarget.nombre}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </>
  )
}
