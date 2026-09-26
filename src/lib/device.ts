import { useEffect, useState, useSyncExternalStore } from 'react'

export type Tier = 'high' | 'mid' | 'low' | 'none'
export interface Device {
  tier: Tier
  reducedMotion: boolean
  finePointer: boolean
  touch: boolean
  webgl: boolean
  saveData: boolean
  /** particle / segment budgets per tier — DESIGN.md §6 */
  budget: { particles: number; clothX: number; clothY: number; dpr: [number, number] }
}

const BUDGETS: Record<Tier, Device['budget']> = {
  high: { particles: 1400, clothX: 180, clothY: 120, dpr: [1, 2] },
  mid: { particles: 500, clothX: 110, clothY: 72, dpr: [1, 1.5] },
  low: { particles: 160, clothX: 64, clothY: 40, dpr: [1, 1] },
  none: { particles: 0, clothX: 0, clothY: 0, dpr: [1, 1] },
}

function probeWebGL(): { ok: boolean; renderer: string; maxTex: number } {
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return { ok: false, renderer: '', maxTex: 0 }
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
    const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return { ok: true, renderer, maxTex }
  } catch {
    return { ok: false, renderer: '', maxTex: 0 }
  }
}

let cached: Device | null = null

/** What the server (and the first hydration render) assumes: no WebGL, no motion rig. */
export const SERVER_DEVICE: Device = { tier: 'none', reducedMotion: false, finePointer: false, touch: false, webgl: false, saveData: false, budget: BUDGETS.none }

export function detectDevice(): Device {
  if (typeof window === 'undefined') return SERVER_DEVICE
  if (cached) return cached
  const mm = (q: string) => typeof matchMedia !== 'undefined' && matchMedia(q).matches
  const reducedMotion = mm('(prefers-reduced-motion: reduce)')
  const finePointer = mm('(hover: hover) and (pointer: fine)')
  const coarse = mm('(pointer: coarse)')
  const touch = coarse || (navigator.maxTouchPoints ?? 0) > 0
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const saveData = !!nav.connection?.saveData
  const cores = nav.hardwareConcurrency ?? 4
  const mem = nav.deviceMemory ?? 4
  const gl = probeWebGL()
  const software = /swiftshader|llvmpipe|software|basic render/i.test(gl.renderer)
  const smallScreen = Math.min(screen.width, screen.height) < 500

  let tier: Tier
  if (!gl.ok || software || reducedMotion) tier = 'none'
  else if (saveData || cores <= 2 || mem <= 2 || gl.maxTex < 4096) tier = 'low'
  else if (smallScreen || coarse) tier = mem >= 6 && cores >= 8 ? 'mid' : 'low'
  else if (cores >= 8 && mem >= 8) tier = 'high'
  else tier = 'mid'

  // manual override for testing: ?tier=high|mid|low|none
  const forced = new URLSearchParams(location.search).get('tier') as Tier | null
  if (forced && forced in BUDGETS) tier = forced
  const webgl = gl.ok && !software && forced !== 'none'

  cached = { tier, reducedMotion, finePointer, touch, webgl, saveData, budget: BUDGETS[tier === 'none' ? 'low' : tier] }
  document.documentElement.dataset.tier = tier
  return cached
}

const noop = () => () => {}
/** Server snapshot during hydration, the real device right after — no hydration mismatch. */
export const useDevice = () => useSyncExternalStore(noop, detectDevice, () => SERVER_DEVICE)

/** live media query hook (orientation, breakpoints) */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => matchMedia(query).matches,
    () => false,
  )
}

/**
 * True once the page has loaded and the main thread has gone quiet. 3D scenes wait for this,
 * so first paint and first input never compete with three.js parsing or shader compilation;
 * the art-directed poster covers the gap. Phones wait a little longer than desktops.
 */
export function useIdleReady(extraMs?: number) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const d = detectDevice()
    const extra = extraMs ?? (d.tier === 'high' ? 0 : 7000)
    let t = 0, idle = 0
    // on phones and mid/low tiers, the first touch, scroll or key press wakes the scene early
    const wake = () => setReady(true)
    const gestures = ['pointerdown', 'touchstart', 'keydown', 'wheel'] as const
    if (d.tier !== 'high') gestures.forEach((g) => window.addEventListener(g, wake, { once: true, passive: true }))
    const go = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
      const after = () => { t = window.setTimeout(() => setReady(true), extra) }
      if (ric) idle = ric(after, { timeout: 2500 }); else after()
    }
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true })
    return () => { clearTimeout(t); (window as Window & { cancelIdleCallback?: (n: number) => void }).cancelIdleCallback?.(idle); window.removeEventListener('load', go); gestures.forEach((g) => window.removeEventListener(g, wake)) }
  }, [extraMs])
  return ready
}
