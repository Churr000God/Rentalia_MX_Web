// Archivo: main.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('JS cargado ✅');

  // Cargar HEADER
  fetch('/components/header/header.html?v=2')
    .then(res => res.text())
    .then(headerHTML => {
      document.getElementById('header-container').innerHTML = headerHTML;

      // ACTIVAR MENÚ DESPUÉS DE INSERTAR HEADER
      const menuButton = document.querySelector('.btn-nav'); // CAMBIO: usa .btn-nav
      const mobileMenu = document.getElementById('mobile-menu');
      const navLinks = document.querySelectorAll('.nav-links a');
      const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

      if (menuButton && mobileMenu) {
        let isOpen = false;

        // Cerrar menú al inicio
        mobileMenu.classList.remove('show');

        menuButton.addEventListener('click', () => {
            isOpen = !isOpen;
            mobileMenu.classList.toggle('show', isOpen);
            menuButton.classList.toggle('open', isOpen); // <-- línea nueva para animación
        });

        // Ocultar menú al dar clic en opción móvil
        mobileLinks.forEach(link => {
          link.addEventListener('click', () => {
            isOpen = false;
            mobileMenu.classList.remove('show');
          });
        });
      }

      // Activar clase 'active' en el enlace seleccionado
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        });
      });
    })
    .catch(err => console.error('Error al cargar header:', err));

  // Cargar FOOTER
  fetch('/components/footer/footer.html?v=2')
    .then(res => res.text())
    .then(footerHTML => {
      document.getElementById('footer-container').innerHTML = footerHTML;

      // Actualizar año automáticamente
      const yearEl = document.getElementById('year');
      if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
      }
    })
    .catch(err => console.error('Error al cargar footer:', err));
});
