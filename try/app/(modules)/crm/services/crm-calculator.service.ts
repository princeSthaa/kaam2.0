export function calculateCustomerLifetimeValue(orders: { totalAmount?: number; amount?: number }[]): number {
  if (!orders || orders.length === 0) return 0;
  return orders.reduce((total, order) => {
    const val = Number(order.totalAmount || order.amount || 0);
    return total + val;
  }, 0);
}

export function applyCustomerDiscount(subtotal: number, discountPercentage: number): { discountAmount: number; finalTotal: number } {
  const pct = Math.max(0, Math.min(100, discountPercentage || 0));
  const discountAmount = (subtotal * pct) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);
  return { discountAmount, finalTotal };
}
