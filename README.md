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
| `js/guides.js` | Fieldcraft tips and the "tricky pairs" ID guides |
| `js/export.js` | Builds the HTML, Markdown, text and CSV exports |
| `js/app.js` | UI, search, storage, trips and sightings |
| `sw.js` | Service worker for offline use |
| `manifest.webmanifest`, `icons/` | Installable-app metadata and icons |

To add or change a species, edit its line in `js/birds.js`. The format is documented at the top of the file. If you change any files, bump `CACHE` in `sw.js` so installed copies pick up the update.
