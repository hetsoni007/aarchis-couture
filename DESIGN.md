# Design system & build notes

Companion to BRAND.md. This is the *how*: grid, breakpoints, type scale,
components, motion, 3D, performance tiers and the commerce model.

---

## 1. Breakpoints

Every page is designed and checked at these six widths, not just "mobile vs desktop":

| Name | Width | What changes |
|---|---|---|
| `phone-s` | **375** (iPhone SE / mini) | 1-col grid, 16px gutters, bottom-sheet filters, sticky bottom "Add to your bag", 3D hero replaced by the ambient cloth (no scroll rig) |
| `phone` | **414–430** | same layout, larger type steps (fluid) |
| `tablet` | **768** (`md`) | 2-col product grid, 8-col warp, filters still a sheet, PDP gallery + info stacked with a 2-up thumbnail rail |
| `laptop-s` | **1024** (`lg`) | desktop nav + mega-menu, filter sidebar, PDP 2-column, 3-col grid, custom cursor on |
| `desktop` | **1280–1440** (`xl`, `2xl`) | 4-col grid (shop), full scroll-rigged hero, horizontal pinned story reel |
| `wide` | **1920+** (`3xl`) | content caps at 1600px, gutters grow; hero and ambient scenes stay full-bleed so the brand breathes instead of the grid stretching |

Tailwind v4 theme: `xs 26.875rem (430)`, `md 48rem`, `lg 64rem`, `xl 80rem`, `2xl 90rem`, `3xl 120rem`.

## 2. Layout & spacing

- **Container:** `max-width: 1600px` (`--wrap`), side gutter `clamp(16px, 1rem + 2.5vw, 56px)`, plus `env(safe-area-inset-*)`.
- **Warp grid:** 4 cols (<768), 8 cols (768–1023), 12 cols (≥1024). Column gap `clamp(12px, 0.5rem + 1.2vw, 28px)`.
- **Space scale (4px base):** `--s-1 4` · `--s-2 8` · `--s-3 12` · `--s-4 16` · `--s-5 24` · `--s-6 32` · `--s-7 48` · `--s-8 64` · `--s-9 96` · `--s-10 128`.
- **Section rhythm:** `padding-block: clamp(64px, 2rem + 8vw, 176px)`.
- **Measure:** body copy caps at 64ch; leads at 48ch.
- **Radius:** photographs 0 (or the mehrab arch); controls 999px (pills) or 2px (inputs). No soft rounded cards anywhere.
- **Z-layers:** content 0 · sticky bars 30 · nav 40 · drawers/sheets 60 · toasts 70 · route curtain 80 · cursor 90.

## 3. Type scale (fluid)

| Token | clamp() | Use |
|---|---|---|
| `--fs-display` | `clamp(3.1rem, 1rem + 8.4vw, 10.5rem)` | Home hero only |
| `--fs-h1` | `clamp(2.35rem, 1.2rem + 4.6vw, 5.6rem)` | Page titles, PDP name |
| `--fs-h2` | `clamp(1.85rem, 1.15rem + 2.8vw, 3.6rem)` | Section titles |
| `--fs-h3` | `clamp(1.3rem, 1.05rem + 1vw, 1.95rem)` | Card titles, step titles |
| `--fs-lead` | `clamp(1.06rem, 0.98rem + 0.4vw, 1.35rem)` | Leads |
| `--fs-body` | `clamp(0.97rem, 0.94rem + 0.16vw, 1.07rem)` | Body |
| `--fs-small` | `0.875rem` | Meta, captions |
| `--fs-eyebrow` | `0.72rem` / +0.24em / uppercase | Eyebrows, labels |

Line-heights: display 0.92, headings 1.02–1.1, body 1.6. Headings use `text-wrap: balance`, and paragraphs use `text-wrap: pretty`.

## 4. Components (every one has a deliberate pass)

