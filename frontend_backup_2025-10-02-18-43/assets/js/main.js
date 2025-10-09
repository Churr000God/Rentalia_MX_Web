// Archivo: main.js - VERSIÓN CORREGIDA
document.addEventListener('DOMContentLoaded', () => {
  console.log('JS cargado ✅');

  // Determinar la ruta base según la ubicación de la página
  const isIndexPage = window.location.pathname.endsWith('index.html') || 
                    window.location.pathname.endsWith('/') ||
                    window.location.pathname.split('/').filter(Boolean).length === 0;

  const basePath = isIndexPage ? './components' : '../components';

  console.log('📍 Ruta base detectada:', basePath);

  // Cargar HEADER
  fetch(`${basePath}/header/header.html?v=3`)
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status} al cargar header`);
      return res.text();
    })
    .then(headerHTML => {
      document.getElementById('header-container').innerHTML = headerHTML;

      // ACTIVAR MENÚ HAMBURGUESA - CÓDIGO CORREGIDO
      const menuButton = document.querySelector('.btn-nav');
      const mobileMenu = document.getElementById('mobile-menu');
      const overlay = document.querySelector('.mobile-menu-overlay');
      
      console.log('🔄 Inicializando menú hamburguesa...');
      console.log('📱 Menu button:', menuButton);
      console.log('📱 Mobile menu:', mobileMenu);
      console.log('🎯 Overlay:', overlay);

      // Solo ejecutar si estamos en móvil y los elementos existen
      if (menuButton && mobileMenu) {
        let isOpen = false;

        // Cerrar menú al inicio
        mobileMenu.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
        menuButton.classList.remove('open');

        // Evento para abrir/cerrar menú
        menuButton.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevenir propagación
          isOpen = !isOpen;
          
          mobileMenu.classList.toggle('show', isOpen);
          menuButton.classList.toggle('open', isOpen);
          
          if (overlay) {
            overlay.classList.toggle('show', isOpen);
          }
          
          // Prevenir scroll cuando el menú está abierto
          document.body.style.overflow = isOpen ? 'hidden' : '';
          
          console.log('🍔 Menú ' + (isOpen ? 'abierto' : 'cerrado'));
        });

        // Cerrar menú al hacer clic en enlaces móviles
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
          link.addEventListener('click', () => {
            isOpen = false;
            mobileMenu.classList.remove('show');
            menuButton.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
            document.body.style.overflow = ''; // Restaurar scroll
            console.log('🔗 Enlace clickeado - cerrando menú');
          });
        });

        // Cerrar menú al hacer clic en el overlay
        if (overlay) {
          overlay.addEventListener('click', () => {
            isOpen = false;
            mobileMenu.classList.remove('show');
            menuButton.classList.remove('open');
            overlay.classList.remove('show');
            document.body.style.overflow = '';
            console.log('🎯 Overlay clickeado - cerrando menú');
          });
        }

        // Cerrar menú al hacer clic fuera de él
        document.addEventListener('click', (e) => {
          if (isOpen && 
              !mobileMenu.contains(e.target) && 
              !menuButton.contains(e.target)) {
            isOpen = false;
            mobileMenu.classList.remove('show');
            menuButton.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
            document.body.style.overflow = '';
            console.log('📄 Clic fuera - cerrando menú');
          }
        });

        // Cerrar menú al presionar ESC
        document.addEventListener('keydown', (e) => {
          if (isOpen && e.key === 'Escape') {
            isOpen = false;
            mobileMenu.classList.remove('show');
            menuButton.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
            document.body.style.overflow = '';
            console.log('⌨️ ESC presionado - cerrando menú');
          }
        });
      } else {
        console.warn('⚠️ Elementos del menú móvil no encontrados');
        if (!menuButton) console.warn('❌ No se encontró .btn-nav');
        if (!mobileMenu) console.warn('❌ No se encontró #mobile-menu');
      }

      // Activar clase 'active' en el enlace seleccionado (navegación desktop)
      const navLinks = document.querySelectorAll('.nav-links a');
      const currentPage = window.location.pathname;
      
      navLinks.forEach(link => {
        // Remover active de todos los links primero
        link.classList.remove('active');
        
        // Verificar si este link corresponde a la página actual
        const linkHref = link.getAttribute('href');
        if (linkHref && currentPage.includes(linkHref.replace('./', '').replace('../', ''))) {
          link.classList.add('active');
        }
        
        // Evento para clicks (para navegación suave)
        link.addEventListener('click', () => {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        });
      });

      console.log('✅ Menú hamburguesa inicializado correctamente');

    })
    .catch(err => console.error('❌ Error al cargar header:', err));

  // Cargar FOOTER
  fetch(`${basePath}/footer/footer.html?v=2`)
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status} al cargar footer`);
      return res.text();
    })
    .then(footerHTML => {
      document.getElementById('footer-container').innerHTML = footerHTML;

      // Actualizar año automáticamente
      const yearEl = document.getElementById('year');
      if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
      }
      
      console.log('✅ Footer cargado correctamente');
    })
    .catch(err => console.error('❌ Error al cargar footer:', err));
});

// Función global para cerrar menú móvil si está abierto
function closeMobileMenu() {
  const menuButton = document.querySelector('.btn-nav');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');
  
  if (menuButton && mobileMenu) {
    mobileMenu.classList.remove('show');
    menuButton.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Cerrar menú al redimensionar la ventana si se hace más grande
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMobileMenu();
  }
});
