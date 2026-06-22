/* agendar.js — Página "Agendar visita" (rediseño 2026)
   Supabase: vefgwrxgfuzgfictdsyo (proyecto nuevo, igual que detalle/alternativas)
   Backend : POST http://localhost:8000/api/visitas (FastAPI)
*/
(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────────── */
  const SUPABASE_URL  = 'https://vefgwrxgfuzgfictdsyo.supabase.co';
  const SUPABASE_KEY  = 'sb_publishable_3Dew0GfB8vlUnItNfBm0Xw_5vMDArZM';
  const API_BASE      = 'http://localhost:8000';
  const WA_NUMBER     = '5215523215421';

  /* ── Supabase cliente ────────────────────────────────────── */
  let db = null;
  if (window.supabase && window.supabase.createClient) {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  /* ── Cargar habitaciones en el <select> ──────────────────── */
  async function loadHabitaciones() {
    const sel = document.getElementById('f-cuarto');
    if (!sel || !db) return;

    try {
      const { data, error } = await db
        .from('habitaciones')
        .select('id, nombre, precio_min, status')
        .in('status', ['disponible', 'available', 'activa'])
        .order('nombre');

      if (error || !data || data.length === 0) return;

      // Limpiar opciones previas excepto el placeholder
      while (sel.options.length > 1) sel.remove(1);

      data.forEach(function (h) {
        const opt = document.createElement('option');
        opt.value = h.id;
        opt.textContent = h.nombre +
          (h.precio_min ? (' — $' + Number(h.precio_min).toLocaleString('es-MX') + '/mes') : '');
        sel.appendChild(opt);
      });

      // Prefill desde ?habitacion=<id>
      const param = new URLSearchParams(window.location.search).get('habitacion');
      if (param && sel.querySelector('option[value="' + param + '"]')) {
        sel.value = param;
      }
    } catch (e) {
      console.warn('agendar.js: no se cargaron habitaciones', e);
    }
  }

  /* ── Sanitización ────────────────────────────────────────── */
  function sanitize(str) {
    return String(str)
      .replace(/[<>]/g, '')            // sin ángulos HTML
      .replace(/javascript\s*:/gi, '') // sin js: protocol
      .replace(/on\w+\s*=/gi, '')      // sin event handlers inline
      .trim();
  }

  /* ── Normalización de teléfono ───────────────────────────── */
  function normalizePhone(v) {
    var d = v.replace(/\D/g, '');
    // +521XXXXXXXXXX → 10 dígitos  |  52XXXXXXXXXX → 10  |  XXXXXXXXXX → 10
    if (d.length === 13 && d.startsWith('521')) return d.slice(3);
    if (d.length === 12 && d.startsWith('52'))  return d.slice(2);
    if (d.length === 11 && d.startsWith('1'))   return d.slice(1); // NANP legacy
    return d;
  }

  /* ── Validadores ─────────────────────────────────────────── */
  const validators = {

    'f-nombre': function (v) {
      var s = v.trim();
      if (s.length < 2)  return 'Por favor dinos cómo te llamas (mín. 2 caracteres).';
      if (s.length > 80) return 'El nombre es demasiado largo (máx. 80 caracteres).';
      if (/<|>|[{}[\]\\|^`]/.test(s))
                         return 'El nombre contiene caracteres no permitidos.';
      if (!/^[a-zA-ZÀ-ÿÑñüÜ\s'\-\.]+$/.test(s))
                         return 'El nombre solo puede contener letras, espacios y guiones.';
      return '';
    },

    'f-whatsapp': function (v) {
      var digits = normalizePhone(v);
      if (digits.length === 0)  return 'El número de WhatsApp es obligatorio.';
      if (digits.length !== 10) return 'Ingresa los 10 dígitos de tu número (ej. 55 1234 5678).';
      if (/^(\d)\1{9}$/.test(digits))
                                return 'Ingresa un número de teléfono real.';
      if (!/^[2-9]/.test(digits))
                                return 'El número no parece válido para México.';
      return '';
    },

    'f-email': function (v) {
      var s = v.trim().toLowerCase();
      if (s.length === 0)   return 'El correo electrónico es obligatorio.';
      if (s.length > 254)   return 'El correo es demasiado largo.';
      if (/\s/.test(s))     return 'El correo no puede contener espacios.';
      if (/<|>/.test(s))    return 'El correo contiene caracteres no permitidos.';
      // local@domain.tld  —  TLD mín. 2 chars
      if (!/^[^\s@]+@[^\s@]{2,}\.[a-zA-Z]{2,}$/.test(s))
                            return 'Revisa que el correo esté bien escrito (ej. nombre@dominio.com).';
      return '';
    },

  };

  function setError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var errEl = document.getElementById('err-' + fieldId.replace('f-', ''));
    if (!field) return;
    if (message) {
      field.classList.add('is-error');
      field.setAttribute('aria-invalid', 'true');
      if (errEl) errEl.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>' + message;
    } else {
      field.classList.remove('is-error');
      field.removeAttribute('aria-invalid');
      if (errEl) errEl.textContent = '';
    }
  }

  function clearErrors() {
    Object.keys(validators).forEach(function (id) { setError(id, ''); });
    var formErrors = document.getElementById('formErrors');
    if (formErrors) formErrors.textContent = '';
  }

  function validateAll() {
    var errors = [];
    Object.keys(validators).forEach(function (id) {
      var field = document.getElementById(id);
      if (!field) return;
      var msg = validators[id](field.value);
      setError(id, msg);
      if (msg) errors.push(msg);
    });
    return errors;
  }

  /* ── Validación en tiempo real (blur + input) ────────────── */
  Object.keys(validators).forEach(function (id) {
    var field = document.getElementById(id);
    if (!field) return;
    field.addEventListener('blur', function () {
      setError(id, validators[id](field.value));
    });
    field.addEventListener('input', function () {
      if (field.classList.contains('is-error')) {
        setError(id, validators[id](field.value));
      }
    });
  });

  /* ── Estado de éxito ─────────────────────────────────────── */
  function showSuccess() {
    var form        = document.getElementById('visitForm');
    var formSuccess = document.getElementById('formSuccess');
    if (!form || !formSuccess) return;
    form.setAttribute('hidden', '');
    formSuccess.removeAttribute('hidden');
    formSuccess.focus();
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── Submit ──────────────────────────────────────────────── */
  var form      = document.getElementById('visitForm');
  var submitBtn = document.getElementById('submitBtn');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    var errors = validateAll();
    if (errors.length) {
      var formErrors = document.getElementById('formErrors');
      if (formErrors) {
        formErrors.textContent =
          'Hay ' + errors.length + ' campo(s) que necesitan atención: ' + errors.join(' ');
      }
      var firstErr = form.querySelector('.is-error');
      if (firstErr) firstErr.focus();
      return;
    }

    var selEl = document.getElementById('f-cuarto');
    var habId   = selEl && selEl.value ? selEl.value : null;
    var habName = habId && selEl.options[selEl.selectedIndex]
      ? sanitize(selEl.options[selEl.selectedIndex].text.split(' — ')[0])
      : null;

    // Campos opcionales: sanitizar + límite de longitud
    var fechaRaw   = sanitize((document.getElementById('f-fecha')   || {}).value || '');
    var mensajeRaw = sanitize((document.getElementById('f-mensaje') || {}).value || '');

    if (fechaRaw.length > 200)   fechaRaw   = fechaRaw.slice(0, 200);
    if (mensajeRaw.length > 1000) mensajeRaw = mensajeRaw.slice(0, 1000);

    var payload = {
      nombre:            sanitize(document.getElementById('f-nombre').value),
      whatsapp:          normalizePhone(document.getElementById('f-whatsapp').value),
      email:             document.getElementById('f-email').value.trim().toLowerCase(),
      habitacion_id:     habId,
      habitacion_nombre: habName,
      fecha_preferida:   fechaRaw   || null,
      mensaje:           mensajeRaw || null,
    };

    // Limpiar nulos en texto vacío
    Object.keys(payload).forEach(function (k) {
      if (typeof payload[k] === 'string' && payload[k] === '') payload[k] = null;
    });

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    fetch(API_BASE + '/api/visitas', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) return res.json().then(function (d) { throw new Error(d.detail || 'Error del servidor'); });
        showSuccess();
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> Agendar mi visita';
        var formErrors = document.getElementById('formErrors');
        if (formErrors) {
          formErrors.textContent =
            'Hubo un problema al enviar. Intenta de nuevo o escríbenos por WhatsApp: wa.me/' + WA_NUMBER;
        }
        console.error('agendar.js submit error:', err);
      });
  });

  /* ── Init ────────────────────────────────────────────────── */
  loadHabitaciones();

}());
