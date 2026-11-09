import React from "react";
import { Users, Vote, Trophy, Calendar, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils/date";
import { CountdownTimer } from "./CountdownTimer";

interface StatCardsProps {
  totalMembers: number;
  totalVotes: number;
  leadingDate: string | null | undefined;
  leadingVotes: number;
  isTie: boolean;
  status: string;
  finalizedDate?: string | null;
  votingDeadline: string;
  isAdmin?: boolean;
  pollId?: string;
  onDeadlineChange?: (newDeadline: string, newStatus?: string) => void;
}

export function StatCards({
  totalMembers,
  totalVotes,
  leadingDate,
  leadingVotes,
  isTie,
  status,
  finalizedDate,
  votingDeadline,
  isAdmin = false,
  pollId,
  onDeadlineChange,
}: StatCardsProps) {
  const turnoutPercentage = totalMembers > 0 ? Math.round((totalVotes / totalMembers) * 100) : 0;
  const isFinalized = status === "finalized" && !!finalizedDate;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Friends Joined */}
      <Card className="hover:border-indigo-200 transition-all shadow-sm">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Friends Joined
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{totalMembers}</span>
              <span className="text-xs font-medium text-emerald-600">Batchmates</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {Math.max(0, totalMembers - totalVotes)} yet to vote
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Votes Submitted */}
      <Card className="hover:border-indigo-200 transition-all shadow-sm">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Vote className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Votes Submitted
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{totalVotes}</span>
              <span className="text-xs font-bold text-violet-600">({turnoutPercentage}%)</span>
            </div>
            <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-violet-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, turnoutPercentage)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Leading Date or Official Winner */}
      <Card className="hover:border-indigo-200 transition-all shadow-sm">
        <CardContent className="p-5 flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isFinalized
                ? "bg-amber-100 text-amber-700"
                : isTie
                ? "bg-rose-50 text-rose-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {isFinalized ? (
              <Trophy className="h-6 w-6 text-amber-600" />
            ) : (
              <Sparkles className="h-6 w-6 text-amber-500" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {isFinalized ? "Confirmed Date" : isTie ? "Current Tie" : "Current Leader"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 truncate max-w-[150px]">
                {isFinalized
                  ? formatShortDate(finalizedDate)
                  : isTie
                  ? "Tie detected!"
                  : leadingDate
                  ? formatShortDate(leadingDate)
                  : "No votes yet"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFinalized
                ? "Official Visit Date 🎉"
                : isTie
                ? "Needs runoff / admin decision"
                : leadingVotes > 0
                ? `${leadingVotes} votes so far`
                : "Be the first to vote!"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Countdown: Visit Day vs Voting Time Remaining */}
      <Card className="hover:border-indigo-200 transition-all shadow-sm">
        <CardContent className="p-5 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <CountdownTimer
              targetDate={isFinalized ? `${finalizedDate}T09:00:00+05:30` : votingDeadline}
              label={isFinalized ? "Reunion Countdown" : "Voting Deadline"}
              isVisitDate={isFinalized}
              isAdmin={isAdmin}
              pollId={pollId}
              status={status}
              onDeadlineChange={onDeadlineChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

