import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { dataService } from "@/lib/data-service";
import { DEFAULT_POLL_ID } from "@/lib/constants";
import { VoteClientPage } from "./VoteClientPage";

export default async function VotePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }

  const pollId = DEFAULT_POLL_ID;
  const [poll, results, options, userVote] = await Promise.all([
    dataService.getPoll(pollId),
    dataService.getPollResults(pollId),
    dataService.getPollOptions(pollId),
    dataService.getUserVote(pollId, user.id),
  ]);

  if (!poll) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Poll not available</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <VoteClientPage
          user={user}
          initialPoll={poll}
          initialResults={results}
          initialOptions={options}
          initialUserVote={userVote}
        />
      </div>
    </div>
  );
}

