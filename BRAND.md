# Aarchi's by Archana Soni — Brand Book (digital)

> Made to measure in Ahmedabad. Shipped worldwide.
> *Where Tradition Meets Trend* — the studio's own line, kept verbatim.

This is the identity for the e-commerce flagship. It is deliberately **not** the
live site's look (ivory / wine / glass cards / serif). Nothing here reuses its
type, palette, layout or components.

---

## 1. The idea — *Taana–Baana* (ताना-बाना)

*Taana-baana* is the Hindi phrase for **warp and weft**. In everyday speech it also
means the fabric of a life, the way things hold together. It fits a made-to-measure
couture house, where every piece is woven around one person.

| Loom part | What it becomes in the site |
|---|---|
| **Taana — the warp** (vertical, fixed, under tension) | Structure: the 12-column "warp grid" shows up as hairline vertical threads behind key sections; product grids snap to it. |
| **Baana — the weft** (horizontal, travelling) | Motion. Route changes are a *weft pass*: a shuttle carries a thread across the screen and the next page is woven in behind it. Marquees and carousels move horizontally. |
| **Zari — the metal thread** | The one accent. Gold appears as thread (rules, focus rings, the cursor, the 3D highlights), never as flat fills. |
| **Bandhani — the tied dot** | Rhythm and punctuation: loaders, list bullets, the knot in the middle of every divider, and the dot field behind the dupatta pages. |
| **Mehrab — the temple arch** | The frame. Product photography, the founder portrait and the monogram sit inside an ogee arch. |

Home hero: warp threads catch the cursor, a sindoor cloth weaves itself between them, and
on scroll it drapes and falls away to show the collection.

---

## 2. Wordmark & monogram

- **Wordmark:** `AARCHI'S` in Bodoni Moda (optical size 96, weight 500), tracked +0.16em.
  The apostrophe is replaced by a **zari bindu**, a small gold lozenge that reads as a
  knot in a thread. The name sits over a hairline rule, with `BY ARCHANA SONI` beneath in
  Jost 500, tracked +0.32em, at 26% of the name's cap height.
- **Monogram (the "Arch-A"):** a pointed mehrab arch with an **A** drawn inside it. The A's
  crossbar is a single thread with a needle's eye at its right end, and a bindu sits at the apex.
  It works at 16px as the favicon and at 400px as a watermark.
- **Clear space:** the height of the bindu × 4 on every side.
- **Colour:** zari-light on kajal (primary, night), kajal on khadi (day), khadi on sindoor (favicon / app icon).
- **Don't:** outline the wordmark, set it in another face, add a drop shadow, put it on a photo without the kajal scrim, or bring back the old "a"-swirl logo next to it.

Files: `src/components/brand/Wordmark.tsx`, `src/components/brand/Monogram.tsx`,
`public/favicon.svg`, `public/icon-512.png` (app icon), `public/apple-touch-icon.png`.

---

## 3. Colour

| Token | Hex | Role |
|---|---|---|
| `--kajal` | `#15110F` | Ink. Text on day surfaces; the night surface. |
| `--kajal-2` | `#211B18` | Raised night surface. |
| `--khadi` | `#F4EEE4` | Day surface: unbleached handloom cotton. |
| `--khadi-2` | `#EAE1D2` | Recessed day surface, skeletons. |
| `--sindoor` | `#A12F1D` | Signature. Primary buttons, the hero cloth, sale-free emphasis. |
| `--sindoor-2` | `#7F2214` | Pressed / hover-deep. |
| `--zari` | `#B8955A` | Thread accent: rules, focus, cursor, 3D glints. **Never body text on khadi.** |
| `--zari-light` | `#DCC28E` | Zari on night surfaces (text-safe on kajal, 10.9:1). |
| `--zari-deep` | `#74561F` | Zari *text* on khadi (5.9:1). |
| `--neel` | `#1E2940` | Indigo. Men's edit, info states. |
| `--mehndi` | `#4E5A35` | Success and "saved" states. |
| `--gulabi` | `#C9788A` | Rose. Baby shower & maternity accents only. |
| `--rakh` | `#5F564D` | Ash. Secondary text on khadi (6.2:1). |

Text contrast: every text pair meets WCAG AA. Gold on khadi is decorative only.

---

## 4. Type

