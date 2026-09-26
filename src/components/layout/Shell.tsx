import { Suspense, useEffect, useRef } from 'react'
import { Link, Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { AnnouncementBar, Header } from './Header'
import { MobileNav } from './MobileNav'
import { SearchOverlay } from './SearchOverlay'
import { CartDrawer } from './CartDrawer'
import { Footer } from './Footer'
import { Concierge } from './Concierge'
import { QuickView } from '../product/Rails'
import { Logo } from '../brand/Logo'
import { Icon } from '../ui/Icon'
import { PageLoader, Toaster } from '../ui/Kit'
import { scrollToTop } from '../../lib/scroll'
import { useUi } from '../../store/ui'
import { rehydrateStores } from '../../store/rehydrate'

/** New pages start at the top; back/forward returns to where you were. */
function useScrollMemory() {
  const loc = useLocation()
  const type = useNavigationType()
  const positions = useRef(new Map<string, number>())
  useEffect(() => {
    const save = () => positions.current.set(loc.key, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [loc.key])
  useEffect(() => {
    if (loc.hash) {
      const el = document.getElementById(decodeURIComponent(loc.hash.slice(1)))
      if (el) { setTimeout(() => el.scrollIntoView(), 60); return }
    }
    if (type === 'POP') requestAnimationFrame(() => window.scrollTo(0, positions.current.get(loc.key) ?? 0))
    else scrollToTop(true)
  }, [loc.pathname, loc.key, loc.hash, type])
}

function CheckoutHeader() {
  return (
    <header className="co-hdr">
      <div className="container co-hdr-in">
        <Link to="/bag" className="co-hdr-back" aria-label="Back to bag"><Icon name="arrowL" size={16} /> <span className="hidden sm:inline" aria-hidden="true">Back to bag</span></Link>
        <Link to="/" className="co-hdr-logo"><Logo compact /></Link>
        <span className="co-hdr-secure"><Icon name="shield" size={16} /> <span className="hidden sm:inline">Secure reservation</span></span>
      </div>
    </header>
  )
}

export function Shell() {
  const { pathname } = useLocation()
  const setBag = useUi((s) => s.setBag)
  const setHydrated = useUi((s) => s.setHydrated)
  const focused = pathname.startsWith('/checkout')
  useEffect(() => { rehydrateStores().then(setHydrated) }, [setHydrated])
  useEffect(() => { setBag(false) }, [pathname, setBag])
  useScrollMemory()

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      {focused ? <CheckoutHeader /> : <><AnnouncementBar /><Header /></>}
      <main id="main" className="main" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      {!focused && <Footer />}
      <MobileNav />
      <SearchOverlay />
      <CartDrawer />
      <QuickView />
      {!focused && <Concierge />}
      <Toaster />
    </>
  )
}
