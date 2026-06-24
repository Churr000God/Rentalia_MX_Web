/* ======================================================
   main.js – Core UI & Layout Logic (OPTIMIZADO)
   Proyecto: RENTALIA
   ====================================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 main.js cargado');

  /* ======================================================
     UTILIDADES
     ====================================================== */

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const isIndexPage =
    window.location.pathname.endsWith('/') ||
    window.location.pathname.endsWith('index.html');

  const basePath = isIndexPage ? './components' : '../components';

  /* ======================================================
     HEADER & FOOTER (DINÁMICOS)
     ====================================================== */

  loadFragment(`${basePath}/header/header.html?v=3`, '#header-container', initHeader);
  loadFragment(`${basePath}/footer/footer.html?v=2`, '#footer-container', initFooter);

  function loadFragment(url, containerSelector, callback) {
    const container = qs(containerSelector);
    if (!container) return;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.text();
      })
      .then(html => {
        container.innerHTML = html;
        callback && callback();
      })
      .catch(err => console.error(`❌ Error cargando ${url}`, err));
  }

  /* ======================================================
     HEADER – MENÚ MÓVIL
     ====================================================== */

  function initHeader() {
    const menuButton = qs('.btn-nav');
    const mobileMenu = qs('#mobile-menu');
    const overlay = qs('.mobile-menu-overlay');

    if (!menuButton || !mobileMenu) {
      console.warn('⚠️ Menú móvil no detectado');
      return;
    }

    let isOpen = false;

    const openMenu = () => {
      isOpen = true;
      mobileMenu.classList.add('show');
      menuButton.classList.add('open');
      menuButton.setAttribute('aria-expanded', 'true');
      mobileMenu.style.display = 'flex';
      overlay?.classList.add('show');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      isOpen = false;
      mobileMenu.classList.remove('show');
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      mobileMenu.style.display = 'none';
      overlay?.classList.remove('show');
      document.body.style.overflow = '';
    };

    menuButton.addEventListener('click', e => {
      e.stopPropagation();
      isOpen ? closeMenu() : openMenu();
    });

    qsa('a', mobileMenu).forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    overlay?.addEventListener('click', closeMenu);

    document.addEventListener('keydown', e => {
      if (isOpen && e.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', e => {
      if (isOpen && !mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) closeMenu();
    });

    activateNavLink();
  }

  /* ======================================================
     FOOTER
     ====================================================== */

  async function initFooter() {
    const yearEl = qs('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* -- Datos de contacto desde site_config -- */
    if (!window.supabase) return;
    const SUPABASE_URL = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_3Dew0GfB8vlUnItNfBm0Xw_5vMDArZM';
    const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
      const FOOTER_KEYS = ['footer_whatsapp', 'footer_email', 'footer_instagram', 'footer_direccion'];
      const { data } = await db
        .from('site_config')
        .select('key, value')
        .in('key', FOOTER_KEYS);

      if (!data?.length) return;

      const cfg = {};
      for (const row of data) cfg[row.key] = row.value;

      const wa = qs('#footer-whatsapp');
      if (wa && cfg.footer_whatsapp) {
        wa.href = `https://wa.me/${cfg.footer_whatsapp}`;
      }

      const emailEl = qs('#footer-email');
      if (emailEl && cfg.footer_email) {
        emailEl.href = `mailto:${cfg.footer_email}`;
        emailEl.textContent = cfg.footer_email;
      }

      const igEl = qs('#footer-instagram');
      if (igEl && cfg.footer_instagram) {
        igEl.href = `https://instagram.com/${cfg.footer_instagram}`;
        igEl.textContent = `@${cfg.footer_instagram}`;
      }

      const dirEl = qs('#footer-direccion');
      if (dirEl && cfg.footer_direccion) {
        dirEl.href = `https://maps.google.com/?q=${encodeURIComponent(cfg.footer_direccion)}`;
        dirEl.textContent = cfg.footer_direccion;
      }
    } catch (_) {
      // Fallo silencioso: el footer mantiene los valores hardcodeados
    }
  }

  /* ======================================================
     NAV – LINK ACTIVO
     ====================================================== */

  function activateNavLink() {
    const navLinks = qsa('.nav-links a, #mobile-menu a');
    const currentPath = window.location.pathname.toLowerCase(); // Convertir a minúsculas para evitar errores

    // DEFINICIÓN DE LAS 5 OPCIONES DEL MENÚ (CONSTANTES)
    const PAGES = {
      INICIO: 'inicio',
      ALTERNATIVAS: 'alternativas',
      EXPERIENCIAS: 'experiencias',
      AGENDA: 'agendar',
      FAQ: 'faq'
    };

    // 1. Identificar en qué página estamos basándonos en palabras clave en la URL
    let currentPageId = PAGES.INICIO; // Por defecto asumimos inicio

    if (currentPath.includes('alternativas')) {
      currentPageId = PAGES.ALTERNATIVAS;
    } else if (currentPath.includes('experiencias')) {
      currentPageId = PAGES.EXPERIENCIAS;
    } else if (currentPath.includes('agendar')) {
      currentPageId = PAGES.AGENDA;
    } else if (currentPath.includes('faq')) {
      currentPageId = PAGES.FAQ;
    } 
    // Si no coincide con ninguna, se queda en INICIO (para /, index.html, etc.)

    console.log('📍 Path:', currentPath, '| ID:', currentPageId);

    // 2. Recorrer todos los links y activar el que corresponda
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (!href) return;
      
      const lowerHref = href.toLowerCase();
      let isMatch = false;

      switch (currentPageId) {
        case PAGES.INICIO:
          // El link de inicio es el que NO tiene ninguna de las otras keywords
          // Y suele ser /, index.html, o ./
          if (!lowerHref.includes('alternativas') && 
              !lowerHref.includes('experiencias') && 
              !lowerHref.includes('agendar') && 
              !lowerHref.includes('faq')) {
             isMatch = true;
          }
          break;
        case PAGES.ALTERNATIVAS:
          isMatch = lowerHref.includes('alternativas');
          break;
        case PAGES.EXPERIENCIAS:
          isMatch = lowerHref.includes('experiencias');
          break;
        case PAGES.AGENDA:
          isMatch = lowerHref.includes('agendar');
          break;
        case PAGES.FAQ:
          isMatch = lowerHref.includes('faq');
          break;
      }

      if (isMatch) {
        link.classList.add('active');
      }

      // UX: Click inmediato para feedback visual antes de recargar
      link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  /* ======================================================
     ANIMACIONES SCROLL & INTERACTIVIDAD
     ====================================================== */
  
  initConceptAnimations();
  initCtaGlow();

  function initConceptAnimations() {
    // 1. Animaciones de entrada al hacer scroll (Intersection Observer) 
    const observerOptions = { 
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' 
    }; 
    
    const revealOnScroll = new IntersectionObserver((entries) => { 
        entries.forEach(entry => { 
            if (entry.isIntersecting) { 
                entry.target.style.opacity = '1'; 
                entry.target.style.transform = 'translateY(0)'; 
                revealOnScroll.unobserve(entry.target); // Dejar de observar una vez animado
            } 
        }); 
    }, observerOptions); 
    
    // Aplicar a tarjetas y elementos de lista 
    qsa('.feature-card, .possibility-item').forEach(el => { 
        revealOnScroll.observe(el); 
    }); 
  }

  function initCtaGlow() {
    // 2. Efecto de "Glow" siguiendo al mouse en la sección CTA 
    const ctaSection = qs('.cta-section'); 
    const ctaGlow = qs('.cta-glow'); 
    
    if (!ctaSection || !ctaGlow) return;

    ctaSection.addEventListener('mousemove', (e) => { 
        const rect = ctaSection.getBoundingClientRect(); 
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top; 
        
        // Actualizamos la posición del degradado 
        ctaGlow.style.left = `${x}px`; 
        ctaGlow.style.top = `${y}px`; 
    });
  }
});

