"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Poll, PollResults, PollOption, PublicProfile, ChatMessage, Vote } from "@/types";
import { formatDisplayDate, formatWithDay, formatChatTime } from "@/lib/utils/date";
import { 
  ShieldAlert, 
  ArrowLeft, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Save, 
  Scale, 
  MessageSquare,
  Users,
  Trophy,
  Vote as VoteIcon,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreatePollModal } from "@/components/admin/CreatePollModal";
import { AdminDateCustomizer } from "@/components/admin/AdminDateCustomizer";
import { MemberManagementCard } from "@/components/admin/MemberManagementCard";
import { VoteConfirmationModal } from "@/components/polling/VoteConfirmationModal";
import { toast } from "sonner";

interface AdminClientPageProps {
  user: {
    id: string;
    full_name: string;
    role: "member" | "admin";
  };
  initialPoll: Poll;
  initialResults: PollResults;
  initialOptions: PollOption[];
  initialMembers: PublicProfile[];
  initialMessages: ChatMessage[];
  initialAdminVote?: Vote | null;
}

export function AdminClientPage({
  user,
  initialPoll,
  initialResults,
  initialOptions,
  initialMembers,
  initialMessages,
  initialAdminVote,
}: AdminClientPageProps) {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [results, setResults] = useState<PollResults>(initialResults);
  const [options, setOptions] = useState<PollOption[]>(initialOptions);
  const [members, setMembers] = useState<PublicProfile[]>(initialMembers);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [adminVote, setAdminVote] = useState<Vote | null>(initialAdminVote || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAdminVoteModal, setShowAdminVoteModal] = useState(false);
  const [selectedAdminVoteOptionId, setSelectedAdminVoteOptionId] = useState<string>(
    initialAdminVote?.option_id || initialOptions[0]?.id || ""
  );
  const [isSubmittingAdminVote, setIsSubmittingAdminVote] = useState(false);

  const [pollStatus, setPollStatus] = useState(poll.status);
  const [votingDeadline, setVotingDeadline] = useState(
    poll.voting_deadline ? poll.voting_deadline.substring(0, 16) : ""
  );
  const [disableWeekends, setDisableWeekends] = useState(false);
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  // Tie resolution
  const [tieSelectedDate, setTieSelectedDate] = useState("");
  const [tieNote, setTieNote] = useState("");
  const [isResolvingTie, setIsResolvingTie] = useState(false);

  // Admin vote handler
  const handleAdminVoteSubmit = async (reasonText: string) => {
    if (!selectedAdminVoteOptionId) {
      toast.error("Please pick a date option");
      return;
    }

    try {
      setIsSubmittingAdminVote(true);
      const res = await fetch("/api/poll/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poll_id: poll.id,
          option_id: selectedAdminVoteOptionId,
          reason: reasonText || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record administrator vote");
      }

      setAdminVote({
        id: data.result.vote_id,
        poll_id: poll.id,
        option_id: selectedAdminVoteOptionId,
        user_id: user.id,
        reason: data.result.reason || reasonText || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (data.results) {
        setResults(data.results);
      }

      setShowAdminVoteModal(false);
      toast.success("Administrator vote saved & counted in live poll tally! 🎓");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to record vote");
    } finally {
      setIsSubmittingAdminVote(false);
    }
  };

  // Update Config
  const handleSaveConfig = async () => {
    try {
      setIsUpdatingConfig(true);
      const res = await fetch("/api/admin/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_CONFIG",
          poll_id: poll.id,
          updates: {
            status: pollStatus,
            voting_deadline: new Date(votingDeadline).toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update configuration");

      toast.success("Poll configuration saved successfully!");
      setPoll(data.poll);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update poll");
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  // Finalize Poll
  const handleFinalize = async (dateStr?: string) => {
    if (!confirm("Are you sure you want to finalize this poll? Once finalized, the winning date will be officially declared.")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "FINALIZE",
          poll_id: poll.id,
          selected_date: dateStr,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to finalize");

      toast.success("Poll finalized! Official reunion date announced.");
      setPoll(data.poll);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error finalizing poll");
    }
  };

  // Resolve Tie
  const handleResolveTie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tieSelectedDate || tieNote.trim().length < 5) {
      toast.error("Please pick a date and explain your decision.");
      return;
    }

    try {
      setIsResolvingTie(true);
      const res = await fetch("/api/admin/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESOLVE_TIE",
          poll_id: poll.id,
          selected_date: tieSelectedDate,
          resolution_note: tieNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resolve tie");

      toast.success("Tie resolved & poll finalized!");
      setPoll(data.poll);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Tie resolution failed");
    } finally {
      setIsResolvingTie(false);
    }
  };

  // Moderate message
  const handleModerateMessage = async (msgId: string) => {
    try {
      const res = await fetch("/api/chat/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_id: msgId }),
      });

      if (!res.ok) throw new Error("Could not moderate message");
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, is_deleted: true } : m)));
      toast.success("Message moderated");
    } catch (err: unknown) {
      toast.error("Moderation action failed");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <ShieldAlert className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              Admin Command Center
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Class Representative controls for dates, deadlines, tie-breaks, and batch moderation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-xs font-bold shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
              Create New Poll
            </Button>
            <Badge variant="amber" className="text-xs px-3 py-1 font-bold">
              Administrator: {user.full_name}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tie Resolution Section (Highlighted if active tie) */}
      {results.is_tie && poll.status !== "finalized" && (
        <Card className="border-amber-300 bg-amber-50/70 shadow-sm rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-amber-600" />
            <div>
              <h3 className="text-base font-bold text-amber-900">
                Action Required: Resolve Equal Vote Tie
              </h3>
              <p className="text-xs text-amber-800">
                Multiple dates have tied with {results.leading_votes} votes. College planner rules require an explicit admin decision.
              </p>
            </div>
          </div>

          <form onSubmit={handleResolveTie} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.tied_options.map((t) => (
                <label
                  key={t.option_id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer bg-white transition-all ${
                    tieSelectedDate === t.option_date
                      ? "border-amber-600 bg-amber-100/50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tie_date"
                      value={t.option_date}
                      checked={tieSelectedDate === t.option_date}
                      onChange={(e) => setTieSelectedDate(e.target.value)}
                    />
                    <span className="font-bold text-sm text-slate-900">
                      {formatDisplayDate(t.option_date)}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {t.vote_count} votes
                  </Badge>
                </label>
              ))}
            </div>

            <Input
              placeholder="Rationale / Note: e.g. Discussed with Department Dean; HOD confirmed available..."
              value={tieNote}
              onChange={(e) => setTieNote(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
              isLoading={isResolvingTie}
            >
              Resolve Tie & Finalize Date
            </Button>
          </form>
        </Card>
      )}

      {/* Grid: Poll Configuration & Date Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Poll Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-3xl border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">Poll Status & Deadline</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Control whether voting is active, closed, or officially finalized
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Poll Status
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 text-sm bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={pollStatus}
                  onChange={(e) => setPollStatus(e.target.value as any)}
                >
                  <option value="draft">Draft (Hidden from voting)</option>
                  <option value="open">Open (Accepting votes)</option>
                  <option value="closed">Closed (Voting locked, pending announcement)</option>
                  <option value="finalized">Finalized (Official date declared)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Voting Deadline (Asia/Kolkata)
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 text-sm bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={votingDeadline}
                  onChange={(e) => setVotingDeadline(e.target.value)}
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  onClick={handleSaveConfig}
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                  isLoading={isUpdatingConfig}
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save Poll Settings
                </Button>

                {poll.status !== "finalized" && results.leading_date && !results.is_tie && (
                  <Button
                    variant="outline"
                    onClick={() => handleFinalize(results.leading_date!)}
                    className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                  >
                    <Trophy className="h-3.5 w-3.5 mr-1 text-amber-600" />
                    Finalize Leading Date
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Summary */}
          <Card className="rounded-3xl border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Participation Overview</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 font-semibold">Members</p>
                <p className="text-xl font-black text-slate-800 dark:text-slate-100">{members.length}</p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800">
                <p className="text-xs text-indigo-500 font-semibold">Votes</p>
                <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">{results.total_votes}</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800">
                <p className="text-xs text-emerald-500 font-semibold">Turnout</p>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{results.turnout_percentage}%</p>
              </div>
            </div>
          </Card>

          {/* Administrator Vote on this Poll */}
          <Card className="rounded-3xl border-indigo-200/90 dark:border-indigo-800/80 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <VoteIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Your Admin Vote on this Poll
                </h3>
              </div>
              <Badge variant="amber" className="text-[10px] py-0 px-2 font-bold">
                Admin Privilege
              </Badge>
            </div>

            {adminVote && options.find((o) => o.id === adminVote.option_id) ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">
                      Recorded Choice:
                    </span>
                    <span className="font-black text-base text-slate-900 dark:text-slate-100">
                      {formatDisplayDate(options.find((o) => o.id === adminVote.option_id)!.option_date)}
                    </span>
                  </div>
                  <Badge variant="success" className="text-xs font-bold">
                    Active & Counted
                  </Badge>
                </div>

                {adminVote.reason && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-indigo-50/60 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-start gap-1.5">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">💬 Note:</span>
                    <span className="italic leading-snug">&ldquo;{adminVote.reason}&rdquo;</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedAdminVoteOptionId(adminVote.option_id);
                      setShowAdminVoteModal(true);
                    }}
                    className="w-full text-xs h-8 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-bold"
                  >
                    Change / Update Admin Vote
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Admins can vote on any poll in any status (draft, open, or closed). Your vote will be officially counted in the live tally.
                </p>
                <div className="space-y-2">
                  <select
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    value={selectedAdminVoteOptionId}
                    onChange={(e) => setSelectedAdminVoteOptionId(e.target.value)}
                  >
                    {options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {formatWithDay(opt.option_date)} {opt.label ? `(${opt.label})` : ""}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={() => setShowAdminVoteModal(true)}
                    className="w-full text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    <VoteIcon className="h-3.5 w-3.5 mr-1.5" />
                    Cast Administrator Vote
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Manage & Customize Date Options */}
        <div className="lg:col-span-7 space-y-6">
          <AdminDateCustomizer
            pollId={poll.id}
            pollStatus={poll.status}
            options={options}
            results={results}
            disableWeekends={disableWeekends}
            onDisableWeekendsChange={setDisableWeekends}
            onOptionsChange={(newOptions) => setOptions(newOptions)}
            onSelectOfficialDate={async (dateStr) => {
              await handleFinalize(dateStr);
            }}
          />
        </div>
      </div>

      {/* Batchmate & Member Access Control (Active / Inactive) */}
      <MemberManagementCard
        members={members}
        currentUserId={user.id}
        onMembersUpdate={(updated) => setMembers(updated)}
      />

      {/* Chat Moderation Feed */}
      <Card className="rounded-3xl border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Live Chat Moderation</h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Admins can delete any inappropriate message
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2.5 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                m.is_deleted
                  ? "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-60"
                  : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{m.sender_name}</span>
                  <span className="text-[10px] text-slate-400">{formatChatTime(m.created_at)}</span>
                  {m.is_deleted && (
                    <span className="text-[10px] text-rose-500 font-semibold italic">Deleted</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">{m.message}</p>
              </div>

              {!m.is_deleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleModerateMessage(m.id)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 h-8 px-2"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Moderate
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Create Poll Dialog */}
      <CreatePollModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Admin Vote Modal */}
      {showAdminVoteModal && (
        <VoteConfirmationModal
          isOpen={showAdminVoteModal}
          onClose={() => setShowAdminVoteModal(false)}
          onConfirm={handleAdminVoteSubmit}
          selectedDate={options.find((o) => o.id === selectedAdminVoteOptionId)?.option_date || options[0]?.option_date || "2026-11-25"}
          label={options.find((o) => o.id === selectedAdminVoteOptionId)?.label}
          note={options.find((o) => o.id === selectedAdminVoteOptionId)?.note}
          isRecommended={options.find((o) => o.id === selectedAdminVoteOptionId)?.is_recommended}
          currentReason={adminVote?.reason || ""}
          isUpdate={!!adminVote}
          isLoading={isSubmittingAdminVote}
        />
      )}
    </div>
  );
}

