// Full-screen score viewer: PDF (via pdf.js) and image files.
// - pinch or double-tap to zoom, drag to pan
// - tap the left/right edge (or use a Bluetooth page-turner / arrow keys) to turn
// - in a programme, moves on to the next song at the end of each score
// - keeps the screen awake while open

const PDFJS = new URL('../vendor/pdfjs/pdf.min.mjs', import.meta.url).href;
const WORKER = new URL('../vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
const FONTS = new URL('../vendor/pdfjs/standard_fonts/', import.meta.url).href;

const MAX_ZOOM = 5;
const MAX_CANVAS_PX = 12e6;   // per page canvas; sharper detail is drawn on top when zoomed in further
const GAP = 8;                // px between pages at zoom 1

let pdfjsLib;
async function pdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import(PDFJS);
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER;
  }
  return pdfjsLib;
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const V = {
  root: null, scroll: null, pagesEl: null, endEl: null,
  opts: null, items: [], index: 0,
  doc: null, pages: [], zoom: 1, fit: 'width',
  gen: 0, renderToken: 0, open: false,
  wakeLock: null, barsTimer: 0, enteredFullscreen: false
};

function build(root) {
  root.innerHTML = `
    <div class="v-scroll"><div class="v-pages"></div></div>
    <div class="v-bar v-top">
      <button class="v-btn" data-v="close" aria-label="Close score">✕</button>
      <div class="v-title"><strong></strong><span></span></div>
      <button class="v-btn" data-v="fit" aria-label="Fit width or whole page"></button>
      <button class="v-btn" data-v="fs" aria-label="Full screen">⛶</button>
    </div>
    <div class="v-bar v-bottom">
      <button class="v-btn v-wide" data-v="prev">‹ Prev</button>
      <span class="v-page"></span>
      <button class="v-btn v-wide" data-v="next">Next ›</button>
    </div>
    <div class="v-zoom" hidden></div>
    <div class="v-msg" hidden></div>`;
  V.root = root;
  V.scroll = root.querySelector('.v-scroll');
  V.pagesEl = root.querySelector('.v-pages');

  root.addEventListener('click', e => {
    const b = e.target.closest('[data-v]');
    if (!b) return;
    e.stopPropagation();
    const a = b.dataset.v;
    if (a === 'close') V.opts.onClose();
    else if (a === 'fit') setFit(V.fit === 'width' ? 'page' : 'width');
    else if (a === 'fs') toggleFullscreen();
    else if (a === 'prev') go(V.index - 1);
    else if (a === 'next') go(V.index + 1);
  });

  setupGestures();

  V.scroll.addEventListener('scroll', () => { updatePageLabel(); scheduleRender(120); }, { passive: true });
  new ResizeObserver(() => { if (V.open && V.pages.length) relayoutKeepingPosition(); }).observe(V.scroll);

  document.addEventListener('keydown', e => {
    if (!V.open || e.target.closest?.('input, textarea')) return;
    const k = e.key;
    if (['PageDown', 'ArrowDown', 'ArrowRight', ' ', 'Enter'].includes(k)) { e.preventDefault(); pageDown(); }
    else if (['PageUp', 'ArrowUp', 'ArrowLeft', 'Backspace'].includes(k)) { e.preventDefault(); pageUp(); }
    else if (k === 'Escape') { e.preventDefault(); V.opts.onClose(); }
    else if (k === '+' || k === '=') zoomAt(V.zoom * 1.25);
    else if (k === '-') zoomAt(V.zoom / 1.25);
  });

  document.addEventListener('visibilitychange', () => {
    if (V.open && document.visibilityState === 'visible') keepAwake();
  });
}

/* ---------- open / close ---------- */

// opts: { items: [{songId, title, notes?: [string]}], index, label, fit, fullscreen,
//         getSong(id) -> Promise<{title, kind, blob}>, onFit(fit), onClose() }
export function openViewer(root, opts) {
  if (!V.root) build(root);
  V.opts = opts;
  V.items = opts.items;
  V.fit = opts.fit || 'width';
  V.open = true;
  root.hidden = false;
  document.body.classList.add('viewer-open');
  // Must happen synchronously inside the tap that opened the viewer.
  if (opts.fullscreen && !document.fullscreenElement && document.documentElement.requestFullscreen) {
    V.enteredFullscreen = true;
    document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => { V.enteredFullscreen = false; });
  }
  keepAwake();
  showBars();
  load(opts.index || 0);
}

