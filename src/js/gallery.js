// ======================
//  Subnav (desktop)
// ======================
(() => {
  const indicator = document.querySelector('[data-indicator]');
  const active = document.querySelector('[data-route="gallery"]');
  const wrap = document.querySelector('[data-subnav]');
  if (!indicator || !active || !wrap) return;

  const place = () => {
    const r = active.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    indicator.style.transform = `translate3d(${r.left - w.left}px,0,0)`;
    indicator.style.width = `${r.width}px`;
  };
  place();
  window.addEventListener('resize', place);
})();

// ======================
//  Локальный навигатор
// ======================
document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-scroll-to');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ======================
//  ГАЛЕРЕЯ / МОДАЛКА БЕЗ ЗУМА
// ======================
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbStage = document.getElementById('lb-stage');
const lbTitle = document.getElementById('lb-title');
const lbCounter = document.getElementById('lb-counter');
const thumbsWrap = document.getElementById('lb-thumbs');

let currentGroup = '';
let images = [];              // [{src, full}]
let index = 0;

// Собираем превью и группируем по data-gallery
const groups = {};
document.querySelectorAll('[data-gallery]').forEach((btn) => {
  const group = btn.getAttribute('data-gallery');
  const src = btn.getAttribute('data-src');
  const full = btn.getAttribute('data-src-full') || src;
  (groups[group] ||= []).push({ btn, src, full });

  btn.addEventListener('click', () => {
    const startIndex = groups[group].findIndex((i) => i.src === src);
    openLightbox(group, startIndex >= 0 ? startIndex : 0);
  });
});

// ---------- Открыть/закрыть ----------
function openLightbox(group, startIndex = 0) {
  currentGroup = group;
  images = groups[group].map((g) => ({ src: g.src, full: g.full }));
  index = startIndex;
  lbTitle.textContent = titleByGroupId(group);
  buildThumbs();

  lb.classList.remove('hidden');
  document.documentElement.style.overflow = 'hidden'; // lock scroll

  // Спрячем (если оставили в разметке) кнопки зума
  ['in','out','reset'].forEach(k => {
    const el = lb.querySelector(`[data-zoom="${k}"]`);
    if (el) el.style.display = 'none';
  });

  show(index);
}

function closeLightbox() {
  lb.classList.add('hidden');
  document.documentElement.style.overflow = '';
}

// ---------- Показ изображения (без зума/драга) ----------
function show(i) {
  if (!images.length) return;

  index = (i + images.length) % images.length;
  const item = images[index];

  lbCounter.textContent = `${index + 1}/${images.length}`;
  selectThumb(index);

  lbImg.onload = () => {
    lbImg.onload = null;
    // ничего не масштабируем и не двигаем — пусть вписывается CSS-ом
    lbImg.style.maxWidth = 'min(96vw, 1280px)';
    lbImg.style.maxHeight = '100%';
    lbImg.style.width = 'auto';
    lbImg.style.height = 'auto';
    lbImg.style.transform = 'none';
    lbImg.style.cursor = 'default';
  };

  lbImg.src = item.full || item.src;
}

function prev() { show(index - 1); }
function next() { show(index + 1); }

// ---------- Листание/закрытие/клавиатура ----------
lb.querySelector('[data-prev]').addEventListener('click', prev);
lb.querySelector('[data-next]').addEventListener('click', next);
lb.querySelector('[data-close]').addEventListener('click', closeLightbox);

window.addEventListener('keydown', (e) => {
  if (lb.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'ArrowRight') next();
});

// ---------- Миниатюры ----------
function buildThumbs() {
  thumbsWrap.innerHTML = '';
  images.forEach((img, i) => {
    const b = document.createElement('button');
    b.className = 'shrink-0 ring-1 ring-white/20 rounded-md overflow-hidden';
    b.innerHTML =
      `<img src="${img.src}" alt="" class="block h-16 w-24 object-cover" loading="lazy" decoding="async">`;
    b.addEventListener('click', () => show(i));
    thumbsWrap.appendChild(b);
  });
}

function selectThumb(i) {
  [...thumbsWrap.children].forEach((el, idx) => {
    el.classList.toggle('ring-2', idx === i);
    el.classList.toggle('ring-emerald-400', idx === i);
  });
  const active = thumbsWrap.children[i];
  if (active) {
    const rect = active.getBoundingClientRect();
    const wrapRect = thumbsWrap.getBoundingClientRect();
    if (rect.left < wrapRect.left || rect.right > wrapRect.right) {
      thumbsWrap.scrollTo({ left: active.offsetLeft - 16, behavior: 'smooth' });
    }
  }
}

// ---------- Заголовки групп ----------
function titleByGroupId(id) {
  switch (id) {
    case 'hotel': return 'Отель и территория';
    case 'semilux-family': return 'Полулюкс семейный';
    case 'semilux-family-4': return 'полулюксСемейный4-хМестный';
    case 'semilux-2': return 'полу-люкс-двухместный';
    case 'semilux-2-extra': return 'полуЛюксДвухместный+допМесто';
    case 'family-2': return 'семейныйДвухместный';
    case 'econom-2': return 'экономдвухместный';
    case 'econom-3': return 'эуономТрехместный';
    case 'family-sem-lux-3room': return 'трёхкомнатныйСемейныйПолу-люкс2';
    default: return 'Галерея';
  }
}
// закрытие по клику на фон (не на изображение и не на стрелки)
lb.addEventListener('click', (e) => {
  const stage = document.getElementById('lb-stage');
  if (e.target === lb || e.target === stage) closeLightbox();
});