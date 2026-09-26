import { categories, categoryUrl, getProduct, inCategory, products, COLOUR_FAMILIES, ALL_OCCASIONS, type Category, type CategoryKey, type Product } from './catalog'

/** Short storefront labels for the category nav (the full names stay on the pages themselves). */
export const NAV_LABEL: Record<CategoryKey, string> = {
  bridal: 'Bridal', saree: 'Sarees', dupatta: 'Dupattas', dressmaterial: 'Suits', ethnic: 'Festive', mens: 'Men', babyshower: 'Maternity',
}

/** A photo-clean hero piece per category — used in menus, tiles and collection headers. */
export const COVER: Record<CategoryKey, string> = {
  bridal: 'blush-pastel-bridal-lehenga', saree: 'ivory-elegance-saree', dupatta: 'sunset-bandhani-ombre-dupatta',
  dressmaterial: 'noir-vine-embroidered-silk-suit', ethnic: 'scarlet-grace-anarkali', mens: 'coral-turquoise-men-s-ensemble',
  babyshower: 'motherhood-baby-shower-ensemble',
}

/** Occasion tiles: a real product photographed for that occasion (from its live tags). */
export const OCCASION_COVER: Record<string, string> = {
  Wedding: 'scarlet-royal-bridal-lehenga', Reception: 'beige-noor-saree', Engagement: 'white-beaded-grace-ensemble',
  Sangeet: 'sangeet-special-anarkali', Festive: 'heritage-handcrafted-saree', Party: 'scarlet-soiree-ensemble',
  'Baby Shower': 'blossom-baby-shower-outfit', Everyday: 'multicoloured-patchwork-dress',
}

const count = <T,>(xs: T[], f: (p: Product) => T[] | T) => {
  const m = new Map<T, number>()
  for (const p of products) {
    const v = f(p)
    for (const x of Array.isArray(v) ? v : [v]) m.set(x, (m.get(x) ?? 0) + 1)
  }
  return xs.filter((x) => m.has(x)).map((x) => ({ value: x, count: m.get(x)! }))
}

export const occasionsWithCounts = () => count(ALL_OCCASIONS, (p) => p.occasions)
/** Occasions in the order a bride plans them (the cover map's order). */
export const occasionsByImportance = () => {
  const all = occasionsWithCounts()
  return Object.keys(OCCASION_COVER).map((o) => all.find((x) => x.value === o)).filter(Boolean) as { value: string; count: number }[]
}

export function megaFor(c: Category) {
  const items = inCategory(c.key)
  const occ = new Map<string, number>()
  const col = new Map<string, number>()
  for (const p of items) {
    p.occasions.forEach((o) => occ.set(o, (occ.get(o) ?? 0) + 1))
    p.derived.families.forEach((f) => col.set(f, (col.get(f) ?? 0) + 1))
  }
  const base = categoryUrl(c)
  const featured = [getProduct(COVER[c.key])!, ...items.filter((p) => p.slug !== COVER[c.key] && p.isNew), ...items.filter((p) => p.slug !== COVER[c.key])]
    .filter((p, i, a) => a.indexOf(p) === i).slice(0, 2)
  return {
    base,
    newCount: items.filter((p) => p.isNew).length,
    occasions: [...occ.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([v, n]) => ({ label: v, count: n, to: `${base}?occ=${encodeURIComponent(v)}` })),
    colours: COLOUR_FAMILIES.filter((f) => col.has(f.name)).slice(0, 7).map((f) => ({ label: f.name, swatch: f.swatch, to: `${base}?col=${encodeURIComponent(f.name)}` })),
    featured,
  }
}

export const HOUSE_LINKS = [
  { to: '/about', label: 'The atelier' },
  { to: '/how-it-works', label: 'How made-to-measure works' },
  { to: '/size-guide', label: 'Size & fit guide' },
  { to: '/nri-brides', label: 'Ordering from abroad' },
  { to: '/navratri-outfits-ahmedabad', label: 'The Navratri edit' },
  { to: '/contact', label: 'Contact & consultations' },
]

export { categories }
