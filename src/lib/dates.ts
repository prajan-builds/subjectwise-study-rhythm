// All "calendar day" logic is anchored to Asia/Kolkata so the app behaves the same on any device clock.
export const TZ = "Asia/Kolkata";

const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });

/** YYYY-MM-DD for an instant, in IST */
export function dayKey(d: Date = new Date()): string {
  return keyFmt.format(d);
}
export function todayKey(): string {
  return dayKey(new Date());
}
/** HH:MM in IST */
export function nowHM(d: Date = new Date()): string {
  return timeFmt.format(d);
}
/** Convert an IST date key (+ optional time) to an instant */
export function istInstant(key: string, time?: string): number {
  return Date.parse(`${key}T${time || "23:59"}:00+05:30`);
}
export function addDays(key: string, n: number): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function addMonths(key: string, n: number): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
}
export function diffDays(a: string, b: string): number {
  return Math.round((Date.parse(`${a}T12:00:00Z`) - Date.parse(`${b}T12:00:00Z`)) / 86400000);
}
/** 0=Sunday … 6=Saturday for an IST date key */
export function weekday(key: string): number {
  return new Date(`${key}T12:00:00Z`).getUTCDay();
}
/** Monday of the week containing key */
export function weekStart(key: string): string {
  const wd = weekday(key);
  return addDays(key, wd === 0 ? -6 : 1 - wd);
}
export function fmtDay(key: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }): string {
  return new Date(`${key}T12:00:00Z`).toLocaleDateString("en-IN", { ...opts, timeZone: "UTC" });
}
export function relDay(key: string): string {
  const d = diffDays(key, todayKey());
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d === -1) return "Yesterday";
  if (d < 0) return `${-d} days ago`;
  if (d < 7) return `In ${d} days`;
  return fmtDay(key);
}
export function fmtMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  if (h === 0) return `${r}m`;
  return r ? `${h}h ${r}m` : `${h}h`;
}
export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
