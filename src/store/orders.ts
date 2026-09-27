import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeStorage } from './persist'
import type { BagItem } from './bag'

export interface OrderLine extends BagItem { name: string; priceINR: number; indicative: boolean }
export interface Contact {
  name: string; phone: string; email: string; country: string; city: string; address: string; postcode: string
}
export interface Order { ref: string; createdAt: number; lines: OrderLine[]; contact: Contact; total: number; hasIndicative: boolean }

interface OrdersState { orders: Order[]; add: (r: Omit<Order, 'ref' | 'createdAt'>) => Order }

const makeRef = () => {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const r = crypto.getRandomValues(new Uint8Array(6))
  return 'AAR-' + Array.from(r, (n) => a[n % a.length]).join('')
}

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      add: (r) => {
        const order: Order = { ...r, ref: makeRef(), createdAt: Date.now() }
        set({ orders: [order, ...get().orders] })
        return order
      },
    }),
    { name: 'aarchis-orders', storage: safeStorage, skipHydration: true, version: 2 },
  ),
)
