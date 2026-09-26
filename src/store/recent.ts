import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeStorage } from './persist'
import { getProduct } from '../lib/catalog'

interface RecentState { slugs: string[]; push: (slug: string) => void }

/** Recently viewed pieces — newest first, max 12, this device only. */
export const useRecent = create<RecentState>()(
  persist(
    (set, get) => ({
      slugs: [],
      push: (slug) => set({ slugs: [slug, ...get().slugs.filter((s) => s !== slug)].slice(0, 12) }),
    }),
    {
      name: 'aarchis-recent', storage: safeStorage, skipHydration: true, version: 1,
      merge: (p, c) => ({ ...c, slugs: ((p as Partial<RecentState>)?.slugs ?? []).filter((s) => getProduct(s)) }),
    },
  ),
)