| Component | Notes |
|---|---|
| **Wordmark / Monogram** | SVG. Monogram is also the favicon, app icon and loader core. |
| **Custom cursor** | Desktop only (`(hover:hover) and (pointer:fine)` and no reduced motion). It's a zari needle-eye ring with a trailing thread. Over a `[data-cursor]` element it grows and shows a word (*View*, *Drag*, *Zoom*, *Turn*). Touch devices get none, and every hover affordance has a tap/focus equivalent. |
| **Nav** | *Top state* is transparent on night heroes with khadi text. *Scrolled state* is khadi at 92% with a backdrop blur, a zari hairline and 64px height. It hides on scroll-down and returns on scroll-up. Desktop "Collections" opens a mega-menu (7 categories with counts plus a featured photo that follows your hover). |
| **Mobile menu** | Full-screen kajal panel. Categories are set in large Bodoni with counts, then the house pages, then contact. Opens with a weft wipe, traps focus, and closes on Esc or on route change. |
| **Buttons** | `primary` (sindoor fill, khadi text), `secondary` (kajal outline), `ghost` (text + zari underline that draws in), `icon` (44×44 min). Each has default / hover / active (pressed 1px) / focus-visible (2px zari ring, 3px offset) / disabled (40% + not-allowed + `aria-disabled`) / busy (shuttle). |
| **Inputs** | Underline fields with a floating label, and a zari underline that draws on focus. Error text is in brand voice with `aria-describedby`. Selects are native (for accessibility) with a custom chevron. |
| **Measurement entry** | A body diagram (original line figure, women's and men's). Tapping a field lights its line on the figure and shows "how to measure" in one sentence. There's a cm/in toggle, sane min/max ranges, and saved profiles. The default honest path is **"Measure with Archana on a video call"**, which is the studio's real process. |
| **Product card** | 4:5 frame with a tone skeleton. Hover (or focus) swaps to the next story image if there is one, otherwise a slow zoom plus a warp-line sheen. The heart is always visible (no hover-only actions). Price shows "From ₹…" and an *Indicative* marker where it's a placeholder. |
| **Gallery & zoom** | Desktop has a thumbnail rail and a click-to-zoom lightbox with drag-pan and a ×1–×3 wheel. Mobile uses snap-scroll swipe with dots, and pinch-zoom in the lightbox. |
| **3D garment study** | A procedural dress form + garment built from the product's silhouette. The fabric is woven in a canvas texture from its real colours and named craft. There's a turntable, and drag/keys to rotate. Controls (rotate, zoom, "detail" close-up of the border, reset, pause) are real buttons. It's labelled *interpretive study*. |
| **Swatches** | Radio group. "As photographed" is first, then the studio palette. Each swatch is a tiny woven chip. Arrow-key navigable. |
| **Add-to-bag** | The product image clone flies along a curve to the bag icon, the icon bumps, and the count ticks. A toast reads "Folded into your bag." Under reduced motion there's no flight, just the toast. |
| **Mini-bag** | A right drawer on desktop, a bottom sheet on mobile. It shows items, options and the indicative subtotal, with "View bag" and "Reserve". |
| **Filters** | Desktop: a sticky sidebar with collapsible groups and live counts. Mobile: a bottom sheet with an "Show N pieces" button. Filters sync to the URL. Active filters show as removable chips. |
| **Checkout progress** | Five knots on one thread. Completed knots are tied (filled). It's sticky on mobile, together with the order summary. |
| **Empty states** | Bag (an empty arch with one hanging thread), wishlist (an unthreaded needle), no results (weft that doesn't meet), 404 (the monogram unravelling). Each has its own line illustration and voice. |
| **Toasts** | Bottom-centre on mobile, bottom-left on desktop. `role="status"`, 4s, with Undo where it matters. |
| **Loading** | Route chunks show the shuttle loader. Images use a tone skeleton with a weave shimmer. 3D canvases fade in over a poster frame. |
| **Footer** | Kajal. A real sitemap, the WhatsApp line, four socials, and *Atelier notes* signup (see §7). |
| **FAQ accordion** | Uses `<details>`/`<summary>` semantics. The zari plus rotates into a knot, and height is animated with `interpolate-size`. |
| **Instagram proof** | Six tiles from the live site's own grid, staggered like warp threads. They link to the profile, and the handle shows on hover/focus (always visible on touch). |
| **Testimonials** | Built but data-gated. It renders only when `content.json → testimonials.items` has real, attributable quotes. It is empty today. |

## 5. Motion

- **Engine:** GSAP + ScrollTrigger is the primary motion engine. It drives the pinned hero drape, the horizontal story reel, the reservation unboxing and the 3D camera moves. Lenis provides inertia scroll on desktop only, and is off for touch and reduced motion. Small UI motion (reveals, curtain, cursor, fly-to-bag) runs on CSS and the Web Animations API, so it costs no bundle weight.
- **Durations:** micro 160ms, UI 320ms, reveal 900ms, route 1100ms. Easing is `expo.out` for entrances, `power2.inOut` for the weft pass, and `back.out(1.6)` for the bag bump.
- **Reduced motion:** Lenis is off, the scroll rig and the route curtain are off, the hero and category scenes show their art-directed stills, and reveals are instant. The product 3D study still opens on request, but it renders still with no turntable, and camera moves are instant.
- **Where motion runs:** reveals are IntersectionObserver plus CSS transitions (on the compositor). Above-the-fold entrances are CSS keyframes. The route curtain, cursor and fly-to-bag use the Web Animations API. GSAP loads on demand for the home scroll rig, the reservation reveal and the 3D camera. So no content depends on a JS animation frame to become visible.

## 6. 3D & performance tiers

A runtime check (`src/lib/device.ts`) assigns a tier from WebGL availability, the renderer string
(which catches SwiftShader and llvmpipe), `hardwareConcurrency`, `deviceMemory`, `saveData`, pointer type and
reduced-motion. Drei's `PerformanceMonitor` then adapts DPR live.

| Tier | Hero | Particles | DPR | Scroll rig | Extras |
|---|---|---|---|---|---|
| **high** | full loom, 180×120 cloth | 1400 | ≤ 2 | yes | in-shader glow |
| **mid** | 110×72 cloth | 500 | ≤ 1.5 | yes | — |
| **low / mobile** | 64×40 cloth, pointer or tilt parallax | 160 | 1 | **no** | — |
| **none** (no WebGL / reduced motion) | art-directed SVG poster with a CSS weave drift | — | — | — | — |

There's no post-processing pass. Glow is done in the fragment shader (additive zari threads),
so there's no bloom to degrade. The cheapest correct design is not to pay for bloom at all.
All 3D is lazy. The `three` chunk loads only on routes that draw, and only once the page is idle. On phones and mid/low tiers it waits for the first touch, scroll or key press (or 7s), and the art-directed poster covers the gap.
Canvases use `ResizeObserver` via R3F, so portrait↔landscape just works.

## 7. Commerce model — why "Reserve & Confirm"

Every Aarchi's piece is cut to one person. The studio's real process (live site, *How it works*)
settles the design, fabric and price **on WhatsApp before work begins**. Taking full payment
online for a price that hasn't been confirmed would misrepresent that process. So:

1. **Bag → customisation confirm → measurements → delivery details → review.** This is a real
   multi-step checkout with validation, saved state and back-navigation.
2. **Reserve & confirm** creates a reservation (reference `AAR-XXXXXX`) and **takes no money**. The
   confirmation reveal then hands the complete brief (pieces, colours, fabric preferences,
   measurements or "measure by video", delivery country) to the **WhatsApp concierge** in one
   tap. There, Archana confirms the final quote, the deposit and the timeline.
3. A `PaymentProvider` seam (`src/lib/payments.ts`) is where a deposit gateway (for example
   Razorpay) plugs in once the studio fixes a deposit policy. The UI already has the slot
   ("Deposit — confirmed with your quote").

"Ask a stylist" (WhatsApp) is present on every product, in the bag, in checkout and in the
footer. It's a concierge layer, not the only way to buy.

*Atelier notes* (newsletter): there's no email service connected, so the signup opts you into the
studio's WhatsApp updates instead of pretending to store an email. `NEWSLETTER_ENDPOINT` in
`src/lib/config.ts` switches it to a real ESP.

## 8. Content rules the UI enforces

- Product copy is shown by provenance: `live-detail` → description, `instagram-caption` →
  a quoted caption with a link to the post, `image-text` → description (from the product image),
  and `none` → no copy block (facts only).
- Placeholder prices always carry the *Indicative* marker, and are never emitted in JSON-LD.
- Testimonials are hidden while empty.
- Every image has the live site's alt text; editorial slides keep their captions.

## 9. Accessibility

Semantic landmarks, a skip link, and visible zari focus rings everywhere. Drawers and sheets are
`role="dialog"` with focus trap, Esc to close and focus return. Filters and swatches are real inputs.
The 3D viewer has button controls, arrow keys and an `aria-label` describing the piece.
`prefers-reduced-motion` is honoured throughout. Tap targets are ≥ 44×44. No information is hover-only.

## 10. Routes

`/` · `/shop` · `/shop/:category` (×7) · `/catalogue/:slug` (×48, matching the live site's URLs) ·
`/bag` · `/checkout` · `/reserved/:ref` · `/account` · `/wishlist` · `/how-it-works` · `/about` ·
`/nri-brides` · `/nri-brides/usa` · `/nri-brides/uk` · `/navratri-outfits-ahmedabad` · `/contact` · `*` (404)

## 11. Rendering & performance

- **Prerendered, then hydrated.** `npm run build` renders all 64 public routes (plus the bag, checkout,
  account, wishlist and 404 shells) to static HTML with React 19 `prerender`. Titles, meta, canonical
  links, JSON-LD, copy and `<img srcset>` are in the HTML, so first paint and search engines need no JS.
  The client hydrates immediately. The shell hydrates first, and each lazy route boundary hydrates in
  time-sliced chunks when its code arrives. (Deferring the hydrate call was measured: it produced one 2–4s blocking task on phones.)
- **Hydration-safe by construction.** Device detection has a server snapshot, so the first client render
  matches. Persisted stores rehydrate after mount. Store-backed pages show a loader for that one tick.
- **One stylesheet** (≈20 KB brotli), so prerendered pages are fully styled before any route chunk.
  The cascade-layer order is pinned by an inline `<style>` in `<head>`.
- **Critical path:** HTML → CSS → Bodoni + Jost (preloaded) → React (≈92 KB br) + app shell (≈35 KB br).
  GSAP and Lenis are off the critical path entirely, and never load on touch devices unless a page needs them.
- **Images:** AVIF + WebP at 360/640/800/1080w with `sizes`, reserved aspect-ratio boxes, a tone skeleton
  painted in CSS (no JS gate), and `fetchpriority="high"` on the first frame only.

Lighthouse 12 against the production build (`npm run preview`, local machine):

| Page | Mobile perf | Desktop perf | A11y | Best practices | SEO |
|---|---|---|---|---|---|
| Home | 72–89 | 91–100 | 100 | 100 | 100 |
| Product | 80–87 | 99–100 | 100 | 100 | 100 |
| Shop (48 pieces) | 75–82 | 98–99 | 100 | 100 | 100 |
| Category | 80–89 | 100 | 100 | 100 | 100 |
| How it works / About | 91–92 | 99–100 | 100 | 100 | 100 |
| Checkout / Bag | 91 | 100 | 100 | 100 | 66 (intentionally `noindex`) |

Ranges come from repeated runs on a shared machine (Lighthouse's simulated throttling varies from run to run).
CLS is ≈0 and TBT is under 300 ms throughout. Mobile LCP (3–5 s on the simulated slow 4G) is the one metric
still below target. The remaining levers are a CDN edge close to India, and trimming React Router's data
APIs from the shell.
