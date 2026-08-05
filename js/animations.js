/* ── TENURE BAR ANIMATION ────────────────────────────────── */
(function() {
  const bars = document.querySelectorAll('.bar');
  if (!bars.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        entry.target.classList.add('animate', 'animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(bar => observer.observe(bar));
})();

/* ── NUMBER COUNT-UP WITH EASING ─────────────────────────── */
(function() {
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      el.textContent = Math.round(eased * target) + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + (el.dataset.suffix || '');
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('.counted');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = '1';
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
})();

/* ── DROPDOWN NAV ────────────────────────────────────────── */
(function() {
  // Dropdowns open on hover via CSS — click handler removed
})();

/* ── SCROLLSPY ───────────────────────────────────────────── */
(function() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-group-btn, .nav-link-plain');
  const sectionMap = {
    'profile': 0, 'education': 0, 'interests': 0,
    'timeline': 1,
    'dashboard': 2, 'experience': 2, 'achievements': 2, 'skills': 2,
    'contact': -1
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => l.classList.remove('scrollspy-active'));
        const idx = sectionMap[id];
        if (idx !== undefined && idx >= 0) {
          navLinks[idx]?.classList.add('scrollspy-active');
        }
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(s => observer.observe(s));
})();
