import React from "react";
import { GraduationCap, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white py-8 text-center text-sm text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-800">
              Campus Reunion Poll &bull; B.Tech Batch 2022-2026
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>Built with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for our college graduation reunion</span>
          </div>

          <div className="text-xs text-slate-400">
            All rights reserved &bull; Private Batch Poll
          </div>
        </div>
      </div>
    </footer>
  );
}

