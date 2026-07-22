export function calculateStockValuation(items: { quantity: number; unitCost: number }[]): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((total, item) => {
    const qty = Number(item.quantity || 0);
    const cost = Number(item.unitCost || 0);
    return total + qty * cost;
  }, 0);
}
