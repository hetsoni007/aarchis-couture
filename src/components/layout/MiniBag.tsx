import { Link } from 'react-router-dom'
import { Sheet, Price, Qty } from '../ui/Kit'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Img } from '../ui/Img'
import { useUi } from '../../store/ui'
import { useBag, bagTotal, bagHasIndicative, type BagItem } from '../../store/bag'
import { getProduct, productUrl } from '../../lib/catalog'
import { describeCustom } from '../product/customLabels'
import { formatINR } from '../../lib/format'
import { askStylist } from '../../lib/whatsapp'
import './layout.css'

export function BagLine({ item, compact }: { item: BagItem; compact?: boolean }) {
  const p = getProduct(item.slug)!
  const remove = useBag((s) => s.remove)
  const restore = useBag((s) => s.restore)
  const setQty = useBag((s) => s.setQty)
  const toast = useUi((s) => s.toast)
  return (
    <li className={`bagline ${compact ? 'is-compact' : ''}`}>
      <Link to={productUrl(p)} className="bagline-img" tabIndex={-1} aria-hidden="true">
        <Img folder="p" name={p.image.file} alt="" sizes="96px" ratio={4 / 5} fit={p.image.fit} focus={p.image.focus} />
      </Link>
      <div className="bagline-body">
        <p className="eyebrow plain">{p.categoryLabel}</p>
        <Link to={productUrl(p)} className="bagline-name">{p.name}</Link>
        <p className="bagline-opts muted">{describeCustom(p, item.custom).join(' · ')}</p>
        <div className="bagline-row">
          <Qty value={item.qty} onChange={(n) => setQty(item.id, n)} label={p.name} />
          <Price inr={p.price.inr * item.qty} indicative={p.price.placeholder} from={false} />
        </div>
        <button className="bagline-rm link-thread" onClick={() => {
          const it = remove(item.id)
          if (it) toast({ message: `${p.name} set aside.`, action: { label: 'Undo', run: () => restore(it) } })
        }}>Remove</button>
      </div>
    </li>
  )
}

export function MiniBag() {
  const open = useUi((s) => s.bagOpen)
  const setBag = useUi((s) => s.setBag)
  const items = useBag((s) => s.items)
  const total = bagTotal(items)
  const indicative = bagHasIndicative(items)
  return (
    <Sheet open={open} onClose={() => setBag(false)} title={items.length ? 'Your bag' : 'Your bag'}
      footer={items.length ? (
        <div className="minibag-foot">
          <div className="minibag-total">
            <span>{indicative ? 'Indicative total' : 'Total'}</span>
            <span className="num">{formatINR(total)}</span>
          </div>
          <p className="small muted">No payment today. Archana confirms your final quote, timeline and deposit on WhatsApp before a single thread is cut.</p>
          <div className="minibag-btns">
            <Button to="/bag" variant="secondary" onClick={() => setBag(false)}>View bag</Button>
            <Button to="/checkout" onClick={() => setBag(false)}>Reserve</Button>
          </div>
        </div>
      ) : undefined}>
      {items.length ? (
        <ul role="list" className="baglist">{items.map((i) => <BagLine key={i.id} item={i} compact />)}</ul>
      ) : (
        <EmptyState kind="bag" title="Your bag is waiting for its first piece."
          actions={<>
            <Button to="/shop" onClick={() => setBag(false)}>Browse the collections</Button>
            <Button href={askStylist('choosing a piece')} variant="ghost" iconRight="arrow">Ask a stylist</Button>
          </>}>
          Every piece is cut to your measurements — start with one you love.
        </EmptyState>
      )}
    </Sheet>
  )
}
