import * as db from './db.js';
import { openViewer, closeViewer } from './viewer.js';

/* ---------- helpers ---------- */

const $ = (sel, el = document) => el.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const collator = new Intl.Collator('en-GB', { numeric: true, sensitivity: 'base' });
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const fmtSize = b => b >= 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB';
const fmtDate = d => d ? new Date(d + 'T12:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';

const SCORE_EXT = /\.(pdf|png|jpe?g|webp|gif)$/i;
const XMAS = /christmas|xmas|carol|\bno[eë]l\b|nowell|advent|nativity|bethlehem|manger|santa|jingle|sleigh|reindeer|rudolph|mistletoe|holly|wenceslas|while shepherds|wise men|three kings|silent night|holy night|stille nacht|frosty|snowman|winter wonderland|let it snow|yule|emmanuel|immanuel|little donkey|all ye faithful|adeste|herald angels|joy to the world|midwinter|god rest ye|deck the hall|little town|royal david|twelve days|ding dong merrily|drummer boy|mary'?s boy child|it came upon|in dulci|gaudete|coventry|cherry tree|angels from the realms|infant holy|tannenbaum|feliz navidad|mince pie/i;

const DEFAULT_CATEGORIES = () => [{ id: 'christmas', name: 'Christmas' }, { id: 'general', name: 'Non-Christmas' }];

/* ---------- state ---------- */

let state;
const ui = { tab: 'songs', q: '', cat: 'all', select: null, progId: null, progEdit: false };

async function loadState() {
  state = await db.get('kv', 'state').catch(() => null);
  if (!state) state = { categories: DEFAULT_CATEGORIES(), songs: {}, programmes: [], settings: {} };
  state.settings = { fit: 'width', fullscreen: true, ...state.settings };
}

let saveTimer = 0;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 200);
}
function flush() {
  clearTimeout(saveTimer);
  return db.put('kv', 'state', state).catch(err => toast('Could not save: ' + err.message));
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

const songs = () => Object.values(state.songs);
const catName = id => state.categories.find(c => c.id === id)?.name ?? '';
const programme = id => state.programmes.find(p => p.id === id);

function filterSongs(q, cat) {
  const words = norm(q).split(' ').filter(Boolean);
  return songs()
    .filter(s => cat === 'all' || (cat === 'none' ? !s.cats.length : s.cats.includes(cat)))
    .filter(s => { const t = norm(s.title + ' ' + s.file); return words.every(w => t.includes(w)); })
    .sort((a, b) => collator.compare(a.title, b.title));
}

/* ---------- Android back button: each sheet / sub-screen / viewer is a history entry ---------- */

const layers = [];
let ignorePops = 0;
function pushLayer(close) {
  layers.push(close);
  history.pushState({ layer: layers.length }, '');
}
function replaceTopLayer(close) { layers[layers.length - 1] = close; }
function back() { if (layers.length) history.back(); }
function dropAllLayers() {
  if (!layers.length) return;
  const n = layers.length;
  layers.length = 0;
  ignorePops++;
  history.go(-n);
}
window.addEventListener('popstate', () => {
  if (ignorePops) { ignorePops--; return; }
  const close = layers.pop();
  close?.();
});

/* ---------- toast & sheet ---------- */

let toastTimer = 0;
function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}

let sheetOpen = false, sheetLocked = false, sheetOnClose = null;
function openSheet(html, { locked = false, onClose = null } = {}) {
  $('#sheet-body').innerHTML = html;
  sheetLocked = locked;
  sheetOnClose = onClose;
  if (!sheetOpen) {
    sheetOpen = true;
    $('#sheet').hidden = false;
    $('#sheet-backdrop').hidden = false;
    pushLayer(hideSheet);
  }
  $('#sheet').scrollTop = 0;
}
function hideSheet() {
  sheetOpen = false;
  $('#sheet').hidden = true;
  $('#sheet-backdrop').hidden = true;
  $('#sheet-body').innerHTML = '';
  const cb = sheetOnClose;
  sheetOnClose = null;
  cb?.();
}
function closeSheet() { if (sheetOpen) back(); }
$('#sheet-backdrop').addEventListener('click', () => { if (!sheetLocked) closeSheet(); });

/* ---------- viewer ---------- */

async function getSong(id) {
  const s = state.songs[id];
  if (!s) return null;
  const blob = await db.get('files', id);
  return blob ? { title: s.title, kind: s.kind, blob } : null;
}

function openSong(id) {
  const s = state.songs[id];
  if (!s) return;
  viewSongs([{ songId: id, title: s.title }], 0, '');
}

function viewSongs(items, index, label) {
  if (sheetOpen) {
    // Close the sheet without leaving its history entry, then let the viewer own that entry.
    sheetOpen = false;
    $('#sheet').hidden = true;
    $('#sheet-backdrop').hidden = true;
    sheetOnClose = null;
    replaceTopLayer(closeViewer);
  } else {
    pushLayer(closeViewer);
  }
  openViewer($('#viewer'), {
    items, index, label, getSong,
    fit: state.settings.fit,
    fullscreen: state.settings.fullscreen,
    onFit: fit => { state.settings.fit = fit; save(); },
    onClose: back
  });
}

/* ---------- top bar & tabs ---------- */

function setTop(title, { backBtn = false, actions = '' } = {}) {
  $('#title').textContent = title;
  $('#back').hidden = !backBtn;
  $('#top-actions').innerHTML = actions;
}
$('#back').addEventListener('click', back);

document.querySelectorAll('.tabbar button').forEach(b => b.addEventListener('click', () => {
  dropAllLayers();
  if (sheetOpen) hideSheet();
  ui.tab = b.dataset.tab;
  ui.progId = null;
  ui.progEdit = false;
  ui.select = null;
  render();
  window.scrollTo(0, 0);
}));

