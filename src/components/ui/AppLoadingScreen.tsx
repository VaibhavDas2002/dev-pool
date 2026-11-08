"use client";

import React from "react";
import { GraduationCap, Sparkles } from "lucide-react";

interface AppLoadingScreenProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
}

export function AppLoadingScreen({
  message = "Loading Campus Reunion Poll",
  submessage = "Syncing live votes, discussions & batch records...",
  fullScreen = true,
}: AppLoadingScreenProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none animate-in fade-in duration-500">
      {/* Animated glowing badge */}
      <div className="relative mb-6">
        {/* Outer glowing pulsing ring */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-500 opacity-25 blur-xl animate-pulse" />
        
        {/* Middle rotating border */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/25">
          <GraduationCap className="h-10 w-10 animate-bounce duration-1000" />
        </div>

        {/* Small floating spark */}
        <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-md animate-spin duration-3000">
          <Sparkles className="h-4 w-4 fill-slate-950" />
        </div>
      </div>

      {/* Title & Animated Status */}
      <h3 className="text-xl font-black tracking-tight text-slate-900 mb-1">
        {message}
      </h3>
      <p className="text-xs font-medium text-slate-500 max-w-xs mb-6">
        {submessage}
      </p>

      {/* High-level glowing animated progress bar */}
      <div className="relative h-1.5 w-52 overflow-hidden rounded-full bg-slate-100">
        <div className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-400 rounded-full animate-[shimmer_1.5s_infinite_linear]" 
             style={{
               animation: "moveProgress 1.4s infinite cubic-bezier(0.65, 0, 0.35, 1)"
             }}
        />
      </div>

      <style jsx>{`
        @keyframes moveProgress {
          0% {
            left: -100%;
            width: 50%;
          }
          50% {
            left: 25%;
            width: 75%;
          }
          100% {
            left: 100%;
            width: 50%;
          }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return <div className="py-16">{content}</div>;
}

