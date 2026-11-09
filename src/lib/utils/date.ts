import { format, parseISO, isAfter, isBefore, formatDistanceToNow } from "date-fns";

export const KOLKATA_TIMEZONE = "Asia/Kolkata";
export const EARLIEST_ALLOWED_DATE = "2026-11-25";

/**
 * Format a YYYY-MM-DD or ISO date string into readable Indian English format
 * e.g., "27 November 2026"
 */
export function formatDisplayDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "TBD";
  try {
    const d = typeof dateStr === "string" && dateStr.length === 10 
      ? parseISO(dateStr) 
      : new Date(dateStr);
    return format(d, "d MMMM yyyy");
  } catch {
    return dateStr;
  }
}

/**
 * Short date format e.g. "27 Nov 2026"
 */
export function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "TBD";
  try {
    const d = typeof dateStr === "string" && dateStr.length === 10 
      ? parseISO(dateStr) 
      : new Date(dateStr);
    return format(d, "dd MMM yyyy");
  } catch {
    return dateStr;
  }
}

/**
 * Full format with weekday e.g. "Friday, 27 November 2026"
 */
export function formatWithDay(dateStr: string | null | undefined): string {
  if (!dateStr) return "TBD";
  try {
    const d = typeof dateStr === "string" && dateStr.length === 10 
      ? parseISO(dateStr) 
      : new Date(dateStr);
    return format(d, "EEEE, d MMMM yyyy");
  } catch {
    return dateStr;
  }
}

/**
 * Format full date and time e.g. "Monday, 23 November 2026 at 11:59 PM"
 */
export function formatFullDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "TBD";
  try {
    const d = new Date(dateStr);
    return format(d, "EEEE, d MMMM yyyy 'at' h:mm a");
  } catch {
    return String(dateStr);
  }
}

/**
 * Convert ISO string or date to YYYY-MM-DDTHH:mm format for datetime-local inputs
 */
export function formatDateTimeLocal(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}

/**
 * Format timestamp for chat messages e.g. "4:30 PM"
 */
export function formatChatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return format(d, "h:mm a");
  } catch {
    return "";
  }
}

/**
 * Relative time distance e.g. "2 hours ago"
 */
export function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "";
  }
}

/**
 * Check if a date string (YYYY-MM-DD) is after Nov 24, 2026 (>= 2026-11-25)
 */
export function isEligibleReunionDate(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr >= EARLIEST_ALLOWED_DATE;
}

/**
 * Calculate countdown object (days, hours, minutes, seconds)
 */
export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function getTimeRemaining(targetDateStr: string): TimeRemaining {
  const target = new Date(targetDateStr).getTime();
  const now = Date.now();
  const totalMs = target - now;

  if (totalMs <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const seconds = Math.floor((totalMs / 1000) % 60);
  const minutes = Math.floor((totalMs / 1000 / 60) % 60);
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
}