function render() {
  document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === ui.tab));
  document.body.classList.toggle('selecting', !!ui.select);
  if (ui.tab === 'songs') renderSongs();
  else if (ui.tab === 'programmes') ui.progId && programme(ui.progId) ? renderProgramme() : renderProgrammes();
  else renderLibrary();
}

const view = $('#view');

/* ---------- Songs tab ---------- */

function categoryChips(counts, current, attr = 'data-cat') {
  const chip = (id, label, n) =>
    `<button class="chip ${current === id ? 'on' : ''}" ${attr}="${esc(id)}">${esc(label)} <span class="n">${n}</span></button>`;
  return chip('all', 'All', counts.all) +
    state.categories.map(c => chip(c.id, c.name, counts[c.id] || 0)).join('') +
    (counts.none ? chip('none', 'Uncategorised', counts.none) : '');
}

function countByCat() {
  const counts = { all: 0, none: 0 };
  for (const s of songs()) {
    counts.all++;
    if (!s.cats.length) counts.none++;
    for (const c of s.cats) counts[c] = (counts[c] || 0) + 1;
  }
  return counts;
}

function catTags(s) {
  return s.cats.map(c => `<span class="tag ${c === 'christmas' ? 'xmas' : ''}">${esc(catName(c))}</span>`).join('');
}

function renderSongs() {
  const total = songs().length;
  if (!total) {
    setTop('Songs');
    view.innerHTML = `
      <div class="welcome">
        <div class="welcome-art" aria-hidden="true">𝄞</div>
        <h2>Add your scores</h2>
        <p>Choose your <b>songs/_BFS</b> folder and the app will copy its PDFs and pictures into its own storage on this phone, so they open instantly, even offline.</p>
        <button class="btn primary big" data-act="import-folder">Choose the _BFS folder</button>
        <button class="btn" data-act="import-files">Choose files instead</button>
        <p class="hint">In the picker, open <b>Internal shared storage › songs › _BFS</b>. If you can only pick files, open that folder, then use ⋮ › <b>Select all</b>.</p>
      </div>`;
    return;
  }
  setTop('Songs', {
    actions: ui.select
      ? `<button class="btn small" data-act="select-all">All</button><button class="btn small" data-act="select-done">Done</button>`
      : `<button class="btn small" data-act="select-start">Select</button>`
  });
  view.innerHTML = `
    <div class="sticky-tools">
      <input id="q" class="search" type="search" placeholder="Search ${plural(total, 'song')}" value="${esc(ui.q)}" autocomplete="off">
      <div class="chips" id="cat-chips"></div>
    </div>
    <ul class="list song-list" id="song-list"></ul>
    <div id="select-bar" class="select-bar" ${ui.select ? '' : 'hidden'}></div>`;
  $('#q').addEventListener('input', e => { ui.q = e.target.value; updateSongList(); });
  updateSongList();
}

function updateSongList() {
  if (ui.cat !== 'all' && ui.cat !== 'none' && !state.categories.some(c => c.id === ui.cat)) ui.cat = 'all';
  const counts = countByCat();
  if (ui.cat === 'none' && !counts.none) ui.cat = 'all';
  $('#cat-chips').innerHTML = categoryChips(counts, ui.cat);
  const list = filterSongs(ui.q, ui.cat);
  $('#song-list').innerHTML = list.length ? list.map(s => `
    <li class="row ${ui.select?.has(s.id) ? 'selected' : ''}" data-song="${s.id}">
      ${ui.select ? '<span class="check" aria-hidden="true"></span>' : ''}
      <button class="row-main" data-open="${s.id}">
        <span class="row-title">${esc(s.title)}</span>
        <span class="row-meta">${catTags(s)}<span class="kind">${s.kind === 'pdf' ? 'PDF' : 'Image'}</span></span>
      </button>
      ${ui.select ? '' : `<button class="icon-btn" data-more="${s.id}" aria-label="Options for ${esc(s.title)}">⋯</button>`}
    </li>`).join('') : `<li class="empty">No songs match.</li>`;
  updateSelectBar();
}

function updateSelectBar() {
  const bar = $('#select-bar');
  if (!bar) return;
  bar.hidden = !ui.select;
  if (!ui.select) return;
  const n = ui.select.size;
  bar.innerHTML = `
    <span class="sel-count">${n} selected</span>
    <button class="btn small" data-act="sel-cat" ${n ? '' : 'disabled'}>Category</button>
    <button class="btn small" data-act="sel-prog" ${n ? '' : 'disabled'}>Add to programme</button>
    <button class="btn small danger" data-act="sel-del" ${n ? '' : 'disabled'} aria-label="Remove selected">🗑</button>`;
}

function songSheet(id) {
  const s = state.songs[id];
  if (!s) return;
  const progs = state.programmes.filter(p => p.items.some(i => i.songId === id));
  openSheet(`
    <h2>${esc(s.title)}</h2>
    <label class="field">Title<input id="s-title" value="${esc(s.title)}"></label>
    <div class="field">Categories
      <div class="chips wrap">${state.categories.map(c =>
        `<button class="chip ${s.cats.includes(c.id) ? 'on' : ''}" data-toggle-cat="${c.id}">${esc(c.name)}</button>`).join('')}</div>
    </div>
    <p class="muted small">${esc(s.file)} · ${s.kind === 'pdf' ? 'PDF' : 'Image'} · ${fmtSize(s.size)}</p>
    ${progs.length ? `<p class="muted small">In: ${progs.map(p => esc(p.name)).join(', ')}</p>` : ''}
    <div class="stack">
      <button class="btn primary" data-act="sheet-open" data-id="${id}">Open score</button>
      <button class="btn" data-act="sheet-addprog" data-id="${id}">Add to programme…</button>
      <button class="btn danger" data-act="sheet-delsong" data-id="${id}">Remove from app</button>
    </div>`, { onClose: render });
  $('#s-title').addEventListener('change', e => {
    const t = e.target.value.trim();
    if (t) { s.title = t; save(); }
  });
  $('#sheet-body').addEventListener('click', e => {
    const b = e.target.closest('[data-toggle-cat]');
    if (!b) return;
    const c = b.dataset.toggleCat;
    s.cats = s.cats.includes(c) ? s.cats.filter(x => x !== c) : [...s.cats, c];
    b.classList.toggle('on', s.cats.includes(c));
    save();
  });
}