- **Display: Bodoni Moda** (variable, `opsz` 6–96, `wght` 400–900, with italic). It has the
  high contrast of a fashion masthead. Headlines use `opsz` 96; small display uses `opsz` 28 so
  the hairlines survive.
- **Text: Jost** (variable, `wght` 300–700). A geometric sans in the Futura tradition. Bodoni
  with Futura is the classic fashion-editorial pairing, and Jost's round, open forms stay
  readable at 15px on a phone.
- Italic Bodoni is the "voice" face, used for pull-quotes, the studio's own words, and
  the one emphasised word in a headline.
- Eyebrows: Jost 500, uppercase, +0.24em, 0.72rem.
- Numerals: Jost tabular (`font-variant-numeric: tabular-nums`) for prices and measurements.
- All sizes are fluid (`clamp()`); see DESIGN.md §3.

---

## 5. Voice — quiet luxury, warm heritage-modern, editorial

We sound like **Archana at her cutting table**: unhurried, precise, generous with craft
knowledge, and never pushy. Short sentences. Tailoring verbs (*cut, drape, pin, stitch,
fold*), not retail verbs (*grab, snag, shop now*).

| Instead of | We say |
|---|---|
| Add to cart | **Add to your bag** |
| Item added | **Folded into your bag.** |
| Removed | **Set aside.** · *Undo* |
| Your cart is empty | **Your bag is waiting for its first piece.** |
| Wishlist empty | **Nothing pinned yet.** Tap the heart on any piece to keep it close. |
| No results | **No piece matches all of that.** Loosen a thread or two. |
| Submit / Place order | **Reserve & confirm** |
| Order confirmed | **Reserved. Your piece is on the loom list.** |
| Required field | **We'll need this to cut it right.** |
| Invalid email | **That address doesn't look complete.** |
| Loading… | **Threading the loom…** |
| 404 | **This thread came loose.** |
| Newsletter | **Atelier notes.** New pieces and festive slots, a few times a season. |
| Contact us | **Ask a stylist** (WhatsApp concierge) |

Rules:
1. Prices are "From ₹…" and made-to-measure is always named. We never say "sale" or "discount".
2. We never promise a timeline or a price the studio hasn't confirmed. We say *confirmed with your quote*.
3. We name the craft (*khat work, zardozi, bandhej*), and the glossary explains it without talking down.
4. We don't use emoji in the site's voice. Instagram captions keep theirs, shown as quotes.

---

## 6. Motif system

Every motif is original, drawn in SVG or GLSL, and abstracted from the craft rather than copied from a textile:

- **Zari rule:** a hairline that thickens toward a bandhani knot at its centre. Section divider.
- **Bandhani field:** a jittered dot lattice whose dots "bloom" (grow and fade) as you scroll. Backgrounds, empty states.
- **Jaal:** an interlocking ogee lattice made from the monogram's arch. Pattern fills, the 404 unravelling.
- **Warp lines:** vertical hairlines, 12 per container, at 7% opacity. Section backdrops.
- **Mehrab frame:** the arch clip-path on hero imagery and the founder portrait.
- **Shuttle:** a small lozenge that travels a thread. Loader, route transition, progress indicator.

Category ambients (header scenes, WebGL with SVG fallbacks):

| Category | Ambient |
|---|---|
| Bridal Lehengas | warm gold particle drape: zari dust settling in a curtain |
| Sarees | flowing ribbon: six-yard bands of light in slow travel |
| Dupattas | bandhani-dot bloom: tied dots opening like flowers |
| Dress Material | woven grid: a calm warp/weft plain weave that ripples under the cursor |
| Ethnic & Festive | kinetic colour bursts: garba-night pops of haldi, rani and teal |
| Men's Ethnic | structured geometry: an indigo jaali lattice that slowly turns |
| Baby Shower & Maternity | soft pastel bloom: rose and mint petals breathing |

---

## 7. Imagery

- The studio's own photography only (from the live site). No stock images, and no AI people added.
- Promo overlays baked into old Instagram graphics are cropped out: "50% DISCOUNT", an
  outdated phone number, the misspelt studio sign. See `research/DATA-AUDIT.md`.
- Photos sit on a khadi mat or full-bleed. We never stretch them, and tall crops are shown whole on the mat.
- The 3D garment study is labelled as a study. The photograph is always the true reference.
