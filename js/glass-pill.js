/* ── GLASS SLIDING PILL ──────────────────────────────────────
   A reusable sliding "glass capsule" that sits behind the active
   button in a toggle group. Robust against the classic failure mode
   where the group is initialised while hidden (zero size): a
   ResizeObserver re-aligns the pill whenever the container gains or
   changes size, so it snaps to the active button the moment the
   group becomes visible, and stays aligned on window resize. ── */
(function () {
  var SEL = '.dash-switch-btn, .dash-tab, .skill-group-btn';

  function initGlassPill(container) {
    if (!container || container.querySelector('.glass-pill')) return;

    var pill = document.createElement('div');
    pill.className = 'glass-pill';
    container.style.position = 'relative';
    container.insertBefore(pill, container.firstChild);

    function movePill(btn, instant) {
      if (!btn || !btn.offsetWidth) return;          // skip while hidden (0 size)
      if (instant) pill.style.transition = 'none';
      pill.style.width = btn.offsetWidth + 'px';
      pill.style.height = btn.offsetHeight + 'px';
      pill.style.transform = 'translateX(' + btn.offsetLeft + 'px) translateY(' + btn.offsetTop + 'px)';
      if (instant) requestAnimationFrame(function () { pill.style.transition = ''; });
    }
    function activeBtn() {
      return container.querySelector('.dash-switch-btn.active, .dash-tab.active, .skill-group-btn.active')
          || container.querySelector(SEL);
    }
    function reposition() { movePill(activeBtn(), true); }   // instant, no slide

    reposition();

    container.querySelectorAll(SEL).forEach(function (btn) {
      btn.addEventListener('click', function () { movePill(btn, false); });   // animated slide
    });

    if (window.ResizeObserver) new ResizeObserver(reposition).observe(container);
    window.addEventListener('resize', reposition);
  }

  function initAll() {
    document.querySelectorAll('.dash-switcher, .dash-tabs, .skill-groups').forEach(initGlassPill);
  }
  initAll();
  document.addEventListener('DOMContentLoaded', initAll);
})();
