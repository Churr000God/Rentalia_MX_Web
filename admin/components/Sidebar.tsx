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

  const isLugaresActive          = pathname === '/dashboard/lugares'
  const isBarrioFotosActive      = pathname === '/dashboard/barrio-fotos'
  const isAmenPerfilesActive     = pathname === '/dashboard/amenidades-perfiles'
  const isHomeConfigActive       = pathname === '/dashboard/home-config'
  const isComoFuncionaActive     = pathname === '/dashboard/como-funciona'
  const isAmenidadesConfigActive = pathname === '/dashboard/amenidades-config'
  const isWaitlistActive         = pathname === '/dashboard/waitlist'
  const isVisitasActive          = pathname === '/dashboard/visitas'
  const isFaqsActive             = pathname === '/dashboard/faqs'
  const isPreguntasActive        = pathname === '/dashboard/faqs/preguntas'

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

          <Link
            href="/dashboard/lugares"
            className={`sidebar__link${isLugaresActive ? ' sidebar__link--active' : ''}`}
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
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Lugares cercanos
          </Link>

          <Link
            href="/dashboard/barrio-fotos"
            className={`sidebar__link${isBarrioFotosActive ? ' sidebar__link--active' : ''}`}
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
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Fotos del barrio
          </Link>

          <Link
            href="/dashboard/amenidades-perfiles"
            className={`sidebar__link${isAmenPerfilesActive ? ' sidebar__link--active' : ''}`}
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
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Perfiles
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

          <Link
            href="/dashboard/faqs"
            className={`sidebar__link${isFaqsActive ? ' sidebar__link--active' : ''}`}
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
            Preguntas frecuentes
          </Link>
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

          <Link
            href="/dashboard/faqs/preguntas"
            className={`sidebar__link${isPreguntasActive ? ' sidebar__link--active' : ''}`}
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Preguntas de usuarios
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
            href="/dashboard/amenidades-config"
            className={`sidebar__link${isAmenidadesConfigActive ? ' sidebar__link--active' : ''}`}
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
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <path d="M9 22V12h6v10"/>
              <path d="M17 5l2.5 2.5"/>
            </svg>
            Config. Amenidades
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