export function closeViewer() {
  if (!V.open) return;
  V.open = false;
  V.gen++;
  unload();
  V.root.hidden = true;
  document.body.classList.remove('viewer-open');
  if (V.enteredFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  V.enteredFullscreen = false;
  V.wakeLock?.release().catch(() => {});
  V.wakeLock = null;
}

async function keepAwake() {
  try {
    if ('wakeLock' in navigator && (!V.wakeLock || V.wakeLock.released)) V.wakeLock = await navigator.wakeLock.request('screen');
  } catch { /* not supported or not allowed: fine */ }
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).then(() => { V.enteredFullscreen = true; }).catch(() => {});
}

function unload() {
  for (const p of V.pages) { p.task?.cancel(); p.detailTask?.cancel(); if (p.url) URL.revokeObjectURL(p.url); }
  V.pages = [];
  V.doc?.destroy();
  V.doc = null;
  V.pagesEl.innerHTML = '';
  V.pagesEl.style.transform = '';
}

function message(text) {
  const m = V.root.querySelector('.v-msg');
  m.hidden = !text;
  m.textContent = text || '';
}

async function load(index, { atEnd = false } = {}) {
  const gen = ++V.gen;
  unload();
  V.index = index;
  V.zoom = 1;
  const item = V.items[index];
  updateBars();
  message('Loading…');
  let song;
  try {
    song = await V.opts.getSong(item.songId);
    if (gen !== V.gen) return;
    if (!song) { message(`“${item.title}” is no longer in your library.`); buildEnd(); return; }
    const pages = [];
    if (song.kind === 'pdf') {
      const lib = await pdfjs();
      const data = new Uint8Array(await song.blob.arrayBuffer());
      const doc = await lib.getDocument({ data, standardFontDataUrl: FONTS, isEvalSupported: false }).promise;
      if (gen !== V.gen) { doc.destroy(); return; }
      V.doc = doc;
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        const vp = page.getViewport({ scale: 1 });
        pages.push({ page, w: vp.width, h: vp.height });
      }
    } else {
      const url = URL.createObjectURL(song.blob);
      const img = new Image();
      img.src = url;
      img.alt = song.title;
      await img.decode();
      pages.push({ img, url, w: img.naturalWidth, h: img.naturalHeight });
    }
    if (gen !== V.gen) { pages.forEach(p => p.url && URL.revokeObjectURL(p.url)); return; }
    message('');
    V.pages = pages;
    for (const [i, p] of pages.entries()) {
      p.div = document.createElement('div');
      p.div.className = 'v-page-box';
      p.div.dataset.n = i + 1;
      if (p.img) { p.img.className = 'v-img'; p.div.append(p.img); }
      V.pagesEl.append(p.div);
    }
    buildEnd();
    layout();
    V.scroll.scrollTop = atEnd ? V.scroll.scrollHeight : 0;
    V.scroll.scrollLeft = 0;
    updatePageLabel();
    scheduleRender(0);
  } catch (err) {
    if (gen !== V.gen) return;
    console.error(err);
    message(`Couldn't open “${item.title}”. The file may be damaged or in an unsupported format.`);
    buildEnd();
  }
}

function buildEnd() {
  const end = document.createElement('div');
  end.className = 'v-end';
  const next = V.items[V.index + 1];
  if (V.items.length > 1) {
    if (next) {
      const notes = (next.notes || []).map(n => `<div class="v-note">${esc(n)}</div>`).join('');
      end.innerHTML = `${notes}<button class="v-next-big" data-v="next"><span>Next · ${V.index + 2} of ${V.items.length}</span><strong>${esc(next.title)}</strong></button>`;
    } else {
      end.innerHTML = `<div class="v-note">End of programme</div>`;
    }
  }
  V.pagesEl.append(end);
  V.endEl = end;
}

function go(index) {
  if (index < 0 || index >= V.items.length) return;
  load(index);
  showBars();
}

