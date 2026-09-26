import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeStorage } from './persist'
import { getProduct } from '../lib/catalog'

interface WishState { slugs: string[]; toggle: (slug: string) => boolean; remove: (slug: string) => void }

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const has = get().slugs.includes(slug)
        set({ slugs: has ? get().slugs.filter((s) => s !== slug) : [slug, ...get().slugs] })
        return !has
      },
      remove: (slug) => set({ slugs: get().slugs.filter((s) => s !== slug) }),
    }),
    {
      name: 'aarchis-wishlist', storage: safeStorage, skipHydration: true, version: 1,
      merge: (p, c) => ({ ...c, slugs: ((p as Partial<WishState>)?.slugs ?? []).filter((s) => getProduct(s)) }),
    },
  ),
)
