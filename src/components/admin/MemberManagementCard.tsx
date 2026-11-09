"use client";

import React, { useState, useMemo } from "react";
import { PublicProfile } from "@/types";
import { getInitials, getAvatarStyle } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/utils/date";
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  AlertCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface MemberManagementCardProps {
  members: PublicProfile[];
  currentUserId: string;
  onMembersUpdate: (updatedMembers: PublicProfile[]) => void;
}

export function MemberManagementCard({
  members,
  currentUserId,
  onMembersUpdate,
}: MemberManagementCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "inactive">("active");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const activeCount = useMemo(() => members.filter((m) => m.is_active !== false).length, [members]);
  const inactiveCount = useMemo(() => members.filter((m) => m.is_active === false).length, [members]);
  const votedCount = useMemo(() => members.filter((m) => m.has_voted).length, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch = m.full_name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const isActive = m.is_active !== false;
      if (!matchesSearch) return false;
      if (filterTab === "active") return isActive;
      if (filterTab === "inactive") return !isActive;
      return true;
    });
  }, [members, searchQuery, filterTab]);

  const handleToggleStatus = async (member: PublicProfile) => {
    if (member.role === "admin" || member.id === currentUserId) {
      toast.error("Administrators cannot be deactivated");
      return;
    }

    const newActiveState = member.is_active === false;
    const actionLabel = newActiveState ? "activate" : "deactivate";

    try {
      setTogglingId(member.id);
      const res = await fetch("/api/admin/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_MEMBER_STATUS",
          user_id: member.id,
          is_active: newActiveState,
          // Send member metadata so the server can auto-register if the profile
          // was lost due to a cold-start (Vercel serverless resets in-memory mock-store)
          full_name: member.full_name,
          mobile_number: member.mobile_number,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${actionLabel} member`);
      }

      const updated = members.map((m) =>
        m.id === member.id ? { ...m, is_active: newActiveState } : m
      );
      onMembersUpdate(updated);

      toast.success(
        newActiveState
          ? `${member.full_name} is now ACTIVE and can vote & chat.`
          : `${member.full_name} has been DEACTIVATED.`
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to ${actionLabel} member`);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Card className="rounded-3xl border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Batchmate Access Control
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Manage active/inactive status for members. Inactive members cannot log in, vote, or chat.
              </CardDescription>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 gap-1 py-1 font-bold">
              <UserCheck className="h-3 w-3" />
              {activeCount} Active
            </Badge>
            {inactiveCount > 0 && (
              <Badge variant="outline" className="bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 gap-1 py-1 font-bold">
                <UserX className="h-3 w-3" />
                {inactiveCount} Inactive
              </Badge>
            )}
            <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 gap-1 py-1 font-bold">
              <CheckCircle2 className="h-3 w-3" />
              {votedCount} Voted
            </Badge>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <Input
              type="text"
              placeholder="Search batchmate by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === "all"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              All ({members.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("active")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === "active"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("inactive")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === "inactive"
                  ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[460px] overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No batchmates match your filter or search query.
            </div>
          ) : (
            filteredMembers.map((m) => {
              const isActive = m.is_active !== false;
              const isAdmin = m.role === "admin";
              const isSelf = m.id === currentUserId;
              const isBusy = togglingId === m.id;

              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    !isActive
                      ? "bg-rose-50/20 dark:bg-rose-950/10 opacity-75"
                      : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {/* Left: Avatar + Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      style={getAvatarStyle(m.full_name)}
                      className="h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-xs ring-2 ring-white dark:ring-slate-800"
                    >
                      {getInitials(m.full_name)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {m.full_name}
                        </span>

                        {isAdmin && (
                          <Badge variant="amber" className="text-[10px] py-0 px-2 font-bold gap-1">
                            <ShieldCheck className="h-3 w-3 text-amber-600" />
                            Admin
                          </Badge>
                        )}

                        {isSelf && (
                          <Badge variant="outline" className="text-[10px] py-0 px-2 font-semibold">
                            You
                          </Badge>
                        )}

                        {/* Status Badge */}
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0 px-2 font-bold ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Vote state line */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {m.has_voted ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            Voted {m.voted_date ? `for ${formatDisplayDate(m.voted_date)}` : ""}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <Clock className="h-3 w-3" />
                            Not yet voted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isAdmin ? (
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                        Protected Admin
                      </span>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant={isActive ? "outline" : "default"}
                        disabled={isBusy}
                        onClick={() => handleToggleStatus(m)}
                        className={`text-xs h-8 px-3 rounded-xl font-bold transition-all ${
                          isActive
                            ? "text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : isActive ? (
                          <UserX className="h-3.5 w-3.5 mr-1 text-rose-500" />
                        ) : (
                          <UserCheck className="h-3.5 w-3.5 mr-1 text-white" />
                        )}
                        <span>{isActive ? "Deactivate" : "Activate"}</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

