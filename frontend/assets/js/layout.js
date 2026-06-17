// Layout.js - Maneja la carga dinámica de header y footer

document.addEventListener('DOMContentLoaded', function() {
    adjustPaths();
});


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
// Ajuste de rutas ya se invoca al cargar DOM
