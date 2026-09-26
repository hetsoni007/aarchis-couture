#!/usr/bin/env python3
"""
Responsive image pipeline.

Source: ~/Projects/Aarchis/assets/img (the live site's own images).
Output: public/img/{p,e,s}/<name>-<width>.{avif,webp}  +  src/data/images.json

  p/  product photos   — cropped per scripts/curation.py, widths 360/640/960
  e/  editorial slides — widths 360/560
  s/  site imagery     — founder portrait, category covers, story strip

images.json carries each image's post-crop aspect ratio (so every <img> can
reserve its box — no layout shift), the widths that exist, and a `tone`
(mean colour) used as the skeleton colour while the file loads.

Run: python3 scripts/build_images.py
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageStat

sys.path.insert(0, str(Path(__file__).parent))
from curation import C  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC = Path.home() / "Projects/Aarchis/assets/img"
OUT = ROOT / "public" / "img"

JOBS = []
for slug, cur in C.items():
    JOBS.append(("p", slug, SRC / "designs" / f"{slug}.webp", cur.get("crop"), (360, 640, 800, 1080)))
for f in sorted((SRC / "editorial").glob("*.webp")):
    JOBS.append(("e", f.stem, f, None, (360, 560)))
# founder portrait: the source carries a baked-in title card ("ARCHANA SONI · FOUNDER …") — keep the portrait only
JOBS.append(("s", "founder-portrait", SRC / "founder-archana.webp", (0.14, 0.0, 0.92, 0.6), (480, 960)))
for name in ["founder-archana", "story-lehenga", "bridal-lehengas", "sarees", "ethnic-festive",
             "mens-ethnic", "baby-shower", "custom-couture"]:
    JOBS.append(("s", name, SRC / f"{name}.webp", None, (480, 960)))


def tone(im: Image.Image) -> str:
    r, g, b = (int(v) for v in ImageStat.Stat(im.resize((24, 24))).mean[:3])
    return f"#{r:02x}{g:02x}{b:02x}"


def main():
    manifest = {}
    for folder, name, src, crop, widths in JOBS:
        im = Image.open(src).convert("RGB")
        if crop:
            w, h = im.size
            im = im.crop((round(crop[0] * w), round(crop[1] * h), round(crop[2] * w), round(crop[3] * h)))
        (OUT / folder).mkdir(parents=True, exist_ok=True)
        made = []
        for tw in widths:
            tw = min(tw, im.width)  # never upscale; the largest variant is the source's own width
            if tw in made:
                continue
            th = round(im.height * tw / im.width)
            r = im.resize((tw, th), Image.LANCZOS)
            r.save(OUT / folder / f"{name}-{tw}.webp", "WEBP", quality=80, method=6)
            r.save(OUT / folder / f"{name}-{tw}.avif", "AVIF", quality=58, speed=6)
            made.append(tw)
        manifest[f"{folder}/{name}"] = {
            "w": im.width, "h": im.height, "ratio": round(im.width / im.height, 4),
            "widths": made, "tone": tone(im),
        }
        print(f"{folder}/{name:40s} {im.width}x{im.height} -> {made}")
    (ROOT / "src" / "data" / "images.json").write_text(json.dumps(manifest, indent=1) + "\n")
    total = sum(f.stat().st_size for f in OUT.rglob("*") if f.is_file())
    print(f"{len(manifest)} images, {total/1e6:.1f} MB on disk")


if __name__ == "__main__":
    main()
