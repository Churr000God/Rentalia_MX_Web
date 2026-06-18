/* comunidad.js
   Carga la galería de la sección "Comunidad" desde Supabase (tabla community_gallery)
   y renderiza los 5 slots de fotos en la home.
   Proyecto: Rentalia.mx — vefgwrxgfuzgfictdsyo
*/
(function () {
  'use strict';

  const SUPABASE_URL = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_3Dew0GfB8vlUnItNfBm0Xw_5vMDArZM';
  const STAGGER_MS   = 70;

  const gallery = document.getElementById('communityGallery');
  if (!gallery) return;

  function init() {
    if (!window.supabase) { removeSkel(); return; }
    const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    load(db);
  }

  async function load(db) {
    try {
      const { data, error } = await db
        .from('community_gallery')
        .select('slot, label, photo_url, alt_text')
        .eq('active', true)
        .order('slot', { ascending: true });

      if (error || !data || !data.length) { removeSkel(); return; }
      render(data);
    } catch (_) {
      removeSkel();
    }
  }

  function render(slots) {
    gallery.innerHTML = slots.map(s => {
      const isWide = s.slot === 1;
      const cls    = isWide ? 'gallery__item--wide' : 'gallery__item--square';
      const style  = s.photo_url
        ? `style="background-image:url('${s.photo_url}')"`
        : '';
      return `
        <div class="gallery__item ${cls}" data-slot="${s.slot}">
          <div class="gfill" role="img" aria-label="${s.alt_text || s.label}" ${style}>
            <span class="gallery__label">${s.label}</span>
          </div>
        </div>`;
    }).join('');

    revealOnScroll();
  }

  function removeSkel() {
    // Quita el estado skeleton y revela los placeholders directamente
    gallery.querySelectorAll('.gallery__item--skel')
      .forEach(el => el.classList.remove('gallery__item--skel'));
    revealOnScroll();
  }

  function revealOnScroll() {
    const items = Array.from(gallery.querySelectorAll('.gallery__item'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = items.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('gallery__item--visible');
        }, idx * STAGGER_MS);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

    items.forEach(item => io.observe(item));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
