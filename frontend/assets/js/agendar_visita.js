
let bookingData = { 
  property: null, 
  date: null, 
  time: null,
  name: null,
  email: null,
  phone: null,
  comments: null
}; 

// Fallback properties in case Supabase fails
let PROPERTIES = [ 
  { id: 1, name: 'Habitación Roma Norte', zona: 'Roma Norte' }, 
  { id: 2, name: 'Estudio Condesa', zona: 'Condesa' } 
]; 

document.addEventListener('DOMContentLoaded', () => { 
  loadProperties(); 
  checkUrlParams();

  // Initialize Flatpickr
  flatpickr('#fecha', { 
    locale: 'es', 
    minDate: 'today', 
    disable: [
        function(date) {
            return (date.getDay() === 0); // Disable Sundays
        }
    ],
    onChange: (_, dateStr) => { 
      bookingData.date = dateStr; 
      updateSummary(); 
    } 
  }); 

  renderTimeSlots(); 
}); 

async function loadProperties() { 
  const container = document.getElementById('propertySelector'); 
  container.innerHTML = '<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i> Cargando propiedades...</div>';

  try {
      // Try fetching from Supabase if available
      if (typeof supabase !== 'undefined') {
          const SUPABASE_URL = 'https://snsyusgwbqwamkwoijeb.supabase.co';
          const SUPABASE_KEY = 'sb_publishable_laiHFnnD5NDCrAWPweRsSw_F2ARqa_n';
          const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
          
          const { data, error } = await client
              .from('habitaciones')
              .select('id, nombre, zona, status')
              .eq('status', 'available');
              
          if (!error && data && data.length > 0) {
              PROPERTIES = data.map(p => ({
                  id: p.id,
                  name: p.nombre,
                  zona: p.zona
              }));
          }
      }
  } catch (e) {
      console.warn('Supabase not available, using static data', e);
  }

  // Render properties
  container.innerHTML = PROPERTIES.map(p => ` 
    <div class="property-option" onclick="selectProperty('${p.id}', this)" data-id="${p.id}"> 
      <div class="prop-info">
          <strong>${p.name}</strong>
          <div style="font-size: 0.85rem; color: #718096;">${p.zona || 'CDMX'}</div>
      </div>
      <i class="fa-regular fa-circle-check" style="color: #cbd5e0; font-size: 1.2rem;"></i>
    </div> 
  `).join(''); 
  
  // Re-select if needed (from URL params)
  if (bookingData.property) {
      const el = container.querySelector(`div[data-id="${bookingData.property.id}"]`);
      if (el) selectProperty(bookingData.property.id, el);
  }
} 

function selectProperty(id, element) { 
  // Handle if element is not passed (called programmatically)
  if (!element) {
      element = document.querySelector(`.property-option[data-id="${id}"]`);
  }
  
  // Find property by ID (handle string/number difference)
  bookingData.property = PROPERTIES.find(p => p.id == id); 
  
  if (bookingData.property) {
      document.querySelectorAll('.property-option').forEach(el => {
          el.classList.remove('selected');
          const icon = el.querySelector('.fa-circle-check');
          if(icon) {
              icon.className = 'fa-regular fa-circle-check';
              icon.style.color = '#cbd5e0';
          }
      }); 
      
      if (element) {
          element.classList.add('selected');
          const icon = element.querySelector('.fa-circle-check');
          if(icon) {
              icon.className = 'fa-solid fa-circle-check';
              icon.style.color = '#ff6b00';
          }
      }
      
      updateSummary(); 
  }
} 

function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const habitacionId = params.get('habitacion');
    if (habitacionId) {
        // We set the ID, but we wait for loadProperties to find the object
        // Temporary object until loaded
        bookingData.property = { id: habitacionId };
    }
}

