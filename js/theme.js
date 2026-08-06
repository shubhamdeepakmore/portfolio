/* ── DARK-MODE TOGGLE ──────────────────────────────────────
   The initial theme is set by a tiny inline script in <head>
   (before paint, so there's no flash). Default is LIGHT for every
   device — the OS setting is intentionally ignored. This wires the
   toggle, remembers the choice, and runs a synchronised cross-fade
   so the whole page morphs together with the knob. ── */
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  if (!btn) return;

  function sync() {
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-checked', dark ? 'true' : 'false');
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  sync();

  var timer;
  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.classList.add('theme-anim');        // enable the synchronised cross-fade
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
    clearTimeout(timer);
    timer = setTimeout(function () { root.classList.remove('theme-anim'); }, 650);
  });
})();
