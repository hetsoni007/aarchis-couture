import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Logo } from '../brand/Logo'
import { Icon } from '../ui/Icon'
import { Img } from '../ui/Img'
import { Price } from '../ui/Kit'
import { categories, categoryUrl, getProduct, productUrl } from '../../lib/catalog'
import { NAV_LABEL, HOUSE_LINKS, OCCASION_COVER, megaFor, occasionsWithCounts } from '../../lib/nav'
import { cx } from '../../lib/format'
import { askStylist } from '../../lib/whatsapp'
import { useUi } from '../../store/ui'
import { useBag, bagCount } from '../../store/bag'
import { useWishlist } from '../../store/wishlist'
import './layout.css'

const MESSAGES = [
  { text: 'Made to measure in Ahmedabad · Shipped worldwide' },
  { text: 'Book a video consultation with Archana', href: askStylist('booking a video consultation') },
  { text: 'Reserve today — no payment until your quote is confirmed', to: '/how-it-works' },
]

export function AnnouncementBar() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 5000)
    return () => clearInterval(t)
  }, [paused])
  const m = MESSAGES[i]
  return (
    <div className="announce" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <button className="announce-nav" onClick={() => setI((i + MESSAGES.length - 1) % MESSAGES.length)} aria-label="Previous message"><Icon name="chevronL" size={14} /></button>
      <p className="announce-msg" key={i}>
        {m.href ? <a href={m.href} target="_blank" rel="noopener noreferrer" className="link-u">{m.text}</a>
          : m.to ? <Link to={m.to} className="link-u">{m.text}</Link> : m.text}
      </p>
      <button className="announce-nav" onClick={() => setI((i + 1) % MESSAGES.length)} aria-label="Next message"><Icon name="chevronR" size={14} /></button>
    </div>
  )
}

type MegaKey = string | null

function CategoryMega({ k }: { k: string }) {
  const c = categories.find((x) => x.key === k)!
  const m = megaFor(c)
  return (
    <div className="mega-grid">
      <div className="mega-col">
        <p className="t-label mega-h">{c.label}</p>
        <ul role="list">
          <li><Link to={m.base} className="mega-link is-strong">Shop all {c.label.toLowerCase()} <span className="t-muted">({c.count})</span></Link></li>
          {m.newCount > 0 && <li><Link to={`${m.base}?new=1`} className="mega-link">New arrivals <span className="t-muted">({m.newCount})</span></Link></li>}
        </ul>
        <p className="mega-intro t-muted">{c.intro}</p>
      </div>
      {m.occasions.length > 1 && (
        <div className="mega-col">
          <p className="t-label mega-h">By occasion</p>
          <ul role="list">{m.occasions.map((o) => <li key={o.label}><Link to={o.to} className="mega-link">{o.label}</Link></li>)}</ul>
        </div>
      )}
      {m.colours.length > 1 && (
        <div className="mega-col">
          <p className="t-label mega-h">By colour</p>
          <ul role="list">{m.colours.map((o) => (
            <li key={o.label}><Link to={o.to} className="mega-link mega-colour"><i style={{ background: o.swatch }} aria-hidden="true" />{o.label}</Link></li>
          ))}</ul>
        </div>
      )}
      <div className="mega-feature">
        {m.featured.map((p) => (
          <Link key={p.slug} to={productUrl(p)} className="mega-card">
            <Img folder="p" name={p.image.file} alt="" sizes="200px" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} />
            <span className="mega-card-name">{p.name}</span>
            <Price inr={p.price.inr} className="t-small" />
          </Link>
        ))}
      </div>
    </div>
  )
}

function OccasionMega() {
  return (
    <div className="mega-occ">
      {occasionsWithCounts().map(({ value, count }) => {
        const p = getProduct(OCCASION_COVER[value])
        return (
          <Link key={value} to={`/shop?occ=${encodeURIComponent(value)}`} className="mega-occ-tile">
            {p && <Img folder="p" name={p.image.file} alt="" sizes="160px" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} />}
            <span>{value}</span>
            <span className="t-muted t-small">{count} {count === 1 ? 'piece' : 'pieces'}</span>
          </Link>
        )
      })}
    </div>
  )
}

function HouseMega() {
  return (
    <div className="mega-grid">
      <div className="mega-col">
        <p className="t-label mega-h">The house</p>
        <ul role="list">{HOUSE_LINKS.map((l) => <li key={l.to}><Link to={l.to} className="mega-link">{l.label}</Link></li>)}</ul>
      </div>
      <Link to="/about" className="mega-house-card">
        <Img folder="s" name="founder-portrait" alt="" sizes="360px" ratio={4 / 3} focus="50% 30%" />
        <span className="t-label">Meet the designer</span>
        <span className="t-h3">Archana Soni</span>
      </Link>
      <div className="mega-house-note">
        <p className="t-label mega-h">Need a hand?</p>
        <p className="t-muted">Every piece starts with a conversation — share your date, your ideas and your budget.</p>
        <a href={askStylist()} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><Icon name="whatsapp" size={16} className="btn-ic" /><span className="btn-label">Chat with a stylist</span></a>
      </div>
    </div>
  )
}

