import React from "react";
import { GraduationCap, Heart, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Campus Reunion Poll &bull; B.Tech Batch 2022-2026
            </span>
          </div>

          {/* User Requested: "with love form Vaibhav" */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-2xs">
            <span>with love form Vaibhav</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline animate-pulse" />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle showLabel />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-2">
          <span>Private Batch Poll &bull; All Rights Reserved</span>
          <span>with love from Vaibhav &bull; Class Representative (2022–2026)</span>
        </div>
      </div>
    </footer>
  );
}

