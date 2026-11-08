import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { dataService } from "@/lib/data-service";
import { DEFAULT_POLL_ID } from "@/lib/constants";
import { ResultsClientView } from "./ResultsClientView";

export default async function ResultsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }

  const poll = await dataService.getPoll(DEFAULT_POLL_ID);
  const activePollId = poll.id;

  const [results, options] = await Promise.all([
    dataService.getPollResults(activePollId),
    dataService.getPollOptions(activePollId),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <ResultsClientView
          user={user}
          initialPoll={poll}
          initialResults={results}
          initialOptions={options}
        />
      </div>
    </div>
  );
}

