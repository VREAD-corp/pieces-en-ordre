/* Pièces en ordre: checkboxes kept on this device only, print, price test, picker, Pack interest form. */
(function () {
  var BASE = '/pieces-en-ordre/';
  var SLUG_P = { ma: 'maroc', dz: 'algerie', tn: 'tunisie', sn: 'senegal', ci: 'cote-d-ivoire', cm: 'cameroun' };
  var SLUG_M = { famille: 'visite-familiale', tourisme: 'tourisme', affaires: 'affaires', stage: 'stage' };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }

  // Price test: 19 € (a) or 29 € (b), drawn once per browser.
  var variant = store('po_v');
  if (variant !== 'a' && variant !== 'b') { variant = Math.random() < 0.5 ? 'a' : 'b'; store('po_v', variant); }
  var price = variant === 'b' ? '29' : '19';
  document.querySelectorAll('[data-price]').forEach(function (el) { el.textContent = price; });

  // Picker on the home page: go to the static list.
  var picker = document.getElementById('choisir');
  if (picker) picker.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = picker.pays.value, m = picker.motif.value;
    if (!SLUG_P[p] || !SLUG_M[m]) { (p ? picker.motif : picker.pays).focus(); return; }
    if (window.poTrack) window.poTrack('checklist_select');
    location.href = BASE + SLUG_P[p] + '/' + SLUG_M[m] + '/';
  });

  // Checklist: state per list in localStorage, progress counter, print, reset.
  var boxes = document.querySelectorAll('input[type=checkbox][data-key]');
  var done = document.querySelector('[data-done]');
  function count() { if (done) done.textContent = String([].filter.call(boxes, function (b) { return b.checked; }).length); }
  boxes.forEach(function (b) {
    b.checked = store('po:' + b.dataset.key) === '1';
    b.addEventListener('change', function () { store('po:' + b.dataset.key, b.checked ? '1' : null); b.closest('.item').classList.toggle('ok', b.checked); count(); });
    b.closest('.item').classList.toggle('ok', b.checked);
  });
  count();
  var pr = document.querySelector('[data-print]');
  if (pr) pr.addEventListener('click', function () { if (window.poTrack) window.poTrack('checklist_print'); window.print(); });
  var rs = document.querySelector('[data-reset]');
  if (rs) rs.addEventListener('click', function () { boxes.forEach(function (b) { b.checked = false; store('po:' + b.dataset.key, null); b.closest('.item').classList.remove('ok'); }); count(); });

  // Pack interest form (fake door: nothing is charged).
  var form = document.getElementById('octave-pay');
  if (form) {
    var qs = new URLSearchParams(location.search);
    if (qs.get('pays') && form.country.querySelector('option[value="' + qs.get('pays') + '"]')) form.country.value = qs.get('pays');
    if (qs.get('motif') && form.purpose.querySelector('option[value="' + qs.get('motif') + '"]')) form.purpose.value = qs.get('motif');
    if (qs.get('role') === 'hote') form.querySelector('input[name=role][value=hote]').checked = true;
    var msg = form.querySelector('.form-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'form-msg';
      var email = form.email.value.trim();
      if (!form.country.value || !form.purpose.value) { msg.textContent = 'Choisissez le pays et le motif.'; msg.classList.add('err'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.textContent = 'Vérifiez l’adresse e-mail.'; msg.classList.add('err'); form.email.focus(); return; }
      if (!form.consent.checked) { msg.textContent = 'Cochez la case d’accord pour que nous puissions vous écrire.'; msg.classList.add('err'); return; }
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true; msg.textContent = 'Envoi…';
      var body = { action: 'preorder', email: email, country: form.country.value, purpose: form.purpose.value,
        role: (form.querySelector('input[name=role]:checked') || {}).value || 'autre', offer: 'pack-' + price, variant: variant,
        consent: true, consent_version: 'po-2026-10-13', page: location.pathname, website: form.website.value };
      fetch(form.dataset.endpoint, { method: 'POST', credentials: 'omit', body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) throw new Error(j.error || 'erreur');
          form.reset(); form.classList.add('sent');
          msg.textContent = 'C’est noté. Rien n’a été débité. Vous recevrez un seul e-mail à l’ouverture du paiement, au prix de ' + price + ' €. En attendant, les listes en ligne sont gratuites.';
          msg.classList.add('okmsg');
        })
        .catch(function () { msg.textContent = 'L’envoi a échoué. Réessayez, ou écrivez à octave@vread.fr.'; msg.classList.add('err'); })
        .then(function () { btn.disabled = false; });
    });
  }
})();
