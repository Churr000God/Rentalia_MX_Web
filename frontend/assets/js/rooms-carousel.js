/* rooms-carousel.js
   Carga habitaciones desde Supabase y renderiza el carrusel de la home.
   Proyecto activo: vefgwrxgfuzgfictdsyo (Rentalia.mx)
   Depende de: @supabase/supabase-js (CDN), cargado antes de este script.
*/
(function () {
  const SUPABASE_URL = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_3Dew0GfB8vlUnItNfBm0Xw_5vMDArZM';

  const CARDS_DESKTOP = 3;
  const CARDS_MOBILE  = 1;

  let db      = null;
  let rooms   = [];
  let current = 0;

  // ── Catálogo de amenidades (mismos slugs que admin/lib/amenities.ts) ──
  const AMENITIES = {
    wifi:            { label: 'Wifi',            icon: 'wifi' },
    bano_privado:    { label: 'Baño propio',      icon: 'bathtub' },
    amueblada:       { label: 'Amueblada',        icon: 'bed' },
    cocina:          { label: 'Cocina',           icon: 'cooking' },
    aire:            { label: 'Clima A/C',        icon: 'ac_unit' },
    lavadora:        { label: 'Lavadora',         icon: 'local_laundry_service' },
    estacionamiento: { label: 'Estacionamiento',  icon: 'directions_car' },
    mascotas:        { label: 'Pet friendly',     icon: 'pets' },
    servicios:       { label: 'Servicios incl.',  icon: 'bolt' },
    escritorio:      { label: 'Escritorio',       icon: 'desk' },
  };

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    if (!window.supabase) { showError('Supabase no disponible.'); return; }
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    loadRooms();
  }

  // ── Fetch ─────────────────────────────────────────────────────
  async function loadRooms() {
    try {
      const { data, error } = await db
        .from('habitaciones')
        .select('id, nombre, zona, tipo, descripcion, status, precio_min, precio_max, imagen_principal, imagenes, amenities, tags, orden')
        .eq('status', 'available')
        .order('orden', { ascending: true })
        .limit(12);

      if (error) throw error;

      rooms = data || [];
      render();
    } catch (err) {
      console.error('rooms-carousel:', err);
      showError('No pudimos cargar las habitaciones.');
    }
  }

  // ── Render ────────────────────────────────────────────────────
  function render() {
    const track  = document.getElementById('roomsTrack');
    const dotsEl = document.getElementById('roomsDots');
    if (!track) return;

    if (rooms.length === 0) {
      track.innerHTML = '<p style="padding:2rem;color:var(--tinta)">Sin habitaciones disponibles por ahora.</p>';
      return;
    }

    track.innerHTML = rooms.map((r, i) => buildCard(r, i)).join('');

    // Inicializar galerías de cada tarjeta
    track.querySelectorAll('.room-card[data-id]').forEach(card => {
      const id = card.dataset.id;
      const room = rooms.find(r => r.id === id);
      if (room) initGallery(card, room);
    });

    // Dots de navegación del carrusel
    if (dotsEl) {
      dotsEl.innerHTML = rooms.map((_, i) =>
        `<button class="rooms-carousel__dot${i === 0 ? ' active' : ''}"
                 aria-label="Ir a habitación ${i + 1}"
                 data-index="${i}"></button>`
      ).join('');

      dotsEl.querySelectorAll('.rooms-carousel__dot').forEach(btn => {
        btn.addEventListener('click', () => goTo(+btn.dataset.index));
      });
    }

    // Flechas
    const prev = document.getElementById('roomsPrev');
    const next = document.getElementById('roomsNext');
    if (prev) prev.addEventListener('click', () => goTo(current - 1));
    if (next) next.addEventListener('click', () => goTo(current + 1));

    updatePosition();
    updateArrows();
  }

  // ── Galería por tarjeta ───────────────────────────────────────
  function initGallery(card, room) {
    const allImgs = buildImgList(room);
    if (allImgs.length <= 1) return;

    const fill = card.querySelector('.room-card__photo-fill');
    if (!fill) return;

    const dots = card.querySelectorAll('.room-card__gallery-dot');
    let active = 0;

    function goToImg(idx) {
      active = idx;
      fill.style.backgroundImage = `url('${allImgs[idx]}')`;
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', e => { e.stopPropagation(); goToImg(i); });
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  function buildImgList(room) {
    // Combina imagen_principal + imagenes sin duplicados
    const arr = Array.isArray(room.imagenes) ? room.imagenes : [];
    if (room.imagen_principal && !arr.includes(room.imagen_principal)) {
      return [room.imagen_principal, ...arr];
    }
    return arr.length ? arr : (room.imagen_principal ? [room.imagen_principal] : []);
  }

  // ── Card builder ──────────────────────────────────────────────
  const PG = ['pg-a', 'pg-b', 'pg-c', 'pg-d'];

  function buildCard(room, index) {
    const allImgs = buildImgList(room);
    const firstImg = allImgs[0] || null;

    // Foto principal
    const photoFill = firstImg
      ? `<div class="room-card__photo-fill"
              role="img"
              aria-label="${room.nombre}"
              style="background-image:url('${firstImg}')"></div>`
      : `<div class="room-card__photo-fill ${PG[index % 4]}"
              role="img"
              aria-label="${room.nombre}">
           <span class="room-card__photo-label">Foto · ${room.nombre}</span>
         </div>`;

    // Dots de la galería (solo si hay más de 1 foto)
    const galleryDots = allImgs.length > 1
      ? `<div class="room-card__gallery-dots" aria-hidden="true">
           ${allImgs.map((_, i) =>
             `<button class="room-card__gallery-dot${i === 0 ? ' active' : ''}"
                      aria-label="Foto ${i + 1}" type="button"></button>`
           ).join('')}
         </div>`
      : '';

    // Badge de estado
    const STATUS = {
      available:   { badge: 'badge-on',    label: 'Disponible'  },
      occupied:    { badge: 'badge-off',   label: 'Ocupado'     },
      maintenance: { badge: 'badge-amber', label: 'Pronto libre' },
    };
    const s = STATUS[room.status] || STATUS.available;

    // Precio
    const precio = room.precio_min && room.precio_max
      ? `$${room.precio_min.toLocaleString()}–$${room.precio_max.toLocaleString()} / mes`
      : room.precio_min
        ? `$${room.precio_min.toLocaleString()} / mes`
        : 'Consultar precio';

    // Meta (zona · tipo)
    const tipoLabel = { privada: 'Privada', compartida: 'Compartida', estudio: 'Estudio' };
    const metaParts = [room.zona, tipoLabel[room.tipo]].filter(Boolean);
    const meta = metaParts.length
      ? `<p class="room-card__meta">${metaParts.join(' · ')}</p>`
      : '';

    // Amenidades (máx 4 + contador si hay más)
    const amenSlugs = Array.isArray(room.amenities) ? room.amenities : [];
    const MAX_ICONS = 4;
    const visible   = amenSlugs.slice(0, MAX_ICONS);
    const extra     = amenSlugs.length - MAX_ICONS;
    const amenHtml  = amenSlugs.length
      ? `<div class="room-card__amenities" aria-label="Amenidades">
           ${visible.map(slug => {
             const a = AMENITIES[slug];
             if (!a) return '';
             return `<span class="room-card__amenity" title="${a.label}">
                       <span class="material-symbols-outlined" aria-hidden="true">${a.icon}</span>
                     </span>`;
           }).join('')}
           ${extra > 0 ? `<span class="room-card__amenity room-card__amenity--more">+${extra}</span>` : ''}
         </div>`
      : '';

    // Tags / chips
    const tags  = Array.isArray(room.tags) && room.tags.length ? room.tags : [];
    const chips = tags.map(t => `<span class="chip">${t}</span>`).join('');

    // CTA
    const cta = room.status === 'available'
      ? `<a href="/pages/agendar_visita.html?id=${room.id}" class="btn btn-cta room-card__cta">¡Lo quiero!</a>`
      : `<a href="/pages/agendar_visita.html?id=${room.id}" class="btn btn-outline room-card__cta">Agendar visita</a>`;

    return `
      <article class="room-card" data-id="${room.id}">
        <div class="room-card__photo">
          ${photoFill}
          <span class="room-card__badge ${s.badge}">${s.label}</span>
          ${galleryDots}
        </div>
        <div class="room-card__body">
          <h3 class="room-card__name">${room.nombre}</h3>
          ${meta}
          <p class="room-card__price">${precio}</p>
          ${amenHtml}
          <div class="room-card__chips">${chips}</div>
          ${cta}
        </div>
      </article>`;
  }

  // ── Navegación del carrusel ───────────────────────────────────
  function perPage() {
    return window.innerWidth >= 768 ? CARDS_DESKTOP : CARDS_MOBILE;
  }

  function maxIndex() {
    return Math.max(0, rooms.length - perPage());
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    updatePosition();
    updateDots();
    updateArrows();
  }

  function updatePosition() {
    const track = document.getElementById('roomsTrack');
    if (!track || !track.children[0]) return;
    const gap       = 24;
    const cardWidth = track.children[0].offsetWidth;
    track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;
  }

  function updateDots() {
    document.querySelectorAll('.rooms-carousel__dot')
      .forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function updateArrows() {
    const prev = document.getElementById('roomsPrev');
    const next = document.getElementById('roomsNext');
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current >= maxIndex();
  }

  // Debounce resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      current = Math.min(current, maxIndex());
      updatePosition();
      updateDots();
      updateArrows();
    }, 150);
  });

  // ── Error ─────────────────────────────────────────────────────
  function showError(msg) {
    const track = document.getElementById('roomsTrack');
    if (track) track.innerHTML = `<p style="padding:2rem;color:var(--barro)">${msg}</p>`;
  }

  // ── Boot ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 150));
})();
