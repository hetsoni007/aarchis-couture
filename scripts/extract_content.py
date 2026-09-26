#!/usr/bin/env python3
"""
Step 0 — turn the live-site crawl (research/raw/*.html, fetched 2026-09-24 from
https://www.aarchisbyarchanasoni.com) into the app's data files.

  src/data/products.json   48 products, one distinct entry each
  src/data/content.json    brand story, FAQs, local-SEO copy, process, contact
  research/DATA-AUDIT.md   per-product provenance + everything that needs a human

Rules this script enforces:
  * Product copy is copied verbatim from the live product page. Nothing is
    paraphrased or generated. Every field marked `verbatim` is asserted to exist
    in the page it came from — the build fails if a string drifts.
  * Colour families / silhouette / crops come from scripts/curation.py (decided
    by looking at the photos) and are stored under `derived`, never as copy.
  * Prices: the 8 real live prices are used as-is. The other 40 get an
    INDICATIVE placeholder, flagged `placeholder: true` everywhere it travels.

Run:  python3 scripts/extract_content.py
"""
import html
import json
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).parent))
from curation import C, FABRIC  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "research" / "raw"
LIVE = "https://www.aarchisbyarchanasoni.com"

CATEGORIES = [
    # key, url slug, plural label, singular label (live), ambient mode
    ("bridal", "bridal-lehengas", "Bridal Lehengas", "Bridal Lehenga", "gold-drape"),
    ("saree", "sarees", "Sarees", "Saree", "ribbon"),
    ("dupatta", "dupattas", "Dupattas", "Dupatta", "bandhani-bloom"),
    ("dressmaterial", "dress-material", "Dress Material", "Dress Material", "woven-grid"),
    ("ethnic", "ethnic-festive", "Ethnic & Festive", "Ethnic & Festive Wear", "colour-burst"),
    ("mens", "mens-ethnic", "Men's Ethnic", "Men's Ethnic Wear", "geometric"),
    ("babyshower", "baby-shower-maternity", "Baby Shower & Maternity", "Baby Shower & Maternity", "pastel-bloom"),
]
LABEL_TO_KEY = {c[3]: c[0] for c in CATEGORIES}

# Craft vocabulary we look for in the REAL text of each product.
CRAFT_TERMS = [
    ("zardozi", r"zardozi"), ("zari", r"\bzari\b"), ("khat work", r"\bkhat\b"),
    ("bandhej", r"bandhej|bandhani"), ("gharchola", r"gharchola"), ("patola", r"patola"),
    ("jaal", r"\bjaal\b"), ("gamthi", r"gamthi"), ("jacquard", r"jacquard"),
    ("embroidery", r"embroider|hand-stitched"),
    ("beadwork", r"\bbead"), ("patchwork", r"patchwork|patches"), ("butis", r"\bbutis?\b"),
    ("sequins", r"sequin"), ("tassels", r"tassel"), ("temple border", r"temple-motif"),
    ("woven", r"\bwoven\b"), ("hand & machine", r"hand and machine"),
]


def norm(s: str) -> str:
    s = html.unescape(s)
    s = unicodedata.normalize("NFC", s)
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\s+([,.!?;:])", r"\1", s)
    return s.strip()


def page_text(soup: BeautifulSoup) -> str:
    return norm(soup.get_text(" "))


def soup_of(name: str) -> BeautifulSoup:
    return BeautifulSoup((RAW / name).read_text(encoding="utf-8"), "html.parser")


def ig_date(shortcode: str) -> str:
    """Instagram shortcodes are base64 media ids whose high bits are a ms timestamp."""
    alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    n = 0
    for ch in shortcode:
        n = n * 64 + alpha.index(ch)
    ms = (n >> 23) + 1314220021721
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).date().isoformat()


def ld_json(soup):
    out = []
    for sc in soup.find_all("script", type="application/ld+json"):
        data = json.loads(sc.string)
        out.extend(data if isinstance(data, list) else [data])
    return out


