/* location-amenities.js
   Carga amenidades generales de la ubicación desde Supabase
   y renderiza la sección #amenidades de la home.
   Proyecto: vefgwrxgfuzgfictdsyo (Rentalia.mx)
   Depende de: @supabase/supabase-js (CDN), cargado antes de este script.
*/
(function () {
  const SUPABASE_URL = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_3Dew0GfB8vlUnItNfBm0Xw_5vMDArZM';

  const grid       = document.getElementById('amenidadesGrid');
  const filterBtns = document.querySelectorAll('.amenidades__filter');

  if (!grid) return;

  // ── Init ──────────────────────────────────────────────────────
  function init() {
    if (!window.supabase) { grid.innerHTML = ''; return; }
    const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    loadAmenidades(db);
  }

  // ── Fetch ─────────────────────────────────────────────────────
  async function loadAmenidades(db) {
    try {
      const { data, error } = await db
        .from('location_amenities')
        .select('id, slug, label, description, icon, category')
        .eq('active', true)
        .order('orden', { ascending: true });

      if (error || !data) { grid.innerHTML = ''; return; }
      render(data);
    } catch (_) {
      grid.innerHTML = '';
    }
  }

  // ── Render ────────────────────────────────────────────────────
  function render(items) {
    grid.innerHTML = items.map(a => `
      <div class="amenity" data-cat="${a.category}">
        <div class="amenity__icon">
          <span class="material-symbols-outlined" aria-hidden="true">${a.icon}</span>
        </div>
        <div class="amenity__info">
          <span class="amenity__name">${a.label}</span>
          ${a.description ? `<span class="amenity__desc">${a.description}</span>` : ''}
        </div>
      </div>
    `).join('');

    revealOnScroll();
    wireFilters();
  }

  // ── Scroll reveal (staggered) ─────────────────────────────────
  function revealOnScroll() {
    const cards = Array.from(grid.querySelectorAll('.amenity'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = cards.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('amenity--visible');
        }, idx * 55);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    cards.forEach(c => io.observe(c));
  }

  // ── Category filters ──────────────────────────────────────────
  function wireFilters() {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.dataset.cat;
        grid.querySelectorAll('.amenity').forEach(card => {
          const visible = cat === 'all' || card.dataset.cat === cat;
          card.classList.toggle('amenity--hidden', !visible);
        });
      });
    });
  }

  // ── Boot ──────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
