import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeStorage } from './persist'

export type Unit = 'cm' | 'in'
export type BodyKind = 'women' | 'men'
export interface MeasureProfile { id: string; name: string; kind: BodyKind; unit: Unit; values: Record<string, number>; updatedAt: number }

interface MeasureState {
  profiles: MeasureProfile[]
  upsert: (p: Omit<MeasureProfile, 'id' | 'updatedAt'> & { id?: string }) => MeasureProfile
  remove: (id: string) => void
}

export const useMeasurements = create<MeasureState>()(
  persist(
    (set, get) => ({
      profiles: [],
      upsert: (p) => {
        const profile: MeasureProfile = { ...p, id: p.id ?? crypto.randomUUID?.() ?? String(Date.now()), updatedAt: Date.now() }
        const exists = get().profiles.some((x) => x.id === profile.id)
        set({ profiles: exists ? get().profiles.map((x) => (x.id === profile.id ? profile : x)) : [...get().profiles, profile] })
        return profile
      },
      remove: (id) => set({ profiles: get().profiles.filter((x) => x.id !== id) }),
    }),
    { name: 'aarchis-measurements', storage: safeStorage, skipHydration: true, version: 1 },
  ),
)
