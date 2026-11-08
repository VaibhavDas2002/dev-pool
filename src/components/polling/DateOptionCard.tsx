"use client";

import React, { useState } from "react";
import { formatDisplayDate, formatWithDay } from "@/lib/utils/date";
import { CheckCircle2, Trophy, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DateOptionCardProps {
  pollId: string;
  optionId: string;
  dateStr: string;
  voteCount: number;
  percentage: number;
  isSelected: boolean;
  isLeading: boolean;
  isClosed: boolean;
  onVote: (optionId: string) => Promise<void>;
}

export function DateOptionCard({
  pollId,
  optionId,
  dateStr,
  voteCount,
  percentage,
  isSelected,
  isLeading,
  isClosed,
  onVote,
}: DateOptionCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleVoteClick = async () => {
    try {
      setIsSubmitting(true);
      await onVote(optionId);
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-sm ${
        isSelected
          ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/30"
          : isLeading
          ? "border-amber-300 bg-amber-50/20 hover:border-amber-400"
          : "border-slate-200/90 bg-white hover:border-indigo-200 hover:shadow-md"
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isSelected && (
              <Badge variant="default" className="bg-indigo-600 text-[11px] gap-1 py-0.5">
                <CheckCircle2 className="h-3 w-3" />
                Your Selection
              </Badge>
            )}
            {isLeading && !isSelected && (
              <Badge variant="amber" className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] gap-1 py-0.5">
                <Trophy className="h-3 w-3 text-amber-600" />
                Current Leader
              </Badge>
            )}
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {voteCount} {voteCount === 1 ? "vote" : "votes"}
          </span>
        </div>

        {/* Date Display */}
        <div className="space-y-0.5 mb-4">
          <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className={`h-5 w-5 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
            {formatDisplayDate(dateStr)}
          </h4>
          <p className="text-xs font-medium text-slate-500">
            {formatWithDay(dateStr).split(",")[0]} &bull; Post Nov 24, 2026
          </p>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500">Distribution</span>
            <span className="text-slate-900 font-bold">{percentage}%</span>
          </div>
          <Progress
            value={percentage}
            className="h-2.5 bg-slate-100"
            indicatorClassName={
              isSelected
                ? "bg-indigo-600"
                : isLeading
                ? "bg-amber-500"
                : "bg-slate-400"
            }
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-slate-100">
        {isClosed ? (
          <Button disabled variant="outline" className="w-full text-xs h-9">
            Polling Closed
          </Button>
        ) : isSelected ? (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-100/60 py-2 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            Vote Recorded
          </div>
        ) : showConfirm ? (
          <div className="flex items-center gap-2 animate-in fade-in">
            <Button
              size="sm"
              variant="default"
              className="flex-1 text-xs h-9 bg-indigo-600"
              onClick={handleVoteClick}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Confirm Vote
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-9"
              onClick={() => setShowConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-9 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300"
            onClick={() => setShowConfirm(true)}
          >
            Vote for this Date
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

