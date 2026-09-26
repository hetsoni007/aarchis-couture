import type { Accent, Pattern, Product } from './catalog'

/**
 * Procedural textiles, painted in 2D canvas from each product's real colours and named
 * craft. The same painter feeds the 3D garment study (as a texture), the "fabric study"
 * fallback when WebGL is unavailable, and the woven swatch chips.
 *
 *  colour canvas  → the cloth as seen
 *  mr canvas      → G = roughness, B = metalness (zari reads as metal thread)
 */
export interface FabricSpec { base: string; second: string; accent: Accent; pattern: Pattern; seed: number }

export const specOf = (p: Product): FabricSpec => ({
  base: p.derived.base, second: p.derived.second, accent: p.derived.accent, pattern: p.derived.pattern,
  seed: Array.from(p.slug).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7),
})

const ACCENT: Record<Accent, string> = { gold: '#d2b067', silver: '#cfd3db', pearl: '#f3eee4', multi: '#d9b25e' }
const MULTI = ['#d42a6c', '#e4691e', '#1f9e9f', '#6b2b8f', '#d9982a', '#2b4e7a', '#6f7e34']

function rng(seed: number) {
  let s = seed || 1
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt))
  const b = Math.max(0, Math.min(255, (n & 255) + amt))
  return `rgb(${r},${g},${b})`
}
const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (0.3 * ((n >> 16) & 255) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255 }

