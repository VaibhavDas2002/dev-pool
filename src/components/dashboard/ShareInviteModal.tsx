"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, MessageCircle, Sparkles, X, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareInviteModalProps {
  className?: string;
  triggerVariant?: "button" | "card";
}

export function ShareInviteModal({
  className = "",
  triggerVariant = "button",
}: ShareInviteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const getInviteUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://campus-reunion-poll.vercel.app";
  };

  const inviteText = `🎓 Hey batchmates! Let's decide together when to visit college to collect our B.Tech certificates after Nov 24, 2026. Vote for your preferred date here: ${getInviteUrl()}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getInviteUrl());
      setCopied(true);
      toast.success("Invitation link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteText)}`;
    window.open(url, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Campus Reunion Poll — B.Tech Certificate Collection",
          text: "Hey! Choose our official date to collect our B.Tech certificates together after Nov 24, 2026.",
          url: getInviteUrl(),
        });
        toast.success("Shared successfully!");
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      {triggerVariant === "card" ? (
        <div
          onClick={() => setIsOpen(true)}
          className={`cursor-pointer rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-amber-500/10 p-4 transition-all hover:border-indigo-300 hover:shadow-sm ${className}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">Invite Your Batchmates</p>
                <p className="text-xs text-slate-500">Share poll directly to your WhatsApp group</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-xs bg-white border-slate-200 shrink-0">
              Share
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className={`text-xs gap-1.5 border-slate-200 ${className}`}
        >
          <Share2 className="h-3.5 w-3.5 text-indigo-600" />
          <span>Invite Friends</span>
        </Button>
      )}

      {/* Share Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Invite Batchmates</h3>
                  <p className="text-xs text-slate-500">Get everyone to vote on the visit date</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleWhatsAppShare}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2 shadow-sm"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>Share to WhatsApp Batch Group</span>
              </Button>

              <Button
                onClick={handleNativeShare}
                variant="outline"
                className="w-full h-11 border-slate-200 font-bold rounded-xl gap-2 hover:bg-slate-50"
              >
                <Share2 className="h-4 w-4 text-indigo-600" />
                <span>More Share Options</span>
              </Button>
            </div>

            {/* Copyable Link Bar */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Poll Website Link
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getInviteUrl()}
                  className="flex-1 bg-transparent text-xs text-slate-700 font-mono focus:outline-none truncate select-all"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-8 text-xs bg-white border-slate-200 shrink-0"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-400">
              Privacy Guaranteed: Mobile numbers are never included in shared invitation links.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
