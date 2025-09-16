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
    case 'junior-suite-family': return 'Полулюкс семейный';
    case 'Junior-Suite-Family-4-bed': return 'Полулюкс семейный (4-местный)';
    case 'semi-suite-double': return 'Полулюкс двухместный';
    case 'Semi-Lux-Double+extra-Place': return 'Полулюкс 2-местный + доп. место';
    case 'family-double': return 'Семейный двухместный';
    case 'economy-double': return 'Эконом двухместный';
    case 'euonomTriple': return 'Эконом трёхместный';
    case 'three-roomFamilyJunior suite': return 'Трёхкомнатный семейный полулюкс';
    default: return 'Галерея';
  }
}

// закрытие по клику на фон
lb.addEventListener('click', (e) => {
  if (e.target === lb || e.target === lbStage) closeLightbox();
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
  const imgRect = lbImg.getBoundingClientRect();   // уже с учётом scale
  const stageRect = lbStage.getBoundingClientRect();
  const maxX = Math.max(0, (imgRect.width  - stageRect.width)  / 2);
  const maxY = Math.max(0, (imgRect.height - stageRect.height) / 2);
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

/* ===== ДИНАМИЧЕСКИЙ СЕРЫЙ ГРАДИЕНТ ПРИ СКРОЛЛЕ ===== */
(() => {
  const layer = document.getElementById('photo-gradient');
  if (!layer) return;

  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  let ticking = false;
  function onScrollOrResize(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

function update(){
  ticking = false;

  const max = (doc.scrollHeight - innerHeight) || 1;
  const p = Math.min(1, Math.max(0, scrollY / max));   // 0..1 скролл-прогресс
  const TAU = Math.PI * 2;

  // угол меняется, но в спокойных пределах
  const angle = 170 + p * 40; // 170..210°

  // центр подсветки двигается по небольшому эллипсу
  const x = 45 + Math.sin(p * TAU) * 15; // 30..60%
  const y = 42 + Math.cos(p * TAU) * 12; // 30..54%

  // плавная функция (0..1) без резких скачков
  const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);

  // ⚪️ яркость строго в светлом диапазоне
  // было: 0.06..0.12 → стало: 0.28..0.42
  const tone = 0.28 + ease(p) * 0.14;

  // 🌫 виньетка только лёгкая: 0.02..0.08
  const vig  = 0.02 + (1 - ease((Math.sin(p * TAU) + 1) / 2)) * 0.06;

  layer.style.setProperty('--angle', angle + 'deg');
  layer.style.setProperty('--shiftX', x + '%');
  layer.style.setProperty('--shiftY', y + '%');
  layer.style.setProperty('--tone', tone.toFixed(3));
  layer.style.setProperty('--vignette', vig.toFixed(3));
}


  // начальная установка и слушатели
  update();
  addEventListener('scroll', onScrollOrResize, { passive: true });
  addEventListener('resize', onScrollOrResize);

  // если пользователь меняет настройку motion на лету — обновим
  reduce.addEventListener?.('change', update);
})();

// ===== Лёгкая горизонтальная прокрутка (wheel + drag) =====
(() => {
  const scroller = document.getElementById('section-nav');
  if (!scroller) return;

  // РАФ-троттлинг одного шага
  let raf = 0;
  function rafScroll(dx) {
    if (raf) return; // накопление не нужно, пусть браузер решит
    raf = requestAnimationFrame(() => {
      scroller.scrollLeft += dx;
      raf = 0;
    });
  }

  // аккуратно конвертируем wheel -> X, предотвращаем дефолт ТОЛЬКО если реально скроллим по X
scroller.addEventListener('wheel', (e) => {
  let dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  const modeScale = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? scroller.clientWidth : 1);
  dx *= modeScale;
  if (!dx) return;

  const before = scroller.scrollLeft;
  rafScroll(dx * 0.9);

  const canLeft  = before > 0;
  const canRight = before < scroller.scrollWidth - scroller.clientWidth;

  if ((dx < 0 && canLeft) || (dx > 0 && canRight)) {
    e.preventDefault();
  }
}, { passive: false });


  // Перетаскивание мышью (лёгкое)
  let isDown = false, startX = 0, startLeft = 0;
  scroller.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.clientX;
    startLeft = scroller.scrollLeft;
    scroller.classList.add('dragging');
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    scroller.scrollLeft = startLeft - dx;
  });
  window.addEventListener('mouseup', () => {
    isDown = false;
    scroller.classList.remove('dragging');
  });

  // курсор/выделение во время драга
  const css = document.createElement('style');
  css.textContent = `
    #section-nav.dragging { cursor: grabbing; }
    #section-nav.dragging * { user-select: none; }
  `;
  document.head.appendChild(css);
})();

// ===== Горизонтальная прокрутка миниатюр (wheel + drag) =====
(() => {
  const scroller = document.getElementById('lb-thumbs');
  if (!scroller) return;

  // RAF-троттлинг, чтобы прокрутка была «лёгкой»
  let raf = 0;
  function rafScroll(dx) {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      scroller.scrollLeft += dx;
      raf = 0;
    });
  }

  // wheel: вертикальное колесо -> горизонтальная прокрутка,
  // но блокируем дефолт ТОЛЬКО если реально есть куда скроллить по X
  scroller.addEventListener('wheel', (e) => {
    let dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

    // учёт deltaMode (строки/страницы)
    const modeScale = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? scroller.clientWidth : 1);
    dx *= modeScale;

    if (!dx) return;

    const before = scroller.scrollLeft;
    rafScroll(dx * 0.9);

    const canLeft  = before > 0;
    const canRight = before < scroller.scrollWidth - scroller.clientWidth;

    // если двигаемся в доступную сторону — предотвращаем вертикальный скролл страницы
    if ((dx < 0 && canLeft) || (dx > 0 && canRight)) {
      e.preventDefault();
    }
  }, { passive: false });

  // Перетаскивание мышью
  let isDown = false, startX = 0, startLeft = 0;
  scroller.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.clientX;
    startLeft = scroller.scrollLeft;
    scroller.classList.add('dragging');
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    scroller.scrollLeft = startLeft - (e.clientX - startX);
  });
  window.addEventListener('mouseup', () => {
    isDown = false;
    scroller.classList.remove('dragging');
  });

  // во время драга отключаем выделение (косметика)
  const css = document.createElement('style');
  css.textContent = `
    #lb-thumbs.dragging { cursor: grabbing; }
    #lb-thumbs.dragging * { user-select: none; }
  `;
  document.head.appendChild(css);
})();
