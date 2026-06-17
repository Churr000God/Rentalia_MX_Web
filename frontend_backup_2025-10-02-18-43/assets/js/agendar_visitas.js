document.addEventListener("DOMContentLoaded", () => {
  // Inicializar el datepicker
  flatpickr("#fecha", {
    locale: "es",
    minDate: "today",
    maxDate: new Date().fp_incr(30), // 30 días desde hoy
    disable: [
      function(date) {
        // Deshabilitar fines de semana
        return (date.getDay() === 0 || date.getDay() === 6);
      }
    ]
  });

  // Cargar propiedades disponibles
  fetch("/api/habitaciones")
    .then(res => res.json())
    .then(data => {
      const disponibles = data.filter(h => h.disponible);
      const selectPropiedad = document.getElementById("propiedad");
      
      disponibles.forEach(prop => {
        const option = document.createElement("option");
        option.value = prop.id;
        option.textContent = `${prop.nombre} - ${prop.ubicacion}`;
        selectPropiedad.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Error al cargar propiedades:", err);
    });

  // Manejar el envío del formulario
  const visitaForm = document.getElementById("visita-form");
  
  visitaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const formData = new FormData(visitaForm);
    const visitaData = Object.fromEntries(formData.entries());
    
    // Validación adicional
    if (!visitaData.fecha || !visitaData.hora) {
      alert("Por favor selecciona una fecha y hora válida");
      return;
    }
    
    // Enviar datos al servidor
    fetch("/api/agendar-visita", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(visitaData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error al agendar visita");
      }
      return response.json();
    })
    .then(data => {
      alert("¡Visita agendada con éxito! Te hemos enviado un correo de confirmación.");
      visitaForm.reset();
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Ocurrió un error al agendar tu visita. Por favor intenta nuevamente.");
    });
  });
});