import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import './ui.css'

const ICON: Record<string, IconName> = { bag: 'bag', wishlist: 'heart', results: 'search', lost: 'compass', orders: 'box', measure: 'ruler' }

export function EmptyState({ kind, title, children, actions, as: H = 'h2' }: {
  kind: keyof typeof ICON; title: string; children?: ReactNode; actions?: ReactNode; as?: 'h1' | 'h2'
}) {
  return (
    <div className="empty">
      <span className="empty-ic" aria-hidden="true"><Icon name={ICON[kind]} size={26} /></span>
      <H className="t-h3 empty-title">{title}</H>
      {children && <div className="empty-body t-muted">{children}</div>}
      {actions && <div className="empty-actions">{actions}</div>}
    </div>
  )
}
