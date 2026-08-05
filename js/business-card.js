/* ── BUSINESS CARD ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function(){
  const overlay = document.getElementById('bcOverlay');
  const wrap = document.getElementById('bcWrap');
  const card = document.getElementById('bcCard');
  const closeBtn = document.getElementById('bcClose');
  const floatBtn = document.getElementById('bcFloat');
  const navBtn = document.getElementById('navCardBtn');
  if (!overlay || !wrap) return;

  function openCard() {
    overlay.classList.add('open');
    wrap.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCard() {
    overlay.classList.remove('open');
    wrap.classList.remove('open');
    card.classList.remove('flipped');
    document.body.style.overflow = '';
  }

  if (floatBtn) floatBtn.addEventListener('click', openCard);
  if (navBtn) navBtn.addEventListener('click', openCard);
  if (closeBtn) closeBtn.addEventListener('click', closeCard);
  overlay.addEventListener('click', closeCard);
  card.addEventListener('click', () => card.classList.toggle('flipped'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCard(); });
});
