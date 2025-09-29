// /src/pricing.js

// Переключение периодов по hash (#period-...)
const sections = document.querySelectorAll('[data-period]');
const links = document.querySelectorAll('.period-link');

function setPeriodFromHash() {
  const hash = location.hash || '#period-peak';
  sections.forEach(sec => sec.toggleAttribute('hidden', `#${sec.id}` !== hash));
  links.forEach(a => {
    const active = a.getAttribute('href') === hash;
    a.classList.toggle('bg-emerald-500', active);
    a.classList.toggle('text-white', active);
    a.classList.toggle('hover:bg-emerald-600', active);
    a.classList.toggle('bg-gray-100', !active);
    a.classList.toggle('text-gray-900', !active);
    a.classList.toggle('ring-1', !active);
    a.classList.toggle('ring-black/10', !active);
  });
}

window.addEventListener('hashchange', setPeriodFromHash);
setPeriodFromHash();

// Маска «показать телефон» (используется и на главной)
document.querySelectorAll('[data-cta="show-phone"]').forEach(el => {
  el.addEventListener('click', () => {
    el.outerHTML =
      '<a href="tel:+79990000000" class="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-base font-semibold text-white hover:bg-black focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 transition">+7 999 000-00-00</a>';
  });
});