/* ======================================================
   API GLOBAL (USABLE DESDE OTROS SCRIPTS)
   ====================================================== */

/**
 * Cierra el menú móvil si está abierto
 */
window.closeMobileMenu = function () {
  const menuButton = document.querySelector('.btn-nav');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');

  if (!menuButton || !mobileMenu) return;

  mobileMenu.classList.remove('show');
  menuButton.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.style.display = 'none';
  overlay?.classList.remove('show');
  document.body.style.overflow = '';
};

/* ======================================================
   REVIEWS SYSTEM
   ====================================================== */
const API_CONFIG = {
  endpoint: 'http://localhost:8000/api/reviews',
  createEndpoint: 'http://localhost:8000/api/reviews/internal',
  cacheTime: 24 * 60 * 60 * 1000
};

async function loadReviews() {
  const container = document.getElementById('reviewsContainer');
  const avgEl = document.getElementById('avgRating');
  const totalEl = document.getElementById('totalReviews');
  const starsEl = document.getElementById('googleStars');

  if (!container) return;

  try {
    const res = await fetch(API_CONFIG.endpoint);
    if (!res.ok) throw new Error('Error fetching reviews');
    const data = await res.json();

    const google = data.google || { rating: 0, total: 0, reviews: [] };
    const internal = data.internal || { rating: 0, total: 0, reviews: [] };

    // Calculate combined stats
    const totalCount = google.total + internal.total;
    // Weighted average (avoid division by zero)
    const totalScore = (google.rating * google.total) + (internal.rating * internal.total);
    const avg = totalCount > 0 ? (totalScore / totalCount).toFixed(1) : "0.0";

    // Update Header Stats
    if (avgEl) avgEl.textContent = avg;
    if (totalEl) totalEl.textContent = totalCount;
    if (starsEl) starsEl.innerHTML = renderStars(parseFloat(avg));

    // Combine reviews
    let allReviews = [];
    
    if (google.reviews) {
        allReviews = allReviews.concat(google.reviews.map(r => ({
            author: r.author_name,
            rating: r.rating,
            text: r.text,
            time: r.relative_time_description || '', 
            source: 'Google'
        })));
    }

    if (internal.reviews) {
        allReviews = allReviews.concat(internal.reviews.map(r => ({
            author: r.author_name,
            rating: r.rating,
            text: r.comment,
            time: new Date(r.created_at).toLocaleDateString(),
            source: 'Rentalia'
        })));
    }

    // Render
    if (allReviews.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #718096;">Aún no hay reseñas. ¡Sé el primero en opinar!</p>';
        return;
    }

    container.innerHTML = allReviews.map(review => `
        <div class="amenity-card" style="align-items: flex-start; text-align: left; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 1rem;">
                <span style="font-weight: bold; color: #2d3748;">${review.author}</span>
                <span style="font-size: 0.8rem; color: #a0aec0;">${review.source}</span>
            </div>
            <div style="color: #ff6b00; margin-bottom: 0.8rem;">
                ${renderStars(review.rating)}
            </div>
            <p style="color: #718096; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem;">
                "${review.text}"
            </p>
            <span style="font-size: 0.8rem; color: #cbd5e0; margin-top: auto;">${review.time}</span>
        </div>
    `).join('');

  } catch (err) {
    console.error('Error loading reviews:', err);
    if (container) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #e53e3e;">No se pudieron cargar las reseñas.</p>';
    }
  }
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fa-solid fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
            stars += '<i class="fa-regular fa-star"></i>';
        }
    }
    return stars;
}