function renderTimeSlots() { 
  // Expanded time slots
  const slots = ['09:00','10:00','11:00','12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  document.getElementById('timeSlots').innerHTML = 
    slots.map(t => 
      `<div class="time-slot" onclick="selectTime('${t}',this)">${t}</div>` 
    ).join(''); 
} 

function selectTime(time, el) { 
  bookingData.time = time; 
  document.querySelectorAll('.time-slot').forEach(e => e.classList.remove('selected')); 
  el.classList.add('selected'); 
  updateSummary(); 
} 

function nextStep(step) { 
  // Validation
  if (step === 2 && !bookingData.property) {
      alert('Por favor selecciona una propiedad');
      return;
  }
  if (step === 3 && (!bookingData.date || !bookingData.time)) {
      alert('Por favor selecciona fecha y hora');
      return;
  }
  if (step === 4) {
      // Capture form data from Step 3
      const name = document.getElementById('nombre').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('telefono').value;
      const comments = document.getElementById('comentarios').value;
      
      if (!name || !email || !phone) {
          alert('Por favor completa tus datos de contacto');
          return;
      }
      
      bookingData.name = name;
      bookingData.email = email;
      bookingData.phone = phone;
      bookingData.comments = comments;
      
      renderConfirmation();
  }
  
  showStep(step); 
} 

function prevStep(step) { 
  showStep(step); 
} 

function showStep(step) { 
  // Update Form Steps
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active')); 
  document.getElementById(`step${step}`).classList.add('active'); 
  
  // Update Progress Bar (Visual)
  const totalSteps = 4;
  const progressLine = document.getElementById('progressLine');
  const progressPercentage = ((step - 1) / (totalSteps - 1)) * 100;
  if (progressLine) progressLine.style.width = `${progressPercentage}%`;
  
  // Update Step Circles
  document.querySelectorAll('.step').forEach((el, index) => {
      const stepNum = index + 1;
      el.classList.remove('active', 'completed');
      if (stepNum === step) {
          el.classList.add('active');
      } else if (stepNum < step) {
          el.classList.add('completed');
      }
  });
} 

function updateSummary() { 
  const propName = document.getElementById('summaryProperty');
  const dateEl = document.getElementById('summaryDate');
  const timeEl = document.getElementById('summaryTime');

  if(propName) propName.innerHTML = `<strong>Propiedad:</strong> <span>${bookingData.property?.name || '-'}</span>`;
  if(dateEl) dateEl.innerHTML = `<strong>Fecha:</strong> <span>${bookingData.date || '-'}</span>`;
  if(timeEl) timeEl.innerHTML = `<strong>Hora:</strong> <span>${bookingData.time || '-'}</span>`;
} 

function renderConfirmation() {
    const summary = document.getElementById('confirmationSummary');
    if (summary) {
        summary.innerHTML = `
            <div style="background: #f7fafc; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0;">
                <p><strong>Propiedad:</strong> ${bookingData.property?.name}</p>
                <p><strong>Fecha:</strong> ${bookingData.date} a las ${bookingData.time}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 1rem 0;">
                <p><strong>Nombre:</strong> ${bookingData.name}</p>
                <p><strong>Email:</strong> ${bookingData.email}</p>
                <p><strong>Teléfono:</strong> ${bookingData.phone}</p>
            </div>
        `;
    }
}

document.getElementById('visitaForm').addEventListener('submit', async e => { 
  e.preventDefault(); 
  
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerText;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

  try {
      // Ensure we have all data (in case they edited inputs after reaching step 4)
      bookingData.name = document.getElementById('nombre').value;
      bookingData.email = document.getElementById('email').value;
      bookingData.phone = document.getElementById('telefono').value;
      bookingData.comments = document.getElementById('comentarios').value;

      await fetch('http://localhost:3000/api/visitas', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(bookingData) 
      }); 
    
      document.querySelectorAll('.form-step').forEach(s => s.style.display='none'); 
      document.getElementById('successMessage').style.display='block'; 
      document.querySelector('.progress-steps').style.display = 'none';
      
  } catch (error) {
      console.error(error);
      alert('Hubo un error al agendar la visita.');
      btn.disabled = false;
      btn.innerText = originalText;
  }
});
