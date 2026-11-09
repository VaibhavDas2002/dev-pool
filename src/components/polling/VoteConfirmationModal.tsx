"use client";

import React, { useState, useEffect } from "react";
import { formatDisplayDate, formatWithDay } from "@/lib/utils/date";
import { 
  Vote as VoteIcon, 
  Calendar, 
  Sparkles, 
  X, 
  MessageSquare, 
  Check, 
  Clock, 
  Star,
  Users,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const PRESET_VOTE_REASONS = [
  { id: "exams", label: "Free after exams", icon: "🎓", text: "Free after semester clearance & final exams." },
  { id: "weekend", label: "Weekend travel", icon: "🚗", text: "Weekend is easiest for outstation travel." },
  { id: "maggi", label: "Maggi Point lunch", icon: "🍜", text: "Planning group lunch at Maggi Point after certificate counter! 🍜" },
  { id: "photo", label: "Library stairs photo", icon: "📸", text: "Best day for batch photo on library stairs with everyone. 📸" },
  { id: "faculty", label: "Faculty & HOD meet", icon: "🏛️", text: "Confirmed faculty & HOD available that morning." },
  { id: "office", label: "Office leave aligned", icon: "💼", text: "Taking official leave from job/office for this date." },
  { id: "hostel", label: "Hostel gang reunion", icon: "🎉", text: "Hostel wing and friends already agreed on this date! 🎉" },
];

interface VoteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  selectedDate: string;
  label?: string | null;
  note?: string | null;
  isRecommended?: boolean;
  currentReason?: string | null;
  isUpdate?: boolean;
  isLoading?: boolean;
}

export function VoteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  selectedDate,
  label,
  note,
  isRecommended,
  currentReason = "",
  isUpdate = false,
  isLoading = false,
}: VoteConfirmationModalProps) {
  const [reason, setReason] = useState(currentReason || "");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason(currentReason || "");
      const match = PRESET_VOTE_REASONS.find((p) => p.text === currentReason);
      setSelectedPresetId(match ? match.id : null);
    }
  }, [isOpen, currentReason]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_VOTE_REASONS[0]) => {
    if (selectedPresetId === preset.id) {
      // Toggle off
      setSelectedPresetId(null);
      setReason("");
    } else {
      setSelectedPresetId(preset.id);
      setReason(preset.text);
    }
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setReason(val);
    const match = PRESET_VOTE_REASONS.find((p) => p.text === val);
    setSelectedPresetId(match ? match.id : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
            <VoteIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {isUpdate ? "Edit & Update Your Vote" : "Confirm Reunion Date Choice"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isUpdate
                ? "Change your date or update your travel/availability message"
                : "Vote for your preferred certificate collection date"}
            </p>
          </div>
        </div>

        {/* Date Summary Card */}
        <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/80 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Selected Date
            </span>

            <div className="flex items-center gap-1.5">
              {isRecommended && (
                <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 text-[10px] gap-1 font-bold py-0.5">
                  <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-600" />
                  Recommended
                </Badge>
              )}
              {label && (
                <Badge variant="outline" className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 py-0.5">
                  {label}
                </Badge>
              )}
            </div>
          </div>

          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {formatWithDay(selectedDate)}
          </p>

          {note && (
            <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-1 border-t border-indigo-100 dark:border-indigo-900">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">💡 Note:</span>
              <span>{note}</span>
            </p>
          )}
        </div>

        {/* Reason / Why you want to choose this date */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Why do you want to choose this date?</span>
                <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                  (Optional message)
                </span>
              </label>

              {reason && (
                <button
                  type="button"
                  onClick={() => {
                    setReason("");
                    setSelectedPresetId(null);
                  }}
                  className="text-[11px] font-medium text-rose-500 hover:underline"
                >
                  Clear note
                </button>
              )}
            </div>

            {/* Quick Preset Chips */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Quick pick common reasons:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_VOTE_REASONS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-slate-700"
                      }`}
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                      {isSelected && <Check className="h-3 w-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom text input / textarea */}
            <div className="relative pt-1">
              <textarea
                value={reason}
                onChange={handleCustomTextChange}
                maxLength={300}
                rows={3}
                placeholder="Or write your custom note: e.g., Taking train with Priya; lets meet at campus gate 2 around 11:00 AM..."
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none transition-all"
              />
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 dark:text-slate-500 px-1">
                <span>Batchmates will see your note when inspecting this date.</span>
                <span>{reason.length} / 300</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs h-9 px-4 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="text-xs h-9 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
            >
              {isUpdate ? "Save & Update Vote" : "Confirm Official Vote"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
