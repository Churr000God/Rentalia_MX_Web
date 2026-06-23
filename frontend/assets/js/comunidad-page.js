/* ════════════════════════════════════════════════════════════
   comunidad-page.js — /pages/comunidad.html
   - Todas las secciones dinámicas desde Supabase:
     galería, testimonios, pilares, eventos, cuidamos, textos.
   - Fallback inmediato con placeholders mientras carga.
════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_3Dew0GfB8vlUnItNfBm0Xw_5vMDArZM';

  /* ── Helpers ─────────────────────────────────────────────── */
  function qs(sel) { return document.querySelector(sel); }
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function ico(path, sz, stroke) {
    sz = sz || 19; stroke = stroke || 'currentColor';
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="' + stroke + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }

  /* ════════════════════════════════════════════════════════
     DICCIONARIO DE ICONOS CURADOS (nombre → SVG path)
     Compartido con el admin para preview.
  ════════════════════════════════════════════════════════ */
  var ICONOS = {
    usuarios:   '<circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/>',
    corazon:    '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
    estrella:   '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    chef:       '<path d="M3 11l19-9-9 19-2-8-8-2z"/>',
    cine:       '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
    cafe:       '<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/>',
    idiomas:    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20M2 12h20"/>',
    casa:       '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    escudo:     '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    chat:       '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
    documento:  '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    mapa:       '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>',
    chispa:     '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
  };

  /* Icono por defecto si la clave no existe */
  var ICONO_DEFAULT = '<circle cx="12" cy="12" r="10"/>';

  function icoNamed(nombre, sz, stroke) {
    var path = ICONOS[nombre] || ICONO_DEFAULT;
    return ico(path, sz, stroke);
  }

  /* Mapeo de color → estilos visuales para eventos */
  var COLOR_MAP = {
    selva: { bg: 'rgba(30,77,60,.15)',  stroke: '#1E4D3C' },
    barro: { bg: 'rgba(94,50,22,.15)',  stroke: '#BC6B43' },
  };

  /* ── Gradient fallbacks para galería vacía ─────────────── */
  var GRADIENTES = [
    { cls: 'gp-a gal-item--tall', alt: 'Sobremesa · Cocina', label: 'Cocina' },
    { cls: 'gp-b',                alt: 'La terraza',         label: 'Terraza' },
    { cls: 'gp-c',                alt: 'Café del domingo',   label: 'Café' },
    { cls: 'gp-d gal-item--tall', alt: 'Noche de cocina',    label: 'Cocina' },
    { cls: 'gp-e',                alt: 'La sala',            label: 'Sala' },
  ];

  /* ════════════════════════════════════════════════════════
     LIGHTBOX
  ════════════════════════════════════════════════════════ */
  var lbData = [];
  var lbCur  = 0;
  var lastFocus = null;
  var lb       = qs('#lightbox');
  var lbPhoto  = qs('#lbPhoto');
  var lbCap    = qs('#lbCaption');
  var lbCnt    = qs('#lbCounter');

  function openLB(i) {
    if (!lbData.length) return;
    lbCur = ((i % lbData.length) + lbData.length) % lbData.length;
    lastFocus = document.activeElement;
    renderLB();
    lb.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    qs('#lbClose').focus();
  }
  function closeLB() {
    lb.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  function renderLB() {
    var f = lbData[lbCur];
    lbCnt.textContent = (lbCur + 1) + ' / ' + lbData.length;
    lbCap.textContent = f.caption || f.alt || '';
    if (f.url) {
      lbPhoto.innerHTML = '<img src="' + esc(f.url) + '" alt="' + esc(f.alt || '') + '">';
    } else {
      lbPhoto.innerHTML = '<div class="' + f.cls + '" style="width:100%;height:100%"></div>';
    }
  }

  if (lb) {
    qs('#lbClose').addEventListener('click', closeLB);
    qs('#lbBg').addEventListener('click', closeLB);
    qs('#lbNext').addEventListener('click', function () { lbCur = (lbCur + 1) % lbData.length; renderLB(); });
    qs('#lbPrev').addEventListener('click', function () { lbCur = (lbCur - 1 + lbData.length) % lbData.length; renderLB(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hasAttribute('hidden')) return;
      if (e.key === 'Escape')     closeLB();
      if (e.key === 'ArrowRight') { lbCur = (lbCur + 1) % lbData.length; renderLB(); }
      if (e.key === 'ArrowLeft')  { lbCur = (lbCur - 1 + lbData.length) % lbData.length; renderLB(); }
    });
  }

  /* ════════════════════════════════════════════════════════
     RENDER — Secciones dinámicas
  ════════════════════════════════════════════════════════ */

  /* Pilares */
  function renderPilares(items) {
    var g = qs('#pilaresGrid');
    if (!g) return;
    if (!items || !items.length) { g.innerHTML = ''; return; }
    g.innerHTML = items.map(function (p) {
      return '<div class="pilar" role="listitem">' +
        '<div class="pilar__icon" aria-hidden="true">' + icoNamed(p.icono, 22) + '</div>' +
        '<p class="pilar__name">' + esc(p.nombre) + '</p>' +
        '<p class="pilar__desc">' + esc(p.descripcion) + '</p>' +
        '</div>';
    }).join('');
  }

  /* Eventos */
  function renderEventos(items) {
    var g = qs('#eventosGrid');
    if (!g) return;
    if (!items || !items.length) { g.innerHTML = ''; return; }
    g.innerHTML = items.map(function (e) {
      var c = COLOR_MAP[e.color] || COLOR_MAP.selva;
      var conf = e.por_confirmar
        ? '<p class="ev-confirmar">' + ico('<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>', 9) + ' Por confirmar</p>'
        : '';
      return '<article class="ev-card" role="listitem">' +
        '<div class="ev-card__icon-wrap" style="background:' + c.bg + '">' + icoNamed(e.icono, 20, c.stroke) + '</div>' +
        '<h3 class="ev-card__name">' + esc(e.nombre) + '</h3>' +
        '<p class="ev-card__desc">' + esc(e.descripcion) + '</p>' +
        (e.tiempo ? '<p class="ev-card__time">' + ico('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>', 10) + ' ' + esc(e.tiempo) + '</p>' : '') +
        conf + '</article>';
    }).join('');
  }

  /* Cómo cuidamos */
  function renderCuida(items) {
    var g = qs('#cuidaGrid');
    if (!g) return;
    if (!items || !items.length) { g.innerHTML = ''; return; }
    g.innerHTML = items.map(function (c) {
      return '<div class="cuida-item" role="listitem">' +
        '<div class="cuida-item__icon" aria-hidden="true">' + icoNamed(c.icono) + '</div>' +
        '<div><h3 class="cuida-item__title">' + esc(c.titulo) + '</h3>' +
        '<p class="cuida-item__desc">' + esc(c.descripcion) + '</p></div>' +
        '</div>';
    }).join('');
  }

  /* Galería */
  function renderGaleriaPlaceholder() {
    var g = qs('#galGrid');
    if (!g) return;
    lbData = GRADIENTES.map(function (f) { return { url: null, alt: f.alt, caption: f.label, cls: f.cls.split(' ')[0] }; });
    g.innerHTML = GRADIENTES.map(function (f, i) {
      return '<div class="gal-item ' + f.cls + '" tabindex="0" role="button" data-idx="' + i + '" aria-label="' + esc(f.alt) + '">' +
        '<div class="gal-fill ' + f.cls.split(' ')[0] + '"><span class="gal-label">' + esc(f.label) + '</span></div>' +
        '<div class="gal-overlay" aria-hidden="true"><div class="gal-zoom">' + ico('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>', 16) + '</div></div>' +
        '</div>';
    }).join('');
    attachGalEvents();
  }

  function renderGaleria(items) {
    var g = qs('#galGrid');
    if (!g) return;
    if (!items || !items.length) { renderGaleriaPlaceholder(); return; }
    lbData = items.map(function (it) { return { url: it.imagen_url, alt: it.alt_text || it.caption || '', caption: it.caption || it.alt_text || '' }; });
    var gradClasses = ['gp-a', 'gp-b', 'gp-c', 'gp-d', 'gp-e'];
    g.innerHTML = items.map(function (it, i) {
      var isTall  = i === 0 || i === 3;
      var fb      = gradClasses[i % gradClasses.length];
      var imgHtml = it.imagen_url
        ? '<img src="' + esc(it.imagen_url) + '" alt="' + esc(it.alt_text || '') + '" loading="lazy" onerror="this.style.display=\'none\'">'
        : '';
      return '<div class="gal-item' + (isTall ? ' gal-item--tall' : '') + ' ' + fb + '" tabindex="0" role="button" data-idx="' + i + '" aria-label="' + esc(it.alt_text || it.caption || 'Foto ' + (i + 1)) + '">' +
        '<div class="gal-fill">' + imgHtml + '<span class="gal-label">' + esc(it.caption || '') + '</span></div>' +
        '<div class="gal-overlay" aria-hidden="true"><div class="gal-zoom">' + ico('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>', 16) + '</div></div>' +
        '</div>';
    }).join('');
    attachGalEvents();
  }

  function attachGalEvents() {
    document.querySelectorAll('.gal-item[data-idx]').forEach(function (el) {
      el.addEventListener('click', function () { openLB(+el.dataset.idx); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(+el.dataset.idx); } });
    });
  }

  /* Testimonios */
  function renderTestimonios(items) {
    var g = qs('#testimoniosGrid');
    if (!g) return;
    if (!items || !items.length) {
      g.innerHTML = '<p class="test-empty">Próximamente — testimonios de nuestros residentes.</p>';
      return;
    }
    g.innerHTML = items.map(function (t) {
      var inicial = (t.nombre || '?')[0].toUpperCase();
      var avatar = t.foto_url
        ? '<img src="' + esc(t.foto_url) + '" alt="' + esc(t.nombre) + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'">' +
          '<span class="test-avatar__initial" style="display:none">' + esc(inicial) + '</span>'
        : '<span class="test-avatar__initial">' + esc(inicial) + '</span>';
      return '<article class="test-card" role="listitem">' +
        '<div class="test-avatar" aria-hidden="true">' + avatar + '</div>' +
        '<p class="test-quote">"' + esc(t.texto) + '"</p>' +
        '<p class="test-name">' + esc(t.nombre) + '</p>' +
        (t.detalle ? '<p class="test-role">' + esc(t.detalle) + '</p>' : '') +
        '</article>';
    }).join('');
  }

  /* ════════════════════════════════════════════════════════
     TEXTOS dinámicos (site_config)
  ════════════════════════════════════════════════════════ */
  function injectTextos(rows) {
    var map = {};
    (rows || []).forEach(function (r) { map[r.key] = r.value || ''; });
    function set(id, val) { var el = qs('#' + id); if (el && val) el.textContent = val; }

    /* Hero */
    set('comunidadEyebrow', map['comunidad_eyebrow']);
    set('comunidadSub',     map['comunidad_sub']);
    var h1 = qs('#hero-h1'); if (h1 && map['comunidad_h1']) h1.textContent = map['comunidad_h1'];

    /* Galería y testimonios */
    set('gal-h2',  map['comunidad_galeria_titulo']);
    set('test-h2', map['comunidad_testimonios_titulo']);

    /* CTA banda */
    var ctat = qs('#cta-comunidad-h2');
    if (ctat && map['comunidad_cta_titulo']) ctat.innerHTML = map['comunidad_cta_titulo'];
    set('ctaTexto', map['comunidad_cta_texto']);

    /* Eventos */
    set('eventosEyebrow', map['comunidad_eventos_eyebrow']);
    set('ev-h2',          map['comunidad_eventos_titulo']);

    /* Cómo cuidamos */
    set('cuidaEyebrow', map['comunidad_cuida_eyebrow']);
    set('cuida-h2',     map['comunidad_cuida_titulo']);

    /* Narvarte afuera */
    set('connEyebrow', map['comunidad_conn_eyebrow']);
    set('conn-h2',     map['comunidad_conn_titulo']);
    set('connTexto',   map['comunidad_conn_texto']);

    /* Enlace */
    var linkEl = qs('#connLink');
    if (linkEl) {
      if (map['comunidad_conn_link_url']) linkEl.href = map['comunidad_conn_link_url'];
    }
    set('connLinkText', map['comunidad_conn_link_text']);

    /* Fotos de Narvarte */
    function setFoto(elId, url, alt) {
      var el = qs('#' + elId);
      if (!el) return;
      if (url) {
        el.innerHTML = '<img src="' + esc(url) + '" alt="' + esc(alt || '') +
          '" style="width:100%;height:100%;object-fit:cover" loading="lazy" onerror="this.style.display=\'none\'">';
      }
      if (alt) el.setAttribute('aria-label', alt);
    }
    setFoto('connFoto1', map['comunidad_conn_foto1_url'], map['comunidad_conn_foto1_alt']);
    setFoto('connFoto2', map['comunidad_conn_foto2_url'], map['comunidad_conn_foto2_alt']);
  }

  /* ════════════════════════════════════════════════════════
     SCROLL FADE-IN
  ════════════════════════════════════════════════════════ */
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-up').forEach(function (el) { obs.observe(el); });

  /* ════════════════════════════════════════════════════════
     INIT — carga Supabase
  ════════════════════════════════════════════════════════ */
  function init() {
    /* Placeholders inmediatos para evitar parpadeo */
    renderGaleriaPlaceholder();
    renderTestimonios([]);

    if (typeof supabase === 'undefined') return;
    var db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    var TEXT_KEYS = [
      'comunidad_eyebrow', 'comunidad_h1', 'comunidad_sub',
      'comunidad_galeria_titulo', 'comunidad_testimonios_titulo',
      'comunidad_cta_titulo', 'comunidad_cta_texto',
      'comunidad_eventos_eyebrow', 'comunidad_eventos_titulo',
      'comunidad_cuida_eyebrow', 'comunidad_cuida_titulo',
      'comunidad_conn_eyebrow', 'comunidad_conn_titulo', 'comunidad_conn_texto',
      'comunidad_conn_link_text', 'comunidad_conn_link_url',
      'comunidad_conn_foto1_url', 'comunidad_conn_foto1_alt',
      'comunidad_conn_foto2_url', 'comunidad_conn_foto2_alt',
    ];

    Promise.all([
      db.from('site_config').select('key, value').in('key', TEXT_KEYS),
      db.from('comunidad_galeria').select('imagen_url, alt_text, caption, orden')
        .eq('activo', true).order('orden', { ascending: true }),
      db.from('comunidad_testimonios').select('nombre, detalle, foto_url, texto, rating, orden')
        .eq('activo', true).order('orden', { ascending: true }),
      db.from('comunidad_pilares').select('nombre, descripcion, icono, orden')
        .eq('activo', true).order('orden', { ascending: true }),
      db.from('comunidad_eventos').select('nombre, descripcion, icono, tiempo, color, por_confirmar, orden')
        .eq('activo', true).order('orden', { ascending: true }),
      db.from('comunidad_cuidamos').select('titulo, descripcion, icono, orden')
        .eq('activo', true).order('orden', { ascending: true }),
    ]).then(function (results) {
      injectTextos(results[0].data || []);
      renderGaleria(results[1].data || []);
      renderTestimonios(results[2].data || []);
      renderPilares(results[3].data || []);
      renderEventos(results[4].data || []);
      renderCuida(results[5].data || []);
    }).catch(function (err) {
      console.error('[comunidad-page] Error:', err);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
