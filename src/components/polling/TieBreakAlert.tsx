"use client";

import React, { useState } from "react";
import { AlertTriangle, Scale, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiedOption } from "@/types";
import { formatDisplayDate } from "@/lib/utils/date";
import { toast } from "sonner";

interface TieBreakAlertProps {
  pollId: string;
  tiedOptions: TiedOption[];
  isAdmin: boolean;
  onResolved?: () => void;
}

export function TieBreakAlert({ pollId, tiedOptions, isAdmin, onResolved }: TieBreakAlertProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(tiedOptions[0]?.option_date || "");
  const [note, setNote] = useState("");
  const [showModal, setShowModal] = useState(false);

  if (tiedOptions.length <= 1) return null;

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || note.trim().length < 5) {
      toast.error("Please select a date and enter an explanation for the decision.");
      return;
    }

    try {
      setIsResolving(true);
      const res = await fetch("/api/admin/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESOLVE_TIE",
          poll_id: pollId,
          selected_date: selectedDate,
          resolution_note: note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resolve tie");
      }

      toast.success("Tie successfully resolved! Poll finalized.");
      setShowModal(false);
      if (onResolved) onResolved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error resolving tie");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-900 text-base">
                  Tie Detected Between Top Dates
                </span>
                <span className="text-xs bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  {tiedOptions[0]?.vote_count} votes each
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-1 max-w-xl">
                The following dates share the highest vote count:{" "}
                <strong>
                  {tiedOptions.map((t) => formatDisplayDate(t.option_date)).join(", ")}
                </strong>
                . As per college planner rules, a tie cannot be resolved automatically by date order.
              </p>
            </div>
          </div>

          {isAdmin ? (
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-sm"
              onClick={() => setShowModal(true)}
            >
              Resolve Tie as Admin
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          ) : (
            <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-lg border border-amber-200">
              Awaiting class rep decision
            </span>
          )}
        </div>
      </div>

      {/* Tie Resolution Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Resolve Tied Result</h3>
                <p className="text-xs text-slate-500">Record an official admin tie-break decision</p>
              </div>
            </div>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Choose Winning Date
                </label>
                <div className="space-y-2">
                  {tiedOptions.map((opt) => (
                    <label
                      key={opt.option_id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedDate === opt.option_date
                          ? "border-indigo-600 bg-indigo-50/50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="selected_date"
                          value={opt.option_date}
                          checked={selectedDate === opt.option_date}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-bold text-sm text-slate-900">
                          {formatDisplayDate(opt.option_date)}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {opt.vote_count} votes
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Resolution Rationale / Note (Required)
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., Confirmed with Academic Section that HOD is available on this date..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isResolving}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" isLoading={isResolving}>
                  Confirm & Finalize
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

