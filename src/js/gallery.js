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
//  ГАЛЕРЕЯ / МОДАЛКА
// ======================
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbStage = document.getElementById('lb-stage');
const lbTitle = document.getElementById('lb-title');
const lbCounter = document.getElementById('lb-counter');
const thumbsWrap = document.getElementById('lb-thumbs');

let currentGroup = '';
let images = []; // [{src, full}]
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

  show(index);
}

function closeLightbox() {
  lb.classList.add('hidden');
  document.documentElement.style.overflow = '';
}

// ---------- Показ изображения ----------
function show(i) {
  if (!images.length) return;
  index = (i + images.length) % images.length;
  const item = images[index];

  lbCounter.textContent = `${index + 1}/${images.length}`;
  selectThumb(index);

  // сброс зума при смене кадра
  resetZoom();

  lbImg.onload = () => {
    lbImg.onload = null;
    const stageW = lbStage.clientWidth;
    const stageH = lbStage.clientHeight;

    lbImg.style.maxWidth = stageW * 0.85 + 'px';
    lbImg.style.maxHeight = stageH * 0.85 + 'px';
    lbImg.style.width = 'auto';
    lbImg.style.height = 'auto';
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
// закрытие по клику на фон
lb.addEventListener('click', (e) => {
  const stage = document.getElementById('lb-stage');
  if (e.target === lb || e.target === stage) closeLightbox();
});

// ======================
//  Zoom & Pan (touch + desktop)
// ======================
let scale = 1;
let translateX = 0, translateY = 0;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

// универсальное применение трансформации
function applyTransform() {
  lbImg.style.transform =
    `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
  updateGrabCursor(); // << это обязательно
}


// универсальный сброс
function resetZoom() {
  scale = 1;
  translateX = 0;
  translateY = 0;
  applyTransform();
}

function clampPan() {
  const imgRect = lbImg.getBoundingClientRect();
  const stageRect = lbStage.getBoundingClientRect();
  const maxX = Math.max(0, (imgRect.width * scale - stageRect.width) / 2);
  const maxY = Math.max(0, (imgRect.height * scale - stageRect.height) / 2);
  translateX = Math.min(maxX, Math.max(-maxX, translateX));
  translateY = Math.min(maxY, Math.max(-maxY, translateY));
}

// ----- Touch -----
let startDist = 0;
let startScale = 1;
let lastTouchX = 0, lastTouchY = 0;

function dist(t1, t2) {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.hypot(dx, dy);
}

lbStage.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    startDist = dist(e.touches[0], e.touches[1]);
    startScale = scale;
  } else if (e.touches.length === 1) {
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
  }
}, { passive: false });

lbStage.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const newDist = dist(e.touches[0], e.touches[1]);
    const factor = newDist / (startDist || newDist);
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, startScale * factor));
    clampPan();
    applyTransform();
  } else if (e.touches.length === 1 && scale > 1) {
    e.preventDefault();
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    translateX += (x - lastTouchX);
    translateY += (y - lastTouchY);
    lastTouchX = x;
    lastTouchY = y;
    clampPan();
    applyTransform();
  }
}, { passive: false });

lbStage.addEventListener('touchend', () => {
  if (scale < MIN_SCALE) resetZoom();
});

let lastTap = 0;
lbStage.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTap < 300) resetZoom();
  lastTap = now;
}, { passive: true });

// ----- Desktop -----
function zoomAtPointer(clientX, clientY, nextScale) {
  nextScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));
  const prev = scale;
  if (nextScale === prev) return;
  const r = lbStage.getBoundingClientRect();
  const px = clientX - (r.left + r.width / 2);
  const py = clientY - (r.top + r.height / 2);
  translateX = px - (px - translateX) * (nextScale / prev);
  translateY = py - (py - translateY) * (nextScale / prev);
  scale = nextScale;
  clampPan();
  applyTransform();
}

lbStage.addEventListener('wheel', (e) => {
  e.preventDefault();
  const step = e.deltaY > 0 ? 0.9 : 1.1;
  zoomAtPointer(e.clientX, e.clientY, scale * step);
}, { passive: false });

lbStage.addEventListener('dblclick', (e) => {
  e.preventDefault(); // не даём браузеру выделять текст / зумить страницу
  const target = scale > 1 ? 1 : 2;
  if (target === 1) {
    resetZoom();          // внутри уже вызовется applyTransform() + updateGrabCursor()
  } else {
    zoomAtPointer(e.clientX, e.clientY, target); // внутри applyTransform()
    updateGrabCursor();    // на всякий случай обновим курсор прямо сейчас
  }
});


// drag to pan
let isDragging = false;
let startX = 0, startY = 0;

lbStage.addEventListener('mousedown', (e) => {
  if (scale <= 1) return;
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  lbStage.classList.add('drag');
  document.addEventListener('mousemove', onMouseMove, { passive: false });
  document.addEventListener('mouseup', onMouseUp, { passive: true });
  e.preventDefault();
});

function onMouseMove(e) {
  if (!isDragging) return;
  e.preventDefault();
  translateX += (e.clientX - startX);
  translateY += (e.clientY - startY);
  startX = e.clientX;
  startY = e.clientY;
  clampPan();
  applyTransform();
}

function onMouseUp() {
  isDragging = false;
  lbStage.classList.remove('drag');
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

// курсоры
function updateGrabCursor() {
  if (scale > 1) lbStage.classList.add('grab');
  else lbStage.classList.remove('grab');
}
