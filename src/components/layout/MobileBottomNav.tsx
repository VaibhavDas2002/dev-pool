"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  Vote, 
  BarChart3, 
  MessageSquare, 
  Users, 
  ShieldAlert 
} from "lucide-react";

interface MobileBottomNavProps {
  user?: {
    id: string;
    full_name: string;
    role: "member" | "admin";
  } | null;
}

export function MobileBottomNav({ user }: MobileBottomNavProps) {
  const pathname = usePathname();

  if (!user) return null; // Only for logged-in users

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Sparkles },
    { href: "/vote", label: "Vote", icon: Vote },
    { href: "/results", label: "Results", icon: BarChart3 },
    { href: "/discussion", label: "Chat", icon: MessageSquare },
    { href: "/members", label: "Friends", icon: Users },
  ];

  if (user.role === "admin") {
    navItems.push({ href: "/admin", label: "Admin", icon: ShieldAlert });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-all">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative select-none active:scale-90 ${
                isActive
                  ? "text-indigo-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 -translate-y-0.5 scale-105"
                    : "bg-transparent text-slate-500"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${
                isActive ? "font-extrabold text-indigo-700" : "font-medium"
              }`}>
                {item.label}
              </span>

              {/* Active glow dot */}
              {isActive && (
                <span className="absolute bottom-0 h-1 w-1 rounded-full bg-indigo-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

