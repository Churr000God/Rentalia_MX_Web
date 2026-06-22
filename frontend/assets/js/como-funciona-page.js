/* ════════════════════════════════════════════════════════════
   como-funciona-page.js
   1. Carga contenido dinámico (pasos, valor, FAQ) desde Supabase.
   2. Reveal on scroll para las tarjetas de paso (arco zaguán).
   La FAQ usa <details> nativo — sin JS adicional para toggle.
════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_3Dew0GfB8vlUnItNfBm0Xw_5vMDArZM';

  /* ── 1. Contenido dinámico ─────────────────────────────── */
  if (typeof supabase !== 'undefined') {
    var db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    Promise.all([
      db.from('cf_pasos').select('paso_num,titulo,descripcion,imagen_url').order('paso_num'),
      db.from('cf_valor').select('bloque,titulo,texto,imagen_url'),
      db.from('cf_faq').select('pregunta,respuesta,orden').eq('activo', true).order('orden'),
    ]).then(function (results) {
      var pasosRes = results[0];
      var valorRes = results[1];
      var faqRes   = results[2];
      if (pasosRes.data) renderPasos(pasosRes.data);
      if (valorRes.data) renderValor(valorRes.data);
      if (faqRes.data)   renderFaq(faqRes.data);
    });
  }

  function renderPasos(pasos) {
    pasos.forEach(function (paso) {
      var el = document.querySelector('.cf-step[data-paso="' + paso.paso_num + '"]');
      if (!el) return;
      var img = el.querySelector('.cf-step__arch-wrap img');
      var h3  = el.querySelector('.cf-step__h3');
      var p   = el.querySelector('.cf-step__p');
      if (paso.imagen_url && img) img.src = paso.imagen_url;
      if (paso.titulo && h3)      h3.textContent = paso.titulo;
      if (paso.descripcion && p)  p.textContent  = paso.descripcion;
    });
  }

  function renderValor(bloques) {
    bloques.forEach(function (bloque) {
      var el = document.querySelector('.cf-value__block[data-bloque="' + bloque.bloque + '"]');
      if (!el) return;
      var h2  = el.querySelector('.cf-value__h2');
      var p   = el.querySelector('.cf-value__p');
      var img = el.querySelector('.cf-value__img-wrap img');
      if (bloque.titulo && h2) h2.textContent = bloque.titulo;
      if (bloque.texto && p)   p.textContent  = bloque.texto;
      if (bloque.imagen_url && img) img.src   = bloque.imagen_url;
    });
  }

  function renderFaq(faqs) {
    var list = document.getElementById('cf-faq-list');
    if (!list || !faqs.length) return;
    list.innerHTML = faqs.map(function (faq) {
      return '<details class="cf-faq__item">' +
        '<summary class="cf-faq__summary">' +
          esc(faq.pregunta) +
          '<span class="material-symbols-outlined cf-faq__chevron" aria-hidden="true">expand_more</span>' +
        '</summary>' +
        '<div class="cf-faq__body"><p>' + esc(faq.respuesta) + '</p></div>' +
        '</details>';
    }).join('');
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── 2. Scroll reveal ──────────────────────────────────── */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    var steps = document.querySelectorAll('.cf-step');
    if (steps.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      steps.forEach(function (step, i) {
        step.style.transitionDelay = (i * 90) + 'ms';
        io.observe(step);
      });
    }
  }

}());
