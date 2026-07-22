export function formatRs(amount: number): string {
  return `Rs. ${(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNepaliDate(dateVal: any): string {
  if (!dateVal) return "N/A";
  let dateStr = String(dateVal).trim();
  if (dateStr.includes("T")) dateStr = dateStr.split("T")[0];
  if (dateStr.includes(" ")) dateStr = dateStr.split(" ")[0];

  // Handle C# DateTime.MinValue (0001-01-01) or uninitialized dates
  if (dateStr.startsWith("0001") || dateStr.startsWith("0000") || dateStr === "1970-01-01") {
    return "N/A";
  }

  // Already BS date (2070-2100)
  const firstYear = parseInt(dateStr.split("-")[0], 10);
  if (!isNaN(firstYear) && firstYear >= 2070 && firstYear <= 2100) {
    return dateStr.includes("BS") ? dateStr : `${dateStr} BS`;
  }

  const d = new Date(dateVal);
  if (isNaN(d.getTime()) || d.getFullYear() < 2000) {
    return dateStr.includes("BS") ? dateStr : `${dateStr} BS`;
  }

  const adYear = d.getFullYear();
  const adMonth = d.getMonth();
  const adDay = d.getDate();

  const bsYear = adYear + (adMonth > 3 || (adMonth === 3 && adDay >= 14) ? 57 : 56);
  const bsMonthNum = ((adMonth + 8) % 12) + 1;
  const mStr = String(bsMonthNum).padStart(2, "0");
  const dStr = String(adDay).padStart(2, "0");

  return `${bsYear}-${mStr}-${dStr} BS`;
}

export function adToBs(adStr: string): string {
  if (!adStr) return "";
  const datePart = String(adStr).split("T")[0].trim();
  if (!datePart) return "";

  if (typeof window !== "undefined" && (window as any).NepaliFunctions) {
    try {
      const bsVal = (window as any).NepaliFunctions.AD2BS(datePart, "YYYY-MM-DD", "YYYY-MM-DD");
      if (bsVal) {
        return typeof bsVal === "string"
          ? bsVal
          : `${bsVal.year}-${String(bsVal.month).padStart(2, "0")}-${String(bsVal.day).padStart(2, "0")}`;
      }
    } catch (e) {}
  }

  return formatNepaliDate(adStr).replace(" BS", "");
}

export function calculatePlanProgress(stages: any[]): number {
  if (!stages || stages.length === 0) return 0;
  const completed = stages.filter((s: any) => {
    const st = String(s.status || s.Status || "").toLowerCase();
    return st === "completed" || st === "5";
  }).length;
  const active = stages.filter((s: any) => {
    const st = String(s.status || s.Status || "").toLowerCase();
    return st === "active" || st === "in progress" || st === "2";
  }).length;

  return Math.min(100, Math.round(((completed + active * 0.5) / stages.length) * 100));
}

export function getStatusStyle(status: string, priority: string) {
  const st = String(status || "").toLowerCase();
  const pr = String(priority || "").toLowerCase();

  if (st === "completed" || st === "5") {
    return { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" };
  }
  if (st === "on hold" || st === "onhold" || st === "3" || st === "delayed") {
    return { dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200", bar: "bg-red-500" };
  }
  if (pr === "high" || pr === "urgent" || pr === "critical") {
    return { dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-200", bar: "bg-orange-500" };
  }
  return { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200", bar: "bg-blue-500" };
}
