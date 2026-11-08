"use client";

import React, { useEffect } from "react";
import { Trophy, CalendarCheck, MapPin, Sparkles } from "lucide-react";
import { formatDisplayDate, formatWithDay } from "@/lib/utils/date";
import { triggerConfetti } from "@/lib/utils";

interface WinnerBannerProps {
  finalizedDate: string;
  tieResolutionNote?: string | null;
}

export function WinnerBanner({ finalizedDate, tieResolutionNote }: WinnerBannerProps) {
  useEffect(() => {
    // Fire confetti when banner mounts
    triggerConfetti();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/15 mb-8">
      {/* Decorative gradient glow */}
      <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-violet-400/20 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-amber-300 border border-white/20">
            <Trophy className="h-3.5 w-3.5 fill-amber-300" />
            <span>Poll Closed & Official Date Confirmed</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            🎉 It&apos;s Official! We&apos;re Meeting on {formatDisplayDate(finalizedDate)}!
          </h2>

          <p className="text-sm sm:text-base text-indigo-100 max-w-2xl">
            Mark your calendar for <strong className="text-white underline decoration-amber-400">{formatWithDay(finalizedDate)}</strong>. Let&apos;s head back to campus together, collect our B.Tech degrees, and make unforgettable memories!
          </p>

          {tieResolutionNote && (
            <div className="mt-2 text-xs bg-black/20 text-indigo-200 px-3 py-1.5 rounded-lg border border-white/10 max-w-xl">
              <strong>Admin Note:</strong> {tieResolutionNote}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3">
            <MapPin className="h-5 w-5 text-amber-300" />
            <div className="text-left">
              <p className="text-[11px] uppercase font-bold tracking-wider text-indigo-200">Location</p>
              <p className="text-sm font-bold text-white">Main Admin Block</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3">
            <CalendarCheck className="h-5 w-5 text-emerald-300" />
            <div className="text-left">
              <p className="text-[11px] uppercase font-bold tracking-wider text-indigo-200">Reporting Time</p>
              <p className="text-sm font-bold text-white">10:30 AM IST</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

