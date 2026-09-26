import { create } from 'zustand'

export interface Toast { id: number; message: string; tone?: 'default' | 'success'; action?: { label: string; run: () => void } }

interface UiState {
  hydrated: boolean
  setHydrated: () => void
  bagOpen: boolean
  menuOpen: boolean
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
  menuOpen: false,
  toasts: [],
  bagBump: 0,
  setBag: (bagOpen) => set({ bagOpen, menuOpen: false }),
  setMenu: (menuOpen) => set({ menuOpen, bagOpen: false }),
  toast: (t) => {
    const id = ++seq
    set({ toasts: [...get().toasts.slice(-2), { ...t, id }] })
    setTimeout(() => get().dismiss(id), t.action ? 6000 : 4000)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  bump: () => set({ bagBump: get().bagBump + 1 }),
}))

