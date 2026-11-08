"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Phone,
  UserCheck,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLoginModal } from "@/components/auth/AdminLoginModal";
import { getInitials, getAvatarStyle } from "@/lib/utils";
import { toast } from "sonner";

interface SavedProfile {
  id: string;
  full_name: string;
  mobile_number: string;
  role: "admin" | "member";
}

export default function LandingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Suggestions state
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const nameContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  // Fetch saved profiles on mount
  useEffect(() => {
    fetch("/api/auth/suggestions")
      .then((res) => res.json())
      .then((data) => {
        if (data?.profiles && Array.isArray(data.profiles)) {
          setSavedProfiles(data.profiles);
        }
      })
      .catch((err) => console.warn("Could not load profile suggestions:", err));
  }, []);

  // Dismiss dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nameContainerRef.current && !nameContainerRef.current.contains(e.target as Node)) {
        setShowNameSuggestions(false);
      }
      if (mobileContainerRef.current && !mobileContainerRef.current.contains(e.target as Node)) {
        setShowMobileSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cleanMobile = mobileNumber.replace(/\D/g, "");
  const isAdminMobile = cleanMobile === "6297977842";

  // Filter profiles for name input
  const filteredByName = savedProfiles.filter((p) => {
    if (!fullName.trim()) return true;
    const q = fullName.toLowerCase().trim();
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.mobile_number.includes(q)
    );
  });

  // Filter profiles for mobile input
  const filteredByMobile = savedProfiles.filter((p) => {
    if (!mobileNumber.trim()) return true;
    const q = mobileNumber.trim().replace(/\D/g, "");
    const nameQ = mobileNumber.toLowerCase().trim();
    return (
      p.mobile_number.includes(q) ||
      p.full_name.toLowerCase().includes(nameQ)
    );
  });

  const handleSelectProfile = (p: SavedProfile) => {
    setFullName(p.full_name);
    setMobileNumber(p.mobile_number);
    setShowNameSuggestions(false);
    setShowMobileSuggestions(false);
    setErrorMsg("");
    toast.success(`Selected ${p.full_name}! (Both name & mobile filled)`);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name (at least 2 characters).");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).");
      return;
    }

    if (isAdminMobile && !password) {
      setErrorMsg("Admin account password is required for Vaibhav Das.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          mobile_number: cleanMobile,
          password: password || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join reunion poll");
      }

      toast.success(`Welcome ${data.user.full_name}! 🎓`);
      router.push(data.redirect || "/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/60 via-slate-50 to-white">
      {/* Corner Admin Login Button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20">
        <button
          type="button"
          onClick={() => setIsAdminModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 border border-slate-200/90 shadow-sm hover:shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          title="Class Representative Administrator Login"
        >
          <Shield className="h-3.5 w-3.5 text-amber-500" />
          <span>Admin Login</span>
        </button>
      </div>

      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-200/40 via-violet-200/30 to-amber-200/20 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Nostalgic Story */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100/80 px-4 py-1.5 text-xs font-bold text-indigo-800 border border-indigo-200 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Official B.Tech Batch 2022-2026 Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Back to Campus, <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Together as One Batch 🎓
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Four years of late-night submissions, canteen laughs, and memories. Now it&apos;s time to collect our graduation certificates together. Choose our official visit date after November 24, 2026.
          </p>

          {/* Value props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/70 border border-slate-200/70 shadow-xs">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Democratically Chosen</p>
                <p className="text-[11px] text-slate-500">Highest votes decides our visit date</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/70 border border-slate-200/70 shadow-xs">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Real-Time Discussion</p>
                <p className="text-[11px] text-slate-500">Live chat without endless WhatsApp noise</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-medium text-slate-500">
            <Users className="h-4 w-4 text-indigo-600" />
            <span>15+ batchmates already participating in polling</span>
          </div>
        </div>

        {/* Right Column: Simple Onboarding Card */}
        <div className="lg:col-span-5">
          <Card className="rounded-3xl border-slate-200/80 shadow-xl bg-white/95 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Join the Reunion</h2>
                    <p className="text-xs text-indigo-100">B.Tech Batchmates</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors shadow-2xs"
                  title="Admin Portal Login"
                >
                  <Shield className="h-3 w-3 text-amber-300" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleJoin} className="space-y-4">
                {/* Full Name Input with Autocomplete Dropdown */}
                <div ref={nameContainerRef} className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Your Full Name
                    </label>
                    {savedProfiles.length > 0 && (
                      <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {savedProfiles.length} registered
                      </span>
                    )}
                  </div>
                  <Input
                    placeholder="e.g., Rahul Das"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setShowNameSuggestions(true);
                    }}
                    onFocus={() => setShowNameSuggestions(true)}
                    required
                    disabled={isLoading}
                    autoFocus
                  />

                  {/* Autocomplete Dropdown for Name */}
                  {showNameSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border border-indigo-100 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="bg-slate-50/90 px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="flex items-center gap-1.5 text-indigo-700">
                          <Users className="h-3.5 w-3.5 text-indigo-600" />
                          Saved Batchmates ({filteredByName.length})
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Click to auto-fill name & number
                        </span>
                      </div>

                      {filteredByName.length === 0 ? (
                        <div className="p-3.5 text-center text-xs text-slate-400">
                          No matching registered batchmate found. You can register as a new member!
                        </div>
                      ) : (
                        <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                          {filteredByName.slice(0, 8).map((p) => (
                            <div
                              key={p.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectProfile(p);
                              }}
                              className="flex items-center justify-between p-2.5 px-3.5 hover:bg-indigo-50/80 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  style={getAvatarStyle(p.full_name)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black shrink-0 shadow-2xs"
                                >
                                  {getInitials(p.full_name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate transition-colors">
                                    {p.full_name}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                    <Phone className="h-2.5 w-2.5 text-slate-400" />
                                    +91 {p.mobile_number}
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-1.5">
                                {p.role === "admin" && (
                                  <Badge variant="amber" className="text-[10px] py-0 px-1.5 font-bold">
                                    👑 Admin
                                  </Badge>
                                )}
                                <span className="text-[11px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                  Select &rarr;
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 10-Digit Mobile Number Input with Autocomplete Dropdown */}
                <div ref={mobileContainerRef} className="relative">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    10-Digit Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      +91
                    </span>
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      className="pl-12"
                      value={mobileNumber}
                      onChange={(e) => {
                        setMobileNumber(e.target.value);
                        setShowMobileSuggestions(true);
                      }}
                      onFocus={() => setShowMobileSuggestions(true)}
                      maxLength={10}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Used to remember your vote. Never displayed publicly.
                  </p>

                  {/* Autocomplete Dropdown for Mobile Number */}
                  {showMobileSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border border-indigo-100 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="bg-slate-50/90 px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="flex items-center gap-1.5 text-indigo-700">
                          <Phone className="h-3.5 w-3.5 text-indigo-600" />
                          Saved Mobile Numbers ({filteredByMobile.length})
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Click to auto-fill
                        </span>
                      </div>

                      {filteredByMobile.length === 0 ? (
                        <div className="p-3.5 text-center text-xs text-slate-400">
                          No matching number found in saved batchmates. You can register as a new member!
                        </div>
                      ) : (
                        <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                          {filteredByMobile.slice(0, 8).map((p) => (
                            <div
                              key={p.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectProfile(p);
                              }}
                              className="flex items-center justify-between p-2.5 px-3.5 hover:bg-indigo-50/80 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  style={getAvatarStyle(p.full_name)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black shrink-0 shadow-2xs"
                                >
                                  {getInitials(p.full_name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate transition-colors">
                                    +91 {p.mobile_number}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-medium">
                                    {p.full_name}
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-1.5">
                                {p.role === "admin" && (
                                  <Badge variant="amber" className="text-[10px] py-0 px-1.5 font-bold">
                                    👑 Admin
                                  </Badge>
                                )}
                                <span className="text-[11px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                  Select &rarr;
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Conditional Admin Password Field if Admin phone is entered */}
                {isAdminMobile && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-amber-600" />
                        Admin Password
                      </label>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-200/70 px-1.5 py-0.5 rounded">
                        Class Rep Security
                      </span>
                    </div>

                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password (abcd@1234)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={isAdminMobile}
                        disabled={isLoading}
                        className="pr-10 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                    {errorMsg}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
                  isLoading={isLoading}
                >
                  Join the Reunion
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>

              {/* Bottom Info Bar without Quick Profiles */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  No password required for batchmates
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Admin Login →
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
}
