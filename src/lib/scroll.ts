import type Lenis from 'lenis'

/** Scroll state shared by everything — deliberately free of gsap/lenis runtime imports so it
 *  stays in the critical bundle for pennies. lib/motion.ts registers Lenis here on desktop. */
let lenis: Lenis | null = null
const settleHooks = new Set<() => void>()

export const setLenis = (l: Lenis | null) => { lenis = l }
export const getLenis = () => lenis
export function lockScroll(locked: boolean) {
  if (lenis) (locked ? lenis.stop() : lenis.start())
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
export function scrollToTop(immediate = true) {
  if (lenis) lenis.scrollTo(0, { immediate, force: true })
  else window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' })
}
/** Motion code subscribes to route changes (e.g. ScrollTrigger.refresh) without the shell importing it. */
export const onRouteSettled = (fn: () => void) => { settleHooks.add(fn); return () => { settleHooks.delete(fn) } }
export const routeSettled = () => settleHooks.forEach((f) => f())
