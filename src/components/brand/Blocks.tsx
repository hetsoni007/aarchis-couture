import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Accordion, Crumbs } from '../ui/Kit'
import { Img } from '../ui/Img'
import { Button } from '../ui/Button'
import { content } from '../../lib/catalog'
import { askStylist } from '../../lib/whatsapp'
import { cx } from '../../lib/format'
import type { ImgFolder } from '../../lib/img'
import './blocks.css'

/** Content-page header: breadcrumbs, label, title, lead and optional actions, with an optional image. */
export function PageHeader({ label, title, lead, crumbs, actions, image, tone = 'ivory', children }: {
  label?: string; title: ReactNode; lead?: ReactNode; crumbs?: { name: string; to?: string }[]; actions?: ReactNode
  image?: { folder: ImgFolder; file: string; alt: string; focus?: string; ratio?: number }; tone?: 'ivory' | 'white'; children?: ReactNode
}) {
  return (
    <header className={cx('phead', tone === 'ivory' && 'bg-ivory', image && 'has-img')}>
      <div className="container phead-in">
        <div className="phead-copy">
          {crumbs && <Crumbs trail={crumbs} />}
          {label && <p className="t-label phead-label">{label}</p>}
          <h1 className="t-h1">{title}</h1>
          {lead && <p className="t-lead measure">{lead}</p>}
          {actions && <div className="phead-actions">{actions}</div>}
          {children}
        </div>
        {image && (
          <div className="phead-media">
            <Img folder={image.folder} name={image.file} alt={image.alt} sizes="(min-width: 64rem) 40vw, 100vw" ratio={image.ratio ?? 4 / 5} focus={image.focus} priority />
          </div>
        )}
      </div>
    </header>
  )
}

/** The studio's six real steps (How it works), numbered. */
export function Steps({ className }: { className?: string }) {
  return (
    <ol role="list" className={cx('steps', className)}>
      {content.howItWorks.steps.map((s, i) => (
        <li key={s.title} className="step" data-reveal>
          <span className="step-n t-num">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="step-t">{s.title}</h3>
          <p className="t-small t-muted">{s.text}</p>
        </li>
      ))}
    </ol>
  )
}

export function FaqSection({ title = 'Questions, answered', label = 'Good to know', items, aside, className }: {
  title?: string; label?: string; items: { q: string; a: string }[]; aside?: ReactNode; className?: string
}) {
  return (
    <section className={cx('section faq', className)} aria-labelledby="faq-title">
      <div className="container faq-grid">
        <header className="faq-head">
          <p className="t-label t-muted">{label}</p>
          <h2 id="faq-title" className="t-h2">{title}</h2>
          {aside ?? (
            <p className="t-small t-muted">Something else? <a href={askStylist()} target="_blank" rel="noopener noreferrer" className="link">Ask the studio on WhatsApp</a>.</p>
          )}
        </header>
        <Accordion items={items} group="faq" />
      </div>
    </section>
  )
}

/** Closing call to action: the studio's own "Found something you love?" copy. */
export function CtaBand({ context, className }: { context?: string; className?: string }) {
  const f = content.home.finalCta
  return (
    <section className={cx('cta', className)} aria-labelledby="cta-title">
      <div className="container cta-in">
        <p className="t-label">{f.eyebrow}</p>
        <h2 id="cta-title" className="t-h1">{f.title}</h2>
        <p className="t-lead measure">{f.text}</p>
        <div className="cta-actions">
          <Button href={askStylist(context)} variant="light" size="lg" icon="whatsapp">Message on WhatsApp</Button>
          <Button to="/shop" variant="outline-light" size="lg">Shop the collection</Button>
        </div>
      </div>
    </section>
  )
}

/** Large image tile with overlaid label, used for editorial entry points. */
export function ImageTile({ to, folder, file, alt, label, title, cta, ratio = 4 / 5, sizes, focus, className }: {
  to: string; folder: ImgFolder; file: string; alt: string; label?: string; title: string; cta: string; ratio?: number; sizes: string; focus?: string; className?: string
}) {
  return (
    <Link to={to} className={cx('itile', className)}>
      <Img folder={folder} name={file} alt={alt} sizes={sizes} ratio={ratio} focus={focus} />
      <span className="itile-copy">
        {label && <span className="t-label">{label}</span>}
        <span className="itile-t">{title}</span>
        <span className="itile-cta">{cta}</span>
      </span>
    </Link>
  )
}
