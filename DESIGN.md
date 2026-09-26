# Design system & build notes

Companion to BRAND.md. This is the *how*: breakpoints, layout, components, the commerce model
and the rendering and performance approach.

---

## 1. Breakpoints

Every page is checked at these widths:

| Width | What changes |
|---|---|
| **375 / 390** | Header is menu · search · logo · bag. Product grids go 2-up, and rails peek off the right edge. Filters open in a drawer. The product gallery is a full-bleed swipe rail with dots. A sticky "Add to bag" bar appears once the buy button scrolls away. Checkout shows a collapsible order summary. |
| **414–430** (`xs`) | Same layout, and the hero buttons sit side by side. |
| **768** (`md`) | 3-up grids, 2-column quick view, and 3-column steps and service cards. |
| **1024** (`lg`) | Full header: search field, category nav with mega-menus, account and wishlist. Filter sidebar. Product page goes 2 columns with a sticky buy box and a thumbnail rail. Checkout goes 2 columns with a full-height ivory summary. |
| **1280–1440** (`xl`/`2xl`) | 4-up grids, 7-up category strip and 4-up campaign rail. |
| **1920+** (`3xl`) | Content caps at 1440px and the gutters grow. The shop grid goes 5-up. |

Tailwind v4 theme: `xs 26.875rem`, `sm 37.5rem`, `md 48rem`, `lg 64rem`, `xl 80rem`, `2xl 90rem`, `3xl 120rem`.
Tailwind is used for a handful of visibility utilities (`hidden lg:block`). Every visual decision
is in the component CSS, on the tokens in `src/styles/index.css`.

## 2. Layout & type

- **Container:** max 1440px, gutter `clamp(16px, 0.5rem + 2.5vw, 48px)`, plus safe-area insets.
- **Section rhythm:** `--section: clamp(56px, 2rem + 5vw, 112px)`. `.section-sm` is 60% of that.
- **Header:** 60px on mobile, 116px on desktop (68px row + 48px category nav), sticky, with a
  shadow once scrolled. The announcement bar above it scrolls away.
- **Type scale:** `--fs-hero` 44→92px, `--fs-h1` 34→54px, `--fs-h2` 28→42px, `--fs-h3` 21→26px (all fluid),
  body 15px, small 13px, label 11px tracked caps.
- **Shape:** square corners on buttons, inputs and photos. Circles only for swatches, the heart,
  carousel arrows and the WhatsApp button.
- **Z-layers:** sticky bars 20–35 · header 40 · drawers 60 · search 62 · modal 65 · toasts 70 · lightbox 80.

## 3. Components

