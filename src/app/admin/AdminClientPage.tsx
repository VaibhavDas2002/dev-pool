"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Poll, PollResults, PollOption, PublicProfile, ChatMessage } from "@/types";
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
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
}

export function AdminClientPage({
  user,
  initialPoll,
  initialResults,
  initialOptions,
  initialMembers,
  initialMessages,
}: AdminClientPageProps) {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [results, setResults] = useState<PollResults>(initialResults);
  const [options, setOptions] = useState<PollOption[]>(initialOptions);
  const [members, setMembers] = useState<PublicProfile[]>(initialMembers);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Form states
  const [newOptionDate, setNewOptionDate] = useState("");
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [pollStatus, setPollStatus] = useState(poll.status);
  const [votingDeadline, setVotingDeadline] = useState(
    poll.voting_deadline ? poll.voting_deadline.substring(0, 16) : ""
  );
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  // Tie resolution
  const [tieSelectedDate, setTieSelectedDate] = useState("");
  const [tieNote, setTieNote] = useState("");
  const [isResolvingTie, setIsResolvingTie] = useState(false);

  // Add date option
  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionDate) return;

    if (newOptionDate < "2026-11-25") {
      toast.error("Date must be after November 24, 2026 (earliest is Nov 25, 2026).");
      return;
    }

    try {
      setIsAddingOption(true);
      const res = await fetch("/api/admin/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_OPTION",
          poll_id: poll.id,
          option_date: newOptionDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add date");
      }

      toast.success(`Date option ${newOptionDate} added!`);
      setOptions((prev) => [...prev, data.option].sort((a, b) => a.option_date.localeCompare(b.option_date)));
      setNewOptionDate("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error adding option");
    } finally {
      setIsAddingOption(false);
    }
  };

  // Remove option
  const handleRemoveOption = async (optionId: string, optionDate: string) => {
    if (!confirm(`Are you sure you want to remove ${formatDisplayDate(optionDate)}? Any existing votes on this date will be deleted.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REMOVE_OPTION",
          poll_id: poll.id,
          option_id: optionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove option");

      toast.success("Date option removed");
      setOptions((prev) => prev.filter((o) => o.id !== optionId));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error removing date");
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <ShieldAlert className="h-7 w-7 text-indigo-600" />
              Admin Command Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Class Representative controls for dates, deadlines, tie-breaks, and batch moderation
            </p>
          </div>

          <Badge variant="amber" className="text-xs px-3 py-1 font-bold">
            Administrator: {user.full_name}
          </Badge>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Poll Configuration */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold">Poll Status & Deadline</CardTitle>
              <CardDescription className="text-xs">
                Control whether voting is active, closed, or officially finalized
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Poll Status
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Voting Deadline (Asia/Kolkata)
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Participation Overview</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 font-semibold">Members</p>
                <p className="text-xl font-black text-slate-800">{members.length}</p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                <p className="text-xs text-indigo-500 font-semibold">Votes</p>
                <p className="text-xl font-black text-indigo-700">{results.total_votes}</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-xs text-emerald-500 font-semibold">Turnout</p>
                <p className="text-xl font-black text-emerald-700">{results.turnout_percentage}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Manage Date Options */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold">Manage Date Options</CardTitle>
              <CardDescription className="text-xs">
                Add or remove date options. Must be strictly after November 24, 2026.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Add Date Form */}
              <form onSubmit={handleAddOption} className="flex gap-2">
                <input
                  type="date"
                  min="2026-11-25"
                  className="flex-1 rounded-xl border border-slate-300 p-2.5 text-sm bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={newOptionDate}
                  onChange={(e) => setNewOptionDate(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs px-4"
                  isLoading={isAddingOption}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Date
                </Button>
              </form>

              {/* Existing Options List */}
              <div className="space-y-2">
                {options.map((opt) => {
                  const optResult = results.options.find((r) => r.option_id === opt.id);
                  const votes = optResult?.vote_count || 0;

                  return (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-4 w-4 text-indigo-600" />
                        <div>
                          <p className="font-bold text-sm text-slate-900">
                            {formatDisplayDate(opt.option_date)}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatWithDay(opt.option_date).split(",")[0]}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs font-bold">
                          {votes} {votes === 1 ? "vote" : "votes"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(opt.id, opt.option_date)}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Remove option"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Moderation Feed */}
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">Live Chat Moderation</h3>
          </div>
          <span className="text-xs text-slate-400">
            Admins can delete any inappropriate message
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2.5 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                m.is_deleted ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-800">{m.sender_name}</span>
                  <span className="text-[10px] text-slate-400">{formatChatTime(m.created_at)}</span>
                  {m.is_deleted && (
                    <span className="text-[10px] text-rose-500 font-semibold italic">Deleted</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 truncate mt-0.5">{m.message}</p>
              </div>

              {!m.is_deleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleModerateMessage(m.id)}
                  className="text-xs text-rose-600 hover:bg-rose-50 h-8 px-2"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Moderate
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