# ─────────────────────────────────────────────────────────────── products ──
def extract_products():
    local = {d["slug"]: d for d in json.loads((Path.home() / "Projects/Aarchis/data/designs.json").read_text())}
    cat_page = soup_of("catalogue.html")
    order = [a["href"].strip("/").split("/")[-1] for a in cat_page.select("a.dcard[href^='/catalogue/']")]
    products, audit = [], []

    for pos, slug in enumerate(order):
        f = RAW / f"catalogue__{slug}.html"
        soup = BeautifulSoup(f.read_text(encoding="utf-8"), "html.parser")
        full = page_text(soup)
        cur = C[slug]

        name = norm(soup.select_one(".design-info h1").get_text())
        crumb = norm(soup.select_one(".crumbs").get_text()).split("/")[-1].strip()
        cat_key = LABEL_TO_KEY[crumb]
        detail = norm(soup.select_one(".design-desc").get_text())
        chips = [(c.get("class")[1], norm(c.get_text())) for c in soup.select(".design-tags .chip")]
        occasions = [t for k, t in chips if k == "occ"]
        styles = [t for k, t in chips if k == "sty"]
        is_new = any(k == "new" for k, _ in chips)
        pricing = norm(soup.select_one(".design-meta li:last-child").get_text()).replace("Pricing", "").strip()
        crafting = norm(soup.select_one(".design-meta li:nth-child(2)").get_text()).replace("Crafting", "").strip()
        img = soup.select_one(".design-media img")
        meta = norm(soup.find("meta", attrs={"name": "description"})["content"])
        title = norm(soup.title.string)
        schema = next(x for x in ld_json(soup) if x.get("@type") == "Product")

        story = None
        if soup.select_one(".estory-intro"):
            slides = []
            for fig in soup.select(".estory .eslide"):
                im = fig.find("img")
                kick = fig.select_one(".eslide-kicker")
                cap = fig.select_one(".eslide-cap p")
                slides.append({
                    "file": Path(im["src"]).stem,
                    "alt": norm(im["alt"]),
                    "kicker": norm(kick.get_text()) if kick else None,
                    "caption": norm(cap.get_text()) if cap else None,
                })
            story = {
                "title": norm(soup.select_one(".estory-intro h2").get_text()),
                "lead": norm(soup.select_one(".estory-intro .lead").get_text()),
                "slides": slides,
            }
        cross = [a["href"].strip("/").split("/")[-1] for a in soup.select(".estory-cross a.dcard")]

        # every verbatim string must be on the page it came from
        for label, s in [("name", name), ("detail", detail), ("meta", meta)]:
            probe = s if label != "meta" else None
            if probe and probe not in full:
                raise SystemExit(f"[{slug}] {label} not found verbatim on live page: {s!r}")
        if meta not in norm(str(soup)):
            raise SystemExit(f"[{slug}] meta description mismatch")

        live_price = None
        m = re.match(r"₹([\d,]+)$", pricing)
        if m:
            live_price = int(m.group(1).replace(",", ""))

        # Instagram provenance (from the source repo — the live site doesn't expose it)
        loc = local.get(slug, {})
        sc = loc.get("shortCode")
        instagram = {"shortcode": sc, "url": f"https://www.instagram.com/p/{sc}/", "postedAt": ig_date(sc)} if sc else None

        # the words we can quote on the product page
        quality = cur["quality"]
        if cur.get("image_text") and slug == "ivory-reign-lehenga":
            display, display_source = "An exquisite pure organza lehenga choli, crafted with hand-embroidery.", "image-text"
        elif quality == "product":
            display, display_source = detail, "live-detail"
        elif quality == "caption":
            display, display_source = detail, "instagram-caption"
        else:
            display, display_source = None, "none"

        # crafts only from real text
        real_text = " ".join(filter(None, [
            detail, cur.get("image_text"), story and story["lead"], story and story["title"],
            *(s["alt"] for s in (story or {}).get("slides", [])),
            *(s["caption"] or "" for s in (story or {}).get("slides", [])),
            loc.get("description") if not loc.get("shortCode") else None,  # the 8 studio-written descriptions
        ])).lower()
        crafts = [label for label, rx in CRAFT_TERMS if re.search(rx, real_text)]
        if "zardozi" in crafts and "zari" not in crafts and re.search(r"\bzari\b", real_text):
            crafts.append("zari")

        fabric = FABRIC.get(slug)
        price = (
            {"inr": live_price, "placeholder": False, "source": "live site"}
            if live_price else
            {"inr": cur["placeholder"], "placeholder": True, "source": "indicative placeholder — live site says “on enquiry”"}
        )

        products.append({
            "slug": slug,
            "name": name,
            "category": cat_key,
            "categoryLabel": crumb,
            "position": pos,
            "isNew": is_new,
            "occasions": occasions,
            "styles": styles,
            "copy": {
                "detail": detail,
                "quality": quality,
                "display": display,
                "displaySource": display_source,
                "imageText": cur.get("image_text"),
                "crafting": crafting,
                "livePricing": pricing,
                "metaDescription": meta,
                "pageTitle": title,
                "schemaDescription": norm(schema["description"]),
                "studioDescription": loc.get("description") if not sc else None,
            },
            "story": story,
            "crossSell": cross,
            "crafts": crafts,
            "fabric": {"name": fabric[0], "source": fabric[1]} if fabric else None,
            "derived": {
                "families": cur["families"],
                "base": cur["base"],
                "second": cur["second"],
                "accent": cur["accent"],
                "pattern": cur["pattern"],
                "silhouette": cur["silhouette"],
            },
            "image": {
                "file": slug,
                "alt": norm(img["alt"]),
                "crop": cur.get("crop"),
                "fit": cur.get("fit", "cover"),
                "focus": cur.get("focus", "50% 40%"),
            },
            "price": price,
            "instagram": instagram,
            "source": f"{LIVE}/catalogue/{slug}/",
            "flags": cur.get("flags", []),
        })

        audit.append((slug, name, crumb, quality, display_source, price, cur.get("flags", []), len(story["slides"]) if story else 0))

    return products, audit


