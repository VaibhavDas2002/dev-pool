"use client";

import React, { useState } from "react";
import { PollOption, PollResults } from "@/types";
import { formatDisplayDate, formatWithDay, isEligibleReunionDate } from "@/lib/utils/date";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit3,
  Star,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  Zap,
  Check,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface AdminDateCustomizerProps {
  pollId: string;
  pollStatus: string;
  options: PollOption[];
  results: PollResults;
  disableWeekends: boolean;
  onDisableWeekendsChange: (val: boolean) => void;
  onOptionsChange: (newOptions: PollOption[]) => void;
  onSelectOfficialDate: (dateStr: string) => Promise<void>;
}

const PRESET_TAGS = [
  "⭐ Recommended",
  "Opening Day",
  "Full Staff Available",
  "Dean's Clearance",
  "Alumni Hangout",
  "Less Crowded",
  "Backup Date",
];

export function AdminDateCustomizer({
  pollId,
  pollStatus,
  options,
  results,
  disableWeekends,
  onDisableWeekendsChange,
  onOptionsChange,
  onSelectOfficialDate,
}: AdminDateCustomizerProps) {
  // Calendar month state: 10 = Nov 2026, 11 = Dec 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10);

  // Form states for adding / editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState("2026-11-25");
  const [formLabel, setFormLabel] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formRecommended, setFormRecommended] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick preset loading
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // Handle clicking a calendar day
  const handleCalendarDayClick = (dateStr: string) => {
    const existing = options.find((o) => o.option_date === dateStr);
    if (existing) {
      // Switch into edit mode for this option
      setIsEditing(true);
      setEditingOptionId(existing.id);
      setFormDate(existing.option_date);
      setFormLabel(existing.label || "");
      setFormNote(existing.note || "");
      setFormRecommended(!!existing.is_recommended);
      toast.info(`Editing configured option for ${formatDisplayDate(dateStr)}`);
    } else {
      // Populate add form with this clicked date
      setIsEditing(false);
      setEditingOptionId(null);
      setFormDate(dateStr);
      setFormLabel("");
      setFormNote("");
      setFormRecommended(false);
      toast.success(`Selected ${formatDisplayDate(dateStr)} — customize badges below!`);
    }
  };

  // Add or update option
  const handleSubmitOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate) return;

    if (formDate < "2026-11-25") {
      toast.error("All reunion dates must be strictly after November 24, 2026.");
      return;
    }

    if (disableWeekends) {
      const day = new Date(formDate).getDay();
      if (day === 0 || day === 6) {
        toast.error("Weekend dates are disabled as academic counters are closed on Sat/Sun.");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      if (isEditing && editingOptionId) {
        // UPDATE existing option
        const res = await fetch("/api/admin/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UPDATE_OPTION",
            option_id: editingOptionId,
            option_date: formDate,
            label: formLabel.trim() || null,
            note: formNote.trim() || null,
            is_recommended: formRecommended,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update option");

        toast.success(`Updated option for ${formatDisplayDate(formDate)}!`);
        onOptionsChange(
          options
            .map((o) => (o.id === editingOptionId ? data.option : o))
            .sort((a, b) => a.option_date.localeCompare(b.option_date))
        );

        // Reset
        setIsEditing(false);
        setEditingOptionId(null);
        setFormLabel("");
        setFormNote("");
        setFormRecommended(false);
      } else {
        // ADD new option
        const res = await fetch("/api/admin/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ADD_OPTION",
            poll_id: pollId,
            option_date: formDate,
            label: formLabel.trim() || null,
            note: formNote.trim() || null,
            is_recommended: formRecommended,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add option");

        toast.success(`Added ${formatDisplayDate(formDate)} to ballot!`);
        onOptionsChange(
          [...options, data.option].sort((a, b) => a.option_date.localeCompare(b.option_date))
        );

        // Reset
        setFormLabel("");
        setFormNote("");
        setFormRecommended(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving date option");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove option
  const handleRemoveOption = async (optionId: string, optionDate: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${formatDisplayDate(
          optionDate
        )}? Any votes recorded for this date will be deleted.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/admin/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REMOVE_OPTION",
          poll_id: pollId,
          option_id: optionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove option");

      toast.success(`Removed ${formatDisplayDate(optionDate)}`);
      onOptionsChange(options.filter((o) => o.id !== optionId));
      if (editingOptionId === optionId) {
        setIsEditing(false);
        setEditingOptionId(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error removing date");
    }
  };

  // Quick preset shortcuts
  const handleApplyPreset = async (
    presetName: string,
    presetDates: string[],
    presetLabel?: string
  ) => {
    try {
      setIsApplyingPreset(true);
      // Filter out invalid dates
      const validDates = presetDates.filter((d) => {
        if (d < "2026-11-25") return false;
        if (disableWeekends) {
          const day = new Date(d).getDay();
          if (day === 0 || day === 6) return false;
        }
        return true;
      });

      let addedCount = 0;
      const updatedList = [...options];

      for (const d of validDates) {
        if (!updatedList.some((o) => o.option_date === d)) {
          const res = await fetch("/api/admin/poll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "ADD_OPTION",
              poll_id: pollId,
              option_date: d,
              label: presetLabel || null,
              is_recommended: presetLabel?.includes("Recommended") || false,
            }),
          });
          const data = await res.json();
          if (res.ok && data.option) {
            updatedList.push(data.option);
            addedCount++;
          }
        }
      }

      updatedList.sort((a, b) => a.option_date.localeCompare(b.option_date));
      onOptionsChange(updatedList);
      toast.success(
        `Applied "${presetName}": added ${addedCount} new dates (${updatedList.length} total options)`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error applying preset");
    } finally {
      setIsApplyingPreset(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Weekend Policy Toggle & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              Disable Weekends (Saturday & Sunday)
            </span>
            <Badge variant="outline" className="text-[10px] text-slate-500 bg-white">
              Academic Cell Rule
            </Badge>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            College registrar and degree verification counters are closed on weekends
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={disableWeekends}
            onChange={(e) => onDisableWeekendsChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {/* Quick Presets Bar */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-purple-50/50 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
            <Zap className="h-4 w-4 text-indigo-600" />
            <span>1-Click Date Presets</span>
          </div>
          <span className="text-[11px] text-indigo-600/80 font-medium">
            Fast multi-date population
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isApplyingPreset}
            onClick={() =>
              handleApplyPreset(
                "All Fridays",
                ["2026-11-27", "2026-12-04", "2026-12-11"],
                "⭐ Recommended (Friday)"
              )
            }
            className="text-xs h-8 bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold"
          >
            ⚡ All Fridays (Nov 27, Dec 4, Dec 11)
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isApplyingPreset}
            onClick={() =>
              handleApplyPreset(
                "End of Nov Weekdays",
                ["2026-11-25", "2026-11-26", "2026-11-27", "2026-11-30"],
                "Nov Opening Week"
              )
            }
            className="text-xs h-8 bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold"
          >
            ⚡ End of Nov Weekdays
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isApplyingPreset}
            onClick={() =>
              handleApplyPreset(
                "Early Dec Weekdays",
                ["2026-12-01", "2026-12-02", "2026-12-03", "2026-12-04"],
                "December Window"
              )
            }
            className="text-xs h-8 bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold"
          >
            ⚡ Early Dec Weekdays
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isApplyingPreset}
            onClick={() =>
              handleApplyPreset(
                "Recommended Triad",
                ["2026-11-25", "2026-11-27", "2026-12-02"],
                "⭐ Recommended"
              )
            }
            className="text-xs h-8 bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold"
          >
            ⚡ Recommended Triad
          </Button>
        </div>
      </div>

      {/* Interactive Calendar Selection Card */}
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Interactive Date Selector
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Click any date &ge; Nov 25 to add to ballot or customize tags
                </CardDescription>
              </div>
            </div>

            {/* Month Switcher */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => setCurrentMonth(10)}
                disabled={currentMonth === 10}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-colors"
                title="November 2026"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 px-1.5">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={() => setCurrentMonth(11)}
                disabled={currentMonth === 11}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-colors"
                title="December 2026"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {daysOfWeek.map((day, idx) => (
              <div key={day} className={idx === 0 || idx === 6 ? "text-amber-600/70" : ""}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {/* Empty offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 w-full" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateStr = `${currentYear}-${padZero(currentMonth + 1)}-${padZero(dayNumber)}`;
              const isEligible = isEligibleReunionDate(dateStr);
              const dayOfWeek = new Date(dateStr).getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isWeekendDisabled = disableWeekends && isWeekend;

              const configuredOption = options.find((o) => o.option_date === dateStr);
              const isConfigured = !!configuredOption;
              const optResult = results.options.find((r) => r.option_date === dateStr);
              const voteCount = optResult?.vote_count || 0;
              const isTargetFormDate = formDate === dateStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={!isEligible || isWeekendDisabled}
                  onClick={() => handleCalendarDayClick(dateStr)}
                  className={`relative h-11 w-full rounded-xl text-xs flex flex-col items-center justify-center transition-all ${
                    isConfigured
                      ? "bg-indigo-600 text-white font-extrabold shadow-sm ring-2 ring-indigo-600/30 hover:bg-indigo-700"
                      : isTargetFormDate
                      ? "bg-purple-100 text-purple-900 font-extrabold border-2 border-purple-500"
                      : isEligible && !isWeekendDisabled
                      ? "bg-slate-50 text-slate-800 font-semibold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200/80 cursor-pointer"
                      : isWeekendDisabled
                      ? "bg-amber-50/50 text-amber-300 cursor-not-allowed opacity-50"
                      : "text-slate-300 cursor-not-allowed opacity-30 line-through"
                  }`}
                  title={
                    !isEligible
                      ? "Date must be after Nov 24, 2026"
                      : isWeekendDisabled
                      ? "Weekend dates disabled (counters closed)"
                      : isConfigured
                      ? `${formatDisplayDate(dateStr)}: Configured on ballot (${voteCount} votes) — click to edit`
                      : `Click to select ${formatDisplayDate(dateStr)} for ballot`
                  }
                >
                  <span className="leading-none">{dayNumber}</span>
                  {isConfigured && (
                    <span className="text-[9px] font-semibold opacity-90 leading-none mt-0.5">
                      {voteCount > 0 ? `${voteCount}v` : "active"}
                    </span>
                  )}
                  {configuredOption?.is_recommended && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[8px] font-bold shadow-xs">
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-indigo-600" />
              <span>Configured on Ballot</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-slate-100 border border-slate-300" />
              <span>Available to Add</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-amber-400" />
              <span>Recommended ★</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-slate-200 line-through opacity-40" />
              <span>Prior to Nov 25 (Forbidden)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Option Customizer Form (Add / Edit) */}
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Edit3 className="h-5 w-5 text-purple-600" />
              ) : (
                <Plus className="h-5 w-5 text-indigo-600" />
              )}
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  {isEditing ? "Edit Configured Date Option" : "Customize & Add Date Option"}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {isEditing
                    ? `Modifying ${formatDisplayDate(formDate)}`
                    : "Set custom labels, badges, and administrative notes for batchmates"}
                </CardDescription>
              </div>
            </div>

            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditingOptionId(null);
                  setFormLabel("");
                  setFormNote("");
                  setFormRecommended(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <form onSubmit={handleSubmitOption} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-indigo-600" />
                  Select Date (After Nov 24, 2026)
                </label>
                <input
                  type="date"
                  min="2026-11-25"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <p className="text-[11px] text-slate-400">
                  Selected: {formatDisplayDate(formDate)} ({formatWithDay(formDate).split(",")[0]})
                </p>
              </div>

              {/* Custom Label / Badge Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-indigo-600" />
                  Custom Badge / Tag (Optional)
                </label>
                <Input
                  placeholder="e.g. Full Staff Available, Opening Day..."
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  maxLength={60}
                  className="rounded-xl border-slate-300 text-sm font-medium"
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  {PRESET_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormLabel(tag)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Administrative Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-indigo-600" />
                Administrative Note / Context (Visible to students on ballot)
              </label>
              <textarea
                placeholder="e.g. Academic Cell confirmed counter 3 will issue degrees until 4 PM. Group photos planned at library staircase."
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                maxLength={250}
                rows={2}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <span className="text-[10px] text-slate-400 block text-right">
                {formNote.length}/250 characters
              </span>
            </div>

            {/* Recommended Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                <div>
                  <span className="text-xs font-bold text-amber-950 block">
                    Mark as Recommended Date
                  </span>
                  <span className="text-[11px] text-amber-800">
                    Displays a glowing gold recommendation badge on student voting ballots
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={formRecommended}
                onChange={(e) => setFormRecommended(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingOptionId(null);
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-xs px-5 font-bold shadow-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : isEditing ? (
                  <Check className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <Plus className="h-3.5 w-3.5 mr-1" />
                )}
                {isEditing ? "Save Option Changes" : "Add Customized Date to Ballot"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Configured Ballot Options List */}
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Current Ballot Options ({options.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Active dates available to students for voting
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-bold text-indigo-700 bg-indigo-50 border-indigo-200">
            {options.length} options active
          </Badge>
        </CardHeader>

        <CardContent className="p-5">
          {options.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No date options currently configured. Use the calendar or presets above to add dates!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {options.map((opt) => {
                const optResult = results.options.find((r) => r.option_id === opt.id);
                const votes = optResult?.vote_count || 0;
                const percentage = optResult?.percentage || 0;
                const isWinner = results.leading_option_id === opt.id && votes > 0;

                return (
                  <div
                    key={opt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-200 hover:shadow-2xs transition-all"
                  >
                    <div className="space-y-1.5 min-w-0">
                      {/* Top tags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {opt.is_recommended && (
                          <Badge className="bg-amber-50 text-amber-900 border border-amber-300 text-[10px] gap-1 font-bold py-0.5">
                            <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-600" />
                            Recommended
                          </Badge>
                        )}
                        {opt.label && (
                          <Badge variant="outline" className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border-indigo-200 py-0.5">
                            {opt.label}
                          </Badge>
                        )}
                        {isWinner && (
                          <Badge variant="amber" className="text-[10px] gap-1 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                            <Trophy className="h-2.5 w-2.5 text-amber-600" />
                            Leading ({percentage}%)
                          </Badge>
                        )}
                      </div>

                      {/* Date display */}
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="font-extrabold text-base text-slate-900">
                          {formatDisplayDate(opt.option_date)}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          &bull; {formatWithDay(opt.option_date).split(",")[0]}
                        </span>
                      </div>

                      {/* Admin Note */}
                      {opt.note && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/70 inline-block max-w-xl">
                          <span className="text-indigo-600 font-bold mr-1">💡 Note:</span>
                          {opt.note}
                        </p>
                      )}
                    </div>

                    {/* Actions and Votes */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-right mr-1">
                        <span className="text-xs font-bold text-slate-800 block">
                          {votes} {votes === 1 ? "vote" : "votes"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {percentage}% turnout
                        </span>
                      </div>

                      {/* Select as official date button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectOfficialDate(opt.option_date)}
                        className="text-xs h-8 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 font-semibold"
                        title="Directly select this date as the official reunion date"
                      >
                        <Trophy className="h-3 w-3 mr-1 text-emerald-600" />
                        Official
                      </Button>

                      {/* Edit button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingOptionId(opt.id);
                          setFormDate(opt.option_date);
                          setFormLabel(opt.label || "");
                          setFormNote(opt.note || "");
                          setFormRecommended(!!opt.is_recommended);
                          toast.info(`Editing ${formatDisplayDate(opt.option_date)}`);
                        }}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Edit date option"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>

                      {/* Remove button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(opt.id, opt.option_date)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Remove option from ballot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

