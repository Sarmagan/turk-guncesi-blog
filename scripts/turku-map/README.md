# Türkiye Türkü Haritası

An interactive map of Turkey's 81 provinces displaying regional folk songs (türküler). Built for [Türk Güncesi](https://blog.turkguncesi.com/).

![Website](website_screenshot.png)

> 🇹🇷 [Türkçe oku](README.tr.md)

## Features

### Map & Navigation
- **Hover tooltips** — hover over any province to see its folk songs in a floating tooltip
- **Click to pin** — click a province to display its info persistently in the side panel
- **Zoom & pan** — mouse wheel to zoom (centred on cursor), click and drag to pan
- **Zoom controls** — `+`, `−`, and `Reset` buttons with a live scale badge
- **Keyboard navigation** — arrow keys to move between provinces, `Enter` to select, `Escape` to dismiss; `←` / `→` also navigate between songs when a modal is open
- **Mobile support** — pinch-to-zoom, single-finger pan, and a bottom drawer panel on small screens

### Song Discovery
- **Günün Türküsü** — a "Song of the Day" card floats in the top-left corner of the map; the song is picked deterministically from the database by hashing today's date, so every visitor sees the same song each day and it changes automatically at midnight
- **Random türkü** — button picks a random song from the full database and highlights its province on the map
- **Random from province** — when a province or region panel is open, a 🎲 Rastgele button picks a random song from that panel's list specifically and opens it in the modal with full prev/next context
- **Extra regions** — dedicated buttons for songs from Rumeli, Kerkük, Azerbaycan, Kıbrıs, Musul, and Kırım
- **Diğer category** — songs whose `yoresi_ili` doesn't match a Turkish province are grouped here

### Song Modal
- **Full detail view** — opens on song card click, showing musical properties, pitch range, people (source, compiler, performer), and full lyrics
- **Prev / Next navigation** — arrow buttons on the sides of the modal (desktop) and left/right swipe gestures (mobile) cycle through all songs in the currently active province, region, or search results; a counter shows current position (e.g. `3 / 47`)
- **Copy link** — 🔗 Bağlantı button in the modal footer copies the deep-link URL for the current song to the clipboard; the label briefly changes to `Kopyalandı ✓` as feedback
- **Share card** — generates a styled 1080×1080 image card for social media (Instagram, WhatsApp, etc.)
- **Deep links** — every song gets a stable URL hash (`#song-1234`) that can be shared and restored on page load

### Search & Filtering
- **Search** — search across all türküler by title, source person, compiler, or performer using scope chips
- **Filters** — dropdown filters for makam/dizi, konu/tür, and usul, combinable with text search

### Display Options
- **Light / dark theme** — toggle in the header, persisted in `localStorage`
- **Province labels** — toggle city name labels on the map
- **Choropleth mode** — colour provinces by song density (5 tiers)
- **Data-driven highlights** — provinces with song data are visually distinct from empty ones

### Other
- **Türkü Öner** — a ✉ link in the bottom-right corner of the map opens a pre-filled Gmail compose window to `turkguncesi1923@gmail.com` so visitors can suggest missing türküler
- **Favicon** — the Türk Güncesi logo appears in the browser tab, embedded inline as a base64 data URI (no extra file required)
- **Onboarding tour** — first-time visitors see a step-by-step walkthrough of the main features

## File Structure

```
index.html      # Main page — SVG map embedded inline, favicon embedded as base64
styles.css      # All styling and theme variables (dark + light mode)
app.js          # Interactivity: hover, tooltip, zoom, pan, search, modal, deep links
songs.jsonl     # Song database — one JSON object per line (JSONL format)
```

## Adding Songs

Append new lines to `songs.jsonl`. Each line is a self-contained JSON object:

```jsonl
{"song_title": "Karamana Giderim", "yoresi_ili": "KONYA", "repertuar_no": "1234", "ilcesi_koyu": "-", "kaynak_kisi": "...", "derleyen": "...", "notaya_alan": "...", "icra_eden": "-", "makamsal_dizi": "...", "konusu_turu": "Aşk Sevda", "karar_sesi": "Re", "bitis_sesi": "Re", "usul": "-", "en_pes_ses": "Re", "en_tiz_ses": "La", "ses_genisligi": "5 Ses", "lyrics": "Verse 1\nVerse 2", "source_url": "https://..."}
```

Songs are grouped by `yoresi_ili`. The field is matched case-insensitively and supports many ASCII/alternate spellings (e.g. `SANLIURFA` → Şanlıurfa, `AFYON` → Afyonkarahisar). Any entry whose `yoresi_ili` doesn't match one of Turkey's 81 provinces is automatically placed in the appropriate extra region (Rumeli, Kerkük, Azerbaycan, Kıbrıs, Musul, Kırım) or the catch-all **Diğer** category.

## Running Locally

Open `index.html` via a local server so `songs.jsonl` loads correctly:

```bash
npx serve .
# or
python3 -m http.server
```

> **Note:** There is no mock/fallback data. The map requires `songs.jsonl` to be served alongside `index.html`. Opening via `file://` won't work — use a local server.

## Data Source

All song data is sourced from **[Repertükül](https://www.repertukul.com/)** — a comprehensive online archive of Turkish folk music. Many thanks to Repertükül for making this data available.

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript (ES6+)
- No external libraries or frameworks
- SVG map © [Simplemaps.com](https://simplemaps.com) (free for commercial use)