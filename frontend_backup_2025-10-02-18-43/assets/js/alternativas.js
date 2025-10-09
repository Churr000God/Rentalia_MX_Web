document.addEventListener("DOMContentLoaded", () => {
  // Datos de las habitaciones
  const habitaciones = [
    {
      id: 1,
      nombre: "Habitación Ejecutiva",
      detalles: "30m² · 1 cama doble · Wifi gratis",
      descripcion: "Amplia habitación con vista al mar, cama king size y escritorio ejecutivo. Ideal para viajes de negocios. La habitación incluye servicio de habitación las 24 horas y acceso a la sala ejecutiva del hotel.",
      precio: 120,
      capacidad: 2,
      disponible: true,
      amenities: ["wifi", "tv", "ac", "minibar"],
      imagenes: [
        "assets/img/alternativas/habitacion1.jpg",
        "assets/img/alternativas/habitacion1-2.jpg",
        "assets/img/alternativas/habitacion1-3.jpg"
      ],
      ubicacion: "19.39703,-99.151874",
      direccion: "C. Palenque 35, Narvarte Poniente, Benito Juárez, 03023 Ciudad de México, CDMX"
    },
    {
      id: 2,
      nombre: "Suite Familiar",
      detalles: "45m² · 2 camas dobles · Cocina pequeña",
      descripcion: "Espaciosa suite con dos habitaciones separadas y área de estar. Perfecta para familias. Incluye cunas disponibles bajo petición y servicio de niñera con reserva previa.",
      precio: 180,
      capacidad: 4,
      disponible: true,
      amenities: ["wifi", "tv", "ac", "cocina", "sofa"],
      imagenes: [
        "assets/img/habitaciones/familiar.jpg",
        "assets/img/habitaciones/familiar-2.jpg",
        "assets/img/habitaciones/familiar-3.jpg"
      ],
      ubicacion: "19.39703,-99.151874",
      direccion: "Calle Principal 123, Planta 2, Ciudad Ejemplo"
    },
    {
      id: 3,
      nombre: "Habitación Económica",
      detalles: "20m² · 1 cama individual · Wifi gratis",
      descripcion: "Cómoda habitación individual con todas las comodidades básicas para una estancia agradable. Perfecta para viajeros solitarios que buscan comodidad a buen precio.",
      precio: 80,
      capacidad: 1,
      disponible: true,
      amenities: ["wifi", "tv"],
      imagenes: [
        "assets/img/habitaciones/economica.jpg",
        "assets/img/habitaciones/economica-2.jpg"
      ],
      ubicacion: "19.39703,-99.151874",
      direccion: "Calle Principal 123, Planta 1, Ciudad Ejemplo"
    },
    {
      id: 4,
      nombre: "Habitación Presidencial",
      detalles: "60m² · 1 cama king size · Jacuzzi",
      descripcion: "La suite más exclusiva de nuestro hotel, con jacuzzi privado, sala de estar independiente y vistas panorámicas. Incluye servicio de mayordomo las 24 horas.",
      precio: 350,
      capacidad: 2,
      disponible: true,
      amenities: ["wifi", "tv", "ac", "minibar", "jacuzzi", "servicio habitación"],
      imagenes: [
        "assets/img/habitaciones/presidencial.jpg",
        "assets/img/habitaciones/presidencial-2.jpg",
        "assets/img/habitaciones/presidencial-3.jpg",
        "assets/img/habitaciones/presidencial-4.jpg"
      ],
      ubicacion: "19.39703,-99.151874",
      direccion: "Calle Principal 123, Planta 7, Ciudad Ejemplo"
    }
  ];

  // Mapeo de íconos y nombres completos para amenities
  const amenityIcons = {
    wifi: { icon: "fas fa-wifi", nombre: "WiFi gratis" },
    tv: { icon: "fas fa-tv", nombre: "TV por cable" },
    ac: { icon: "fas fa-snowflake", nombre: "Aire acondicionado" },
    minibar: { icon: "fas fa-glass-whiskey", nombre: "Minibar" },
    cocina: { icon: "fas fa-utensils", nombre: "Cocina equipada" },
    sofa: { icon: "fas fa-couch", nombre: "Sofá cama" },
    jacuzzi: { icon: "fas fa-hot-tub", nombre: "Jacuzzi" },
    "servicio habitación": { icon: "fas fa-concierge-bell", nombre: "Servicio a la habitación" }
  };

  // Elementos del DOM - compatibles con ambas páginas
  const wrapper = document.getElementById("properties-wrapper");
  const detalleSection = document.getElementById("habitacion-detalle");
  const alternativasSection = document.getElementById("alternativas-section");
  const atrasBtn = document.getElementById("atras-btn");

  // Verificar si los elementos existen antes de proceder
  if (!wrapper) return;

  // Función para mostrar la sección de detalles - COMPATIBLE CON AMBAS PÁGINAS
  function mostrarDetalles(habitacion) {
    if (!detalleSection) return;
    
    // Ocultar listado y mostrar detalles
    if (alternativasSection) {
      alternativasSection.style.display = "none";
    }
    detalleSection.style.display = "block";
    
    // DETECCIÓN AUTOMÁTICA DE ESTRUCTURA DE PÁGINA
    const isIndexPage = document.getElementById("detalle-titulo") !== null;
    
    if (isIndexPage) {
      // ESTRUCTURA DEL INDEX.HTML
      const detalleTitulo = document.getElementById("detalle-titulo");
      const detallePrecio = document.getElementById("detalle-precio");
      const detalleDescripcion = document.getElementById("detalle-descripcion");
      const detalleUbicacion = document.getElementById("detalle-ubicacion");
      const detalleCaracteristicas = document.getElementById("detalle-caracteristicas-lista");
      
      if (detalleTitulo) detalleTitulo.textContent = habitacion.nombre;
      if (detallePrecio) detallePrecio.textContent = `$${habitacion.precio}`;
      if (detalleDescripcion) detalleDescripcion.textContent = habitacion.descripcion;
      if (detalleUbicacion) detalleUbicacion.textContent = habitacion.direccion;
      
      // Cargar características (amenities)
      if (detalleCaracteristicas) {
        detalleCaracteristicas.innerHTML = habitacion.amenities.map(amenity => {
          const amenityData = amenityIcons[amenity] || { icon: "fas fa-check", nombre: amenity };
          return `
            <li>
              <i class="${amenityData.icon}"></i>
              <span>${amenityData.nombre}</span>
            </li>
          `;
        }).join("");
      }
      
      // Configurar botones de acción del index.html
      const agendarVisitaBtn = document.getElementById("agendar-visita-btn");
      const contactarBtn = document.getElementById("contactar-btn");
      
      if (agendarVisitaBtn) {
        agendarVisitaBtn.onclick = () => {
          window.location.href = `pages/agendar_visita.html?habitacion=${habitacion.id}`;
        };
      }
      
      if (contactarBtn) {
        contactarBtn.onclick = () => {
          alert(`Contactando sobre: ${habitacion.nombre}\nTeléfono: +52 55 1234 5678`);
        };
      }
    } else {
      // ESTRUCTURA DEL ALTERNATIVAS.HTML (original)
      document.getElementById("detalle-nombre").textContent = habitacion.nombre;
      document.getElementById("detalle-precio").innerHTML = `$${habitacion.precio}<small>/noche</small>`;
      document.getElementById("detalle-resumen").textContent = habitacion.detalles;
      document.getElementById("detalle-descripcion").textContent = habitacion.descripcion;
      document.getElementById("detalle-direccion").textContent = habitacion.direccion;
      
      // Configurar el mapa (solo para alternativas.html)
      const mapaIframe = document.getElementById("detalle-mapa");
      if (mapaIframe && habitacion.ubicacion) {
        const [lat, lng] = habitacion.ubicacion.split(',');
        mapaIframe.src = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.355742137737!2d-99.15445398846602!3d19.397029581799238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff04b2985217%3A0x36fadceb5f4333f6!2sC.%20Palenque%2035%2C%20Narvarte%20Poniente%2C%20Benito%20Ju%C3%A1rez%2C%2003023%20Ciudad%20de%20M%C3%A9xico%2C%20CDMX!5e0!3m2!1ses-419!2smx!4v1755569447630!5m2!1ses-419!2smx" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade`;
      }
      
      // Cargar amenities (solo para alternativas.html)
      const amenitiesContainer = document.getElementById("detalle-amenities");
      if (amenitiesContainer) {
        amenitiesContainer.innerHTML = habitacion.amenities.map(amenity => {
          const amenityData = amenityIcons[amenity] || { icon: "fas fa-check", nombre: amenity };
          return `
            <div class="amenity-item">
              <i class="${amenityData.icon}"></i>
              <span>${amenityData.nombre}</span>
            </div>
          `;
        }).join("");
      }
      
      // Configurar el botón de reserva (solo para alternativas.html)
      const reservarBtn = document.getElementById("reservar-btn");
      if (reservarBtn) {
        reservarBtn.onclick = () => {
          alert(`Redirigiendo a reserva de: ${habitacion.nombre}`);
          // window.location.href = `reservar.html?habitacion=${habitacion.id}`;
        };
      }
    }
    
    // Cargar imágenes (común para ambas páginas)
    const mainImage = document.getElementById("main-image");
    const thumbsContainer = document.getElementById("gallery-thumbs");
    
    if (mainImage && thumbsContainer && habitacion.imagenes && habitacion.imagenes.length > 0) {
      mainImage.src = habitacion.imagenes[0];
      mainImage.alt = `Imagen de ${habitacion.nombre}`;
      
      thumbsContainer.innerHTML = habitacion.imagenes.map((img, index) => `
        <img src="${img}" alt="Miniatura ${index + 1}" 
             class="${index === 0 ? 'active' : ''}" 
             onclick="cambiarImagenPrincipal('${img}', this)">
      `).join("");
    }
  }

  // Función global para cambiar imagen principal
  window.cambiarImagenPrincipal = function(src, thumb) {
    const mainImage = document.getElementById("main-image");
    if (mainImage) {
      mainImage.src = src;
    }
    if (thumb) {
      document.querySelectorAll("#gallery-thumbs img").forEach(img => {
        img.classList.remove("active");
      });
      thumb.classList.add("active");
    }
  };

  // Función para volver al listado - COMPATIBLE CON AMBAS PÁGINAS
  if (atrasBtn) {
    atrasBtn.addEventListener("click", () => {
      if (detalleSection) detalleSection.style.display = "none";
      if (alternativasSection) {
        alternativasSection.style.display = "block";
        alternativasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Función para crear tarjetas
  function crearTarjetaHabitacion(habitacion) {
    const card = document.createElement("div");
    card.className = "property-card";
    
    const amenitiesHTML = habitacion.amenities.slice(0, 3).map(amenity => {
      const amenityData = amenityIcons[amenity] || { icon: "fas fa-check", nombre: amenity };
      return `<i class="${amenityData.icon}" title="${amenityData.nombre}"></i>`;
    }).join('');

    card.innerHTML = `
      <div class="property-image" style="background-image: url('${habitacion.imagenes[0]}')">
        <div class="price-tag">$${habitacion.precio}<small>/noche</small></div>
      </div>
      <div class="property-info">
        <h3 class="property-name">${habitacion.nombre}</h3>
        <p class="property-details">${habitacion.detalles}</p>
        <div class="property-amenities">
          ${amenitiesHTML}
          ${habitacion.amenities.length > 3 ? `<span>+${habitacion.amenities.length - 3}</span>` : ''}
        </div>
        <div class="capacity">
          <i class="fas fa-user-friends"></i> ${habitacion.capacidad} persona${habitacion.capacidad > 1 ? 's' : ''}
        </div>
        <button class="btn ver-detalle" data-id="${habitacion.id}">
          <i class="fas fa-search"></i> Ver detalles
        </button>
      </div>
    `;
    
    return card;
  }

  // Agregar tarjetas al contenedor
  habitaciones.forEach(habitacion => {
    if (habitacion.disponible) {
      wrapper.appendChild(crearTarjetaHabitacion(habitacion));
    }
  });

  // Evento para los botones "Ver detalles" - FUNCIONAL PARA AMBAS PÁGINAS
  document.addEventListener('click', function(e) {
    const verDetalleBtn = e.target.closest('.ver-detalle');
    if (verDetalleBtn) {
      const id = verDetalleBtn.getAttribute('data-id');
      const habitacion = habitaciones.find(h => h.id == id);
      if (habitacion) {
        mostrarDetalles(habitacion);
      }
    }
  });
});