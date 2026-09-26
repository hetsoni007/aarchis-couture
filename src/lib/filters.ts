import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ALL_FABRICS, ALL_OCCASIONS, COLOUR_FAMILIES, FABRIC_UNNAMED, PRICE_BANDS, categories, products, type CategoryKey, type Product } from './catalog'

export type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc'
export const SORTS: { id: SortKey; label: string }[] = [
  { id: 'featured', label: 'The atelier’s order' },
  { id: 'newest', label: 'Newest first' },
  { id: 'price-asc', label: 'Price — low to high' },
  { id: 'price-desc', label: 'Price — high to low' },
]

export interface Facets { cat: string[]; occ: string[]; col: string[]; fab: string[]; price: string[]; style: string[]; isNew: boolean }
type FacetKey = Exclude<keyof Facets, 'isNew'>

const fabricOf = (p: Product) => p.fabric?.name ?? FABRIC_UNNAMED
const bandOf = (p: Product) => PRICE_BANDS.find((b) => p.price.inr >= b.min && p.price.inr <= b.max)!.id

const TEST: Record<FacetKey, (p: Product, vals: string[]) => boolean> = {
  cat: (p, v) => v.includes(p.category),
  occ: (p, v) => p.occasions.some((o) => v.includes(o)),
  col: (p, v) => p.derived.families.some((f) => v.includes(f)),
  fab: (p, v) => v.includes(fabricOf(p)),
  price: (p, v) => v.includes(bandOf(p)),
  style: (p, v) => p.styles.some((s) => v.includes(s)),
}

export function matches(p: Product, f: Facets, skip?: FacetKey) {
  if (f.isNew && !p.isNew) return false
  return (Object.keys(TEST) as FacetKey[]).every((k) => k === skip || !f[k].length || TEST[k](p, f[k]))
}

const newestKey = (p: Product) => (p.isNew ? '9999' : p.instagram?.postedAt ?? '0000')
export function sortProducts(items: Product[], sort: SortKey) {
  const out = [...items]
  if (sort === 'newest') out.sort((a, b) => newestKey(b).localeCompare(newestKey(a)) || a.position - b.position)
  else if (sort === 'price-asc') out.sort((a, b) => a.price.inr - b.price.inr)
  else if (sort === 'price-desc') out.sort((a, b) => b.price.inr - a.price.inr)
  else out.sort((a, b) => a.position - b.position)
  return out
}

export const ALL_STYLES = Array.from(new Set(products.flatMap((p) => p.styles))).sort()

/** Facet definitions with live counts — each count assumes every *other* active filter. */
export function facetGroups(base: Product[], f: Facets, scope?: CategoryKey) {
  const count = (key: FacetKey, value: string) => base.filter((p) => matches(p, { ...f, [key]: [value] })).length
  const groups: { key: FacetKey; label: string; options: { value: string; label: string; count: number; swatch?: string }[] }[] = []
  if (!scope) groups.push({ key: 'cat', label: 'Category', options: categories.map((c) => ({ value: c.key, label: c.label, count: count('cat', c.key) })) })
  const occ = Array.from(new Set(base.flatMap((p) => p.occasions)))
  groups.push({ key: 'occ', label: 'Occasion', options: ALL_OCCASIONS.filter((o) => occ.includes(o)).map((o) => ({ value: o, label: o, count: count('occ', o) })) })
  const fams = new Set(base.flatMap((p) => p.derived.families))
  groups.push({ key: 'col', label: 'Colour', options: COLOUR_FAMILIES.filter((c) => fams.has(c.name)).map((c) => ({ value: c.name, label: c.name, count: count('col', c.name), swatch: c.swatch })) })
  const fabs = new Set(base.map(fabricOf))
  groups.push({ key: 'fab', label: 'Fabric', options: [...ALL_FABRICS, FABRIC_UNNAMED].filter((x) => fabs.has(x)).map((x) => ({ value: x, label: x, count: count('fab', x) })) })
  const bands = new Set(base.map(bandOf))
  groups.push({ key: 'price', label: 'Starting price', options: PRICE_BANDS.filter((b) => bands.has(b.id)).map((b) => ({ value: b.id, label: b.label, count: count('price', b.id) })) })
  const styles = new Set(base.flatMap((p) => p.styles))
  groups.push({ key: 'style', label: 'Style', options: ALL_STYLES.filter((s) => styles.has(s)).map((s) => ({ value: s, label: s, count: count('style', s) })) })
  return groups.filter((g) => g.options.length > 1)
}

/** URL-synced filter state (?occ=Wedding,Reception&col=Red&sort=newest&new=1). */
export function useFacets() {
  const [params, setParams] = useSearchParams()
  const read = (k: string) => (params.get(k) ?? '').split(',').filter(Boolean)
  const facets: Facets = useMemo(() => ({
    cat: read('cat'), occ: read('occ'), col: read('col'), fab: read('fab'), price: read('price'), style: read('style'), isNew: params.get('new') === '1',
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [params])
  const sort = (SORTS.find((s) => s.id === params.get('sort'))?.id ?? 'featured') as SortKey

  const write = (mut: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params)
    mut(next)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  return {
    facets, sort,
    toggle: (key: FacetKey, value: string) => write((p) => {
      const cur = new Set((p.get(key) ?? '').split(',').filter(Boolean))
      cur.has(value) ? cur.delete(value) : cur.add(value)
      cur.size ? p.set(key, [...cur].join(',')) : p.delete(key)
    }),
    setNew: (v: boolean) => write((p) => (v ? p.set('new', '1') : p.delete('new'))),
    setSort: (s: SortKey) => write((p) => (s === 'featured' ? p.delete('sort') : p.set('sort', s))),
    clear: () => write((p) => { ['cat', 'occ', 'col', 'fab', 'price', 'style', 'new'].forEach((k) => p.delete(k)) }),
    activeCount: facets.cat.length + facets.occ.length + facets.col.length + facets.fab.length + facets.price.length + facets.style.length + (facets.isNew ? 1 : 0),
  }
}

export const facetLabel = (key: string, value: string) =>
  key === 'cat' ? categories.find((c) => c.key === value)?.label ?? value
  : key === 'price' ? PRICE_BANDS.find((b) => b.id === value)?.label ?? value
  : value
