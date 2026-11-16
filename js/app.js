/* Bird Log — main app */
(() => {
  'use strict';

  // ---------- Storage ----------
  const KEY = 'bdlog.v1';
  const DEFAULT_EXPORT = {
    format: 'html', sort: 'taxonomic', groups: false, sci: true, counts: true,
    notes: true, header: true, links: false, highlights: true
  };
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && Array.isArray(s.trips)) {
        s.settings = { gps: false, logSort: 'seen', ...(s.settings || {}) };
        s.settings.export = { ...DEFAULT_EXPORT, ...(s.settings.export || {}) };
        return s;
      }
    } catch (e) { /* fall through */ }
    return { trips: [], current: null, settings: { gps: false, logSort: 'seen', export: { ...DEFAULT_EXPORT } } };
  }
  let state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { toast('⚠️ Could not save. Is storage full?'); }
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = Exporter.esc;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const todayISO = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const BY_NAME = new Map(BIRDS.map(b => [b.name, b]));
  const statusText = b => b.status.map(c => STATUS_LABELS[c]).filter(Boolean).join(' · ');
  const isScarce = b => b.status.includes('X');
  const currentTrip = () => state.trips.find(t => t.id === state.current) || null;
  const fmtTime = iso => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // ---------- Search ----------
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '').replace(/[-/]/g, ' ').replace(/\s+/g, ' ').trim();
  const INDEX = BIRDS.map(b => {
    const n = norm(b.name);
    return {
      b, n,
      words: n.split(' '),
      aliases: b.aliases.map(norm),
      sci: norm(b.sci),
      initials: n.split(' ').map(w => w[0]).join('')
    };
  });
  function prefixAll(tokens, words) {
    return tokens.every(t => words.some(w => w.startsWith(t)));
  }
  function search(q, limit = Infinity) {
    const nq = norm(q);
    if (!nq) return [];
    const tokens = nq.split(' ');
    const compact = nq.replace(/ /g, '');
    const out = [];
    for (const e of INDEX) {
      let score = 0;
      if (e.n === nq) score = 1000;
      else if (e.n.startsWith(nq)) score = 850;
      else if (prefixAll(tokens, e.words)) score = 700 - e.words.findIndex(w => w.startsWith(tokens[0]));
      else if (e.aliases.some(a => a === nq || a.startsWith(nq))) score = 600;
      else if (e.aliases.some(a => prefixAll(tokens, a.split(' ')))) score = 500;
      else if (compact.length >= 2 && tokens.length === 1 && e.initials === compact) score = 480;
      else if (prefixAll(tokens, e.sci.split(' '))) score = 400;
      else if (e.n.includes(nq)) score = 250;
      else if (compact.length >= 2 && tokens.length === 1 && e.initials.startsWith(compact)) score = 200;
      if (score) out.push({ b: e.b, score: score - (isScarce(e.b) ? 40 : 0) });
    }
    out.sort((a, b) => b.score - a.score || a.b.order - b.b.order);
    return out.slice(0, limit).map(r => r.b);
  }
  function highlight(name, q) {
    const tokens = norm(q).split(' ').filter(Boolean);
    if (!tokens.length) return esc(name);
    return name.split(/(\s+|-)/).map(part => {
      const np = norm(part);
      const t = tokens.find(t => np.startsWith(t));
      if (!t || !np) return esc(part);
      // map normalised prefix length back to original string (accounts for removed apostrophes)
      let i = 0, k = 0;
      while (i < part.length && k < t.length) { if (!/['’]/.test(part[i])) k++; i++; }
      return `<mark>${esc(part.slice(0, i))}</mark>${esc(part.slice(i))}`;
    }).join('');
  }

  // ---------- UI state ----------
  let tab = 'log';
  const ui = { speciesQ: '', speciesGroup: 'All', hideScarce: false, addQ: '' };

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg, undo) {
    const el = $('#toast');
    el.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button" id="toast-undo">Undo</button>' : ''}`;
    el.hidden = false;
    if (undo) $('#toast-undo').onclick = () => { undo(); el.hidden = true; };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, undo ? 4500 : 2500);
  }

  // ---------- Sheet ----------
  function openSheet(html) {
    const sheet = $('#sheet');
    $('#sheet-body').innerHTML = html;
    if (sheet.hidden) {
      history.pushState({ sheet: 1 }, '');
      sheet.hidden = false; $('#sheet-backdrop').hidden = false;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('sheet-open');
    }
    sheet.scrollTop = 0;
  }
  function hideSheet() {
    $('#sheet').hidden = true; $('#sheet-backdrop').hidden = true;
    document.body.style.overflow = '';
    document.body.classList.remove('sheet-open');
    render();
  }
  function closeSheet() {
    if (history.state && history.state.sheet) history.back(); else hideSheet();
  }
  window.addEventListener('popstate', () => { if (!$('#sheet').hidden) hideSheet(); });
  $('#sheet-backdrop').addEventListener('click', closeSheet);

  // ---------- Trips & sightings ----------
  function newTrip(data) {
    const t = { id: uid(), name: data.name || 'Untitled trip', location: data.location || '', start: data.start || todayISO(),
      end: data.end || '', notes: data.notes || '', created: new Date().toISOString(), sightings: [] };
    state.trips.unshift(t);
    state.current = t.id;
    save();
    return t;
  }

  function addSighting(name, custom = false) {
    const trip = currentTrip();
    if (!trip) { tripForm(); return; }
    const existing = trip.sightings.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.count = (existing.count || 0) + 1;
      save();
      toast(`${existing.name}: count now ${existing.count}`, () => { existing.count--; save(); render(); });
    } else {
      const b = BY_NAME.get(name);
      const s = { name: b ? b.name : name, sci: b ? b.sci : '', count: 1, heard: false, star: false, notes: '',
        first: new Date().toISOString(), custom: !b || custom };
      trip.sightings.push(s);
      save();
      toast(`✓ ${s.name} added (#${trip.sightings.length})`, () => {
        trip.sightings = trip.sightings.filter(x => x !== s); save(); render();
      });
      if (state.settings.gps && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          s.lat = +pos.coords.latitude.toFixed(5); s.lon = +pos.coords.longitude.toFixed(5); save();
        }, () => {}, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
      }
    }
    if (navigator.vibrate) navigator.vibrate(15);
  }
  const onTrip = name => { const t = currentTrip(); return t ? t.sightings.find(s => s.name === name) : null; };

  // ---------- Render ----------
  function setTop(title, actionsHtml = '') {
    $('#title').textContent = title;
    $('#top-actions').innerHTML = actionsHtml;
  }

  function render() {
    document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    ({ log: renderLog, species: renderSpecies, guides: renderGuides, trips: renderTrips })[tab]();
  }

  // --- Log tab
  function renderLog() {
    const trip = currentTrip();
    const view = $('#view');
    if (!trip) {
      setTop('Bird Log');
      view.innerHTML = `
        <div class="empty">
          <div class="big">🐦</div>
          <h2>No trip in progress</h2>
          <p>Start a trip, then add every species you see. At the end, export the list for your blog.</p>
          <button class="btn primary" data-act="new-trip">Start a new trip</button>
          ${state.trips.length ? `<p class="small" style="margin-top:18px">Or pick an earlier trip from the <button class="linkish" data-tab-go="trips">Trips</button> tab.</p>` : ''}
        </div>`;
      return;
    }
    setTop(trip.name, `<button class="btn-top" data-act="export" data-id="${trip.id}">Export</button>`);
    const sort = state.settings.logSort;
    const list = Exporter.sortSightings(trip.sightings, sort === 'seen' ? 'seen' : sort).slice();
    if (sort === 'seen') list.reverse(); // newest first while logging
    const dr = Exporter.dateRange(trip.start, trip.end);
    view.innerHTML = `
      <div class="card trip-head row">
        <div class="main" style="flex:1;min-width:0">
          <div class="muted small">${esc([trip.location, dr].filter(Boolean).join(' · ') || 'No location set')}</div>
          <button class="linkish small" data-act="edit-trip" data-id="${trip.id}">Edit trip details</button>
        </div>
        <div class="count">${trip.sightings.length}<small>species</small></div>
      </div>
      <div class="searchbar">
        <input id="add-q" type="search" placeholder="Add a species… (e.g. “gsw”, “wren”)" autocomplete="off" autocapitalize="words" enterkeyhint="done" value="${esc(ui.addQ)}">
        <div id="add-results" class="results"></div>
      </div>
      ${trip.sightings.length ? `
        <div class="row" style="margin:6px 0 8px">
          <span class="muted small">Sort</span>
          <div class="seg">
            ${[['seen', 'Latest'], ['taxonomic', 'Taxonomic'], ['alpha', 'A–Z']].map(([k, l]) =>
              `<button data-act="log-sort" data-v="${k}" class="${sort === k ? 'on' : ''}">${l}</button>`).join('')}
          </div>
        </div>
        <div class="list">${list.map(s => sightingRow(s, sort === 'seen' ? trip.sightings.indexOf(s) + 1 : list.indexOf(s) + 1)).join('')}</div>
        <p class="muted small" style="text-align:center;margin-top:12px">Tap a bird to add notes or mark it as heard only or a highlight.</p>
      ` : `<div class="empty"><div class="big">🔭</div><p>Nothing logged yet. Type a bird name above to add it.</p></div>`}
    `;
    renderAddResults();
  }

  function sightingRow(s, n) {
    return `<div class="item ${s.custom ? 'custom' : ''}">
      <span class="num">${n}</span>
      <div class="main" data-act="sighting" data-name="${esc(s.name)}" role="button" tabindex="0">
        <div class="name">${s.star ? '<span class="star">★</span> ' : ''}${esc(s.name)}${s.heard ? '<span class="flag">(heard)</span>' : ''}</div>
        <div class="sci">${esc(s.notes ? s.notes : (s.sci || (s.custom ? 'Custom species' : '')))}</div>
      </div>
      <div class="stepper">
        <button data-act="dec" data-name="${esc(s.name)}" aria-label="Decrease count">−</button>
        <span class="val">${s.count}</span>
        <button data-act="inc" data-name="${esc(s.name)}" aria-label="Increase count">+</button>
      </div>
    </div>`;
  }

  function renderAddResults() {
    const box = $('#add-results');
    if (!box) return;
    const q = ui.addQ.trim();
    if (!q) { box.innerHTML = ''; return; }
    const res = search(q, 8);
    const exact = res.some(b => norm(b.name) === norm(q));
    box.innerHTML = res.map(b => {
      const s = onTrip(b.name);
      return `<button class="item" data-act="add" data-name="${esc(b.name)}">
        <div class="main"><div class="name">${highlight(b.name, q)}</div>
        <div class="sci">${esc(b.sci)}${isScarce(b) ? ' · scarce' : ''}</div></div>
        ${s ? `<span class="badge green">✓ ${s.count}</span>` : ''}<span class="add-ico">+</span>
      </button>`;
    }).join('') + (exact ? '' : `<button class="item custom" data-act="add-custom" data-name="${esc(q)}">
        <div class="main"><div class="name">Add “${esc(q)}”</div><div class="sci">As a custom species (not on the UK list)</div></div><span class="add-ico">+</span>
      </button>`);
  }

  function sightingSheet(name) {
    const trip = currentTrip(); if (!trip) return;
    const s = trip.sightings.find(x => x.name === name); if (!s) return;
    const b = BY_NAME.get(s.name);
    openSheet(`
      <h2>${esc(s.name)}</h2>
      <div class="sci">${esc(s.sci || 'Custom species')}</div>
      <div class="stack" style="margin-top:14px" data-sighting="${esc(s.name)}">
        <div class="row"><span style="flex:1;font-weight:600">Count</span>
          <div class="stepper">
            <button data-act="dec" data-name="${esc(s.name)}" aria-label="Decrease">−</button>
            <span class="val" id="sh-count">${s.count}</span>
            <button data-act="inc" data-name="${esc(s.name)}" aria-label="Increase">+</button>
          </div>
        </div>
        <label class="check"><input type="checkbox" data-field="heard" ${s.heard ? 'checked' : ''}> Heard only</label>
        <label class="check"><input type="checkbox" data-field="star" ${s.star ? 'checked' : ''}> ★ Trip highlight</label>
        <label class="field"><span>Notes</span><textarea data-field="notes" placeholder="Where, behaviour, plumage…">${esc(s.notes)}</textarea></label>
        <div class="muted small">First logged: ${esc(fmtTime(s.first))}
          ${s.lat != null ? `<br>Location: <a href="https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lon}#map=15/${s.lat}/${s.lon}" target="_blank" rel="noopener">${s.lat}, ${s.lon}</a>` : ''}</div>
      </div>
      <div class="actions">
        ${b ? `<button class="btn" data-act="species" data-name="${esc(b.name)}">📖 ID notes</button>` : ''}
        <button class="btn danger" data-act="remove" data-name="${esc(s.name)}">Remove</button>
        <button class="btn primary" data-act="close">Done</button>
      </div>`);
  }

  // --- Species tab
  function renderSpecies() {
    setTop('UK Species', `<span class="btn-top" style="pointer-events:none">${BIRDS.length}</span>`);
    const view = $('#view');
    view.innerHTML = `
      <div class="searchbar">
        <input id="sp-q" type="search" placeholder="Search by name, alias or scientific name" autocomplete="off" value="${esc(ui.speciesQ)}">
      </div>
      <div class="chips">
        ${['All', ...GROUPS].map(g => `<button class="chip ${ui.speciesGroup === g ? 'on' : ''}" data-act="group" data-v="${esc(g)}">${esc(g)}</button>`).join('')}
      </div>
      <label class="check small" style="padding-top:0"><input type="checkbox" id="hide-scarce" ${ui.hideScarce ? 'checked' : ''}> Hide scarce species</label>
      <div id="sp-list"></div>`;
    renderSpeciesList();
  }
  function renderSpeciesList() {
    const box = $('#sp-list'); if (!box) return;
    let list = ui.speciesQ.trim() ? search(ui.speciesQ) : BIRDS;
    if (ui.speciesGroup !== 'All') list = list.filter(b => b.group === ui.speciesGroup);
    if (ui.hideScarce) list = list.filter(b => !isScarce(b));
    const trip = currentTrip();
    const seen = trip ? list.filter(b => onTrip(b.name)).length : 0;
    box.innerHTML = list.length ? `
      <p class="muted small" style="margin:4px 0 8px">${list.length} species${trip ? ` · ${seen} on “${esc(trip.name)}”` : ''}</p>
      <div class="list">${list.map(b => {
        const s = onTrip(b.name);
        return `<button class="item" data-act="species" data-name="${esc(b.name)}">
          <div class="main"><div class="name">${ui.speciesQ ? highlight(b.name, ui.speciesQ) : esc(b.name)}</div>
          <div class="sci">${esc(b.sci)}</div></div>
          ${isScarce(b) ? '<span class="badge">scarce</span>' : ''}
          ${s ? '<span class="check" aria-label="On trip">✓</span>' : ''}
        </button>`;
      }).join('')}</div>` : `<div class="empty">No species match. You can still add it to your trip as a custom species from the Log tab.</div>`;
  }

  function speciesSheet(name) {
    const b = BY_NAME.get(name); if (!b) return;
    const s = onTrip(b.name);
    const trip = currentTrip();
    const guides = GUIDES.filter(g => g.species.includes(b.name));
    openSheet(`
      <h2>${esc(b.name)}</h2>
      <div class="sci">${esc(b.sci)}</div>
      <div class="row wrap" style="margin:10px 0">
        <span class="badge green">${esc(b.group)}</span>
        ${b.status.map(c => `<span class="badge">${esc(STATUS_LABELS[c])}</span>`).join('')}
      </div>
      ${b.aliases.length ? `<p class="muted small">Also known as: ${esc(b.aliases.join(', '))}</p>` : ''}
      <div class="card"><b>Identification</b><p style="margin:6px 0 0">${esc(b.id || 'No notes yet.')}</p></div>
      ${guides.length ? `<h3>Compare with similar species</h3>${guides.map(g =>
        `<button class="btn block" style="margin-bottom:8px;justify-content:flex-start" data-act="guide" data-v="${GUIDES.indexOf(g)}">📖 ${esc(g.title)}</button>`).join('')}` : ''}
      <p class="small"><a href="https://en.wikipedia.org/wiki/${encodeURIComponent(b.sci.replace(/ /g, '_'))}" target="_blank" rel="noopener">More on Wikipedia ↗</a></p>
      <div class="actions">
        <button class="btn" data-act="close">Close</button>
        ${trip ? `<button class="btn primary" data-act="add" data-name="${esc(b.name)}" data-stay="1">${s ? `+1 (on trip: ${s.count})` : '+ Add to trip'}</button>`
          : `<button class="btn primary" data-act="new-trip">Start a trip</button>`}
      </div>`);
  }

  // --- Guides tab
  function guideBody(g) {
    return `
      <p>${esc(g.intro)}</p>
      ${g.points.map(([who, txt]) => `<div class="cmp"><button class="linkish who" data-act="species" data-name="${esc(who)}">${esc(who)}</button><div>${esc(txt)}</div></div>`).join('')}
      ${g.tip ? `<div class="tip">💡 ${esc(g.tip)}</div>` : ''}`;
  }
  function renderGuides() {
    setTop('ID Guides');
    $('#view').innerHTML = `
      <p class="muted small">Side-by-side comparisons of commonly confused UK birds. Tap a species name for its full card.</p>
      <details class="guide">
        <summary>🧭 Fieldcraft: how to identify a bird</summary>
        <div class="body">${FIELDCRAFT.map(([h, t]) => `<div class="cmp"><div class="who">${esc(h)}</div><div>${esc(t)}</div></div>`).join('')}</div>
      </details>
      <h3>Tricky pairs</h3>
      ${GUIDES.map(g => `<details class="guide"><summary>${esc(g.title)}</summary><div class="body">${guideBody(g)}</div></details>`).join('')}`;
  }
  function guideSheet(i) {
    const g = GUIDES[i]; if (!g) return;
    openSheet(`<h2>${esc(g.title)}</h2>${guideBody(g)}<div class="actions"><button class="btn primary" data-act="close">Close</button></div>`);
  }

  // --- Trips tab
  function renderTrips() {
    setTop('Trips', `<button class="btn-top" data-act="new-trip">+ New</button>`);
    const life = new Set();
    state.trips.forEach(t => t.sightings.forEach(s => life.add(s.name)));
    const year = String(new Date().getFullYear());
    const yearSet = new Set();
    state.trips.filter(t => (t.start || t.created || '').startsWith(year)).forEach(t => t.sightings.forEach(s => yearSet.add(s.name)));
    $('#view').innerHTML = `
      <div class="stats" style="margin-bottom:14px">
        <div class="stat"><b>${state.trips.length}</b><span>trips</span></div>
        <div class="stat"><b>${yearSet.size}</b><span>${year} species</span></div>
        <div class="stat"><b>${life.size}</b><span>all-time species</span></div>
      </div>
      ${state.trips.length ? state.trips.map(t => `
        <div class="card trip-card ${t.id === state.current ? 'active' : ''}">
          <div class="row">
            <div style="flex:1;min-width:0">
              <div style="font-weight:700">${esc(t.name)} ${t.id === state.current ? '<span class="badge green">active</span>' : ''}</div>
              <div class="muted small">${esc([t.location, Exporter.dateRange(t.start, t.end)].filter(Boolean).join(' · '))}</div>
            </div>
            <div style="text-align:right"><b style="font-size:1.3rem;color:var(--accent)">${t.sightings.length}</b><div class="muted small">species</div></div>
          </div>
          <div class="row wrap" style="margin-top:10px">
            ${t.id !== state.current ? `<button class="btn sm" data-act="activate" data-id="${t.id}">Open</button>` : `<button class="btn sm" data-tab-go="log">Log birds</button>`}
            <button class="btn sm primary" data-act="export" data-id="${t.id}">Export</button>
            <button class="btn sm" data-act="edit-trip" data-id="${t.id}">Edit</button>
            <span class="spacer"></span>
            <button class="btn sm danger" data-act="delete-trip" data-id="${t.id}">Delete</button>
          </div>
        </div>`).join('') : `<div class="empty"><div class="big">🧭</div><p>No trips yet.</p><button class="btn primary" data-act="new-trip">Start a new trip</button></div>`}

      <h3>Settings</h3>
      <div class="card">
        <label class="check"><input type="checkbox" id="set-gps" ${state.settings.gps ? 'checked' : ''}> Record GPS position with each new species</label>
        <p class="muted small" style="margin:0">Coordinates go into CSV exports and the sighting details. They are never added to blog exports.</p>
      </div>
      <h3>Backup</h3>
      <div class="card">
        <p class="muted small" style="margin-top:0">Your data is stored only on this device. Make a backup now and then, or to move your data to a new phone.</p>
        <div class="row wrap">
          <button class="btn" data-act="backup">⬇️ Download backup</button>
          <label class="btn">⬆️ Restore<input type="file" id="restore" accept="application/json,.json" hidden></label>
        </div>
      </div>
      <p class="muted small" style="text-align:center">Bird Log · ${BIRDS.length} UK species · works offline</p>`;
  }

  function tripForm(id) {
    const t = id ? state.trips.find(x => x.id === id) : null;
    openSheet(`
      <h2>${t ? 'Edit trip' : 'New trip'}</h2>
      <form id="trip-form" data-id="${t ? t.id : ''}" style="margin-top:12px">
        <label class="field"><span>Trip name</span><input type="text" name="name" required placeholder="e.g. Norfolk coast weekend" value="${esc(t ? t.name : '')}"></label>
        <label class="field"><span>Location</span><input type="text" name="location" placeholder="e.g. Titchwell & Cley" value="${esc(t ? t.location : '')}"></label>
        <div class="row">
          <label class="field" style="flex:1"><span>Start date</span><input type="date" name="start" value="${esc(t ? t.start : todayISO())}"></label>
          <label class="field" style="flex:1"><span>End date</span><input type="date" name="end" value="${esc(t ? t.end : '')}"></label>
        </div>
        <label class="field"><span>Trip notes (included in the blog export)</span><textarea name="notes" placeholder="Weather, highlights, the people you went with…">${esc(t ? t.notes : '')}</textarea></label>
        <div class="actions">
          <button type="button" class="btn" data-act="close">Cancel</button>
          <button type="submit" class="btn primary">${t ? 'Save' : 'Start trip'}</button>
        </div>
      </form>`);
    if (!t) setTimeout(() => $('#trip-form [name=name]')?.focus(), 250);
  }

  // --- Export sheet
  let exportTripId = null;
  function exportSheet(id) {
    const t = state.trips.find(x => x.id === id); if (!t) return;
    exportTripId = id;
    const o = state.settings.export;
    const opt = (k, label, disabled) => `<label class="check"><input type="checkbox" data-eopt="${k}" ${o[k] ? 'checked' : ''} ${disabled ? 'disabled' : ''}> ${label}</label>`;
    const csv = o.format === 'csv';
    openSheet(`
      <h2>Export “${esc(t.name)}”</h2>
      <p class="muted small" style="margin-top:0">${t.sightings.length} species. Copy and paste into your blog editor, or share or download a file.</p>
      <label class="field"><span>Format</span>
        <select data-eopt="format">
          ${[['html', 'Blog (HTML: WordPress, Blogger, Squarespace…)'], ['markdown', 'Markdown (Ghost, Jekyll, Hugo, Substack…)'], ['text', 'Plain text'], ['csv', 'Spreadsheet (CSV)']]
            .map(([k, l]) => `<option value="${k}" ${o.format === k ? 'selected' : ''}>${l}</option>`).join('')}
        </select></label>
      ${csv ? '' : `
      <label class="field"><span>Order</span>
        <select data-eopt="sort">
          ${[['taxonomic', 'Taxonomic (field-guide order)'], ['seen', 'Order seen'], ['alpha', 'Alphabetical']]
            .map(([k, l]) => `<option value="${k}" ${o.sort === k ? 'selected' : ''}>${l}</option>`).join('')}
        </select></label>
      <div class="card" style="padding:4px 14px">
        ${opt('header', 'Trip title, location, dates & notes')}
        ${opt('groups', 'Group headings (taxonomic order only)', o.sort !== 'taxonomic')}
        ${opt('sci', 'Scientific names')}
        ${opt('counts', 'Counts (when more than one)')}
        ${opt('notes', 'Sighting notes')}
        ${opt('highlights', '★ Highlights')}
        ${o.format !== 'text' ? opt('links', 'Link species to Wikipedia') : ''}
      </div>`}
      <h3>Preview</h3>
      <div id="export-preview"></div>
      <div class="actions">
        <button class="btn primary" data-act="copy-export">📋 Copy</button>
        ${navigator.share ? '<button class="btn" data-act="share-export">📤 Share</button>' : ''}
        <button class="btn" data-act="download-export">⬇️ Download</button>
      </div>
      ${o.format === 'html' ? `<p class="muted small">Tip: in WordPress, paste into a <b>Custom HTML</b> block, or paste straight into the visual editor. "Copy" puts the list on the clipboard as formatted text too.</p>` : ''}
      <div class="actions"><button class="btn" data-act="close">Close</button></div>`);
    updateExportPreview();
  }
  function exportOutput() {
    const t = state.trips.find(x => x.id === exportTripId);
    return t ? Exporter.build(t, state.settings.export) : '';
  }
  function updateExportPreview() {
    const box = $('#export-preview'); if (!box) return;
    const out = exportOutput();
    if (state.settings.export.format === 'html') {
      box.className = 'preview';
      box.innerHTML = out; // generated by Exporter with all user text escaped
      box.querySelectorAll('a').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
    } else {
      box.className = 'preview code';
      box.textContent = out;
    }
  }
  function exportFilename() {
    const t = state.trips.find(x => x.id === exportTripId);
    const slug = (t?.name || 'bird-list').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'bird-list';
    return `${slug}.${Exporter.EXT[state.settings.export.format]}`;
  }
  async function copyExport() {
    const out = exportOutput();
    const fmt = state.settings.export.format;
    try {
      if (fmt === 'html' && window.ClipboardItem && navigator.clipboard?.write) {
        // Rich editors take the text/html part. Plain fields (e.g. a WordPress
        // "Custom HTML" block) take text/plain, which holds the HTML source.
        await navigator.clipboard.write([new ClipboardItem({
          'text/html': new Blob([out], { type: 'text/html' }),
          'text/plain': new Blob([out], { type: 'text/plain' })
        })]);
      } else {
        await navigator.clipboard.writeText(out);
      }
      toast('Copied. Paste it into your blog post.');
    } catch (e) {
      // Fallback for older browsers / insecure contexts
      const ta = document.createElement('textarea');
      ta.value = out; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand && document.execCommand('copy');
      ta.remove();
      toast(ok ? 'Copied. Paste it into your blog post.' : 'Copy failed. Try Download instead.');
    }
  }
  async function shareExport() {
    const out = exportOutput();
    const fmt = state.settings.export.format;
    const t = state.trips.find(x => x.id === exportTripId);
    try {
      const file = new File([out], exportFilename(), { type: Exporter.MIME[fmt] });
      if ((fmt === 'csv' || fmt === 'html') && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: t?.name, files: [file] });
      } else {
        await navigator.share({ title: t?.name, text: out });
      }
    } catch (e) { if (e.name !== 'AbortError') toast('Sharing failed. Try Copy instead.'); }
  }
  function download(content, filename, mime) {
    const url = URL.createObjectURL(new Blob([content], { type: mime + ';charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // ---------- Events ----------
  document.addEventListener('click', e => {
    const go = e.target.closest('[data-tab-go]');
    if (go) { if (!$('#sheet').hidden) closeSheet(); switchTab(go.dataset.tabGo); return; }
    const tabBtn = e.target.closest('.tabbar button');
    if (tabBtn) { switchTab(tabBtn.dataset.tab); return; }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act, name = el.dataset.name, id = el.dataset.id;
    const trip = currentTrip();
    switch (act) {
      case 'new-trip': tripForm(); break;
      case 'edit-trip': tripForm(id); break;
      case 'close': closeSheet(); break;
      case 'add':
        addSighting(name);
        if (el.dataset.stay) speciesSheet(name);
        else { ui.addQ = ''; render(); $('#add-q')?.focus(); }
        break;
      case 'add-custom': {
        const n = name.trim().replace(/\s+/g, ' ');
        addSighting(n.charAt(0).toUpperCase() + n.slice(1), true);
        ui.addQ = ''; render(); $('#add-q')?.focus();
        break;
      }
      case 'inc': case 'dec': {
        const s = trip?.sightings.find(x => x.name === name); if (!s) break;
        s.count = Math.max(0, (s.count || 0) + (act === 'inc' ? 1 : -1));
        save();
        if (!$('#sheet').hidden) { const c = $('#sh-count'); if (c) c.textContent = s.count; }
        else render();
        break;
      }
      case 'sighting': sightingSheet(name); break;
      case 'remove': {
        const idx = trip.sightings.findIndex(x => x.name === name);
        if (idx < 0) break;
        const [s] = trip.sightings.splice(idx, 1); save();
        closeSheet();
        toast(`Removed ${s.name}`, () => { trip.sightings.splice(idx, 0, s); save(); render(); });
        break;
      }
      case 'log-sort': state.settings.logSort = el.dataset.v; save(); render(); break;
      case 'species': speciesSheet(name); break;
      case 'guide': guideSheet(+el.dataset.v); break;
      case 'group': ui.speciesGroup = el.dataset.v; render(); break;
      case 'activate': state.current = id; save(); switchTab('log'); break;
      case 'delete-trip': {
        const t = state.trips.find(x => x.id === id);
        if (t && confirm(`Delete “${t.name}” and its ${t.sightings.length} sightings? This can't be undone.`)) {
          state.trips = state.trips.filter(x => x.id !== id);
          if (state.current === id) state.current = null;
          save(); render(); toast('Trip deleted');
        }
        break;
      }
      case 'export': exportSheet(id); break;
      case 'copy-export': copyExport(); break;
      case 'share-export': shareExport(); break;
      case 'download-export': download(exportOutput(), exportFilename(), Exporter.MIME[state.settings.export.format]); break;
      case 'backup':
        download(JSON.stringify({ app: 'bdlog', version: 1, exported: new Date().toISOString(), ...state }, null, 2),
          `bird-log-backup-${todayISO()}.json`, 'application/json');
        break;
    }
  });

  // Keyboard access for role=button rows
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][data-act]')) { e.preventDefault(); e.target.click(); }
    if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet();
  });

  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'add-q') { ui.addQ = t.value; renderAddResults(); return; }
    if (t.id === 'sp-q') { ui.speciesQ = t.value; renderSpeciesList(); return; }
    if (t.matches('[data-field="notes"]')) {
      const s = currentTrip()?.sightings.find(x => x.name === t.closest('[data-sighting]').dataset.sighting);
      if (s) { s.notes = t.value; save(); }
    }
  });

  document.addEventListener('keydown', e => {
    // Enter in the add box adds the top result
    if (e.target.id === 'add-q' && e.key === 'Enter') {
      e.preventDefault();
      const first = $('#add-results [data-act]');
      if (first) first.click();
    }
  });

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.matches('[data-field="heard"], [data-field="star"]')) {
      const s = currentTrip()?.sightings.find(x => x.name === t.closest('[data-sighting]').dataset.sighting);
      if (s) { s[t.dataset.field] = t.checked; save(); }
    } else if (t.id === 'hide-scarce') { ui.hideScarce = t.checked; renderSpeciesList(); }
    else if (t.id === 'set-gps') {
      state.settings.gps = t.checked; save();
      if (t.checked && navigator.geolocation) navigator.geolocation.getCurrentPosition(() => {}, () => toast('Location permission was denied'));
    } else if (t.matches('[data-eopt]')) {
      const k = t.dataset.eopt;
      state.settings.export[k] = t.type === 'checkbox' ? t.checked : t.value;
      save();
      if (k === 'format' || k === 'sort') exportSheet(exportTripId); else updateExportPreview();
    } else if (t.id === 'restore' && t.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!Array.isArray(data.trips)) throw new Error('bad');
          const existing = new Set(state.trips.map(x => x.id));
          const incoming = data.trips.filter(x => x && x.id && Array.isArray(x.sightings));
          const added = incoming.filter(x => !existing.has(x.id));
          if (!confirm(`Restore ${added.length} trip(s) from this backup? Trips you already have are kept.`)) return;
          state.trips.push(...added);
          state.trips.sort((a, b) => (b.start || '').localeCompare(a.start || ''));
          if (!state.current && data.current && state.trips.some(x => x.id === data.current)) state.current = data.current;
          save(); render(); toast(`Restored ${added.length} trip(s)`);
        } catch (err) { toast('That file is not a Bird Log backup'); }
      };
      reader.readAsText(t.files[0]);
      t.value = '';
    }
  });

  document.addEventListener('submit', e => {
    if (e.target.id !== 'trip-form') return;
    e.preventDefault();
    const f = new FormData(e.target);
    const data = Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v).trim()]));
    const id = e.target.dataset.id;
    if (data.end && data.start && data.end < data.start) { toast('End date is before the start date'); return; }
    if (id) {
      Object.assign(state.trips.find(x => x.id === id), data); save();
      toast('Trip saved');
    } else {
      newTrip(data);
      tab = 'log';
      toast('Trip started. Happy birding!');
    }
    closeSheet();
  });

  function switchTab(t) {
    tab = t;
    window.scrollTo(0, 0);
    render();
  }

  // ---------- Boot ----------
  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
