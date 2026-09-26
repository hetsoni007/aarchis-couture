import { useBag } from './bag'
import { useWishlist } from './wishlist'
import { useMeasurements } from './measurements'
import { useOrders } from './orders'

/** Persisted stores start empty (matching the prerendered HTML) and fill from storage after mount. */
export function rehydrateStores() {
  return Promise.all([useBag, useWishlist, useMeasurements, useOrders].map((s) => s.persist.rehydrate()))
}
