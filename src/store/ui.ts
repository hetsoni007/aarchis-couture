import { create } from 'zustand'

export interface Toast { id: number; message: string; tone?: 'default' | 'success'; action?: { label: string; run: () => void } }

interface UiState {
  hydrated: boolean
  setHydrated: () => void
  bagOpen: boolean
  searchOpen: boolean
  setSearch: (v: boolean) => void
  menuOpen: boolean
  quick: string | null
  setQuick: (slug: string | null) => void
  toasts: Toast[]
  bagBump: number
  setBag: (v: boolean) => void
  setMenu: (v: boolean) => void
  toast: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
  bump: () => void
}

let seq = 0
export const useUi = create<UiState>()((set, get) => ({
  hydrated: false,
  setHydrated: () => set({ hydrated: true }),
  bagOpen: false,
  searchOpen: false,
  setSearch: (searchOpen) => set({ searchOpen, menuOpen: false, bagOpen: false }),
  menuOpen: false,
  quick: null,
  setQuick: (quick) => set({ quick }),
  toasts: [],
  bagBump: 0,
  setBag: (bagOpen) => set({ bagOpen, menuOpen: false, searchOpen: false }),
  setMenu: (menuOpen) => set({ menuOpen, bagOpen: false, searchOpen: false }),
  toast: (t) => {
    const id = ++seq
    set({ toasts: [...get().toasts.slice(-2), { ...t, id }] })
    setTimeout(() => get().dismiss(id), t.action ? 6000 : 4000)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  bump: () => set({ bagBump: get().bagBump + 1 }),
}))

