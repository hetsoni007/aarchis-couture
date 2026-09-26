import { useLayoutEffect, type RefObject } from 'react'
import { detectDevice } from './device'

/**
 * Staggered reveals for any [data-reveal] inside `scope`.
 * data-reveal="" (rise) | "fade" | "left" | "right" | "mask" (clip wipe for images)
 * IntersectionObserver adds `.is-in`; CSS transitions do the motion on the compositor, so
 * content can never get stuck invisible if rAF is throttled (background tabs, headless, low power).
 */
export function useReveals(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'))
    if (detectDevice().reducedMotion || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver((entries) => {
      let i = 0
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const el = e.target as HTMLElement
        el.style.setProperty('--rd', `${Math.min(i++, 6) * 80}ms`)
        el.classList.add('is-in')
        io.unobserve(el)
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
