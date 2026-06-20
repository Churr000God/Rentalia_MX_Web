/* detalle.js — Página de detalle de habitación
   Supabase: vefgwrxgfuzgfictdsyo (mismo proyecto que alternativas.js)
   Esquema plano: tabla `habitaciones` sin join a habitacion_estilos
*/
(function () {
  'use strict';

  /* ── Config ──────────────────────────────────── */
  const SUPABASE_URL = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_3Dew0GfB8vlUnItNfBm0Xw_5vMDArZM';
  const WA_NUMBER   = '521XXXXXXXXXX'; // Reemplazar con número real

  /* ── Mapa de amenidades (igual que alternativas.js) ── */
  const AMENITIES = {
    wifi:            { label: 'WiFi',            icon: 'wifi' },
    bano_privado:    { label: 'Baño privado',     icon: 'bathtub' },
    amueblada:       { label: 'Amueblada',        icon: 'bed' },
    cocina:          { label: 'Cocina',           icon: 'cooking' },
    aire:            { label: 'Clima A/C',        icon: 'ac_unit' },
    lavadora:        { label: 'Lavadora',         icon: 'local_laundry_service' },
    estacionamiento: { label: 'Estacionamiento',  icon: 'directions_car' },
    mascotas:        { label: 'Pet friendly',     icon: 'pets' },
    servicios:       { label: 'Servicios incl.',  icon: 'bolt' },
    escritorio:       { label: 'Escritorio',        icon: 'desk'    },
    cama_matrimonial: { label: 'Cama matrimonial',  icon: 'king_bed' },
    ventana_exterior: { label: 'Ventana exterior',  icon: 'window'  },
  };

  /* ── Estado ──────────────────────────────────── */
  let db = null;
  let currentRoom = null;
  let photoURLs   = [];   // URLs de fotos para galería / lightbox
  let lbIndex     = 0;    // índice activo en lightbox
  let mobileIdx   = 0;    // índice activo en carrusel móvil

  /* ── DOM refs (se asignan en init) ───────────── */
  let elBreadcrumb, elDetailLoading, elDetailLayout, elDetailError;
  let elMobileTrack, elMobileDots, elGalleryPrev, elGalleryNext;
  let elGalleryMosaic, elGalleryAllBtn;
  let elRoomName, elRoomLocation, elChipsEl;
  let elDescription, elCharsGrid;
  let elPanelPrice, elPanelAvail, elPanelAvailDot, elPanelAvailTitle, elPanelAvailDate;
  let elCtaReserve, elCtaVisit, elMbarRoom, elMbarPrice, elMbarCta;
  let elOtherRooms;
  // mapa + secciones dinámicas
  let elLocationSection, elLocationMap, elDistanciasCard;
  let elIncluyeSection, elIncluyeList;
  let elHouseAmenitiesSection, elHouseAmenitiesList;
  // lightbox
  let elLb, elLbBackdrop, elLbClose, elLbPrev, elLbNext, elLbImg, elLbCounter, elLbCaption;
  // instancia del mapa Leaflet
  let leafletMap = null;

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    // Obtener refs DOM
    elBreadcrumb    = document.getElementById('breadcrumb-room');
    elDetailLoading = document.getElementById('detailLoading');
    elDetailLayout  = document.getElementById('detailLayout');
    elDetailError   = document.getElementById('detailError');
    elMobileTrack   = document.getElementById('mobileTrack');
    elMobileDots    = document.getElementById('mobileDots');
    elGalleryPrev   = document.getElementById('galleryPrev');
    elGalleryNext   = document.getElementById('galleryNext');
    elGalleryMosaic = document.getElementById('galleryMosaic');
    elGalleryAllBtn = document.getElementById('galleryAllBtn');
    elRoomName      = document.getElementById('room-h1');
    elRoomLocation  = document.getElementById('room-location');
    elChipsEl       = document.getElementById('room-chips');
    elDescription   = document.getElementById('room-description');
    elCharsGrid     = document.getElementById('charsGrid');
    elPanelPrice    = document.getElementById('panel-price');
    elPanelAvail    = document.getElementById('panelAvail');
    elPanelAvailDot = document.getElementById('panelAvailDot');
    elPanelAvailTitle = document.getElementById('panelAvailTitle');
    elPanelAvailDate  = document.getElementById('panelAvailDate');
    elCtaReserve    = document.getElementById('ctaReserve');
    elCtaVisit      = document.getElementById('ctaVisit');
    elMbarRoom      = document.getElementById('mbarRoom');
    elMbarPrice     = document.getElementById('mbarPrice');
    elMbarCta       = document.getElementById('mbarCta');
    elOtherRooms            = document.getElementById('otherRooms');
    // mapa + secciones dinámicas
    elLocationSection       = document.getElementById('locationSection');
    elLocationMap           = document.getElementById('locationMap');
    elDistanciasCard        = document.getElementById('distanciasCard');
    elIncluyeSection        = document.getElementById('incluyeSection');
    elIncluyeList           = document.getElementById('incluyeList');
    elHouseAmenitiesSection = document.getElementById('houseAmenitiesSection');
    elHouseAmenitiesList    = document.getElementById('houseAmenitiesList');
    // lightbox
    elLb        = document.getElementById('lightbox');
    elLbBackdrop = document.getElementById('lbBackdrop');
    elLbClose   = document.getElementById('lbClose');
    elLbPrev    = document.getElementById('lbPrev');
    elLbNext    = document.getElementById('lbNext');
    elLbImg     = document.getElementById('lbImg');
    elLbCounter = document.getElementById('lbCounter');
    elLbCaption = document.getElementById('lbCaption');

    // Init Supabase
    if (!window.supabase) {
      return showError('No se pudo cargar la conexión. Recarga la página.');
    }
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Leer ID de la URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      return showError('No se especificó ninguna habitación. Vuelve al catálogo.');
    }

    // Wireup lightbox
    initLightbox();

    // Cargar datos
    await Promise.all([
      loadRoom(id),
    ]);
  }

  /* ══════════════════════════════════════════════
     CARGA DE DATOS
  ══════════════════════════════════════════════ */
  async function loadRoom(id) {
    try {
      const { data, error } = await db
        .from('habitaciones')
        .select('id, nombre, descripcion, zona, ubicacion_id, tipo, status, precio_min, precio_max, imagenes, amenities, tags, incluye, piso, metros_cuadrados, fecha_disponibilidad, orden')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Habitación no encontrada');

      currentRoom = data;
      renderRoom(data);

      // Cargar en paralelo: ubicación + amenidades de la casa + otros cuartos
      await Promise.all([
        loadUbicacion(data.ubicacion_id),
        loadHouseAmenities(data.ubicacion_id),
        loadOtherRooms(id),
      ]);

    } catch (err) {
      console.error('Error cargando habitación:', err);
      showError('No se encontró la habitación o hubo un error de conexión.');
    }
  }

  async function loadUbicacion(ubicacionId) {
    if (!ubicacionId) return;
    try {
      const { data, error } = await db
        .from('ubicaciones')
        .select('nombre, zona, lat, lng, distancias')
        .eq('id', ubicacionId)
        .single();
      if (error || !data) return;
      renderMap(data);
      renderDistancias(data.distancias || []);
    } catch (e) {
      console.warn('No se cargó la ubicación:', e);
    }
  }

  async function loadHouseAmenities(ubicacionId) {
    try {
      let query = db
        .from('location_amenities')
        .select('label, icon, description')
        .eq('active', true)
        .order('orden', { ascending: true });

      if (ubicacionId) {
        // Amenidades de esta ubicación específica
        query = query.eq('ubicacion_id', ubicacionId);
      } else {
        // Sin ubicacion_id: mostrar amenidades globales (ubicacion_id null)
        query = query.is('ubicacion_id', null);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) return;
      renderHouseAmenities(data);
    } catch (e) {
      console.warn('No se cargaron las amenidades de la casa:', e);
    }
  }

  async function loadOtherRooms(excludeId) {
    if (!elOtherRooms) return;
    try {
      const { data, error } = await db
        .from('habitaciones')
        .select('id, nombre, zona, status, precio_min, precio_max, imagenes, piso, metros_cuadrados, amenities')
        .in('status', ['available', 'occupied', 'maintenance'])
        .neq('id', excludeId)
        .order('orden', { ascending: true, nullsFirst: false })
        .limit(2);

      if (error || !data || data.length === 0) return;

      elOtherRooms.innerHTML = '';
      data.forEach((room, i) => {
        const card = buildOtherCard(room);
        elOtherRooms.appendChild(card);
        // Stagger reveal con inline styles (compatibilidad con el enfoque de buildOtherCard)
        requestAnimationFrame(() => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 100);
        });
      });
    } catch (e) {
      // Falló silenciosamente — la sección simplemente queda vacía
      console.warn('No se cargaron los otros cuartos:', e);
    }
  }

  /* ══════════════════════════════════════════════
     RENDER PRINCIPAL
  ══════════════════════════════════════════════ */
  function renderRoom(room) {
    const isAvailable = room.status === 'available';
    const amenities   = Array.isArray(room.amenities) ? room.amenities : [];
    const imagenes    = Array.isArray(room.imagenes)  ? room.imagenes  : [];
    const tags        = Array.isArray(room.tags)       ? room.tags      : [];

    // Arreglar rutas relativas
    photoURLs = imagenes.map(fixPath).filter(Boolean);

    // Meta / título
    const nombre = room.nombre || 'Habitación';
    document.title = `${nombre} · Rentalia`;
    const metaEl = document.getElementById('page-meta');
    if (metaEl) {
      const precio = fmtPrecio(room.precio_min, room.precio_max);
      metaEl.setAttribute('content', `${nombre} en ${room.zona || 'Narvarte'} · ${precio}/mes · Todo incluido`);
    }

    // Breadcrumb
    if (elBreadcrumb) elBreadcrumb.textContent = nombre;

    // Encabezado
    if (elRoomName) elRoomName.textContent = nombre;
    if (elRoomLocation) elRoomLocation.textContent = room.zona ? `${room.zona}, CDMX` : 'Narvarte, CDMX';

    // Chips adicionales desde tags
    if (elChipsEl && tags.length) {
      const fragment = document.createDocumentFragment();
      tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'd-chip';
        span.setAttribute('role', 'listitem');
        span.textContent = t;
        fragment.appendChild(span);
      });
      // Insertar antes del chip "Comunidad" (último)
      const lastChip = elChipsEl.lastElementChild;
      elChipsEl.insertBefore(fragment, lastChip);
    }

    // Descripción
    if (elDescription) {
      elDescription.textContent = room.descripcion || 'Habitación amueblada y todo incluido en Narvarte, CDMX.';
    }

    // Características
    renderChars(room, amenities);

    // Qué incluye la renta (desde habitaciones.incluye)
    renderIncluye(room.incluye || []);

    // Precio
    const precio = fmtPrecio(room.precio_min, room.precio_max);
    if (elPanelPrice) elPanelPrice.textContent = precio;

    // Disponibilidad
    renderAvail(room, isAvailable);

    // CTAs (WhatsApp)
    const waText   = encodeURIComponent(`Hola, quiero reservar ${nombre} en Rentalia Narvarte`);
    const waVisit  = encodeURIComponent(`Hola, quiero agendar una visita para ver ${nombre} en Rentalia`);
    const waHref   = `https://wa.me/${WA_NUMBER}?text=${waText}`;
    const waVisitH = `https://wa.me/${WA_NUMBER}?text=${waVisit}`;
    if (elCtaReserve) elCtaReserve.href = waHref;
    if (elCtaVisit)   elCtaVisit.href   = waVisitH;

    // Barra móvil
    if (elMbarRoom)  elMbarRoom.textContent = nombre;
    if (elMbarPrice) {
      elMbarPrice.innerHTML = `${precio} <span class="d-mobile-bar__note">/ mes</span>`;
    }
    if (elMbarCta) elMbarCta.href = waHref;

    // Galería
    renderGallery(photoURLs, nombre);

    // Mostrar layout, ocultar loading
    if (elDetailLoading) elDetailLoading.hidden = true;
    if (elDetailLayout)  elDetailLayout.hidden  = false;
  }

  /* ── Características ── */
  function renderChars(room, amenities) {
    if (!elCharsGrid) return;
    const chars = [];

    // Cama matrimonial
    if (amenities.includes('cama_matrimonial')) chars.push({ icon: 'king_bed', text: 'Cama matrimonial' });

    // Piso
    if (room.piso) chars.push({ icon: 'layers', text: `Piso ${room.piso}` });

    // Metros
    if (room.metros_cuadrados) chars.push({ icon: 'square_foot', text: `${room.metros_cuadrados} m²` });

    // Baño
    if (amenities.includes('bano_privado')) {
      chars.push({ icon: 'bathtub', text: 'Baño privado' });
    } else {
      chars.push({ icon: 'shower', text: 'Baño compartido' });
    }

    // Escritorio
    if (amenities.includes('escritorio')) chars.push({ icon: 'desk', text: 'Escritorio' });

    // Clima
    if (amenities.includes('aire')) chars.push({ icon: 'ac_unit', text: 'Clima A/C' });

    // Ventana exterior
    if (amenities.includes('ventana_exterior')) chars.push({ icon: 'window', text: 'Ventana exterior' });

    elCharsGrid.innerHTML = chars.map(c => `
      <div class="d-char-card" role="listitem">
        <span class="material-symbols-outlined" aria-hidden="true">${c.icon}</span>
        <span class="d-char-card__text">${c.text}</span>
      </div>
    `).join('');
  }

  /* ── Disponibilidad ── */
  function renderAvail(room, isAvailable) {
    const dotEl   = elPanelAvailDot;
    const titleEl = elPanelAvailTitle;
    const dateEl  = elPanelAvailDate;
    const panelEl = elPanelAvail;

    if (isAvailable) {
      if (panelEl) panelEl.classList.remove('d-panel__avail--amber');
      if (dotEl)   { dotEl.className = 'd-panel__avail-dot d-panel__avail-dot--green'; }
      if (titleEl) titleEl.textContent = 'Disponible ya';
      if (dateEl)  {
        dateEl.textContent = room.fecha_disponibilidad
          ? `Entrada desde el ${fmtFecha(room.fecha_disponibilidad)}`
          : 'Entrada inmediata';
      }
    } else {
      if (panelEl) panelEl.classList.add('d-panel__avail--amber');
      if (dotEl)   { dotEl.className = 'd-panel__avail-dot d-panel__avail-dot--amber'; }
      if (titleEl) titleEl.textContent = 'Próximamente disponible';
      if (dateEl)  {
        dateEl.textContent = room.fecha_disponibilidad
          ? `Disponible el ${fmtFecha(room.fecha_disponibilidad)}`
          : 'Consultar disponibilidad';
      }
    }
  }

  /* ── Qué incluye la renta ── */
  function renderIncluye(incluyeArr) {
    if (!elIncluyeList || !elIncluyeSection) return;
    const items = Array.isArray(incluyeArr) ? incluyeArr : [];
    if (items.length === 0) return;

    elIncluyeList.innerHTML = items.map(item => `
      <li role="listitem">
        <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
        ${item}
      </li>
    `).join('');
    elIncluyeSection.hidden = false;
  }

  /* ── Amenidades de la casa ── */
  function renderHouseAmenities(rows) {
    if (!elHouseAmenitiesList || !elHouseAmenitiesSection) return;
    if (!rows || rows.length === 0) return;

    elHouseAmenitiesList.innerHTML = rows.map(a => `
      <li role="listitem" title="${a.description || ''}">
        <span class="material-symbols-outlined" aria-hidden="true">${a.icon}</span>
        ${a.label}
      </li>
    `).join('');
    elHouseAmenitiesSection.hidden = false;
  }

  /* ── Mapa Leaflet ── */
  function renderMap(ubicacion) {
    if (!elLocationSection || !elLocationMap) return;
    if (!ubicacion.lat || !ubicacion.lng) return;
    if (typeof L === 'undefined') return; // Leaflet no cargó

    elLocationSection.hidden = false;

    // Destruir mapa previo si existe (hot-reload seguro)
    if (leafletMap) {
      leafletMap.remove();
      leafletMap = null;
    }

    leafletMap = L.map('locationMap', {
      center: [ubicacion.lat, ubicacion.lng],
      zoom: 15,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    // Tiles OpenStreetMap (gratis, sin API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(leafletMap);

    // Círculo aproximado (~300 m) en vez de pin exacto
    L.circle([ubicacion.lat, ubicacion.lng], {
      radius: 300,
      color: '#143528',
      fillColor: '#1E4D3C',
      fillOpacity: 0.18,
      weight: 2,
    }).addTo(leafletMap);
  }

  /* ── Distancias (card superpuesta) ── */
  function renderDistancias(distancias) {
    if (!elDistanciasCard) return;
    const items = Array.isArray(distancias) ? distancias : [];
    if (items.length === 0) return;

    elDistanciasCard.innerHTML = items.map(d => `
      <div class="d-map__card-item">
        <span class="material-symbols-outlined" aria-hidden="true">${d.icon || 'place'}</span>
        <span>${d.text}</span>
      </div>
    `).join('');
    elDistanciasCard.hidden = false;
  }

  /* ══════════════════════════════════════════════
     GALERÍA
  ══════════════════════════════════════════════ */
  function renderGallery(photos, roomName) {
    renderMobileGallery(photos, roomName);
    renderDesktopMosaic(photos, roomName);
    if (elGalleryAllBtn) {
      // Actualizar texto del botón de forma robusta
      if (photos.length) {
        const textNodes = Array.from(elGalleryAllBtn.childNodes)
          .filter(n => n.nodeType === 3);
        if (textNodes.length) {
          textNodes[textNodes.length - 1].textContent = ` Ver todas las fotos (${photos.length})`;
        }
      }
      elGalleryAllBtn.addEventListener('click', () => openLightbox(0));
    }
  }

  /* ── Mobile carrusel ── */
  function renderMobileGallery(photos, roomName) {
    if (!elMobileTrack) return;

    // Vaciar skeletons
    elMobileTrack.innerHTML = '';

    const allSlides = [...photos];

    if (allSlides.length === 0) {
      // Placeholder si no hay fotos
      const slide = document.createElement('div');
      slide.className = 'd-gallery__slide d-gallery__slide--skeleton';
      slide.setAttribute('role', 'listitem');
      elMobileTrack.appendChild(slide);
    } else {
      allSlides.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.className = 'd-gallery__slide';
        slide.setAttribute('role', 'listitem');
        slide.setAttribute('aria-label', `Foto ${i + 1} de ${allSlides.length} — ${roomName}`);
        slide.dataset.photoIndex = i;
        slide.tabIndex = 0;
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${roomName} — foto ${i + 1}`;
        img.loading = i === 0 ? 'eager' : 'lazy';
        img.onerror = () => { img.style.display = 'none'; };
        slide.appendChild(img);
        slide.addEventListener('click', () => openLightbox(i));
        slide.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
        });
        elMobileTrack.appendChild(slide);
      });
    }

    // Tour tile al final
    const tourSlide = document.createElement('div');
    tourSlide.className = 'd-gallery__slide d-gallery__slide--tour';
    tourSlide.setAttribute('role', 'listitem');
    tourSlide.setAttribute('aria-label', 'Recorrido virtual 360° — próximamente');
    tourSlide.innerHTML = `
      <div class="d-tour-tile__inner">
        <span class="material-symbols-outlined d-tour-tile__icon" aria-hidden="true">globe</span>
        <p class="d-tour-tile__label">Recorrido 360°</p>
        <p class="d-tour-tile__sub">Matterport próximamente</p>
        <span class="d-tour-tile__badge">Próximamente</span>
      </div>
    `;
    elMobileTrack.appendChild(tourSlide);

    // Construir dots
    initMobileDots(allSlides.length);

    // Flechas
    if (elGalleryPrev) {
      elGalleryPrev.addEventListener('click', () => goToMobileSlide((mobileIdx - 1 + allSlides.length) % allSlides.length));
    }
    if (elGalleryNext) {
      elGalleryNext.addEventListener('click', () => goToMobileSlide((mobileIdx + 1) % allSlides.length));
    }

    // Scroll sync dots
    let scrollTimer;
    elMobileTrack.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const slideWidth = elMobileTrack.children[0]?.offsetWidth || 1;
        const idx = Math.round(elMobileTrack.scrollLeft / slideWidth);
        if (idx !== mobileIdx && idx < allSlides.length) updateDots(idx);
        mobileIdx = idx < allSlides.length ? idx : mobileIdx;
      }, 80);
    });

    // Touch swipe
    let touchStartX = 0;
    elMobileTrack.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    elMobileTrack.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        const total = allSlides.length;
        goToMobileSlide(dx < 0
          ? (mobileIdx + 1) % total
          : (mobileIdx - 1 + total) % total);
      }
    }, { passive: true });
  }

  function initMobileDots(count) {
    if (!elMobileDots) return;
    elMobileDots.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'd-g-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Foto ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => goToMobileSlide(i));
      elMobileDots.appendChild(dot);
    }
  }

  function goToMobileSlide(index) {
    mobileIdx = index;
    const slideWidth = elMobileTrack.children[0]?.offsetWidth || 0;
    elMobileTrack.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
    updateDots(index);
  }

  function updateDots(index) {
    if (!elMobileDots) return;
    Array.from(elMobileDots.children).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }

  /* ── Desktop mosaico ── */
  function renderDesktopMosaic(photos, roomName) {
    if (!elGalleryMosaic) return;

    // Vaciar skeletons iniciales
    elGalleryMosaic.innerHTML = '';

    /* Foto principal */
    const mainDiv = document.createElement('div');
    mainDiv.className = 'd-gallery__main';
    if (photos[0]) {
      const img = document.createElement('img');
      img.src = photos[0];
      img.alt = `${roomName} — vista principal`;
      img.loading = 'eager';
      img.onerror = () => { mainDiv.classList.add('d-gallery__item--skeleton'); };
      mainDiv.appendChild(img);
      mainDiv.appendChild(buildOverlay());
      mainDiv.dataset.photoIndex = '0';
      mainDiv.tabIndex = 0;
      mainDiv.setAttribute('role', 'button');
      mainDiv.setAttribute('aria-label', `Abrir visor — Foto 1 de ${photos.length}`);
      mainDiv.addEventListener('click', () => openLightbox(0));
      mainDiv.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(0); }
      });
    } else {
      mainDiv.classList.add('d-gallery__item--skeleton');
    }
    elGalleryMosaic.appendChild(mainDiv);

    /* Miniatura (foto 2 si existe) */
    const thumbDiv = document.createElement('div');
    thumbDiv.className = 'd-gallery__thumb';
    if (photos[1]) {
      const img = document.createElement('img');
      img.src = photos[1];
      img.alt = `${roomName} — foto 2`;
      img.loading = 'lazy';
      img.onerror = () => { thumbDiv.classList.add('d-gallery__item--skeleton'); };
      thumbDiv.appendChild(img);
      thumbDiv.appendChild(buildOverlay());
      thumbDiv.dataset.photoIndex = '1';
      thumbDiv.tabIndex = 0;
      thumbDiv.setAttribute('role', 'button');
      thumbDiv.setAttribute('aria-label', `Abrir visor — Foto 2 de ${photos.length}`);
      thumbDiv.addEventListener('click', () => openLightbox(1));
      thumbDiv.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(1); }
      });
    } else {
      thumbDiv.classList.add('d-gallery__item--skeleton');
    }
    elGalleryMosaic.appendChild(thumbDiv);

    /* Tour tile */
    const tourDiv = document.createElement('div');
    tourDiv.className = 'd-gallery__thumb d-tour-tile';
    tourDiv.setAttribute('aria-label', 'Recorrido virtual 360° — próximamente');
    tourDiv.innerHTML = `
      <div class="d-tour-tile__inner">
        <span class="material-symbols-outlined d-tour-tile__icon" aria-hidden="true">globe</span>
        <p class="d-tour-tile__label">Recorrido 360°</p>
        <p class="d-tour-tile__sub">Matterport próximamente</p>
        <span class="d-tour-tile__badge">Próximamente</span>
      </div>
    `;
    elGalleryMosaic.appendChild(tourDiv);

    /* Actualizar botón "Ver todas" */
    if (elGalleryAllBtn && photos.length) {
      const txt = elGalleryAllBtn.childNodes[elGalleryAllBtn.childNodes.length - 1];
      if (txt && txt.nodeType === 3) {
        txt.textContent = ` Ver todas las fotos (${photos.length})`;
      }
    }
  }

  function buildOverlay() {
    const ov = document.createElement('div');
    ov.className = 'd-gallery__overlay';
    ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = `
      <div class="d-gallery__overlay-icon">
        <span class="material-symbols-outlined">search</span>
      </div>
    `;
    return ov;
  }

  /* ══════════════════════════════════════════════
     LIGHTBOX
  ══════════════════════════════════════════════ */
  function initLightbox() {
    if (!elLb) return;
    elLbClose    && elLbClose.addEventListener('click', closeLightbox);
    elLbBackdrop && elLbBackdrop.addEventListener('click', closeLightbox);
    elLbPrev     && elLbPrev.addEventListener('click', prevPhoto);
    elLbNext     && elLbNext.addEventListener('click', nextPhoto);
    document.addEventListener('keydown', onLbKey);
  }

  function openLightbox(index) {
    if (!elLb || photoURLs.length === 0) return;
    lbIndex = clamp(index, 0, photoURLs.length - 1);
    renderLbPhoto();
    elLb.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    elLbClose && elLbClose.focus();
  }

  function closeLightbox() {
    if (!elLb) return;
    elLb.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function prevPhoto() {
    lbIndex = (lbIndex - 1 + photoURLs.length) % photoURLs.length;
    renderLbPhoto();
  }

  function nextPhoto() {
    lbIndex = (lbIndex + 1) % photoURLs.length;
    renderLbPhoto();
  }

  function renderLbPhoto() {
    const src = photoURLs[lbIndex] || '';
    if (elLbImg) {
      elLbImg.src = src;
      elLbImg.alt = (currentRoom ? currentRoom.nombre : 'Habitación') + ` — foto ${lbIndex + 1}`;
    }
    if (elLbCounter) elLbCounter.textContent = `${lbIndex + 1} / ${photoURLs.length}`;
    if (elLbCaption) elLbCaption.textContent = currentRoom ? currentRoom.nombre : '';
  }

  function onLbKey(e) {
    if (elLb && !elLb.hasAttribute('hidden')) {
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft')  prevPhoto();
    }
  }

  /* ══════════════════════════════════════════════
     OTROS CUARTOS CARD
  ══════════════════════════════════════════════ */
  function buildOtherCard(room) {
    const isAvailable = room.status === 'available';
    const imagenes    = Array.isArray(room.imagenes) ? room.imagenes : [];
    const amenities   = Array.isArray(room.amenities) ? room.amenities : [];
    const foto        = imagenes[0] ? fixPath(imagenes[0]) : '';

    const precio     = fmtPrecio(room.precio_min, room.precio_max);
    const ctaCls     = isAvailable ? '' : 'd-other-card__cta--outline';
    const ctaTxt     = isAvailable ? 'Ver cuarto' : 'Avisarme cuando esté libre';
    const hasBano    = amenities.includes('bano_privado');

    const article = document.createElement('article');
    article.className = 'd-other-card';
    article.setAttribute('role', 'listitem');
    article.setAttribute('aria-labelledby', `other-${room.id}`);

    article.innerHTML = `
      <div class="d-other-card__photo">
        ${foto
          ? `<img src="${foto}" alt="${room.nombre}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'d-other-card__photo-placeholder\\'></div>'">`
          : '<div class="d-other-card__photo-placeholder"></div>'
        }
        <span class="d-other-card__badge">${room.nombre}</span>
      </div>
      <div class="d-other-card__body">
        <div class="d-other-card__top">
          <div>
            <h3 class="d-other-card__name" id="other-${room.id}">${room.nombre}</h3>
            <p class="d-other-card__zona">${room.zona ? room.zona + ' · CDMX' : 'Narvarte · CDMX'}</p>
          </div>
          <div>
            <span class="d-other-card__price">${precio}</span>
            <span class="d-other-card__price-note">/mes</span>
          </div>
        </div>
        <div class="d-other-card__meta">
          ${room.metros_cuadrados ? `
          <span class="d-other-card__meta-item">
            <span class="material-symbols-outlined" aria-hidden="true">square_foot</span>
            ${room.metros_cuadrados} m²
          </span>` : ''}
          ${room.piso ? `
          <span class="d-other-card__meta-item">
            <span class="material-symbols-outlined" aria-hidden="true">layers</span>
            Piso ${room.piso}
          </span>` : ''}
          <span class="d-other-card__meta-item">
            <span class="material-symbols-outlined" aria-hidden="true">${hasBano ? 'bathtub' : 'shower'}</span>
            ${hasBano ? 'Baño privado' : 'Baño compartido'}
          </span>
        </div>
        <a href="/pages/detalle-habitacion.html?id=${room.id}"
           class="d-other-card__cta ${ctaCls}">
          ${ctaTxt}
        </a>
      </div>
    `;

    // Reveal animation
    article.style.opacity = '0';
    article.style.transform = 'translateY(16px)';
    article.style.transition = 'opacity 380ms ease, transform 380ms ease';

    return article;
  }

  /* ══════════════════════════════════════════════
     ERROR
  ══════════════════════════════════════════════ */
  function showError(msg) {
    if (elDetailLoading) elDetailLoading.hidden = true;
    if (elDetailLayout)  elDetailLayout.hidden  = true;
    if (elDetailError)   {
      elDetailError.hidden = false;
      const msgEl = document.getElementById('errorMsg');
      if (msgEl) msgEl.textContent = msg;
    }
  }

  /* ══════════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════════ */
  function fixPath(path) {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('//')) return path;
    let p = path.startsWith('/') ? path.substring(1) : path;
    p = p.startsWith('./') ? p.substring(2) : p;
    return p.startsWith('assets/') ? '../' + p : path;
  }

  function fmtPrecio(min, max) {
    const fmt = n => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
    if (min && max && min !== max) return `${fmt(min)}–${fmt(max)}`;
    return fmt(min || max || 0);
  }

  function fmtFecha(iso) {
    if (!iso) return '';
    try {
      return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch { return iso; }
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

}());
