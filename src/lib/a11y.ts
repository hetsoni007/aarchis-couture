import { useEffect, type RefObject } from 'react'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Trap Tab inside `ref` while `active`; restore focus to the opener on close. */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onEscape?: () => void) {
  useEffect(() => {
    if (!active) return
    const root = ref.current
    if (!root) return
    const opener = document.activeElement as HTMLElement | null
    const first = () => root.querySelectorAll<HTMLElement>(FOCUSABLE)[0]
    const t = setTimeout(() => (root.querySelector<HTMLElement>('[data-autofocus]') ?? first() ?? root).focus({ preventScroll: true }), 40)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onEscape?.(); return }
      if (e.key !== 'Tab') return
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement)
      if (!items.length) return
      const a = items[0], z = items[items.length - 1]
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey, true)
      opener?.focus?.({ preventScroll: true })
    }
  }, [active, ref, onEscape])
}
