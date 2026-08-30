/* ── EMAIL → FOLDER MORPH ICON ──────────────────────────────────
   Drives every .morph-icon on the page (Key Achievements card 2 + the
   hero stat band). Each icon: a single closed <path> (morph-path)
   interpolated between a 7-point envelope and a 7-point folder, plus a
   separate open <path> (morph-flap) — the envelope's flap seam — shown/
   hidden via stroke-dashoffset + opacity. Four-phase loop (~4.5s): hold
   envelope → morph → hold folder → morph back. Ported from the validated
   PoC (linear point lerp + a stroke-dash "draw" wipe). Each icon runs only
   while on screen; reduced-motion renders the static envelope resting state.
   Own IIFE + per-icon IntersectionObserver, per the project convention. ── */
(function () {
  var wraps = document.querySelectorAll('.morph-icon');
  if (!wraps.length) return;

  // 7-point closed shapes, index-matched so they interpolate cleanly.
  var envelope = [[3,7],[3,19],[21,19],[21,7],[12,7],[9,7],[4,7]];
  var folder   = [[3,7],[3,19],[21,19],[21,9],[11,9],[9,6],[4,6]];

  function toPath(pts) { return 'M' + pts.map(function (p) { return p.join(','); }).join(' L') + ' Z'; }
  function lerpPts(a, b, t) {
    return a.map(function (p, i) { return [ p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t ]; });
  }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  var HOLD = 1600;        // ms fully-drawn pause
  var MORPH = 650;        // ms morph duration
  var DASH_TOTAL = 140;   // outer-path "draw" wipe length
  var FLAP_LEN = 25;      // approx length of the two flap diagonals
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initMorph(wrap) {
    var path = wrap.querySelector('.morph-path');
    var flap = wrap.querySelector('.morph-flap');
    if (!path || !flap) return;

    // resting state (also the reduced-motion state): envelope, flap fully drawn
    path.style.strokeDasharray = DASH_TOTAL;
    path.style.strokeDashoffset = 0;
    path.setAttribute('d', toPath(envelope));
    flap.style.strokeDasharray = FLAP_LEN;
    flap.style.strokeDashoffset = 0;
    flap.style.opacity = 1;

    if (reduceMQ.matches) return;   // static envelope, no loop

    var phase = 'holdA';            // holdA → toFolder → holdB → toEmail → holdA…
    var phaseStart = 0, rafId = null, running = false;

    function loop(now) {
      if (!running) return;
      if (!phaseStart) phaseStart = now;
      var elapsed = now - phaseStart;

      if (phase === 'holdA') {
        path.setAttribute('d', toPath(envelope));
        path.style.strokeDashoffset = 0;
        flap.style.strokeDashoffset = 0; flap.style.opacity = 1;
        if (elapsed > HOLD) { phase = 'toFolder'; phaseStart = now; }
      } else if (phase === 'toFolder') {
        var t = Math.min(elapsed / MORPH, 1), e = easeInOutCubic(t);
        path.setAttribute('d', toPath(lerpPts(envelope, folder, e)));
        var drawT = t < 0.5 ? t * 2 : (1 - t) * 2;
        path.style.strokeDashoffset = DASH_TOTAL * (1 - drawT) * 0.35;
        // flap undraws quickly at the start, before the body finishes reshaping
        var flapT = Math.min(t / 0.4, 1);
        flap.style.strokeDashoffset = FLAP_LEN * flapT; flap.style.opacity = 1 - flapT;
        if (t >= 1) { phase = 'holdB'; phaseStart = now; }
      } else if (phase === 'holdB') {
        path.setAttribute('d', toPath(folder));
        path.style.strokeDashoffset = 0;
        flap.style.strokeDashoffset = FLAP_LEN; flap.style.opacity = 0;
        if (elapsed > HOLD) { phase = 'toEmail'; phaseStart = now; }
      } else if (phase === 'toEmail') {
        var t2 = Math.min(elapsed / MORPH, 1), e2 = easeInOutCubic(t2);
        path.setAttribute('d', toPath(lerpPts(folder, envelope, e2)));
        var drawT2 = t2 < 0.5 ? t2 * 2 : (1 - t2) * 2;
        path.style.strokeDashoffset = DASH_TOTAL * (1 - drawT2) * 0.35;
        // flap draws back in during the second half, after the body has reformed
        var flapT2 = Math.max((t2 - 0.5) / 0.5, 0);
        flap.style.strokeDashoffset = FLAP_LEN * (1 - flapT2); flap.style.opacity = flapT2;
        if (t2 >= 1) { phase = 'holdA'; phaseStart = now; }
      }
      rafId = requestAnimationFrame(loop);
    }

    function start() { if (running) return; running = true; phaseStart = 0; rafId = requestAnimationFrame(loop); }
    function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }

    // run only while this icon is visible
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
    }, { threshold: 0 });
    io.observe(wrap);

    // if reduced-motion gets switched on later, stop and settle on the resting state
    if (reduceMQ.addEventListener) {
      reduceMQ.addEventListener('change', function (ev) {
        if (!ev.matches) return;
        stop(); io.disconnect();
        path.setAttribute('d', toPath(envelope)); path.style.strokeDashoffset = 0;
        flap.style.strokeDashoffset = 0; flap.style.opacity = 1;
      });
    }
  }

  Array.prototype.forEach.call(wraps, initMorph);
})();
