/**
 * Utility functions for Nepali (BS) date conversion and formatting.
 */

/**
 * Converts AD (Gregorian) date string "YYYY-MM-DD" to BS (Nepali) date string "YYYY-MM-DD".
 * If the input date is already in BS format (year between 2070 and 2100), it returns it as-is.
 */
export function adToBs(adStr: string): string {
  if (!adStr) return "";
  const datePart = String(adStr).split("T")[0].trim();
  if (!datePart) return "";

  // If already BS date (year 2070-2100)
  const year = parseInt(datePart.split("-")[0], 10);
  if (!isNaN(year) && year >= 2070 && year <= 2100) {
    return datePart;
  }

  // Attempt window.NepaliFunctions conversion if sajanmaharjan datepicker script loaded
  if (typeof window !== "undefined" && (window as any).NepaliFunctions) {
    try {
      const bsVal = (window as any).NepaliFunctions.AD2BS(datePart, "YYYY-MM-DD", "YYYY-MM-DD");
      if (bsVal) {
        return typeof bsVal === "string"
          ? bsVal
          : `${bsVal.year}-${String(bsVal.month).padStart(2, "0")}-${String(bsVal.day).padStart(2, "0")}`;
      }
    } catch (e) {
      // Fallback to calculation below
    }
  }

  // Math fallback approximation if script hasn't loaded yet
  const d = new Date(adStr);
  if (isNaN(d.getTime()) || d.getFullYear() < 1900) return datePart;

  const adYear = d.getFullYear();
  const adMonth = d.getMonth();
  const adDay = d.getDate();

  const bsYear = adYear + (adMonth > 3 || (adMonth === 3 && adDay >= 14) ? 57 : 56);
  const bsMonthNum = ((adMonth + 8) % 12) + 1;
  const mStr = String(bsMonthNum).padStart(2, "0");
  const dStr = String(adDay).padStart(2, "0");

  return `${bsYear}-${mStr}-${dStr}`;
}

/** Converts a BS date string to an AD date string for API storage. */
export function bsToAd(bsStr: string): string {
  if (!bsStr) return "";
  const datePart = String(bsStr).split("T")[0].trim();
  const year = parseInt(datePart.split("-")[0], 10);
  if (isNaN(year) || year < 2070 || year > 2100) return datePart;

  if (typeof window !== "undefined" && (window as any).NepaliFunctions) {
    try {
      const adVal = (window as any).NepaliFunctions.BS2AD(datePart, "YYYY-MM-DD", "YYYY-MM-DD");
      if (adVal) return typeof adVal === "string" ? adVal : `${adVal.year}-${String(adVal.month).padStart(2, "0")}-${String(adVal.day).padStart(2, "0")}`;
    } catch {
      // Use the deterministic fallback below if the picker library rejects the date.
    }
  }

  const [bsYear, bsMonth, bsDay] = datePart.split("-").map(Number);
  const adYear = bsYear - (bsMonth > 9 || (bsMonth === 9 && bsDay >= 1) ? 57 : 56);
  const adMonth = ((bsMonth + 2) % 12) + 1;
  return `${adYear}-${String(adMonth).padStart(2, "0")}-${String(bsDay).padStart(2, "0")}`;
}
