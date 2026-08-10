export const draftStorageKey = "kaam.productionPlanDrafts.v1";

export function buildPlanNo(prefix: string) {
  const now = new Date();
  const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("");
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((part) => String(part).padStart(2, "0"))
    .join("");

  return `${prefix}-${date}-${time}`;
}

export function saveProductionDraft(plan: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const planNo = String(plan.planNo || plan.planId || plan.id || "");
  if (!planNo) return;

  let drafts: Array<Record<string, unknown>> = [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(draftStorageKey) || "[]");
    drafts = Array.isArray(parsed) ? parsed : [];
  } catch {
    drafts = [];
  }

  const nextDrafts = drafts.filter((draft) => String(draft.planNo || draft.planId || draft.id) !== planNo);
  nextDrafts.unshift(plan);
  window.localStorage.setItem(draftStorageKey, JSON.stringify(nextDrafts.slice(0, 100)));
}

export function normalizeSizeRows(sizes: Record<string, number> | Array<{ size: string; quantity: number }> | undefined) {
  if (Array.isArray(sizes)) return sizes;
  if (!sizes) return [];

  return Object.entries(sizes)
    .map(([size, quantity]) => ({ size, quantity: Number(quantity) || 0 }))
    .filter((row) => row.quantity > 0);
}
