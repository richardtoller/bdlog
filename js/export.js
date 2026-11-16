/* Builds blog-ready exports (HTML, Markdown, plain text, CSV) from a trip. */
const Exporter = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mdEsc = s => String(s ?? '').replace(/([\\*_`\[\]])/g, '\\$1');

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function parseDate(d) {
    if (!d) return null;
    const [y, m, day] = d.split('-').map(Number);
    return y && m && day ? { y, m, d: day } : null;
  }

  function dateRange(start, end) {
    const a = parseDate(start), b = parseDate(end);
    if (!a && !b) return '';
    if (!a || !b || (a.y === b.y && a.m === b.m && a.d === b.d)) {
      const x = a || b; return `${x.d} ${MONTHS[x.m - 1]} ${x.y}`;
    }
    if (a.y === b.y && a.m === b.m) return `${a.d}–${b.d} ${MONTHS[a.m - 1]} ${a.y}`;
    if (a.y === b.y) return `${a.d} ${MONTHS[a.m - 1]} – ${b.d} ${MONTHS[b.m - 1]} ${a.y}`;
    return `${a.d} ${MONTHS[a.m - 1]} ${a.y} – ${b.d} ${MONTHS[b.m - 1]} ${b.y}`;
  }

  const birdIndex = new Map(BIRDS.map(b => [b.name, b]));

  function sortSightings(list, sort) {
    const arr = [...list];
    if (sort === 'alpha') arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'seen') arr.sort((a, b) => (a.first || '').localeCompare(b.first || ''));
    else arr.sort((a, b) => orderOf(a) - orderOf(b) || a.name.localeCompare(b.name));
    return arr;
  }
  function orderOf(s) { const b = birdIndex.get(s.name); return b ? b.order : 100000; }
  function groupOf(s) { const b = birdIndex.get(s.name); return b ? b.group : 'Other species'; }
  function sciOf(s) { return s.sci || birdIndex.get(s.name)?.sci || ''; }

  function sections(trip, o) {
    const sorted = sortSightings(trip.sightings, o.sort);
    if (!o.groups || o.sort !== 'taxonomic') return [{ title: null, items: sorted }];
    // Groups appear in order of their first species, so each group gets one heading.
    const map = new Map();
    for (const s of sorted) {
      const g = groupOf(s);
      if (!map.has(g)) map.set(g, { title: g, items: [] });
      map.get(g).items.push(s);
    }
    return [...map.values()];
  }

  function extras(s, o) {
    const bits = [];
    if (o.counts && s.count > 1) bits.push(`× ${s.count}`);
    if (s.heard) bits.push('(heard only)');
    return bits.join(' ');
  }

  function wikiUrl(s) {
    const sci = sciOf(s);
    return sci ? `https://en.wikipedia.org/wiki/${encodeURIComponent(sci.replace(/ /g, '_'))}` : '';
  }

  function summary(trip) {
    const n = trip.sightings.length;
    return `${n} species`;
  }

  function html(trip, o) {
    const out = [];
    if (o.header) {
      out.push(`<h2>${esc(trip.name)}</h2>`);
      const meta = [];
      if (trip.location) meta.push(`<strong>Location:</strong> ${esc(trip.location)}`);
      const dr = dateRange(trip.start, trip.end);
      if (dr) meta.push(`<strong>Dates:</strong> ${esc(dr)}`);
      meta.push(`<strong>Species recorded:</strong> ${trip.sightings.length}`);
      out.push(`<p>${meta.join('<br>\n')}</p>`);
      if (trip.notes) out.push(trip.notes.split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('\n'));
    }
    const stars = trip.sightings.filter(s => s.star);
    if (o.highlights && stars.length) {
      out.push(`<h3>Highlights</h3>`);
      out.push(`<ul>\n${sortSightings(stars, o.sort).map(s => `  <li>${esc(s.name)}</li>`).join('\n')}\n</ul>`);
    }
    if (o.header || (o.highlights && stars.length)) out.push(`<h3>Species list</h3>`);
    let n = 1;
    for (const sec of sections(trip, o)) {
      if (sec.title) out.push(`<h4>${esc(sec.title)}</h4>`);
      const items = sec.items.map(s => {
        let name = `<strong>${esc(s.name)}</strong>`;
        if (o.links && wikiUrl(s)) name = `<a href="${esc(wikiUrl(s))}">${name}</a>`;
        let line = name;
        if (o.highlights && s.star) line += ' ★';
        if (o.sci && sciOf(s)) line += ` <em>${esc(sciOf(s))}</em>`;
        const ex = extras(s, o);
        if (ex) line += ` ${esc(ex)}`;
        if (o.notes && s.notes) line += ` – ${esc(s.notes)}`;
        return `  <li>${line}</li>`;
      });
      out.push(`<ol${n > 1 ? ` start="${n}"` : ''}>\n${items.join('\n')}\n</ol>`);
      n += sec.items.length;
    }
    return out.join('\n');
  }

  function markdown(trip, o) {
    const out = [];
    if (o.header) {
      out.push(`## ${mdEsc(trip.name)}`, '');
      if (trip.location) out.push(`**Location:** ${mdEsc(trip.location)}  `);
      const dr = dateRange(trip.start, trip.end);
      if (dr) out.push(`**Dates:** ${dr}  `);
      out.push(`**Species recorded:** ${trip.sightings.length}`, '');
      if (trip.notes) out.push(trip.notes, '');
    }
    const stars = trip.sightings.filter(s => s.star);
    if (o.highlights && stars.length) {
      out.push('### Highlights', '');
      sortSightings(stars, o.sort).forEach(s => out.push(`- ${mdEsc(s.name)}`));
      out.push('');
    }
    if (o.header || (o.highlights && stars.length)) out.push('### Species list', '');
    let n = 1;
    for (const sec of sections(trip, o)) {
      if (sec.title) out.push(`#### ${sec.title}`, '');
      for (const s of sec.items) {
        let name = `**${mdEsc(s.name)}**`;
        if (o.links && wikiUrl(s)) name = `[${name}](${wikiUrl(s)})`;
        let line = `${n}. ${name}`;
        if (o.highlights && s.star) line += ' ★';
        if (o.sci && sciOf(s)) line += ` *${mdEsc(sciOf(s))}*`;
        const ex = extras(s, o);
        if (ex) line += ` ${ex}`;
        if (o.notes && s.notes) line += ` – ${mdEsc(s.notes)}`;
        out.push(line);
        n++;
      }
      out.push('');
    }
    return out.join('\n').trim() + '\n';
  }

  function text(trip, o) {
    const out = [];
    if (o.header) {
      out.push(trip.name);
      if (trip.location) out.push(`Location: ${trip.location}`);
      const dr = dateRange(trip.start, trip.end);
      if (dr) out.push(`Dates: ${dr}`);
      out.push(`Species recorded: ${trip.sightings.length}`, '');
      if (trip.notes) out.push(trip.notes, '');
    }
    const stars = trip.sightings.filter(s => s.star);
    if (o.highlights && stars.length) {
      out.push('Highlights: ' + sortSightings(stars, o.sort).map(s => s.name).join(', '), '');
    }
    let n = 1;
    for (const sec of sections(trip, o)) {
      if (sec.title) out.push(sec.title.toUpperCase());
      for (const s of sec.items) {
        let line = `${n}. ${s.name}`;
        if (o.highlights && s.star) line += ' *';
        if (o.sci && sciOf(s)) line += ` (${sciOf(s)})`;
        const ex = extras(s, o);
        if (ex) line += ` ${ex}`;
        if (o.notes && s.notes) line += ` – ${s.notes}`;
        out.push(line);
        n++;
      }
      if (sec.title) out.push('');
    }
    return out.join('\n').trim() + '\n';
  }

  function csv(trip) {
    const q = v => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [['Species', 'Scientific name', 'Group', 'Count', 'Heard only', 'Highlight', 'Notes', 'First seen', 'Latitude', 'Longitude']];
    sortSightings(trip.sightings, 'taxonomic').forEach(s => rows.push([
      s.name, sciOf(s), groupOf(s), s.count, s.heard ? 'yes' : '', s.star ? 'yes' : '', s.notes || '',
      s.first || '', s.lat ?? '', s.lon ?? ''
    ]));
    return rows.map(r => r.map(q).join(',')).join('\r\n') + '\r\n';
  }

  function build(trip, o) {
    switch (o.format) {
      case 'markdown': return markdown(trip, o);
      case 'text': return text(trip, o);
      case 'csv': return csv(trip);
      default: return html(trip, o);
    }
  }

  const EXT = { html: 'html', markdown: 'md', text: 'txt', csv: 'csv' };
  const MIME = { html: 'text/html', markdown: 'text/markdown', text: 'text/plain', csv: 'text/csv' };

  return { build, dateRange, sortSightings, esc, EXT, MIME, summary, groupOf };
})();
