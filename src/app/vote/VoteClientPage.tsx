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
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const handleVoteSubmit = async () => {
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (data.results) {
        setResults(data.results);
      }

      setShowConfirmModal(false);
      if (data.result.is_update) {
        toast.success("Your preferred date has been updated!");
      } else {
        toast.success("Your vote has been recorded successfully!");
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200/60 mb-2">
            <VoteIcon className="h-3.5 w-3.5" />
            <span>Official B.Tech Poll</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {poll.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            {poll.subtitle}
          </p>
        </div>

        {/* Voting Deadline Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <CountdownTimer targetDate={poll.voting_deadline} label="Voting Closes In" />
        </div>
      </div>

      {/* Closed warning */}
      {(isClosed || deadlinePassed) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center gap-2">
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
          <CalendarView
            availableDates={options.map((o) => o.option_date)}
            selectedDate={currentOption?.option_date || null}
            leadingDate={results.leading_date || null}
            isClosed={isClosed || deadlinePassed}
            onSelectDate={(dateStr) => {
              const matched = options.find((o) => o.option_date === dateStr);
              if (matched) setSelectedOptionId(matched.id);
            }}
          />
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
            <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Click on any highlighted date in the calendar or select from the cards on the right.
            </span>
          </div>
        </div>

        {/* Right Column: Date Cards */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Choose Your Preferred Date</h2>
            <p className="text-xs text-slate-500">
              All selectable dates are scheduled on or after November 25, 2026.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {options.map((option) => {
            const isChecked = selectedOptionId === option.id;
            const isAlreadyVoted = userVote?.option_id === option.id;
            const optResult = results.options.find((r) => r.option_id === option.id);
            const votesCount = optResult?.vote_count || 0;

            return (
              <div
                key={option.id}
                onClick={() => !isClosed && setSelectedOptionId(option.id)}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  isChecked
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                    : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60"
                } ${isClosed ? "cursor-not-allowed opacity-80" : ""}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                        isChecked
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div>
                      <span className="text-lg font-black text-slate-900 block">
                        {formatDisplayDate(option.option_date)}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {formatWithDay(option.option_date).split(",")[0]}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {isAlreadyVoted && (
                      <Badge variant="default" className="text-[10px] bg-indigo-600">
                        Current Selection
                      </Badge>
                    )}
                    <span className="text-xs font-bold text-slate-500">
                      {votesCount} {votesCount === 1 ? "vote" : "votes"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Batchmate Gathering</span>
                  <span className="text-indigo-600 font-semibold">{optResult?.percentage || 0}%</span>
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

      {/* Confirmation Modal */}
      {showConfirmModal && currentOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <VoteIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {userVote ? "Update Your Preference?" : "Confirm Your Vote"}
                </h3>
                <p className="text-xs text-slate-500">
                  {user.full_name} &bull; Campus Reunion Poll
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Selected Date:
              </p>
              <p className="text-xl font-black text-slate-900">
                {formatWithDay(currentOption.option_date)}
              </p>
              <p className="text-xs text-slate-500 pt-1">
                You can change this date any time before the voting deadline.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleVoteSubmit}
                isLoading={isSubmitting}
              >
                Confirm Selection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

