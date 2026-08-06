/* ── DARK-MODE TOGGLE ──────────────────────────────────────
   The initial theme is set by a tiny inline script in <head>
   (before paint, so there's no flash). Default is LIGHT for every
   device — the OS setting is intentionally ignored.

   On toggle we add a short-lived `theme-anim` class so the whole
   page cross-fades its colours (only colours, for smoothness) over
   the same duration the knob slides, then remove it so normal hover
   interactions stay snappy. ── */
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
    root.classList.add('theme-anim');
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
    clearTimeout(timer);
    timer = setTimeout(function () { root.classList.remove('theme-anim'); }, 600);
  });
})();
