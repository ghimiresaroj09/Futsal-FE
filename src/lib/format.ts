/** Small formatting helpers used across the app. Adjust locales to taste. */

type DateInput = string | number | Date;

export function formatDate(date: DateInput, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(date),
  );
}

export function formatDateTime(date: DateInput, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amount,
  );
}

export function formatNumber(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** "13:30:00" or "13:30" → "1:30 PM" (12-hour clock with AM/PM). */
export function formatTime12h(time: string): string {
  const [hourRaw, minuteRaw] = time.split(":");
  const hour = Number(hourRaw);
  if (Number.isNaN(hour)) return time;

  const minute = minuteRaw ?? "00";
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minute} ${period}`;
}

export function truncate(
  text: string,
  maxLength: number,
  suffix = "…",
): string {
  return text.length > maxLength
    ? `${text.slice(0, maxLength - suffix.length)}${suffix}`
    : text;
}

/** "Ada Lovelace" → "AL", "ada@dev.io" → "ad" — used by avatars. */
export function getInitials(nameOrEmail: string): string {
  const name = nameOrEmail.split("@")[0]?.trim() ?? "";
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}
