"use client";

import React, { useEffect, useState } from "react";
import { getTimeRemaining, TimeRemaining } from "@/lib/utils/date";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
  isVisitDate?: boolean;
}

export function CountdownTimer({ targetDate, label = "Time Remaining", isVisitDate = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeRemaining(targetDate));

    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm animate-pulse">
        <Clock className="h-4 w-4" />
        <span>Calculating time...</span>
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
        <Clock className="h-3.5 w-3.5 text-slate-500" />
        <span>{isVisitDate ? "The reunion day is here!" : "Voting has ended"}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
        <Clock className="h-3.5 w-3.5 text-indigo-500" />
        {label}
      </span>
      <div className="flex items-center gap-2 text-slate-900">
        <div className="flex flex-col items-center justify-center bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 min-w-[42px]">
          <span className="text-base font-extrabold text-indigo-700 leading-tight">{timeLeft.days}</span>
          <span className="text-[10px] uppercase font-bold text-indigo-400">Days</span>
        </div>
        <span className="text-slate-400 font-bold">:</span>
        <div className="flex flex-col items-center justify-center bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 min-w-[42px]">
          <span className="text-base font-extrabold text-indigo-700 leading-tight">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase font-bold text-indigo-400">Hrs</span>
        </div>
        <span className="text-slate-400 font-bold">:</span>
        <div className="flex flex-col items-center justify-center bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 min-w-[42px]">
          <span className="text-base font-extrabold text-indigo-700 leading-tight">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase font-bold text-indigo-400">Min</span>
        </div>
        <span className="text-slate-400 font-bold">:</span>
        <div className="flex flex-col items-center justify-center bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 min-w-[42px]">
          <span className="text-base font-extrabold text-indigo-700 leading-tight">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase font-bold text-indigo-400">Sec</span>
        </div>
      </div>
    </div>
  );
}

