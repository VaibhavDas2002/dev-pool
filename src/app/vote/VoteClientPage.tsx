"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Poll, PollResults, PollOption, Vote } from "@/types";
import { formatDisplayDate, formatWithDay } from "@/lib/utils/date";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { CalendarView } from "@/components/polling/CalendarView";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ShieldCheck, 
  Info, 
  Clock, 
  Vote as VoteIcon,
  AlertCircle,
  Star,
  Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInitials, getAvatarStyle } from "@/lib/utils";
import { VoteConfirmationModal } from "@/components/polling/VoteConfirmationModal";
import { toast } from "sonner";

interface VoteClientPageProps {
  user: {
    id: string;
    full_name: string;
    role: "member" | "admin";
  };
  initialPoll: Poll;
  initialResults: PollResults;
  initialOptions: PollOption[];
  initialUserVote: Vote | null;
}

export function VoteClientPage({
  user,
  initialPoll,
  initialResults,
  initialOptions,
  initialUserVote,
}: VoteClientPageProps) {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [results, setResults] = useState<PollResults>(initialResults);
  const [options, setOptions] = useState<PollOption[]>(initialOptions);
  const [userVote, setUserVote] = useState<Vote | null>(initialUserVote);
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    initialUserVote?.option_id || initialOptions[0]?.id || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isClosed = poll.status === "closed" || poll.status === "finalized";
  const deadlinePassed = new Date(poll.voting_deadline).getTime() < Date.now();

  const currentOption = options.find((o) => o.id === selectedOptionId);
  const votedOption = options.find((o) => o.id === userVote?.option_id);

  const handleVoteSubmit = async (reasonText?: string) => {
    if (!selectedOptionId) {
      toast.error("Please select a date option");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/poll/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poll_id: poll.id,
          option_id: selectedOptionId,
          reason: reasonText || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record vote");
      }

      setUserVote({
        id: data.result.vote_id,
        poll_id: poll.id,
        option_id: selectedOptionId,
        user_id: user.id,
        reason: data.result.reason || reasonText || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (data.results) {
        setResults(data.results);
      }

      setShowConfirmModal(false);
      if (data.result.is_update) {
        toast.success("Your preferred date & travel note have been updated! 🎓");
      } else {
        toast.success("Your vote has been recorded successfully! 🎓");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Vote submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 mb-2">
            <VoteIcon className="h-3.5 w-3.5" />
            <span>Official B.Tech Poll</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {poll.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {poll.subtitle}
          </p>
        </div>

        {/* Voting Deadline Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <CountdownTimer targetDate={poll.voting_deadline} label="Voting Closes In" />
        </div>
      </div>

      {/* User's Active Vote Banner */}
      {userVote && votedOption && (
        <div className="rounded-2xl border border-indigo-200/90 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div
              style={getAvatarStyle(user.full_name)}
              className="h-10 w-10 rounded-xl text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
            >
              {getInitials(user.full_name)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  Your Current Choice:
                </span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {formatWithDay(votedOption.option_date)}
                </span>
                <Badge variant="success" className="text-[10px] py-0 px-2 font-bold">
                  Active Vote
                </Badge>
              </div>
              {userVote.reason ? (
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">💬 Your Note:</span>
                  <span className="italic leading-relaxed">&ldquo;{userVote.reason}&rdquo;</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">
                  No note added. Click below to add your travel / availability reason.
                </p>
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedOptionId(votedOption.id);
              setShowConfirmModal(true);
            }}
            className="text-xs h-8 px-3 rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-white dark:hover:bg-slate-900 font-bold"
          >
            Edit Note / Date
          </Button>
        </div>
      )}

      {/* Closed warning */}
      {(isClosed || deadlinePassed) && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>
            Voting is currently closed. Results are final or being evaluated by the class administrator.
          </span>
        </div>
      )}

      {/* Date Options Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Month Calendar */}
        <div className="lg:col-span-5 space-y-3">
          {(() => {
            const votersByDate: Record<string, import("@/types").OptionVoter[]> = {};
            results.options.forEach((opt) => {
              votersByDate[opt.option_date] = opt.voters || [];
            });

            return (
              <CalendarView
                availableDates={options.map((o) => o.option_date)}
                selectedDate={currentOption?.option_date || null}
                leadingDate={results.leading_date || null}
                isClosed={isClosed || deadlinePassed}
                votersByDate={votersByDate}
                currentUserInitials={getInitials(user.full_name)}
                currentUserId={user.id}
                hasConfirmedVote={!!userVote}
                onSelectDate={(dateStr) => {
                  const matched = options.find((o) => o.option_date === dateStr);
                  if (matched) setSelectedOptionId(matched.id);
                }}
              />
            );
          })()}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
            <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Click on any highlighted date in the calendar or select from the cards on the right.
            </span>
          </div>
        </div>

        {/* Right Column: Date Cards */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Choose Your Preferred Date</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All selectable dates are scheduled on or after November 25, 2026.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {options.map((option) => {
            const isChecked = selectedOptionId === option.id;
            const isAlreadyVoted = userVote?.option_id === option.id;
            const optResult = results.options.find((r) => r.option_id === option.id);
            const votesCount = optResult?.vote_count || 0;
            const isRecommended = option.is_recommended ?? optResult?.is_recommended;
            const label = option.label || optResult?.label;
            const note = option.note || optResult?.note;
            const voters = optResult?.voters || [];

            return (
              <div
                key={option.id}
                onClick={() => !isClosed && setSelectedOptionId(option.id)}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  isChecked
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm"
                    : isRecommended
                    ? "border-amber-200/80 dark:border-amber-800/80 bg-gradient-to-b from-amber-50/20 dark:from-amber-950/20 to-white dark:to-slate-900 hover:border-amber-300"
                    : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/50"
                } ${isClosed ? "cursor-not-allowed opacity-80" : ""}`}
              >
                <div>
                  {/* Badges row */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
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

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                          isChecked
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <div>
                        <span className="text-lg font-black text-slate-900 dark:text-slate-100 block">
                          {formatDisplayDate(option.option_date)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {formatWithDay(option.option_date).split(",")[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isAlreadyVoted && (
                        <Badge variant="default" className="text-[10px] bg-indigo-600">
                          Selection ({getInitials(user.full_name)})
                        </Badge>
                      )}
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {votesCount} {votesCount === 1 ? "vote" : "votes"}
                      </span>
                    </div>
                  </div>

                  {note && (
                    <div className="mb-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-2.5 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">💡</span>
                      <span>{note}</span>
                    </div>
                  )}

                  {/* Voter initials stack */}
                  {voters && voters.length > 0 && (
                    <div className="mb-3 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {voters.slice(0, 4).map((voter, idx) => (
                            <div
                              key={voter.user_id + idx}
                              style={getAvatarStyle(voter.full_name)}
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-white ring-1 ring-white dark:ring-slate-900 ${
                                voter.user_id === user.id ? "scale-110 z-10 ring-indigo-500" : ""
                              }`}
                              title={voter.full_name + (voter.user_id === user.id ? " (You)" : "")}
                            >
                              {voter.initials}
                            </div>
                          ))}
                        </div>
                        {voters.length > 4 && (
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            +{voters.length - 4}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {voters.length} voted
                      </span>
                    </div>
                  )}

                  {isAlreadyVoted && (
                    <div className="mb-3 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-900 dark:text-indigo-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div
                            style={getAvatarStyle(user.full_name)}
                            className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-2xs"
                          >
                            {getInitials(user.full_name)}
                          </div>
                          <span>Your vote confirmed!</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOptionId(option.id);
                            setShowConfirmModal(true);
                          }}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 underline font-bold hover:text-indigo-800"
                        >
                          Edit Note
                        </button>
                      </div>
                      {userVote?.reason && (
                        <div className="text-[10px] font-normal italic text-slate-600 dark:text-slate-300 pl-6 flex items-start gap-1">
                          <span className="text-indigo-600 dark:text-indigo-400 not-italic shrink-0">💬</span>
                          <span>&ldquo;{userVote.reason}&rdquo;</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span>Batchmate Gathering</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{optResult?.percentage || 0}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Voting Submission Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>
              {votedOption
                ? `You previously voted for ${formatDisplayDate(votedOption.option_date)}. Submitting will update your preference.`
                : "You haven't submitted your vote yet. Choose a date and click submit."}
            </span>
          </div>

          <Button
            size="lg"
            className="w-full sm:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
            disabled={isClosed || deadlinePassed || isSubmitting || !selectedOptionId}
            onClick={() => setShowConfirmModal(true)}
          >
            {userVote ? "Update My Vote" : "Submit Official Vote"}
          </Button>
        </div>
      </div>
      </div>

      {/* Vote Configuration & Reason Modal */}
      <VoteConfirmationModal
        isOpen={showConfirmModal && !!currentOption}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleVoteSubmit}
        selectedDate={currentOption?.option_date || ""}
        label={currentOption?.label}
        note={currentOption?.note}
        isRecommended={currentOption?.is_recommended}
        currentReason={userVote?.option_id === selectedOptionId ? userVote?.reason : ""}
        isUpdate={!!userVote}
        isLoading={isSubmitting}
      />
    </div>
  );
}

