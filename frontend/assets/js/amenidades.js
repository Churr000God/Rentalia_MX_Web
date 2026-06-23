/* ════════════════════════════════════════════════════════════
   amenidades.js
   1. Carga amenidades de la casa desde location_amenities.
   2. Carga fotos del barrio desde barrio_fotos.
   3. Carga y filtra lugares cercanos desde lugares_cercanos.
   4. Mapa interactivo Leaflet con pin de la casa + pines de lugares.
   5. Carga perfiles "Perfecto para ti" desde amenidades_perfiles.
   6. Hidrata textos/stats dinámicos desde site_config.
   Depende de: @supabase/supabase-js (CDN), Leaflet 1.9 (CDN).
════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_3Dew0GfB8vlUnItNfBm0Xw_5vMDArZM';

  if (typeof supabase === 'undefined') return;
  var db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  /* ── Categorías de lugares (estáticas — coinciden con CHECK en DB) ── */
  var catsMeta = [
    { key: 'todos',         label: 'Todos',          subtitle: 'Todo lo que necesitas, a unos pasos.',
      icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>' },
    { key: 'transporte',    label: 'Transporte',      subtitle: 'Conectado con toda la ciudad',
      icon: '<path d="M3 11l19-9-9 19-2-8-8-2z"/>' },
    { key: 'universidades', label: 'Universidades',   subtitle: 'Cerca del conocimiento',
      icon: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>' },
    { key: 'parques',       label: 'Parques',          subtitle: 'Aire libre a pasos',
      icon: '<path d="M17 8C8 10 5.9 16.17 3.82 22"/><path d="M9 3a9.87 9.87 0 016.34 5.5"/>' },
    { key: 'comer',         label: 'Comer y café',    subtitle: 'La sazón de Narvarte',
      icon: '<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/>' },
    { key: 'compras',       label: 'Compras',          subtitle: 'Todo lo que necesitas cerca',
      icon: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.98-1.68l1.62-10.32H6"/>' },
    { key: 'cultura',       label: 'Cultura y vida',  subtitle: 'Vivir más allá de la casa',
      icon: '<circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85"/>' }
  ];

  /* ── Estado ──────────────────────────────────────────────── */
  var todosLugares = [];
  var activeCat    = 'todos';
  var leafletMap   = null;

  /* ── Helpers ─────────────────────────────────────────────── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function svgIcon(path, sz) {
    sz = sz || 12;
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none"' +
      ' stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
      ' aria-hidden="true">' + path + '</svg>';
  }

  function catMeta(key) {
    return catsMeta.find(function (c) { return c.key === key; }) || catsMeta[0];
  }

  function setText(id, val) {
    if (!val) return;
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ════════════════════════════════════════════════════════════
     SECCIÓN 1 — AMENIDADES DE LA CASA
  ════════════════════════════════════════════════════════════ */
  function renderAmenidades(items) {
    var el = document.getElementById('amenList');
    if (!el) return;
    if (!items || !items.length) {
      el.innerHTML = '<div class="amen-loading">No hay amenidades disponibles.</div>';
      return;
    }
    el.innerHTML = items.map(function (a) {
      var badgeHtml = a.badge
        ? '<span class="amen-badge">' + esc(a.badge) + '</span>'
        : '';
      var descHtml = a.description
        ? '<p class="amen-row__desc">' + esc(a.description) + '</p>'
        : '';
      return [
        '<div class="amen-row" role="listitem">',
          '<div class="amen-row__icon" aria-hidden="true">',
            '<span class="material-symbols-outlined">' + esc(a.icon) + '</span>',
          '</div>',
          '<div class="amen-row__content">',
            '<div class="amen-row__top">',
              '<span class="amen-row__name">' + esc(a.label) + '</span>',
              badgeHtml,
            '</div>',
            descHtml,
          '</div>',
        '</div>'
      ].join('');
    }).join('');
  }

  /* ════════════════════════════════════════════════════════════
     SECCIÓN 2 — FOTOS DEL BARRIO
  ════════════════════════════════════════════════════════════ */
  function applyFotos(fotos) {
    if (!fotos || !fotos.length) return;
    var mosaic = document.getElementById('fotosMosaic');
    if (!mosaic) return;

    fotos.forEach(function (f) {
      var slot = mosaic.querySelector('.foto-slot:nth-child(' + f.slot + ')');
      if (!slot) return;
      if (f.photo_url) {
        slot.style.backgroundImage    = 'url("' + f.photo_url + '")';
        slot.style.backgroundSize     = 'cover';
        slot.style.backgroundPosition = 'center';
        slot.classList.remove('fp-a', 'fp-b', 'fp-c', 'fp-d', 'fp-e');
      }
      if (f.alt_text) slot.setAttribute('aria-label', f.alt_text);
      var caption = slot.querySelector('.foto-caption');
      if (caption && f.label) caption.textContent = f.label;
    });
  }

  /* ════════════════════════════════════════════════════════════
     SECCIÓN 3 — LUGARES CERCANOS
  ════════════════════════════════════════════════════════════ */
  function renderFilter() {
    var el = document.getElementById('lugaresFilter');
    if (!el) return;
    el.innerHTML = catsMeta.map(function (c) {
      var isActive = c.key === activeCat;
      return [
        '<button class="lcat' + (isActive ? ' is-active' : '') + '"',
          ' data-cat="' + c.key + '"',
          ' role="listitem"',
          ' aria-pressed="' + isActive + '">',
          svgIcon(c.icon, 12),
          esc(c.label),
        '</button>'
      ].join('');
    }).join('');

    el.querySelectorAll('.lcat').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCat = btn.dataset.cat;
        renderFilter();
        renderLugares();
      });
    });
  }

  function renderLugares() {
    var grid = document.getElementById('lugaresGrid');
    var lcN  = document.getElementById('lcN');
    var sub  = document.getElementById('lugaresSubtitle');
    if (!grid) return;

    var meta = catMeta(activeCat);
    var list = activeCat === 'todos'
      ? todosLugares
      : todosLugares.filter(function (l) { return l.categoria === activeCat; });

    if (lcN) lcN.textContent = list.length;
    if (sub && meta.subtitle) sub.textContent = meta.subtitle;

    if (!list.length) {
      grid.innerHTML = '<p style="color:rgba(34,31,26,.45);font-size:.9rem;grid-column:1/-1">No hay lugares en esta categoría por ahora.</p>';
      return;
    }

    grid.innerHTML = list.map(function (l) {
      var cm = catMeta(l.categoria);
      var confirmarHtml = l.por_confirmar
        ? '<p class="lugar-confirmar">' +
            '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>' +
            'Por confirmar' +
          '</p>'
        : '';
      return [
        '<article class="lugar-card" data-cat="' + esc(l.categoria) + '" role="listitem">',
          '<div class="lugar-card__visual">',
            '<span class="lugar-card__chip">' + svgIcon(cm.icon, 10) + esc(cm.label) + '</span>',
          '</div>',
          '<div class="lugar-card__body">',
            '<div class="lugar-card__top">',
              '<h3 class="lugar-card__name">' + esc(l.nombre) + '</h3>',
              '<span class="lugar-card__dist">',
                '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
                esc(l.distancia),
              '</span>',
            '</div>',
            '<p class="lugar-card__desc">' + esc(l.descripcion) + '</p>',
            confirmarHtml,
          '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  /* ════════════════════════════════════════════════════════════
     SECCIÓN 4 — MAPA LEAFLET
  ════════════════════════════════════════════════════════════ */
  function renderMapa(casa, lugares) {
    if (typeof L === 'undefined') return;
    var mapEl = document.getElementById('locationMap');
    if (!mapEl) return;
    if (!casa || !casa.lat || !casa.lng) return;

    if (leafletMap) { leafletMap.remove(); leafletMap = null; }

    leafletMap = L.map('locationMap', {
      center: [casa.lat, casa.lng],
      zoom: 15,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(leafletMap);

    L.circle([casa.lat, casa.lng], {
      radius: 80,
      color: '#143528', fillColor: '#1E4D3C', fillOpacity: 0.25, weight: 2,
    }).addTo(leafletMap).bindPopup(
      '<strong style="font-family:serif;color:#143528">Casa Rentalia</strong><br>' +
      '<span style="font-size:.8rem;color:#555">' + esc(casa.zona || 'Narvarte Poniente, CDMX') + '</span>'
    );

    var casaIcon = L.divIcon({
      className: '',
      html: '<div style="width:14px;height:14px;background:#E9A53A;border:3px solid #143528;border-radius:50%;box-shadow:0 2px 8px rgba(20,53,40,.5)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    L.marker([casa.lat, casa.lng], { icon: casaIcon })
      .addTo(leafletMap)
      .bindPopup('<strong style="font-family:serif;color:#143528">Casa Rentalia</strong>');

    if (lugares && lugares.length) {
      lugares.forEach(function (l) {
        if (!l.lat || !l.lng) return;
        var cm = catMeta(l.categoria);
        var pin = L.divIcon({
          className: '',
          html: '<div style="width:10px;height:10px;background:#8DA68F;border:2px solid #1E4D3C;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker([l.lat, l.lng], { icon: pin })
          .addTo(leafletMap)
          .bindPopup(
            '<strong style="font-size:.85rem;color:#143528">' + esc(l.nombre) + '</strong><br>' +
            '<span style="font-size:.75rem;color:#777">' + esc(cm.label) + ' · ' + esc(l.distancia) + '</span>'
          );
      });
    }
  }

  /* ════════════════════════════════════════════════════════════
     SECCIÓN 5 — PERFILES "PERFECTO PARA TI"
  ════════════════════════════════════════════════════════════ */
  function renderPerfiles(items) {
    var el = document.getElementById('perfilesList');
    if (!el || !items || !items.length) return;

    var slugCls   = { estudiantes: 'a', profesionistas: 'b', viajeros: 'c' };
    var slugColor = { estudiantes: 'var(--selva)', profesionistas: 'var(--barro)', viajeros: 'var(--selva)' };

    el.innerHTML = items.map(function (p) {
      var cls   = slugCls[p.slug]   || 'a';
      var color = slugColor[p.slug] || 'var(--selva)';
      var puntos = [];
      try {
        puntos = Array.isArray(p.puntos) ? p.puntos : JSON.parse(String(p.puntos));
      } catch (e) {}
      var liHtml = puntos.map(function (pt) {
        return '<li class="perfil-item">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>' +
          esc(String(pt)) + '</li>';
      }).join('');

      return [
        '<article class="perfil-card perfil-card--' + cls + '" role="listitem">',
          '<div class="perfil-card__header">',
            '<div class="perfil-card__icon" aria-hidden="true">',
              '<span class="material-symbols-outlined" style="font-size:22px;line-height:1;color:' + color + '">',
                esc(p.icono),
              '</span>',
            '</div>',
            '<span class="perfil-card__role">' + esc(p.role_label) + '</span>',
            '<h3 class="perfil-card__h3">' + esc(p.titulo) + '</h3>',
          '</div>',
          '<div class="perfil-card__body">',
            '<p class="perfil-card__p">' + esc(p.descripcion) + '</p>',
            '<ul class="perfil-list" role="list">' + liHtml + '</ul>',
          '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  /* ════════════════════════════════════════════════════════════
     SECCIÓN 6 — HIDRATACIÓN DE TEXTOS (site_config)
  ════════════════════════════════════════════════════════════ */
  function applyConfig(cfg) {
    /* Textos simples */
    var textMap = {
      'phEyebrow':    'amenidades_header_eyebrow',
      'page-h1':      'amenidades_header_h1',
      'phSub':        'amenidades_header_sub',
      'mapa-h2':      'amenidades_mapa_h2',
      'mapaP':        'amenidades_mapa_p',
      'perfiles-h2':  'amenidades_perfiles_h2',
      'perfilesSub':  'amenidades_perfiles_sub',
    };
    Object.keys(textMap).forEach(function (id) {
      setText(id, cfg[textMap[id]]);
    });

    /* Stats strip */
    try {
      if (cfg['amenidades_stats']) {
        var stats = JSON.parse(cfg['amenidades_stats']);
        var stripInner = document.querySelector('#statsStrip .stats-strip__inner');
        if (stripInner && stats.length) {
          stripInner.innerHTML = stats.map(function (s) {
            return '<div class="stat-item" role="listitem">' +
              '<span class="stat-item__num">'   + esc(String(s.num))   + '</span>' +
              '<span class="stat-item__label">' + esc(String(s.label)) + '</span>' +
              '</div>';
          }).join('');
        }
      }
    } catch (e) {}

    /* Mapa stats */
    try {
      if (cfg['amenidades_mapa_stats']) {
        var mapaStats = JSON.parse(cfg['amenidades_mapa_stats']);
        var mapaEl = document.getElementById('mapaStats');
        if (mapaEl && mapaStats.length) {
          mapaEl.innerHTML = mapaStats.map(function (s) {
            var labelHtml = String(s.label).split(/\\n|\n/).map(esc).join('<br>');
            return '<div class="mapa-stat" role="listitem">' +
              '<div class="mapa-stat__num">'   + esc(String(s.num)) + '</div>' +
              '<div class="mapa-stat__label">' + labelHtml           + '</div>' +
              '</div>';
          }).join('');
        }
      }
    } catch (e) {}
  }

  /* ════════════════════════════════════════════════════════════
     CARGA PARALELA DE DATOS
  ════════════════════════════════════════════════════════════ */
  Promise.all([
    /* 1. Amenidades de la casa */
    db.from('location_amenities')
      .select('id, label, description, icon, badge, category')
      .eq('active', true)
      .order('orden', { ascending: true }),

    /* 2. Fotos del barrio */
    db.from('barrio_fotos')
      .select('slot, label, photo_url, alt_text')
      .eq('active', true)
      .order('slot', { ascending: true }),

    /* 3. Lugares cercanos */
    db.from('lugares_cercanos')
      .select('id, categoria, nombre, distancia, descripcion, lat, lng, por_confirmar')
      .eq('activo', true)
      .order('orden', { ascending: true }),

    /* 4. Ubicación (Casa Narvarte para el mapa) */
    db.from('ubicaciones')
      .select('nombre, zona, lat, lng')
      .eq('activo', true)
      .order('orden', { ascending: true })
      .limit(1),

    /* 5. Perfiles "Perfecto para ti" */
    db.from('amenidades_perfiles')
      .select('slug, role_label, titulo, descripcion, puntos, icono')
      .eq('activo', true)
      .order('orden', { ascending: true }),

    /* 6. Textos dinámicos (site_config) */
    db.from('site_config')
      .select('key, value')
      .in('key', [
        'amenidades_header_eyebrow', 'amenidades_header_h1', 'amenidades_header_sub',
        'amenidades_stats',
        'amenidades_mapa_h2', 'amenidades_mapa_p', 'amenidades_mapa_stats',
        'amenidades_perfiles_h2', 'amenidades_perfiles_sub',
      ]),
  ]).then(function (results) {
    var amenRes     = results[0];
    var fotosRes    = results[1];
    var lugaresRes  = results[2];
    var ubicRes     = results[3];
    var perfilesRes = results[4];
    var configRes   = results[5];

    /* Config → hidratar primero para que los textos estáticos se actualicen */
    var cfg = {};
    if (!configRes.error && configRes.data) {
      configRes.data.forEach(function (r) { cfg[r.key] = r.value; });
    }
    applyConfig(cfg);

    /* Amenidades */
    if (!amenRes.error && amenRes.data) renderAmenidades(amenRes.data);

    /* Fotos */
    if (!fotosRes.error && fotosRes.data) applyFotos(fotosRes.data);

    /* Lugares */
    if (!lugaresRes.error && lugaresRes.data) todosLugares = lugaresRes.data;
    renderFilter();
    renderLugares();

    /* Mapa */
    var casa = (ubicRes.data && ubicRes.data.length) ? ubicRes.data[0] : null;
    renderMapa(casa, todosLugares);

    /* Perfiles */
    if (!perfilesRes.error && perfilesRes.data) renderPerfiles(perfilesRes.data);
  });

}());
