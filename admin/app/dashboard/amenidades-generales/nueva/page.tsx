import Link from 'next/link'
import AmenidadGeneralForm from '@/components/AmenidadGeneralForm'

export default function NuevaAmenidadPage() {
  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <Link href="/dashboard/amenidades-generales">Amenidades generales</Link>
          <span className="top-header__breadcrumb-sep">/</span>
          <span className="top-header__breadcrumb-current">Nueva</span>
        </nav>
      </header>

      <main className="page-content">
        <Link href="/dashboard/amenidades-generales" className="back-link">
          ← Volver a amenidades
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-header__title">Nueva amenidad general</h1>
            <p className="page-header__subtitle">
              Agrega una característica de la ubicación visible en la home.
            </p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 700 }}>
          <AmenidadGeneralForm mode="create" />
        </div>
      </main>
    </>
  )
}
