import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeStorage } from './persist'
import type { BagItem } from './bag'
import type { MeasureProfile } from './measurements'

export interface ReservationLine extends BagItem { name: string; priceINR: number; indicative: boolean; profile?: MeasureProfile }
export interface Contact {
  name: string; phone: string; email: string; country: string; city: string; address: string; postcode: string; eventDate: string; occasion: string
}
export interface Reservation { ref: string; createdAt: number; lines: ReservationLine[]; contact: Contact; indicativeTotal: number; hasIndicative: boolean }

/** The studio's real six steps (How it works), plus "Reserved" in front. */
export const JOURNEY = ['Reserved', 'Consultation on WhatsApp', 'Design & fabric', 'Measurements', 'Crafted in Ahmedabad', 'Fitting review', 'Delivered to your door'] as const

interface OrdersState { reservations: Reservation[]; add: (r: Omit<Reservation, 'ref' | 'createdAt'>) => Reservation }

const makeRef = () => {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const r = crypto.getRandomValues(new Uint8Array(6))
  return 'AAR-' + Array.from(r, (n) => a[n % a.length]).join('')
}

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      reservations: [],
      add: (r) => {
        const res: Reservation = { ...r, ref: makeRef(), createdAt: Date.now() }
        set({ reservations: [res, ...get().reservations] })
        return res
      },
    }),
    { name: 'aarchis-reservations', storage: safeStorage, skipHydration: true, version: 1 },
  ),
)