function bulkCategorySheet(ids) {
  const draw = () => {
    const sel = ids.map(id => state.songs[id]).filter(Boolean);
    $('#sheet-body').innerHTML = `
      <h2>Category for ${plural(sel.length, 'song')}</h2>
      <p class="muted small">Tap to add or remove a category for all selected songs.</p>
      <div class="stack">${state.categories.map(c => {
        const n = sel.filter(s => s.cats.includes(c.id)).length;
        const mark = n === sel.length ? 'on' : n ? 'some' : '';
        return `<button class="btn toggle ${mark}" data-bulk-cat="${c.id}"><span class="box"></span>${esc(c.name)}<span class="muted small">${n}/${sel.length}</span></button>`;
      }).join('')}</div>
      <button class="btn primary" data-act="close-sheet">Done</button>`;
  };
  openSheet('', { onClose: render });
  draw();
  $('#sheet-body').addEventListener('click', e => {
    const b = e.target.closest('[data-bulk-cat]');
    if (!b) return;
    const c = b.dataset.bulkCat;
    const sel = ids.map(id => state.songs[id]).filter(Boolean);
    const all = sel.every(s => s.cats.includes(c));
    for (const s of sel) s.cats = all ? s.cats.filter(x => x !== c) : s.cats.includes(c) ? s.cats : [...s.cats, c];
    save();
    draw();
  });
}

function addToProgrammeSheet(ids) {
  const progs = [...state.programmes].sort(progSort);
  openSheet(`
    <h2>Add ${ids.length === 1 ? '“' + esc(state.songs[ids[0]]?.title) + '”' : plural(ids.length, 'song')} to…</h2>
    <div class="stack">
      ${progs.map(p => `<button class="btn list-btn" data-add-to="${p.id}"><b>${esc(p.name)}</b><span class="muted small">${[fmtDate(p.date), plural(songCount(p), 'song')].filter(Boolean).join(' · ')}</span></button>`).join('')}
      <button class="btn primary" data-act="new-prog-with">+ New programme</button>
    </div>`, { onClose: render });
  $('#sheet-body').addEventListener('click', e => {
    const b = e.target.closest('[data-add-to]');
    if (b) {
      const p = programme(b.dataset.addTo);
      const added = addSongsToProgramme(p, ids);
      ui.select = null;
      toast(added ? `Added ${plural(added, 'song')} to “${p.name}”` : `Already in “${p.name}”`);
      closeSheet();
    } else if (e.target.closest('[data-act="new-prog-with"]')) {
      programmeDetailsSheet(null, ids);
    }
  });
}

function addSongsToProgramme(p, ids) {
  let n = 0;
  for (const id of ids) {
    const s = state.songs[id];
    if (!s || p.items.some(i => i.songId === id)) continue;
    p.items.push({ id: uid(), songId: id, title: s.title });
    n++;
  }
  p.updated = Date.now();
  save();
  return n;
}

async function deleteSongs(ids) {
  for (const id of ids) {
    delete state.songs[id];
    await db.del('files', id).catch(() => {});
  }
  await flush();
}

/* ---------- Programmes tab ---------- */

const songCount = p => p.items.filter(i => i.songId).length;
const progSort = (a, b) => (b.date || '').localeCompare(a.date || '') || (b.updated || 0) - (a.updated || 0);

function renderProgrammes() {
  setTop('Programmes', { actions: `<button class="btn small primary" data-act="new-prog">+ New</button>` });
  const progs = [...state.programmes].sort(progSort);
  view.innerHTML = progs.length ? `
    <ul class="list">${progs.map(p => `
      <li class="row"><button class="row-main" data-prog="${p.id}">
        <span class="row-title">${esc(p.name)}</span>
        <span class="row-meta">${[fmtDate(p.date), p.venue, plural(songCount(p), 'song')].filter(Boolean).map(esc).join(' · ')}</span>
      </button><span class="chev" aria-hidden="true">›</span></li>`).join('')}
    </ul>` : `
    <div class="welcome">
      <div class="welcome-art" aria-hidden="true">☰</div>
      <h2>No programmes yet</h2>
      <p>A programme is the list of songs for a concert, in the order you'll perform them. Open it on the night and step from one score to the next.</p>
      <button class="btn primary big" data-act="new-prog">+ New programme</button>
    </div>`;
}

function openProgramme(id) {
  ui.progId = id;
  ui.progEdit = false;
  pushLayer(() => { ui.progId = null; ui.progEdit = false; render(); });
  render();
  window.scrollTo(0, 0);
}

function programmeItemsForViewer(p) {
  const out = [];
  let notes = [];
  for (const it of p.items) {
    if (it.note != null) { notes.push(it.note); continue; }
    const s = state.songs[it.songId];
    out.push({ songId: it.songId, title: s?.title ?? it.title, notes, itemId: it.id });
    notes = [];
  }
  return out;
}

