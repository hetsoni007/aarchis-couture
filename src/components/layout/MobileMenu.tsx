import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { Wordmark } from '../brand/Wordmark'
import { Icon } from '../ui/Icon'
import { categories, categoryUrl, inCategory, content } from '../../lib/catalog'
import { useUi } from '../../store/ui'
import { useFocusTrap } from '../../lib/a11y'
import { lockScroll } from '../../lib/scroll'
import { askStylist } from '../../lib/whatsapp'
import { cx } from '../../lib/format'
import './layout.css'

const HOUSE = [
  { to: '/shop', label: 'All pieces' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/nri-brides', label: 'For NRI brides' },
  { to: '/navratri-outfits-ahmedabad', label: 'The Navratri edit' },
  { to: '/about', label: 'The atelier' },
  { to: '/contact', label: 'Contact & style quiz' },
]

export function MobileMenu() {
  const open = useUi((s) => s.menuOpen)
  const setMenu = useUi((s) => s.setMenu)
  const { pathname } = useLocation()
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, () => setMenu(false))
  useEffect(() => { setMenu(false) }, [pathname, setMenu])
  useEffect(() => { if (open) { lockScroll(true); return () => lockScroll(false) } }, [open])
  const social = content.contact.social
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <div ref={ref} className={cx('mmenu night', open && 'is-open')} role="dialog" aria-modal="true" aria-label="Menu" inert={!open} aria-hidden={!open} data-lenis-prevent>
      <div className="mmenu-top">
        <Link to="/" aria-label="Home"><Wordmark compact /></Link>
        <button className="mmenu-close" onClick={() => setMenu(false)} aria-label="Close menu" data-autofocus><Icon name="close" size={24} /></button>
      </div>
      <nav aria-label="Collections" className="mmenu-cats">
        <p className="eyebrow">Collections</p>
        <ul role="list">
          {categories.map((c, i) => (
            <li key={c.key} style={{ ['--i' as string]: i }}>
              <Link to={categoryUrl(c)} className="mmenu-cat">
                <span>{c.label}</span>
                <span className="num mmenu-n">{inCategory(c.key).length}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-label="The house" className="mmenu-house">
        <ul role="list">
          {HOUSE.map((h) => <li key={h.to}><Link to={h.to}>{h.label}</Link></li>)}
          <li><Link to="/wishlist">Wishlist</Link></li>
          <li><Link to="/account">Account &amp; reservations</Link></li>
        </ul>
      </nav>
      <div className="mmenu-foot">
        <a className="btn btn-night btn-block" href={askStylist()} target="_blank" rel="noopener noreferrer">
          <Icon name="whatsapp" size={18} className="btn-ic" /><span className="btn-label">Ask a stylist · {content.contact.whatsappDisplay}</span>
        </a>
        <div className="mmenu-social">
          <a href={social.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Icon name="instagram" size={20} /></a>
          <a href={social.facebook.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Icon name="facebook" size={20} /></a>
          <a href={social.pinterest.url} target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><Icon name="pinterest" size={20} /></a>
          <a href={social.linkedin.url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Icon name="linkedin" size={20} /></a>
          <span className="muted small">{content.contact.studio} · {content.contact.visits.toLowerCase()}</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
