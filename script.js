const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');

menuButton?.addEventListener('click', () => {
  if (!navLinks) return;
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir navegación');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navLinks?.classList.contains('open')) {
    navLinks.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir navegación');
    menuButton?.focus();
  }
});

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
