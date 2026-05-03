// Conecta el form de la landing al worker fenix-leads-proxy -> Holded CRM.
// Funciona con cualquier form .cta-form que renderice el bundler React,
// independientemente de cuando aparezca en el DOM.
//
// Worker: https://fenix-leads-proxy.proveedores-702.workers.dev (CF Workers)
// Fallback historico: el form llevaba action a formspree.io con placeholder
// REPLACE_WITH_FORMSPREE_ID. Lo interceptamos antes de que se dispare.

(function () {
  'use strict';

  var ENDPOINT = 'https://fenix-leads-proxy.proveedores-702.workers.dev';
  var SOURCE = 'vodacontrol.com';
  var PRODUCT = 'vodacontrol';

  function isLeadForm(el) {
    if (!el || el.tagName !== 'FORM') return false;
    if (el.classList && el.classList.contains('cta-form')) return true;
    var action = (el.getAttribute('action') || '').toLowerCase();
    return action.indexOf('formspree.io') !== -1;
  }

  function showFeedback(form, kind, msg) {
    // kind: 'success' | 'error'
    var existing = form.querySelector('.holded-feedback');
    if (existing) existing.remove();
    var bg = kind === 'success' ? '#16A34A' : '#E60000';
    var div = document.createElement('div');
    div.className = 'holded-feedback';
    div.setAttribute('role', kind === 'success' ? 'status' : 'alert');
    div.style.cssText = [
      'margin-top: 12px',
      'padding: 10px 14px',
      'border-radius: 6px',
      'background: ' + bg,
      'color: #FFFFFF',
      'font-size: 14px',
      'font-weight: 500',
      'line-height: 1.4',
    ].join(';');
    div.textContent = msg;
    form.appendChild(div);
  }

  function setSubmitState(form, sending) {
    var btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    if (sending) {
      btn.dataset.holdedOriginalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Enviando...';
    } else if (btn.dataset.holdedOriginalText) {
      btn.disabled = false;
      btn.textContent = btn.dataset.holdedOriginalText;
      delete btn.dataset.holdedOriginalText;
    }
  }

  function fieldValue(form, names) {
    for (var i = 0; i < names.length; i++) {
      var el = form.querySelector('[name="' + names[i] + '"]');
      if (el && el.value) return el.value.trim();
    }
    return '';
  }

  async function handleSubmit(form) {
    var name = fieldValue(form, ['nombre', 'name']);
    var company = fieldValue(form, ['empresa', 'company']);
    var email = fieldValue(form, ['email']);
    var activaciones = fieldValue(form, ['activaciones', 'activations']);

    if (!name || !email) {
      showFeedback(form, 'error', 'Falta nombre o email.');
      return;
    }

    var payload = {
      name: name,
      company: company,
      email: email,
      source: SOURCE,
      product: PRODUCT,
      privacy_accepted: true,
      privacy_accepted_at: new Date().toISOString(),
      // El worker mete `note` desde su propia plantilla; mandamos
      // activaciones/mes como campo extra para que quede en tags y
      // (si en el futuro modificamos el worker) en notes.
      activaciones: activaciones,
    };

    setSubmitState(form, true);
    try {
      var res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      var data = null;
      try { data = await res.json(); } catch (e) { /* ignore */ }
      if (res.ok && data && data.ok) {
        showFeedback(form, 'success', 'Gracias. Te escribimos en menos de 24 horas.');
        form.reset();
      } else {
        var err = (data && (data.error || data.message)) || ('HTTP ' + res.status);
        showFeedback(form, 'error', 'No se pudo enviar (' + err + '). Escribe a hola@fenixia.tech.');
      }
    } catch (e) {
      showFeedback(form, 'error', 'Error de red. Escribe a hola@fenixia.tech.');
    } finally {
      setSubmitState(form, false);
    }
  }

  // Capture-phase listener: interceptamos antes de que el form intente postear
  // a formspree. document es estable aunque el bundler React reemplace el body.
  document.addEventListener('submit', function (e) {
    if (!isLeadForm(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(e.target);
  }, true);
})();
