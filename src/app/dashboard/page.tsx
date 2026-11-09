import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { dataService } from "@/lib/data-service";
import { DEFAULT_POLL_ID } from "@/lib/constants";
import { StatCards } from "@/components/dashboard/StatCards";
import { WinnerBanner } from "@/components/dashboard/WinnerBanner";
import { CollegeMemories } from "@/components/dashboard/CollegeMemories";
import { TieBreakAlert } from "@/components/polling/TieBreakAlert";
import { DashboardClientContent } from "./DashboardClientContent";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }

  const poll = await dataService.getPoll(DEFAULT_POLL_ID);
  const activePollId = poll.id;

  const [results, options, userVote, announcements] = await Promise.all([
    dataService.getPollResults(activePollId),
    dataService.getPollOptions(activePollId),
    dataService.getUserVote(activePollId, user.id),
    dataService.getAnnouncements(),
  ]);

  const isFinalized = poll.status === "finalized" && !!poll.finalized_date;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Announcements Banner */}
      {announcements.length > 0 && announcements[0].is_pinned && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2.5 text-xs text-indigo-900">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="truncate">
              <strong>{announcements[0].title}:</strong> {announcements[0].content}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-10 shadow-lg overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 border border-white/15">
              <span>Class of 2026 Reunion</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Back to Campus, Together 🎓
            </h1>
            <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
              Four years of memories. One more reason to meet. Let&apos;s decide when we&apos;re heading back to college to collect our official B.Tech graduation certificates!
            </p>
          </div>
        </div>

        {/* Final Winner Banner if Poll Closed */}
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
          />
        )}

        {/* Statistics Cards */}
        <StatCards
          totalMembers={results.total_members}
          totalVotes={results.total_votes}
          leadingDate={results.leading_date}
          leadingVotes={results.leading_votes}
          isTie={results.is_tie}
          status={poll.status}
          finalizedDate={poll.finalized_date}
          votingDeadline={poll.voting_deadline}
          isAdmin={user.role === "admin"}
          pollId={poll.id}
        />

        {/* Interactive Client Content: Quick Vote & Results & Chat Preview */}
        <DashboardClientContent
          user={user}
          initialPoll={poll}
          initialResults={results}
          initialOptions={options}
          initialUserVote={userVote}
        />

        {/* Nostalgic College Memories Component */}
        <CollegeMemories />
      </div>
    </div>
  );
}

