// Layout.js - Maneja la carga dinámica de header y footer

document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    loadFooter();
});

async function loadHeader() {
    try {
        const response = await fetch('/components/header/header.html');
        if (response.ok) {
            const headerHTML = await response.text();
            document.getElementById('header-container').innerHTML = headerHTML;
            
            // Inicializar funcionalidad del menú móvil después de cargar el header
            initMobileMenu();
        } else {
            console.error('Error loading header:', response.status);
        }
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

async function loadFooter() {
    try {
        const response = await fetch('/components/footer/footer.html');
        if (response.ok) {
            const footerHTML = await response.text();
            document.getElementById('footer-container').innerHTML = footerHTML;
        } else {
            console.error('Error loading footer:', response.status);
        }
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        // Cerrar menú al hacer clic fuera de él
        document.addEventListener('click', function(event) {
            if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
}

// Función para obtener la ruta base dependiendo de si estamos en root o en pages
function getBasePath() {
    const path = window.location.pathname;
    return path.includes('/pages/') ? '../' : './';
}

// Función para ajustar rutas relativas
function adjustPaths() {
    const basePath = getBasePath();
    
    // Ajustar rutas de imágenes
    const images = document.querySelectorAll('img[src^="./assets/"]');
    images.forEach(img => {
        img.src = img.src.replace('./assets/', basePath + 'assets/');
    });
    
    // Ajustar rutas de enlaces CSS
    const cssLinks = document.querySelectorAll('link[href^="./assets/"]');
    cssLinks.forEach(link => {
        link.href = link.href.replace('./assets/', basePath + 'assets/');
    });
    
    // Ajustar rutas de scripts
    const scripts = document.querySelectorAll('script[src^="./assets/"]');
    scripts.forEach(script => {
        script.src = script.src.replace('./assets/', basePath + 'assets/');
    });
}

// Ejecutar ajuste de rutas cuando se carga la página
document.addEventListener('DOMContentLoaded', adjustPaths);