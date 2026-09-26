import { Suspense, lazy, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams, useLocation } from 'react-router-dom'
import { Seo, breadcrumbLd, ORG_LD } from '../lib/seo'
import { categories, categoryBySlug, categoryUrl, content, inCategory, products, type Category } from '../lib/catalog'
import { facetGroups, facetLabel, matches, sortProducts, SORTS, useFacets, type SortKey } from '../lib/filters'
import { useDevice, useIdleReady } from '../lib/device'
import { useReveals } from '../lib/reveal'
import { cx, plural } from '../lib/format'
import { ProductGrid } from '../components/product/ProductCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Chip, Crumbs, Sheet } from '../components/ui/Kit'
import { Icon } from '../components/ui/Icon'
import { AmbientFallback } from '../components/brand/AmbientFallback'
import type { AmbientMode } from '../components/three/Ambient'
import './shop.css'

const Ambient = lazy(() => import('../components/three/Ambient'))

/** Adapted intros — written for this build from the studio's own category lines (shown beneath, verbatim). */
const EDITORIAL: Record<string, { kicker: string; title: string; adapted: string; aside?: { text: string; to: string; label: string } }> = {
  bridal: {
    kicker: 'The bridal edit', title: 'Bridal Lehengas',
    adapted: 'Every lehenga here is a starting point. Keep the silhouette, change the colour, deepen the zardozi — Archana cuts the final piece to you alone.',
    aside: { text: 'Marrying abroad or ordering from outside India?', to: '/nri-brides', label: 'How NRI brides order' },
  },
  saree: {
    kicker: 'The drape edit', title: 'Sarees',
    adapted: 'From rani-pink silk worked in gold to linen silk patched with gamthi — drapes hand-finished in the studio and ready to be re-coloured for your celebration.',
  },
  dupatta: {
    kicker: 'The finishing layer', title: 'Dupattas',
    adapted: 'Gharchola checks, bandhej ombré and pearl-white jaal on scarlet net. One size, nothing to measure — the quickest way to bring a look home.',
  },
  dressmaterial: {
    kicker: 'Unstitched silk', title: 'Dress Material',
    adapted: 'Pure silk suit pieces, each with its matching dupatta. Take the fabric as it is, or have it tailored to your measurements at the Ahmedabad studio.',
  },
  ethnic: {
    kicker: 'The festive edit', title: 'Ethnic & Festive',
    adapted: 'Anarkalis, ensembles and dresses for sangeet, garba and every festive evening in between — made to twirl, made to measure.',
    aside: { text: 'Nine nights of garba ahead?', to: '/navratri-outfits-ahmedabad', label: 'The Navratri edit' },
  },
  mens: {
    kicker: 'For the groom', title: 'Men’s Ethnic',
    adapted: 'For the groom and the men of the celebration — tailored to your measurements, in the colours the day calls for.',
  },
  babyshower: {
    kicker: 'For the mum-to-be', title: 'Baby Shower & Maternity',
    adapted: 'Bespoke baby-shower outfits for the mum-to-be, made to measure for the day itself and detailed to be remembered.',
  },
}

