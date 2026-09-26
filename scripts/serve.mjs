// Local production server that mirrors the CDN rules the site needs (see README → Deploy):
//   /path            → dist/path/index.html   (prerendered clean URL)
//   /reserved/*      → dist/200.html          (client-only route, SPA shell)
//   anything else    → dist/404.html, status 404
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { brotliCompressSync, gzipSync, constants } from 'node:zlib'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const port = Number(process.env.PORT ?? 4173)
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain' }
const CLIENT_ONLY = [/^\/reserved\//]

const cache = new Map()
const cached = (f, enc, make) => { const k = f + enc + statSync(f).mtimeMs; if (!cache.has(k)) cache.set(k, make()); return cache.get(k) }
const file = (p) => { const f = join(dist, normalize(p)); return f.startsWith(dist) && existsSync(f) && statSync(f).isFile() ? f : null }

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  let f = file(path) ?? file(join(path, 'index.html'))
  let status = 200
  if (!f) {
    if (CLIENT_ONLY.some((r) => r.test(path))) f = file('200.html')
    else { f = file('404.html'); status = 404 }
  }
  const type = TYPES[extname(f)] ?? 'application/octet-stream'
  const immutable = f.includes('/assets/') || f.includes('/img/') || f.includes('/fonts/')
  const headers = { 'content-type': type, 'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache', vary: 'accept-encoding' }
  const accept = String(req.headers['accept-encoding'] ?? '')
  let body = readFileSync(f)
  // compress text like the CDN does (brotli, else gzip); images and fonts are already compressed
  if (/^(text|application\/(json|xml|manifest))|svg/.test(type)) {
    if (accept.includes('br')) { body = cached(f, 'br', () => brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } })); headers['content-encoding'] = 'br' }
    else if (accept.includes('gzip')) { body = cached(f, 'gz', () => gzipSync(body, { level: 9 })); headers['content-encoding'] = 'gzip' }
  }
  res.writeHead(status, headers)
  res.end(body)
}).listen(port, () => console.log(`aarchis-couture → http://localhost:${port}`))
