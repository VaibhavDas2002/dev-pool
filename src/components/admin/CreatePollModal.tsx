"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Calendar, Sparkles, Clock, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreatePollModal({ isOpen, onClose, onSuccess }: CreatePollModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("When Should We Visit College?");
  const [subtitle, setSubtitle] = useState("Let's choose the perfect day to collect our B.Tech certificates together!");
  const [deadline, setDeadline] = useState("2026-11-23T23:59");
  const [minDate, setMinDate] = useState("2026-11-25");
  const [maxDate, setMaxDate] = useState("2026-12-31");
  const [dateList, setDateList] = useState<string[]>(["2026-11-25", "2026-11-27", "2026-11-30", "2026-12-02"]);
  const [newDateInput, setNewDateInput] = useState("");
  const [status, setStatus] = useState<"open" | "draft">("open");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleAddDate = () => {
    if (!newDateInput) return;
    if (newDateInput < "2026-11-25") {
      toast.error("Date must be after November 24, 2026 (earliest 2026-11-25)");
      return;
    }
    if (dateList.includes(newDateInput)) {
      toast.error("This date is already in the options list");
      return;
    }
    setDateList([...dateList, newDateInput].sort());
    setNewDateInput("");
  };

  const handleRemoveDate = (d: string) => {
    if (dateList.length <= 1) {
      toast.error("At least one date option is required");
      return;
    }
    setDateList(dateList.filter((item) => item !== d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (minDate < "2026-11-25") {
      setErrorMessage("Minimum date must be strictly after November 24, 2026.");
      return;
    }

    if (dateList.length === 0) {
      setErrorMessage("Please specify at least one date option.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_POLL",
          poll_data: {
            title: title.trim(),
            subtitle: subtitle.trim(),
            min_date: minDate,
            max_date: maxDate,
            voting_deadline: new Date(deadline).toISOString(),
            status,
            initial_dates: dateList,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create poll");
      }

      toast.success("New Reunion Poll successfully created! 🎓");
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Creation failed";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-6 text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/20 text-white text-xs font-bold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Administrator Tool</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            Create Reunion Poll
          </h3>
          <p className="text-xs text-indigo-100 mt-1">
            Configure the ballot, valid dates, and deadline for the certificate collection visit.
          </p>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Poll Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., When Should We Visit College?"
              required
              disabled={isSubmitting}
              className="h-10 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subtitle
            </label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Let's choose the perfect day to collect our certificates!"
              disabled={isSubmitting}
              className="h-10 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                Voting Deadline (IST)
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl border border-slate-300 px-3 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="open">Open (Accepting votes immediately)</option>
                <option value="draft">Draft (Hidden until ready)</option>
              </select>
            </div>
          </div>

          {/* Date Range Constraints */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-amber-600" />
              Academic Rule: Strictly After Nov 24, 2026
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] text-amber-800 font-semibold mb-1">
                  Earliest Date (Min)
                </label>
                <input
                  type="date"
                  min="2026-11-25"
                  value={minDate}
                  onChange={(e) => setMinDate(e.target.value)}
                  className="w-full rounded-lg border border-amber-300 p-1.5 bg-white text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] text-amber-800 font-semibold mb-1">
                  Latest Date (Max)
                </label>
                <input
                  type="date"
                  min="2026-11-25"
                  value={maxDate}
                  onChange={(e) => setMaxDate(e.target.value)}
                  className="w-full rounded-lg border border-amber-300 p-1.5 bg-white text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Initial Date Options */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Date Options on Ballot ({dateList.length})
            </label>
            
            <div className="flex gap-2 mb-2">
              <input
                type="date"
                min="2026-11-25"
                value={newDateInput}
                onChange={(e) => setNewDateInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800 bg-white"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDate}
                className="text-xs font-bold text-indigo-700 border-indigo-200"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Date
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
              {dateList.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
                >
                  <Calendar className="h-3 w-3 text-indigo-600" />
                  {d}
                  <button
                    type="button"
                    onClick={() => handleRemoveDate(d)}
                    className="text-slate-400 hover:text-rose-600 ml-1"
                    title="Remove date"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
              {errorMessage}
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
              isLoading={isSubmitting}
            >
              Create Reunion Poll
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