function initReviewForm() {
  const modal = document.getElementById('reviewModal');
  const btnOpen = document.getElementById('btnOpenReviewModal');
  const btnClose = document.getElementById('btnCloseReviewModal');
  const form = document.getElementById('reviewForm');
  const starContainer = document.querySelector('.star-rating-input');
  const ratingInput = document.getElementById('reviewRating');

  console.log('Init Review Form:', { modal: !!modal, btnOpen: !!btnOpen });

  if (!modal || !btnOpen) return;

  // Open/Close Modal
  const openModal = () => {
      modal.style.display = 'flex';
      // Force reflow
      modal.offsetHeight;
      modal.classList.add('show');
      
      // Reset form
      form.reset();
      updateStarInput(5);
  };

  const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => {
          modal.style.display = 'none';
      }, 300); // Wait for transition
  };

  btnOpen.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
  });
  
  btnClose.addEventListener('click', closeModal);
  
  modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
  });

  // Star Rating Interaction
  if (starContainer) {
      const stars = starContainer.querySelectorAll('i');
      
      stars.forEach(star => {
          star.addEventListener('click', () => {
              const val = parseInt(star.dataset.value);
              updateStarInput(val);
          });
          
          star.addEventListener('mouseenter', () => {
              const val = parseInt(star.dataset.value);
              highlightStars(val);
          });
      });
      
      starContainer.addEventListener('mouseleave', () => {
          highlightStars(parseInt(ratingInput.value));
      });

      function updateStarInput(val) {
          ratingInput.value = val;
          highlightStars(val);
      }

      function highlightStars(val) {
          stars.forEach(s => {
              if (parseInt(s.dataset.value) <= val) {
                  s.style.color = '#ff6b00';
                  s.classList.remove('fa-regular');
                  s.classList.add('fa-solid');
              } else {
                  s.style.color = '#cbd5e0';
                  s.classList.remove('fa-solid');
                  s.classList.add('fa-solid'); // keep solid but gray
              }
          });
      }
      
      // Init with 5 stars
      updateStarInput(5);
  }

  // Handle Submit
  form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      const data = {
          author_name: document.getElementById('reviewAuthor').value,
          rating: parseInt(document.getElementById('reviewRating').value),
          comment: document.getElementById('reviewComment').value
      };

      try {
          const res = await fetch(API_CONFIG.createEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });

          if (!res.ok) throw new Error('Error enviando reseña');

          alert('¡Gracias por tu reseña! Ha sido enviada y está pendiente de aprobación.');
          closeModal();
          
      } catch (error) {
          console.error(error);
          alert('Hubo un error al enviar tu reseña. Por favor intenta nuevamente.');
      } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
      }
  });
}

