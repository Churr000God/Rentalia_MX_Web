
// Inicialización de Supabase
// Usamos IIFE para evitar contaminar el scope global y conflictos
(function() {
    const SUPABASE_URL = 'https://snsyusgwbqwamkwoijeb.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_laiHFnnD5NDCrAWPweRsSw_F2ARqa_n';

    let supabaseClient = null;
    let allHabitaciones = []; // Almacenar todas las habitaciones para filtrado local

    // Función para inicializar el cliente
    function initSupabase() {
        if (window.supabase) {
            // Usamos window.supabase.createClient pero asignamos a nuestra variable local
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client initialized');
            return true;
        } else {
            console.error('Supabase library not found in window object');
            return false;
        }
    }

    // Inicializar listeners de filtros
    function initFilterListeners() {
        const searchInput = document.getElementById('searchInput');
        const zonaFilter = document.getElementById('zonaFilter');
        const precioFilter = document.getElementById('precioFilter');
        const statusFilter = document.getElementById('statusFilter');
        const clearBtn = document.getElementById('clearFilters');

        const filters = [searchInput, zonaFilter, precioFilter, statusFilter];

        filters.forEach(filter => {
            if (filter) {
                filter.addEventListener('input', applyFilters);
                filter.addEventListener('change', applyFilters);
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (zonaFilter) zonaFilter.value = '';
                if (precioFilter) precioFilter.value = '';
                if (statusFilter) statusFilter.value = '';
                applyFilters();
            });
        }
    }

    // Aplicar filtros
    function applyFilters() {
        const searchInput = document.getElementById('searchInput');
        const zonaFilter = document.getElementById('zonaFilter');
        const precioFilter = document.getElementById('precioFilter');
        const statusFilter = document.getElementById('statusFilter');
        const clearBtn = document.getElementById('clearFilters');

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const zonaValue = zonaFilter ? zonaFilter.value : '';
        const precioValue = precioFilter ? precioFilter.value : '';
        const statusValue = statusFilter ? statusFilter.value : '';

        // Mostrar/Ocultar botón de limpiar
        if (clearBtn) {
            const hasActiveFilters = searchTerm || zonaValue || precioValue || statusValue;
            clearBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';
        }

        const filtered = allHabitaciones.filter(h => {
            // Filtro por Nombre/Descripción
            const matchSearch = !searchTerm || 
                h.nombre.toLowerCase().includes(searchTerm) || 
                (h.descripcion && h.descripcion.toLowerCase().includes(searchTerm));

            // Filtro por Zona
            const matchZona = !zonaValue || h.zona === zonaValue;

            // Filtro por Status
            const matchStatus = !statusValue || h.status === statusValue;

            // Filtro por Precio (revisamos si AL MENOS UN estilo cumple el rango)
            let matchPrecio = true;
            if (precioValue && h.estilos && h.estilos.length > 0) {
                const precios = h.estilos.map(e => e.precio);
                const minPrecio = Math.min(...precios);
                
                if (precioValue === '0-5000') matchPrecio = minPrecio < 5000;
                else if (precioValue === '5000-8000') matchPrecio = minPrecio >= 5000 && minPrecio <= 8000;
                else if (precioValue === '8000-12000') matchPrecio = minPrecio > 8000 && minPrecio <= 12000;
                else if (precioValue === '12000+') matchPrecio = minPrecio > 12000;
            }

            return matchSearch && matchZona && matchStatus && matchPrecio;
        });

        // Actualizar contador
        const counter = document.getElementById('roomsCounter');
        if (counter) counter.textContent = filtered.length;

        renderHabitaciones(filtered);
    }

    // Función principal para obtener datos y actualizar UI
    async function checkAvailability() {
        console.log('Iniciando checkAvailability...');
        
        // Intentar inicializar si no existe
        if (!supabaseClient) {
            if (!initSupabase()) {
                showErrorState('Error de configuración: Librería no cargada.');
                return;
            }
        }

        try {
            // Eliminamos .eq('status', 'available') para traer todas
            const { data, error } = await supabaseClient
                .from('habitaciones')
                .select(`
                    id,
                    nombre,
                    descripcion,
                    zona,
                    status,
                    estilos:habitacion_estilos (
                        nombre,
                        precio,
                        imagenes
                    )
                `);

            if (error) throw error;
            
            console.log('Habitaciones obtenidas:', data);
            allHabitaciones = data || [];
            
            // Inicializar filtros
            initFilterListeners();

            // Actualizar UI inicial
            updateAvailabilityUI(allHabitaciones); // El badge del hero usa lógica propia
            
            // Aplicar filtros iniciales (muestra todo por defecto)
            applyFilters();
            
        } catch (err) {
            console.error('Error al conectar con Supabase:', err);
            showErrorState('No pudimos cargar las habitaciones. Por favor revisa tu conexión.');
        }
    }

    // Actualizar indicador en el Hero
    function updateAvailabilityUI(habitaciones) {
        const heroContent = document.querySelector('.hero-content');
        // Nota: en alternativas.html la clase es .alternativas-hero-content, pero este script se usa en ambas páginas.
        // Si no encuentra .hero-content, busca el badge por ID directamente.
        
        let statusBadge = document.getElementById('availability-badge');
        
        // Solo crear si no existe y estamos en un contexto donde debería estar (opcional)
        if (!statusBadge) {
             // Lógica original de creación (puede que no sea necesaria si ya existe en HTML o si no queremos inyectarlo forzosamente en alternativas)
             // En alternativas.html no tenemos .hero-subtitle, así que esta inyección automática podría fallar o no ser deseada.
             // Pero mantenemos la lógica para index.html
            const subtitle = document.querySelector('.hero-subtitle');
            if (subtitle) {
                statusBadge = document.createElement('div');
                statusBadge.id = 'availability-badge';
                statusBadge.className = 'availability-badge glass-effect';
                subtitle.parentNode.insertBefore(statusBadge, subtitle.nextSibling);
            }
        }

        if (!statusBadge) return; // Si no hay badge ni lugar para ponerlo, salir.

        // Contar solo disponibles para el mensaje de "X disponibles hoy"
        const availableCount = habitaciones ? habitaciones.filter(h => h.status === 'available').length : 0;

        if (availableCount > 0) {
            statusBadge.innerHTML = `
                <div class="status-indicator pulse"></div>
                <span>¡Tenemos <strong>${availableCount}</strong> habitaciones disponibles hoy!</span>
            `;
            statusBadge.style.display = 'inline-flex';
        } else {
            statusBadge.innerHTML = `
                <div class="status-indicator busy"></div>
                <span>Por el momento no hay disponibilidad inmediata.</span>
            `;
            statusBadge.style.display = 'inline-flex';
        }
    }

    // Renderizar tarjetas de habitaciones
    function renderHabitaciones(habitaciones) {
        const grid = document.getElementById('habitaciones-grid');
        if (!grid) {
            // Silenciosamente salir si no hay grid (ej. en página de agendar visita)
            return;
        }

        grid.innerHTML = ''; // Limpiar estado de carga

        if (!habitaciones || habitaciones.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <p>No hay habitaciones disponibles en este momento.</p>
                </div>
            `;
            return;
        }

        habitaciones.forEach(h => {
            // Verificar que tenga estilos
            if (h.estilos && h.estilos.length > 0) {
                try {
                    const card = createHabitacionCard(h);
                    grid.appendChild(card);
                } catch (e) {
                    console.error('Error al crear tarjeta para:', h.nombre, e);
                }
            }
        });
    }

    // Crear tarjeta individual
    function createHabitacionCard(h) {
        const estiloInicial = h.estilos[0];
        const card = document.createElement('article');
        card.className = 'alternativa-card';
        
        // Determinar ruta correcta para enlaces
        const isPagesDir = window.location.pathname.includes('/pages/');
        const detailsPath = isPagesDir ? `./detalle-habitacion.html?id=${h.id}` : `./pages/detalle-habitacion.html?id=${h.id}`;
        
        // Asegurar que imagenes sea un array (por si en la BD se guardó como string)
        let imagenes = estiloInicial.imagenes || [];
        if (typeof imagenes === 'string') {
            imagenes = [imagenes];
        } else if (!Array.isArray(imagenes)) {
            imagenes = [];
        }

        // Manejar path relativo si es necesario, o placeholder
        // Ajustar rutas de imágenes si no son absolutas (http/https)
        const fixImgPath = (path) => {
            if (!path) return '/assets/images/img/logo.png';
            if (path.startsWith('http')) return path;
            if (path.startsWith('/')) return path; // Asume ruta absoluta desde root
            // Si es relativa (assets/...), ajustar según ubicación
            return isPagesDir ? `../${path}` : `./${path}`;
        };

        let imagenPrincipal = imagenes.length > 0 ? fixImgPath(imagenes[0]) : (isPagesDir ? '../assets/images/img/logo.png' : './assets/images/img/logo.png');
        const fallbackImg = isPagesDir ? '../assets/images/img/logo.png' : './assets/images/img/logo.png';

        // Determinar status y clases
        let statusClass = 'available';
        let statusText = 'Disponible';
        
        if (h.status === 'occupied') {
            statusClass = 'occupied';
            statusText = 'Ocupado';
        } else if (h.status === 'maintenance') {
            statusClass = 'maintenance';
            statusText = 'Mantenimiento';
        }

        card.innerHTML = `
            <div class="status-badge-card ${statusClass}">
                <div class="status-dot"></div>
                <span>${statusText}</span>
            </div>
            <div class="alternativa-image">
                <img src="${imagenPrincipal}" class="main-image" alt="${h.nombre}" onerror="this.src='${fallbackImg}'">
                <span class="image-counter">
                    <i class="fa-solid fa-image"></i> ${imagenes.length}
                </span>
            </div>
            <div class="alternativa-body">
                <h3 class="alternativa-name">${h.nombre}</h3>
                <p class="alternativa-location">
                    <i class="fa-solid fa-map-pin"></i> ${h.zona || 'Ciudad de México'}
                </p>
                <p class="alternativa-desc">${h.descripcion || ''}</p>
                
                <div class="style-selector">
                    ${h.estilos.map((e, i) => {
                        // Normalizar imágenes para cada estilo también
                        let imgs = e.imagenes || [];
                        if (typeof imgs === 'string') imgs = [imgs];
                        else if (!Array.isArray(imgs)) imgs = [];
                        
                        // Fix image paths for data attribute
                        const fixedImgs = imgs.map(img => fixImgPath(img));

                        return `
                        <button class="style-btn ${i === 0 ? 'active' : ''}" 
                                data-images='${JSON.stringify(fixedImgs)}' 
                                data-price="${e.precio}">
                            ${e.nombre}
                        </button>
                    `}).join('')}
                </div>
                
                <div class="alternativa-footer">
                    <div class="price-container">
                        <span class="alternativa-price">$${estiloInicial.precio.toLocaleString()}</span>
                        <span class="price-period">por mes</span>
                    </div>
                    <a href="${detailsPath}" class="btn-primary">
                        Ver detalle
                    </a>
                </div>
            </div>
        `;

        initStyleSelector(card);
        return card;
    }

    // Inicializar lógica de selector de estilos
    function initStyleSelector(card) {
        const buttons = card.querySelectorAll('.style-btn');
        const image = card.querySelector('.main-image');
        const price = card.querySelector('.alternativa-price');
        const counter = card.querySelector('.image-counter');

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                try {
                    const images = JSON.parse(btn.dataset.images);
                    if (images && images.length > 0) {
                        image.style.opacity = '0';
                        setTimeout(() => {
                            image.src = images[0];
                            image.style.opacity = '1';
                        }, 200);
                        
                        if (counter) {
                            counter.innerHTML = `<i class="fa-solid fa-image"></i> ${images.length}`;
                        }
                    }
                } catch (err) {
                    console.error('Error parsing images JSON', err);
                }

                const newPrice = Number(btn.dataset.price);
                if (!isNaN(newPrice)) {
                    price.textContent = `$${newPrice.toLocaleString()}`;
                }
            });
        });
    }

    function showErrorState(msg) {
        const grid = document.getElementById('habitaciones-grid');
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: #e53e3e; padding: 2rem;">
                    <i class="fa-solid fa-triangle-exclamation fa-2x"></i>
                    <p style="margin-top: 1rem;">${msg || 'Error al cargar datos.'}</p>
                </div>
            `;
        }
    }

    // Ejecutar al cargar
    document.addEventListener('DOMContentLoaded', () => {
        // Pequeño delay para asegurar que scripts externos carguen si hay race condition
        setTimeout(checkAvailability, 100);
    });

})(); // Fin IIFE
