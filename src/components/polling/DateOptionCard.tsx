"use client";

import React, { useState } from "react";
import { formatDisplayDate, formatWithDay } from "@/lib/utils/date";
import { CheckCircle2, Trophy, Calendar, ArrowRight, Loader2, Star, Sparkles, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OptionVoter } from "@/types";
import { getInitials, getAvatarStyle } from "@/lib/utils";
import { VoteConfirmationModal } from "@/components/polling/VoteConfirmationModal";

interface DateOptionCardProps {
  pollId: string;
  optionId: string;
  dateStr: string;
  label?: string | null;
  note?: string | null;
  isRecommended?: boolean;
  voteCount: number;
  percentage: number;
  isSelected: boolean;
  isLeading: boolean;
  isClosed: boolean;
  voters?: OptionVoter[];
  currentUser?: {
    id: string;
    full_name: string;
    role: "member" | "admin";
  };
  currentUserReason?: string | null;
  onVote: (optionId: string, reason?: string) => Promise<void>;
}

export function DateOptionCard({
  pollId,
  optionId,
  dateStr,
  label,
  note,
  isRecommended,
  voteCount,
  percentage,
  isSelected,
  isLeading,
  isClosed,
  voters = [],
  currentUser,
  currentUserReason,
  onVote,
}: DateOptionCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showVotersModal, setShowVotersModal] = useState(false);

  const handleConfirmVote = async (reasonText: string) => {
    try {
      setIsSubmitting(true);
      await onVote(optionId, reasonText);
      setShowConfigModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const userInitial = getInitials(currentUser?.full_name || "You");

  return (
    <>
      <div
        className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-sm ${
          isSelected
            ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30"
            : isLeading
            ? "border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/20 hover:border-amber-400"
            : isRecommended
            ? "border-amber-200/80 dark:border-amber-800/80 bg-gradient-to-b from-amber-50/30 dark:from-amber-950/20 to-white dark:to-slate-900 hover:border-amber-300"
            : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md"
        }`}
      >
        <div>
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {isSelected && (
                <Badge variant="default" className="bg-indigo-600 text-[11px] gap-1 py-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  Your Selection ({userInitial})
                </Badge>
              )}
              {isLeading && !isSelected && (
                <Badge variant="amber" className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-[11px] gap-1 py-0.5">
                  <Trophy className="h-3 w-3 text-amber-600" />
                  Current Leader
                </Badge>
              )}
              {isRecommended && (
                <Badge className="bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800 text-[10px] gap-1 font-bold py-0.5">
                  <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-600" />
                  Recommended
                </Badge>
              )}
              {label && (
                <Badge variant="outline" className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 py-0.5">
                  {label}
                </Badge>
              )}
            </div>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {voteCount} {voteCount === 1 ? "vote" : "votes"}
            </span>
          </div>

          {/* Date Display (Clickable to view voters) */}
          <div 
            onClick={() => setShowVotersModal(true)}
            className="space-y-0.5 mb-3 cursor-pointer group select-none"
            title="Click to view batchmates who chose this date"
          >
            <h4 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <Calendar className={`h-5 w-5 ${isSelected ? "text-indigo-600" : isRecommended ? "text-amber-500" : "text-slate-400"}`} />
              {formatDisplayDate(dateStr)}
            </h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {formatWithDay(dateStr).split(",")[0]} &bull; Post Nov 24, 2026
            </p>
          </div>

          {/* Admin Note if available */}
          {note && (
            <div className="mb-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-2.5 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5 leading-relaxed">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">💡</span>
              <span>{note}</span>
            </div>
          )}

          {/* Voter Initials on the Date */}
          {voters && voters.length > 0 && (
            <div 
              onClick={() => setShowVotersModal(true)}
              className="mb-3 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors"
              title="Click to view all voters"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  {voters.slice(0, 5).map((voter, idx) => (
                    <div
                      key={voter.user_id + idx}
                      style={getAvatarStyle(voter.full_name)}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 shadow-2xs ${
                        voter.user_id === currentUser?.id ? "scale-110 z-10 ring-indigo-500" : ""
                      }`}
                      title={voter.full_name + (voter.user_id === currentUser?.id ? " (You)" : "")}
                    >
                      {voter.initials}
                    </div>
                  ))}
                </div>
                {voters.length > 5 && (
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    +{voters.length - 5}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                <Users className="h-3 w-3" />
                <span>{voters.length} voted &rarr;</span>
              </span>
            </div>
          )}

          {/* User Confirmation Banner with Initials */}
          {isSelected && (
            <div className="mb-3 flex items-center gap-2 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold text-indigo-900 dark:text-indigo-200">
              <div
                style={getAvatarStyle(currentUser?.full_name || "You")}
                className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-2xs ring-2 ring-indigo-600"
              >
                {userInitial}
              </div>
              <span>Your vote confirmed on this date!</span>
            </div>
          )}

          {/* Horizontal Progress Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Distribution</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">{percentage}%</span>
            </div>
            <Progress
              value={percentage}
              className="h-2.5 bg-slate-100 dark:bg-slate-800"
              indicatorClassName={
                isSelected
                  ? "bg-indigo-600"
                  : isLeading
                  ? "bg-amber-500"
                  : "bg-slate-400 dark:bg-slate-600"
              }
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {isClosed ? (
            <Button disabled variant="outline" className="w-full text-xs h-9">
              Polling Closed
            </Button>
          ) : isSelected ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/60 py-2 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Your Vote ({userInitial})</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-9 px-3 rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                onClick={() => setShowConfigModal(true)}
              >
                Edit Note
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-9 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-800 font-bold"
              onClick={() => setShowConfigModal(true)}
            >
              Vote for this Date
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Date Click Voters Modal */}
      {showVotersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {formatDisplayDate(dateStr)}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatWithDay(dateStr).split(",")[0]} &bull; {voters.length} {voters.length === 1 ? "vote" : "votes"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVotersModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isSelected && (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                <div className="flex items-center gap-2">
                  <div
                    style={getAvatarStyle(currentUser?.full_name || "You")}
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-2xs"
                  >
                    {userInitial}
                  </div>
                  <span>You voted for this date!</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowVotersModal(false);
                    setShowConfigModal(true);
                  }}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 underline font-bold"
                >
                  Edit
                </button>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Batchmates who selected this date:
              </p>
              {voters.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3 text-center">
                  No batchmates have voted for this date yet.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {voters.map((v) => (
                    <div
                      key={v.user_id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            style={getAvatarStyle(v.full_name)}
                            className="h-7 w-7 rounded-full text-xs font-black text-white flex items-center justify-center shrink-0 shadow-2xs"
                          >
                            {v.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {v.full_name} {v.user_id === currentUser?.id ? "(You)" : ""}
                            </p>
                            <p className="text-[10px] text-slate-400 capitalize">
                              {v.role}
                            </p>
                          </div>
                        </div>

                        {v.user_id === currentUser?.id && (
                          <Badge variant="default" className="text-[10px] bg-indigo-600">
                            Your Vote
                          </Badge>
                        )}
                      </div>

                      {v.reason && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">💬</span>
                          <span className="italic leading-snug">&ldquo;{v.reason}&rdquo;</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full text-xs h-9"
              variant="outline"
              onClick={() => setShowVotersModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Vote Configuration & Reason Modal */}
      <VoteConfirmationModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfirm={handleConfirmVote}
        selectedDate={dateStr}
        label={label}
        note={note}
        isRecommended={isRecommended}
        currentReason={currentUserReason || voters.find((v) => v.user_id === currentUser?.id)?.reason || ""}
        isUpdate={isSelected}
        isLoading={isSubmitting}
      />
    </>
  );
}

