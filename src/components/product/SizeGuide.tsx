import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Drawer } from '../ui/Kit'
import { Icon, type IconName } from '../ui/Icon'
import { MeasureHowTo } from './MeasureGuide'
import { cx } from '../../lib/format'
import type { BodyKind } from '../../store/measurements'

/** The three ways a piece can be fitted: the studio's own process, plus two self-serve routes. */
export const FIT_WAYS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'video', title: 'Measure with Archana', text: 'After you reserve, Archana takes your measurements with you on a guided WhatsApp video call. This is the studio’s own process.' },
  { icon: 'ruler', title: 'Enter your measurements', text: 'Use the visual guide to measure at home and save them to this device. Archana checks them before cutting.' },
  { icon: 'grid4', title: 'Choose a standard size', text: 'Pick XS–XXL as a starting point. Your fit is refined at the fitting review before the piece ships.' },
]

export function FitWays({ className }: { className?: string }) {
  return (
    <ul role="list" className={cx('fitways', className)}>
      {FIT_WAYS.map((w) => (
        <li key={w.title} className="fitway">
          <Icon name={w.icon} size={22} />
          <div><p className="fitway-t">{w.title}</p><p className="t-small t-muted">{w.text}</p></div>
        </li>
      ))}
    </ul>
  )
}

export function SizeTabs({ kind, onKind }: { kind: BodyKind; onKind: (k: BodyKind) => void }) {
  return (
    <div className="seg" role="tablist" aria-label="Measurements for">
      {(['women', 'men'] as BodyKind[]).map((k) => (
        <button key={k} role="tab" aria-selected={kind === k} className={cx(kind === k && 'is-on')} onClick={() => onKind(k)}>
          {k === 'women' ? 'Womenswear' : 'Menswear'}
        </button>
      ))}
    </div>
  )
}

export function SizeGuideDrawer({ open, onClose, initialKind = 'women' }: { open: boolean; onClose: () => void; initialKind?: BodyKind }) {
  const [kind, setKind] = useState<BodyKind>(initialKind)
  return (
    <Drawer open={open} onClose={onClose} title="Size & fit guide" size="lg" mobile="bottom">
      <div className="sg">
        <p className="t-lead">Every piece is cut to your measurements, so there’s no fixed size chart to squeeze into. Choose whichever route suits you.</p>
        <FitWays />
        <div className="sg-how">
          <div className="sg-how-head">
            <h3 className="t-h3">How to measure</h3>
            <SizeTabs kind={kind} onKind={setKind} />
          </div>
          <MeasureHowTo key={kind} kind={kind} />
        </div>
        <p className="t-small t-muted">Starred measurements are all the studio needs to begin. <Link to="/size-guide" className="link" onClick={onClose}>Open the full size &amp; fit guide</Link></p>
      </div>
    </Drawer>
  )
}
