"use client";

import React, { useState } from "react";
import { formatDisplayDate, isEligibleReunionDate } from "@/lib/utils/date";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CalendarViewProps {
  availableDates: string[]; // List of YYYY-MM-DD
  selectedDate: string | null;
  leadingDate: string | null;
  onSelectDate: (dateStr: string) => void;
  isClosed?: boolean;
}

export function CalendarView({
  availableDates,
  selectedDate,
  leadingDate,
  onSelectDate,
  isClosed = false,
}: CalendarViewProps) {
  // Available months: Nov 2026 (Month 10 in JS 0-indexed) and Dec 2026 (Month 11)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // November 2026

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Helper: days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: first day of month (0 = Sun, 1 = Mon, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 10) return; // Don't go before November 2026
    setCurrentMonth(10);
  };

  const nextMonth = () => {
    if (currentMonth === 11) return; // Don't go past December 2026
    setCurrentMonth(11);
  };

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-900">
            {monthNames[currentMonth]} {currentYear}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            disabled={currentMonth === 10}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-slate-500 px-1">
            {currentMonth === 10 ? "Nov '26" : "Dec '26"}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            disabled={currentMonth === 11}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-colors"
            title="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {daysOfWeek.map((day, idx) => (
          <div key={day} className={idx === 0 || idx === 6 ? "text-amber-600/70" : ""}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Leading empty slots */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9 w-full" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNumber = i + 1;
          const dateStr = `${currentYear}-${padZero(currentMonth + 1)}-${padZero(dayNumber)}`;
          const isEligible = isEligibleReunionDate(dateStr);
          const isConfiguredOption = availableDates.includes(dateStr);
          const isSelected = selectedDate === dateStr;
          const isLeader = leadingDate === dateStr;
          const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isClosed || !isConfiguredOption}
              onClick={() => isConfiguredOption && onSelectDate(dateStr)}
              className={`relative h-9 w-full rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                isSelected
                  ? "bg-indigo-600 text-white font-extrabold shadow-sm ring-2 ring-indigo-600/30"
                  : isLeader
                  ? "bg-amber-100 text-amber-900 font-extrabold border border-amber-300"
                  : isConfiguredOption
                  ? "bg-indigo-50/70 text-indigo-900 font-bold hover:bg-indigo-100 hover:scale-105 cursor-pointer border border-indigo-200/50"
                  : isEligible
                  ? "text-slate-400 hover:bg-slate-50 cursor-not-allowed opacity-40"
                  : "text-slate-300 cursor-not-allowed opacity-25 line-through"
              }`}
              title={
                !isEligible
                  ? "Date must be after Nov 24, 2026"
                  : isConfiguredOption
                  ? `Select ${formatDisplayDate(dateStr)}`
                  : "Not configured for this poll"
              }
            >
              <span>{dayNumber}</span>
              {isSelected && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-white border-2 border-indigo-600" />
              )}
              {isLeader && !isSelected && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
          <span>Your Vote</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span>Current Leader</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-100 border border-indigo-200" />
          <span>Available Date</span>
        </div>
      </div>
    </div>
  );
}
