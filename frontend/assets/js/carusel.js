        document.addEventListener('DOMContentLoaded', () => {
            // Inicializar Swiper
            const swiper = new Swiper('.amenities-swiper', {
                direction: 'horizontal',
                loop: true,
                grabCursor: true,
                slidesPerView: 1.2,
                spaceBetween: 20,
                centeredSlides: false,
                autoplay: {
                    delay: 3500, // Tiempo entre slides (ajustado para mejor ritmo)
                    disableOnInteraction: false, // Sigue rodando después de tocar
                    pauseOnMouseEnter: true, // Pausa al pasar el mouse (ideal para ver los efectos)
                    stopOnLastSlide: false,
                },
                breakpoints: {
                    480: { slidesPerView: 1.6, spaceBetween: 20 },
                    640: { slidesPerView: 2.2, spaceBetween: 24 },
                    768: { slidesPerView: 3, spaceBetween: 28 },
                    1024: { slidesPerView: 4, spaceBetween: 32 }
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    dynamicBullets: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev'
                },
                keyboard: {
                    enabled: true,
                    onlyInViewport: true
                },
                watchOverflow: true,
                effect: 'slide',
                speed: 600,
            });

            // Toggle entre vista carousel y grid
            const viewButtons = document.querySelectorAll('.view-btn');
            const swiperContainer = document.querySelector('.amenities-swiper');
            const gridContainer = document.getElementById('amenitiesGrid');

            viewButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const view = btn.dataset.view;
                    
                    viewButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    if (view === 'grid') {
                        swiperContainer.classList.add('hidden');
                        gridContainer.classList.add('active');
                        populateGrid();
                    } else {
                        swiperContainer.classList.remove('hidden');
                        gridContainer.classList.remove('active');
                    }
                });
            });

            // Poblar grid con las cards
            function populateGrid() {
                if (gridContainer.children.length > 0) return;
                
                const cards = document.querySelectorAll('.amenity-card');
                cards.forEach(card => {
                    const clone = card.cloneNode(true);
                    gridContainer.appendChild(clone);
                });
            }

            // Intersection Observer para animaciones
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.amenity-card').forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.6s ease';
                observer.observe(card);
            });
        });