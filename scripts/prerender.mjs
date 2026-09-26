// Prerender every public route into dist/<route>/index.html so the first paint needs no JS:
// product photos, copy, titles, canonical links and JSON-LD are all in the HTML.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const { render } = await import(join(root, 'dist-ssr', 'entry-server.js'))
const template = readFileSync(join(dist, 'index.html'), 'utf8')
const products = JSON.parse(readFileSync(join(root, 'src/data/products.json'), 'utf8'))
const content = JSON.parse(readFileSync(join(root, 'src/data/content.json'), 'utf8'))

// untouched SPA shell for routes that only make sense client-side (/reserved/:ref …)
copyFileSync(join(dist, 'index.html'), join(dist, '200.html'))

const routes = [
  '/', '/shop', ...content.categories.map((c) => `/shop/${c.slug}`),
  ...products.map((p) => `/catalogue/${p.slug}`),
  '/how-it-works', '/about', '/nri-brides', '/nri-brides/usa', '/nri-brides/uk', '/navratri-outfits-ahmedabad', '/contact',
  '/bag', '/checkout', '/account', '/wishlist', '/__404',
]

const HOIST = /<title>[\s\S]*?<\/title>|<meta (?:name="description"|name="robots"|property="og:[^"]+"|name="twitter:[^"]+")[^>]*\/?>|<link rel="canonical"[^>]*\/?>/g

let n = 0
for (const url of routes) {
  const { html } = await render(url)
  // move the page's own <title>/<meta>/<link rel=canonical> into <head>, replacing the template defaults
  const hoisted = html.match(HOIST) ?? []
  const body = html.replace(HOIST, '')
  let head = template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/<meta property="og:(?:type|image)"[^>]*>/g, '')
    .replace(/<meta name="twitter:card"[^>]*>/, '')
  head = head.replace('</head>', `    ${hoisted.join('\n    ')}\n    <meta property="og:type" content="website" />\n    <meta name="twitter:card" content="summary_large_image" />\n  </head>`)
  const page = head.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  const out = url === '/' ? join(dist, 'index.html') : url === '/__404' ? join(dist, '404.html') : join(dist, url, 'index.html')
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, page)
  n++
}
console.log(`prerendered ${n} routes`)