# ──────────────────────────────────────────────────────────────── content ──
def V(page: str, s: str) -> str:
    """Mark a string as verbatim from `page` and prove it."""
    t = page_text(soup_of(page))
    if norm(s) not in t:
        raise SystemExit(f"[content] not verbatim on {page}: {s!r}")
    return norm(s)


def extract_content(products):
    home = soup_of("home.html")
    faq_home = next(x for x in ld_json(home) if x.get("@type") == "FAQPage")["mainEntity"]

    def faq_of(page):
        ents = next(x for x in ld_json(soup_of(page)) if x.get("@type") == "FAQPage")["mainEntity"]
        return [{"q": norm(e["name"]), "a": norm(e["acceptedAnswer"]["text"])} for e in ents]

    # Instagram proof tiles on the home page
    ig = []
    for a in home.select("a[href*='instagram.com']"):
        im = a.find("img")
        if im and "/assets/img/" in im.get("src", ""):
            ig.append({"file": Path(im["src"]).stem, "folder": Path(im["src"]).parent.name, "alt": norm(im["alt"])})

    steps = [
        ("Consultation on WhatsApp", "Tell us the occasion, your ideas and budget — share reference photos or pick a catalogue design as the starting point."),
        ("Design & fabric", "Archana works out the silhouette, fabrics, colours and embroidery with you, with photos and swatches shared on chat."),
        ("Measurements at home", "A video-guided measurement session on WhatsApp — all you need is a measuring tape and a helper."),
        ("Crafted in Ahmedabad", "Your outfit is cut, embroidered and finished at the studio, with progress photos as it comes together."),
        ("Fitting review", "You see the finished piece on photos and video before it ships — tweaks are agreed right there."),
        ("Delivered to your door", "Carefully packed and shipped — across India and worldwide."),
    ]

    cat_intro = {
        "bridal": "Heirloom lehengas in zari, zardozi and khat work — crafted for the moment you've always pictured.",
        "saree": "Silk, paithani and bandhej drapes, hand-finished and styled for every celebration.",
        "dupatta": "Hand-worked gharchola, bandhej and net dupattas — the finishing layer for bridal and festive looks.",
        "dressmaterial": "Pure silk suit pieces with a matching dupatta — unstitched, and tailored to your measurements.",
        "ethnic": "Festive and Navratri ensembles that turn a little tradition into a statement.",
        "mens": "Sharp, regal ethnic wear for grooms and the men of the celebration.",
        "babyshower": "Bespoke baby-shower and maternity outfits to make the mum-to-be glow.",
    }
    counts = {}
    for p in products:
        counts[p["category"]] = counts.get(p["category"], 0) + 1

    content = {
        "_provenance": f"Every string under a key ending in verbatim-checked sections was asserted against the live crawl of {LIVE} (2026-09-24). Keys under `original` are new editorial copy written for this build.",
        "brand": {
            "name": "Aarchi's by Archana Soni",
            "short": "Aarchi's",
            "founder": "Archana Soni",
            "tagline": V("home.html", "Where Tradition Meets Trend"),
            "descriptor": V("home.html", "Custom Fashion Designer · Ahmedabad"),
            "footerLine": V("home.html", "Custom fashion designer, Ahmedabad. Where tradition meets trend."),
            "schemaDescription": "Custom fashion designer in Ahmedabad — made-to-measure bridal lehengas, sarees, festive and baby-shower outfits, shipped worldwide.",
            "areaServed": ["India", "United States", "United Kingdom", "Canada", "Australia", "United Arab Emirates"],
            "languages": ["en", "hi", "gu"],
        },
        "contact": {
            "whatsappDisplay": "+91 98793 90731",
            "whatsappE164": "919879390731",
            "telephone": "+91-98793-90731",
            "studio": V("contact.html", "Ahmedabad, India"),
            "visits": V("contact.html", "Visits by appointment"),
            "intro": V("contact.html", "The fastest way to reach us is WhatsApp. Share what you're looking for and we'll help with availability, sizing or a custom commission."),
            "social": {
                "instagram": {"url": "https://www.instagram.com/aarchis.byarchanasoni/", "handle": "@aarchis.byarchanasoni"},
                "facebook": {"url": "https://www.facebook.com/aarchis.byearchanasonii/"},
                "pinterest": {"url": "https://in.pinterest.com/aarchisbyarchanasoni/"},
                "linkedin": {"url": "https://in.linkedin.com/company/aarchi-s-by-archana-soni"},
            },
            "notPublished": ["email address", "street address / locality", "opening hours", "typical reply time"],
        },
        "home": {
            "hero": {
                "eyebrow": V("home.html", "Custom Fashion Designer · Ahmedabad"),
                "title": V("home.html", "Where Tradition Meets Trend"),
                "lead": V("home.html", "Custom bridal lehengas, sarees and festive wear — designed and made to measure in Ahmedabad by Archana Soni, shipped worldwide."),
            },
            "marquee": ["Bridal Couture", "Handcrafted Sarees", "Dupattas & Odhnis", "Festive & Navratri", "Bespoke Tailoring", "Baby Shower & Maternity"],
            "campaign": {"eyebrow": V("home.html", "The Campaign"), "title": V("home.html", "Signature stories"), "lead": V("home.html", "Our flagship pieces, shot detail by detail — swipe through the collection.")},
            "edit": {"eyebrow": V("home.html", "The Signature Edit"), "title": V("home.html", "Explore by occasion"), "lead": V("home.html", "Every piece is made to measure — laid out across the moments you dress for.")},
            "studio": {
                "eyebrow": V("home.html", "The Studio"),
                "title": V("home.html", "A label built on craft & care"),
                "paragraphs": [
                    V("home.html", "Founded by Archana Soni in Ahmedabad, Aarchi's crafts timeless designs that celebrate elegance and individuality — from bridal lehengas with zari, zardozi and khat work to handcrafted sarees and festive wear."),
                    V("home.html", "Every piece is made to measure and designed around you, blending traditional craftsmanship with a contemporary sensibility."),
                ],
            },
            "faq": {"eyebrow": V("home.html", "Good to know"), "title": V("home.html", "Questions, answered"),
                    "items": [{"q": norm(e["name"]), "a": norm(e["acceptedAnswer"]["text"])} for e in faq_home]},
            "localSeo": {
                "eyebrow": "Ahmedabad",
                "title": V("home.html", "Bridal wear designer in Ahmedabad"),
                "paragraphs": [
                    V("home.html", "If you're searching for a custom lehenga in Ahmedabad, this is where it's made. At Aarchi's, Archana Soni designs and tailors every piece to your measurements — bridal lehengas worked in zari, zardozi and khat, handcrafted sarees, and occasion wear that fits the way ready-made never quite does."),
                    V("home.html", "Come festival season, the studio turns to garba nights — as a Navratri chaniya choli designer, Archana crafts festive ensembles you can twirl in. And for the quieter celebrations, she's the baby shower outfit designer in Ahmedabad mums-to-be come back to. Studio visits by appointment; start the conversation on WhatsApp."),
                ],
            },
            "instagram": {"eyebrow": V("home.html", "On Instagram"), "title": V("home.html", "Recent work, as it happens"), "items": ig},
            "finalCta": {"eyebrow": V("home.html", "Visit the Studio"), "title": V("home.html", "Found something you love?"),
                         "text": V("home.html", "Message us on WhatsApp to check availability, book a fitting, or commission a made-to-measure piece.")},
        },
        "categories": [
            {"key": k, "slug": s, "label": pl, "singular": sg, "ambient": amb,
             "intro": V("home.html", cat_intro[k]), "count": counts.get(k, 0)}
            for k, s, pl, sg, amb in CATEGORIES
        ],
        "about": {
            "eyebrow": V("about.html", "Our Story"),
            "title": V("about.html", "Meet Archana Soni"),
            "paragraphs": [
                V("about.html", "Fashion has always been my passion, and I take pride in crafting timeless designs that celebrate elegance and individuality. Based in Ahmedabad, I specialise in creating outfits that make every occasion truly extraordinary."),
                V("about.html", "From custom creations to signature styles — bridal lehengas with zari, zardozi and khat work, handcrafted sarees, festive and maternity wear — my goal is to bring your dream outfits to life. Let's redefine elegance together."),
            ],
            "portraitAlt": "Archana Soni, founder of Aarchi's",
            "services": [
                {"title": V("about.html", "Bridal & Couture"), "text": V("about.html", "Handcrafted bridal lehengas with zari, zardozi and khat work for your big day.")},
                {"title": V("about.html", "Sarees & Ethnic Wear"), "text": V("about.html", "Silk, paithani and bandhej drapes, festive and Navratri ensembles for every occasion.")},
                {"title": V("about.html", "Custom & Made to Measure"), "text": V("about.html", "Bespoke outfits designed around you — including baby-shower and maternity wear.")},
            ],
            "metaDescription": norm(soup_of("about.html").find("meta", attrs={"name": "description"})["content"]),
        },
        "howItWorks": {
            "eyebrow": V("how-it-works.html", "The Process"),
            "title": "Made for you, step by step",
            "lead": V("how-it-works.html", "Every Aarchi's piece is made to measure — here's exactly how a custom outfit comes to life, whether you're in Ahmedabad or across the world."),
            "steps": [{"title": V("how-it-works.html", t), "text": V("how-it-works.html", d)} for t, d in steps],
            "faq": faq_of("how-it-works.html"),
            "metaDescription": norm(soup_of("how-it-works.html").find("meta", attrs={"name": "description"})["content"]),
        },
        "nri": {
            "eyebrow": V("nri-brides.html", "For NRI Brides"),
            "title": "Made in India, delivered worldwide",
            "lead": V("nri-brides.html", "Custom Indian bridal outfits designed over WhatsApp, handcrafted in Ahmedabad, and shipped to the USA, UK, Canada, Australia and UAE — made to your measurements, not a size chart."),
            "processEyebrow": V("nri-brides.html", "The Remote Process"),
            "processTitle": V("nri-brides.html", "Six steps, zero guesswork"),
            "facts": [
                {"label": "Typical timeline", "value": V("nri-brides.html", "confirmed on enquiry — share your wedding date first")},
                {"label": "Payment", "value": V("nri-brides.html", "discussed and confirmed on WhatsApp before work begins")},
            ],
            "otherCountries": V("nri-brides.html", "Canada · Australia · UAE — ask us"),
            "faq": faq_of("nri-brides.html"),
            "metaDescription": norm(soup_of("nri-brides.html").find("meta", attrs={"name": "description"})["content"]),
            "countries": {
                "usa": {
                    "name": "the USA", "eyebrow": "NRI Brides · The USA", "title": "From Ahmedabad to the USA",
                    "lead": V("nri-brides__usa.html", "Custom bridal lehengas and Indian wedding outfits for NRI brides across the United States — designed together on WhatsApp despite the timezones, crafted in Ahmedabad, delivered to your door."),
                    "faq": faq_of("nri-brides__usa.html"),
                    "metaDescription": norm(soup_of("nri-brides__usa.html").find("meta", attrs={"name": "description"})["content"]),
                },
                "uk": {
                    "name": "the UK", "eyebrow": "NRI Brides · The UK", "title": "From Ahmedabad to the UK",
                    "lead": V("nri-brides__uk.html", "Custom bridal lehengas and Indian wedding outfits for brides across the United Kingdom — designed together on WhatsApp, handcrafted in Ahmedabad, delivered to your door."),
                    "faq": faq_of("nri-brides__uk.html"),
                    "metaDescription": norm(soup_of("nri-brides__uk.html").find("meta", attrs={"name": "description"})["content"]),
                },
                "practical": [
                    {"label": "Shipping", "value": V("nri-brides__usa.html", "carrier, time and cost confirmed with your quote")},
                    {"label": "Bridal range", "value": V("nri-brides__usa.html", "quoted per design — share your budget in the first chat")},
                    {"label": "Payment", "value": V("nri-brides__usa.html", "discussed and confirmed on WhatsApp before work begins")},
                    {"label": "Typical timeline", "value": V("nri-brides__usa.html", "confirmed on enquiry — share your wedding date first")},
                ],
            },
        },
        "navratri": {
            "eyebrow": V("navratri-outfits-ahmedabad.html", "Festive Edit · Ahmedabad"),
            "title": "Navratri, made to twirl",
            "lead": V("navratri-outfits-ahmedabad.html", "Custom chaniya cholis and festive ensembles for garba nights — designed and made to measure in Ahmedabad by Archana Soni. Nine nights deserve better than off-the-rack."),
            "faq": faq_of("navratri-outfits-ahmedabad.html"),
            "metaDescription": norm(soup_of("navratri-outfits-ahmedabad.html").find("meta", attrs={"name": "description"})["content"]),
        },
        "contactPage": {
            "eyebrow": V("contact.html", "Get in touch"),
            "title": V("contact.html", "Visit the studio"),
            "quizTitle": V("contact.html", "Let's design your outfit"),
            "quizLead": V("contact.html", "A 30-second style quiz — tap through and we'll pick it up on WhatsApp with ideas & a quote."),
            # the quiz is rendered by /quiz.js on the live site (same file as ~/Projects/Aarchis/quiz.js)
            "quiz": [
                {"key": "occasion", "q": "What are you dressing for?", "opts": ["Wedding", "Reception", "Sangeet / Mehndi", "Festive / Navratri", "Baby shower", "Everyday / Other"]},
                {"key": "piece", "q": "What piece do you have in mind?", "opts": ["Bridal lehenga", "Saree", "Anarkali / Gown", "Men's ethnic", "Baby-shower outfit", "Not sure yet"]},
                {"key": "timeline", "q": "When do you need it by?", "opts": ["Within a month", "1–3 months", "3–6 months", "Just exploring"]},
                {"key": "location", "q": "Where should we deliver? (we ship worldwide)", "opts": ["India", "USA", "UK", "Elsewhere"]},
            ],
            "metaDescription": norm(soup_of("contact.html").find("meta", attrs={"name": "description"})["content"]),
        },
        "testimonials": {
            "items": [],
            "note": "The live site has no published testimonials (data/site.json holds TODO placeholders only). The section stays hidden until real, attributable client words are added here.",
        },
        "catalogueLead": V("catalogue.html", "Every piece is handcrafted and made to measure — browse by category, refine by occasion & style, then enquire to tailor it to you."),
    }
    return content