function updateBars() {
  const item = V.items[V.index];
  V.root.querySelector('.v-title strong').textContent = item.title;
  V.root.querySelector('.v-title span').textContent =
    V.items.length > 1 ? `${V.index + 1} of ${V.items.length}${V.opts.label ? ' · ' + V.opts.label : ''}` : '';
  V.root.querySelector('[data-v="fit"]').textContent = V.fit === 'width' ? '↕' : '↔';
  V.root.querySelector('[data-v="fit"]').title = V.fit === 'width' ? 'Show whole page' : 'Fit to width';
  const prev = V.root.querySelector('[data-v="prev"]');
  const next = V.root.querySelector('[data-v="next"]');
  prev.hidden = next.hidden = V.items.length < 2;
  prev.disabled = V.index === 0;
  next.disabled = V.index >= V.items.length - 1;
}

function updatePageLabel() {
  const label = V.root.querySelector('.v-page');
  if (!V.pages.length) { label.textContent = ''; return; }
  const mid = V.scroll.scrollTop + V.scroll.clientHeight / 2;
  let n = 1;
  for (const p of V.pages) if (p.div.offsetTop <= mid) n = +p.div.dataset.n;
  label.textContent = `Page ${n} of ${V.pages.length}`;
}

function showBars() {
  V.root.classList.add('bars');
  clearTimeout(V.barsTimer);
  V.barsTimer = setTimeout(() => V.root.classList.remove('bars'), 3000);
}
function toggleBars() {
  if (V.root.classList.contains('bars')) { clearTimeout(V.barsTimer); V.root.classList.remove('bars'); }
  else showBars();
}

function setFit(fit) {
  V.fit = fit;
  V.opts.onFit?.(fit);
  const mid = V.scroll.scrollTop + V.scroll.clientHeight / 2;
  const current = [...V.pages].reverse().find(p => p.div.offsetTop <= mid);
  V.zoom = 1;
  updateBars();
  layout();
  V.scroll.scrollTop = current ? current.div.offsetTop : 0;
  V.scroll.scrollLeft = 0;
  updatePageLabel();
  scheduleRender(0);
}

/* ---------- layout & rendering ---------- */

function layout() {
  const cw = V.scroll.clientWidth, ch = V.scroll.clientHeight;
  let maxW = 0;
  for (const p of V.pages) {
    const base = V.fit === 'width' ? cw : Math.min(cw, ch * p.w / p.h);
    p.cssW = Math.max(1, Math.round(base * V.zoom));
    p.cssH = Math.max(1, Math.round(p.cssW * p.h / p.w));
    p.div.style.width = p.cssW + 'px';
    p.div.style.height = p.cssH + 'px';
    p.div.style.marginBottom = Math.round(GAP * V.zoom) + 'px';
    maxW = Math.max(maxW, p.cssW);
    dropDetail(p);
  }
  V.pagesEl.style.width = Math.max(cw, maxW) + 'px';
  if (V.endEl) V.endEl.style.width = cw + 'px';
}

function relayoutKeepingPosition() {
  const s = V.scroll;
  const fy = s.scrollHeight > s.clientHeight ? s.scrollTop / s.scrollHeight : 0;
  layout();
  s.scrollTop = fy * s.scrollHeight;
  updatePageLabel();
  scheduleRender(0);
}

let renderTimer = 0;
function scheduleRender(delay = 80) {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderVisible, delay);
}

async function renderVisible() {
  const token = ++V.renderToken;
  const s = V.scroll;
  const top = s.scrollTop, ch = s.clientHeight;
  const near = [];
  for (const p of V.pages) {
    const pTop = p.div.offsetTop, pBottom = pTop + p.cssH;
    const dist = pBottom < top ? top - pBottom : pTop > top + ch ? pTop - (top + ch) : 0;
    if (dist <= ch) near.push([dist, p]);
    else if (dist > ch * 3) release(p);
    if (dist > 0) dropDetail(p);
  }
  near.sort((a, b) => a[0] - b[0]);
  for (const [, p] of near) {
    if (token !== V.renderToken) return;
    await renderPage(p);
  }
  for (const [dist, p] of near) {
    if (token !== V.renderToken) return;
    if (dist === 0) await renderDetail(p);
  }
}

