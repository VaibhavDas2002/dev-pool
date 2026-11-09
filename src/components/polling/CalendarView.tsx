"use client";

import React, { useState } from "react";
import { formatDisplayDate, formatWithDay, isEligibleReunionDate } from "@/lib/utils/date";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Star, Users, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OptionVoter } from "@/types";
import { getAvatarStyle } from "@/lib/utils";

interface CalendarViewProps {
  availableDates: string[]; // List of YYYY-MM-DD
  selectedDate: string | null;
  leadingDate: string | null;
  onSelectDate: (dateStr: string) => void;
  isClosed?: boolean;
  votersByDate?: Record<string, OptionVoter[]>;
  currentUserInitials?: string;
  currentUserId?: string;
  hasConfirmedVote?: boolean;
}

export function CalendarView({
  availableDates,
  selectedDate,
  leadingDate,
  onSelectDate,
  isClosed = false,
  votersByDate = {},
  currentUserInitials,
  currentUserId,
  hasConfirmedVote = false,
}: CalendarViewProps) {
  // Available months: Nov 2026 (Month 10 in JS 0-indexed) and Dec 2026 (Month 11)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // November 2026
  const [activeDateDetail, setActiveDateDetail] = useState<string | null>(selectedDate);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 10) return;
    setCurrentMonth(10);
  };

  const nextMonth = () => {
    if (currentMonth === 11) return;
    setCurrentMonth(11);
  };

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const handleDateClick = (dateStr: string) => {
    setActiveDateDetail(dateStr);
    onSelectDate(dateStr);
  };

  const detailDate = activeDateDetail || selectedDate;
  const detailVoters = detailDate ? votersByDate[detailDate] || [] : [];
  const userVotedOnDetailDate = !!(detailDate && detailVoters.some((v) => v.user_id === currentUserId));

  return (
    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            {monthNames[currentMonth]} {currentYear}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            disabled={currentMonth === 10}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
            {currentMonth === 10 ? "Nov '26" : "Dec '26"}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            disabled={currentMonth === 11}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {daysOfWeek.map((day, idx) => (
          <div key={day} className={idx === 0 || idx === 6 ? "text-amber-600/70 dark:text-amber-400/70" : ""}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {/* Leading empty slots */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-11 w-full" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNumber = i + 1;
          const dateStr = `${currentYear}-${padZero(currentMonth + 1)}-${padZero(dayNumber)}`;
          const isEligible = isEligibleReunionDate(dateStr);
          const isConfiguredOption = availableDates.includes(dateStr);
          const isSelected = selectedDate === dateStr;
          const isLeader = leadingDate === dateStr;
          const dateVoters = votersByDate[dateStr] || [];
          const userVotedThisDate = dateVoters.some((v) => v.user_id === currentUserId);

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isClosed || !isConfiguredOption}
              onClick={() => isConfiguredOption && handleDateClick(dateStr)}
              className={`relative h-11 w-full rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? "bg-indigo-600 text-white font-extrabold shadow-sm ring-2 ring-indigo-600/40"
                  : isLeader
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-extrabold border border-amber-300 dark:border-amber-700"
                  : isConfiguredOption
                  ? "bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:scale-105 cursor-pointer border border-indigo-200/50 dark:border-indigo-800"
                  : isEligible
                  ? "text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-not-allowed opacity-40"
                  : "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-25 line-through"
              }`}
              title={
                !isEligible
                  ? "Date must be after Nov 24, 2026"
                  : isConfiguredOption
                  ? `${formatDisplayDate(dateStr)}: ${dateVoters.length} batchmate(s) voted`
                  : "Not configured for this poll"
              }
            >
              <span className="leading-tight">{dayNumber}</span>
              
              {/* Voter initial or vote count on the date */}
              {userVotedThisDate ? (
                <span className="text-[8px] font-black uppercase tracking-tight bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 px-1 py-0.5 rounded-md shadow-2xs leading-none mt-0.5 border border-indigo-200 dark:border-indigo-800">
                  {currentUserInitials || "YOU"}{dateVoters.length > 1 ? ` +${dateVoters.length - 1}` : ""}
                </span>
              ) : isSelected && currentUserInitials ? (
                <span className="text-[8px] font-black uppercase tracking-tight bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 px-1 py-0.5 rounded-md shadow-2xs leading-none mt-0.5 border border-indigo-200 dark:border-indigo-800">
                  {currentUserInitials}
                </span>
              ) : dateVoters.length > 0 ? (
                <span className="text-[8px] font-bold tracking-tight bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-1 py-0.5 rounded-md leading-none mt-0.5 border border-slate-200/60 dark:border-slate-700">
                  {dateVoters[0]?.initials}{dateVoters.length > 1 ? ` +${dateVoters.length - 1}` : ""}
                </span>
              ) : null}

              {isLeader && !isSelected && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Date Click Voters Details Panel */}
      {detailDate && (
        <div className="mt-3 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 text-xs animate-in fade-in space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              {formatDisplayDate(detailDate)} &bull; {formatWithDay(detailDate).split(",")[0]}
            </span>
            <Badge variant="outline" className="text-[10px] bg-white dark:bg-slate-900">
              {detailVoters.length} {detailVoters.length === 1 ? "vote" : "votes"}
            </Badge>
          </div>

          {userVotedOnDetailDate && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Your vote confirmed on this date! ({currentUserInitials})</span>
            </div>
          )}

          {detailVoters.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Batchmates who voted for this date ({detailVoters.length}):
              </p>
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {detailVoters.map((v) => (
                  <div
                    key={v.user_id}
                    className="flex flex-col gap-1.5 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 p-2.5 rounded-xl shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          style={getAvatarStyle(v.full_name)}
                          className="h-6 w-6 rounded-full text-[10px] font-black text-white flex items-center justify-center shrink-0 shadow-2xs"
                        >
                          {v.initials}
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {v.full_name} {v.user_id === currentUserId ? "(You)" : ""}
                        </span>
                      </div>

                      {v.role === "admin" && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md shrink-0">
                          Admin
                        </span>
                      )}
                    </div>

                    {v.reason && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/70 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">💬</span>
                        <span className="italic leading-snug">&ldquo;{v.reason}&rdquo;</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              No batchmates have voted for this date yet.
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
          <span>Your Vote Initial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span>Current Leader</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700" />
          <span>Available Date</span>
        </div>
      </div>
    </div>
  );
}
