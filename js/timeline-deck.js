/* ── TIMELINE · DESKTOP CARD DECK ───────────────────────────────
   One shared `current` index drives the deck, the vertical year scrubber
   and the year display. Next lifts the front card up-and-over the top to
   the back (3D arc); Prev reverses it. The scrubber jumps to a year using
   the SAME arc — stepping forward (Next) or backward (Prev). The year
   display and scrubber only move when the YEAR changes (adjacent same-year
   cards hold). Runs on desktop only; mobile uses the coverflow. ── */
(function () {
  var mq = window.matchMedia('(max-width: 768px)');
  // switch layouts cleanly if the viewport crosses the breakpoint
  mq.addEventListener('change', function () { location.reload(); });
  if (mq.matches) return;                 // mobile → the coverflow handles the Timeline

  var deck = document.getElementById('jdDeck');
  if (!deck) return;
  var yearRoll = document.getElementById('jdYearRoll'),
      handle = document.getElementById('jdHandle'), fill = document.getElementById('jdFill'),
      scrub = document.getElementById('jdScrub'), prevBtn = document.getElementById('jdPrev'), nextBtn = document.getElementById('jdNext');

  var M = [
    {y:"2017",t:"Aerospace Engineering — Nashik",s:"B.Tech at Sandip University. Hostel years, building independence.",b:"The original plan was the Indian Air Force. When the military entrance exam didn't go the way I hoped, I didn't stop — I redirected. Aerospace Engineering at Sandip University was the closest path to the same world. First time living away from Mumbai, first time truly on my own. Hostel life in Nashik taught me more about self-reliance than any module on the course."},
    {y:"2020",t:"Covid. Home. Online.",s:"Degree moves online. Completed from Mumbai.",b:"The pandemic sent everyone home. The final year of my degree moved online, completed from Mumbai. Not how I imagined it ending — but it ended. The plan adapted, as it always does. Looking back, that quiet period at home was the last before everything accelerated."},
    {y:"2021",t:"Cranfield University, UK",s:"MSc Astronautics and Space Engineering. The UK chapter begins.",b:"My first time outside India. Arriving in the UK was both overwhelming and exciting in equal measure — a new country, new culture, new weather, new everything. The MSc in Astronautics and Space Engineering at Cranfield was the goal, but the bigger education was simply learning to navigate a completely unfamiliar world and finding your footing in it."},
    {y:"2021",t:"Marks & Spencer",s:"Milton Keynes, then Bedford. Communication skills built deliberately.",b:"Moved to Milton Keynes first as an Operations Assistant, then deliberately transferred to Bedford as a Customer Assistant — to build the communication and customer-facing skills I knew I'd need in an office environment. The Bedford store was mid-refurbishment while trading normally — live-environment programme delivery from the inside. It left an impression."},
    {y:"2022",t:"Safran Engineering Services UK",s:"Joined as intern. The call came six months after applying.",b:"Applied and waited. Six months of silence — long enough to almost move on. Then the call came. Joined as a PMO intern and spent the first weeks understanding every process, replicating what I was taught, asking questions. Three months in, my managers told me I had effectively replaced the person who trained me — who'd been there four years. I was here to stay."},
    {y:"2025",t:"Project Management Officer",s:"Full PMO role. Dashboards built. Five departments coordinated daily.",b:"Full PMO role. Built Power BI dashboards that replaced manual reporting and are now used daily across multiple departments. Automated a daily report that used to take 45 minutes — now takes 10. Coordinated across five departments simultaneously. Drove continuous improvement across three phases. The work compounded — each thing built on the last."},
    {y:"2026",t:"PMP Certified ✦",s:"Project Management Professional — PMI. Certified May 2026.",b:"Project Management Professional — certified by PMI in May 2026. The globally recognised equivalent of APM PMQ. Months of structured preparation, mock exams, and applied learning from three years of live programme delivery. Earning it wasn't just about the credential — it was proving the foundation I'd built was solid. The next chapter is being written."}
  ];
  var N = M.length;
  var years = []; M.forEach(function (m) { if (years.indexOf(m.y) < 0) years.push(m.y); });

  // build cards, year roller items, scrubber ticks
  var cards = M.map(function (m) {
    var c = document.createElement('div'); c.className = 'jd-card';
    c.innerHTML = '<div class="jd-cc"><div class="ti">' + m.t + '</div><div class="su">' + m.s + '</div><div class="bd">' + m.b + '</div></div>';
    deck.appendChild(c); return c;
  });
  years.forEach(function (y) { var it = document.createElement('div'); it.className = 'jd-year-item'; it.textContent = y; yearRoll.appendChild(it); });
  var ticks = years.map(function (y, i) {
    var t = document.createElement('div'); t.className = 'jd-tick'; t.style.top = (i / (years.length - 1) * 100) + '%';
    t.innerHTML = '<span class="yr">' + y + '</span><span class="dot"></span>'; scrub.appendChild(t); return t;
  });

  var current = 0, prevYearIdx = -1, animating = false;

  function depthOf(i) { return i >= current ? (i - current) : (N - current) + i; }
  function paint() {
    cards.forEach(function (c, i) { var d = depthOf(i); c.style.setProperty('--depth', d); c.classList.toggle('front', d === 0); });
    var yi = years.indexOf(M[current].y);
    if (yi !== prevYearIdx) {                          // only move on a YEAR change (same-year cards hold)
      yearRoll.style.transform = 'translateY(' + (-yi * 64) + 'px)';
      handle.style.top = (yi / (years.length - 1) * 100) + '%';
      fill.style.height = (yi / (years.length - 1) * 100) + '%';
      ticks.forEach(function (t, k) { t.classList.toggle('done', k <= yi); });
      prevYearIdx = yi;
    }
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === N - 1;
  }

  function firstCardOfYear(yi) { for (var i = 0; i < N; i++) { if (M[i].y === years[yi]) return i; } return 0; }

  function go(dir, done) {
    if (animating) return;
    if (dir > 0 && current >= N - 1) { if (done) done(); return; }
    if (dir < 0 && current <= 0) { if (done) done(); return; }
    animating = true;
    var moving = dir > 0 ? cards[current] : cards[current - 1];
    var arcClass = dir > 0 ? 'arc-next' : 'arc-prev';
    current += dir;
    paint();
    moving.classList.add(arcClass);
    moving.addEventListener('animationend', function h() {
      moving.classList.remove(arcClass); moving.removeEventListener('animationend', h);
      paint(); animating = false; if (done) done();
    }, { once: true });
  }
  // Scrubber jump: go straight to the target card (the first card of the
  // chosen year) instead of stepping through every card in between. The
  // deck re-stacks via each card's transform transition, so it reads as a
  // direct jump rather than a run through the whole sequence.
  function goTo(target) {
    target = Math.max(0, Math.min(N - 1, target));
    if (animating || target === current) return;
    current = target;
    prevYearIdx = -1;          // force the year display + scrubber to re-sync
    paint();
  }
  nextBtn.addEventListener('click', function () { go(1); });
  prevBtn.addEventListener('click', function () { go(-1); });

  // scrubber → jump to a year, animating with the SAME arc as the arrows
  (function () {
    var dragging = false;
    function yToYearIdx(clientY) { var r = scrub.getBoundingClientRect(); var f = Math.max(0, Math.min(1, (clientY - r.top) / r.height)); return Math.round(f * (years.length - 1)); }
    function pick(clientY) { var yi = yToYearIdx(clientY); if (years[yi] === M[current].y) return; goTo(firstCardOfYear(yi)); }
    handle.addEventListener('pointerdown', function (e) { if (animating) return; dragging = true; handle.classList.add('grabbing'); handle.setPointerCapture(e.pointerId); e.preventDefault(); });
    handle.addEventListener('pointermove', function (e) { if (!dragging) return; var r = scrub.getBoundingClientRect(); handle.style.top = Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100)) + '%'; });
    handle.addEventListener('pointerup', function (e) { if (!dragging) return; dragging = false; handle.classList.remove('grabbing'); prevYearIdx = -1; paint(); pick(e.clientY); });
    scrub.addEventListener('pointerdown', function (e) { if (e.target !== handle && !animating) pick(e.clientY); });
  })();

  paint();
})();
