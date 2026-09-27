import { Link } from 'react-router-dom'
import { Drawer, Price, Qty } from '../ui/Kit'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Img } from '../ui/Img'
import { Icon } from '../ui/Icon'
import { useUi } from '../../store/ui'
import { useBag, bagCount, bagTotal, bagHasIndicative, type BagItem } from '../../store/bag'
import { categories, categoryUrl, getProduct, productUrl } from '../../lib/catalog'
import { describeCustom } from '../product/customLabels'
import { formatINR, cx } from '../../lib/format'
import { NAV_LABEL } from '../../lib/nav'
import './layout.css'

export function BagLine({ item, compact }: { item: BagItem; compact?: boolean }) {
  const p = getProduct(item.slug)!
  const remove = useBag((s) => s.remove)
  const restore = useBag((s) => s.restore)
  const setQty = useBag((s) => s.setQty)
  const toast = useUi((s) => s.toast)
  return (
    <li className={cx('line', compact && 'is-compact')}>
      <Link to={productUrl(p)} className="line-img" tabIndex={-1} aria-hidden="true">
        <Img folder="p" name={p.image.file} alt="" sizes="120px" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} />
      </Link>
      <div className="line-body">
        <div className="line-top">
          <Link to={productUrl(p)} className="line-name">{p.name}</Link>
          <Price inr={p.price.inr * item.qty} from={false} className="line-price" />
        </div>
        <p className="line-cat t-muted">{p.categoryLabel}</p>
        <ul role="list" className="line-opts">{describeCustom(p, item.custom).map((o) => <li key={o}>{o}</li>)}</ul>
        {item.custom.notes && <p className="line-notes">“{item.custom.notes}”</p>}
        <div className="line-actions">
          <Qty value={item.qty} onChange={(n) => setQty(item.id, n)} label={p.name} />
          <button className="line-rm" onClick={() => {
            const it = remove(item.id)
            if (it) toast({ message: `${p.name} removed from your bag.`, action: { label: 'Undo', run: () => restore(it) } })
          }}>Remove</button>
        </div>
      </div>
    </li>
  )
}

export function CartDrawer() {
  const open = useUi((s) => s.bagOpen)
  const setBag = useUi((s) => s.setBag)
  const items = useBag((s) => s.items)
  const n = bagCount(items)
  return (
    <Drawer open={open} onClose={() => setBag(false)} title={`Your bag${n ? ` (${n})` : ''}`} mobile="side"
      footer={items.length ? (
        <div className="cart-foot">
          <div className="cart-row"><span>Subtotal</span><span className="t-num">{formatINR(bagTotal(items))}</span></div>
          <p className="t-small t-muted">{bagHasIndicative(items) ? 'Includes indicative starting prices. ' : ''}Shipping calculated at checkout.</p>
          <Button to="/checkout" block onClick={() => setBag(false)}>Checkout</Button>
          <Button to="/bag" variant="secondary" block onClick={() => setBag(false)}>View bag</Button>
        </div>
      ) : undefined}>
      {items.length ? (
        <>
          <p className="cart-note"><Icon name="scissors" size={16} /> Every piece is made to order for you in Ahmedabad.</p>
          <ul role="list" className="lines">{items.map((i) => <BagLine key={i.id} item={i} compact />)}</ul>
        </>
      ) : (
        <div>
          <EmptyState kind="bag" title="Your bag is empty"
            actions={<Button to="/shop" onClick={() => setBag(false)}>Shop the collection</Button>}>
            Pieces you add will wait here while you browse.
          </EmptyState>
          <ul role="list" className="cart-cats">
            {categories.map((c) => <li key={c.key}><Link to={categoryUrl(c)} onClick={() => setBag(false)}>{NAV_LABEL[c.key]} <Icon name="chevronR" size={14} /></Link></li>)}
          </ul>
        </div>
      )}
    </Drawer>
  )
}
