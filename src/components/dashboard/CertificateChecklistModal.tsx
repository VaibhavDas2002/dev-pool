"use client";

import React, { useState } from "react";
import { formatDisplayDate, formatWithDay } from "@/lib/utils/date";
import { 
  FileText, 
  CheckSquare, 
  Clock, 
  MapPin, 
  Camera, 
  Coffee, 
  Copy, 
  Check, 
  X,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CertificateChecklistModalProps {
  finalizedDate?: string | null;
}

export function CertificateChecklistModal({ finalizedDate }: CertificateChecklistModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const visitDateText = finalizedDate ? formatWithDay(finalizedDate) : "Post-Nov 24, 2026 (Date TBD)";

  const checklistItems = [
    { title: "Original College ID Card", desc: "Or government photo ID (Aadhaar / Voter ID)" },
    { title: "Library No-Dues Receipt", desc: "Stamped by Central Library clearance desk" },
    { title: "Department Clearance Form", desc: "Signed by Project Guide & HOD" },
    { title: "Provisional Degree Copy", desc: "For verifying Student Enrollment / Roll Number" },
    { title: "2 Passport Size Photographs", desc: "Required for Alumni Association Registry" },
  ];

  const scheduleItems = [
    { time: "10:30 AM", event: "Meet at Main Admin Block Gate", icon: MapPin },
    { time: "11:00 AM - 1:00 PM", event: "Degree Scroll Handover at Counter 3", icon: FileText },
    { time: "01:30 PM", event: "Dean & Faculty Interaction", icon: Clock },
    { time: "02:00 PM", event: "Batch Graduation Photo on Library Steps", icon: Camera },
    { time: "03:30 PM", event: "Maggi Point & Canteen Celebration", icon: Coffee },
  ];

  const handleCopyItinerary = async () => {
    const text = `🎓 B.Tech Batch 2022-2026 Certificate Collection Plan!
📅 Official Visit Date: ${visitDateText}
🏛️ Location: Main Administration Block

📋 Essential Documents Checklist:
1. College ID Card / Govt ID
2. Library No-Dues Receipt
3. Signed Department Clearance Form
4. Provisional Certificate copy
5. 2 Passport photos

⏰ Day Schedule:
- 10:30 AM: Meet at Main Gate
- 11:00 AM: Degree Counter Clearance
- 02:00 PM: Batch Photo on Library Steps
- 03:30 PM: Maggi Point Canteen Celebration!

Coordinated via Campus Reunion Poll`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Itinerary copied to clipboard for WhatsApp!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
      >
        <FileText className="h-3.5 w-3.5" />
        <span>Collection Checklist & Schedule</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Certificate Collection Protocol
                  </h3>
                  <p className="text-xs text-slate-500">
                    B.Tech Degree Handover Checklist & Schedule
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Visit Date Badge */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">
                  Reunion Target Date
                </p>
                <p className="text-sm font-black text-slate-900">{visitDateText}</p>
              </div>
              <Badge variant="default" className="text-xs bg-indigo-600">
                Official Batch Event
              </Badge>
            </div>

            {/* Required Documents Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-emerald-600" />
                Documents Required at Counter
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-2.5"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold mt-0.5">
                      ✓
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proposed Day Schedule */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-600" />
                Proposed Day Schedule
              </h4>
              <div className="space-y-2 border-l-2 border-indigo-200 ml-2 pl-4">
                {scheduleItems.map((sch, i) => {
                  const Icon = sch.icon;
                  return (
                    <div key={i} className="relative flex items-center justify-between text-xs py-1">
                      <span className="absolute -left-[23px] h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                      <span className="font-bold text-indigo-900">{sch.event}</span>
                      <span className="text-slate-400 font-medium">{sch.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyItinerary}
                className="text-xs gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy for WhatsApp"}</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-xs px-5"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

