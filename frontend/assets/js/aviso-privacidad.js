/* ═══════════════════════════════════════════════════════════════
   aviso-privacidad.js
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
    document.querySelectorAll('.ap-toc a')
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
  var SUPABASE_URL = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZmd3cnhnZnV6Z2ZpY3Rkc3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MjMxNjIsImV4cCI6MjA2MTA5OTE2Mn0.G3cuQKGgEH5b5h0iFLG-Wf1JH5aZCu-dP07tkWWRCtg';

  var KEYS = [
    'aviso_responsable_razon_social',
    'aviso_responsable_domicilio',
    'aviso_whatsapp',
    'aviso_fecha',
    'aviso_pasarela',
    'aviso_proveedores',
  ];

  /* Esperar a que supabase esté disponible en el global (cargado por CDN) */
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

  function applyData(map) {
    /* Razón social */
    var rsEl = document.getElementById('aviso-razon-social');
    if (rsEl && map.aviso_responsable_razon_social) {
      rsEl.textContent = map.aviso_responsable_razon_social;
    }

    /* Domicilio */
    var domEl = document.getElementById('aviso-domicilio');
    if (domEl && map.aviso_responsable_domicilio) {
      domEl.textContent = map.aviso_responsable_domicilio;
    }

    /* Fecha (hero + pie) */
    if (map.aviso_fecha) {
      ['aviso-fecha', 'aviso-fecha-pie'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = map.aviso_fecha;
      });
    }

    /* WhatsApp: actualizar href y texto de ambos enlaces */
    if (map.aviso_whatsapp) {
      var display = map.aviso_whatsapp;
      /* Derivar el número para wa.me quitando espacios, guiones y el + inicial */
      var numero = display.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
      Array.prototype.forEach.call(
        document.querySelectorAll('.aviso-wa'),
        function (a) {
          a.href = 'https://wa.me/' + numero;
          a.textContent = display;
        }
      );
    }

    /* Pasarela: mostrar nombre entre paréntesis inline */
    var pasaleraEl = document.getElementById('aviso-pasarela-inline');
    if (pasaleraEl && map.aviso_pasarela) {
      pasaleraEl.textContent = ' (' + map.aviso_pasarela + ')';
    }

    /* Proveedores: nota adicional tras el texto de la lista */
    var provEl = document.getElementById('aviso-proveedores-inline');
    if (provEl && map.aviso_proveedores) {
      provEl.textContent = ' ' + map.aviso_proveedores;
    }
  }

  /* Intentar inmediatamente; si el CDN aún no cargó, esperar 300 ms */
  if (typeof supabase !== 'undefined') {
    initSupabase();
  } else {
    setTimeout(initSupabase, 300);
  }
})();