| Component | Notes |
|---|---|
| **Announcement bar** | Three rotating messages (made to measure, consultation, reserve-then-pay). It pauses on hover or focus, and has previous/next buttons. |
| **Header & mega-menu** | Hovering a category opens a panel with shop all + new, by occasion, by colour (swatches) and two featured pieces. *Occasions* shows 8 photo tiles and *The atelier* shows the house pages. Each item has a chevron disclosure button for keyboard users. Wishlist and bag counts, and the bag bumps when something is added. |
| **Mobile nav** | Left drawer: a search button, then categories as accordions (shop all, new, occasions), occasions, house links, account links and socials. |
| **Search** | A full-width overlay with instant results (8), matching categories, popular searches and category tiles. Enter goes to `/search?q=` (the shop page in search mode). Matching uses shopper synonyms (*lengha → lehenga*, *garba → festive*, *bandhani → bandhej*), and every term must match. |
| **Product card** | 3:4 image. Hover shows the on-figure campaign frame, or a slow zoom when there isn't one. Top-left has a "New" badge and top-right the heart. "Quick view" slides up on hover or focus and is never needed on touch. Below the image are the category label, the name as the one link (stretched over the card), "From ₹…" with the *indicative* marker, and colour dots for the colours in the photograph. |
| **Quick view** | A modal with the photo, name, price, the studio's copy, a fit note (per piece type), Add to bag (with the default made-to-measure fit), wishlist, and a link to the full page to customise. |
| **Product rail** | Native scroll-snap. Arrow buttons on desktop that disable at the ends; swipe on touch. Used for new arrivals, related, recently viewed and saved pieces. |
| **Shop** | Collection header (breadcrumb, title, the studio's intro, category pills), then a sticky toolbar (filter toggle with active count, result count, sort). The filter sidebar holds: new only, category, occasion, colour swatches, fabric, starting price and style. Every option shows a live count that respects the other active filters, and zero-count options are disabled. Active filters appear as chips above the grid with "Clear all". Results load 12 at a time with "Showing X of Y". All filter state lives in the URL, so it can be shared and survives back/forward. |
| **Product page** | Left: a thumbnail column plus a stage (hover to zoom at 1.8×, click for the lightbox with wheel, pinch and double-tap zoom). The last slide is the **3D study**, which only loads on request. Right: the sticky buy box, holding category, name, price and the indicative note, the studio's copy, colour swatches (the studio palette, or "as photographed"), fabric preference pills, and size. Size offers **Made to measure** (the default), XS–XXL and any saved measurements, with a *Size guide* drawer and *Enter my own measurements*. Below that come an optional note for Archana, Add to bag + heart, Ask a stylist on WhatsApp, and service promises. Then accordions: description (only when there's more than the copy above), details, the hand-work explained (craft glossary), size & fit, delivery & payment (the studio's own practical facts). After the columns: the piece's campaign story, "complete the look" or "you may also like", and recently viewed. |
| **Bag drawer** | Opens on every add. It shows lines with qty stepper, remove (undo in a toast) and options, then subtotal, a reserve-then-pay note, Checkout and View bag. |
| **Size guide** | Drawer and page (`/size-guide`). Three fit routes, then an interactive how-to-measure list (tap a measurement to light its line on the figure) with Womenswear/Menswear tabs. It shows no invented size chart. |
| **Measurement entry** | Original line figure, cm/in toggle, typo-catching ranges, named profiles saved on the device. |
| **Footer** | A service strip, then the list signup (WhatsApp opt-in until an email service exists), four columns, socials and ©. |
| **WhatsApp stylist** | A floating button that is product-aware (it pre-fills the piece you're viewing). It is hidden in checkout, and rises above the mobile sticky bar. |

States: every control has hover, focus-visible (2px ink outline), active and disabled states. Empty
states exist for the bag, wishlist, results, orders, measurements and 404. Toasts can undo
removals.

## 4. Pages

`/` home · `/shop` · `/shop/:category` (×7) · `/search?q=` · `/catalogue/:slug` (×48, matching the
live site's URLs) · `/bag` · `/checkout` · `/reserved/:ref` · `/account` (reservations with making
progress, measurements) · `/wishlist` · `/size-guide` · `/how-it-works` · `/about` · `/nri-brides`
(+ `/usa`, `/uk`) · `/navratri-outfits-ahmedabad` · `/contact` (with the live site's style quiz) · 404.

Home, top to bottom: triptych hero → shop by category → new arrivals → bridal feature (4 picks) →
shop by occasion → sarees / Navratri tiles → signature stories (dark campaign band) → made to
measure in six steps → the studio → Instagram → FAQ → local SEO copy → recently viewed.

## 5. Motion

Motion is restrained, the way a store should be. It covers image zoom on hover (≤1.05), a
600ms crossfade to the alt photo, drawer and modal slides (350ms), mega-menu fade-down, and a
heart pop and bag bump on add. Sections fade up once on entry (IntersectionObserver + CSS, so
content can never get stuck invisible). There is **no** scroll-jacking, custom cursor or route
curtain. `prefers-reduced-motion` turns all of it off. GSAP is only used inside the 3D study's camera moves.

## 6. Commerce model: why "Reserve & confirm"

Every piece is cut to one person. The studio's real process settles the design, fabric and price
**on WhatsApp before work begins** (live site, *How it works*). Charging in full online for a price
that hasn't been confirmed would misrepresent that process. So:

1. **Bag → Pieces (colour, fabric, notes, qty) → Fit (measure with Archana / saved measurements /
   standard size) → Delivery (contact, address, occasion, date) → Review.** This is a real checkout
   with validation, saved progress in `sessionStorage`, "Change" links and a Shopify-style order summary.
2. **Reserve & confirm** creates reference `AAR-XXXXXX`, takes **no money**, and hands the complete
   brief to Archana on WhatsApp in one tap from the confirmation page. The account page keeps the
   reservation with its making progress.
3. `src/lib/payments.ts` is the seam for a deposit gateway (e.g. Razorpay) once the studio sets a
   deposit policy. The totals already show "Payment today ₹0" and "Shipping: confirmed with your quote".

## 7. Content rules the UI enforces

- Product copy is shown by provenance. `live-detail` is the description. `image-text` is the
  description, noted as coming from the presentation card. `instagram-caption` is a quoted caption
  linking to the post, emoji removed. `none` gets an honest "not written up yet" and a stylist link.
- Placeholder prices always carry *indicative* and are never emitted in JSON-LD.
- Testimonials render nothing until real, attributable quotes exist in `content.json`.
- No invented policies, timelines, size charts or statistics. Fit, delivery and payment copy comes
  from the studio's own How it works / NRI text.

## 8. Accessibility

Landmarks, a skip link, one `h1` per page and sequential headings. Drawers, search, quick view and
the lightbox are dialogs that move focus in, trap Tab, close on Esc and return focus to the
opener. The trap holds its callback in a ref, so typing inside a dialog never bounces focus.
Filters, swatches, sizes and fit choices are real radio and checkbox inputs. Carousels and rails
have buttons and are also natively scrollable. Tap targets are ≥ 44px, and text contrast meets
AA (gold text was darkened to 5.3:1). No information is hover-only.

## 9. Rendering & performance

- **Prerendered, then hydrated.** `npm run build` renders 71 routes to static HTML with React 19
  `prerender` and React Router's static handler. The HTML carries titles, meta, canonical links,
  JSON-LD and `<img srcset>`. The client hydrates immediately.
- **Hydration-safe.** Device detection has a server snapshot. Persisted stores (bag, wishlist,
  measurements, reservations, recently viewed) rehydrate after mount. URL-driven state (shop
  filters, `?q=`, account tab) applies after hydration, because the prerendered HTML is built without a query string.
- **One stylesheet** (≈15 KB brotli), with the cascade-layer order pinned in `<head>`. Inter and
  Cormorant (roman) are preloaded, and the italic loads only where it is used.
- **Images:** AVIF + WebP at 360–1080w with `sizes`, reserved aspect-ratio boxes, a CSS tone
  skeleton, and `fetchpriority="high"` on the first frame only.
- **3D is opt-in.** three.js (≈900 KB, ≈195 KB brotli) loads only when someone opens the 3D study.

Lighthouse 12, production build via `npm run preview` (simulated throttling, which varies ±4 between runs):

| Page | Mobile perf | Desktop perf | A11y | Best practices | SEO |
|---|---|---|---|---|---|
| Home | 88 | 100 | 100 | 100 | 100 |
| Shop (category) | 87 | 100 | 100 | 100 | 100 |
| Product | 88–90 | 99 | 100 | 100 | 100 |
| About | 91–92 | 100 | 100 | 100 | 100 |
| How it works / Contact / Size guide | 94–96 | — | 100 | 100 | 100 |
| NRI brides | 88 | — | 100 | 100 | 100 |
| Checkout | 96 | — | 100 | 100 | 66 (intentionally `noindex`) |

CLS is 0 everywhere and TBT is ≤ 70 ms. In unthrottled runs, observed LCP is 0.18–0.35 s.
