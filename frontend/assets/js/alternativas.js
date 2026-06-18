/* alternativas.js — Catálogo de habitaciones con filtros y carga desde Supabase */
(function () {
  const SUPABASE_URL = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_3Dew0GfB8vlUnItNfBm0Xw_5vMDArZM';

  const AMENITIES = {
    wifi:            { label: 'Wifi',           icon: 'wifi' },
    bano_privado:    { label: 'Baño propio',     icon: 'bathtub' },
    amueblada:       { label: 'Amueblada',       icon: 'bed' },
    cocina:          { label: 'Cocina',          icon: 'cooking' },
    aire:            { label: 'Clima A/C',       icon: 'ac_unit' },
    lavadora:        { label: 'Lavadora',        icon: 'local_laundry_service' },
    estacionamiento: { label: 'Estacionamiento', icon: 'directions_car' },
    mascotas:        { label: 'Pet friendly',    icon: 'pets' },
    servicios:       { label: 'Servicios incl.', icon: 'bolt' },
    escritorio:      { label: 'Escritorio',      icon: 'desk' },
  };

  // ── Estado ───────────────────────────────────────
  const state = { precio: 'todos', estado: 'todos' };
  let allRooms = [];

  // ── DOM refs ─────────────────────────────────────
  const grid       = document.getElementById('roomsGrid');
  const counter    = document.getElementById('result-count');
  const clearBtn   = document.getElementById('clearFilters');
  const emptyState = document.getElementById('emptyState');
  const emptyClear = document.getElementById('emptyStateClear');

  // ── Filtros ───────────────────────────────────────
  document.querySelectorAll('.pill-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.filter;
      const value = btn.dataset.value;
      state[group] = value;
      btn.closest('.filter-pills').querySelectorAll('.pill-btn').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
      });
      renderVisible();
    });
  });

  [clearBtn, emptyClear].forEach((el) => {
    el?.addEventListener('click', () => {
      state.precio = 'todos';
      state.estado = 'todos';
      document.querySelectorAll('.pill-btn').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.value === 'todos');
      });
      renderVisible();
    });
  });

  // ── Helpers ───────────────────────────────────────
  function matchesPrecio(room, filtro) {
    if (filtro === 'todos') return true;
    const [lo, hi] = filtro.split('-').map(Number);
    const precio = room.precio_min ?? room.precio_max ?? 0;
    return precio >= lo && precio <= hi;
  }

  function matchesEstado(room, filtro) {
    if (filtro === 'todos') return true;
    if (filtro === 'disponible') return room.status === 'available';
    if (filtro === 'proximo')    return room.status === 'maintenance' || room.status === 'occupied';
    return true;
  }

  function fmtPrecio(min, max) {
    const fmt = (n) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
    if (min && max && min !== max) return `${fmt(min)}–${fmt(max)}`;
    return fmt(min || max || 0);
  }

  // ── Render ────────────────────────────────────────
  function renderVisible() {
    const visible = allRooms.filter(
      (r) => matchesPrecio(r, state.precio) && matchesEstado(r, state.estado)
    );

    const isDefault = state.precio === 'todos' && state.estado === 'todos';
    if (clearBtn) clearBtn.hidden = isDefault;

    if (counter) counter.textContent = visible.length;

    grid.innerHTML = '';

    if (visible.length === 0) {
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    visible.forEach((room, i) => {
      const card = buildCard(room);
      grid.appendChild(card);
      // Stagger reveal
      requestAnimationFrame(() => {
        setTimeout(() => card.classList.add('is-visible'), i * 80);
      });
    });
  }

  function buildCard(room) {
    const isAvailable = room.status === 'available';
    const imagenes = Array.isArray(room.imagenes) ? room.imagenes : [];
    const tags     = Array.isArray(room.tags)     ? room.tags     : [];
    const amenities = Array.isArray(room.amenities) ? room.amenities : [];

    const imgFront = imagenes[0] || '';
    const imgBack  = imagenes[1] || '';

    const badgeCls  = isAvailable ? 'badge-on' : 'badge-prox';
    const badgeTxt  = isAvailable ? 'Disponible' : 'Próximamente';
    const dotCls    = isAvailable ? 'dot-green' : 'dot-amber';
    const availTxt  = room.fecha_disponibilidad || (isAvailable ? 'Disponible ahora' : 'Próximamente');
    const ctaCls    = isAvailable ? 'room-card__cta--fill' : 'room-card__cta--outline';
    const ctaTxt    = isAvailable ? 'Ver cuarto' : 'Avisarme cuando esté libre';
    const slug      = (room.nombre || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

    const metaPiso = room.piso ? `
      <span class="meta-item">
        <svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/></svg>
        Piso ${room.piso}
      </span>` : '';

    const metaM2 = room.metros_cuadrados ? `
      <span class="meta-item">
        <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="2"/></svg>
        ${room.metros_cuadrados} m²
      </span>` : '';

    const amenHTML = amenities.slice(0, 5).map((slug) => {
      const a = AMENITIES[slug];
      if (!a) return '';
      return `<span class="amenity-icon" title="${a.label}">
        <span class="material-symbols-outlined">${a.icon}</span>
      </span>`;
    }).join('');

    const chipsHTML = tags.map((t) =>
      `<span class="chip">${t}</span>`
    ).join('');

    const arrowSvg = isAvailable ? `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>` : '';

    const article = document.createElement('article');
    article.className = 'room-card';
    article.dataset.precio = room.precio_min || room.precio_max || 0;
    article.dataset.estado = isAvailable ? 'disponible' : 'proximo';
    article.setAttribute('aria-labelledby', `card-${slug}`);

    article.innerHTML = `
      <div class="room-card__photo">
        ${imgFront ? `<img class="room-card__img room-card__img--front"
          src="${imgFront}" alt="${room.nombre}" loading="lazy">` : ''}
        ${imgBack  ? `<img class="room-card__img room-card__img--back"
          src="${imgBack}" alt="${room.nombre} — vista alternativa" loading="lazy">` : ''}
        <span class="room-card__pin" aria-label="${room.zona || 'Narvarte'}">
          <svg viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${room.zona || 'Narvarte'}
        </span>
        <span class="room-card__badge ${badgeCls}">${badgeTxt}</span>
      </div>

      <div class="room-card__body">
        <h2 class="room-card__name" id="card-${slug}">${room.nombre}</h2>

        <div class="room-card__meta">
          ${metaPiso}
          ${metaM2}
          <span class="meta-item">
            <svg viewBox="0 0 24 24"><path d="M4 12h16a2 2 0 010 4H4a2 2 0 010-4z"/><path d="M6 12V6a2 2 0 012-2h3"/></svg>
            Baño privado
          </span>
        </div>

        <div class="room-card__price-block">
          <span class="room-card__price">${fmtPrecio(room.precio_min, room.precio_max)}</span>
          <span class="room-card__price-note">/ mes · todo incluido</span>
        </div>

        <div class="room-card__avail">
          <span class="avail-dot ${dotCls}" aria-hidden="true"></span>
          ${availTxt}
        </div>

        ${amenHTML ? `<div class="room-card__amenities">${amenHTML}</div>` : ''}

        <div class="room-card__divider" aria-hidden="true"></div>

        ${chipsHTML ? `<div class="room-card__chips">${chipsHTML}</div>` : ''}

        <a href="/pages/detalle-habitacion.html?id=${room.id}"
           class="room-card__cta ${ctaCls}">
          ${ctaTxt} ${arrowSvg}
        </a>
      </div>
    `;

    return article;
  }

  // ── Carga desde Supabase ──────────────────────────
  async function load() {
    let db;
    try {
      db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
      console.error('Supabase no disponible:', e);
      grid.innerHTML = '';
      return;
    }

    const { data, error } = await db
      .from('habitaciones')
      .select('id, nombre, zona, tipo, status, precio_min, precio_max, imagenes, amenities, tags, piso, metros_cuadrados, fecha_disponibilidad, orden')
      .in('status', ['available', 'occupied', 'maintenance'])
      .order('orden', { ascending: true, nullsFirst: false });

    if (error || !data) {
      console.error('Error cargando habitaciones:', error);
      grid.innerHTML = '';
      return;
    }

    allRooms = data;
    renderVisible();
  }

  load();

  // ── Waitlist form ─────────────────────────────
  const waitlistForm = document.getElementById('waitlistForm');
  const waitlistMsg  = document.getElementById('waitlistMsg');

  waitlistForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('waitlist-email');
    const email = emailInput.value.trim();
    if (!email) return;

    const btn = waitlistForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando…';
    waitlistMsg.className = 'waitlist-card__note';
    waitlistMsg.textContent = '';

    let db;
    try {
      db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch {
      showMsg('error', 'No se pudo conectar. Intenta de nuevo.');
      btn.disabled = false; btn.textContent = 'Avisarme';
      return;
    }

    const { error } = await db
      .from('waitlist')
      .insert([{ email }]);

    if (error) {
      if (error.code === '23505') {
        showMsg('ok', '¡Ya estás en la lista! Te avisaremos pronto.');
      } else {
        showMsg('error', 'Algo salió mal. Intenta de nuevo.');
      }
    } else {
      showMsg('ok', '¡Listo! Te avisaremos en cuanto haya un nuevo cuarto disponible.');
      emailInput.value = '';
    }

    btn.disabled = false;
    btn.textContent = 'Avisarme';
  });

  function showMsg(type, text) {
    waitlistMsg.className = `waitlist-card__note waitlist-card__note--${type === 'ok' ? 'ok' : 'err'}`;
    waitlistMsg.textContent = text;
  }
})();
