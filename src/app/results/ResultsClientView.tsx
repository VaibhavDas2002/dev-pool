"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Poll, PollResults, PollOption } from "@/types";
import { formatDisplayDate, formatWithDay } from "@/lib/utils/date";
import { WinnerBanner } from "@/components/dashboard/WinnerBanner";
import { TieBreakAlert } from "@/components/polling/TieBreakAlert";
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Vote, 
  Trophy, 
  RefreshCw, 
  Clock, 
  Sparkles,
  Calendar
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResultsClientViewProps {
  user: {
    id: string;
    full_name: string;
    role: "member" | "admin";
  };
  initialPoll: Poll;
  initialResults: PollResults;
  initialOptions: PollOption[];
}

export function ResultsClientView({
  user,
  initialPoll,
  initialResults,
  initialOptions,
}: ResultsClientViewProps) {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [results, setResults] = useState<PollResults>(initialResults);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchResults = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/poll/results?poll_id=${poll.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results) setResults(data.results);
        if (data.poll) setPoll(data.poll);
      }
    } catch {
      // Ignored
    } finally {
      setIsRefreshing(false);
    }
  };

  // Poll for realtime changes every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [poll.id]);

  const isFinalized = poll.status === "finalized" && !!poll.finalized_date;

  // Sort options by vote count descending
  const sortedOptions = [...results.options].sort((a, b) => b.vote_count - a.vote_count);

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            Real-Time Poll Results
            <Badge variant="outline" className="text-xs font-semibold py-0.5">
              Live Standings
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Updated in real-time as classmates cast and update their preferred dates
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchResults}
          disabled={isRefreshing}
          className="text-xs gap-1.5 border-slate-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Official Winner Banner if finalized */}
      {isFinalized && (
        <WinnerBanner
          finalizedDate={poll.finalized_date!}
          tieResolutionNote={poll.tie_resolution_note}
        />
      )}

      {/* Tie Detection Alert */}
      {results.is_tie && poll.status === "open" && (
        <TieBreakAlert
          pollId={poll.id}
          tiedOptions={results.tied_options}
          isAdmin={user.role === "admin"}
          onResolved={fetchResults}
        />
      )}

      {/* Key Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Members
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">{results.total_members}</p>
          <p className="text-[11px] text-slate-400">Class of 2026</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Votes
          </p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{results.total_votes}</p>
          <p className="text-[11px] text-slate-400">{results.turnout_percentage}% turnout</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pending Votes
          </p>
          <p className="text-2xl font-black text-amber-600 mt-1">{results.pending_members}</p>
          <p className="text-[11px] text-slate-400">Awaiting selection</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isFinalized ? "Confirmed Date" : "Current Leader"}
          </p>
          <p className="text-lg font-black text-slate-900 mt-1 truncate">
            {isFinalized
              ? formatDisplayDate(poll.finalized_date)
              : results.is_tie
              ? "Tie!"
              : results.leading_date
              ? formatDisplayDate(results.leading_date)
              : "No votes"}
          </p>
          <p className="text-[11px] text-slate-400">
            {isFinalized ? "Official Reunion" : `${results.leading_votes} votes`}
          </p>
        </div>
      </div>

      {/* Detailed Vote Distribution Chart */}
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-6">
          <CardTitle className="text-lg font-bold">Vote Distribution Across Dates</CardTitle>
          <CardDescription className="text-xs">
            Calculated from validated database records. Earliest allowed date: November 25, 2026.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {sortedOptions.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No date options configured.</p>
          ) : (
            sortedOptions.map((opt, rank) => {
              const isTop = rank === 0 && opt.vote_count > 0;
              const isLeader = results.leading_option_id === opt.option_id && !results.is_tie;

              return (
                <div key={opt.option_id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                        #{rank + 1}
                      </span>
                      <span className="font-extrabold text-slate-900 text-base">
                        {formatDisplayDate(opt.option_date)}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        ({formatWithDay(opt.option_date).split(",")[0]})
                      </span>

                      {isLeader && (
                        <Badge variant="amber" className="text-[10px] py-0.5 px-2 bg-amber-100 text-amber-900">
                          Leading
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-slate-900 text-base">
                        {opt.vote_count} {opt.vote_count === 1 ? "vote" : "votes"}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        ({opt.percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isLeader
                          ? "bg-gradient-to-r from-amber-500 to-amber-600"
                          : isTop
                          ? "bg-indigo-600"
                          : "bg-indigo-400"
                      }`}
                      style={{ width: `${Math.max(2, opt.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

