import Link from 'next/link'
import UbicacionForm from '@/components/UbicacionForm'

export default function NuevaUbicacionPage() {
  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <Link href="/dashboard/ubicaciones">Ubicaciones</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Nueva</span>
        </nav>
      </header>

      <main className="page-content">
        <Link href="/dashboard/ubicaciones" className="back-link">
          ← Volver a ubicaciones
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-header__title">Nueva ubicación</h1>
            <p className="page-header__subtitle">
              Define una propiedad/dirección con su mapa y puntos de interés.
            </p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 700 }}>
          <UbicacionForm mode="create" />
        </div>
      </main>
    </>
  )
}
