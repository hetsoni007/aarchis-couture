/**
 * The heavy motion stack (GSAP + ScrollTrigger + Lenis). Never imported statically by the shell:
 * desktop loads it after first paint for inertia scroll; pages that pin (home) import it on demand.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { detectDevice } from './device'
import { getLenis, setLenis, onRouteSettled } from './scroll'

gsap.registerPlugin(ScrollTrigger)
gsap.defaults({ ease: 'expo.out', duration: 0.9 })
onRouteSettled(() => ScrollTrigger.refresh())

export { gsap, ScrollTrigger }

/** Inertia scroll on desktop only — never on touch, never under reduced motion. */
export function startSmoothScroll() {
  const d = detectDevice()
  if (getLenis() || d.reducedMotion || !d.finePointer) return null
  const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  setLenis(lenis)
  return lenis
}