async function renderPage(p) {
  if (!p.page) return;
  const dpr = window.devicePixelRatio || 1;
  const area = p.cssW * p.cssH;
  const scale = Math.min(dpr, Math.sqrt(MAX_CANVAS_PX / area));
  p.sharp = scale >= dpr * 0.98;
  const pw = Math.round(p.cssW * scale);
  if (p.canvas && p.renderedW === pw) return;
  p.task?.cancel();
  const viewport = p.page.getViewport({ scale: pw / p.w });
  const canvas = document.createElement('canvas');
  canvas.className = 'v-canvas';
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const task = p.page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport, background: '#ffffff' });
  p.task = task;
  try { await task.promise; } catch { canvas.width = 0; return; }
  if (p.task !== task || !p.div.isConnected) { canvas.width = 0; return; }
  p.task = null;
  if (p.canvas) { p.canvas.width = 0; p.canvas.remove(); }
  p.div.prepend(canvas);
  p.canvas = canvas;
  p.renderedW = pw;
}

// When zoomed in beyond what a whole-page canvas can hold, draw the visible part at full sharpness.
async function renderDetail(p) {
  if (!p.page || p.sharp) { dropDetail(p); return; }
  const dpr = window.devicePixelRatio || 1;
  const s = V.scroll;
  const x0 = Math.max(0, Math.floor(s.scrollLeft - p.div.offsetLeft));
  const y0 = Math.max(0, Math.floor(s.scrollTop - p.div.offsetTop));
  const x1 = Math.min(p.cssW, Math.ceil(s.scrollLeft + s.clientWidth - p.div.offsetLeft));
  const y1 = Math.min(p.cssH, Math.ceil(s.scrollTop + s.clientHeight - p.div.offsetTop));
  if (x1 <= x0 || y1 <= y0) { dropDetail(p); return; }
  const key = [x0, y0, x1, y1, p.cssW].join();
  if (p.detailKey === key) return;
  p.detailTask?.cancel();
  const viewport = p.page.getViewport({ scale: p.cssW * dpr / p.w, offsetX: -x0 * dpr, offsetY: -y0 * dpr });
  const canvas = document.createElement('canvas');
  canvas.className = 'v-detail';
  canvas.width = Math.ceil((x1 - x0) * dpr);
  canvas.height = Math.ceil((y1 - y0) * dpr);
  Object.assign(canvas.style, { left: x0 + 'px', top: y0 + 'px', width: (x1 - x0) + 'px', height: (y1 - y0) + 'px' });
  const task = p.page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport, background: '#ffffff' });
  p.detailTask = task;
  try { await task.promise; } catch { canvas.width = 0; return; }
  if (p.detailTask !== task || !p.div.isConnected) { canvas.width = 0; return; }
  p.detailTask = null;
  dropDetail(p);
  p.div.append(canvas);
  p.detail = canvas;
  p.detailKey = key;
}

function dropDetail(p) {
  p.detailTask?.cancel();
  p.detailTask = null;
  if (p.detail) { p.detail.width = 0; p.detail.remove(); }
  p.detail = null;
  p.detailKey = '';
}

function release(p) {
  p.task?.cancel();
  p.task = null;
  if (p.canvas) { p.canvas.width = 0; p.canvas.remove(); }
  p.canvas = null;
  p.renderedW = 0;
  dropDetail(p);
}

/* ---------- zoom, gestures, page turning ---------- */

const clampZoom = z => Math.min(MAX_ZOOM, Math.max(1, z));

// Zoom so that content point (px, py) stays at viewport point (mx, my).
function commitZoom(newZoom, px, py, mx, my) {
  newZoom = clampZoom(newZoom);
  const ratio = newZoom / V.zoom;
  V.zoom = newZoom;
  V.pagesEl.style.transform = '';
  layout();
  V.scroll.scrollLeft = px * ratio - mx;
  V.scroll.scrollTop = py * ratio - my;
  updatePageLabel();
  showZoom();
  scheduleRender(0);
}

function zoomAt(z, mx = V.scroll.clientWidth / 2, my = V.scroll.clientHeight / 2) {
  commitZoom(z, V.scroll.scrollLeft + mx, V.scroll.scrollTop + my, mx, my);
}

