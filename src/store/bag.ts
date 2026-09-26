import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeStorage } from './persist'
import { getProduct } from '../lib/catalog'

export type FitMode = 'video' | 'profile' | 'standard' | 'none' | 'unstitched' | 'tailored'
export interface Customisation {
  colour: string   // STUDIO_PALETTE id
  fabric: string   // fabric preference label
  fit: FitMode
  size?: string    // standard size when fit === 'standard'
  profileId?: string
  notes?: string
}
export interface BagItem { id: string; slug: string; qty: number; custom: Customisation; addedAt: number }

const sameCustom = (a: Customisation, b: Customisation) =>
  a.colour === b.colour && a.fabric === b.fabric && a.fit === b.fit && a.size === b.size && a.profileId === b.profileId && (a.notes ?? '') === (b.notes ?? '')

interface BagState {
  items: BagItem[]
  add: (slug: string, custom: Customisation) => BagItem
  remove: (id: string) => BagItem | undefined
  restore: (item: BagItem) => void
  update: (id: string, patch: Partial<Customisation>) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
}

export const MAX_QTY = 5

export const useBag = create<BagState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (slug, custom) => {
        const hit = get().items.find((i) => i.slug === slug && sameCustom(i.custom, custom))
        if (hit) {
          const next = { ...hit, qty: Math.min(MAX_QTY, hit.qty + 1) }
          set({ items: get().items.map((i) => (i.id === hit.id ? next : i)) })
          return next
        }
        const item: BagItem = { id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()), slug, qty: 1, custom, addedAt: Date.now() }
        set({ items: [...get().items, item] })
        return item
      },
      remove: (id) => {
        const it = get().items.find((i) => i.id === id)
        set({ items: get().items.filter((i) => i.id !== id) })
        return it
      },
      restore: (item) => set({ items: [...get().items, item].sort((a, b) => a.addedAt - b.addedAt) }),
      update: (id, patch) => set({ items: get().items.map((i) => (i.id === id ? { ...i, custom: { ...i.custom, ...patch } } : i)) }),
      setQty: (id, qty) => set({ items: get().items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : i)) }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'aarchis-bag',
      storage: safeStorage,
      skipHydration: true,
      version: 1,
      // drop anything that no longer exists in the catalogue
      merge: (persisted, current) => {
        const p = persisted as Partial<BagState> | undefined
        return { ...current, items: (p?.items ?? []).filter((i) => getProduct(i.slug)) }
      },
    },
  ),
)

export const bagCount = (items: BagItem[]) => items.reduce((n, i) => n + i.qty, 0)
export const bagTotal = (items: BagItem[]) =>
  items.reduce((sum, i) => sum + (getProduct(i.slug)?.price.inr ?? 0) * i.qty, 0)
export const bagHasIndicative = (items: BagItem[]) => items.some((i) => getProduct(i.slug)?.price.placeholder)
