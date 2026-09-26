// Writes public/sitemap.xml from the catalogue — every indexable route, nothing private.
import { readFileSync, writeFileSync } from 'node:fs'
const SITE = 'https://www.aarchisbyarchanasoni.com'
const products = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url)))
const content = JSON.parse(readFileSync(new URL('../src/data/content.json', import.meta.url)))
const today = new Date().toISOString().slice(0, 10)
const routes = [
  ['/', '1.0'], ['/shop/', '0.9'],
  ...content.categories.map((c) => [`/shop/${c.slug}/`, '0.8']),
  ...products.map((p) => [`/catalogue/${p.slug}/`, p.isNew ? '0.8' : '0.7']),
  ['/how-it-works/', '0.6'], ['/about/', '0.6'], ['/nri-brides/', '0.7'], ['/nri-brides/usa/', '0.6'], ['/nri-brides/uk/', '0.6'],
  ['/navratri-outfits-ahmedabad/', '0.7'], ['/contact/', '0.6'],
]
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(([u, pr]) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
console.log(`sitemap: ${routes.length} urls`)
