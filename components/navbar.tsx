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
    router.push("/login");
    router.refresh();
  };

  const handleQuickLogin = async (email: string) => {
    setShowDemoDropdown(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "Password123!" }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchUser();
        if (json.data.user.role === "STAFF") {
          router.push("/staff/dashboard");
        } else if (json.data.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.jpeg"
              alt="UniTrace logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-contain shadow-sm ring-4 ring-brand-100"
              priority
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900">UniTrace</span>
                <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-700/10">
                  AI INTELLIGENCE
                </span>
              </div>
              <p className="hidden text-[10px] font-medium text-slate-500 sm:block">Campus Recovery Network</p>
            </div>
          </Link>

          {/* Primary Navigation Links */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/search"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                pathname === "/search"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Search className="h-4 w-4 text-slate-400" />
              Search Items
            </Link>

            <Link
              href="/report/lost"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                pathname.startsWith("/report/lost")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <PlusCircle className="h-4 w-4 text-rose-500" />
              Report Lost
            </Link>

            <Link
              href="/report/found"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                pathname.startsWith("/report/found")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Report Found
            </Link>

            <Link
              href="/leaderboard"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                pathname.startsWith("/leaderboard")
                  ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              Leaderboard
            </Link>

            {user?.role && ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(user.role) && (
              <Link
                href="/staff/dashboard"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  pathname.startsWith("/staff")
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Shield className="h-4 w-4 text-brand-600" />
                Staff Ops
              </Link>
            )}

            {user?.role && ["ADMIN", "SUPER_ADMIN"].includes(user.role) && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  pathname.startsWith("/admin")
                    ? "bg-purple-50 text-purple-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Layers className="h-4 w-4 text-purple-600" />
                Admin Console
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher (Ideal for judges & evaluators) */}
          <div className="relative">
            <button
              onClick={() => setShowDemoDropdown(!showDemoDropdown)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50/70 px-2.5 py-1.5 text-xs font-semibold text-brand-800 transition hover:bg-brand-100"
              title="Quickly switch between demo accounts"
            >
              <span className="h-2 w-2 rounded-full bg-brand-600 animate-ping" />
              <span>Demo Accounts</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showDemoDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
                <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Demo Account
                </div>
                <button
                  onClick={() => handleQuickLogin("student@apex.edu")}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                    🎓
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900">Alex Sharma (Student)</div>
                    <div className="text-[10px] text-slate-500">Lost AirPods Pro Case</div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickLogin("finder@apex.edu")}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    🔍
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900">Maya Lin (Finder)</div>
                    <div className="text-[10px] text-slate-500">Reported Found Case</div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickLogin("staff@apex.edu")}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                    🛡️
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900">Officer David Vance (Staff)</div>
                    <div className="text-[10px] text-slate-500">Security Claims & Handover</div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickLogin("admin@apex.edu")}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold">
                    🏛️
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900">Dean Jenkins (Admin)</div>
                    <div className="text-[10px] text-slate-500">Campus Intelligence & KPIs</div>
                  </div>
                </button>

                <div className="my-1.5 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/demo/trigger-match");
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-center text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 active:scale-95 transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span>⚡ Simulate Live Match Alert</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/notifications"
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-600" />
                )}
              </Link>

              {/* Spendable Credit Wallet Pill */}
              <Link
                href="/leaderboard?tab=store"
                className="hidden items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50/90 px-2.5 py-1 text-xs font-black text-amber-800 shadow-sm transition hover:bg-amber-100 sm:flex"
                title="Your Spendable Campus Credits — Click to visit Perks Store"
              >
                <Coins className="h-3.5 w-3.5 text-amber-500" />
                <span>{user.credits ?? 0}</span>
                <span className="text-[10px] font-medium text-amber-700">Credits</span>
              </Link>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>{user.name.split(" ")[0]}</span>
                <span className="rounded bg-slate-200 px-1 py-0.2 text-[9px] font-bold text-slate-700">
                  {user.role}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
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
