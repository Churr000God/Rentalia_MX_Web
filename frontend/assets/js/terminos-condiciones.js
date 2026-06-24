/* ═══════════════════════════════════════════════════════════════
   terminos-condiciones.js
   · Carga datos legales desde Supabase (site_config)
   · Botón "Descargar PDF" → window.print()
   · IntersectionObserver → resalta enlace activo en el TOC
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Descargar PDF ──────────────────────────────────────────── */
  var btn = document.getElementById('downloadPdf');
  if (btn) {
    btn.addEventListener('click', function () {
      window.print();
    });
  }

  /* ── TOC: resaltar sección activa ───────────────────────────── */
  var tocLinks = Array.prototype.slice.call(
    document.querySelectorAll('.tc-toc a')
  );
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var idToLink = {};
    tocLinks.forEach(function (link) {
      var id = link.getAttribute('href').replace('#', '');
      idToLink[id] = link;
    });
    var sections = Object.keys(idToLink)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            tocLinks.forEach(function (l) { l.classList.remove('is-active'); });
            var active = idToLink[entry.target.id];
            if (active) active.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-30% 0px -65% 0px', threshold: 0 }
    );
    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ── Datos dinámicos desde Supabase ─────────────────────────── */
  var SUPABASE_URL  = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZmd3cnhnZnV6Z2ZpY3Rkc3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MjMxNjIsImV4cCI6MjA2MTA5OTE2Mn0.G3cuQKGgEH5b5h0iFLG-Wf1JH5aZCu-dP07tkWWRCtg';

  var KEYS = [
    'terminos_fecha',
    'terminos_razon_social',
    'terminos_domicilio',
    'terminos_email',
    'terminos_whatsapp',
    'terminos_estancia_minima',
    'terminos_precio_rango',
    'terminos_deposito',
    'terminos_cancelacion',
    'terminos_recargos',
    'terminos_mascotas',
    'terminos_pasarela',
  ];

  function initSupabase() {
    if (typeof supabase === 'undefined' || !supabase.createClient) return;
    var client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    client
      .from('site_config')
      .select('key, value')
      .in('key', KEYS)
      .then(function (result) {
        if (result.error || !result.data) return;
        var map = {};
        result.data.forEach(function (row) { map[row.key] = row.value || ''; });
        applyData(map);
      });
  }

  function setText(id, value) {
    if (!value) return;
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function applyData(map) {
    /* Fecha — hero y pie */
    if (map.terminos_fecha) {
      setText('tc-fecha', map.terminos_fecha);
      setText('tc-fecha-pie', map.terminos_fecha);
    }

    /* Responsable */
    setText('tc-razon-social', map.terminos_razon_social);
    setText('tc-domicilio', map.terminos_domicilio);

    /* Email — texto y href en hero callout y tarjeta final */
    if (map.terminos_email) {
      ['tc-email', 'tc-email-card'].forEach(function (id) {
        setText(id, map.terminos_email);
      });
      ['tc-email-link', 'tc-email-card-link'].forEach(function (id) {
        var a = document.getElementById(id);
        if (a) a.href = 'mailto:' + map.terminos_email;
      });
    }

    /* WhatsApp — actualizar href y texto de todos los enlaces */
    if (map.terminos_whatsapp) {
      var display = map.terminos_whatsapp;
      var numero = display.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
      Array.prototype.forEach.call(
        document.querySelectorAll('.tc-wa'),
        function (a) { a.href = 'https://wa.me/' + numero; }
      );
      setText('tc-wa-text', display);
    }

    /* Estancia mínima */
    setText('tc-estancia-minima', map.terminos_estancia_minima);

    /* Rango de precios */
    setText('tc-precio-rango', map.terminos_precio_rango);

    /* Depósito — detalle adicional */
    setText('tc-deposito-detalle', map.terminos_deposito);

    /* Recargos — detalle adicional */
    setText('tc-recargos-detalle', map.terminos_recargos);

    /* Pasarela de pago */
    if (map.terminos_pasarela) {
      var pasEl = document.getElementById('tc-pasarela');
      if (pasEl) pasEl.textContent = map.terminos_pasarela;
    }

    /* Cancelación — texto del callout */
    setText('tc-cancelacion-texto', map.terminos_cancelacion);

    /* Mascotas — detalle en lista */
    setText('tc-mascotas-detalle', map.terminos_mascotas);
  }

  if (typeof supabase !== 'undefined') {
    initSupabase();
  } else {
    setTimeout(initSupabase, 300);
  }
})();
