# Notes for AI assistants working on this repository

This is the Domia Stays website: a static site, English and Spanish, served by GitHub Pages from `main`.
It is **domiastays.es**. **domiastays.com** is a separate Lodgify booking site that is not in this repository; link to it, never copy it.
Read `README.md` first. The owner is not a developer and manages homes with `admin/index.html`.

## How it is built

- Every `.html` file in the repository root is **generated**. Never edit one by hand; the next save overwrites it.
- Source of truth: `content/properties.json` (homes), `content/site.json` (contact details, web address, check-in times), `content/reviews.json`.
- Generator: `build/lib.js` (helpers, icons, amenity list), `build/copy.js` (all non-listing text, EN and ES), `build/templates.js` (HTML of every page), `build/generate.js` (assembles the files). Plain scripts that attach to `globalThis`, so the same code runs in Node and in the property manager. Keep them free of Node-only or browser-only APIs and of ES module syntax (the manager loads them with `<script>` from `file://`).
- Rebuild: `node build/cli.mjs`. Commit the generated pages together with the change that caused them.
- Design: `css/site.css`, behaviour: `js/site.js`. Bump `ASSET_VERSION` in `build/templates.js` when either changes.
- URLs are stable: `name.html` and `name.es.html`, homes are `properties_<id>.html`. Keep every link relative. The site must work at a domain root, under `/domia-website/`, and opened from disk.

## Before you finish a change

Run both tests (`build/tests/README.md`). They cover every link, both languages, phone and desktop, the forms, the calculator and the property manager.

## Rules that come from the business

- Brand: navy `#0F2740`, gold `#B08547`, Cormorant Garamond for headings, DM Sans for text. Use only the official logo files in `assets/brand`; never redraw or recolour the logo. The tagline is exactly "Feel at home, anywhere".
- The company that runs this site is **Domia Stays S.L.** (the name on its tax card), used in legal lines; in running text it is "Domia Stays". Domia Stays Group is the umbrella group the owner is setting up above it (the logo reads "Domia Stays Group"). Never add a place name to the brand.
- Commission is 20% of **net** revenue, after platform fees. Do not restate it as a share of gross, and do not change fees, contract terms or compliance wording without the owner's say-so.
- Real photos only. No AI-generated property images. No invented reviews: `content/reviews.json` holds real guest reviews with their source, and the reviews sections stay hidden while it is empty.
- Each home should show its tourist licence number (`licence` field).
- `legal.html` and `privacy.html` take the company details from `content/site.json` (`registeredName`, `taxId`, `registeredAddress`, `registryDetails`). Use the registered name exactly as on the tax card. Their wording is compliance text: change it only when the owner asks.
- Team preview: while the redesign is unpublished, `main` holds a copy of it in `preview/` (served at domiastays.github.io/domia-website/preview/), every page marked noindex. It is a snapshot: refresh it by copying the built site (html, css, js, assets without originals) into `preview/` on `main` and adding the noindex tag; touch nothing else on `main`. Delete `preview/` when the redesign goes live.
- The site sets no cookies and loads nothing from other sites (fonts and video are local). Keep it that way, or the privacy policy and a consent banner must change first.
