import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { dataService } from "@/lib/data-service";
import { ChatBox } from "@/components/chat/ChatBox";
import { MessageSquare, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export default async function DiscussionPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }

  const initialMessages = await dataService.getChatMessages();

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users className="h-4 w-4 text-indigo-500" />
            <span>Class of 2026 Batchmates</span>
          </div>
        </div>

        {/* Live Chat Window */}
        <ChatBox
          currentUser={user}
          initialMessages={initialMessages}
          compact={false}
        />
      </div>
    </div>
  );
}

