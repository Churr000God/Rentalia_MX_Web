// Catálogo canónico de amenidades para Rentalia.mx
// Los slugs son la fuente de verdad: deben coincidir exactamente
// con los valores almacenados en la columna `amenities` (jsonb) de `habitaciones`
// y con el objeto AMENITIES en rooms-carousel.js del frontend público.

export interface Amenity {
  slug: string
  label: string
  icon: string  // Material Symbols Outlined — nombre del símbolo
}

export const AMENITIES: Amenity[] = [
  { slug: 'wifi',              label: 'Wifi',              icon: 'wifi'                   },
  { slug: 'bano_privado',      label: 'Baño propio',       icon: 'bathtub'                },
  { slug: 'amueblada',         label: 'Amueblada',         icon: 'bed'                    },
  { slug: 'cocina',            label: 'Cocina',            icon: 'cooking'                },
  { slug: 'aire',              label: 'Clima A/C',         icon: 'ac_unit'                },
  { slug: 'lavadora',          label: 'Lavadora',          icon: 'local_laundry_service'  },
  { slug: 'estacionamiento',   label: 'Estacionamiento',   icon: 'directions_car'         },
  { slug: 'mascotas',          label: 'Pet friendly',      icon: 'pets'                   },
  { slug: 'servicios',         label: 'Servicios incl.',   icon: 'bolt'                   },
  { slug: 'escritorio',        label: 'Escritorio',        icon: 'desk'                   },
]

// Mapa slug → Amenity para búsqueda O(1)
export const AMENITIES_MAP: Record<string, Amenity> = Object.fromEntries(
  AMENITIES.map((a) => [a.slug, a])
)
