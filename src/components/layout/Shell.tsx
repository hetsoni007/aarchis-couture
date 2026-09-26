import { Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { Nav } from './Nav'
import { MobileMenu } from './MobileMenu'
import { MiniBag } from './MiniBag'
import { Footer } from './Footer'
import { Cursor, WeftCurtain, Concierge } from './Interactions'
import { Toaster } from '../ui/Kit'
import { BrandDefs } from '../brand/Monogram'
import { PageLoader } from '../brand/Motifs'
import { scrollToTop, getLenis, routeSettled } from '../../lib/scroll'
import { detectDevice } from '../../lib/device'
import { useUi } from '../../store/ui'
import { rehydrateStores } from '../../store/rehydrate'

/** Remembers scroll per history entry; new pages start at the top. */
function useScrollMemory() {
  const loc = useLocation()
  const type = useNavigationType()
  const positions = useRef(new Map<string, number>())
  useEffect(() => {
    const key = loc.key
    const save = () => positions.current.set(key, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [loc.key])
  useEffect(() => {
    if (loc.hash) {
      const el = document.getElementById(decodeURIComponent(loc.hash.slice(1)))
      if (el) { setTimeout(() => (getLenis() ? getLenis()!.scrollTo(el, { offset: -90 }) : el.scrollIntoView()), 60); return }
    }
    if (type === 'POP') {
      const y = positions.current.get(loc.key) ?? 0
      requestAnimationFrame(() => (getLenis() ? getLenis()!.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)))
    } else scrollToTop(true)
    // pages change height: re-measure every ScrollTrigger after the new route paints
    const t = setTimeout(routeSettled, 120)
    return () => clearTimeout(t)
  }, [loc.pathname, loc.key, loc.hash, type])
}

export function Shell() {
  const { pathname } = useLocation()
  const setBag = useUi((s) => s.setBag)
  const setHydrated = useUi((s) => s.setHydrated)
  useEffect(() => { rehydrateStores().then(setHydrated) }, [setHydrated])
  useEffect(() => {
    // inertia scroll is a desktop nicety: load the motion stack after first paint, never on touch
    const d = detectDevice()
    if (!d.finePointer || d.reducedMotion) return
    const start = () => import('../../lib/motion').then((m) => m.startSmoothScroll())
    if (document.readyState === 'complete') setTimeout(start, 300)
    else window.addEventListener('load', () => setTimeout(start, 300), { once: true })
  }, [])
  useEffect(() => { setBag(false) }, [pathname, setBag])
  useScrollMemory()

  return (
    <>
      <BrandDefs />
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      <main id="main" className="main" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <MobileMenu />
      <MiniBag />
      <Concierge />
      <Toaster />
      <WeftCurtain />
      <Cursor />
    </>
  )
}
