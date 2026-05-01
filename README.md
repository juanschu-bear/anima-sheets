# Anima Sheets, CFO Dashboard

A trilingual (EN / DE / ES) finance management dashboard built with **React + Vite + Tailwind CSS**.
Features a live dashboard with KPIs, trend & donut charts, a multi-sheet spreadsheet editor, a CSV import wizard, and a natural-language query interface ("Ask") powered by `window.claude.complete()`.

## Quick start

```bash
npm install
npm run dev          # dev server on http://localhost:5173
npm run build        # production build to ./dist
npm run preview      # preview the production build
```

## Optional live CFO sync

To render live receipt rows coming from the WhatsAnima CFO ingest pipeline, set:

```bash
VITE_CFO_SHEET_ID=your_google_sheet_id
```

The app reads the `Transactions` tab via CSV export URL. If not configured (or inaccessible), the UI falls back to demo-only mode.

## Project structure

```
vite-export/
├── index.html                 # Vite entry
├── package.json               # Deps: react, react-dom, recharts, vite, tailwind
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx               # ReactDOM root + warning filter
    ├── App.jsx                # Header, dashboard, footer, routing
    ├── Auth.jsx               # Sign-in gate + profile menu (localStorage session)
    ├── Spreadsheet.jsx        # Multi-sheet editor, keyboard nav, tabs
    ├── Import.jsx             # CSV drop → mapping → preview → commit
    ├── Nlq.jsx                # "Ask" modal (Cmd/Ctrl+K) — NL queries
    ├── data.js                # Seed ledger (3 sheets), categories, MONTHS
    ├── i18n.js                # Dictionary + setLang/useLang/tRow helpers
    └── index.css              # Tailwind + CSS variables + keyframes
```

## Natural-language queries (AI)

The "Ask" button and `⌘K` / `Ctrl+K` shortcut open an NLQ modal that calls `window.claude.complete(...)`. This helper is **not provided by Vite**; the app is built to degrade gracefully — when the helper is absent, the input is disabled and a hint is shown ("AI query is unavailable in this build").

To enable it:

```html
<!-- In index.html, before the <script type="module" src="..."> tag -->
<script>
  window.claude = {
    complete: async (opts) => {
      // Your own fetch() to an Anthropic backend / proxy here.
      // Must return the raw text of the LLM's response.
    },
  };
</script>
```

The system prompt used by the parser lives in `src/Nlq.jsx` (`SYSTEM_PROMPT`).

## Internationalization

Three languages are baked in: English, German, Spanish. The switcher in the header (globe icon) swaps them live. Dictionary keys live in `src/i18n.js` — add entries there to extend.

Row text (descriptions, notes, sheet names) is translated via `descKey` / `noteKey` / `nameKey` fields on each ledger row, resolved by `tRow(row)`.

## Deployment

Any static host works (Netlify / Vercel / Cloudflare Pages / GitHub Pages / S3 + CloudFront):

```bash
npm run build
# → upload ./dist as a static site
```

For GitHub Pages, set `base: "/your-repo-name/"` in `vite.config.js` before building.

## Tech stack

- **React 18** (no state library — local `useState`/`useMemo`)
- **Vite 5** for build & dev server
- **Tailwind CSS 3** (+ CSS variables for theming)
- **Recharts 2** for bar + donut charts
- **Inter** and **JetBrains Mono** from Google Fonts

## Notes

- Dark mode is toggled via the `html.dark` class and a corresponding CSS variable set.
- Spreadsheet state is persisted in `localStorage` under `anima_sheets_state_v3`.
- Auth session is stored in `localStorage` under `anima_sheets_session_v1`; any email + name signs you in (demo).