function renderProgramme() {
  const p = programme(ui.progId);
  setTop(p.name, {
    backBtn: true,
    actions: `<button class="btn small" data-act="prog-edit">${ui.progEdit ? 'Done' : 'Edit'}</button>`
  });
  let n = 0;
  const rows = p.items.map((it, idx) => {
    const handle = ui.progEdit ? `<span class="handle" data-handle="${idx}" aria-label="Drag to reorder">≡</span>` : '';
    const remove = ui.progEdit ? `<button class="icon-btn" data-remove-item="${it.id}" aria-label="Remove">✕</button>` : '';
    if (it.note != null) {
      return `<li class="row note-row" data-idx="${idx}">${handle}<button class="row-main" data-edit-note="${it.id}"><span class="note-text">${esc(it.note)}</span></button>${remove}</li>`;
    }
    n++;
    const s = state.songs[it.songId];
    return `<li class="row" data-idx="${idx}">${handle}<span class="num">${n}</span>
      <button class="row-main" data-play="${it.id}" ${s ? '' : 'disabled'}>
        <span class="row-title">${esc(s?.title ?? it.title)}</span>
        <span class="row-meta">${s ? catTags(s) : '<span class="tag warn">Not in library</span>'}</span>
      </button>${remove}</li>`;
  }).join('');
  view.innerHTML = `
    <div class="prog-head">
      <p class="muted">${[fmtDate(p.date), p.venue].filter(Boolean).map(esc).join(' · ') || 'No date set'}</p>
      ${p.notes ? `<p class="prog-notes">${esc(p.notes)}</p>` : ''}
      <div class="prog-actions">
        <button class="btn primary" data-act="prog-start" ${songCount(p) ? '' : 'disabled'}>▶ Start</button>
        <button class="btn" data-act="prog-add">+ Songs</button>
        <button class="btn" data-act="prog-more" aria-label="More options">⋯</button>
      </div>
    </div>
    ${p.items.length ? `<ol class="list prog-list ${ui.progEdit ? 'editing' : ''}" id="prog-list">${rows}</ol>`
      : `<p class="empty">No songs yet. Tap <b>+ Songs</b> to pick them in performance order.</p>`}
    ${ui.progEdit ? `<p class="hint">Drag ≡ to change the order. <button class="link" data-act="prog-note">+ Add a note</button> (such as “Interval”).</p>`
      : p.items.length ? `<p class="hint">${plural(songCount(p), 'song')}. Tap a title to open it; tap <b>Edit</b> to reorder.</p>` : ''}`;
  if (ui.progEdit) setupDrag(p);
}

function programmeDetailsSheet(id, songIds = null) {
  const p = id ? programme(id) : { name: '', date: '', venue: '', notes: '' };
  openSheet(`
    <h2>${id ? 'Programme details' : 'New programme'}</h2>
    <label class="field">Name<input id="p-name" value="${esc(p.name)}" placeholder="e.g. Christmas Concert 2026"></label>
    <label class="field">Date<input id="p-date" type="date" value="${esc(p.date)}"></label>
    <label class="field">Venue<input id="p-venue" value="${esc(p.venue)}" placeholder="Optional"></label>
    <label class="field">Notes<textarea id="p-notes" rows="2" placeholder="Optional">${esc(p.notes)}</textarea></label>
    <button class="btn primary" id="p-save">${id ? 'Save' : 'Create'}</button>`);
  $('#p-name').focus();
  $('#p-save').addEventListener('click', () => {
    const name = $('#p-name').value.trim();
    if (!name) { $('#p-name').focus(); toast('Give the programme a name'); return; }
    Object.assign(p, { name, date: $('#p-date').value, venue: $('#p-venue').value.trim(), notes: $('#p-notes').value.trim(), updated: Date.now() });
    if (!id) {
      Object.assign(p, { id: uid(), items: [], created: Date.now() });
      state.programmes.push(p);
      if (songIds) addSongsToProgramme(p, songIds);
    }
    save();
    if (id) { closeSheet(); return; }
    // New programme: go to it, and if it's empty open the song picker straight away.
    ui.select = null;
    sheetOnClose = null;
    const goTo = () => {
      ui.tab = 'programmes';
      openProgramme(p.id);
      if (!p.items.length) pickSongsSheet(p.id);
    };
    sheetOnClose = goTo;
    closeSheet();
  });
}

function pickSongsSheet(progId) {
  const p = programme(progId);
  let q = '', cat = 'all';
  openSheet(`
    <div class="pick-head">
      <h2>Add songs <span class="muted small" id="pick-count"></span></h2>
      <button class="btn small primary" data-act="close-sheet">Done</button>
    </div>
    <p class="muted small">Tap songs in the order they'll be performed. Tap again to remove.</p>
    <input id="pick-q" class="search" type="search" placeholder="Search" autocomplete="off">
    <div class="chips" id="pick-chips"></div>
    <ul class="list pick-list" id="pick-list"></ul>`, { onClose: render });
  const draw = () => {
    $('#pick-chips').innerHTML = categoryChips(countByCat(), cat, 'data-pick-cat');
    const order = new Map(p.items.filter(i => i.songId).map((i, n) => [i.songId, n + 1]));
    $('#pick-count').textContent = `· ${plural(order.size, 'song')}`;
    const list = filterSongs(q, cat);
    $('#pick-list').innerHTML = list.length ? list.map(s => `
      <li class="row ${order.has(s.id) ? 'picked' : ''}"><button class="row-main" data-pick="${s.id}">
        <span class="pick-num">${order.get(s.id) ?? '+'}</span>
        <span class="row-title">${esc(s.title)}</span>
      </button></li>`).join('') : `<li class="empty">${songs().length ? 'No songs match.' : 'Your library is empty. Import scores from the Library tab first.'}</li>`;
  };
  draw();
  $('#pick-q').addEventListener('input', e => { q = e.target.value; draw(); });
  $('#sheet-body').addEventListener('click', e => {
    const c = e.target.closest('[data-pick-cat]');
    if (c) { cat = c.dataset.pickCat; draw(); return; }
    const b = e.target.closest('[data-pick]');
    if (!b) return;
    const id = b.dataset.pick;
    const at = p.items.findIndex(i => i.songId === id);
    if (at >= 0) p.items.splice(at, 1);
    else addSongsToProgramme(p, [id]);
    p.updated = Date.now();
    save();
    draw();
  });
}