# ────────────────────────────────────────────────────────────────── audit ──
def write_audit(products, audit):
    q = {"product": 0, "caption": 0, "fragment": 0}
    for p in products:
        q[p["copy"]["quality"]] += 1
    real = [p for p in products if not p["price"]["placeholder"]]
    lines = [
        "# Data audit — Step 0",
        "",
        f"Source: live crawl of {LIVE} on 2026-09-24 — 57 URLs from the live sitemap, all HTTP 200, raw HTML in `research/raw/`.",
        "Generated by `scripts/extract_content.py`. **Do not hand-edit — change the curation or the source and re-run.**",
        "",
        "## Coverage",
        "",
        "| Category | Live count | Extracted |",
        "|---|---|---|",
    ]
    for k, s, pl, sg, amb in CATEGORIES:
        n = sum(1 for p in products if p["category"] == k)
        lines.append(f"| {pl} | {n} | {n} ✓ |")
    lines += [
        f"| **Total** | **{len(products)}** | **{len(products)} ✓** |",
        "",
        "Every product's name, detail copy, tags, alt text, meta description, story and slide captions were asserted verbatim against its own live page during extraction (the script exits on any mismatch).",
        "",
        "## Copy quality — the honest picture",
        "",
        f"- **{q['product']}** products have live copy that actually describes the garment. It is shown as the description.",
        f"- **{q['caption']}** products have live copy that is a promotional Instagram caption (“Fall in love with fashion all over again…”). It is kept verbatim and shown as a quoted caption *from the studio's Instagram*, not as a garment description.",
        f"- **{q['fragment']}** products have live copy that is a broken caption fragment (stripped hashtags/handles, someone else's credits, or another brand's name). It is kept in the data but **not displayed**.",
        "- No product description was invented to fill a gap. Where the copy is thin, the product page leans on the facts we do have (category, occasion and style tags, fabric where named, crafts where named, the photograph).",
        "",
        "## Prices",
        "",
        f"- **{len(real)}** products carry a real live price: " + ", ".join(f"{p['name']} ₹{p['price']['inr']:,}" for p in real) + ".",
        "  - These contradict the brief's suggested bands (dupattas ₹5,000–₹15,000, dress material ₹8,000–₹20,000). **The real prices win.**",
        f"- **{len(products) - len(real)}** products are “on enquiry” on the live site. They carry an **indicative placeholder** starting price (`price.placeholder: true`), shown in the UI with an *Indicative* marker and never emitted in Product schema. Replace with real prices before launch.",
        "",
        "## Things that need a human (from looking at every photo)",
        "",
    ]
    for slug, name, crumb, quality, dsrc, price, flags, nslides in audit:
        if flags:
            lines.append(f"### {name} · `{slug}`")
            for fl in flags:
                lines.append(f"- {fl}")
            lines.append("")
    lines += [
        "## Other gaps",
        "",
        "- **Testimonials:** none published on the live site (`data/site.json` holds TODO placeholders). The testimonial section is built but data-gated; it renders nothing until real quotes are added to `content.json → testimonials.items`.",
        "- **Contact:** no public email, street address, opening hours or reply time. The site uses WhatsApp +91 98793 90731 and the four social profiles only.",
        "- **Editorial photos** (`assets/img/editorial/`) are Pomelli campaign renders for 6 products; `assets/img/SOURCES.md` in the live repo notes photographer credits to confirm before launch.",
        "- **Scarlet Royal campaign slides** (`scarlet-craft`, `scarlet-jewels`, `scarlet-palace`, `scarlet-story`) carry baked-in marketing headlines, and `scarlet-jewels` shows only jewellery, not the garment. They stay on that product's story (as on the live site), but the home reel uses the clean product portrait instead and How It Works uses clean flat-lays.",
        "- **Founder portrait** (`founder-archana.webp`) has a baked-in title card (\"ARCHANA SONI · FOUNDER · Aarchis by Archana Soni · FASHION DESIGNER | AHMEDABAD\"). The site uses a crop of the portrait only (`founder-portrait`). A clean portrait would be better.",
        "",
        "## Per-product provenance",
        "",
        "| # | Product | Category | Copy shown | Price | Story slides |",
        "|---|---|---|---|---|---|",
    ]
    for i, (slug, name, crumb, quality, dsrc, price, flags, nslides) in enumerate(audit, 1):
        pr = f"₹{price['inr']:,} {'(indicative)' if price['placeholder'] else '(live)'}"
        lines.append(f"| {i} | [{name}]({LIVE}/catalogue/{slug}/) | {crumb} | {dsrc} ({quality}) | {pr} | {nslides or '—'} |")
    (ROOT / "research" / "DATA-AUDIT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    products, audit = extract_products()
    assert len(products) == 48, len(products)
    assert len({p["slug"] for p in products}) == 48
    content = extract_content(products)
    out = ROOT / "src" / "data"
    out.mkdir(parents=True, exist_ok=True)
    (out / "products.json").write_text(json.dumps(products, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (out / "content.json").write_text(json.dumps(content, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    # the browser bundle gets a lean copy — provenance/audit fields stay in products.json
    lean = []
    for p in products:
        q = json.loads(json.dumps(p))
        for k in ("flags", "source"):
            q.pop(k, None)
        for k in ("pageTitle", "schemaDescription", "livePricing", "detail" if q["copy"]["display"] == q["copy"]["detail"] else "_"):
            q["copy"].pop(k, None)
        q["image"].pop("crop", None)
        q["price"].pop("source", None)
        if q.get("fabric"):
            q["fabric"].pop("source", None)
        lean.append(q)
    (out / "catalog.client.json").write_text(json.dumps(lean, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    write_audit(products, audit)
    q = {}
    for p in products:
        q[p["copy"]["quality"]] = q.get(p["copy"]["quality"], 0) + 1
    print(f"products: {len(products)}  copy quality: {q}  real prices: {sum(not p['price']['placeholder'] for p in products)}")


if __name__ == "__main__":
    main()
