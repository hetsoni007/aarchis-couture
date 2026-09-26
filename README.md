# Aarchi's by Archana Soni — couture flagship (e-commerce build)

A made-to-measure e-commerce flagship for **Aarchi's by Archana Soni**, the Ahmedabad bridal and
festive couture studio. It is a separate project from the live enquiry site
(`~/Projects/Aarchis`, www.aarchisbyarchanasoni.com). Its content comes from a crawl of that live
site. Its design, motion and commerce flow are new.

- **Design:** a photography-first luxury storefront (v2). See `BRAND.md`. The v1 *Taana–Baana*
  concept build is kept in git at commit `c246af5`.
- **System:** breakpoints, components, commerce model, rendering and Lighthouse results. See `DESIGN.md`.
- **Data provenance and what needs a human:** `research/DATA-AUDIT.md`.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # typecheck → client build → SSR build → prerender 71 routes into dist/
npm run preview      # http://localhost:4173, serves dist/ with the same rules as the CDN (see Deploy)
```

Node 20.19+ is required (Vite 8). `?tier=high|mid|low|none` on any URL forces a 3D performance tier for testing.

## Stack

Vite 8 · React 19 · TypeScript · React Router 7 · Zustand (persisted bag, wishlist, measurements,
reservations, recently viewed) · react-three-fiber 9 + drei 10 (three r186) for the opt-in 3D study,
with GSAP for its camera moves · Tailwind 4, used for a few visibility utilities. All visuals are
custom CSS on design tokens, with native scrolling. Fonts are self-hosted: Cormorant Garamond and Inter, both SIL OFL.

## How it's built

```
research/raw/            the 57-page crawl of the live site (source of truth for all copy)
scripts/curation.py      per-product design decisions made by looking at every photo
scripts/extract_content.py   crawl → src/data/products.json, content.json, catalog.client.json, DATA-AUDIT.md
scripts/build_images.py  crops + AVIF/WebP at 360–1080w → public/img, src/data/images.json
scripts/sitemap.mjs      → public/sitemap.xml (65 indexable URLs)
scripts/brand_assets.py  favicon, app icons and the share image, from the fonts and campaign photos
scripts/prerender.mjs    renders every public route to static HTML after the build
scripts/serve.mjs        zero-dependency production server (clean URLs, SPA shell, 404, brotli)
src/entry-server.tsx     React 19 `prerender` + React Router static handler
src/lib/                 catalogue, filters, search, nav/mega-menu data, device, fabric painter, SEO, WhatsApp
src/store/               Zustand stores (they rehydrate after React hydration)
src/components/layout/   header + mega-menus, mobile nav, search, bag drawer, footer, WhatsApp stylist
src/components/product/  card, grid, rails, quick view, gallery + lightbox + 3D study, size guide, measurements
src/components/three/    GarmentViewer (the product 3D study)
src/components/…         brand (logo, page blocks), ui (buttons, fields, drawer, modal, accordion…)
src/pages/               15 route components
```

`npm run data` rebuilds the data files and images. It needs `python3` with `beautifulsoup4` and
`Pillow`, plus the live site's repo at `~/Projects/Aarchis` for the original images and Instagram provenance.

## Deploy

`dist/` is a static site. The host must:

1. serve `/path` from `dist/path/index.html` (clean URLs, since every public route is prerendered)
2. serve `/reserved/*` from `dist/200.html` with status 200 (client-only route)
   (query strings such as `/shop?occ=Wedding` or `/search?q=red` use the page's prerendered HTML — the query applies after hydration)
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
- [ ] Higher-resolution campaign originals. The editorial frames exist only at 563px wide, which is
      soft in the full-bleed hero on large retina screens. Re-export them at ≥1600px and rerun `npm run data`.
