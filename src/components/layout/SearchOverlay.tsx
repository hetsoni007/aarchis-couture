import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { Img } from '../ui/Img'
import { Price } from '../ui/Kit'
import { categories, categoryUrl, getProduct, productUrl } from '../../lib/catalog'
import { COVER } from '../../lib/nav'
import { POPULAR_SEARCHES, searchCategories, searchProducts } from '../../lib/search'
import { useFocusTrap } from '../../lib/a11y'
import { lockScroll } from '../../lib/scroll'
import { useUi } from '../../store/ui'
import './layout.css'

export function SearchOverlay() {
  const open = useUi((s) => s.searchOpen)
  const setSearch = useUi((s) => s.setSearch)
  const [q, setQ] = useState('')
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  useEffect(() => setMounted(true), [])
  useEffect(() => { setSearch(false) }, [pathname, search, setSearch])
  useEffect(() => { if (open) { lockScroll(true); return () => lockScroll(false) } }, [open])
  useFocusTrap(ref, open, () => setSearch(false))

  const results = useMemo(() => searchProducts(q, 8), [q])
  const total = useMemo(() => searchProducts(q, 100).length, [q])
  const cats = useMemo(() => searchCategories(q), [q])
  if (!mounted || !open) return null

  const submit = (term = q) => { if (term.trim()) navigate(`/search?q=${encodeURIComponent(term.trim())}`) }

  return createPortal(
    <div className="srch-root">
      <div className="srch-scrim" onClick={() => setSearch(false)} aria-hidden="true" />
      <div ref={ref} className="srch" role="dialog" aria-modal="true" aria-label="Search the collection">
        <form className="srch-bar container" role="search" onSubmit={(e) => { e.preventDefault(); submit() }}>
          <Icon name="search" size={22} />
          <label htmlFor="srch-input" className="sr-only">Search</label>
          <input id="srch-input" data-autofocus className="srch-input" type="search" autoComplete="off" placeholder="Search lehengas, sarees, colours, crafts…"
            value={q} onChange={(e) => setQ(e.target.value)} />
          {q && <button type="button" className="srch-clear" onClick={() => setQ('')} aria-label="Clear search"><Icon name="close" size={18} /></button>}
          <button type="button" className="srch-close" onClick={() => setSearch(false)}>Close</button>
        </form>
        <div className="srch-body container">
          {!q.trim() ? (
            <div className="srch-empty">
              <div>
                <p className="t-label srch-h">Popular searches</p>
                <ul role="list" className="srch-pop">
                  {POPULAR_SEARCHES.map((t) => <li key={t}><button className="chip" onClick={() => { setQ(t); submit(t) }}>{t}</button></li>)}
                </ul>
              </div>
              <div>
                <p className="t-label srch-h">Shop by category</p>
                <ul role="list" className="srch-cats">
                  {categories.map((c) => {
                    const p = getProduct(COVER[c.key])!
                    return (
                      <li key={c.key}>
                        <Link to={categoryUrl(c)} className="srch-cat">
                          <Img folder="p" name={p.image.file} alt="" sizes="120px" ratio={1} fit={p.image.fit} focus={p.image.focus} />
                          <span>{c.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          ) : (
            <div className="srch-results" aria-live="polite">
              {cats.length > 0 && (
                <ul role="list" className="srch-pop">
                  {cats.map((c) => <li key={c.to}><Link to={c.to} className="chip">{c.label}</Link></li>)}
                </ul>
              )}
              {results.length ? (
                <>
                  <p className="t-small t-muted">{total} {total === 1 ? 'piece' : 'pieces'} for “{q.trim()}”</p>
                  <ul role="list" className="srch-grid">
                    {results.map((p) => (
                      <li key={p.slug}>
                        <Link to={productUrl(p)} className="srch-item">
                          <Img folder="p" name={p.image.file} alt="" sizes="(min-width: 64rem) 12vw, 40vw" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} />
                          <span className="srch-item-name">{p.name}</span>
                          <Price inr={p.price.inr} className="t-small" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {total > results.length && <button className="btn btn-secondary" onClick={() => submit()}><span className="btn-label">View all {total} results</span></button>}
                </>
              ) : (
                <div className="srch-none">
                  <p className="t-h3">Nothing matches “{q.trim()}” yet.</p>
                  <p className="t-muted">Try a colour, an occasion or a craft — or describe it to a stylist; every design can be made to your brief.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
