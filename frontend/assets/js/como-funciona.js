/* como-funciona.js
   Stepper interactivo — sección "Cómo funciona" del home.
   Proyecto: Rentalia.mx
   Sin dependencias externas.
*/
(function () {
  'use strict';

  const STAGGER_MS = 80;

  function init() {
    const section = document.getElementById('como-funciona');
    if (!section) return;

    const steps    = Array.from(section.querySelectorAll('.step'));
    const progress = section.querySelector('.steps__progress');
    const total    = steps.length;

    if (!total) return;

    // ── Reveal escalonado al hacer scroll ──────────────────────
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = steps.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('step--visible');
        }, idx * STAGGER_MS);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    steps.forEach(s => io.observe(s));

    // ── Paso activo ─────────────────────────────────────────────
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setActive(idx) {
      steps.forEach((s, i) => {
        const isActive = i === idx;
        s.classList.toggle('step--active', isActive);
        const btn = s.querySelector('.step__btn');
        if (btn) btn.setAttribute('aria-current', isActive ? 'step' : 'false');
      });

      if (progress) {
        // pct relativo al ancho de .steps__progress (que está dentro del track)
        const pct = total > 1 ? (idx / (total - 1)) * 100 : 0;
        if (reducedMotion) progress.style.transition = 'none';
        progress.style.width = pct + '%';
      }
    }

    // Clic en cualquier parte del step
    steps.forEach((step, idx) => {
      step.querySelector('.step__btn')?.addEventListener('click', () => setActive(idx));
    });

    // Estado inicial
    setActive(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
