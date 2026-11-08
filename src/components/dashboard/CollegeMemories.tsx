import React from "react";
import { GraduationCap, Camera, Coffee, Library, MapPin } from "lucide-react";

export function CollegeMemories() {
  const highlights = [
    { icon: Library, title: "Central Library Steps", desc: "Batch photo in formal attire before degrees" },
    { icon: Coffee, title: "Canteen Chai & Samosa", desc: "One last round of cutting chai with the gang" },
    { icon: Camera, title: "OAT & Department Labs", desc: "Reliving 4 years of engineering grind" },
    { icon: MapPin, title: "Dean's Counter", desc: "Collecting the stamped B.Tech Degree Scroll" },
  ];

  return (
    <div className="rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/50 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <GraduationCap className="h-4 w-4" />
            <span>Cherished Nostalgia</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            One last walk through campus. One more memory together.
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Four years flew by in a heartbeat. Let&apos;s close this chapter the right way &mdash; together as one batch.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((h, i) => {
          const Icon = h.icon;
          return (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-2xl bg-white p-4 border border-slate-200/70 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                {h.title}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">{h.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

