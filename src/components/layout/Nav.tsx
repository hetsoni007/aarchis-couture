import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Wordmark } from '../brand/Wordmark'
import { Icon } from '../ui/Icon'
import { Img } from '../ui/Img'
import { categories, categoryUrl, inCategory, products } from '../../lib/catalog'
import { cx } from '../../lib/format'
import { askStylist } from '../../lib/whatsapp'
import { useUi } from '../../store/ui'
import { useBag, bagCount } from '../../store/bag'
import { useWishlist } from '../../store/wishlist'
import { getLenis } from '../../lib/scroll'
import './layout.css'

/** a representative, photo-clean piece per category for the mega-menu preview */
const COVER: Record<string, string> = {
  bridal: 'scarlet-royal-bridal-lehenga', saree: 'ivory-elegance-saree', dupatta: 'sunset-bandhani-ombre-dupatta',
  dressmaterial: 'noir-vine-embroidered-silk-suit', ethnic: 'scarlet-grace-anarkali', mens: 'coral-turquoise-men-s-ensemble',
  babyshower: 'motherhood-baby-shower-ensemble',
}

export function Nav() {
  const { pathname } = useLocation()
  const setMenu = useUi((s) => s.setMenu)
  const setBag = useUi((s) => s.setBag)
  const bump = useUi((s) => s.bagBump)
  const count = useBag((s) => bagCount(s.items))
  const wish = useWishlist((s) => s.slugs.length)
  const [scrolled, setScrolled] = useState(false)
  const [overNight, setOverNight] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mega, setMega] = useState(false)
  const [preview, setPreview] = useState(categories[0].key)
  const bagRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<number>(0)

  // scrolled / hide-on-scroll-down
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      // pages mark their dark hero with data-nav-night; stay light-on-dark while it is under the bar
      const hero = document.querySelector('[data-nav-night]')
      setOverNight(!!hero && hero.getBoundingClientRect().bottom > 72)
      if (!mega) setHidden(y > 240 && y > last + 2)
      if (y < last - 2) setHidden(false)
      last = y
    }
    onScroll()
    const raf = requestAnimationFrame(onScroll)
    const t = setTimeout(onScroll, 300)
    // lazy routes mount after the nav: look again when <main>'s content changes
    let pending = 0
    const mo = new MutationObserver(() => { cancelAnimationFrame(pending); pending = requestAnimationFrame(onScroll) })
    const main = document.getElementById('main')
    if (main) mo.observe(main, { childList: true, subtree: true })
    const lenis = getLenis()
    if (lenis) lenis.on('scroll', onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { cancelAnimationFrame(raf); cancelAnimationFrame(pending); mo.disconnect(); clearTimeout(t); window.removeEventListener('scroll', onScroll); lenis?.off('scroll', onScroll) }
  }, [mega, pathname])

  useEffect(() => { setMega(false); setHidden(false) }, [pathname])

  // bag bump when something is folded in
  useEffect(() => {
    if (!bump || !bagRef.current) return
    bagRef.current.classList.remove('is-bump')
    void bagRef.current.offsetWidth
    bagRef.current.classList.add('is-bump')
  }, [bump])

  const openMega = () => { clearTimeout(closeTimer.current); setMega(true) }
  const closeMega = () => { closeTimer.current = window.setTimeout(() => setMega(false), 160) }
  const night = overNight && !mega

  return (
    <header className={cx('nav', scrolled && !night && 'is-scrolled', hidden && 'is-hidden', night ? 'night-top' : 'day', mega && 'is-mega')}>
      <div className="nav-bar wrap">
        <button className="nav-burger lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu" aria-haspopup="dialog">
          <span /><span />
        </button>

        <Link to="/" className="nav-brand">
          <Wordmark compact />
        </Link>

        <nav className="nav-links hidden lg:flex" aria-label="Primary">
          <div className="nav-mega-wrap" onMouseEnter={openMega} onMouseLeave={closeMega}>
            <button className={cx('nav-link', (pathname.startsWith('/shop') || pathname.startsWith('/catalogue')) && 'is-active')}
              aria-expanded={mega} aria-controls="mega" onClick={() => setMega((v) => !v)}
              onKeyDown={(e) => { if (e.key === 'Escape') setMega(false) }}>
              Collections <Icon name="chevron" size={14} className={cx('nav-chev', mega && 'is-open')} />
            </button>
          </div>
          <NavLink to="/how-it-works" className="nav-link">How it works</NavLink>
          <NavLink to="/nri-brides" className="nav-link">NRI brides</NavLink>
          <NavLink to="/navratri-outfits-ahmedabad" className="nav-link hidden xl:inline-flex">Navratri edit</NavLink>
          <NavLink to="/about" className="nav-link">The atelier</NavLink>
        </nav>

        <div className="nav-actions">
          <a href={askStylist()} target="_blank" rel="noopener noreferrer" className="nav-stylist hidden xl:inline-flex" data-cursor="Chat">
            <Icon name="whatsapp" size={15} /> Ask a stylist
          </a>
          <Link to="/wishlist" className="nav-ic hidden xs:grid" aria-label={`Wishlist, ${wish} pinned`} data-cursor="Pinned">
            <Icon name="heart" />
            {wish > 0 && <span className="nav-dot" aria-hidden="true" />}
          </Link>
          <Link to="/account" className="nav-ic hidden md:grid" aria-label="Your account" data-cursor="Account"><Icon name="user" /></Link>
          <button ref={bagRef} className="nav-ic nav-bag" onClick={() => setBag(true)} aria-label={`Your bag, ${count} ${count === 1 ? 'piece' : 'pieces'}`} data-bag-target data-cursor="Bag">
            <Icon name="bag" />
            <span className={cx('nav-count num', count > 0 && 'is-on')} aria-hidden="true">{count}</span>
          </button>
        </div>
      </div>

      {/* ── mega menu ── */}
      <div id="mega" className="mega hidden lg:block" onMouseEnter={openMega} onMouseLeave={closeMega} hidden={!mega}>
        <div className="wrap mega-in">
          <ul className="mega-list" role="list">
            {categories.map((c) => (
              <li key={c.key}>
                <Link to={categoryUrl(c)} className={cx('mega-cat', preview === c.key && 'is-on')}
                  onMouseEnter={() => setPreview(c.key)} onFocus={() => setPreview(c.key)} data-cursor="View">
                  <span className="mega-name">{c.label}</span>
                  <span className="mega-count num">{String(inCategory(c.key).length).padStart(2, '0')}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mega-side">
            {categories.filter((c) => c.key === preview).map((c) => (
              <div key={c.key} className="mega-preview">
                <Img folder="p" name={COVER[c.key]} alt="" sizes="260px" ratio={4 / 5} focus="50% 30%" className="mega-img" />
                <div>
                  <p className="eyebrow">{c.label}</p>
                  <p className="mega-intro italic-voice">{c.intro}</p>
                  <Link to={categoryUrl(c)} className="btn btn-ghost btn-sm"><span className="btn-label">Enter the edit</span><Icon name="arrow" size={16} className="btn-ic-r" /></Link>
                </div>
              </div>
            ))}
            <div className="mega-foot">
              <Link to="/shop" className="link-thread">All {products.length} pieces</Link>
              <Link to="/shop?new=1" className="link-thread">New arrivals</Link>
              <Link to="/navratri-outfits-ahmedabad" className="link-thread">The Navratri edit</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
