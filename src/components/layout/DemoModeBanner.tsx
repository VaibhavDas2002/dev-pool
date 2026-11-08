"use client";

import React, { useState } from "react";
import { ShieldCheck, Info, X } from "lucide-react";

export function DemoModeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-indigo-900 text-indigo-100 px-4 py-2 text-xs flex items-center justify-between border-b border-indigo-800">
      <div className="mx-auto flex items-center gap-2 max-w-7xl">
        <Info className="h-4 w-4 text-amber-300 shrink-0" />
        <span>
          <strong>Private Reunion Mode Active:</strong> Quick onboarding enabled for classmate testing. Production mode supports Supabase Phone Auth OTP.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-indigo-300 hover:text-white p-0.5 rounded"
        title="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

