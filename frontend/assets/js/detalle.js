(function() {
    const SUPABASE_URL = 'https://snsyusgwbqwamkwoijeb.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_laiHFnnD5NDCrAWPweRsSw_F2ARqa_n';
    let supabaseClient = null;
    let currentHabitacion = null; // Store data globally within module

    document.addEventListener('DOMContentLoaded', () => {
        init();
    });

    async function init() {
        if (!initSupabase()) {
            showError('No se pudo inicializar la conexión.');
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (!id) {
            showError('No se especificó ninguna habitación.');
            return;
        }

        await loadRoomDetails(id);
    }

    function initSupabase() {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return true;
        }
        console.error('Librería Supabase no encontrada');
        return false;
    }

    async function loadRoomDetails(id) {
        try {
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
                        imagenes,
                        amenities
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Habitación no encontrada');

            currentHabitacion = data; // Save data
            console.log('Habitacion Data Loaded:', currentHabitacion); // Debug logging

            // Update Breadcrumb
            const breadcrumbRoom = document.getElementById('breadcrumb-room');
            if (breadcrumbRoom) {
                breadcrumbRoom.textContent = data.nombre;
            }

            renderDetails(0); // Render first style by default

        } catch (err) {
            console.error('Error cargando detalles:', err);
            showError('Ocurrió un error al cargar la información de la habitación.');
        }
    }

    // Moved fixPath out for reuse
    const fixPath = (path) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('//')) return path;
        let cleanPath = path;
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
        if (cleanPath.startsWith('./')) cleanPath = cleanPath.substring(2);
        if (cleanPath.startsWith('assets/')) {
            return '../' + cleanPath;
        }
        return path;
    };

    function renderDetails(styleIndex) {
        const container = document.getElementById('detalle-container');
        if (!container || !currentHabitacion) return;

        const habitacion = currentHabitacion;
        
        // Validation
        if (!habitacion.estilos || habitacion.estilos.length === 0) {
            showError('Esta habitación no tiene estilos configurados.');
            return;
        }

        if (styleIndex < 0 || styleIndex >= habitacion.estilos.length) {
            styleIndex = 0;
        }

        const estilo = habitacion.estilos[styleIndex];
        const imagenes = estilo.imagenes || [];
        
        console.log(`Renderizando estilo ${styleIndex}:`, estilo.nombre);
        console.log('Imagenes:', imagenes);

        let imagenPrincipal = imagenes.length > 0 ? imagenes[0] : '../assets/images/img/logo.png';
        imagenPrincipal = fixPath(imagenPrincipal);
        
        // Generar HTML de galería
        const galleryHTML = `
            <div class="gallery-container" style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 2rem;">
                <div class="main-image-wrapper" style="border-radius: 12px; overflow: hidden; height: 400px;">
                    <img id="main-image" src="${imagenPrincipal}" alt="${habitacion.nombre}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='../assets/images/img/logo.png'">
                </div>
                <div class="thumbnails" style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px;">
                    ${imagenes.map((img, idx) => {
                        let imgSrc = fixPath(img);
                        return `
                        <img src="${imgSrc}" 
                             class="thumb ${idx === 0 ? 'active' : ''}" 
                             style="width: 80px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid ${idx === 0 ? '#ff6b00' : 'transparent'}"
                             onclick="updateMainImage(this, '${imgSrc}')"
                             onerror="this.src='../assets/images/img/logo.png'">
                    `}).join('')}
                </div>
            </div>
        `;

        // Generar HTML de info
        const infoHTML = `
            <div class="info-container">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h1 style="font-size: 2.5rem; color: #1a202c; margin-bottom: 0.5rem;">${habitacion.nombre}</h1>
                        <p style="color: #718096; font-size: 1.1rem;">
                            <i class="fa-solid fa-map-pin" style="color: #ff6b00;"></i> ${habitacion.zona || 'Ubicación no especificada'}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 2rem; font-weight: bold; color: #ff6b00;">$${estilo.precio.toLocaleString()}</p>
                        <span style="color: #718096;">por mes</span>
                    </div>
                </div>

                <div class="description" style="margin-bottom: 2rem; line-height: 1.6; color: #4a5568;">
                    <h3>Descripción</h3>
                    <p>${habitacion.descripcion || 'Sin descripción disponible.'}</p>
                </div>

                <div class="styles-selector" style="margin-bottom: 2rem;">
                    <h3>Opciones Disponibles</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
                        ${habitacion.estilos.map((e, idx) => {
                            const isSelected = idx === styleIndex;
                            const bg = isSelected ? '#ff6b00' : '#f7fafc';
                            const color = isSelected ? 'white' : '#4a5568';
                            const border = isSelected ? '#ff6b00' : '#e2e8f0';
                            
                            return `
                            <span class="style-badge" 
                                  onclick="selectStyle(${idx})"
                                  style="background: ${bg}; padding: 8px 16px; border-radius: 20px; border: 1px solid ${border}; color: ${color}; cursor: pointer; transition: all 0.2s;">
                                ${e.nombre} - $${e.precio.toLocaleString()}
                            </span>
                        `}).join('')}
                    </div>
                </div>

                <div class="actions" style="margin-top: 2rem;">
                    <a href="./agendar_visita.html?habitacion=${habitacion.id}" class="btn btn-primary" style="background: #ff6b00; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">
                        Agendar Visita
                    </a>
                    <a href="https://wa.me/5523215421?text=Hola,%20me%20interesa%20la%20habitación%20${habitacion.nombre}%20(Estilo:%20${estilo.nombre})" target="_blank" class="btn btn-secondary" style="background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; margin-left: 10px;">
                        <i class="fa-brands fa-whatsapp"></i> Contactar
                    </a>
                </div>
            </div>
        `;

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr; gap: 2rem; max-width: 1200px; margin: 0 auto;">
                ${galleryHTML}
                ${infoHTML}
            </div>
        `;
    }

    // Exponer funciones globales
    window.updateMainImage = function(thumb, src) {
        const mainImg = document.getElementById('main-image');
        if (mainImg) mainImg.src = src;
        
        document.querySelectorAll('.thumb').forEach(t => t.style.borderColor = 'transparent');
        thumb.style.borderColor = '#ff6b00';
    };

    window.selectStyle = function(index) {
        renderDetails(index);
    };

    function showError(msg) {
        const container = document.getElementById('detalle-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-triangle-exclamation" style="color: #e53e3e; font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p style="color: #4a5568; font-size: 1.2rem;">${msg}</p>
                    <a href="../index.html" style="color: #ff6b00; text-decoration: underline; margin-top: 1rem; display: inline-block;">Volver al inicio</a>
                </div>
            `;
        }
    }
})();