# Bird Log 🐦

A phone app for logging UK bird species seen on a trip, then exporting the list to your blog.

It's an installable web app (PWA). It runs in your phone's browser, can be added to the home screen like a normal app and works offline in the field. It needs no account and no app store, and your data stays on your phone.

## Features

- **Trips**: create a trip with a name, location, dates and notes. Switch between trips at any time. The Trips tab also shows your all-time and this-year species totals.
- **Fast logging**: start typing and tap a result. Search matches:
  - parts of words: `bl ta go` finds Black-tailed Godwit
  - initials: `gsw` finds Great Spotted Woodpecker, `ltt` finds Long-tailed Tit
  - alternative names: `hedge sparrow` finds Dunnock, `bonxie` finds Great Skua
  - scientific names

  Press Enter to add the top result. Logging the same species again adds 1 to its count. Each add can be undone.
- **Per-sighting details**: count, *heard only*, ★ trip highlight, notes, time first logged and optional GPS position.
- **Custom species**: log anything not on the built-in list, such as a rarity or escape.
- **Species browser**: 277 UK species in field-guide (taxonomic) order. Filter by group and hide scarce species. Each species card has a short ID description, status (resident, summer visitor, etc.), alternative names and a Wikipedia link.
- **Bird pictures**: every species has a picture. 274 have a painting on their species card, in search results and lists, and beside each bird in the ID guides. They are public-domain paintings, mostly by Archibald Thorburn from *British Birds* (1915–18), with a few by J. G. Keulemans, M. A. Koekkoek and others, all from Wikimedia Commons. Pictures are saved for offline use as you view them, or all at once (about 7 MB) from **Trips → Download all pictures**. Commons has no painting of Yellow-legged Gull, Caspian Gull or Cory's Shearwater, so those three use Creative Commons photos, credited on their species cards.
- **ID guides**: a fieldcraft primer plus 20 side-by-side "tricky pairs" guides, such as Chiffchaff vs Willow Warbler, Marsh vs Willow Tit, Common vs Arctic Tern and the large gulls. Species cards link to the guides that cover them.
- **Blog export**:
  - formats: **HTML** (WordPress, Blogger, Squarespace, Wix), **Markdown** (Ghost, Jekyll, Hugo, Substack), plain text or **CSV**
  - order: taxonomic, order seen or A–Z
  - optional extras: group headings, scientific names, counts, notes, a highlights list, a trip header and Wikipedia links
  - output: copy to clipboard (HTML is copied as formatted text, so it pastes straight into a visual editor), share via your phone's share sheet, or download a file
- **Backup & restore**: back up everything to a JSON file, for safety or to move to a new phone.

## Getting it onto your phone

The app is static files, so any static web host will do. The easiest is **GitHub Pages**, set up by the workflow in `.github/workflows/pages.yml`:

1. Merge this branch into `main`.
2. In the repository on GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The workflow deploys on every push to `main`, or you can run it by hand from the **Actions** tab. Your app will be at `https://<your-username>.github.io/bdlog/`.
4. Open that address on your phone:
   - **iPhone (Safari)**: tap Share, then **Add to Home Screen**.
   - **Android (Chrome)**: tap ⋮, then **Install app** (or **Add to Home screen**).

Open the app once while you have signal. After that it works offline.

> **Your data lives on the phone** (in the browser's local storage for the app). Use **Trips → Download backup** now and then. On iPhone, data for a home-screen app is kept separately from Safari, so add the app to the home screen before you start logging.

### Running locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Project layout

| File | Purpose |
| --- | --- |
| `index.html` | App shell |
| `styles.css` | Styles (light and dark mode) |
| `js/birds.js` | UK species list: name, scientific name, group, status, aliases and ID notes, one line per species |
| `js/images.js`, `img/birds/` | Bird pictures and their sources (generated, see below) |
| `js/guides.js` | Fieldcraft tips and the "tricky pairs" ID guides |
| `js/export.js` | Builds the HTML, Markdown, text and CSV exports |
| `js/app.js` | UI, search, storage, trips and sightings |
| `sw.js` | Service worker for offline use |
| `manifest.webmanifest`, `icons/` | Installable-app metadata and icons |

To add or change a species, edit its line in `js/birds.js`. The format is documented at the top of the file. If you change any files, bump `CACHE` in `sw.js` so installed copies pick up the update.

### Bird pictures

`tools/build_images.py` builds `img/birds/*.webp` and `js/images.js` from `tools/bird-image-crops.json`. That file lists each species' source painting on Wikimedia Commons and a crop box in percent: `[left, top, right, bottom]`. To fix a crop or swap a painting, edit that file and run:

```sh
pip install pillow
python3 tools/build_images.py   # downloads the source paintings into tools/.cache on the first run
```

Then bump `CACHE` in `sw.js`. If you replace an existing picture, also bump `IMG_CACHE`.

---

# Scores 🎼

A second app in this repository, in the `scores/` folder: a phone app for viewing and organising sheet music and building concert programmes. Like Bird Log it's an installable web app (PWA): no account, no app store, works offline, and your scores stay on your phone.

Once GitHub Pages is set up (see above) it's at `https://<your-username>.github.io/bdlog/scores/`. Open that in Chrome on your phone and choose ⋮ › **Install app**.

## Features

- **Import your folder**: on the Songs tab (or Library), tap **Choose the _BFS folder** and pick *Internal shared storage › songs › _BFS*. PDFs and PNG/JPEG/WebP pictures are copied into the app's storage. Tap **Update from the _BFS folder** after adding or changing scores: new files are added, changed ones updated, and your titles, categories and programmes are kept. If your phone only offers a file picker, open the folder and use ⋮ › **Select all**.
- **Categories**: songs start out as *Christmas* or *Non-Christmas*, guessed from the file name (Silent Night, Jingle Bells, carols, etc.). Fix any song with ⋯, or tap **Select** to change many at once. Filter the list with the category chips, or search by title. Add, rename or delete categories in Library.
- **Viewer**: tap a title to open the score full screen. Pinch or double-tap to zoom (up to 500%, re-drawn sharp at every zoom level) and drag to pan. Tap the right or left edge to go forward or back a screen, or tap the middle to show the controls. ↕/↔ switches between fit-to-width and whole-page view. Works in portrait and landscape, keeps the screen awake, and works with Bluetooth page-turner pedals (arrow and Page Up/Down keys).
- **Concert programmes**: create a programme (name, date, venue, notes), tap **+ Songs** and tap songs in performance order. **Edit** lets you drag to reorder, remove songs and add notes such as “Interval”. **▶ Start** steps through the whole concert: when you turn past the end of one score the next one opens, with prev/next buttons too. Share or copy the song list, or duplicate a programme for next year.
- **Backup**: Library › Download backup saves programmes, categories and titles (not the score files). Restore on a new phone, then import the folder again.

## Files

| File | Purpose |
| --- | --- |
| `scores/index.html`, `scores/styles.css` | App shell and styles (light and dark mode) |
| `scores/js/app.js` | Songs, categories, programmes, importing, backup |
| `scores/js/viewer.js` | Full-screen viewer: zoom, page turning, programme navigation |
| `scores/js/db.js` | IndexedDB storage for the score files and app data |
| `scores/vendor/pdfjs/` | [PDF.js](https://mozilla.github.io/pdf.js/) 4.10.38 (Apache 2.0), stored here so it works offline |
| `scores/sw.js` | Service worker for offline use. Bump `CACHE` after changing any file |