function noteSheet(progId, itemId = null) {
  const p = programme(progId);
  const it = itemId ? p.items.find(i => i.id === itemId) : null;
  openSheet(`
    <h2>${it ? 'Edit note' : 'Add a note'}</h2>
    <p class="muted small">Notes appear between songs, e.g. “Interval”, “Audience sing-along” or “Reading”.</p>
    <label class="field">Note<input id="n-text" value="${esc(it?.note ?? '')}" placeholder="Interval"></label>
    <div class="stack">
      <button class="btn primary" id="n-save">${it ? 'Save' : 'Add to end'}</button>
      ${it ? `<button class="btn danger" id="n-del">Delete note</button>` : ''}
    </div>`);
  $('#n-text').focus();
  $('#n-save').addEventListener('click', () => {
    const text = $('#n-text').value.trim() || 'Interval';
    if (it) it.note = text; else p.items.push({ id: uid(), note: text });
    p.updated = Date.now();
    save();
    sheetOnClose = render;
    closeSheet();
  });
  $('#n-del')?.addEventListener('click', () => {
    p.items = p.items.filter(i => i !== it);
    save();
    sheetOnClose = render;
    closeSheet();
  });
}

function programmeMoreSheet(id) {
  openSheet(`
    <h2>${esc(programme(id).name)}</h2>
    <div class="stack">
      <button class="btn" data-act="prog-details">Edit name, date &amp; venue</button>
      <button class="btn" data-act="prog-note">Add a note (e.g. Interval)</button>
      <button class="btn" data-act="prog-share">Share or copy song list</button>
      <button class="btn" data-act="prog-dup">Duplicate programme</button>
      <button class="btn danger" data-act="prog-del">Delete programme</button>
    </div>`);
}

function programmeText(p) {
  let n = 0;
  const lines = [p.name, [fmtDate(p.date), p.venue].filter(Boolean).join(', '), ''];
  for (const it of p.items) {
    if (it.note != null) lines.push(`— ${it.note} —`);
    else lines.push(`${++n}. ${state.songs[it.songId]?.title ?? it.title}`);
  }
  return lines.filter((l, i) => l || i === 2).join('\n');
}

