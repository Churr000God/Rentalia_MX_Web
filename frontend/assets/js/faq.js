document.addEventListener("DOMContentLoaded", async () => {
    console.log('FAQ Script v5 iniciado');
    
    // 1. Configuración de Supabase
    const SUPABASE_URL = 'https://snsyusgwbqwamkwoijeb.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_laiHFnnD5NDCrAWPweRsSw_F2ARqa_n'; 
    
    let supabase = null;
    let allFaqs = []; 

    // Referencias al DOM
    const accordion = document.getElementById('faqAccordion');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryCards = document.querySelectorAll('.category-card');
    const noResults = document.getElementById('noResults');
    const questionsCount = document.getElementById('questionsCount');

    // Inicializar cliente
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Cliente Supabase creado');
    } else {
        console.error('Librería Supabase no cargada.');
        if(accordion) accordion.innerHTML = '<div style="color:red; text-align:center; padding:20px;">Error: Librería de conexión no cargada.</div>';
        return;
    }

    // 2. Obtener Datos de Supabase
    async function fetchFAQs() {
        if(questionsCount) questionsCount.innerText = 'Conectando con base de datos...';
        
        try {
            console.log('Intentando obtener FAQs...');
            // Consulta simple para debug
            const { data, error } = await supabase
                .from('faqs')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (error) {
                console.error('Error Supabase:', error);
                throw error;
            }

            console.log('Datos recibidos:', data);

            if (!data || data.length === 0) {
                console.warn('Conexión exitosa pero tabla vacía o bloqueada por RLS');
                accordion.innerHTML = `
                    <div style="text-align:center; padding:2rem; color:#666;">
                        <i class="fa-solid fa-database" style="font-size: 2rem; margin-bottom: 1rem; color: var(--color-primario);"></i>
                        <p>Conexión establecida, pero no hay preguntas visibles.</p>
                        <small>Si eres administrador: Verifica que insertaste datos en la tabla 'faqs' y que las políticas RLS permiten lectura pública.</small>
                    </div>`;
                if(questionsCount) questionsCount.innerText = '0 preguntas';
                return;
            }

            allFaqs = data;
            updateCategoryCounts();
            renderFAQs(allFaqs);

        } catch (err) {
            console.error('Error general fetching FAQs:', err);
            if(questionsCount) questionsCount.innerText = 'Error de conexión';
            accordion.innerHTML = `
                <div class="error-msg" style="text-align:center; padding:2rem; color:red;">
                    <p>No se pudieron cargar las preguntas.</p>
                    <small>${err.message || 'Error desconocido'}</small>
                </div>`;
        }
    }

    // 3. Función de Renderizado
    function renderFAQs(data) {
        accordion.innerHTML = '';
        
        const hasResults = data.length > 0;
        if(noResults) noResults.style.display = hasResults ? 'none' : 'block';
        accordion.style.display = hasResults ? 'block' : 'none';
        
        if(questionsCount) questionsCount.innerText = `Mostrando ${data.length} pregunta${data.length !== 1 ? 's' : ''}`;

        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'faq-item';
            
            // Icono según categoría (opcional, mapeo simple)
            let icon = 'fa-circle-question';
            if(item.category === 'pagos') icon = 'fa-credit-card';
            if(item.category === 'reservas') icon = 'fa-calendar-check';
            if(item.category === 'habitaciones') icon = 'fa-bed';
            
            div.innerHTML = `
                <div class="faq-question">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fa-solid ${icon}" style="color:var(--color-primario); opacity:0.7;"></i>
                        <span>${item.question}</span>
                    </div>
                    <i class="fa-solid fa-chevron-down" style="font-size:0.8em; color:#999;"></i>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        <p>${item.answer}</p>
                    </div>
                </div>
            `;
            
            const questionHeader = div.querySelector('.faq-question');
            questionHeader.addEventListener('click', () => {
                const isActive = div.classList.contains('active');
                
                // Cerrar otros (opcional, comportamiento acordeón estricto)
                // document.querySelectorAll('.faq-item').forEach(i => {
                //     i.classList.remove('active');
                //     i.querySelector('.faq-answer').style.maxHeight = null;
                // });

                if (!isActive) {
                    div.classList.add('active');
                    const answer = div.querySelector('.faq-answer');
                    answer.style.maxHeight = answer.scrollHeight + "px";
                    questionHeader.querySelector('.fa-chevron-down').style.transform = 'rotate(180deg)';
                } else {
                    div.classList.remove('active');
                    const answer = div.querySelector('.faq-answer');
                    answer.style.maxHeight = null;
                    questionHeader.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
                }
            });
            
            accordion.appendChild(div);
        });
    }

    // 4. Actualizar Contadores de Categoría
    function updateCategoryCounts() {
        const counts = { todas: allFaqs.length };
        allFaqs.forEach(f => {
            // Normalizar categoría (quitar espacios, minúsculas)
            const cat = f.category ? f.category.toLowerCase().trim() : 'otras';
            counts[cat] = (counts[cat] || 0) + 1;
        });

        categoryCards.forEach(card => {
            const cat = card.dataset.category;
            const badge = card.querySelector('.category-count');
            if (badge) {
                badge.innerText = counts[cat] !== undefined ? counts[cat] : 0;
            }
        });
    }

    // 5. Filtros
    const handleSearch = () => {
        const term = searchInput.value.toLowerCase().trim();
        
        const activeCategoryCard = document.querySelector('.category-card.active');
        const activeCategory = activeCategoryCard ? activeCategoryCard.dataset.category : 'todas';

        const filtered = allFaqs.filter(f => {
            const textMatch = f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term);
            const catMatch = activeCategory === 'todas' || (f.category && f.category.toLowerCase() === activeCategory);
            return textMatch && catMatch;
        });
        
        renderFAQs(filtered);
    };

    if(searchBtn) searchBtn.addEventListener('click', handleSearch);
    if(searchInput) searchInput.addEventListener('input', handleSearch);

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            handleSearch();
        });
    });

    // 6. Modal de Contacto y Envío de Preguntas
    const modal = document.getElementById('contactModal');
    const btnOpenContact = document.getElementById('btnOpenContact');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const contactForm = document.getElementById('contactForm');

    if(btnOpenContact && modal) {
        btnOpenContact.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default if it's a link, though it's a button now
            modal.classList.add('active');
        });
    }

    if(btnCloseModal && modal) {
        btnCloseModal.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    // Close on click outside
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    if(contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.innerText;
            
            submitBtn.disabled = true;
            submitBtn.innerText = 'Enviando...';

            const name = document.getElementById('userName').value;
            const email = document.getElementById('userEmail').value;
            const question = document.getElementById('userQuestion').value;

            try {
                const { error } = await supabase
                    .from('user_questions')
                    .insert([{ name, email, question }]);

                if (error) throw error;

                // Success UI
                const header = modal.querySelector('.modal-header');
                const originalHeaderContent = header.innerHTML;
                
                header.innerHTML = `
                    <i class="fa-solid fa-check-circle" style="font-size:3rem; color:#22c55e; margin-bottom:1rem;"></i>
                    <h3>¡Pregunta Enviada!</h3>
                    <p>Gracias por contactarnos. Te responderemos pronto a <strong>${email}</strong>.</p>
                `;
                contactForm.style.display = 'none';
                
                setTimeout(() => {
                    modal.classList.remove('active');
                    // Reset form after delay
                    setTimeout(() => {
                        contactForm.reset();
                        contactForm.style.display = 'flex';
                        header.innerHTML = `
                            <h3>Envíanos tu pregunta</h3>
                            <p>Te responderemos lo antes posible a tu correo electrónico.</p>
                        `;
                        submitBtn.disabled = false;
                        submitBtn.innerText = originalText;
                    }, 500);
                }, 3000);

            } catch (err) {
                console.error('Error enviando pregunta:', err);
                
                let userMsg = 'Hubo un error al enviar tu pregunta.';
                if (err.message && err.message.includes('Could not find the table')) {
                    userMsg = 'Error de configuración: La tabla de mensajes no existe en la base de datos.';
                } else if (err.message && err.message.includes('row-level security')) {
                    userMsg = 'Error de permisos: No tienes autorización para enviar mensajes.';
                }

                alert(userMsg + '\n\nDetalle técnico: ' + (err.message || 'Desconocido'));
                
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });
    }

    // Ejecutar
    fetchFAQs();
});