/* ======================================================
   HERO DINÁMICO — foto y precio desde site_config
   ====================================================== */
async function loadHeroConfig() {
  const fill  = document.querySelector('.arch-photo__fill--img');
  const badge = document.querySelector('.arch-badge');
  if (!fill || !badge) return;

  if (!window.supabase) return;
  const SUPABASE_URL = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_3Dew0GfB8vlUnItNfBm0Xw_5vMDArZM';
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // 1. Leer hero_habitacion_id de site_config
    const { data: cfg } = await db
      .from('site_config')
      .select('value')
      .eq('key', 'hero_habitacion_id')
      .single();

    if (!cfg?.value) return; // sin config → queda el valor hardcoded

    // 2. Cargar la habitación seleccionada
    const { data: room } = await db
      .from('habitaciones')
      .select('imagen_principal, precio_min')
      .eq('id', cfg.value)
      .single();

    if (!room) return;

    // 3. Actualizar DOM
    if (room.imagen_principal) {
      fill.style.backgroundImage = `url('${room.imagen_principal}')`;
      const archPhoto = fill.closest('[role="img"]');
      if (archPhoto) archPhoto.setAttribute('aria-label', 'Habitación en Rentalia, Narvarte');
    }

    if (room.precio_min != null) {
      const formatted = room.precio_min.toLocaleString('es-MX');
      const strong = badge.querySelector('strong');
      if (strong) strong.textContent = `$${formatted}`;
      badge.setAttribute('aria-label', `Desde $${formatted} al mes`);
    }
  } catch (_) {
    // Fallo silencioso: el hero mantiene los valores hardcoded
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadReviews();
  initReviewForm();
  loadHeroConfig();
});