async function shareProgramme(p) {
  const text = programmeText(p);
  try {
    if (navigator.share) { await navigator.share({ title: p.name, text }); return; }
  } catch (err) { if (err.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(text); toast('Song list copied'); }
  catch { toast('Could not share or copy'); }
}

// Drag-to-reorder for the programme list (touch and mouse).
function setupDrag(p) {
  const list = $('#prog-list');
  if (!list) return;
  list.addEventListener('pointerdown', e => {
    const h = e.target.closest('[data-handle]');
    if (!h) return;
    e.preventDefault();
    const row = h.closest('li');
    const rows = [...list.children];
    const from = rows.indexOf(row);
    const rowH = row.getBoundingClientRect().height;
    const mids = rows.map(r => { const b = r.getBoundingClientRect(); return b.top + b.height / 2 + window.scrollY; });
    const startY = e.clientY + window.scrollY;
    let to = from, lastY = e.clientY, raf = 0;
    row.classList.add('dragging');
    h.setPointerCapture(e.pointerId);
    const update = () => {
      const y = lastY + window.scrollY;
      row.style.transform = `translateY(${y - startY}px)`;
      const centre = mids[from] + (y - startY);
      to = mids.filter((m, i) => i !== from && m < centre).length;
      rows.forEach((r, i) => {
        if (r === row) return;
        let shift = 0;
        if (from < to && i > from && i <= to) shift = -rowH;
        if (from > to && i >= to && i < from) shift = rowH;
        r.style.transform = shift ? `translateY(${shift}px)` : '';
      });
    };
    const autoScroll = () => {
      const edge = 70;
      const vh = window.innerHeight;
      const dy = lastY < edge ? -8 : lastY > vh - edge - 64 ? 8 : 0;
      if (dy) { window.scrollBy(0, dy); update(); }
      raf = requestAnimationFrame(autoScroll);
    };
    raf = requestAnimationFrame(autoScroll);
    const move = ev => { lastY = ev.clientY; update(); };
    const up = () => {
      cancelAnimationFrame(raf);
      h.removeEventListener('pointermove', move);
      h.removeEventListener('pointerup', up);
      h.removeEventListener('pointercancel', up);
      if (to !== from) {
        const [it] = p.items.splice(from, 1);
        p.items.splice(to, 0, it);
        p.updated = Date.now();
        save();
      }
      render();
    };
    h.addEventListener('pointermove', move);
    h.addEventListener('pointerup', up);
    h.addEventListener('pointercancel', up);
  });
}

/* ---------- Library tab ---------- */

async function renderLibrary() {
  setTop('Library');
  const all = songs();
  const pdfs = all.filter(s => s.kind === 'pdf').length;
  const bytes = all.reduce((t, s) => t + (s.size || 0), 0);
  view.innerHTML = `
    <section class="card">
      <h2>Scores</h2>
      <p>${all.length ? `${plural(all.length, 'song')} (${pdfs} PDF, ${all.length - pdfs} image) · ${fmtSize(bytes)}` : 'No scores imported yet.'}</p>
      <div class="stack">
        <button class="btn primary" data-act="import-folder">${all.length ? 'Update from the _BFS folder' : 'Choose the _BFS folder'}</button>
        <button class="btn" data-act="import-files">Add individual files</button>
      </div>
      <p class="hint">In the picker, open <b>Internal shared storage › songs › _BFS</b>. Re-import whenever you add or change scores: new files are added and changed ones updated, and your titles, categories and programmes are kept. If you can only pick files, open the folder and use ⋮ › <b>Select all</b>.</p>
    </section>
    <section class="card">
      <h2>Categories</h2>
      <ul class="list cat-list">${state.categories.map(c => `
        <li class="row"><span class="row-main static"><span class="row-title">${esc(c.name)}</span>
        <span class="row-meta">${plural(all.filter(s => s.cats.includes(c.id)).length, 'song')}</span></span>
        <button class="icon-btn" data-cat-rename="${c.id}" aria-label="Rename ${esc(c.name)}">✎</button>
        <button class="icon-btn" data-cat-del="${c.id}" aria-label="Delete ${esc(c.name)}">✕</button></li>`).join('')}
      </ul>
      <button class="btn" data-act="cat-add">+ Add category</button>
      ${all.length ? `<button class="btn" data-act="auto-cat">Re-guess Christmas songs…</button>` : ''}
      <p class="hint">New songs are sorted automatically: titles such as “Silent Night” or “Jingle Bells” go in Christmas, everything else in Non-Christmas. To fix one, tap ⋯ beside it, or use <b>Select</b> on the Songs tab to change many at once.</p>
    </section>
    <section class="card">
      <h2>Viewing</h2>
      <label class="switch"><input type="checkbox" id="set-fs" ${state.settings.fullscreen ? 'checked' : ''}> Open scores full screen</label>
      <p class="hint">In a score: pinch or double-tap to zoom. Tap the right or left edge to go forward or back a screen (at the end of a song in a programme, this moves to the next song). Tap the middle to show the controls. ↕/↔ switches between whole-page and fit-to-width. Bluetooth page-turner pedals work too. The screen stays on while a score is open.</p>
    </section>
    <section class="card">
      <h2>Backup</h2>
      <p class="hint">Saves your programmes, categories and song titles (not the score files, which stay in your _BFS folder). After restoring on a new phone, import the folder again and everything will match up.</p>
      <div class="stack">
        <button class="btn" data-act="backup">Download backup</button>
        <button class="btn" data-act="restore">Restore from backup…</button>
      </div>
      <p class="muted small" id="storage-info"></p>
    </section>
    <section class="card">
      <h2>Start again</h2>
      <button class="btn danger" data-act="wipe">Remove all scores from the app…</button>
    </section>`;
  $('#set-fs').addEventListener('change', e => { state.settings.fullscreen = e.target.checked; save(); });
  if (navigator.storage?.estimate) {
    const [est, persisted] = await Promise.all([navigator.storage.estimate(), navigator.storage.persisted?.() ?? false]);
    const el = $('#storage-info');
    if (el) el.textContent = `Storage used: ${fmtSize(est.usage || 0)}${persisted ? ' · protected from automatic clean-up' : ''}`;
  }
}

/* ---------- importing ---------- */

const fileKey = f => {
  const parts = (f.webkitRelativePath || f.name).split('/');
  if (parts.length > 1) parts.shift(); // drop the chosen folder's own name
  return parts.join('/').toLowerCase();
};
const baseName = key => key.split('/').pop();
const titleFromFile = name => name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();

function guessCategory(text) {
  return XMAS.test(text) ? ['christmas'] : ['general'];
}
const hasDefaultCats = () => state.categories.some(c => c.id === 'christmas') && state.categories.some(c => c.id === 'general');

async function importFiles(fileList) {
  const files = [...fileList].filter(f => SCORE_EXT.test(f.name) && !f.name.startsWith('.'));
  if (!files.length) { toast('No PDF or picture files found there'); return; }
  const fromFolder = files.some(f => f.webkitRelativePath);
  navigator.storage?.persist?.().catch(() => {});

  const byKey = new Map(songs().map(s => [s.key, s]));
  const nameCount = new Map();
  for (const s of songs()) nameCount.set(baseName(s.key), (nameCount.get(baseName(s.key)) || 0) + 1);
  const byName = new Map(songs().filter(s => nameCount.get(baseName(s.key)) === 1).map(s => [baseName(s.key), s]));

  let added = 0, updated = 0, same = 0, failed = 0;
  const seen = new Set();
  openSheet(`<h2>Importing scores…</h2><progress id="imp-bar" max="${files.length}" value="0"></progress><p class="muted small" id="imp-file"></p>`, { locked: true });
  for (const [i, f] of files.entries()) {
    $('#imp-bar') && ($('#imp-bar').value = i);
    $('#imp-file') && ($('#imp-file').textContent = `${i + 1} of ${files.length}: ${f.name}`);
    const key = fileKey(f);
    const existing = byKey.get(key) || byName.get(baseName(key));
    if (existing) seen.add(existing.id);
    try {
      if (existing && existing.size === f.size && existing.modified === f.lastModified) {
        if (existing.key !== key) { existing.key = key; existing.file = f.webkitRelativePath || f.name; }
        same++;
        continue;
      }
      const kind = /\.pdf$/i.test(f.name) ? 'pdf' : 'image';
      const blob = new Blob([await f.arrayBuffer()], { type: f.type || (kind === 'pdf' ? 'application/pdf' : 'image/*') });
      const id = existing?.id || uid();
      await db.put('files', id, blob);
      const meta = { key, file: f.webkitRelativePath || f.name, kind, size: f.size, modified: f.lastModified };
      if (existing) { Object.assign(existing, meta); updated++; }
      else {
        const title = titleFromFile(f.name);
        state.songs[id] = { id, title, cats: hasDefaultCats() ? guessCategory(key + ' ' + title) : [], added: Date.now(), ...meta };
        seen.add(id);
        byKey.set(key, state.songs[id]);
        added++;
      }
    } catch (err) {
      console.error(f.name, err);
      failed++;
    }
  }
  applyPending();
  await flush();
  const missing = fromFolder ? songs().filter(s => !seen.has(s.id)) : [];
  const parts = [added && `${added} added`, updated && `${updated} updated`, same && `${same} unchanged`, failed && `${failed} couldn't be read`].filter(Boolean);
  openSheet(`
    <h2>Import finished</h2>
    <p>${parts.join(', ')}.</p>
    ${added && hasDefaultCats() ? `<p class="muted small">New songs were sorted into Christmas or Non-Christmas from their titles. Check the Christmas list and fix any mistakes with ⋯ or Select.</p>` : ''}
    ${missing.length ? `<p>${plural(missing.length, 'song')} in the app ${missing.length === 1 ? 'is' : 'are'} no longer in that folder.</p>
      <button class="btn" data-act="remove-missing">Remove ${missing.length === 1 ? 'it' : 'them'} from the app</button>` : ''}
    <button class="btn primary" data-act="close-sheet">OK</button>`, { onClose: render });
  sheetLocked = false;
  $('[data-act="remove-missing"]')?.addEventListener('click', async e => {
    e.stopPropagation();
    await deleteSongs(missing.map(s => s.id));
    toast(`Removed ${plural(missing.length, 'song')}`);
    closeSheet();
  });
}

$('#pick-folder').addEventListener('change', e => { const f = e.target.files; if (f?.length) importFiles(f); e.target.value = ''; });
$('#pick-files').addEventListener('change', e => { const f = e.target.files; if (f?.length) importFiles(f); e.target.value = ''; });

/* ---------- backup ---------- */

function downloadBackup() {
  const data = {
    app: 'scores', version: 1, exported: new Date().toISOString(),
    categories: state.categories,
    programmes: state.programmes,
    songs: songs().map(({ id, key, file, title, cats }) => ({ id, key, file, title, cats })),
    settings: state.settings
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
  a.download = `scores-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

async function restoreBackup(file) {
  let data;
  try { data = JSON.parse(await file.text()); } catch { toast('That file isn\'t a backup'); return; }
  if (data.app !== 'scores' || !Array.isArray(data.programmes)) { toast('That file isn\'t a Scores backup'); return; }
  // Categories: add any that don't exist yet.
  for (const c of data.categories || []) if (!state.categories.some(x => x.id === c.id)) state.categories.push(c);
  // Songs: songs already imported get their saved title and categories; others are remembered for when they're imported.
  const idMap = new Map();
  const byKey = new Map(songs().map(s => [s.key, s]));
  for (const b of data.songs || []) {
    const s = byKey.get(b.key);
    if (s) { s.title = b.title; s.cats = b.cats || []; idMap.set(b.id, s.id); }
    else idMap.set(b.id, b.id);
    if (!s) {
      state.pending ||= {};
      state.pending[b.key] = b;
    }
  }
  for (const p of data.programmes) {
    p.items = p.items.map(i => i.songId ? { ...i, songId: idMap.get(i.songId) ?? i.songId } : i);
    const at = state.programmes.findIndex(x => x.id === p.id);
    if (at >= 0) state.programmes[at] = p; else state.programmes.push(p);
  }
  if (data.settings) state.settings = { ...state.settings, ...data.settings };
  await flush();
  toast(`Restored ${plural(data.programmes.length, 'programme')}`);
  render();
}

// Songs restored from a backup before their files were imported: match them up on import.
function applyPending() {
  if (!state.pending) return;
  for (const s of songs()) {
    const b = state.pending[s.key];
    if (!b) continue;
    s.title = b.title;
    s.cats = b.cats || [];
    for (const p of state.programmes) for (const i of p.items) if (i.songId === b.id) i.songId = s.id;
    delete state.pending[s.key];
  }
  if (!Object.keys(state.pending).length) delete state.pending;
  save();
}

$('#pick-backup').addEventListener('change', e => { const f = e.target.files?.[0]; if (f) restoreBackup(f); e.target.value = ''; });

/* ---------- categories ---------- */

function categorySheet(id = null) {
  const c = id ? state.categories.find(x => x.id === id) : null;
  openSheet(`
    <h2>${c ? 'Rename category' : 'New category'}</h2>
    <label class="field">Name<input id="c-name" value="${esc(c?.name ?? '')}" placeholder="e.g. Hymns"></label>
    <button class="btn primary" id="c-save">${c ? 'Save' : 'Add'}</button>`, { onClose: render });
  $('#c-name').focus();
  $('#c-save').addEventListener('click', () => {
    const name = $('#c-name').value.trim();
    if (!name) return;
    if (c) c.name = name; else state.categories.push({ id: uid(), name });
    save();
    closeSheet();
  });
}

function confirmSheet(title, body, okLabel, onOk) {
  openSheet(`<h2>${title}</h2><p>${body}</p>
    <div class="stack"><button class="btn danger" id="ok">${okLabel}</button><button class="btn" data-act="close-sheet">Cancel</button></div>`);
  $('#ok').addEventListener('click', async () => {
    sheetOnClose = render;
    await onOk();
    closeSheet();
  });
}

/* ---------- one click handler for everything ---------- */

document.addEventListener('click', e => {
  const t = e.target;
  const act = t.closest('[data-act]')?.dataset.act;
  const p = ui.progId && programme(ui.progId);

  if (t.closest('[data-open]')) {
    const id = t.closest('[data-open]').dataset.open;
    if (ui.select) {
      ui.select.has(id) ? ui.select.delete(id) : ui.select.add(id);
      t.closest('li').classList.toggle('selected', ui.select.has(id));
      updateSelectBar();
    } else openSong(id);
    return;
  }
  if (t.closest('[data-more]')) return songSheet(t.closest('[data-more]').dataset.more);
  if (t.closest('[data-cat]')) { ui.cat = t.closest('[data-cat]').dataset.cat; updateSongList(); return; }
  if (t.closest('[data-prog]')) return openProgramme(t.closest('[data-prog]').dataset.prog);
  if (t.closest('[data-play]') && p) {
    const items = programmeItemsForViewer(p);
    const idx = items.findIndex(i => i.itemId === t.closest('[data-play]').dataset.play);
    return viewSongs(items, Math.max(0, idx), p.name);
  }
  if (t.closest('[data-remove-item]') && p) {
    p.items = p.items.filter(i => i.id !== t.closest('[data-remove-item]').dataset.removeItem);
    save();
    return render();
  }
  if (t.closest('[data-edit-note]') && p) return noteSheet(p.id, t.closest('[data-edit-note]').dataset.editNote);
  if (t.closest('[data-cat-rename]')) return categorySheet(t.closest('[data-cat-rename]').dataset.catRename);
  if (t.closest('[data-cat-del]')) {
    const c = state.categories.find(x => x.id === t.closest('[data-cat-del]').dataset.catDel);
    const n = songs().filter(s => s.cats.includes(c.id)).length;
    return confirmSheet(`Delete “${esc(c.name)}”?`, n ? `${plural(n, 'song')} will lose this category. The songs themselves are kept.` : 'No songs use it.', 'Delete category', () => {
      state.categories = state.categories.filter(x => x !== c);
      for (const s of songs()) s.cats = s.cats.filter(x => x !== c.id);
      return flush();
    });
  }

  switch (act) {
    case 'close-sheet': return closeSheet();
    case 'import-folder': return $('#pick-folder').click();
    case 'import-files': return $('#pick-files').click();
    case 'select-start': ui.select = new Set(); return render();
    case 'select-done': ui.select = null; return render();
    case 'select-all': filterSongs(ui.q, ui.cat).forEach(s => ui.select.add(s.id)); return updateSongList();
    case 'sel-cat': return bulkCategorySheet([...ui.select]);
    case 'sel-prog': return addToProgrammeSheet([...ui.select]);
    case 'sel-del': {
      const ids = [...ui.select];
      return confirmSheet(`Remove ${plural(ids.length, 'song')}?`, 'They\'ll be removed from this app and from any programmes that use them. The files in your _BFS folder are not touched.', 'Remove', async () => {
        await deleteSongs(ids);
        ui.select = null;
      });
    }
    case 'sheet-open': return openSong(t.closest('[data-id]').dataset.id);
    case 'sheet-addprog': return addToProgrammeSheet([t.closest('[data-id]').dataset.id]);
    case 'sheet-delsong': {
      const id = t.closest('[data-id]').dataset.id;
      return confirmSheet(`Remove “${esc(state.songs[id].title)}”?`, 'It will be removed from this app. The file in your _BFS folder is not touched; import the folder again to bring it back.', 'Remove', () => deleteSongs([id]));
    }
    case 'new-prog': return programmeDetailsSheet(null);
    case 'prog-edit': ui.progEdit = !ui.progEdit; return render();
    case 'prog-start': return viewSongs(programmeItemsForViewer(p), 0, p.name);
    case 'prog-add': return pickSongsSheet(p.id);
    case 'prog-more': return programmeMoreSheet(p.id);
    case 'prog-details': return programmeDetailsSheet(p.id);
    case 'prog-note': return noteSheet(p.id);
    case 'prog-share': return shareProgramme(p);
    case 'prog-dup': {
      const copy = { ...structuredClone(p), id: uid(), name: p.name + ' (copy)', created: Date.now(), updated: Date.now() };
      copy.items = copy.items.map(i => ({ ...i, id: uid() }));
      state.programmes.push(copy);
      save();
      toast('Programme duplicated');
      sheetOnClose = () => { ui.progId = copy.id; render(); };
      return closeSheet();
    }
    case 'prog-del':
      return confirmSheet(`Delete “${esc(p.name)}”?`, 'The programme is deleted. Its songs stay in your library.', 'Delete programme', async () => {
        state.programmes = state.programmes.filter(x => x !== p);
        await flush();
        sheetOnClose = null;
        setTimeout(back, 50); // leave the programme screen too
      });
    case 'cat-add': return categorySheet();
    case 'auto-cat':
      return confirmSheet('Re-guess Christmas songs?', 'Every song is put in Christmas or Non-Christmas based on its title and folder. Any changes you made to those two categories will be replaced. Other categories are kept.', 'Re-guess', () => {
        if (!state.categories.some(c => c.id === 'christmas')) state.categories.unshift({ id: 'christmas', name: 'Christmas' });
        if (!state.categories.some(c => c.id === 'general')) state.categories.splice(1, 0, { id: 'general', name: 'Non-Christmas' });
        for (const s of songs()) s.cats = [...s.cats.filter(c => c !== 'christmas' && c !== 'general'), ...guessCategory(s.key + ' ' + s.title)];
        return flush();
      });
    case 'backup': return downloadBackup();
    case 'restore': return $('#pick-backup').click();
    case 'wipe':
      return confirmSheet('Remove all scores?', 'All scores are removed from this app. Programmes and categories are kept, and the files in your _BFS folder are not touched.', 'Remove all', async () => {
        await db.clear('files');
        state.songs = {};
        await flush();
      });
  }
});

/* ---------- start ---------- */

await loadState();
applyPending();
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
