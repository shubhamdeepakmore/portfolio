(function(){
  try {
  // Category filter
  const groupBtns = document.querySelectorAll('.skill-group-btn');
  const skillItems = document.querySelectorAll('.skill-item');
  groupBtns.forEach(btn => {
    const handler = (e) => {
      if (e) e.preventDefault();
      groupBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const group = btn.dataset.group;
      skillItems.forEach(item => {
        if (group === 'All' || item.dataset.group === group) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    };
    btn.addEventListener('click', handler);
  });

  // Scroll-triggered fill animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = document.querySelectorAll('.skill-item');
        items.forEach((item, i) => {
          setTimeout(() => item.classList.add('in-view'), i * 100);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  const skillsSection = document.querySelector('#skills');
  if (skillsSection) observer.observe(skillsSection);
  } catch(err) { console.error('Skills error:', err); }
})();
