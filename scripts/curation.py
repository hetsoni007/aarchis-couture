"""
Per-product curation — every decision here was made by looking at the actual
product photograph (contact sheets in research/) and the live copy. Nothing in
this file is product *copy*: copy is only ever taken verbatim from the live site
by extract_content.py. This file holds the things a designer decides:

  silhouette   which 3D study the garment viewer builds (from the photo)
  families     colour-filter families, read from the PHOTO (not the name —
               several live names contradict their photos; see flags)
  base/second  3D fabric colours sampled by eye from the photo
  accent       thread colour for zari/border in the 3D study
  pattern      which procedural textile the 3D study weaves
  crop         (x0, y0, x1, y1) fractions — removes baked-in promo text,
               an outdated phone number, "50% DISCOUNT" badges, misspelt signage
  fit          'cover' for clean photos, 'contain' for tall narrow crops
  focus        CSS object-position for cover crops
  quality      'product'  = live copy describes the garment
               'caption'  = live copy is a promotional Instagram caption
               'fragment' = live copy is a broken caption fragment (not shown)
  image_text   text transcribed verbatim from the product image itself
  placeholder  INDICATIVE starting price in INR — ONLY for the 40 products the
               live site prices "on enquiry". Invented per the brief's bands and
               scaled by what the real copy says about the work. Must be
               replaced with real prices before launch. The 8 products with a
               real live price never use this.
  flags        human-review notes that go into research/DATA-AUDIT.md
"""