export function paintFabric(spec: FabricSpec, size = 1024) {
  const col = document.createElement('canvas')
  const mr = document.createElement('canvas')
  col.width = col.height = mr.width = mr.height = size
  const c = col.getContext('2d')!
  const m = mr.getContext('2d')!
  const R = rng(spec.seed)
  const S = size
  const acc = ACCENT[spec.accent]
  const dark = lum(spec.base) < 0.35

  // metal/rough base: matte cloth
  m.fillStyle = 'rgb(0,205,0)'; m.fillRect(0, 0, S, S)
  const metal = (draw: (ctx: CanvasRenderingContext2D) => void, strength = 1) => {
    m.save(); m.globalAlpha = strength; m.fillStyle = 'rgb(0,95,235)'; m.strokeStyle = 'rgb(0,95,235)'; draw(m); m.restore()
  }
  // paint on both canvases at once: colour + (optionally) metal
  const both = (colour: string, draw: (ctx: CanvasRenderingContext2D) => void, isZari = spec.accent !== 'multi' || colour === acc) => {
    c.save(); c.fillStyle = colour; c.strokeStyle = colour; draw(c); c.restore()
    if (isZari) metal(draw)
  }

  // ── ground ──
  if (spec.pattern === 'bandhani-ombre') {
    const g = c.createLinearGradient(0, S, 0, 0)
    g.addColorStop(0, '#b3121c'); g.addColorStop(0.45, '#e2572e'); g.addColorStop(1, '#e9407a')
    c.fillStyle = g
  } else c.fillStyle = spec.base
  c.fillRect(0, 0, S, S)
  // weave grain: fine warp and weft
  c.globalAlpha = 0.06
  for (let x = 0; x < S; x += 3) { c.fillStyle = x % 6 ? '#000' : '#fff'; c.fillRect(x, 0, 1, S) }
  for (let y = 0; y < S; y += 3) { c.fillStyle = y % 6 ? '#fff' : '#000'; c.fillRect(0, y, S, 1) }
  c.globalAlpha = 1

  const hemH = S * 0.13 // v=0 is the hem in every garment's UVs
  const dotRing = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill() }
  const buti = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    ctx.beginPath()
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; ctx.ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.55, r * 0.3, a, 0, Math.PI * 2) }
    ctx.fill(); dotRing(ctx, x, y, r * 0.35)
  }
  const ogee = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.beginPath(); ctx.moveTo(x, y + h / 2)
    ctx.bezierCurveTo(x + w * 0.2, y + h * 0.25, x + w * 0.35, y + h * 0.18, x + w / 2, y)
    ctx.bezierCurveTo(x + w * 0.65, y + h * 0.18, x + w * 0.8, y + h * 0.25, x + w, y + h / 2)
    ctx.bezierCurveTo(x + w * 0.8, y + h * 0.75, x + w * 0.65, y + h * 0.82, x + w / 2, y + h)
    ctx.bezierCurveTo(x + w * 0.35, y + h * 0.82, x + w * 0.2, y + h * 0.75, x, y + h / 2)
    ctx.stroke()
  }
  const border = (h = hemH, motif = true) => {
    both(acc, (ctx) => {
      ctx.fillRect(0, S - h, S, h * 0.72)
      ctx.fillRect(0, S - h - 10, S, 3)
      ctx.fillRect(0, S - h - 22, S, 1.5)
    })
    if (motif) {
      c.save(); c.fillStyle = shade(spec.base, dark ? 20 : -40)
      for (let x = 0; x < S; x += 64) { c.beginPath(); c.moveTo(x, S - h * 0.3); c.lineTo(x + 32, S - h * 0.72 + 6); c.lineTo(x + 64, S - h * 0.3); c.closePath(); c.fill() }
      c.restore()
    }
  }

  switch (spec.pattern) {
    case 'zari-border': {
      for (let y = 26; y < S - hemH * 1.6; y += 46) for (let x = (y / 46) % 2 ? 20 : 43; x < S; x += 46) both(acc, (ctx) => buti(ctx, x + (R() - 0.5) * 6, y + (R() - 0.5) * 6, 3.2))
      border()
      break
    }
    case 'butis': {
      for (let y = 30; y < S - hemH; y += 58) for (let x = (y / 58) % 2 ? 30 : 60; x < S; x += 60) both(acc, (ctx) => buti(ctx, x + R() * 4, y, 4))
      border(hemH * 0.7, false)
      break
    }
    case 'bandhani-ombre':
    case 'gharchola': {
      if (spec.pattern === 'gharchola') {
        both(acc, (ctx) => { for (let x = 0; x < S; x += 96) ctx.fillRect(x, 0, 5, S - hemH); for (let y = 0; y < S - hemH; y += 96) ctx.fillRect(0, y, S, 5) })
        c.fillStyle = spec.second; c.fillRect(0, S - hemH * 1.35, S, hemH * 1.35)
        both(acc, (ctx) => { ctx.fillRect(0, S - hemH * 1.35, S, 4); ctx.fillRect(0, S - 10, S, 4) })
      }
      c.fillStyle = '#f7ecd6'
      for (let y = 8; y < S - (spec.pattern === 'gharchola' ? hemH * 1.35 : 20); y += 16) for (let x = (y / 16) % 2 ? 8 : 16; x < S; x += 16) {
        if (R() > 0.35) { c.globalAlpha = 0.9; dotRing(c, x + R() * 2, y, 2.2); c.globalAlpha = 0.35; c.beginPath(); c.arc(x, y, 4.6, 0, Math.PI * 2); c.strokeStyle = '#f7ecd6'; c.lineWidth = 0.8; c.stroke() }
      }
      c.globalAlpha = 1
      if (spec.pattern === 'bandhani-ombre') { for (let i = 0; i < 40; i++) both(acc, (ctx) => buti(ctx, R() * S, R() * S * 0.85, 4)); both(acc, (ctx) => ctx.fillRect(0, S - 26, S, 18)) }
      break
    }
    case 'dot-jaal': {
      c.globalAlpha = 0.25; c.strokeStyle = '#fff'
      for (let x = 0; x < S; x += 6) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + S * 0.2, S); c.stroke() }
      c.globalAlpha = 1
      for (let y = 20; y < S - 40; y += 44) for (let x = (y / 44) % 2 ? 22 : 44; x < S; x += 44) {
        for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; both(ACCENT.pearl, (ctx) => dotRing(ctx, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 2.2), true) }
        both(ACCENT.pearl, (ctx) => dotRing(ctx, x, y, 3), true)
      }
      both(ACCENT.gold, (ctx) => { for (let x = 4; x < S; x += 10) dotRing(ctx, x, S - 18, 3.4); ctx.fillRect(0, S - 8, S, 4) })
      break
    }
    case 'jaal': {
      c.lineWidth = 2.2
      both(acc, (ctx) => { ctx.lineWidth = 2.2; for (let y = -40; y < S; y += 90) for (let x = (y / 90) % 2 ? -36 : 0; x < S; x += 72) ogee(ctx, x, y, 72, 90) })
      for (let y = 5; y < S; y += 90) for (let x = 36; x < S; x += 72) both(acc, (ctx) => buti(ctx, x, y + 40, 6))
      break
    }
    case 'jacquard': {
      const tone = shade(spec.base, dark ? 26 : -26)
      c.fillStyle = tone
      for (let y = 18; y < S - hemH; y += 52) for (let x = (y / 52) % 2 ? 18 : 44; x < S; x += 52) {
        c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + 9, y); c.lineTo(x, y + 12); c.lineTo(x - 9, y); c.closePath(); c.fill()
      }
      both(acc, (ctx) => { ctx.fillRect(0, S - hemH * 0.5, S, 3); ctx.fillRect(0, S - hemH * 0.35, S, 3); ctx.fillRect(0, S - hemH * 0.2, S, 3) })
      break
    }
    case 'stripes': {
      for (let x = 0; x < S; x += 34) both(acc, (ctx) => ctx.fillRect(x, 0, 6, S))
      both(acc, (ctx) => ctx.fillRect(0, S - hemH * 0.6, S, hemH * 0.4))
      c.fillStyle = spec.second; c.fillRect(0, S - hemH * 0.45, S, hemH * 0.15)
      break
    }
    case 'vine':
    case 'floral': {
      const flowers = spec.pattern === 'vine' ? 26 : 60
      for (let i = 0; i < flowers; i++) {
        const x = R() * S, y = R() * (S - hemH * 1.5)
        const f = spec.accent === 'multi' || spec.pattern === 'vine' ? MULTI[Math.floor(R() * MULTI.length)] : '#c8233a'
        c.strokeStyle = '#4b7a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 20, y + 30, x + 5, y + 60); c.stroke()
        c.fillStyle = f; buti(c, x, y, 7 + R() * 5)
      }
      if (spec.pattern === 'vine') border(hemH, true)
      break
    }
    case 'beads': {
      for (let i = 0; i < 2600; i++) both(ACCENT.pearl, (ctx) => dotRing(ctx, R() * S, R() * S, 1.2 + R() * 1.4), true)
      border(hemH * 0.6, false)
      break
    }
    case 'chikan': {
      c.strokeStyle = shade(spec.base, 38); c.fillStyle = shade(spec.base, 30); c.lineWidth = 1.4
      for (let y = 30; y < S - 40; y += 70) for (let x = (y / 70) % 2 ? 30 : 65; x < S; x += 70) {
        buti(c, x, y, 7); c.beginPath(); c.arc(x, y + 22, 10, 0, Math.PI); c.stroke()
      }
      both(acc, (ctx) => ctx.fillRect(0, S - 30, S, 10), true)
      break
    }
    case 'print': {
      for (let i = 0; i < 140; i++) { c.fillStyle = MULTI[Math.floor(R() * MULTI.length)]; c.globalAlpha = 0.75; buti(c, R() * S, R() * S, 8 + R() * 12) }
      c.globalAlpha = 1
      border(hemH * 0.8, false)
      break
    }
    case 'patchwork': {
      const cell = 86
      for (let y = 0; y < S; y += cell) for (let x = 0; x < S; x += cell) {
        c.fillStyle = MULTI[Math.floor(R() * MULTI.length)]; c.globalAlpha = 0.85; c.fillRect(x, y, cell, cell)
        c.globalAlpha = 1; c.setLineDash([5, 4]); c.strokeStyle = '#f5ecd8'; c.lineWidth = 1.5; c.strokeRect(x + 5, y + 5, cell - 10, cell - 10); c.setLineDash([])
      }
      break
    }
    case 'patola': {
      for (let y = 0; y < S - hemH; y += 60) for (let x = (y / 60) % 2 ? 0 : 30; x < S; x += 60) {
        c.fillStyle = spec.second; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 18, y + 18); c.lineTo(x, y + 36); c.lineTo(x - 18, y + 18); c.closePath(); c.fill()
        c.fillStyle = '#1f3f22'; dotRing(c, x, y + 18, 4)
      }
      border(hemH, false)
      break
    }
    case 'gamthi': {
      const blocks = ['#c8233a', '#e4a11e', '#1f6b4f', '#2b4e7a', '#6b2b8f']
      for (let x = 0; x < S; x += 70) {
        c.fillStyle = blocks[Math.floor(R() * blocks.length)]; c.fillRect(x, S - hemH * 1.4, 64, hemH * 1.2)
        both(ACCENT.silver, (ctx) => { dotRing(ctx, x + 18, S - hemH * 0.8, 5); dotRing(ctx, x + 46, S - hemH * 0.8, 5) }, true)
      }
      break
    }
    case 'plain':
    default:
      break
  }

  // soft light falloff across folds so flat swatches read as cloth
  const vg = c.createLinearGradient(0, 0, S, 0)
  vg.addColorStop(0, 'rgba(0,0,0,0.05)'); vg.addColorStop(0.5, 'rgba(255,255,255,0.03)'); vg.addColorStop(1, 'rgba(0,0,0,0.05)')
  c.fillStyle = vg; c.fillRect(0, 0, S, S)
  return { colour: col, mr }
}

/** tiny tiling weave for bump — gives the cloth thread relief up close */
export function paintWeaveBump(size = 128) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const c = cv.getContext('2d')!
  const cell = size / 8
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const over = (x + y) % 2
    const g = over ? c.createLinearGradient(x * cell, 0, (x + 1) * cell, 0) : c.createLinearGradient(0, y * cell, 0, (y + 1) * cell)
    g.addColorStop(0, '#333'); g.addColorStop(0.5, '#eee'); g.addColorStop(1, '#333')
    c.fillStyle = g; c.fillRect(x * cell, y * cell, cell, cell)
  }
  return cv
}
