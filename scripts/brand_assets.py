"""Storefront brand assets: favicon.svg, app icons, apple-touch-icon and the 1200×630 share image.

Built from the self-hosted fonts (Cormorant Garamond, Inter) and the studio's own campaign photographs,
so the identity outside the page matches the page.  Run: python3 scripts/brand_assets.py
"""
from io import BytesIO
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / 'public'
INK, WHITE, IVORY, MUTED, GOLD = '#141414', '#ffffff', '#f7f3ed', '#6b665f', '#7c6133'


def static_font(woff2: str, wght: int) -> TTFont:
    f = TTFont(PUB / 'fonts' / woff2)
    f.flavor = None
    return instantiateVariableFont(f, {'wght': wght})


def pil_font(tt: TTFont, size: int) -> ImageFont.FreeTypeFont:
    buf = BytesIO()
    tt.save(buf)
    buf.seek(0)
    return ImageFont.truetype(buf, size)


cormorant = static_font('cormorant-garamond-latin-wght-normal.woff2', 600)
cormorant_md = static_font('cormorant-garamond-latin-wght-normal.woff2', 500)
inter = static_font('inter-latin-wght-normal.woff2', 500)

# ── favicon: a Cormorant "A" on ink, as an outline path (no font needed to render it) ──
glyphs = cormorant.getGlyphSet()
cmap = cormorant.getBestCmap()
name = cmap[ord('A')]
upm = cormorant['head'].unitsPerEm
bounds = glyphs[name]
pen = SVGPathPen(glyphs)
# scale the glyph to ~40 of 64 units tall and centre it
from fontTools.pens.boundsPen import BoundsPen
bp = BoundsPen(glyphs)
glyphs[name].draw(bp)
x0, y0, x1, y1 = bp.bounds
s = 40 / (y1 - y0)
tx = 32 - (x0 + x1) / 2 * s
ty = 32 + (y0 + y1) / 2 * s
glyphs[name].draw(TransformPen(pen, (s, 0, 0, -s, tx, ty)))
import re
path = re.sub(r'-?\d+\.\d+', lambda m: f'{float(m.group()):.2f}'.rstrip('0').rstrip('.'), pen.getCommands())
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="{INK}"/>
  <path d="{path}" fill="{WHITE}"/>
</svg>
'''
(PUB / 'favicon.svg').write_text(svg)

# raster icons: the same mark, drawn with the font at size
def icon(size: int, pad_ratio: float = 0.0, radius: bool = False) -> Image.Image:
    im = Image.new('RGB', (size, size), INK)
    d = ImageDraw.Draw(im)
    f = pil_font(cormorant, int(size * 0.72 * (1 - pad_ratio)))
    l, t, r, b = d.textbbox((0, 0), 'A', font=f)
    d.text(((size - (r - l)) / 2 - l, (size - (b - t)) / 2 - t), 'A', font=f, fill=WHITE)
    return im


icon(512, 0.18).save(PUB / 'icon-512.png', optimize=True)  # maskable-safe padding
icon(192, 0.18).save(PUB / 'icon-192.png', optimize=True)
icon(180, 0.1).save(PUB / 'apple-touch-icon.png', optimize=True)

# ── share image (1200×630): wordmark + the studio's line on white, a campaign triptych on the right ──
W, H = 1200, 630
og = Image.new('RGB', (W, H), WHITE)
d = ImageDraw.Draw(og)

photos = ['blush-courtyard', 'grace-jharokha', 'pastel-palace']
src = PUB / 'img' / 'e'
pw, gap, x = 180, 8, W - 3 * 180 - 2 * 8 - 48
for i, n in enumerate(photos):
    p = Image.open(src / f'{n}-560.webp').convert('RGB')
    ph = H - 96  # fill the column height, then centre-crop the width
    p = p.resize((round(p.width * ph / p.height), ph), Image.LANCZOS)
    left = (p.width - pw) // 2
    p = p.crop((left, 0, left + pw, ph))
    og.paste(p, (x + i * (pw + gap), 48))


def tracked(draw, xy, text, font, fill, tracking):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


tracked(d, (64, 64), 'AARCHI’S', pil_font(cormorant, 44), INK, 9)
tracked(d, (66, 120), 'BY ARCHANA SONI', pil_font(inter, 13), MUTED, 4.2)
h1 = pil_font(cormorant_md, 76)
d.text((62, 238), 'Where Tradition', font=h1, fill=INK)
d.text((62, 318), 'Meets Trend', font=h1, fill=INK)
tracked(d, (66, 452), 'BRIDAL & FESTIVE COUTURE', pil_font(inter, 14), GOLD, 2.6)
d.text((66, 478), 'Made to measure in Ahmedabad · Shipped worldwide', font=pil_font(inter, 18), fill=MUTED)
d.line((66, 540, 146, 540), fill=INK, width=1)
og.save(PUB / 'og.jpg', quality=86, optimize=True, progressive=True)
print('brand assets written')
