document.addEventListener("DOMContentLoaded", () => {
  // Datos de ejemplo (en producción vendrían de una API)
  const experiencias = [
    {
      id: 1,
      texto: "Vivir en Rentalia ha sido una experiencia transformadora. La comunidad es cálida y las instalaciones son excelentes.",
      autor: "María González",
      lugar: "Residente en Zona Norte",
      imagen: "/assets/images/img/experiencias/1.jpg",
      categoria: "comunidad",
      fecha: "Enero 2023"
    },
    {
      id: 2,
      texto: "Los eventos que organizan me han ayudado a hacer amigos y sentirme como en casa desde el primer día.",
      autor: "Carlos Mendoza",
      lugar: "Residente en Centro",
      imagen: "/assets/images/img/experiencias/2.jpg",
      categoria: "eventos",
      fecha: "Marzo 2023"
    },
    {
      id: 3,
      texto: "Las áreas comunes y los servicios hacen que valga cada peso. Nunca había vivido en un lugar tan bien equipado.",
      autor: "Ana López",
      lugar: "Residente en Zona Sur",
      imagen: "/assets/images/img/experiencias/3.jpg",
      categoria: "instalaciones",
      fecha: "Mayo 2023"
    }
  ];

  const container = document.getElementById('experiencias-container');
  const filtroBtns = document.querySelectorAll('.filtro-btn');

  // Función para renderizar experiencias
  function renderExperiencias(categoria = 'todas') {
    container.innerHTML = '';
    
    const experienciasFiltradas = categoria === 'todas' 
      ? experiencias 
      : experiencias.filter(exp => exp.categoria === categoria);
    
    if (experienciasFiltradas.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <p>No hay experiencias disponibles en esta categoría.</p>
        </div>
      `;
      return;
    }

    experienciasFiltradas.forEach(exp => {
      const card = document.createElement('div');
      card.className = 'experiencia-card';
      card.innerHTML = `
        <div class="experiencia-imagen" style="background-image: url('${exp.imagen}')"></div>
        <div class="experiencia-content">
          <p class="experiencia-texto">${exp.texto}</p>
          <div class="experiencia-autor">
            <div class="autor-foto" style="background-image: url('${exp.imagen}')"></div>
            <div class="autor-info">
              <p class="autor-nombre">${exp.autor}</p>
              <p class="autor-lugar">${exp.lugar} • ${exp.fecha}</p>
            </div>
          </div>
          <span class="experiencia-categoria">${exp.categoria.charAt(0).toUpperCase() + exp.categoria.slice(1)}</span>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Filtrado por categoría
  filtroBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filtroBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const categoria = btn.getAttribute('data-categoria');
      renderExperiencias(categoria);
    });
  });

  // Cargar todas las experiencias inicialmente
  renderExperiencias();
});