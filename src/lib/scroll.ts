/** Native scrolling only — a storefront should feel instant and predictable. */
export function lockScroll(locked: boolean) {
  const el = document.documentElement
  if (locked) {
    // keep the page from shifting when the scrollbar disappears
    el.style.setProperty('--scrollbar', `${window.innerWidth - el.clientWidth}px`)
    el.style.overflow = 'hidden'
    el.style.paddingRight = 'var(--scrollbar)'
  } else {
    el.style.overflow = ''
    el.style.paddingRight = ''
  }
}
export function scrollToTop(immediate = true) {
  window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' })
}