let zoomTimer = 0;
function showZoom() {
  const el = V.root.querySelector('.v-zoom');
  el.textContent = Math.round(V.zoom * 100) + '%';
  el.hidden = false;
  clearTimeout(zoomTimer);
  zoomTimer = setTimeout(() => { el.hidden = true; }, 900);
}

function setupGestures() {
  const s = V.scroll;
  let pinch = null;
  const mid = (a, b, r) => [(a.clientX + b.clientX) / 2 - r.left, (a.clientY + b.clientY) / 2 - r.top];
  const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  s.addEventListener('touchstart', e => {
    if (e.touches.length !== 2 || !V.pages.length) return;
    e.preventDefault();
    const [a, b] = e.touches;
    const r = s.getBoundingClientRect();
    const [mx, my] = mid(a, b, r);
    pinch = { d0: dist(a, b) || 1, px: s.scrollLeft + mx, py: s.scrollTop + my, mx, my, s: 1 };
    V.pagesEl.style.transformOrigin = '0 0';
  }, { passive: false });

  s.addEventListener('touchmove', e => {
    if (!pinch || e.touches.length < 2) return;
    if (e.cancelable) e.preventDefault();
    const [a, b] = e.touches;
    const r = s.getBoundingClientRect();
    const [mx, my] = mid(a, b, r);
    const sc = clampZoom(V.zoom * dist(a, b) / pinch.d0) / V.zoom;
    const tx = mx + s.scrollLeft - pinch.px * sc;
    const ty = my + s.scrollTop - pinch.py * sc;
    V.pagesEl.style.transform = `translate(${tx}px, ${ty}px) scale(${sc})`;
    Object.assign(pinch, { s: sc, mx, my });
  }, { passive: false });

  const end = e => {
    if (!pinch || e.touches.length >= 2) return;
    const p = pinch;
    pinch = null;
    ignoreClickUntil = Date.now() + 400;
    commitZoom(V.zoom * p.s, p.px, p.py, p.mx, p.my);
  };
  s.addEventListener('touchend', end);
  s.addEventListener('touchcancel', end);

  // Taps: edges turn pages, middle shows/hides the bars, double-tap zooms.
  let ignoreClickUntil = 0, lastTap = 0, lastX = 0, lastY = 0, tapTimer = 0;
  s.addEventListener('click', e => {
    if (e.target.closest('button') || Date.now() < ignoreClickUntil) return;
    const r = s.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const now = Date.now();
    if (now - lastTap < 300 && Math.hypot(x - lastX, y - lastY) < 40) {
      clearTimeout(tapTimer);
      lastTap = 0;
      zoomAt(V.zoom > 1.05 ? 1 : 2.5, x, y);
      return;
    }
    lastTap = now; lastX = x; lastY = y;
    tapTimer = setTimeout(() => {
      if (x < r.width * 0.25) pageUp();
      else if (x > r.width * 0.75) pageDown();
      else toggleBars();
    }, 280);
  });

  // Desktop: ctrl + wheel (and trackpad pinch) zooms.
  s.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const r = s.getBoundingClientRect();
    zoomAt(V.zoom * Math.exp(-e.deltaY / 300), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
}

function pageTops() { return V.pages.map(p => p.div.offsetTop); }

function pageDown() {
  const s = V.scroll;
  const max = s.scrollHeight - s.clientHeight;
  if (s.scrollTop >= max - 2) { if (V.index < V.items.length - 1) go(V.index + 1); return; }
  let target = s.scrollTop + s.clientHeight * 0.9;
  if (V.fit === 'page' && V.zoom <= 1.01) {
    const next = pageTops().find(t => t > s.scrollTop + 2);
    target = next ?? max;
  }
  s.scrollTo({ top: Math.min(target, max), behavior: 'instant' });
}

function pageUp() {
  const s = V.scroll;
  if (s.scrollTop <= 2) { if (V.index > 0) go(V.index - 1); return; }
  let target = s.scrollTop - s.clientHeight * 0.9;
  if (V.fit === 'page' && V.zoom <= 1.01) {
    const prev = pageTops().filter(t => t < s.scrollTop - 2).pop();
    target = prev ?? 0;
  }
  s.scrollTo({ top: Math.max(target, 0), behavior: 'instant' });
}
