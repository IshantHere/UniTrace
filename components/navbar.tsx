"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  PlusCircle,
  Shield,
  Layers,
  Bell,
  LogOut,
  User,
  Sparkles,
  MapPin,
  ChevronDown,
  Compass,
  Menu,
  X,
  Trophy,
  Coins,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  points?: number;
  credits?: number;
  tier?: string;
  institution?: {
    name: string;
    slug: string;
  };
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.success && json.data?.user) {
        setUser(json.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  const handleQuickLogin = async (email: string) => {
    setShowDemoDropdown(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "Newton123!" }),
      });
      const json = await res.json();
      if (json.success) {
        const role = json.data?.user?.role;
        const target =
          json.data?.redirectUrl ||
          (role === "STAFF"
            ? "/staff/dashboard"
            : role === "ADMIN" || role === "SUPER_ADMIN"
            ? "/admin/dashboard"
            : "/dashboard");
        window.location.href = target;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#DADAD6] bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.jpeg"
              alt="UniTrace logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-md object-contain border border-[#DADAD6]"
              priority
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-bold tracking-tight text-[#171717]">UNITRACE</span>
                <span className="border border-[#DADAD6] bg-[#F7F7F5] px-1 py-0.2 text-[9px] font-mono font-medium text-[#777777]">
                  PRECISION
                </span>
              </div>
              <p className="hidden text-[9px] font-mono text-[#777777] sm:block">Newton University Safety Grid</p>
            </div>
          </Link>

          {/* Primary Navigation Links */}
          <nav className="hidden items-center gap-0.5 md:flex font-mono text-[11px]">
            <Link
              href="/search"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                pathname === "/search"
                  ? "bg-[#171717] text-white font-semibold"
                  : "text-[#555555] hover:bg-[#F2F2EE] hover:text-[#171717]"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              SEARCH REGISTRY
            </Link>

            <Link
              href="/report/lost"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                pathname.startsWith("/report/lost")
                  ? "bg-[#171717] text-white font-semibold"
                  : "text-[#555555] hover:bg-[#F2F2EE] hover:text-[#171717]"
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5 text-[#DC2626]" />
              REPORT LOST
            </Link>

            <Link
              href="/report/found"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                pathname.startsWith("/report/found")
                  ? "bg-[#171717] text-white font-semibold"
                  : "text-[#555555] hover:bg-[#F2F2EE] hover:text-[#171717]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#25845A]" />
              REPORT FOUND
            </Link>

            <Link
              href="/leaderboard"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                pathname.startsWith("/leaderboard")
                  ? "bg-[#171717] text-white font-semibold"
                  : "text-[#555555] hover:bg-[#F2F2EE] hover:text-[#171717]"
              }`}
            >
              <Trophy className="h-3.5 w-3.5 text-[#C27803]" />
              FINDERS
            </Link>

            {user?.role && ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(user.role) && (
              <Link
                href="/staff/dashboard"
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                  pathname.startsWith("/staff")
                    ? "bg-[#3867E8] text-white font-semibold"
                    : "text-[#3867E8] hover:bg-[#EDF2FD]"
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                STAFF OPS
              </Link>
            )}

            {user?.role && ["ADMIN", "SUPER_ADMIN"].includes(user.role) && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                  pathname.startsWith("/admin")
                    ? "bg-[#171717] text-white font-semibold"
                    : "text-[#777777] hover:bg-[#F2F2EE] hover:text-[#171717]"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                CONTROL ROOM
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowDemoDropdown(!showDemoDropdown)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#DADAD6] bg-[#F7F7F5] px-2.5 py-1 font-mono text-[11px] font-medium text-[#171717] transition hover:bg-[#EAEAE6]"
              title="Quickly switch between demo accounts"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#25845A]" />
              <span>ACCOUNTS</span>
              <ChevronDown className="h-3 w-3 text-[#777777]" />
            </button>

            {showDemoDropdown && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-md border border-[#DADAD6] bg-white p-1.5 shadow-popover z-50 font-sans">
                <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-[#777777]">
                  1-Click Persona Simulator
                </div>
                <button
                  onClick={() => handleQuickLogin("student@newton.edu")}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-[#171717] hover:bg-[#F7F7F5]"
                >
                  <span className="font-mono text-[10px] bg-[#EDF2FD] text-[#3867E8] px-1 py-0.5 rounded-sm">STU</span>
                  <div>
                    <div className="font-semibold text-[#171717]">Ishant Singh</div>
                    <div className="text-[10px] text-[#777777]">Student (AirPods Claimant)</div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickLogin("finder@newton.edu")}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-[#171717] hover:bg-[#F7F7F5]"
                >
                  <span className="font-mono text-[10px] bg-[#EBF6F0] text-[#25845A] px-1 py-0.5 rounded-sm">FND</span>
                  <div>
                    <div className="font-semibold text-[#171717]">Garvit Chahal</div>
                    <div className="text-[10px] text-[#777777]">Finder (Good Samaritan)</div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickLogin("staff@newton.edu")}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-[#171717] hover:bg-[#F7F7F5]"
                >
                  <span className="font-mono text-[10px] bg-[#EDF2FD] text-[#3867E8] px-1 py-0.5 rounded-sm">SEC</span>
                  <div>
                    <div className="font-semibold text-[#171717]">Vijay Kumar</div>
                    <div className="text-[10px] text-[#777777]">Security Officer (Handover)</div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickLogin("admin@newton.edu")}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-[#171717] hover:bg-[#F7F7F5]"
                >
                  <span className="font-mono text-[10px] bg-[#F2F2EE] text-[#555555] px-1 py-0.5 rounded-sm">ADM</span>
                  <div>
                    <div className="font-semibold text-[#171717]">Anil Sharma</div>
                    <div className="text-[10px] text-[#777777]">Campus Administrator</div>
                  </div>
                </button>

                <div className="my-1 border-t border-[#DADAD6]" />

                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/demo/trigger-match");
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[#BCE3CE] bg-[#EBF6F0] px-2 py-1 text-center font-mono text-[10px] font-semibold text-[#25845A] hover:bg-[#D8F0E2] transition"
                >
                  <Sparkles className="h-3 w-3 text-[#25845A]" />
                  <span>SIMULATE SSE MATCH ALERT</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="relative rounded-md p-1.5 text-[#777777] hover:bg-[#F2F2EE] hover:text-[#171717]"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#3867E8]" />
                )}
              </Link>

              {/* Spendable Credit Wallet Pill */}
              <Link
                href="/leaderboard?tab=store"
                className="hidden items-center gap-1.5 rounded-md border border-[#DADAD6] bg-[#F7F7F5] px-2 py-1 font-mono text-[11px] font-semibold text-[#171717] hover:bg-[#EAEAE6] sm:flex"
                title="Your Spendable Campus Credits"
              >
                <Coins className="h-3.5 w-3.5 text-[#C27803]" />
                <span>{user.credits ?? 0}</span>
                <span className="text-[9px] text-[#777777]">CR</span>
              </Link>

              <Link
                href={
                  user.role === "STAFF"
                    ? "/staff/dashboard"
                    : user.role === "ADMIN" || user.role === "SUPER_ADMIN"
                    ? "/admin/dashboard"
                    : "/dashboard"
                }
                className="flex items-center gap-1.5 rounded-md border border-[#DADAD6] bg-white px-2.5 py-1 text-xs font-semibold text-[#171717] hover:bg-[#F7F7F5]"
              >
                <User className="h-3.5 w-3.5 text-[#777777]" />
                <span>{user.name.split(" ")[0]}</span>
                <span className="rounded-sm bg-[#F2F2EE] px-1 py-0.2 font-mono text-[9px] text-[#555555]">
                  {user.role}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-md p-1.5 text-[#777777] hover:bg-[#FDF2F2] hover:text-[#DC2626]"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md px-2.5 py-1 text-xs font-semibold text-[#171717] hover:bg-[#F2F2EE]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-primary"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Search className="h-4 w-4 text-slate-500" />
              Search Items
            </Link>
            <Link
              href="/report/lost"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              <PlusCircle className="h-4 w-4 text-rose-600" />
              Report Lost Item
            </Link>
            <Link
              href="/report/found"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Report Found Item
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100"
            >
              <Trophy className="h-4 w-4 text-amber-600" />
              Leaderboard & Rewards
            </Link>
            {user?.role && ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(user.role) && (
              <Link
                href="/staff/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                <Shield className="h-4 w-4 text-brand-600" />
                Staff Operations
              </Link>
            )}
            {user?.role && ["ADMIN", "SUPER_ADMIN"].includes(user.role) && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
              >
                <Layers className="h-4 w-4 text-purple-600" />
                Admin Console
              </Link>
            )}
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <Compass className="h-4 w-4 text-slate-500" />
              How It Works
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
