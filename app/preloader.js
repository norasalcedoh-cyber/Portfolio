(function () {
  var el = document.getElementById('preloader');
  if (!el) return;

  // Generar estrellas dispersas
  for (var i = 0; i < 26; i++) {
    var s = document.createElement('span');
    s.className = 'preloader__star';
    s.textContent = '★';
    var sz  = (0.55 + Math.random() * 2.1).toFixed(2);
    var d   = (0.7  + Math.random() * 1.6).toFixed(2);
    var dl  = (Math.random() * 1.5).toFixed(2);
    var op  = (0.18 + Math.random() * 0.65).toFixed(2);
    var r0  = Math.round(Math.random() * 60 - 30);
    var r1  = Math.round(60 + Math.random() * 280);
    s.style.cssText =
      'left:'  + (Math.random() * 94).toFixed(1) + '%;' +
      'top:'   + (Math.random() * 94).toFixed(1) + '%;' +
      '--sz:'  + sz  + 'rem;' +
      '--d:'   + d   + 's;'   +
      '--dl:'  + dl  + 's;'   +
      '--op:'  + op  + ';'    +
      '--r0:'  + r0  + 'deg;' +
      '--r1:'  + r1  + 'deg;';
    el.appendChild(s);
  }

  // Estrella central
  var center = document.createElement('span');
  center.className = 'preloader__center';
  center.textContent = '★';
  el.appendChild(center);

  // Desmontar el preloader
  var dismissed = false;
  var startTime = Date.now();
  var MIN_MS    = 700;   // mínimo visible
  var MAX_MS    = 3500;  // máximo espera

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    el.classList.add('is-done');
    el.addEventListener('transitionend', function () { el.remove(); }, { once: true });
  }

  var safety = setTimeout(dismiss, MAX_MS);

  window.addEventListener('load', function () {
    var elapsed   = Date.now() - startTime;
    var remaining = Math.max(0, MIN_MS - elapsed);
    setTimeout(function () {
      clearTimeout(safety);
      dismiss();
    }, remaining);
  });
})();
