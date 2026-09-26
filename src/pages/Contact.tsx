import { useRef, useState } from 'react'
import { Seo, ORG_LD, breadcrumbLd } from '../lib/seo'
import { content } from '../lib/catalog'
import { askStylist, waLink } from '../lib/whatsapp'
import { SITE_URL } from '../lib/config'
import { cx } from '../lib/format'
import { PageHeader } from '../components/brand/Blocks'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import './content.css'

/** The live site's style quiz: the same four questions and the same WhatsApp hand-off. */
function StyleQuiz() {
  const steps = content.contactPage.quiz
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [i, setI] = useState(0)
  const [name, setName] = useState('')
  const [sent, setSent] = useState(false)
  const total = steps.length + 1
  const done = i >= steps.length
  const heading = useRef<HTMLHeadingElement>(null)
  const move = (n: number) => { setI(n); requestAnimationFrame(() => heading.current?.focus()) }
  const submit = () => {
    const msg = `Hi Aarchi's! I'd love to enquire\n• Occasion: ${answers.occasion ?? '-'}\n• Piece: ${answers.piece ?? '-'}\n• Timeline: ${answers.timeline ?? '-'}\n• Deliver to: ${answers.location ?? '-'}\n${name ? `• Name: ${name}\n` : ''}\n(via ${SITE_URL.replace('https://', '')})`
    window.open(waLink(msg), '_blank', 'noopener')
    setSent(true)
  }
  if (sent) {
    return (
      <div className="quiz-done" role="status">
        <span className="rsv-check" aria-hidden="true"><Icon name="check" size={24} /></span>
        <h3 className="t-h3">Opening WhatsApp…</h3>
        <p className="t-muted">Send the message and the studio will pick it up with ideas and a quote.</p>
        <Button variant="secondary" onClick={() => { setSent(false); setI(0); setAnswers({}) }}>Start again</Button>
      </div>
    )
  }
  return (
    <div className="quiz">
      <div className="quiz-top">
        <span className="t-small t-muted">Step {Math.min(i + 1, total)} of {total}</span>
        <span className="quiz-bar" aria-hidden="true"><i style={{ width: `${(i / total) * 100}%` }} /></span>
      </div>
      {!done ? (
        <fieldset className="quiz-step" key={i}>
          <legend><h3 ref={heading} tabIndex={-1} className="t-h3 quiz-q">{steps[i].q}</h3></legend>
          <div className="quiz-opts">
            {steps[i].opts.map((o) => (
              <button key={o} className={cx('quiz-opt', answers[steps[i].key] === o && 'is-on')} aria-pressed={answers[steps[i].key] === o}
                onClick={() => { setAnswers({ ...answers, [steps[i].key]: o }); move(i + 1) }}>{o}</button>
            ))}
          </div>
        </fieldset>
      ) : (
        <div className="quiz-step">
          <h3 ref={heading} tabIndex={-1} className="t-h3 quiz-q">Lovely. And your name?</h3>
          <p className="quiz-summary">{steps.map((s) => <span key={s.key} className="chip">{answers[s.key]}</span>)}</p>
          <form className="quiz-name" onSubmit={(e) => { e.preventDefault(); submit() }}>
            <label htmlFor="quiz-name" className="sr-only">Your name</label>
            <input id="quiz-name" className="fld-input" placeholder="Your name" autoComplete="name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" icon="whatsapp">Send on WhatsApp</Button>
          </form>
        </div>
      )}
      {i > 0 && <button className="quiz-back" onClick={() => move(i - 1)}><Icon name="chevronL" size={14} /> Back</button>}
    </div>
  )
}

export default function Contact() {
  const c = content.contact
  const cp = content.contactPage
  return (
    <div>
      <Seo title="Contact — book a consultation" description={cp.metaDescription} jsonLd={[ORG_LD, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Contact' }])]} />
      <PageHeader label={cp.eyebrow} title={cp.title} lead={c.intro} crumbs={[{ name: 'Home', to: '/' }, { name: 'Contact' }]} />
      <section className="section" aria-label="Ways to reach us">
        <div className="container contact-grid">
          <div className="contact-cards">
            <article className="ccard">
              <Icon name="whatsapp" size={22} />
              <p className="t-label t-muted">WhatsApp / phone</p>
              <p className="ccard-big t-num">{c.whatsappDisplay}</p>
              <div className="ccard-actions">
                <Button href={askStylist()} icon="whatsapp">Message on WhatsApp</Button>
                <Button href={`tel:+${c.whatsappE164}`} variant="secondary" external={false} icon="phone">Call the studio</Button>
              </div>
            </article>
            <article className="ccard">
              <Icon name="pin" size={22} />
              <p className="t-label t-muted">Studio</p>
              <p className="ccard-big">{c.studio}</p>
              <p className="t-muted t-small">{c.visits}. Outstation and international clients are looked after end to end on WhatsApp.</p>
            </article>
            <article className="ccard">
              <Icon name="instagram" size={22} />
              <p className="t-label t-muted">Follow the work</p>
              <ul role="list" className="ccard-social">
                <li><a href={c.social.instagram.url} target="_blank" rel="noopener noreferrer"><Icon name="instagram" size={18} /> Instagram <span className="t-muted">{c.social.instagram.handle}</span></a></li>
                <li><a href={c.social.facebook.url} target="_blank" rel="noopener noreferrer"><Icon name="facebook" size={18} /> Facebook</a></li>
                <li><a href={c.social.pinterest.url} target="_blank" rel="noopener noreferrer"><Icon name="pinterest" size={18} /> Pinterest</a></li>
                <li><a href={c.social.linkedin.url} target="_blank" rel="noopener noreferrer"><Icon name="linkedin" size={18} /> LinkedIn</a></li>
              </ul>
            </article>
          </div>
          <section className="quiz-card" aria-labelledby="quiz-title">
            <p className="t-label t-muted">Style quiz</p>
            <h2 id="quiz-title" className="t-h2">{cp.quizTitle}</h2>
            <p className="t-muted">{cp.quizLead}</p>
            <StyleQuiz />
          </section>
        </div>
      </section>
    </div>
  )
}
