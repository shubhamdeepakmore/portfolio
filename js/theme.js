/* ── DARK-MODE TOGGLE ──────────────────────────────────────
   The initial theme is set by a tiny inline script in <head>
   (before paint, so there's no flash). This just wires the
   toggle button and remembers the choice. ── */
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

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
  });

  // Follow the OS setting only while the user hasn't picked one explicitly.
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      try { if (localStorage.getItem('theme')) return; } catch (_) {}
      root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      sync();
    });
  }
})();
