(function(){
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');
  if (!burger || !links) return;
  
  function toggleMenu() {
    burger.classList.toggle('open');
    links.classList.toggle('open');
  }
  function closeMenu() {
    burger.classList.remove('open');
    links.classList.remove('open');
  }
  
  burger.addEventListener('click', toggleMenu);
  links.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (e) => {
    if (!links.contains(e.target) && !burger.contains(e.target) && links.classList.contains('open')) closeMenu();
  });
})();
