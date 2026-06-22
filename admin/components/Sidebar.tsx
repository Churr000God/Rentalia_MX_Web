'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface SidebarProps {
  userEmail: string | undefined
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isHabitacionesActive =
    pathname === '/dashboard/habitaciones' ||
    pathname.startsWith('/dashboard/habitaciones/')

  const isAmenidadesActive =
    pathname === '/dashboard/amenidades-generales' ||
    pathname.startsWith('/dashboard/amenidades-generales/')

  const isUbicacionesActive =
    pathname === '/dashboard/ubicaciones' ||
    pathname.startsWith('/dashboard/ubicaciones/')

  const isHomeConfigActive     = pathname === '/dashboard/home-config'
  const isComoFuncionaActive   = pathname === '/dashboard/como-funciona'
  const isWaitlistActive       = pathname === '/dashboard/waitlist'
  const isVisitasActive        = pathname === '/dashboard/visitas'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-name">Rentalia</div>
        <div className="sidebar__brand-sub">Panel de administración</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav" aria-label="Navegación principal">
        {/* Section: Contenido */}
        <div className="sidebar__section">
          <div className="sidebar__section-label">Contenido</div>

          <Link
            href="/dashboard/habitaciones"
            className={`sidebar__link${isHabitacionesActive ? ' sidebar__link--active' : ''}`}
          >
            <svg
              className="sidebar__link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Habitaciones
          </Link>

          <Link
            href="/dashboard/ubicaciones"
            className={`sidebar__link${isUbicacionesActive ? ' sidebar__link--active' : ''}`}
          >
            <svg
              className="sidebar__link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            Ubicaciones
          </Link>

          <Link
            href="/dashboard/amenidades-generales"
            className={`sidebar__link${isAmenidadesActive ? ' sidebar__link--active' : ''}`}
          >
            <svg
              className="sidebar__link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <path d="M9 22V12h6v10" />
              <circle cx="19" cy="5" r="3" />
            </svg>
            Amenidades generales
          </Link>

          <span className="sidebar__link sidebar__link--disabled">
            <svg
              className="sidebar__link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Reseñas
            <span className="sidebar__link-badge">Próximo</span>
          </span>

          <span className="sidebar__link sidebar__link--disabled">
            <svg
              className="sidebar__link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            FAQs
            <span className="sidebar__link-badge">Próximo</span>
          </span>
        </div>

        {/* Section: Leads */}
        <div className="sidebar__section">
          <div className="sidebar__section-label">Leads</div>

          <Link
            href="/dashboard/waitlist"
            className={`sidebar__link${isWaitlistActive ? ' sidebar__link--active' : ''}`}
          >
            <svg
              className="sidebar__link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Lista de espera
          </Link>

          <Link
            href="/dashboard/visitas"
            className={`sidebar__link${isVisitasActive ? ' sidebar__link--active' : ''}`}
          >
            <svg
              className="sidebar__link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
            Visitas agendadas
          </Link>
        </div>

        {/* Section: Configuración */}
        <div className="sidebar__section">
          <div className="sidebar__section-label">Configuración</div>

          <Link
            href="/dashboard/home-config"
            className={`sidebar__link${isHomeConfigActive ? ' sidebar__link--active' : ''}`}
          >
            <svg
              className="sidebar__link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            Config. Home
          </Link>

          <Link
            href="/dashboard/como-funciona"
            className={`sidebar__link${isComoFuncionaActive ? ' sidebar__link--active' : ''}`}
          >
            <svg
              className="sidebar__link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Cómo funciona
          </Link>

          <span className="sidebar__link sidebar__link--disabled">
            <svg
              className="sidebar__link-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
            </svg>
            General
            <span className="sidebar__link-badge">Próximo</span>
          </span>
        </div>
      </nav>

      {/* Footer: user + logout */}
      <div className="sidebar__footer">
        {userEmail && (
          <div className="sidebar__user-email" title={userEmail}>
            {userEmail}
          </div>
        )}
        <button className="sidebar__logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
