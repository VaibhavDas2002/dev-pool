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

  const pollId = DEFAULT_POLL_ID;
  const [poll, results, options, members, chatMessages] = await Promise.all([
    dataService.getPoll(pollId),
    dataService.getPollResults(pollId),
    dataService.getPollOptions(pollId),
    dataService.getPublicMembers(),
    dataService.getChatMessages(),
  ]);

  if (!poll) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Admin control unavailable</h2>
      </div>
    );
  }

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
        />
      </div>
    </div>
  );
}

