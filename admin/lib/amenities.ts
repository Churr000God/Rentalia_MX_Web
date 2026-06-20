// Catálogo canónico de amenidades para Rentalia.mx
// Los slugs son la fuente de verdad: deben coincidir exactamente
// con los valores almacenados en la columna `amenities` (jsonb) de `habitaciones`
// y con el objeto AMENITIES en alternativas.js del frontend público.
//
// showInCard: true  → ícono visible en la tarjeta del catálogo (/alternativas.html)
// showInCard: false → solo aparece en Características de la página de detalle

export interface Amenity {
  slug: string
  label: string
  icon: string  // Material Symbols Outlined
  showInCard: boolean
}

export const AMENITIES: Amenity[] = [
  { slug: 'wifi',            label: 'Wifi',            icon: 'wifi',                  showInCard: true  },
  { slug: 'bano_privado',    label: 'Baño propio',     icon: 'bathtub',               showInCard: true  },
  { slug: 'amueblada',       label: 'Amueblada',       icon: 'bed',                   showInCard: true  },
  { slug: 'cocina',          label: 'Cocina',          icon: 'cooking',               showInCard: true  },
  { slug: 'aire',            label: 'Clima A/C',       icon: 'ac_unit',               showInCard: true  },
  { slug: 'lavadora',        label: 'Lavadora',        icon: 'local_laundry_service', showInCard: true  },
  { slug: 'estacionamiento', label: 'Estacionamiento', icon: 'directions_car',        showInCard: true  },
  { slug: 'mascotas',        label: 'Pet friendly',    icon: 'pets',                  showInCard: true  },
  { slug: 'servicios',       label: 'Servicios incl.', icon: 'bolt',                  showInCard: true  },
  { slug: 'escritorio',      label: 'Escritorio',      icon: 'desk',                  showInCard: true  },
  { slug: 'cama_matrimonial', label: 'Cama matrimonial', icon: 'king_bed',            showInCard: false },
  { slug: 'ventana_exterior', label: 'Ventana exterior', icon: 'window',              showInCard: false },
]

// Mapa slug → Amenity para búsqueda O(1)
export const AMENITIES_MAP: Record<string, Amenity> = Object.fromEntries(
  AMENITIES.map((a) => [a.slug, a])
)