C = {
    # ── Dupattas ─────────────────────────────────────────────────────────
    "gharchola-heritage-dupatta": dict(
        silhouette="dupatta", families=["Red", "Green", "Blue"], base="#A3221C", second="#1E5A34",
        accent="gold", pattern="gharchola", crop=(0.0, 0.2, 1.0, 1.0), focus="50% 60%", quality="product",
        flags=["Original photo shows studio signage spelt “Archi's” — cropped out."]),
    "sunset-bandhani-ombre-dupatta": dict(
        silhouette="dupatta", families=["Pink", "Orange & Coral", "Red"], base="#E2513A", second="#E9407A",
        accent="gold", pattern="bandhani-ombre", crop=(0.0, 0.2, 1.0, 1.0), focus="50% 55%", quality="product",
        flags=["Original photo shows studio signage spelt “Archi's” — cropped out."]),
    "scarlet-pearl-petal-dupatta": dict(
        silhouette="dupatta", families=["Red"], base="#C0141C", second="#C0141C",
        accent="pearl", pattern="dot-jaal", crop=(0.0, 0.2, 1.0, 1.0), focus="50% 55%", quality="product",
        flags=["Original photo shows studio signage spelt “Archi's” — cropped out."]),

    # ── Sarees ───────────────────────────────────────────────────────────
    "ivory-elegance-saree": dict(
        silhouette="saree", families=["Pink", "Purple", "Gold"], base="#D42A6C", second="#5B3A8C",
        accent="gold", pattern="zari-border", focus="50% 25%", quality="product", placeholder=36000,
        flags=["Name says “Ivory”; the garment is rani pink with a purple blouse (live copy already says rani pink). Consider renaming."]),
    "linen-silk-gamthi-saree": dict(
        silhouette="saree", families=["Ivory & Beige", "Multicolour"], base="#E6DAC3", second="#2A2624",
        accent="multi", pattern="gamthi", focus="50% 25%", quality="product", placeholder=18500),
    "heritage-handcrafted-saree": dict(
        silhouette="saree", families=["Orange & Coral", "Gold"], base="#DE5F1B", second="#B8862F",
        accent="gold", pattern="zari-border", focus="30% 30%", quality="product", placeholder=32000,
        flags=["Photo also shows a man in a waistcoat — make sure shoppers understand the saree is the product."]),
    "silk-saree-ethnic-set": dict(
        silhouette="saree", families=["Orange & Coral", "Gold"], base="#E4691E", second="#B8862F",
        accent="gold", pattern="zari-border", focus="30% 30%", quality="product", placeholder=28000,
        flags=["Same couple and a very similar saree to Heritage Handcrafted Saree — confirm these are two different pieces."]),
    "beige-noor-saree": dict(
        silhouette="saree", families=["Maroon", "Ivory & Beige"], base="#5E2227", second="#CFD6CF",
        accent="multi", pattern="floral", focus="50% 30%", quality="caption", placeholder=22000,
        flags=["Name says “Beige”; photo shows a maroon drape with a pale embroidered blouse."]),
    "beige-mirage-saree": dict(
        silhouette="saree", families=["Ivory & Beige", "Multicolour"], base="#D9C8A6", second="#B0174E",
        accent="multi", pattern="gamthi", focus="50% 40%", quality="caption", placeholder=19500),

    # ── Bridal lehengas ──────────────────────────────────────────────────
    "blush-pastel-bridal-lehenga": dict(
        silhouette="lehenga", families=["Pink", "Ivory & Beige"], base="#EDE3E1", second="#E7B7C0",
        accent="gold", pattern="butis", focus="50% 30%", quality="product", placeholder=98000),
    "scarlet-royal-bridal-lehenga": dict(
        silhouette="lehenga", families=["Red", "Gold"], base="#B1261D", second="#B1261D",
        accent="gold", pattern="zari-border", focus="50% 35%", quality="product", placeholder=145000),
    "nazaakat-beige-pink-lehenga": dict(
        silhouette="lehenga", families=["Pink", "Ivory & Beige"], base="#E4C6B8", second="#EBD5C9",
        accent="gold", pattern="zari-border", fit="cover", focus="50% 50%", quality="product", placeholder=118000,
        image_text="नज़ाकत — Zari and zardozi embroidery",
        flags=["The product image is a text card (“नज़ाकत — Zari and zardozi embroidery”); there is no photograph of the garment. Colours come from the name and copy only. A real photo is needed."]),
    "twirl-couture-lehenga": dict(
        silhouette="lehenga", families=["Ivory & Beige", "Gold"], base="#EFE3CC", second="#EFE3CC",
        accent="gold", pattern="butis", focus="50% 40%", quality="product", placeholder=86000),
    "pastel-dreams-d-day-lehenga": dict(
        silhouette="lehenga", families=["Ivory & Beige", "Red", "Gold"], base="#EAD9B4", second="#B5202A",
        accent="gold", pattern="zari-border", focus="50% 35%", quality="product", placeholder=79000),
    "fiery-red-bridal-ensemble": dict(
        silhouette="lehenga", families=["Red", "Gold"], base="#B1261D", second="#B1261D",
        accent="gold", pattern="zari-border", focus="50% 35%", quality="product", placeholder=108000,
        flags=["The image is a horizontally mirrored copy of the Scarlet Royal Bridal Lehenga photo — likely the same garment listed twice. Needs its own photo or removal."]),
    "white-beaded-grace-ensemble": dict(
        silhouette="lehenga", families=["White"], base="#F1EFEC", second="#F1EFEC",
        accent="pearl", pattern="beads", focus="50% 35%", quality="product", placeholder=72000),
    "contemporary-pastel-bride": dict(
        silhouette="lehenga", families=["Ivory & Beige", "Red"], base="#ECE2CD", second="#B32A2E",
        accent="gold", pattern="zari-border", focus="50% 35%", quality="product", placeholder=92000),
    "scarlet-sonnet-lehenga": dict(
        silhouette="lehenga", families=["Pink", "Ivory & Beige"], base="#DF437A", second="#EDE0C8",
        accent="gold", pattern="zari-border", focus="50% 35%", quality="caption", placeholder=68000,
        flags=["Name says “Scarlet”; the photo shows a pink dupatta over an ivory lehenga."]),
    "maroon-ode-lehenga": dict(
        silhouette="lehenga", families=["Red", "Ivory & Beige"], base="#EDE3CF", second="#B32A30",
        accent="gold", pattern="zari-border", focus="50% 35%", quality="caption", placeholder=64000),
    "coral-elan-lehenga": dict(
        silhouette="lehenga", families=["Pink", "Ivory & Beige"], base="#EDE3CF", second="#E24F86",
        accent="gold", pattern="zari-border", focus="50% 35%", quality="product", placeholder=66000),
    "scarlet-mirage-ensemble": dict(
        silhouette="gown", families=["Ivory & Beige", "Blush & Peach"], base="#D8BFA3", second="#D8BFA3",
        accent="gold", pattern="butis", crop=(0.03, 0.03, 0.97, 0.705), focus="50% 30%", quality="caption", placeholder=58000,
        flags=["Name says “Scarlet”; the photo shows three champagne/beige outfits — unclear which one is the product.",
               "Original image carries promo text (“Find Your Unique at Aarchis!”) — cropped out."]),
    "ivory-reign-lehenga": dict(
        silhouette="lehenga", families=["Ivory & Beige"], base="#EEE6D4", second="#EEE6D4",
        accent="gold", pattern="chikan", fit="cover", focus="50% 50%", quality="caption", placeholder=74000,
        image_text="Aarchi's by Archana Soni Presents — An exquisite pure organza lehenga choli, crafted with hand-embroidery.",
        flags=["The product image is a text card; there is no photograph of the garment. Colour comes from the name only. A real photo is needed.",
               "The best product copy for this piece is baked into the image (“pure organza lehenga choli, crafted with hand-embroidery”) — shown on the product page as the description."]),
    "blush-petal-lehenga": dict(
        silhouette="lehenga", families=["Blush & Peach"], base="#D9B99D", second="#D9B99D",
        accent="gold", pattern="butis", crop=(0.36, 0.04, 0.975, 0.975), focus="60% 50%", quality="fragment", placeholder=56000,
        flags=["Live copy is a broken caption fragment (“…with aarchis✨👗 .byarchanasoni”) — not shown on the product page.",
               "Photo shows three women in three outfits; assumed the seated blush lehenga is the product."]),
    "emerald-ember-lehenga": dict(
        silhouette="lehenga", families=["Pink"], base="#E7607A", second="#23A3A3",
        accent="gold", pattern="zari-border", crop=(0.40, 0.12, 0.93, 0.83), focus="50% 40%", quality="caption", placeholder=52000,
        flags=["Name says “Emerald”; the photo is a coral/pink baby-shower couple portrait (same couple as the Men's Ensemble and baby-shower pieces), not an emerald bridal lehenga. Needs the right photo.",
               "Original image carries promo text (“Enhancing Your Inner Beauty”) — cropped out."]),
    "golden-halo-lehenga": dict(
        silhouette="lehenga", families=["Pink", "Multicolour", "Blue"], base="#E9B9C4", second="#A9BCC6",
        accent="gold", pattern="print", crop=(0.40, 0.06, 0.97, 0.975), focus="50% 40%", quality="caption", placeholder=54000,
        flags=["Name says “Golden”; photo shows a floral-print pastel lehenga with a blue blouse and pink dupatta.",
               "Original image carries promo text (“Wear Better, Look Better.”) — cropped out."]),
    "coral-saga-lehenga": dict(
        silhouette="lehenga", families=["Blush & Peach"], base="#E8CAB6", second="#E8CAB6",
        accent="gold", pattern="chikan", crop=(0.53, 0.10, 0.985, 0.975), fit="contain", focus="50% 40%", quality="fragment", placeholder=49000,
        flags=["Live copy names a different brand (“Elevate your style with Archis Cloths…”) — not shown on the product page. Confirm this piece is Aarchi's.",
               "Original image carries promo text (“Make people fall in love with your clothes”) — cropped out."]),
    "golden-sonnet-lehenga": dict(
        silhouette="lehenga", families=["Blush & Peach"], base="#E6D0C3", second="#E6D0C3",
        accent="silver", pattern="chikan", crop=(0.175, 0.0, 0.585, 0.885), fit="contain", focus="50% 30%", quality="fragment", placeholder=48000,
        flags=["Live copy is a broken caption fragment (“Fashion Queens of , are you ready…” — a hashtag was stripped) — not shown on the product page.",
               "Original image carries “50% DISCOUNT / August offer” and an old phone number (+91 93270 72295) — cropped out. The live site still shows it."]),
    "coral-grace-lehenga": dict(
        silhouette="lehenga", families=["Black", "Red"], base="#171515", second="#171515",
        accent="multi", pattern="floral", focus="50% 35%", quality="caption", placeholder=52000,
        flags=["Name says “Coral”; the photo shows a black blouse embroidered with red roses."]),
    "onyx-soir-e-lehenga": dict(
        silhouette="lehenga", families=["Black", "Red"], base="#141313", second="#141313",
        accent="multi", pattern="floral", focus="50% 45%", quality="caption", placeholder=56000,
        flags=["Slug is “onyx-soir-e” (a transliteration glitch in the live URL). The live 301 map already redirects the old scarlet-soir-e slug; this one is kept so the URL matches."]),
    "emerald-ember-ensemble": dict(
        silhouette="gown", families=["Purple"], base="#6B2B8F", second="#6B2B8F",
        accent="gold", pattern="butis", focus="50% 30%", quality="caption", placeholder=45000,
        flags=["Name says “Emerald”; the photo shows a violet-purple ensemble."]),

    # ── Ethnic & festive ─────────────────────────────────────────────────
    "sangeet-special-anarkali": dict(
        silhouette="anarkali", families=["Orange & Coral", "Blush & Peach"], base="#EE8657", second="#EE8657",
        accent="gold", pattern="zari-border", focus="50% 45%", quality="product", placeholder=34000),
    "multicoloured-patchwork-dress": dict(
        silhouette="gown", families=["Multicolour"], base="#8FC3A6", second="#E7669A",
        accent="multi", pattern="patchwork", focus="50% 35%", quality="product", placeholder=29000),
    "scarlet-grace-anarkali": dict(
        silhouette="anarkali", families=["Red"], base="#B3171E", second="#F1ECE6",
        accent="gold", pattern="patola", focus="50% 40%", quality="product", placeholder=38000),
    "scarlet-soiree-ensemble": dict(
        silhouette="anarkali", families=["Red", "White"], base="#A21E1E", second="#EFEAE6",
        accent="gold", pattern="patola", crop=(0.13, 0.07, 0.86, 0.91), focus="50% 40%", quality="caption", placeholder=32000),
    "rose-aria-ensemble": dict(
        silhouette="menswear", families=["Green", "Orange & Coral"], base="#9FAE92", second="#E77A5E",
        accent="gold", pattern="jacquard", focus="45% 35%", quality="fragment", placeholder=26000,
        flags=["Live copy is someone else's caption with the designer credits stripped (“3 sets 3 outfits Outfit 1 & 2 By: Outfit 3 By: Styled by:”) — not shown. The attribution is unclear: confirm this outfit is Aarchi's before selling it.",
               "The photo is a men's jacket-and-kurta look, but the live site files it under Ethnic & Festive (women's) as an “Ensemble”."]),
    "sapphire-bahaar-ensemble": dict(
        silhouette="gown", families=["Red", "Orange & Coral"], base="#A6432E", second="#A6432E",
        accent="gold", pattern="plain", crop=(0.49, 0.0, 0.935, 0.745), fit="contain", focus="50% 40%", quality="caption", placeholder=21000,
        flags=["Name says “Sapphire”; the photo shows a rust-red draped gown.",
               "Original image carries an old phone number (+91 93270 72295) — cropped out. The live site still shows it."]),
    "scarlet-muse-ensemble": dict(
        silhouette="anarkali", families=["Grey", "Green"], base="#7D7F6D", second="#7D7F6D",
        accent="multi", pattern="butis", crop=(0.175, 0.0, 0.585, 0.885), fit="contain", focus="50% 30%", quality="caption", placeholder=19500,
        flags=["Name says “Scarlet”; the photo shows a grey-olive anarkali.",
               "Original image carries “50% DISCOUNT” and an old phone number (+91 93270 72295) — cropped out. The live site still shows it."]),
    "rose-whisper-ensemble": dict(
        silhouette="kurta", families=["Blue", "White", "Multicolour"], base="#2B3655", second="#F2EFEA",
        accent="multi", pattern="gamthi", crop=(0.175, 0.0, 0.585, 0.885), fit="contain", focus="50% 30%", quality="caption", placeholder=18500,
        flags=["Name says “Rose”; the photo shows a navy jacket over a white kurta with a multicolour border.",
               "Original image carries “50% DISCOUNT” and an old phone number (+91 93270 72295) — cropped out. The live site still shows it."]),
    "scarlet-grace-ensemble": dict(
        silhouette="anarkali", families=["Green", "Black"], base="#9C9C60", second="#2B2A24",
        accent="gold", pattern="jacquard", crop=(0.12, 0.30, 0.46, 0.985), fit="contain", focus="50% 30%", quality="caption", placeholder=17500,
        flags=["Name says “Scarlet”; the photo shows an olive-green anarkali with a charcoal dupatta.",
               "Original image carries promo text and an old phone number (+91 93270 72295) — cropped out. The live site still shows it."]),
    "lavender-verve-dress": dict(
        silhouette="kurta", families=["Pink", "Purple"], base="#C7246C", second="#C7246C",
        accent="silver", pattern="floral", crop=(0.03, 0.03, 0.60, 0.82), focus="50% 30%", quality="caption", placeholder=16500,
        flags=["Name says “Lavender”; the photo shows a magenta floral-embroidered kurta dress.",
               "Original image carries a logo lock-up and “Casual Cool” text — cropped out."]),

    # ── Men's ethnic ─────────────────────────────────────────────────────
    "coral-turquoise-men-s-ensemble": dict(
        silhouette="menswear", families=["Pink", "Blue"], base="#E6636B", second="#1FA2A0",
        accent="silver", pattern="jacquard", focus="50% 35%", quality="product", placeholder=42000),

    # ── Baby shower & maternity ──────────────────────────────────────────
    "motherhood-baby-shower-ensemble": dict(
        silhouette="maternity", families=["Pink", "Blue"], base="#1E9E9F", second="#E86B89",
        accent="gold", pattern="print", focus="50% 40%", quality="product", placeholder=26000),
    "blossom-baby-shower-outfit": dict(
        silhouette="maternity", families=["Pink", "Blue"], base="#E86B89", second="#1E9E9F",
        accent="gold", pattern="print", focus="35% 40%", quality="product", placeholder=22000,
        flags=["Photo is a couple portrait; the outfit is the mum-to-be's."]),

    # ── Dress material (unstitched) ──────────────────────────────────────
    "noir-vine-embroidered-silk-suit": dict(
        silhouette="suit", families=["Black", "Gold", "Multicolour"], base="#131212", second="#131212",
        accent="gold", pattern="vine", focus="50% 60%", quality="product"),
    "mahogany-stag-jacquard-silk-suit": dict(
        silhouette="suit", families=["Brown", "Gold"], base="#3F2A22", second="#3F2A22",
        accent="gold", pattern="jacquard", focus="50% 60%", quality="product"),
    "magenta-zari-stripe-silk-suit": dict(
        silhouette="suit", families=["Pink", "Purple"], base="#AE106C", second="#B9A9C9",
        accent="silver", pattern="stripes", focus="50% 60%", quality="product"),
    "olive-floral-jaal-silk-suit": dict(
        silhouette="suit", families=["Green"], base="#8E9C2B", second="#8E9C2B",
        accent="silver", pattern="jaal", focus="50% 60%", quality="product"),
    "ice-blue-floral-jaal-silk-suit": dict(
        silhouette="suit", families=["Blue"], base="#A8BECF", second="#A8BECF",
        accent="gold", pattern="jaal", focus="50% 60%", quality="product"),
}

# Fabric only where the REAL text (live copy, story, or image text) names it.
FABRIC = {
    "linen-silk-gamthi-saree": ("Linen silk", "live copy"),
    "beige-mirage-saree": ("Linen silk", "live copy"),
    "silk-saree-ethnic-set": ("Silk", "live copy"),
    "sunset-bandhani-ombre-dupatta": ("Silk", "live story copy (“sheer silk”)"),
    "scarlet-pearl-petal-dupatta": ("Net", "live copy"),
    "ivory-reign-lehenga": ("Organza", "text in the product image"),
    "noir-vine-embroidered-silk-suit": ("Pure silk", "live copy"),
    "mahogany-stag-jacquard-silk-suit": ("Pure silk", "live copy"),
    "magenta-zari-stripe-silk-suit": ("Pure silk", "live copy"),
    "olive-floral-jaal-silk-suit": ("Pure silk", "live copy"),
    "ice-blue-floral-jaal-silk-suit": ("Pure silk", "live copy"),
}
