/* ── GLASS SLIDING PILL ──────────────────────────────────── */
(function() {
  function initGlassPill(container) {
    if (!container) return;
    const pill = document.createElement('div');
    pill.className = 'glass-pill';
    container.style.position = 'relative';
    container.insertBefore(pill, container.firstChild);

    function movePill(btn) {
      pill.style.width = btn.offsetWidth + 'px';
      pill.style.height = btn.offsetHeight + 'px';
      pill.style.transform = 'translateX(' + btn.offsetLeft + 'px) translateY(' + btn.offsetTop + 'px)';
    }

    const btns = container.querySelectorAll('.dash-switch-btn, .dash-tab, .skill-group-btn');
    const active = container.querySelector('.active') || btns[0];
    if (active) {
      // Set initial position without transition
      pill.style.transition = 'none';
      movePill(active);
      requestAnimationFrame(() => {
        pill.style.transition = '';
      });
    }

    btns.forEach(btn => {
      btn.addEventListener('click', () => movePill(btn));
    });
  }

  // Init all toggle containers
  ['dashSwitcher', 'sqcdpi-month-tabs', 'skillGroups'].forEach(id => {
    const el = document.getElementById(id) || document.querySelector('.skill-groups');
    if (el) initGlassPill(el);
  });

  // Also init dash switcher and sqcdpi tabs after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.dash-switcher, .dash-tabs, .skill-groups').forEach(el => {
      if (!el.querySelector('.glass-pill')) initGlassPill(el);
    });
  });
})();

