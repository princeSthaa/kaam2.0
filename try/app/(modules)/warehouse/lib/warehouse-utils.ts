export function formatStockQty(qty: number, unit?: string): string {
  const q = Number(qty || 0).toLocaleString("en-US");
  const u = unit ? ` ${unit}` : " pcs";
  return `${q}${u}`;
}

export function getStockStatusBadgeClass(quantity: number, minThreshold = 10): string {
  if (quantity <= 0) return "bg-red-50 text-red-700 border-red-200";
  if (quantity <= minThreshold) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}
