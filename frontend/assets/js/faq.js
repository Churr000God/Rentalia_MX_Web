/* ════════════════════════════════════════════════════════════
   faq.js
   1. Carga FAQs desde faq_items (Supabase).
   2. Render acordeón con filtrado por categoría (sidebar + pills).
   3. Inyecta schema.org FAQPage para SEO.
   4. Gestiona el formulario de envío de pregunta (faq_preguntas_usuario).
════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_3Dew0GfB8vlUnItNfBm0Xw_5vMDArZM';

  /* ── Categorías fijas (key coincide con columna `categoria` en DB) ── */
  var cats = [
    {
      key: 'todas',
      label: 'Todas',
      iconPath: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'
    },
    {
      key: 'renta',
      label: 'La renta',
      iconPath: '<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>'
    },
    {
      key: 'contrato',
      label: 'Contrato y pagos',
      iconPath: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'
    },
    {
      key: 'convivencia',
      label: 'Convivencia',
      iconPath: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/>'
    },
    {
      key: 'casa',
      label: 'La casa',
      iconPath: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'
    }
  ];

  /* ── Estado ──────────────────────────────────────────────── */
  var allFaqs   = [];   // filas de Supabase mapeadas al shape de render
  var activeCat = 'todas';

  /* ── Helpers ─────────────────────────────────────────────── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function countFor(key) {
    return key === 'todas'
      ? allFaqs.length
      : allFaqs.filter(function (f) { return f.cat === key; }).length;
  }

  function makeCatIcon(path) {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      path + '</svg>';
  }

  /* ── Build accordion item HTML ───────────────────────────── */
  function makeItem(f, idx) {
    var bodyId = 'faq-body-' + idx;
    var btnId  = 'faq-btn-'  + idx;
    var confirmarHtml = f.confirmar
      ? '<p class="faq-confirmar">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>' +
          '</svg>' +
          'Esta pol\xedtica est\xe1 siendo confirmada por el equipo. Esch\xedbenos si necesitas m\xe1s detalle.' +
        '</p>'
      : '';
    return [
      '<div class="faq-item">',
        '<button class="faq-q" id="' + btnId + '" aria-expanded="false" aria-controls="' + bodyId + '">',
          esc(f.q),
          '<svg class="faq-chevron" viewBox="0 0 24 24" aria-hidden="true">',
            '<path d="M6 9l6 6 6-6"/>',
          '</svg>',
        '</button>',
        '<div class="faq-body" id="' + bodyId + '" role="region" aria-labelledby="' + btnId + '">',
          '<div class="faq-body__inner">',
            /* respuesta viene del admin: admite HTML basico (<strong>, <ul>) */
            '<div class="faq-a"><p>' + f.a + '</p>' + confirmarHtml + '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  /* ── Render sidebar (desktop) ─────────────────────────────── */
  function renderSidebar() {
    var list = document.getElementById('sidebarCatList');
    if (!list) return;
    list.innerHTML = cats.map(function (c) {
      var isActive = c.key === activeCat;
      return [
        '<button class="sidebar-cat-btn' + (isActive ? ' is-active' : '') + '"',
          ' data-cat="' + c.key + '"',
          ' role="listitem"',
          ' aria-pressed="' + isActive + '">',
          '<span class="sidebar-cat-btn__icon">' + makeCatIcon(c.iconPath) + '</span>',
          esc(c.label),
          '<span class="sidebar-cat-btn__count">' + countFor(c.key) + '</span>',
        '</button>'
      ].join('');
    }).join('');
    bindCatBtns('.sidebar-cat-btn');
  }

  /* ── Render mobile pills ──────────────────────────────────── */
  function renderMobilePills() {
    var inner = document.querySelector('.mobile-filter__inner');
    if (!inner) return;
    inner.innerHTML = cats.map(function (c) {
      return '<button class="cat-pill' + (c.key === activeCat ? ' is-active' : '') + '"' +
        ' data-cat="' + c.key + '" role="listitem" aria-pressed="' + (c.key === activeCat) + '">' +
        esc(c.label) + '</button>';
    }).join('');
    bindCatBtns('.cat-pill');
  }

  /* ── Bind category buttons ───────────────────────────────── */
  function bindCatBtns(selector) {
    document.querySelectorAll(selector).forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCat = btn.dataset.cat;
        renderSidebar();
        renderMobilePills();
        renderFAQs();
        updateMeta();
      });
    });
  }

  /* ── Update header counter ───────────────────────────────── */
  function updateMeta() {
    var n = activeCat === 'todas'
      ? allFaqs.length
      : allFaqs.filter(function (f) { return f.cat === activeCat; }).length;
    var el = document.getElementById('faqMetaCount');
    if (el) el.textContent = n;
  }

  /* ── Render FAQ main area ────────────────────────────────── */
  function renderFAQs() {
    var main = document.getElementById('faqMain');
    if (!main) return;

    if (!allFaqs.length) {
      main.innerHTML = '<div class="faq-empty is-visible">' +
        'Cargando preguntas… si esto tarda, ' +
        '<a href="https://wa.me/521XXXXXXXXXX" target="_blank" rel="noopener noreferrer">esch\xedbenos</a>.' +
        '</div>';
      return;
    }

    var html;
    if (activeCat === 'todas') {
      /* Agrupado por categor\xeda */
      html = cats.slice(1).map(function (c) {
        var items = allFaqs.filter(function (f) { return f.cat === c.key; });
        if (!items.length) return '';
        return [
          '<div class="faq-group">',
            '<h2 class="faq-group__heading">',
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"',
              ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
              c.iconPath,
              '</svg>',
              esc(c.label),
            '</h2>',
            '<div class="faq-list" role="list">',
              items.map(function (f, i) {
                return makeItem(f, c.key + '-' + i);
              }).join(''),
            '</div>',
          '</div>'
        ].join('');
      }).join('');
    } else {
      /* Lista plana de la categor\xeda activa */
      var meta  = cats.find(function (c) { return c.key === activeCat; });
      var items = allFaqs.filter(function (f) { return f.cat === activeCat; });
      if (items.length) {
        html = [
          '<div class="faq-cat-label">',
            '<svg class="faq-cat-label__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"',
            ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
            meta.iconPath,
            '</svg>',
            '<span class="faq-cat-label__text">' + esc(meta.label) + '</span>',
            '<span class="faq-cat-label__count">' + items.length + '</span>',
          '</div>',
          '<div class="faq-list" role="list">',
            items.map(function (f, i) { return makeItem(f, activeCat + '-' + i); }).join(''),
          '</div>'
        ].join('');
      } else {
        html = '<div class="faq-empty is-visible">No hay preguntas en esta categor\xeda por ahora. ' +
          '<a href="https://wa.me/521XXXXXXXXXX" target="_blank" rel="noopener noreferrer">Esch\xedbenos</a> ' +
          'si tienes alguna duda.</div>';
      }
    }

    main.innerHTML = html;
    bindAccordion();
  }

  /* ── Accordion ───────────────────────────────────────────── */
  function bindAccordion() {
    var btns = Array.from(document.querySelectorAll('.faq-q'));
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        var body = document.getElementById(btn.getAttribute('aria-controls'));
        if (!body) return;
        btn.setAttribute('aria-expanded', String(!expanded));
        body.classList.toggle('is-open', !expanded);
      });
      /* Navegaci\xf3n con teclado */
      btn.addEventListener('keydown', function (e) {
        var all = Array.from(document.querySelectorAll('.faq-q'));
        var idx = all.indexOf(btn);
        if (e.key === 'ArrowDown') { e.preventDefault(); if (all[idx + 1]) all[idx + 1].focus(); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); if (all[idx - 1]) all[idx - 1].focus(); }
      });
    });
  }

  /* ── Schema.org FAQPage ──────────────────────────────────── */
  function injectSchema() {
    if (!allFaqs.length) return;
    var schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': allFaqs.map(function (f) {
        return {
          '@type': 'Question',
          'name': f.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.a.replace(/<[^>]+>/g, '')
          }
        };
      })
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  }

  /* ── Formulario de env\xedo de pregunta ─────────────────────── */
  function initForm(db) {
    var form   = document.getElementById('preguntaForm');
    var submit = document.getElementById('fqSubmit');
    var msg    = document.getElementById('fqMsg');
    if (!form || !db) return;

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nombre   = document.getElementById('fqNombre').value.trim();
      var email    = document.getElementById('fqEmail').value.trim();
      var pregunta = document.getElementById('fqPregunta').value.trim();

      /* Validaci\xf3n b\xe1sica */
      if (!nombre || !email || !pregunta) {
        showMsg('Por favor completa todos los campos.', false);
        return;
      }
      if (!EMAIL_RE.test(email)) {
        showMsg('Ingresa un correo v\xe1lido.', false);
        return;
      }

      submit.disabled = true;
      submit.textContent = 'Enviando…';
      if (msg) msg.hidden = true;

      db.from('faq_preguntas_usuario')
        .insert([{ nombre: nombre, email: email, pregunta: pregunta }])
        .then(function (res) {
          submit.disabled = false;
          submit.textContent = 'Enviar pregunta';
          if (res.error) {
            showMsg('Hubo un error al enviar. Int\xe9ntalo de nuevo o esc\xedbenos por WhatsApp.', false);
          } else {
            form.reset();
            showMsg('\xa1Listo! Recibimos tu pregunta. Te responderemos pronto.', true);
          }
        });
    });

    function showMsg(text, ok) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = 'faq-form-msg ' + (ok ? 'faq-form-msg--ok' : 'faq-form-msg--err');
      msg.hidden = false;
    }
  }

  /* ── INIT ────────────────────────────────────────────────── */
  if (typeof supabase === 'undefined') return;

  var db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  /* Carga FAQs activas ordenadas */
  db.from('faq_items')
    .select('categoria,pregunta,respuesta,orden,por_confirmar')
    .eq('activo', true)
    .order('orden')
    .then(function (res) {
      if (res.data && res.data.length) {
        allFaqs = res.data.map(function (row) {
          return {
            cat:       row.categoria,
            q:         row.pregunta,
            a:         row.respuesta,   /* puede contener HTML basico del admin */
            confirmar: !!row.por_confirmar
          };
        });
      }
      /* Render inicial */
      renderSidebar();
      renderMobilePills();
      renderFAQs();
      updateMeta();
      injectSchema();
    });

  /* Inicializa formulario de env\xedo */
  initForm(db);

}());
