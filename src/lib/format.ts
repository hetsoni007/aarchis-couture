const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
/** ₹1,45,000 — Indian digit grouping */
export const formatINR = (n: number) => inr.format(n)
export const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`
export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ')
