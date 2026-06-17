/* =====================================================
   HERO – Slider de fondo (Rentalia)
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero-background');
  const indicators = document.querySelectorAll('.indicator');
  const totalSlides = slides.length;

  if (!slides.length) return;

  let currentSlide = 0;
  let intervalId = null;
  const SLIDE_TIME = 5000;

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(dot => dot.classList.remove('active'));

    currentSlide = (index + totalSlides) % totalSlides;

    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function resetInterval() {
    clearInterval(intervalId);
    intervalId = setInterval(nextSlide, SLIDE_TIME);
  }

  // Click en indicadores
  indicators.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.slide);
      showSlide(index);
      resetInterval();
    });
  });

  // Inicio automático
  intervalId = setInterval(nextSlide, SLIDE_TIME);
});
