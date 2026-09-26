# Aarchi's by Archana Soni — couture flagship (e-commerce build)

A made-to-measure e-commerce flagship for **Aarchi's by Archana Soni**, the Ahmedabad bridal and
festive couture studio. It is a separate project from the live enquiry site
(`~/Projects/Aarchis`, www.aarchisbyarchanasoni.com). Its content comes from a crawl of that live
site. Its design, motion and commerce flow are new.

- **Concept:** *Taana–Baana* (warp and weft). See `BRAND.md`.
- **System:** breakpoints, type scale, components, motion, 3D tiers, commerce model. See `DESIGN.md`.
- **Data provenance and what needs a human:** `research/DATA-AUDIT.md`.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # typecheck → client build → SSR build → prerender 69 routes into dist/
npm run preview      # http://localhost:4173, serves dist/ with the same rules as the CDN (see Deploy)
```

Node 20.19+ is required (Vite 8). `?tier=high|mid|low|none` on any URL forces a 3D performance tier for testing.

## Stack

Vite 8 · React 19 · TypeScript · react-three-fiber 9 + drei 10 (three r186) · GSAP + ScrollTrigger
(the single motion engine, loaded on demand) · Lenis (desktop only) · Zustand (persisted bag,
wishlist, measurements, reservations) · React Router 7 · Tailwind 4, used for layout utilities only.
All visuals are custom CSS on design tokens. Fonts are self-hosted: Bodoni Moda and Jost, both SIL OFL.

## How it's built

```
research/raw/            the 57-page crawl of the live site (source of truth for all copy)
scripts/curation.py      per-product design decisions made by looking at every photo
scripts/extract_content.py   crawl → src/data/products.json, content.json, catalog.client.json, DATA-AUDIT.md
scripts/build_images.py  crops + AVIF/WebP at 360–1080w → public/img, src/data/images.json
scripts/sitemap.mjs      → public/sitemap.xml (64 indexable URLs)
scripts/prerender.mjs    renders every public route to static HTML after the build
scripts/serve.mjs        zero-dependency production server (clean URLs, SPA shell, 404, brotli)
src/entry-server.tsx     React 19 `prerender` + React Router static handler
src/lib/                 catalogue, device tiers, fabric painter, filters, SEO, WhatsApp, scroll, motion
src/store/               Zustand stores (they rehydrate after React hydration)
src/components/three/    LoomHero (home), GarmentViewer (product 3D study), Ambient (7 category looms)
src/components/…         brand (wordmark, motifs), ui (buttons, fields, sheets…), layout, product
src/pages/               17 route components
```

`npm run data` rebuilds the data files and images. It needs `python3` with `beautifulsoup4` and
`Pillow`, plus the live site's repo at `~/Projects/Aarchis` for the original images and Instagram provenance.

## Deploy

`dist/` is a static site. The host must:

1. serve `/path` from `dist/path/index.html` (clean URLs, since every public route is prerendered)
2. serve `/reserved/*` from `dist/200.html` with status 200 (client-only route)
3. serve everything else from `dist/404.html` with status **404**
4. send brotli or gzip for text, and cache `/assets/*`, `/img/*`, `/fonts/*` as immutable

`scripts/serve.mjs` implements exactly these rules. On the live site's AWS stack that means
extending the existing `aarchis-url-rewrite` CloudFront function. **Nothing here has been deployed.**

## Before this goes live

- [ ] **40 of 48 prices are indicative placeholders.** They carry an *Indicative* marker and are kept
      out of structured data. Replace them in `scripts/curation.py`. The 8 real prices come from the live site.
- [ ] Review the product flags in `research/DATA-AUDIT.md`. Two products have no garment photo,
      one image is a mirrored duplicate, several names contradict their photos, and one piece may not be Aarchi's (Rose Aria).
- [ ] Testimonials: none are published on the live site, so the section stays hidden until real quotes go in `content.json`.
- [ ] Newsletter: no email service exists yet, so *Atelier notes* opts people in on WhatsApp. Set `NEWSLETTER_ENDPOINT` in `src/lib/config.ts` to switch to an ESP.
- [ ] Deposits: reservations take no payment by design (DESIGN.md §7). Implement `src/lib/payments.ts` once a deposit policy exists.
- [ ] Contact: add an email, studio address and hours when the studio wants them public.
- [ ] Photo usage rights for the campaign shoots (see `SOURCES.md` in the live repo).
