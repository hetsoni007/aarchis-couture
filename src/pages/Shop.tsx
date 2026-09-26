import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Seo, breadcrumbLd, ORG_LD } from '../lib/seo'
import { categories, categoryBySlug, categoryUrl, content, inCategory, products, type Category } from '../lib/catalog'
import { facetGroups, facetLabel, matches, sortProducts, SORTS, useFacets, type Facets, type SortKey } from '../lib/filters'
import { searchProducts } from '../lib/search'
import { NAV_LABEL } from '../lib/nav'
import { askStylist } from '../lib/whatsapp'
import { cx, plural } from '../lib/format'
import { useUi } from '../store/ui'
import { ProductGrid } from '../components/product/ProductCard'
import { RecentlyViewed } from '../components/product/Rails'
import { Button } from '../components/ui/Button'
import { Chip, Crumbs, Drawer } from '../components/ui/Kit'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import './shop.css'

const PAGE = 12
const NO_FACETS: Facets = { cat: [], occ: [], col: [], fab: [], price: [], style: [], isNew: false }
type Groups = ReturnType<typeof facetGroups>

function FilterPanel({ groups, facets, toggle, setNew, hasNew, idPrefix }: {
  groups: Groups; facets: Facets; toggle: (k: Groups[number]['key'], v: string) => void; setNew: (v: boolean) => void; hasNew: boolean; idPrefix: string
}) {
  return (
    <div className="fp">
      {hasNew && (
        <label className="fp-toggle">
          <input type="checkbox" checked={facets.isNew} onChange={(e) => setNew(e.target.checked)} />
          <span className="fp-box" aria-hidden="true"><Icon name="check" size={12} /></span>
          <span>New arrivals only</span>
        </label>
      )}
      {groups.map((g, gi) => {
        const on = facets[g.key] as string[]
        return (
          <details key={g.key} className="fp-group" open={gi < 3 || on.length > 0 || undefined}>
            <summary className="fp-sum">
              <span>{g.label}{on.length > 0 && <span className="fp-n"> ({on.length})</span>}</span>
              <Icon name="plus" size={16} className="acc-ic" />
            </summary>
            <ul role="list" className={cx('fp-opts', g.key === 'col' && 'is-colours')}>
              {g.options.map((o) => {
                const checked = on.includes(o.value)
                const id = `${idPrefix}-${g.key}-${o.value}`.replace(/[^\w-]/g, '')
                return (
                  <li key={o.value}>
                    <label htmlFor={id} className={cx('fp-opt', !o.count && !checked && 'is-empty')}>
                      <input id={id} type="checkbox" checked={checked} disabled={!o.count && !checked} onChange={() => toggle(g.key, o.value)} />
                      {o.swatch ? <span className="fp-sw" style={{ background: o.swatch }} aria-hidden="true" /> : <span className="fp-box" aria-hidden="true"><Icon name="check" size={12} /></span>}
                      <span className="fp-label">{o.label}</span>
                      <span className="fp-count t-num">{o.count}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </details>
        )
      })}
    </div>
  )
}

function SortSelect({ sort, setSort, relevance }: { sort: SortKey; setSort: (s: SortKey) => void; relevance?: boolean }) {
  return (
    <label className="sort">
      <span className="sort-label">Sort</span>
      <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort by">
        {SORTS.map((s) => <option key={s.id} value={s.id}>{s.id === 'featured' && relevance ? 'Best match' : s.label}</option>)}
      </select>
      <Icon name="chevron" size={14} className="sort-chev" />
    </label>
  )
}

function CategoryPills({ scope }: { scope?: Category }) {
  return (
    <nav aria-label="Categories" className="pills-wrap">
      <ul role="list" className="pills rail">
        <li><Link to="/shop" className={cx('pill', !scope && 'is-on')} aria-current={!scope ? 'page' : undefined}>All</Link></li>
        {categories.map((c) => (
          <li key={c.key}><Link to={categoryUrl(c)} className={cx('pill', scope?.key === c.key && 'is-on')} aria-current={scope?.key === c.key ? 'page' : undefined}>{NAV_LABEL[c.key]}</Link></li>
        ))}
      </ul>
    </nav>
  )
}

export default function Shop() {
  const { category } = useParams()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const isSearch = pathname.startsWith('/search')
  const scope = categoryBySlug(category)
  const url = useFacets()
  // Prerendered HTML is built without a query string, so the query only applies once hydration is done —
  // otherwise a direct load of /shop?occ=Wedding or /search?q=red would mismatch the server markup.
  const hydrated = useUi((s) => s.hydrated)
  const q = hydrated ? (params.get('q') ?? '').trim() : ''
  const facets = hydrated ? url.facets : NO_FACETS
  const sort: SortKey = hydrated ? url.sort : 'featured'
  const activeCount = hydrated ? url.activeCount : 0
  const { toggle, setNew, setSort, clear } = url
  const [limit, setLimit] = useState(PAGE)
  const [drawer, setDrawer] = useState(false)
  const [sidebar, setSidebar] = useState(true)

  const base = useMemo(() => (isSearch ? searchProducts(q, 100) : scope ? inCategory(scope.key) : products), [isSearch, q, scope])
  const shown = useMemo(() => {
    const f = base.filter((p) => matches(p, facets))
    return isSearch && sort === 'featured' ? f : sortProducts(f, sort) // search keeps relevance order by default
  }, [base, facets, sort, isSearch])
  const groups = useMemo(() => facetGroups(base, facets, scope?.key), [base, facets, scope])
  const filterKey = JSON.stringify([facets, sort, q, category])
  useEffect(() => setLimit(PAGE), [filterKey])

  if (category && !scope) return <Navigate to="/shop" replace />
  if (pathname.startsWith('/catalogue')) return <Navigate to="/shop" replace />

  const title = isSearch ? (q ? `Results for “${q}”` : 'Search') : scope ? scope.label : 'All pieces'
  const lead = isSearch ? null : scope ? scope.intro : content.catalogueLead
  const seoTitle = isSearch ? 'Search the collection' : scope ? `${scope.label} — made to measure in Ahmedabad` : 'Shop the collection — bridal, sarees & festive wear, made to measure'
  const desc = scope ? `${scope.intro} ${plural(base.length, 'design')}, customisable in colour, fabric and size, shipped worldwide from Ahmedabad.` : content.catalogueLead
  const chips = (['cat', 'occ', 'col', 'fab', 'price', 'style'] as const).flatMap((k) => (facets[k] as string[]).map((v) => ({ k, v })))
  const hasNew = base.some((p) => p.isNew)
  const visible = shown.slice(0, limit)
  const panelProps = { groups, facets, toggle, setNew, hasNew }

  return (
    <div className="shop">
      <Seo title={seoTitle} description={desc} noindex={isSearch}
        jsonLd={[ORG_LD, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop/' }, ...(scope ? [{ name: scope.label }] : [])]), {
          '@context': 'https://schema.org', '@type': 'CollectionPage', name: scope ? scope.label : 'The collection', description: desc,
        }]} />

      <header className="shop-head container">
        <Crumbs trail={[{ name: 'Home', to: '/' }, ...(scope || isSearch ? [{ name: 'Shop', to: '/shop' }] : []), { name: isSearch ? 'Search' : scope ? scope.label : 'Shop' }]} />
        <div className="shop-title">
          <h1 className="t-h1">{title}</h1>
          {lead && <p className="t-muted measure">{lead}</p>}
          {isSearch && q && <p className="t-muted">{plural(base.length, 'piece')} found. Every design can be customised to your brief.</p>}
        </div>
        {!isSearch && <CategoryPills scope={scope} />}
      </header>

      <div className="shop-bar">
        <div className="container shop-bar-in">
          <button className="shop-filter lg:hidden" onClick={() => setDrawer(true)} aria-haspopup="dialog">
            <Icon name="sliders" size={16} /> Filter{activeCount > 0 && <span className="shop-filter-n">{activeCount}</span>}
          </button>
          <button className="shop-filter hidden lg:inline-flex" onClick={() => setSidebar((v) => !v)} aria-expanded={sidebar} aria-controls="shop-side">
            <Icon name="sliders" size={16} /> {sidebar ? 'Hide filters' : 'Show filters'}{activeCount > 0 && <span className="shop-filter-n">{activeCount}</span>}
          </button>
          <p className="shop-count t-small t-muted" aria-live="polite">{plural(shown.length, 'piece')}</p>
          <SortSelect sort={sort} setSort={setSort} relevance={isSearch} />
        </div>
      </div>

      <div className={cx('container shop-body', sidebar && 'has-side')}>
        {sidebar && (
          <aside id="shop-side" className="shop-side hidden lg:block" aria-label="Filters">
            <FilterPanel {...panelProps} idPrefix="side" />
          </aside>
        )}
        <section className="shop-main" aria-labelledby="shop-results">
          <h2 id="shop-results" className="sr-only">{isSearch ? 'Search results' : 'Products'}</h2>
          {(chips.length > 0 || facets.isNew) && (
            <div className="shop-chips">
              {facets.isNew && <Chip onRemove={() => setNew(false)}>New arrivals</Chip>}
              {chips.map(({ k, v }) => <Chip key={k + v} onRemove={() => toggle(k, v)}>{facetLabel(k, v)}</Chip>)}
              <button className="link t-small" onClick={clear}>Clear all</button>
            </div>
          )}

          {shown.length ? (
            <>
              <ProductGrid items={visible} className={sidebar ? 'is-3' : undefined} priorityCount={2}
                sizes={sidebar ? '(min-width: 80rem) 24vw, (min-width: 64rem) 30vw, (min-width: 48rem) 31vw, 48vw' : undefined} />
              <div className="shop-more">
                <p className="t-small t-muted">Showing {visible.length} of {shown.length}</p>
                <span className="shop-progress" aria-hidden="true"><i style={{ width: `${(visible.length / shown.length) * 100}%` }} /></span>
                {visible.length < shown.length && <Button variant="secondary" onClick={() => setLimit((n) => n + PAGE)}>Load more</Button>}
              </div>
              <p className="shop-note t-small t-muted">Prices marked <em>indicative</em> are starting points. Your final quote, shaped by fabric, hand-work and your changes, is confirmed with Archana before anything is charged.</p>
            </>
          ) : (
            <EmptyState kind="results" title={isSearch && !activeCount ? (q ? `Nothing matches “${q}” yet` : 'Search the collection') : 'No pieces match those filters'}
              actions={<>
                {activeCount > 0 && <Button onClick={clear}>Clear filters</Button>}
                {isSearch && <Button to="/shop" variant={activeCount ? 'secondary' : 'primary'}>Browse everything</Button>}
                <Button href={askStylist(q ? `something like “${q}”` : 'finding the right piece')} variant="ghost" icon="whatsapp">Describe it to a stylist</Button>
              </>}>
              Every design can be made to your brief, in the colour, fabric and fit you choose.
            </EmptyState>
          )}
        </section>
      </div>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Filter" side="left" mobile="side"
        footer={
          <div className="shop-drawer-foot">
            <Button variant="secondary" onClick={clear} disabled={!activeCount}>Clear all</Button>
            <Button onClick={() => setDrawer(false)}>Show {plural(shown.length, 'piece')}</Button>
          </div>
        }>
        <FilterPanel {...panelProps} idPrefix="drawer" />
      </Drawer>

      <RecentlyViewed />
    </div>
  )
}
