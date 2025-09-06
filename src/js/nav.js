export function initSubnav() {
  const file  = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const route = file === "" || file === "index.html" ? "home" : file.replace(".html","");

  // ===== DESKTOP: подсветка + индикатор =====
  const desk = document.querySelector('[data-subnav]');
  if (desk) {
    const wrap      = desk.querySelector('.relative');
    const indicator = wrap?.querySelector('[data-indicator]');
    const links     = [...wrap.querySelectorAll('a[data-route]')];

    // ставим aria-current и управляем цветами ТОЛЬКО на десктопе
    links.forEach(a => {
      const active = a.dataset.route === route;
      a.classList.toggle('text-gray-900', active);
      a.classList.toggle('text-white/80', !active);
      if (active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
      a.classList.remove('hover:text-white','hover:text-white/80','hover:text-gray-800');
      a.classList.add('hover:text-gray-900');
    });

    let lastEl = null;
    const activeEl = () => wrap.querySelector('a[aria-current="page"]') || links[0];

    function applyContrast(target) {
      links.forEach(a => { a.classList.remove('text-gray-900'); a.classList.add('text-white/80'); });
      target.classList.remove('text-white/80'); target.classList.add('text-gray-900');
    }
    function moveTo(el) {
      if (!indicator || !el || el === lastEl) return;
      lastEl = el;
      const r = (el.querySelector('span') || el).getBoundingClientRect();
      const base = wrap.getBoundingClientRect();
      const left = r.left - base.left;
      const w = Math.max(Math.ceil(r.width), 40);
      indicator.style.width = `${w}px`;
      indicator.style.transform = `translate3d(${Math.round(left)}px,0,0)`;
      applyContrast(el);
    }
    wrap.addEventListener('mouseleave', () => requestAnimationFrame(() => moveTo(activeEl())));
    links.forEach(l => { l.addEventListener('mouseenter', () => moveTo(l)); l.addEventListener('focus', () => moveTo(l)); });
    const setActive = () => requestAnimationFrame(() => moveTo(activeEl()));
    window.addEventListener('resize', setActive);
    window.addEventListener('load', setActive);
    if (document.fonts?.ready) document.fonts.ready.then(setActive);
    setActive();
  }

  // ===== MOBILE: только aria-current, НИКАКИХ цветов/ховеров =====
  const mob = document.querySelector('[data-subnav-mobile]');
  if (mob) {
    const mobLinks = [...mob.querySelectorAll('a[data-route]')];
    mobLinks.forEach(a => {
      const active = a.dataset.route === route;
      if (active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
      // ничего не трогаем в классах цвета!
    });
    // никаких индикаторов/анимаций на мобилке
  }
}