export function Header() {
  const { pathname, search } = useLocation()
  const [mega, setMega] = useState<MegaKey>(null)
  const [scrolled, setScrolled] = useState(false)
  const timer = useRef<number>(0)
  const setMenu = useUi((s) => s.setMenu)
  const setBag = useUi((s) => s.setBag)
  const setSearch = useUi((s) => s.setSearch)
  const bump = useUi((s) => s.bagBump)
  const count = useBag((s) => bagCount(s.items))
  const wish = useWishlist((s) => s.slugs.length)
  const bagRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMega(null) }, [pathname, search])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 36)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (!bump || !bagRef.current) return
    bagRef.current.classList.remove('is-bump'); void bagRef.current.offsetWidth; bagRef.current.classList.add('is-bump')
  }, [bump])
  useEffect(() => {
    if (!mega) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMega(null) }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [mega])

  const open = (k: string) => { clearTimeout(timer.current); timer.current = window.setTimeout(() => setMega(k), mega ? 0 : 120) }
  const close = () => { clearTimeout(timer.current); timer.current = window.setTimeout(() => setMega(null), 180) }
  const isNewIn = pathname === '/shop' && search.includes('new=1')

  const navItems: { key: string; label: string; to: string }[] = [
    ...categories.map((c) => ({ key: c.key, label: NAV_LABEL[c.key], to: categoryUrl(c) })),
    { key: 'occasions', label: 'Occasions', to: '/shop' },
    { key: 'house', label: 'The Atelier', to: '/about' },
  ]

  return (
    <header className={cx('hdr', scrolled && 'is-scrolled', mega && 'is-open')} onMouseLeave={close}>
      <div className="hdr-row container">
        <div className="hdr-left">
          <button className="hdr-ic lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu" aria-haspopup="dialog"><Icon name="menu" /></button>
          <button className="hdr-search" onClick={() => setSearch(true)} aria-label="Search" aria-haspopup="dialog">
            <Icon name="search" size={20} /><span className="hidden lg:inline">Search</span>
          </button>
        </div>
        <Link to="/" className="hdr-logo"><Logo /></Link>
        <div className="hdr-right">
          <a href={askStylist('booking a consultation')} target="_blank" rel="noopener noreferrer" className="hdr-consult hidden xl:inline-flex">
            <Icon name="whatsapp" size={15} /> Book a consultation
          </a>
          <Link to="/account" className="hdr-ic hidden md:grid" aria-label="Account"><Icon name="user" /></Link>
          <Link to="/wishlist" className="hdr-ic hidden xs:grid" aria-label={`Wishlist, ${wish} saved`}>
            <Icon name="heart" />{wish > 0 && <span className="hdr-count t-num" aria-hidden="true">{wish}</span>}
          </Link>
          <button ref={bagRef} className="hdr-ic hdr-bag" onClick={() => setBag(true)} aria-label={`Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`} data-bag-target>
            <Icon name="bag" />{count > 0 && <span className="hdr-count t-num" aria-hidden="true">{count}</span>}
          </button>
        </div>
      </div>

      <nav className="hdr-nav hidden lg:block" aria-label="Main">
        <ul role="list" className="container">
          <li><NavLink to="/shop?new=1" className={cx('hdr-link', isNewIn && 'is-active')} onMouseEnter={close}>New In</NavLink></li>
          {navItems.map((n) => (
            <li key={n.key} className={cx(n.key === 'house' && 'hidden xl:list-item')} onMouseEnter={() => open(n.key)}>
              <Link to={n.to} className={cx('hdr-link', mega === n.key && 'is-hover', pathname.startsWith(n.to) && n.to !== '/shop' && 'is-active')}>{n.label}</Link>
              <button className="hdr-disclose" aria-expanded={mega === n.key} aria-controls="mega" aria-label={`${n.label} menu`}
                onClick={() => setMega(mega === n.key ? null : n.key)}><Icon name="chevron" size={12} /></button>
            </li>
          ))}
        </ul>
      </nav>

      <div id="mega" className="mega hidden lg:block" hidden={!mega} onMouseEnter={() => clearTimeout(timer.current)}>
        <div className="container">
          {mega === 'occasions' ? <OccasionMega /> : mega === 'house' ? <HouseMega /> : mega ? <CategoryMega k={mega} /> : null}
        </div>
      </div>
    </header>
  )
}
