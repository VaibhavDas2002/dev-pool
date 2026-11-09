"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Poll, PollResults, PollOption, Vote, SessionUser } from "@/types";
import { formatDisplayDate, formatWithDay } from "@/lib/utils/date";
import { DateOptionCard } from "@/components/polling/DateOptionCard";
import { ChatBox } from "@/components/chat/ChatBox";
import { CertificateChecklistModal } from "@/components/dashboard/CertificateChecklistModal";
import { 
  CheckCircle2, 
  ArrowRight, 
  BarChart3, 
  Vote as VoteIcon, 
  Clock, 
  MessageSquare, 
  Users 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DashboardClientContentProps {
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

export function DashboardClientContent({
  user,
  initialPoll,
  initialResults,
  initialOptions,
  initialUserVote,
}: DashboardClientContentProps) {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [results, setResults] = useState<PollResults>(initialResults);
  const [options, setOptions] = useState<PollOption[]>(initialOptions);
  const [userVote, setUserVote] = useState<Vote | null>(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);

  // Find currently selected option date
  const selectedOption = options.find((o) => o.id === userVote?.option_id);

  const handleVote = async (optionId: string, reason?: string, optionDate?: string) => {
    try {
      setIsVoting(true);
      const matchedOpt = options.find((o) => o.id === optionId);
      const res = await fetch("/api/poll/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poll_id: poll.id,
          option_id: optionId,
          option_date: optionDate || matchedOpt?.option_date || undefined,
          reason: reason || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit vote");
      }

      const activePollId = data.result?.poll_id || poll.id;
      const activeOptionId = data.result?.option_id || optionId;

      setUserVote({
        id: data.result.vote_id,
        poll_id: activePollId,
        option_id: activeOptionId,
        user_id: user.id,
        reason: data.result.reason || reason || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (data.results) {
        setResults(data.results);
      }

      if (data.result.is_update) {
        toast.success("Your vote & travel note have been updated! 🎓");
      } else {
        toast.success("Your vote has been recorded successfully! 🎓");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Voting failed");
    } finally {
      setIsVoting(false);
    }
  };

  const isClosed = poll.status === "closed" || poll.status === "finalized";

  return (
    <div className="space-y-8">
      {/* User Personal Vote Status Banner */}
      <div className="rounded-3xl border border-indigo-200/90 dark:border-indigo-800/80 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 mt-0.5">
            <VoteIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Your Official Vote</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{user.full_name}</span>
            </p>
            {userVote && selectedOption ? (
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-slate-900 dark:text-slate-100 text-lg">
                    {formatWithDay(selectedOption.option_date)}
                  </span>
                  <Badge variant="success" className="text-xs font-bold gap-1 py-0.5">
                    <CheckCircle2 className="h-3 w-3" />
                    Active Vote Confirmed
                  </Badge>
                </div>

                {userVote.reason ? (
                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-indigo-50/70 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/80 flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">💬 Your Note:</span>
                    <span className="italic leading-relaxed">&ldquo;{userVote.reason}&rdquo;</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">
                    No travel note added yet. You can add one anytime so batchmates know your plans!
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="font-extrabold text-amber-700 dark:text-amber-400 text-base">
                  You haven&apos;t cast your vote yet!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose your preferred date below and let your batch know when you can make it.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <CertificateChecklistModal finalizedDate={poll.finalized_date} />
          <Link href="/vote" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
              size="sm"
            >
              <span>{userVote ? "Edit Vote or Reason" : "Cast Vote Now"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Date Options (Left) and Live Results Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Date Options */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Available Reunion Dates
              </h2>
              <p className="text-xs text-slate-500">
                Select your preferred day to visit campus after Nov 24, 2026
              </p>
            </div>
            <Link href="/vote" className="text-xs font-bold text-indigo-600 hover:underline">
              View Calendar &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map((opt) => {
              const optResult = results.options.find((r) => r.option_id === opt.id);
              const voteCount = optResult?.vote_count || 0;
              const percentage = optResult?.percentage || 0;
              const isSelected = userVote?.option_id === opt.id;
              const isLeading = results.leading_option_id === opt.id && voteCount > 0;

              return (
                <DateOptionCard
                  key={opt.id}
                  pollId={poll.id}
                  optionId={opt.id}
                  dateStr={opt.option_date}
                  label={opt.label || optResult?.label}
                  note={opt.note || optResult?.note}
                  isRecommended={opt.is_recommended ?? optResult?.is_recommended}
                  voteCount={voteCount}
                  percentage={percentage}
                  isSelected={isSelected}
                  isLeading={isLeading}
                  isClosed={isClosed}
                  voters={optResult?.voters || []}
                  currentUser={user}
                  currentUserReason={isSelected ? userVote?.reason : undefined}
                  onVote={handleVote}
                />
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Participation Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-3xl border-slate-200/90 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-base font-bold">Live Vote Standings</CardTitle>
                </div>
                <Badge variant="outline" className="text-[11px] bg-white">
                  {results.total_votes} / {results.total_members} Voted
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Calculated directly from verified batch member records
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {results.options.map((opt) => {
                const isSelected = userVote?.option_id === opt.option_id;
                const isLeading = results.leading_option_id === opt.option_id && opt.vote_count > 0;

                return (
                  <div key={opt.option_id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        {formatDisplayDate(opt.option_date)}
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                        {isLeading && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            Leading
                          </span>
                        )}
                      </span>
                      <span className="font-extrabold text-slate-900">
                        {opt.vote_count} votes ({opt.percentage}%)
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLeading ? "bg-amber-500" : isSelected ? "bg-indigo-600" : "bg-slate-400"
                        }`}
                        style={{ width: `${opt.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Participation Rate:</span>
                <span className="font-bold text-slate-800">{results.turnout_percentage}%</span>
              </div>

              <Link href="/results" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Full Results Analysis &rarr;
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Discussion Preview Card */}
          <Card className="rounded-3xl border-slate-200/90 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                <h4 className="font-bold text-sm text-slate-900">Batch Discussion</h4>
              </div>
              <Link href="/discussion" className="text-xs font-bold text-indigo-600 hover:underline">
                Open Chat &rarr;
              </Link>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Have questions about provisional degrees, no-dues, or after-party lunch plans? Join the discussion with friends!
            </p>
            <Link href="/discussion" className="block">
              <Button size="sm" className="w-full text-xs bg-indigo-600 hover:bg-indigo-700">
                Join College Reunion Discussion
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