function FilterPanel({ scope, base }: { scope?: Category; base: typeof products }) {
  const { facets, toggle, setNew, activeCount, clear } = useFacets()
  const groups = facetGroups(base, facets, scope?.key)
  const newCount = base.filter((p) => p.isNew && matches(p, { ...facets, isNew: false })).length
  return (
    <div className="fpanel">
      {newCount > 0 && (
        <label className="fswitch">
          <input type="checkbox" role="switch" checked={facets.isNew} onChange={(e) => setNew(e.target.checked)} />
          <span className="fswitch-track" aria-hidden="true"><i /></span>
          <span>New arrivals only <span className="fcount num">{newCount}</span></span>
        </label>
      )}
      {groups.map((g) => (
        <details key={g.key} className="fgroup" open={g.key !== 'style'}>
          <summary className="fgroup-title">{g.label}<Icon name="chevron" size={16} /></summary>
          <ul role="list" className={cx('fopts', g.key === 'col' && 'is-swatches')}>
            {g.options.map((o) => {
              const on = (facets[g.key] as string[]).includes(o.value)
              return (
                <li key={o.value}>
                  <label className={cx('fopt', on && 'is-on', !o.count && !on && 'is-empty')}>
                    <input type="checkbox" checked={on} disabled={!o.count && !on} onChange={() => toggle(g.key, o.value)} />
                    {o.swatch ? <span className="fswatch" style={{ background: o.swatch }} aria-hidden="true" /> : <span className="fbox" aria-hidden="true"><Icon name="check" size={12} /></span>}
                    <span className="fopt-label">{o.label}</span>
                    <span className="fcount num">{o.count}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </details>
      ))}
      {activeCount > 0 && <button className="fclear link-thread" onClick={clear}>Clear all filters</button>}
    </div>
  )
}

export default function Shop() {
  const { category: slug } = useParams()
  const { pathname } = useLocation()
  const scope = slug ? categoryBySlug(slug) : undefined
  const device = useDevice()
  const idle = useIdleReady()
  const { facets, sort, setSort, toggle, setNew, clear, activeCount } = useFacets()
  const [sheet, setSheet] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLElement>(null)
  useReveals(root, [slug])

  const base = useMemo(() => (scope ? inCategory(scope.key) : products), [scope])
  const shown = useMemo(() => sortProducts(base.filter((p) => matches(p, facets)), sort), [base, facets, sort])

  if (slug && !scope) return <Navigate to="/shop" replace />
  if (pathname === '/catalogue') return <Navigate to="/shop" replace />

  const ed = scope ? EDITORIAL[scope.key] : undefined
  const title = scope ? `${ed!.title} — made to measure in Ahmedabad` : 'The Collections — every piece, made to measure'
  const desc = scope ? `${scope.intro} ${plural(base.length, 'design')}, customisable in colour, fabric and size, shipped worldwide from Ahmedabad.` : content.catalogueLead
  const chips = (['cat', 'occ', 'col', 'fab', 'price', 'style'] as const).flatMap((k) => (facets[k] as string[]).map((v) => ({ k, v })))

  return (
    <div ref={root} className="shop" key={slug ?? 'all'}>
      <Seo title={title} description={desc}
        jsonLd={[ORG_LD, breadcrumbLd([{ name: 'Collections', path: '/shop/' }, ...(scope ? [{ name: scope.label }] : [])]), {
          '@context': 'https://schema.org', '@type': 'CollectionPage', name: scope ? scope.label : 'Collections', description: desc,
        }]} />

      {scope ? (
        <header ref={head} className={cx('shop-hero', scope.key === 'babyshower' ? 'is-pastel' : 'night')} data-nav-night={scope.key !== 'babyshower' || undefined}>
          <div className="shop-ambient" aria-hidden="true">
            <AmbientFallback mode={scope.ambient as AmbientMode} />
            {device.tier !== 'none' && idle && (
              <Suspense fallback={null}><Ambient mode={scope.ambient as AmbientMode} device={device} eventSource={head} /></Suspense>
            )}
          </div>
          <div className="wrap shop-hero-in">
            <Crumbs trail={[{ name: 'Collections', to: '/shop' }, { name: scope.label }]} />
            <p className="eyebrow">{ed!.kicker}</p>
            <h1 className="h1 shop-title">{ed!.title}</h1>
            <p className="lead shop-adapted">{ed!.adapted}</p>
            <p className="italic-voice shop-verbatim">“{scope.intro}”</p>
            <p className="shop-count num">{plural(base.length, 'design')} · made to measure in Ahmedabad · shipped worldwide</p>
            {ed!.aside && (
              <p className="shop-aside">{ed!.aside.text} <Link to={ed!.aside.to} className="prose-link">{ed!.aside.label}</Link></p>
            )}
          </div>
        </header>
      ) : (
        <header className="shop-plain warp-lines">
          <div className="wrap">
            <Crumbs trail={[{ name: 'Home', to: '/' }, { name: 'Collections' }]} />
            <p className="eyebrow">The Catalogue</p>
            <h1 className="h1">The <em className="v">Collections</em></h1>
            <p className="lead measure-lead">{content.catalogueLead}</p>
            <p className="shop-count num">{products.length} designs · {categories.length} categories · made to measure in Ahmedabad</p>
          </div>
        </header>
      )}

      <nav className="cat-tabs" aria-label="Categories">
        <div className="wrap">
          <ul role="list" className="rail">
            <li><Link to="/shop" className={cx('cat-tab', !scope && 'is-on')} aria-current={!scope ? 'page' : undefined}>All <span className="num">{products.length}</span></Link></li>
            {categories.map((c) => (
              <li key={c.key}>
                <Link to={categoryUrl(c)} className={cx('cat-tab', scope?.key === c.key && 'is-on')} aria-current={scope?.key === c.key ? 'page' : undefined}>
                  {c.label} <span className="num">{inCategory(c.key).length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="wrap shop-body">
        <aside className="shop-side hidden lg:block" aria-label="Refine">
          <p className="eyebrow">Refine</p>
          <FilterPanel scope={scope} base={base} />
        </aside>

        <section className="shop-main" aria-labelledby="pieces-title">
          <h2 id="pieces-title" className="sr-only">{scope ? `${scope.label} — every piece` : 'Every piece'}</h2>
          <div className="shop-toolbar">
            <p className="shop-results" aria-live="polite"><span className="num">{shown.length}</span> {shown.length === 1 ? 'piece' : 'pieces'}</p>
            <button className="btn btn-secondary btn-sm lg:hidden" onClick={() => setSheet(true)} aria-haspopup="dialog">
              <Icon name="filter" size={18} className="btn-ic" /><span className="btn-label">Refine{activeCount ? ` · ${activeCount}` : ''}</span>
            </button>
            <label className="sortsel">
              <span className="sr-only">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <Icon name="chevron" size={16} />
            </label>
          </div>
          {(chips.length > 0 || facets.isNew) && (
            <div className="shop-chips">
              {facets.isNew && <Chip onRemove={() => setNew(false)}>New arrivals</Chip>}
              {chips.map(({ k, v }) => <Chip key={k + v} onRemove={() => toggle(k, v)}>{facetLabel(k, v)}</Chip>)}
              <button className="link-thread fclear" onClick={clear}>Clear all</button>
            </div>
          )}
          {shown.length ? (
            <ProductGrid items={shown} dense priorityCount={scope ? 0 : 3} />
          ) : (
            <EmptyState kind="results" title="No piece matches all of that."
              actions={<><Button onClick={clear}>Loosen every thread</Button><Button to="/contact" variant="ghost">Describe it to a stylist</Button></>}>
              Loosen a thread or two — or tell us what you have in mind. Every design here is a starting point anyway.
            </EmptyState>
          )}
        </section>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Refine"
        footer={<div className="sheet-actions">
          <Button variant="ghost" onClick={clear} disabled={!activeCount}>Clear</Button>
          <Button onClick={() => setSheet(false)} data-autofocus>{`Show ${shown.length} ${shown.length === 1 ? 'piece' : 'pieces'}`}</Button>
        </div>}>
        <FilterPanel scope={scope} base={base} />
      </Sheet>
    </div>
  )
}
