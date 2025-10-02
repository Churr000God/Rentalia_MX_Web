document.addEventListener("DOMContentLoaded", () => {
  // Datos de preguntas frecuentes (en producción vendrían de una API)
  const faqs = [
    {
      id: 1,
      question: "¿Cómo puedo reservar una habitación en Rentalia?",
      answer: "Puedes reservar una habitación directamente a través de nuestro sitio web seleccionando la propiedad de tu interés y completando el formulario de reserva. También puedes contactarnos por teléfono o WhatsApp para asistencia personalizada.",
      category: "reservas"
    },
    {
      id: 2,
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos diversos métodos de pago incluyendo transferencia bancaria, tarjetas de crédito/débito (Visa, MasterCard, American Express), y pagos a través de plataformas digitales como PayPal y Mercado Pago.",
      category: "pagos"
    },
    {
      id: 3,
      question: "¿Están incluidos los servicios básicos en el precio?",
      answer: "Sí, todas nuestras habitaciones incluyen servicios básicos como agua, luz, internet de alta velocidad y acceso a áreas comunes. Algunos servicios adicionales como lavandería pueden tener costos extra.",
      category: "servicios"
    },
    {
      id: 4,
      question: "¿Cuál es la política de cancelación?",
      answer: "Para cancelaciones, requerimos un aviso mínimo de 30 días antes de la fecha de mudanza. En caso de cancelación anticipada, se reembolsará el depósito garantizado descontando los días utilizados.",
      category: "politicas"
    },
    {
      id: 5,
      question: "¿Puedo recibir visitas en mi habitación?",
      answer: "Sí, puedes recibir visitas siguiendo nuestras normas de convivencia. Las visitas deben registrarse en recepción y no pueden pernoctar más de 2 noches consecutivas sin autorización previa.",
      category: "habitaciones"
    },
    {
      id: 6,
      question: "¿Qué medidas de seguridad tienen las propiedades?",
      answer: "Todas nuestras propiedades cuentan con sistemas de seguridad 24/7 que incluyen cámaras de vigilancia, control de acceso y personal de seguridad. Además, cada habitación tiene su propia cerradura de seguridad.",
      category: "habitaciones"
    }
  ];

  const accordion = document.getElementById('faq-accordion');
  const searchInput = document.getElementById('faq-search-input');
  const searchBtn = document.getElementById('faq-search-btn');
  const categoryBtns = document.querySelectorAll('.category-btn');

  // Función para renderizar preguntas
  function renderFAQs(filteredFaqs = faqs) {
    accordion.innerHTML = '';
    
    if (filteredFaqs.length === 0) {
      accordion.innerHTML = `
        <div class="no-results">
          <p>No se encontraron preguntas que coincidan con tu búsqueda.</p>
        </div>
      `;
      return;
    }

    filteredFaqs.forEach(faq => {
      const faqItem = document.createElement('div');
      faqItem.className = 'faq-item';
      faqItem.innerHTML = `
        <div class="faq-question">
          <span>${faq.question}</span>
        </div>
        <div class="faq-answer">
          <div class="faq-answer-content">
            <p>${faq.answer}</p>
          </div>
        </div>
      `;
      accordion.appendChild(faqItem);
    });

    // Agregar event listeners a las preguntas
    document.querySelectorAll('.faq-question').forEach(question => {
      question.addEventListener('click', () => {
        const item = question.parentElement;
        item.classList.toggle('active');
        
        // Cerrar otros items abiertos
        document.querySelectorAll('.faq-item').forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
          }
        });
      });
    });
  }

  // Filtrado por búsqueda
  function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredFaqs = faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm) || 
      faq.answer.toLowerCase().includes(searchTerm)
    );
    renderFAQs(filteredFaqs);
  }

  searchInput.addEventListener('input', handleSearch);
  searchBtn.addEventListener('click', handleSearch);

  // Filtrado por categoría
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      if (category === 'todas') {
        renderFAQs();
      } else {
        const filteredFaqs = faqs.filter(faq => faq.category === category);
        renderFAQs(filteredFaqs);
      }
    });
  });

  // Renderizar todas las preguntas inicialmente
  renderFAQs();
});