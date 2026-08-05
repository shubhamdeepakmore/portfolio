(function(){
  const isMobile = () => window.innerWidth <= 700;

  // Close all float cards
  function closeAll() {
    document.querySelectorAll('.tl-float-card.open').forEach(c => c.classList.remove('open'));
    document.querySelectorAll('.tl-item.active').forEach(i => i.classList.remove('active'));
  }

  // Mobile sheet
  const sheetOverlay = document.getElementById('tlSheetOverlay');
  const sheet = document.getElementById('tlSheet');
  const sheetYear = document.getElementById('tlSheetYear');
  const sheetTitle = document.getElementById('tlSheetTitle');
  const sheetBody = document.getElementById('tlSheetBody');

  function openSheet(item) {
    const card = item.querySelector('.tl-float-card');
    if (!card) return;
    sheetYear.textContent = card.querySelector('.tl-float-year').textContent;
    sheetTitle.textContent = card.querySelector('.tl-float-title').textContent;
    sheetBody.textContent = card.querySelector('.tl-float-body').textContent;
    sheetOverlay.classList.add('open');
    sheet.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSheet() {
    sheetOverlay.classList.remove('open');
    sheet.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (sheetOverlay) sheetOverlay.addEventListener('click', closeSheet);

  // Item click handler
  document.querySelectorAll('.tl-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      if (isMobile()) {
        openSheet(this);
        return;
      }
      const card = this.querySelector('.tl-float-card');
      if (!card) return;
      const isOpen = card.classList.contains('open');
      closeAll();
      if (!isOpen) {
        card.classList.add('open');
        this.classList.add('active');
      }
    });
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.tl-item')) closeAll();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeAll(); closeSheet(); }
  });
})();
/* ── TIMELINE LINE + DOT ANIMATION ──────────────────────── */
(function(){
  const track = document.querySelector('.timeline-track');
  if (!track) return;
  const items = track.querySelectorAll('.tl-item');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        track.classList.add('line-animate');

        // 7 items over 4s line — each dot appears every ~500ms
        // starting at 300ms so line is slightly ahead of dots
        items.forEach((item, i) => {
          const delay = 300 + i * 500;
          const dot = item.querySelector('.tl-dot');
          const card = item.querySelector('.tl-content');
          const year = item.querySelector('.tl-year-wrap');
          if (dot) setTimeout(() => dot.classList.add('dot-show'), delay);
          if (year) setTimeout(() => year.classList.add('year-show'), delay);
          if (card) setTimeout(() => card.classList.add('card-show'), delay + 150);
        });

        obs.unobserve(track);
      }
    });
  }, { threshold: 0.1 });

  obs.observe(track);
})();
