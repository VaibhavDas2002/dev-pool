"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Vote, 
  BarChart3, 
  MessageSquare, 
  Users, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X,
  Share2,
  Calendar,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInitials, getAvatarColor, getAvatarStyle } from "@/lib/utils";
import { toast } from "sonner";

interface NavbarProps {
  user?: {
    id: string;
    full_name: string;
    role: "member" | "admin";
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Sparkles },
    { href: "/vote", label: "Vote", icon: Vote },
    { href: "/results", label: "Results", icon: BarChart3 },
    { href: "/discussion", label: "Discussion", icon: MessageSquare },
    { href: "/members", label: "Members", icon: Users },
  ];

  if (user?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin", icon: ShieldAlert });
  }

  const handleShare = async () => {
    const shareData = {
      title: "Campus Reunion Poll — B.Tech Certificate Collection",
      text: "Hey friend! Help us choose the date to visit college and collect our B.Tech certificates together!",
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Invite shared with friends!");
      } catch (err) {
        // Ignored if cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.origin);
      toast.success("Invitation link copied to clipboard!");
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              Campus Reunion
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              B.Tech Poll
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Action Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Share Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 border-slate-200"
            title="Share with batchmates"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Invite Friends</span>
          </Button>

          {user ? (
            <div className="flex items-center gap-3">
              {/* User Avatar & Info */}
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-sm ring-1 ring-black/5 ${getAvatarColor(
                    user.full_name
                  )}`}
                  style={getAvatarStyle(user.full_name)}
                >
                  {getInitials(user.full_name)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-semibold leading-none text-slate-900 flex items-center gap-1.5">
                    {user.full_name}
                    {user.role === "admin" && (
                      <Badge variant="amber" className="text-[10px] py-0 px-1.5 h-4">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Log out"
                className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                Join Reunion
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          <div className="pb-2 pt-1 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs shadow-sm ring-1 ring-black/5 ${getAvatarColor(
                  user.full_name
                )}`}
                style={getAvatarStyle(user.full_name)}
              >
                {getInitials(user.full_name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{user.full_name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleShare} className="text-xs h-8">
              <Share2 className="h-3.5 w-3.5 mr-1" />
              Share
            </Button>
          </div>

          <div className="pt-2 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4 text-rose-600" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

