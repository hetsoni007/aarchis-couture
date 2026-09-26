import { createJSONStorage } from 'zustand/middleware'

/** localStorage that never throws (private windows, blocked storage, previews). */
export const safeStorage = createJSONStorage(() => {
  try {
    const k = '__aar_probe__'
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
    return localStorage
  } catch {
    const mem = new Map<string, string>()
    return {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    }
  }
})
