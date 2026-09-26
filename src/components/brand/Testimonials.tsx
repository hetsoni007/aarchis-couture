import { content } from '../../lib/catalog'
import './blocks.css'

interface Quote { name: string; place: string; quote: string }

/**
 * Data-gated. The live site has published no testimonials, so this renders nothing
 * until real, attributable client words are added to content.json → testimonials.items.
 */
export function Testimonials() {
  const items = (content.testimonials.items as Quote[]).filter((q) => q.quote && q.name && !/TODO/i.test(q.quote))
  if (!items.length) return null
  return (
    <section className="section tst" aria-labelledby="tst-title">
      <div className="container">
        <header className="sec-head is-center"><div><p className="t-label">In their words</p><h2 id="tst-title" className="t-h2">From our brides</h2></div></header>
        <ul role="list" className="tst-list">
          {items.map((q, i) => (
            <li key={i} className="tst-item">
              <blockquote className="tst-q">“{q.quote}”</blockquote>
              <p className="tst-who t-small">{q.name}{q.place && <span className="t-muted"> · {q.place}</span>}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
