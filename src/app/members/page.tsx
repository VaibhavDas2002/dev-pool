import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { dataService } from "@/lib/data-service";
import { formatRelativeTime, formatShortDate } from "@/lib/utils/date";
import { getInitials, getAvatarColor } from "@/lib/utils";
import { Users, ArrowLeft, CheckCircle2, Clock, ShieldCheck, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function MembersPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }

  const members = await dataService.getPublicMembers();
  const votedCount = members.filter((m) => m.has_voted).length;

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Batch Members ({members.length})
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Registered classmates participating in the certificate collection poll
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-white py-1 px-3 border-indigo-200 text-indigo-700">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                {votedCount} of {members.length} have voted
              </Badge>
            </div>
          </div>
        </div>

        {/* Member Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Card
              key={member.id}
              className="rounded-2xl border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-indigo-200 transition-all p-4 flex items-center justify-between gap-3 bg-white"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold text-sm shadow-inner ${getAvatarColor(
                    member.full_name
                  )}`}
                >
                  {getInitials(member.full_name)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-slate-900 truncate">
                      {member.full_name}
                    </p>
                    {member.role === "admin" && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded shrink-0">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Joined {formatRelativeTime(member.created_at)}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {member.has_voted ? (
                  <Badge variant="success" className="text-[11px] py-0.5 px-2 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Voted
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[11px] py-0.5 px-2 text-slate-400 gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

