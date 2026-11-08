import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get initials from a full name, e.g. "Rahul Das" -> "RD"
 */
export function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Color palette for user avatars
 */
const AVATAR_PALETTE = [
  { className: "bg-indigo-600 text-white", bg: "#4F46E5", color: "#FFFFFF" },
  { className: "bg-violet-600 text-white", bg: "#7C3AED", color: "#FFFFFF" },
  { className: "bg-amber-600 text-white", bg: "#D97706", color: "#FFFFFF" },
  { className: "bg-emerald-600 text-white", bg: "#059669", color: "#FFFFFF" },
  { className: "bg-rose-600 text-white", bg: "#E11D48", color: "#FFFFFF" },
  { className: "bg-cyan-600 text-white", bg: "#0891B2", color: "#FFFFFF" },
  { className: "bg-blue-600 text-white", bg: "#2563EB", color: "#FFFFFF" },
  { className: "bg-purple-600 text-white", bg: "#9333EA", color: "#FFFFFF" },
];

/**
 * Generate a consistent vibrant color avatar background based on member name
 */
export function getAvatarColor(name: string): string {
  if (!name || typeof name !== "string") return AVATAR_PALETTE[0].className;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length].className;
}

/**
 * Fallback inline style ensuring avatar background and text color NEVER appear white/blank
 */
export function getAvatarStyle(name: string): React.CSSProperties {
  if (!name || typeof name !== "string") {
    return { backgroundColor: AVATAR_PALETTE[0].bg, color: AVATAR_PALETTE[0].color };
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const entry = AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
  return {
    backgroundColor: entry.bg,
    color: entry.color,
  };
}

/**
 * Trigger celebratory confetti effect
 */
export async function triggerConfetti() {
  try {
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4F46E5", "#7C3AED", "#F59E0B", "#10B981"],
    });
  } catch (err) {
    // Canvas confetti not supported in SSR/headless
  }
}

