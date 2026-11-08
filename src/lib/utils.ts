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
 * Generate a consistent vibrant color avatar background based on member name
 */
export function getAvatarColor(name: string): string {
  const colors = [
    "bg-indigo-600 text-white",
    "bg-violet-600 text-white",
    "bg-amber-600 text-white",
    "bg-emerald-600 text-white",
    "bg-rose-600 text-white",
    "bg-cyan-600 text-white",
    "bg-blue-600 text-white",
    "bg-purple-600 text-white",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
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
