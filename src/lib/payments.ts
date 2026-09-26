/**
 * Payment seam. Made-to-measure pieces are priced after consultation (the studio's
 * real process), so v1 reserves without charging and hands the brief to the WhatsApp
 * concierge. When the studio fixes a deposit policy, implement this interface with a
 * gateway (e.g. Razorpay Checkout) and flip `ACTIVE_PROVIDER`.
 */
export interface DepositRequest { reference: string; amountINR: number; customer: { name: string; phone: string; email?: string } }
export interface PaymentProvider { id: string; label: string; collectDeposit(req: DepositRequest): Promise<{ ok: boolean; paymentId?: string }> }

export const conciergeProvider: PaymentProvider = {
  id: 'concierge',
  label: 'Confirm with the studio on WhatsApp',
  async collectDeposit() { return { ok: true } },
}

export const ACTIVE_PROVIDER: PaymentProvider = conciergeProvider
