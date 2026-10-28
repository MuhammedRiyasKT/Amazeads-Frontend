/**
 * Standard Date Formatter for Amaze ERP
 * Formats dates consistently as YYYY-MM-DD across the entire application.
 */

export function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "—";

  try {
    if (typeof dateInput === "string") {
      const trimmed = dateInput.trim();
      if (!trimmed) return "—";

      // If it's already YYYY-MM-DD, return as-is directly (avoids timezone shift)
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }

      // If it's an ISO timestamp or date-time string
      const d = new Date(trimmed);
      if (isNaN(d.getTime())) {
        // Fallback: match YYYY-MM-DD prefix if present
        const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : trimmed;
      }

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return "—";
      const year = dateInput.getFullYear();
      const month = String(dateInput.getMonth() + 1).padStart(2, "0");
      const day = String(dateInput.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return "—";
  } catch {
    return typeof dateInput === "string" ? dateInput : "—";
  }
}

export const formatDateStyle = formatDate;
export const formatDateOnly = formatDate;
export default formatDate;
