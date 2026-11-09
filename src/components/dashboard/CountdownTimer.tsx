"use client";

import React, { useEffect, useState } from "react";
import { getTimeRemaining, TimeRemaining } from "@/lib/utils/date";
import { Clock, Settings2 } from "lucide-react";
import { SetDeadlineModal } from "@/components/admin/SetDeadlineModal";

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
  isVisitDate?: boolean;
  isAdmin?: boolean;
  pollId?: string;
  status?: string;
  onDeadlineChange?: (newDeadline: string, newStatus?: string) => void;
}

export function CountdownTimer({ 
  targetDate, 
  label = "Time Remaining", 
  isVisitDate = false,
  isAdmin = false,
  pollId,
  status = "open",
  onDeadlineChange,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>{isVisitDate ? "The reunion day is here!" : "Voting has ended"}</span>
          </div>

          {isAdmin && !isVisitDate && pollId && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 px-2.5 py-1 rounded-full transition-all hover:scale-105"
              title="Administrator: Set vote closing time or re-open voting"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>Set by Admin</span>
            </button>
          )}
        </div>

        {isAdmin && pollId && (
          <SetDeadlineModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            pollId={pollId}
            currentDeadline={targetDate}
            currentStatus={status}
            onSuccess={(newDeadline, newStatus) => {
              if (onDeadlineChange) onDeadlineChange(newDeadline, newStatus);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-indigo-500" />
          {label}
        </span>

        {isAdmin && !isVisitDate && pollId && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 px-2 py-0.5 rounded-full transition-all hover:scale-105 cursor-pointer shadow-2xs"
            title="Administrator: Set vote closing time"
          >
            <Settings2 className="h-3 w-3" />
            <span>Set by Admin</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center justify-center bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-lg px-2.5 py-1 min-w-[42px]">
          <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-300 leading-tight">{timeLeft.days}</span>
          <span className="text-[10px] uppercase font-bold text-indigo-400 dark:text-indigo-400">Days</span>
        </div>
        <span className="text-slate-400 dark:text-slate-500 font-bold">:</span>
        <div className="flex flex-col items-center justify-center bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-lg px-2.5 py-1 min-w-[42px]">
          <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-300 leading-tight">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase font-bold text-indigo-400 dark:text-indigo-400">Hrs</span>
        </div>
        <span className="text-slate-400 dark:text-slate-500 font-bold">:</span>
        <div className="flex flex-col items-center justify-center bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-lg px-2.5 py-1 min-w-[42px]">
          <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-300 leading-tight">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase font-bold text-indigo-400 dark:text-indigo-400">Min</span>
        </div>
        <span className="text-slate-400 dark:text-slate-500 font-bold">:</span>
        <div className="flex flex-col items-center justify-center bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-lg px-2.5 py-1 min-w-[42px]">
          <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-300 leading-tight">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase font-bold text-indigo-400 dark:text-indigo-400">Sec</span>
        </div>
      </div>

      {isAdmin && pollId && (
        <SetDeadlineModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pollId={pollId}
          currentDeadline={targetDate}
          currentStatus={status}
          onSuccess={(newDeadline, newStatus) => {
            if (onDeadlineChange) onDeadlineChange(newDeadline, newStatus);
          }}
        />
      )}
    </div>
  );
}

