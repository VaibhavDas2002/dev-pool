import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { dataService } from "@/lib/data-service";
import { DEFAULT_POLL_ID } from "@/lib/constants";
import { AdminClientPage } from "./AdminClientPage";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const poll = await dataService.getPoll(DEFAULT_POLL_ID);
  const activePollId = poll.id;

  const [results, options, members, chatMessages, adminVote] = await Promise.all([
    dataService.getPollResults(activePollId),
    dataService.getPollOptions(activePollId),
    dataService.getPublicMembers(),
    dataService.getChatMessages(),
    dataService.getUserVote(activePollId, user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <AdminClientPage
          user={user}
          initialPoll={poll}
          initialResults={results}
          initialOptions={options}
          initialMembers={members}
          initialMessages={chatMessages}
          initialAdminVote={adminVote}
        />
      </div>
    </div>
  );
}

