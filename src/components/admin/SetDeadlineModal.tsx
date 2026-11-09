"use client";

import React, { useState, useEffect } from "react";
import { formatFullDateTime, formatDateTimeLocal, getTimeRemaining } from "@/lib/utils/date";
import { 
  Clock, 
  X, 
  Save, 
  Zap, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SetDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollId: string;
  currentDeadline: string;
  currentStatus?: string;
  onSuccess?: (newDeadline: string, newStatus: string) => void;
}

export function SetDeadlineModal({
  isOpen,
  onClose,
  pollId,
  currentDeadline,
  currentStatus = "open",
  onSuccess,
}: SetDeadlineModalProps) {
  const [deadlineInput, setDeadlineInput] = useState(() => formatDateTimeLocal(currentDeadline));
  const [status, setStatus] = useState(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDeadlineInput(formatDateTimeLocal(currentDeadline));
      setStatus(currentStatus);
    }
  }, [isOpen, currentDeadline, currentStatus]);

  if (!isOpen) return null;

  // Preset handlers
  const handlePresetCloseNow = () => {
    const past = new Date(Date.now() - 60000); // 1 minute ago
    setDeadlineInput(formatDateTimeLocal(past.toISOString()));
    setStatus("closed");
  };

  const handlePresetAddHours = (hours: number) => {
    const future = new Date(Date.now() + hours * 3600000);
    setDeadlineInput(formatDateTimeLocal(future.toISOString()));
    setStatus("open");
  };

  const handlePresetNov23 = () => {
    const nov23 = new Date("2026-11-23T23:59:59+05:30");
    setDeadlineInput(formatDateTimeLocal(nov23.toISOString()));
    setStatus("open");
  };

  const handlePresetNov24 = () => {
    const nov24 = new Date("2026-11-24T12:00:00+05:30");
    setDeadlineInput(formatDateTimeLocal(nov24.toISOString()));
    setStatus("open");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deadlineInput) {
      toast.error("Please pick a valid date and time for the voting deadline.");
      return;
    }

    try {
      setIsSubmitting(true);
      const isoDeadline = new Date(deadlineInput).toISOString();

      const res = await fetch("/api/admin/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_CONFIG",
          poll_id: pollId,
          updates: {
            voting_deadline: isoDeadline,
            status,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update voting deadline");
      }

      toast.success(
        status === "closed"
          ? "Voting is now officially closed by Admin 🔒"
          : `Voting deadline updated to ${formatFullDateTime(isoDeadline)}! ⏰`
      );

      if (onSuccess) {
        onSuccess(isoDeadline, status);
      }
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update deadline");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview time remaining
  const previewTime = deadlineInput ? getTimeRemaining(new Date(deadlineInput).toISOString()) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 pr-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Administrator Control</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Set Vote Closing & Deadline</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure when official voting closes for all batchmates.
          </p>
        </div>

        {/* Current Deadline Display */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Current Configured Closing:
            </span>
            <Badge
              variant={status === "open" ? "default" : "secondary"}
              className="text-[10px] py-0.5"
            >
              {status.toUpperCase()}
            </Badge>
          </div>
          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            {formatFullDateTime(currentDeadline)}
          </div>
        </div>

        {/* 1-Click Quick Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>1-Click Deadline Presets</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handlePresetCloseNow}
              className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/80 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-left text-xs font-bold transition-all hover:scale-[1.02] flex items-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>Close Poll Now</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetAddHours(24)}
              className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-left text-xs font-bold transition-all hover:scale-[1.02] flex items-center gap-1.5"
            >
              <Clock className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>+24 Hours</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetAddHours(72)}
              className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-left text-xs font-bold transition-all hover:scale-[1.02] flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>+3 Days</span>
            </button>

            <button
              type="button"
              onClick={handlePresetNov23}
              className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/80 bg-amber-50/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-left text-xs font-bold transition-all hover:scale-[1.02] flex items-center gap-1.5"
            >
              <span>🎓 Nov 23 (11:59 PM)</span>
            </button>

            <button
              type="button"
              onClick={handlePresetNov24}
              className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-900/80 bg-purple-50/60 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 hover:bg-purple-100 text-left text-xs font-bold transition-all hover:scale-[1.02] flex items-center gap-1.5 col-span-2 sm:col-span-1"
            >
              <span>🌅 Nov 24 (12:00 PM)</span>
            </button>
          </div>
        </div>

        {/* Custom Date & Time Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Custom Closing Date & Time (Local)
            </label>
            <input
              type="datetime-local"
              required
              value={deadlineInput}
              onChange={(e) => setDeadlineInput(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3 text-sm bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Poll Voting Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 text-sm bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="open">🟢 Open (Active voting allowed)</option>
              <option value="closed">🔴 Closed (Voting locked for members)</option>
              <option value="draft">🟡 Draft (Hidden / preliminary)</option>
              <option value="finalized">🏆 Finalized (Official winning date declared)</option>
            </select>
          </div>

          {/* Countdown Preview */}
          {previewTime && (
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Countdown Preview:
              </span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300">
                {previewTime.isExpired
                  ? "Voting Expired"
                  : `${previewTime.days}d ${previewTime.hours}h ${previewTime.minutes}m remaining`}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !deadlineInput}
              isLoading={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Vote Closing
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

