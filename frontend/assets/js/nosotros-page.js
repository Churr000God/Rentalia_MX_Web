/* ════════════════════════════════════════════════════════════
   nosotros-page.js — /pages/nosotros.html
   - Todas las secciones dinámicas desde Supabase:
     equipo, pilares (filosofía), valores y textos/fotos singleton.
   - Fallback inmediato con gradientes si la foto no está configurada.
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
     DICCIONARIO DE ICONOS CURADOS (mismo que comunidad-page.js)
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

  var ICONO_DEFAULT = '<circle cx="12" cy="12" r="10"/>';

  function icoNamed(nombre, sz, stroke) {
    var path = ICONOS[nombre] || ICONO_DEFAULT;
    return ico(path, sz, stroke);
  }

  /* Logo SVG del arco Rentalia (para avatares placeholder de equipo) */
  var LOGO_MONO = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M55 165 L55 92 A45 45 0 0 1 145 92 L145 165" fill="none" stroke="#F3EDE1" stroke-width="7" stroke-linecap="round"/>' +
    '<line x1="100" y1="165" x2="100" y2="96" stroke="#8DA68F" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M100 124 Q124 116 124 86 Q100 96 100 124 Z" fill="#E9A53A"/>' +
    '<path d="M100 138 Q74 128 74 100 Q100 110 100 138 Z" fill="#8DA68F"/>' +
    '</svg>';

  /* Gradientes rotativos para avatares sin foto */
  var AVATAR_GRADIENTS = ['gp-a', 'gp-e', 'gp-c', 'gp-b', 'gp-d'];

  /* ════════════════════════════════════════════════════════
     RENDER — Pilares (filosofía)
  ════════════════════════════════════════════════════════ */
  function renderPilares(items) {
    var g = qs('#pilaresGrid');
    if (!g) return;
    if (!items || !items.length) { g.innerHTML = ''; return; }
    g.innerHTML = items.map(function (p) {
      return '<li class="pilar" role="listitem">' +
        '<div class="pilar__icon" aria-hidden="true">' + icoNamed(p.icono, 22) + '</div>' +
        '<p class="pilar__name">' + esc(p.nombre) + '</p>' +
        '<p class="pilar__desc">' + esc(p.descripcion) + '</p>' +
        '</li>';
    }).join('');
  }

  /* ════════════════════════════════════════════════════════
     RENDER — Valores
  ════════════════════════════════════════════════════════ */
  function renderValores(items) {
    var g = qs('#valoresGrid');
    if (!g) return;
    if (!items || !items.length) { g.innerHTML = ''; return; }
    g.innerHTML = items.map(function (v) {
      return '<div class="valor-card" role="listitem">' +
        '<div class="valor-card__icon" aria-hidden="true">' + icoNamed(v.icono, 44) + '</div>' +
        '<h3 class="valor-card__name">' + esc(v.nombre) + '</h3>' +
        '<p class="valor-card__desc">' + esc(v.descripcion) + '</p>' +
        '</div>';
    }).join('');
  }

  /* ════════════════════════════════════════════════════════
     RENDER — Equipo
  ════════════════════════════════════════════════════════ */
  function renderEquipo(items) {
    var g = qs('#equipoGrid');
    if (!g) return;
    if (!items || !items.length) {
      g.innerHTML = '';
      return;
    }
    g.innerHTML = items.map(function (m, i) {
      var grad = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
      var avatarContent;
      if (m.foto_url) {
        /* Con foto real: imagen encima del gradiente */
        avatarContent =
          '<div class="team-avatar-fill ' + grad + '" aria-hidden="true">' +
            '<span class="team-avatar__mono">' + LOGO_MONO + '</span>' +
          '</div>' +
          '<img class="team-avatar__img" src="' + esc(m.foto_url) + '" alt="' + esc(m.nombre) + '" loading="lazy" onerror="this.style.display=\'none\'">';
      } else {
        /* Sin foto: gradiente + logo monograma */
        avatarContent =
          '<div class="team-avatar-fill ' + grad + '" role="img" aria-label="' + esc(m.nombre) + '">' +
            '<span class="team-avatar__mono">' + LOGO_MONO + '</span>' +
            '<span class="team-avatar__hint">Foto pendiente</span>' +
          '</div>';
      }
      return '<div class="team-card" role="listitem">' +
        '<div class="team-avatar">' + avatarContent + '</div>' +
        '<h3 class="team-card__name">' + esc(m.nombre) + '</h3>' +
        '<p class="team-card__role">' + esc(m.rol) + '</p>' +
        (m.bio ? '<p class="team-card__bio">' + esc(m.bio) + '</p>' : '') +
        '</div>';
    }).join('');
  }

  /* ════════════════════════════════════════════════════════
     TEXTOS dinámicos (site_config)
  ════════════════════════════════════════════════════════ */
  function injectTextos(rows) {
    var map = {};
    (rows || []).forEach(function (r) { map[r.key] = r.value || ''; });

    function set(id, val) {
      var el = qs('#' + id);
      if (el && val) el.textContent = val;
    }
    function setImg(imgId, url, wrapId, alt) {
      var img = qs('#' + imgId);
      if (img && url) { img.src = url; img.style.display = ''; }
      var wrap = qs('#' + wrapId);
      if (wrap && alt) wrap.setAttribute('aria-label', alt);
      if (img && alt) img.alt = alt;
    }

    /* Hero */
    set('nosotrosHeroPill',   map['nosotros_hero_pill']);
    set('nosotros-hero-h1',   map['nosotros_hero_h1']);
    set('nosotrosHeroSub',    map['nosotros_hero_sub']);
    set('nosotrosBadgeTitulo',map['nosotros_hero_badge_titulo']);
    set('nosotrosBadgeSub',   map['nosotros_hero_badge_sub']);
    setImg('nosotrosHeroFoto', map['nosotros_hero_foto_url'], 'heroFotoWrap', 'Interior de la Casa Rentalia');

    /* Historia */
    set('nosotrosHistTitulo', map['nosotros_hist_titulo']);
    set('nosotrosHistP1',     map['nosotros_hist_p1']);
    set('nosotrosHistP2',     map['nosotros_hist_p2']);
    set('nosotrosHistP3',     map['nosotros_hist_p3']);
    set('nosotrosHistQuote',  map['nosotros_hist_quote']);
    setImg('nosotrosHistFoto', map['nosotros_hist_foto_url'], 'histFotoWrap', 'Espacio de la Casa Narvarte');

    /* Filosofía */
    set('nosotrosFiloEyebrow', map['nosotros_filo_eyebrow']);
    /* tagline: tiene <em> — solo actualizar si es texto plano */
    var tagEl = qs('#nosotros-filo-h2');
    if (tagEl && map['nosotros_filo_tagline']) tagEl.textContent = map['nosotros_filo_tagline'];

    /* La Casa */
    set('nosotrosCasaEyebrow',         map['nosotros_casa_eyebrow']);
    set('nosotros-casa-h2',            map['nosotros_casa_titulo']);
    set('nosotrosCasaSub',             map['nosotros_casa_sub']);
    set('nosotrosCasaTexto',           map['nosotros_casa_texto']);
    set('nosotrosCasaStatUbicaciones', map['nosotros_casa_stat_ubicaciones']);
    set('nosotrosCasaStatHabitaciones',map['nosotros_casa_stat_habitaciones']);
    setImg('nosotrosCasaFoto1', map['nosotros_casa_foto1_url'], 'casaFoto1Wrap', map['nosotros_casa_foto1_alt']);
    setImg('nosotrosCasaFoto2', map['nosotros_casa_foto2_url'], 'casaFoto2Wrap', map['nosotros_casa_foto2_alt']);
    setImg('nosotrosCasaFoto3', map['nosotros_casa_foto3_url'], 'casaFoto3Wrap', map['nosotros_casa_foto3_alt']);
    setImg('nosotrosCasaFoto4', map['nosotros_casa_foto4_url'], 'casaFoto4Wrap', map['nosotros_casa_foto4_alt']);

    /* Valores */
    set('nosotrosValoresEyebrow', map['nosotros_valores_eyebrow']);
    set('nosotros-valores-h2',    map['nosotros_valores_titulo']);

    /* Equipo */
    set('nosotrosEquipoEyebrow', map['nosotros_equipo_eyebrow']);
    set('nosotros-equipo-h2',    map['nosotros_equipo_titulo']);
    set('nosotrosEquipoSub',     map['nosotros_equipo_sub']);

    /* Crece */
    set('nosotrosCreceEyebrow', map['nosotros_crece_eyebrow']);
    /* El h2 de crece tiene un <em> — actualizar el nodo de texto directamente */
    var creceH2 = qs('#nosotros-crece-h2');
    if (creceH2 && map['nosotros_crece_titulo']) {
      /* Preservar el <em> si el texto contiene "primer paso" */
      var em = creceH2.querySelector('em');
      creceH2.childNodes[0] && (creceH2.childNodes[0].textContent = 'Narvarte es el ');
      if (em) em.textContent = 'primer paso';
    }
    set('nosotrosCreceTexto', map['nosotros_crece_texto']);
    set('nosotrosCreceBadge', map['nosotros_crece_badge']);

    /* Bridge */
    set('nosotros-bridge-h2',  map['nosotros_bridge_titulo']);
    set('nosotrosBridgeTexto', map['nosotros_bridge_texto']);

    /* CTA */
    var ctaH2 = qs('#nosotros-cta-h2');
    if (ctaH2 && map['nosotros_cta_titulo']) {
      /* Mantener el <em> del CTA */
      var emCta = ctaH2.querySelector('em');
      if (emCta) {
        ctaH2.childNodes[0] && (ctaH2.childNodes[0].textContent = map['nosotros_cta_titulo'].replace(/\?.*$/, '?'));
      } else {
        ctaH2.textContent = map['nosotros_cta_titulo'];
      }
    }
    set('nosotrosCtaSub', map['nosotros_cta_sub']);
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
    if (typeof supabase === 'undefined') return;
    var db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    var TEXT_KEYS = [
      'nosotros_hero_pill', 'nosotros_hero_h1', 'nosotros_hero_sub',
      'nosotros_hero_foto_url',
      'nosotros_hero_badge_titulo', 'nosotros_hero_badge_sub',
      'nosotros_hist_titulo', 'nosotros_hist_p1', 'nosotros_hist_p2', 'nosotros_hist_p3',
      'nosotros_hist_foto_url', 'nosotros_hist_quote',
      'nosotros_filo_eyebrow', 'nosotros_filo_tagline',
      'nosotros_casa_eyebrow', 'nosotros_casa_titulo', 'nosotros_casa_sub', 'nosotros_casa_texto',
      'nosotros_casa_stat_ubicaciones', 'nosotros_casa_stat_habitaciones',
      'nosotros_casa_foto1_url', 'nosotros_casa_foto1_alt',
      'nosotros_casa_foto2_url', 'nosotros_casa_foto2_alt',
      'nosotros_casa_foto3_url', 'nosotros_casa_foto3_alt',
      'nosotros_casa_foto4_url', 'nosotros_casa_foto4_alt',
      'nosotros_valores_eyebrow', 'nosotros_valores_titulo',
      'nosotros_equipo_eyebrow', 'nosotros_equipo_titulo', 'nosotros_equipo_sub',
      'nosotros_crece_eyebrow', 'nosotros_crece_titulo', 'nosotros_crece_texto', 'nosotros_crece_badge',
      'nosotros_bridge_titulo', 'nosotros_bridge_texto',
      'nosotros_cta_titulo', 'nosotros_cta_sub',
    ];

    Promise.all([
      db.from('site_config').select('key, value').in('key', TEXT_KEYS),
      db.from('nosotros_pilares').select('nombre, descripcion, icono, orden')
        .eq('activo', true).order('orden', { ascending: true }),
      db.from('nosotros_valores').select('nombre, descripcion, icono, orden')
        .eq('activo', true).order('orden', { ascending: true }),
      db.from('nosotros_equipo').select('nombre, rol, bio, foto_url, orden')
        .eq('activo', true).order('orden', { ascending: true }),
    ]).then(function (results) {
      injectTextos(results[0].data || []);
      renderPilares(results[1].data || []);
      renderValores(results[2].data || []);
      renderEquipo(results[3].data || []);
    }).catch(function (err) {
      console.error('[nosotros-page] Error cargando contenido:', err);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
