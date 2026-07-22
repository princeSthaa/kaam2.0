export function formatCurrency(amount: number): string {
  return `Rs. ${(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculateOrderTotal(items: { quantity: number; unitPrice: number; discount?: number }[]): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((total, item) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unitPrice || 0);
    const disc = Number(item.discount || 0);
    const lineTotal = qty * price - disc;
    return total + Math.max(0, lineTotal);
  }, 0);
}

export function getOrderStatusBadgeClass(status: string): string {
  const st = String(status || "").toLowerCase();
  if (st === "delivered" || st === "confirmed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (st === "in production" || st === "dispatched") return "bg-blue-50 text-blue-700 border-blue-200";
  if (st === "pending" || st === "draft") return "bg-amber-50 text-amber-700 border-amber-200";
  if (st === "cancelled") return "bg-red-50 text-red-700 border-red-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}
