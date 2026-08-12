/* ── TIMELINE · COVERFLOW ──────────────────────────────────────
   One shared value (pos, 0..N-1) derived from scroll position drives
   everything — card scale/position, the year roller, the glass
   scrubber handle, and the detail panel. Every input (scroll, card
   drag, handle drag, side-card click) resolves to a scroll position,
   so nothing can desync. ── */
(function () {
  if (!window.matchMedia('(max-width: 768px)').matches) return;  // desktop → the card deck handles the Timeline
  var track = document.getElementById('timeline');
  var stage = document.getElementById('cfStage');
  if (!track || !stage) return;

  var M = [
    {y:"2017",t:"Aerospace Engineering — Nashik",s:"B.Tech at Sandip University. Hostel years, building independence.",b:"The original plan was the Indian Air Force. When the military entrance exam didn't go the way I hoped, I didn't stop — I redirected. Aerospace Engineering at Sandip University was the closest path to the same world. First time living away from Mumbai, first time truly on my own. Hostel life in Nashik taught me more about self-reliance than any module on the course."},
    {y:"2020",t:"Covid. Home. Online.",s:"Degree moves online. Completed from Mumbai.",b:"The pandemic sent everyone home. The final year of my degree moved online, completed from Mumbai. Not how I imagined it ending — but it ended. The plan adapted, as it always does. Looking back, that quiet period at home was the last before everything accelerated."},
    {y:"2021",t:"Cranfield University, UK",s:"MSc Astronautics and Space Engineering. The UK chapter begins.",b:"My first time outside India. Arriving in the UK was both overwhelming and exciting in equal measure — a new country, new culture, new weather, new everything. Getting used to public transport, finding your way around, learning how things work here. The MSc in Astronautics and Space Engineering at Cranfield was the goal, but the bigger education was simply learning to navigate a completely unfamiliar world and finding your footing in it."},
    {y:"2021",t:"Marks & Spencer",s:"Milton Keynes, then Bedford. Communication skills built deliberately.",b:"Moved to Milton Keynes first as an Operations Assistant, then deliberately transferred to Bedford as a Customer Assistant — specifically to build the communication and customer-facing skills I knew I'd need in an office environment. The Bedford store was undergoing a full refurbishment at the time: layout redesign, new equipment, new branding — all while the store stayed open and trading continued normally. Without knowing it at the time, I was watching live-environment programme delivery from the inside. It left an impression."},
    {y:"2022",t:"Safran Engineering Services UK",s:"Joined as intern. The call came six months after applying.",b:"Applied and waited. Six months of silence — long enough to almost move on. Then the call came. Joined as a PMO intern and spent the first weeks understanding every process, replicating what I was taught, asking questions. Three months in, my managers told me I had effectively replaced the person who trained me — someone who had been there four years. That moment changed something. The responsibility felt real, but so did the validation. I realised I was here to stay."},
    {y:"2025",t:"Project Management Officer",s:"Full PMO role. Dashboards built. Five departments coordinated daily.",b:"Full PMO role. Built Power BI dashboards that replaced manual reporting and are now used daily across multiple departments. Automated a daily report that used to take 45 minutes — now takes 10. Coordinated across five departments simultaneously. Drove continuous improvement initiatives across three phases. The work compounded — each thing built on the last."},
    {y:"2026",t:"PMP Certified ✦",s:"Project Management Professional — PMI. Certified May 2026.",b:"Project Management Professional — certified by PMI in May 2026. The globally recognised equivalent of APM PMQ. Months of structured preparation, mock exams, and applied learning from three years of live programme delivery. Earning it wasn't just about the credential — it was about proving to myself that the foundation I'd built was solid. The next chapter is being written."}
  ];
  var N = M.length;

  /* ── tunables ── */
  var SIDE_SCALE = 0.33;   // resting size of a side card (≈ 30–35% of centre)
  var GAP = 26;            // px gap between the edges of adjacent cards at rest

  var scrub = document.getElementById('cfScrub');
  var handle = document.getElementById('cfHandle');
  var fill = document.getElementById('cfFill');
  var detail = document.getElementById('cfDetail');
  var yearRoll = document.getElementById('cfYearRoll');
  var root = document.documentElement;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = function () { return window.matchMedia('(max-width: 700px)').matches; };
  function maxSide() { return isMobile() ? 1 : 2; }

  /* build cards / stories / year items / ticks */
  var cards = [];
  M.forEach(function (m, i) {
    var c = document.createElement('div'); c.className = 'cf-card'; c.dataset.i = i;
    c.innerHTML = '<div class="cf-card-inner"><div class="cf-ti">' + m.t + '</div><div class="cf-su">' + m.s + '</div></div>';
    stage.appendChild(c); cards.push(c);

    var s = document.createElement('div'); s.className = 'cf-story';
    s.innerHTML = '<div class="cf-bd">' + m.b + '</div>';
    detail.appendChild(s); M[i].storyEl = s;

    var yi = document.createElement('div'); yi.className = 'cf-yritem'; yi.textContent = m.y; yearRoll.appendChild(yi);
  });
  var stories = M.map(function (m) { return m.storyEl; });
  var ticks = [];
  for (var k = 0; k < N; k++) {
    var tk = document.createElement('div'); tk.className = 'cf-tick'; tk.style.left = (k / (N - 1) * 100) + '%';
    scrub.appendChild(tk); ticks.push(tk);
  }

  /* ── geometry ── */
  function cardW() { return cards[0].offsetWidth; }
  function d1() { var W = cardW(); return W / 2 + GAP + (W * SIDE_SCALE) / 2; }
  function dStep() { var W = cardW(); return W * SIDE_SCALE + GAP; }
  function Xcard(off) {
    var a = Math.abs(off), sgn = off < 0 ? -1 : 1, ms = maxSide(), x;
    if (a <= 1) x = d1() * a;
    else if (a <= ms) x = d1() + (a - 1) * dStep();
    else x = d1() + (ms - 1) * dStep() + (a - ms) * (window.innerWidth * 0.7);
    return sgn * x;
  }
  function Scard(a) { return a <= 1 ? 1 - (1 - SIDE_SCALE) * a : SIDE_SCALE; }

  /* ── single source of truth: scroll → pos ── */
  function metrics() { var r = track.getBoundingClientRect(); return { top: window.scrollY + r.top, len: Math.max(1, track.offsetHeight - window.innerHeight) }; }
  function posVal() { var mt = metrics(); return Math.max(0, Math.min(1, (window.scrollY - mt.top) / mt.len)) * (N - 1); }
  function scrollForPos(p) { var mt = metrics(); return mt.top + (Math.max(0, Math.min(N - 1, p)) / (N - 1)) * mt.len; }

  function render() {
    var pos = posVal();
    yearRoll.style.transform = 'translateY(' + (-pos * 58) + 'px)';
    var dw = detail.clientWidth;
    for (var i = 0; i < N; i++) {
      var off = i - pos, a = Math.abs(off);
      cards[i].style.transform = 'translateX(' + Xcard(off) + 'px) scale(' + Scard(a) + ')';
      cards[i].style.zIndex = String(100 - Math.round(a * 10));
      cards[i].style.pointerEvents = a < 3 ? 'auto' : 'none';
      var sx = off * dw * 1.04, ss = a <= 1 ? 1 - 0.28 * a : 0.72;
      stories[i].style.transform = 'translateX(' + sx + 'px) scale(' + ss + ')';
      stories[i].style.zIndex = String(100 - Math.round(a * 10));
    }
    var pct = pos / (N - 1) * 100;
    handle.style.left = pct + '%'; fill.style.width = pct + '%';
    var cur = Math.round(pos);
    for (var t = 0; t < N; t++) ticks[t].classList.toggle('done', t <= cur);
  }

  var ticking = false;
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { render(); ticking = false; }); } }, { passive: true });
  window.addEventListener('resize', render);

  /* ── programmatic scroll (bypasses the site's smooth scroll-behavior) ── */
  function setAuto() { root.style.scrollBehavior = 'auto'; }
  function setSmooth() { root.style.scrollBehavior = ''; }
  function tweenToPos(p) {
    p = Math.max(0, Math.min(N - 1, p));
    var y1 = scrollForPos(p);
    if (reduce) { setAuto(); window.scrollTo(0, y1); setSmooth(); return; }
    setAuto();
    var y0 = window.scrollY, t0 = performance.now(), dur = 460;
    (function step(now) {
      var kk = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - kk, 3);
      window.scrollTo(0, y0 + (y1 - y0) * e);
      if (kk < 1) requestAnimationFrame(step); else setSmooth();
    })(performance.now());
  }
  function snap() { tweenToPos(Math.round(posVal())); }

  /* scrubber handle */
  (function () {
    var drag = false;
    function xToPos(cx) { var r = scrub.getBoundingClientRect(); return Math.max(0, Math.min(1, (cx - r.left) / r.width)) * (N - 1); }
    handle.addEventListener('pointerdown', function (e) { drag = true; setAuto(); handle.setPointerCapture(e.pointerId); handle.classList.add('grabbing'); e.preventDefault(); });
    handle.addEventListener('pointermove', function (e) { if (drag) window.scrollTo(0, scrollForPos(xToPos(e.clientX))); });
    handle.addEventListener('pointerup', function () { if (drag) { drag = false; handle.classList.remove('grabbing'); snap(); } });
    scrub.addEventListener('pointerdown', function (e) { if (e.target !== handle) tweenToPos(Math.round(xToPos(e.clientX))); });
  })();

  /* drag / swipe the cards; a click (no move) centres the card */
  (function () {
    var drag = false, sx = 0, sc = 0, moved = false, startCard = null;
    stage.addEventListener('pointerdown', function (e) { drag = true; moved = false; sx = e.clientX; sc = window.scrollY; startCard = e.target.closest('.cf-card'); setAuto(); stage.setPointerCapture(e.pointerId); stage.classList.add('grabbing'); });
    stage.addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; var mt = metrics(); window.scrollTo(0, sc - (dx / d1()) * (mt.len / (N - 1))); });
    stage.addEventListener('pointerup', function () { if (!drag) return; drag = false; stage.classList.remove('grabbing'); if (moved) snap(); else if (startCard) tweenToPos(+startCard.dataset.i); });
  })();

  render();
})();
