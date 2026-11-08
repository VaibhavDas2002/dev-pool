"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Users, Shield, ArrowRight, Sparkles, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { DEMO_ADMIN_MOBILE, DEMO_ADMIN_NAME, DEMO_ADMIN_PASSWORD } from "@/lib/constants";

export default function LandingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const cleanMobile = mobileNumber.replace(/\D/g, "");
  const isAdminMobile = cleanMobile === "6297977842";

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name (at least 2 characters).");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number (e.g., 6297977842).");
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
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const setPresetUser = (name: string, phone: string, pass?: string) => {
    setFullName(name);
    setMobileNumber(phone);
    if (pass) setPassword(pass);
    else setPassword("");
    setErrorMsg("");
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/60 via-slate-50 to-white">
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
            <span>15+ batchmates already participated in polling</span>
          </div>
        </div>

        {/* Right Column: Simple Onboarding Card */}
        <div className="lg:col-span-5">
          <Card className="rounded-3xl border-slate-200/80 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-2 shadow-inner">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Join the Reunion</h2>
              <p className="text-xs text-indigo-100 mt-1">
                Enter your details to cast your vote & join the group chat
              </p>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <Input
                    placeholder="e.g., Vaibhav Das"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    10-Digit Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      +91
                    </span>
                    <Input
                      type="tel"
                      placeholder="6297977842"
                      className="pl-12"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      maxLength={10}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Used to remember your vote. Never displayed publicly.
                  </p>
                </div>

                {/* Conditional Admin Password Field */}
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

              {/* Demo Quick Selectors */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                  Quick Demo Profiles
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetUser("Vaibhav Das", "6297977842", "abcd@1234")}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200/80 transition-colors text-left"
                  >
                    👑 Vaibhav Das (Admin)
                    <span className="block text-[10px] text-amber-700 font-normal">6297977842</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetUser("Priya Sharma", "9876543211")}
                    className="p-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200/60 transition-colors text-left"
                  >
                    🎓 Priya (Member)
                    <span className="block text-[10px] text-violet-500 font-normal">9876543211</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
