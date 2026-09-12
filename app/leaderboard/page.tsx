"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Coins,
  Gift,
  Coffee,
  BookOpen,
  Clock,
  Bookmark,
  Car,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Flame,
  Search,
  Tag,
  Store,
  QrCode,
  Calendar,
  AlertCircle,
  TrendingUp,
  HelpCircle,
  Info,
  Zap,
  Lock,
  Scale,
  FileText,
  MapPin,
} from "lucide-react";

interface TierInfo {
  name: string;
  label: string;
  minPoints: number;
  badge: string;
  color: string;
  haloColor: string;
  perkDescription: string;
}

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  points: number;
  credits: number;
  tier: string;
  tierInfo: TierInfo;
  itemsReturnedCount: number;
  totalFoundReported: number;
}

interface CurrentUserRank {
  rank: number;
  id: string;
  name: string;
  points: number;
  credits: number;
  tier: string;
  tierInfo: TierInfo;
  nextTier: string | null;
  progressPercent: number;
  pointsToNext: number;
}

interface Perk {
  id: string;
  title: string;
  description: string;
  costCredits: number;
  category: string;
  icon: string;
  stock: number;
  isActive: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  balanceAfter: number;
  type: string;
  description: string;
  createdAt: string;
}

interface Redemption {
  id: string;
  redemptionCode: string;
  creditsSpent: number;
  status: string;
  expiresAt: string;
  createdAt: string;
  perk: Perk;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "store" | "vouchers" | "rules">("leaderboard");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [stats, setStats] = useState({
    totalRecoveries: 0,
    totalCreditsAwarded: 0,
    activeFindersCount: 0,
  });
  const [currentUserRank, setCurrentUserRank] = useState<CurrentUserRank | null>(null);
  const [perks, setPerks] = useState<Perk[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modal states
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemedVoucher, setRedeemedVoucher] = useState<{
    code: string;
    perkTitle: string;
    expiresAt: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lbRes, rewardsRes, redemptionsRes] = await Promise.all([
        fetch("/api/leaderboard"),
        fetch("/api/rewards"),
        fetch("/api/rewards/my-redemptions").catch(() => null),
      ]);

      const lbData = await lbRes.json();
      if (lbData.success) {
        setLeaderboard(lbData.data.leaderboard);
        setStats(lbData.data.stats);
        setCurrentUserRank(lbData.data.currentUserRank);
      }

      const rewardsData = await rewardsRes.json();
      if (rewardsData.success) {
        setPerks(rewardsData.data.perks);
        if (rewardsData.data.user) {
          setTransactions(rewardsData.data.user.transactions || []);
        }
      }

      if (redemptionsRes && redemptionsRes.ok) {
        const redData = await redemptionsRes.json();
        if (redData.success) {
          setMyRedemptions(redData.data.redemptions);
        }
      }
    } catch (err) {
      console.error("Failed to load leaderboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["leaderboard", "store", "vouchers", "rules"].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  const handleRedeem = async () => {
    if (!selectedPerk) return;
    setIsRedeeming(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perkId: selectedPerk.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Redemption failed");
      }

      setRedeemedVoucher({
        code: json.data.redemption.redemptionCode,
        perkTitle: selectedPerk.title,
        expiresAt: new Date(json.data.redemption.expiresAt).toLocaleDateString(),
      });

      // Refresh data to reflect updated balances & stock
      await fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to redeem");
    } finally {
      setIsRedeeming(false);
    }
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getPerkIcon = (iconName: string) => {
    switch (iconName) {
      case "coffee":
        return <Coffee className="h-6 w-6 text-amber-500" />;
      case "book":
        return <BookOpen className="h-6 w-6 text-blue-500" />;
      case "bookmark":
        return <Bookmark className="h-6 w-6 text-emerald-500" />;
      case "clock":
        return <Clock className="h-6 w-6 text-purple-500" />;
      case "car":
        return <Car className="h-6 w-6 text-sky-500" />;
      case "gift":
        return <Gift className="h-6 w-6 text-rose-500" />;
      default:
        return <Store className="h-6 w-6 text-brand-500" />;
    }
  };

  const filteredLeaderboard = leaderboard.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPerks = perks.filter((p) => {
    if (categoryFilter === "ALL") return true;
    return p.category === categoryFilter;
  });

  const top3 = leaderboard.slice(0, 3);
  const remainingFinders = filteredLeaderboard.slice(3);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-indigo-950 p-8 text-white shadow-2xl sm:p-12">
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                Apex Campus Civics & Karma Network
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Finder Hall of Fame & Rewards
              </h1>
              <p className="mt-3 text-base text-slate-300 sm:text-lg">
                Recognizing students and staff who safeguard campus integrity by returning lost property. Earn reputation points, level up your karma badge, and spend credits on campus perks.
              </p>
            </div>

            {/* User Karma Mini-Pill Card (if logged in) */}
            {currentUserRank && (
              <div className="w-full rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl lg:w-80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-300">
                    Your Wallet & Standing
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                    {currentUserRank.tierInfo.badge} {currentUserRank.tierInfo.label}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Available Credits</p>
                    <p className="text-2xl font-black text-amber-300 flex items-center gap-1.5">
                      <Coins className="h-5 w-5 text-amber-400" />
                      {currentUserRank.credits}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Campus Rank</p>
                    <p className="text-2xl font-black text-white">#{currentUserRank.rank}</p>
                  </div>
                </div>

                {/* Next Tier Progress Bar */}
                {currentUserRank.nextTier && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Progress to {currentUserRank.nextTier}</span>
                      <span>{currentUserRank.pointsToNext} pts needed</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${currentUserRank.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Items Returned</p>
                <p className="text-lg font-bold text-white">{stats.totalRecoveries}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Credits Distributed</p>
                <p className="text-lg font-bold text-white">{stats.totalCreditsAwarded.toLocaleString()}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Active Good Samaritans</p>
                <p className="text-lg font-bold text-white">{stats.activeFindersCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "leaderboard"
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <Trophy className="h-4 w-4" />
              🏆 Finder Leaderboard
            </button>
            <button
              onClick={() => setActiveTab("store")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "store"
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <Gift className="h-4 w-4" />
              🎁 Campus Perks Store
            </button>
            <button
              onClick={() => setActiveTab("vouchers")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "vouchers"
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <Coins className="h-4 w-4" />
              📜 My Wallet & Vouchers ({myRedemptions.length})
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "rules"
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <HelpCircle className="h-4 w-4 text-amber-500" />
              💡 How Points Work
            </button>
          </div>

          {activeTab === "leaderboard" && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus finders..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          )}

          {activeTab === "store" && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "DINING", "CAMPUS_STORE", "ACADEMIC", "PARKING", "MERCH"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    categoryFilter === cat
                      ? "bg-brand-100 text-brand-800 font-semibold"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat.replace("_", " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <div className="mt-8 space-y-8">
            {/* Top 3 Podium Cards */}
            {top3.length > 0 && !searchQuery && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* 2nd Place (Silver) */}
                {top3[1] && (
                  <div className="order-2 flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-xl md:order-1 md:translate-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg font-black text-slate-600 shadow-sm border border-slate-200">
                        🥈 2
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${top3[1].tierInfo.color}`}>
                        {top3[1].tierInfo.badge} {top3[1].tierInfo.label}
                      </span>
                    </div>

                    <div className="my-6 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-2xl font-black text-slate-800 ring-4 ring-slate-300">
                        {top3[1].name.slice(0, 2).toUpperCase()}
                      </div>
                      <h3 className="mt-4 text-xl font-bold text-slate-900">{top3[1].name}</h3>
                      <p className="text-xs font-medium text-slate-500 capitalize">{top3[1].role.toLowerCase()} Member</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
                      <div>
                        <p className="text-[11px] text-slate-500">Points</p>
                        <p className="text-base font-bold text-slate-900">{top3[1].points}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Items Returned</p>
                        <p className="text-base font-bold text-emerald-600">{top3[1].itemsReturnedCount}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1st Place (Gold Champion) */}
                {top3[0] && (
                  <div className="order-1 relative flex flex-col justify-between rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/70 to-white p-7 shadow-xl ring-4 ring-amber-400/20 md:order-2">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
                      👑 Campus Champion
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-xl font-black text-white shadow-md">
                        🥇 1
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${top3[0].tierInfo.color}`}>
                        {top3[0].tierInfo.badge} {top3[0].tierInfo.label}
                      </span>
                    </div>

                    <div className="my-6 text-center">
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-3xl font-black text-white shadow-lg ring-4 ring-amber-300">
                        {top3[0].name.slice(0, 2).toUpperCase()}
                      </div>
                      <h3 className="mt-4 text-2xl font-black text-slate-900">{top3[0].name}</h3>
                      <p className="text-xs font-semibold text-amber-700 capitalize">{top3[0].role.toLowerCase()} Good Samaritan</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-amber-100/50 p-4 text-center">
                      <div>
                        <p className="text-xs text-amber-800 font-medium">Reputation Points</p>
                        <p className="text-xl font-black text-amber-900">{top3[0].points}</p>
                      </div>
                      <div>
                        <p className="text-xs text-amber-800 font-medium">Items Reunited</p>
                        <p className="text-xl font-black text-emerald-700">{top3[0].itemsReturnedCount}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3rd Place (Bronze) */}
                {top3[2] && (
                  <div className="order-3 flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-xl md:translate-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-lg font-black text-amber-800 shadow-sm border border-amber-200">
                        🥉 3
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${top3[2].tierInfo.color}`}>
                        {top3[2].tierInfo.badge} {top3[2].tierInfo.label}
                      </span>
                    </div>

                    <div className="my-6 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-2xl font-black text-white ring-4 ring-amber-200">
                        {top3[2].name.slice(0, 2).toUpperCase()}
                      </div>
                      <h3 className="mt-4 text-xl font-bold text-slate-900">{top3[2].name}</h3>
                      <p className="text-xs font-medium text-slate-500 capitalize">{top3[2].role.toLowerCase()} Member</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
                      <div>
                        <p className="text-[11px] text-slate-500">Points</p>
                        <p className="text-base font-bold text-slate-900">{top3[2].points}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Items Returned</p>
                        <p className="text-base font-bold text-emerald-600">{top3[2].itemsReturnedCount}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rankings Table */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="text-base font-bold text-slate-900">All Campus Finders Rankings</h3>
                <p className="text-xs text-slate-500">Updated automatically whenever property is reported or claimed.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-3.5">Rank</th>
                      <th className="px-6 py-3.5">Finder</th>
                      <th className="px-6 py-3.5">Tier Badge</th>
                      <th className="px-6 py-3.5 text-center">Items Returned</th>
                      <th className="px-6 py-3.5 text-center">Found Reports</th>
                      <th className="px-6 py-3.5 text-right">Reputation Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeaderboard.map((user) => (
                      <tr
                        key={user.id}
                        className={`transition hover:bg-slate-50/80 ${
                          currentUserRank?.id === user.id ? "bg-amber-50/60 font-semibold" : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                                user.rank === 1
                                  ? "bg-amber-400 text-white shadow-sm"
                                  : user.rank === 2
                                  ? "bg-slate-200 text-slate-700"
                                  : user.rank === 3
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              #{user.rank}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 text-xs">
                              {user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                {user.name}
                                {currentUserRank?.id === user.id && (
                                  <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] text-white">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-400 capitalize">{user.role.toLowerCase()}</p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${user.tierInfo.color}`}
                          >
                            {user.tierInfo.badge} {user.tierInfo.label}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center font-bold text-emerald-600">
                          {user.itemsReturnedCount}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center text-slate-500">
                          {user.totalFoundReported}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <span className="text-base font-black text-slate-900">{user.points}</span>
                          <span className="ml-1 text-xs text-slate-400">pts</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAMPUS PERKS STORE */}
        {activeTab === "store" && (
          <div className="mt-8 space-y-8">
            {/* User Spendable Credit Header */}
            <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/50 p-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900">Your Spendable Campus Credits</h3>
                <p className="text-xs text-slate-600">
                  Earned when you report found items and complete physical custody handovers at the security desk.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white px-5 py-3 shadow-sm border border-amber-200">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Available Balance</p>
                  <p className="text-2xl font-black text-amber-600 flex items-center gap-1.5">
                    <Coins className="h-6 w-6 text-amber-500" />
                    {currentUserRank ? currentUserRank.credits : 0} <span className="text-xs text-slate-500 font-normal">Credits</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Perks Catalog Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPerks.map((perk) => {
                const userHasEnough = (currentUserRank?.credits || 0) >= perk.costCredits;
                const isOutOfStock = perk.stock <= 0;

                return (
                  <div
                    key={perk.id}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-xl hover:border-brand-300"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 shadow-inner">
                          {getPerkIcon(perk.icon)}
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 uppercase">
                          {perk.category.replace("_", " ")}
                        </span>
                      </div>

                      <h4 className="mt-4 text-lg font-bold text-slate-900">{perk.title}</h4>
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{perk.description}</p>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-400">Reward Cost</p>
                          <p className="text-xl font-black text-amber-600 flex items-center gap-1">
                            <Coins className="h-4 w-4 text-amber-500" />
                            {perk.costCredits} <span className="text-xs font-normal text-slate-500">Credits</span>
                          </p>
                        </div>
                        <span className="text-xs text-slate-400">{perk.stock} available</span>
                      </div>

                      <button
                        onClick={() => setSelectedPerk(perk)}
                        disabled={!userHasEnough || isOutOfStock}
                        className={`mt-4 w-full rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-2 ${
                          isOutOfStock
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : userHasEnough
                            ? "bg-brand-600 text-white shadow-md shadow-brand-600/20 hover:bg-brand-700"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-200"
                        }`}
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : userHasEnough
                          ? "Redeem Voucher"
                          : `Need ${perk.costCredits - (currentUserRank?.credits || 0)} More Credits`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MY WALLET & VOUCHERS */}
        {activeTab === "vouchers" && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left 8 columns: Active Vouchers & Transaction Ledger */}
            <div className="space-y-8 lg:col-span-8">
              {/* Active Vouchers Carousel / List */}
              <div>
                <h3 className="text-lg font-black text-slate-900">Your Active Digital Vouchers</h3>
                <p className="text-xs text-slate-500">
                  Present these codes at campus desks or cafeterias to redeem your rewards.
                </p>

                {myRedemptions.length === 0 ? (
                  <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <Gift className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">No active vouchers yet</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Earn credits by reporting found items or visit the Perks Store to redeem rewards.
                    </p>
                    <button
                      onClick={() => setActiveTab("store")}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
                    >
                      Explore Campus Perks Store <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {myRedemptions.map((red) => (
                      <div
                        key={red.id}
                        className="relative overflow-hidden rounded-3xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                              Active Voucher
                            </span>
                            <h4 className="mt-2 text-sm font-bold text-slate-900">{red.perk.title}</h4>
                          </div>
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <QrCode className="h-4 w-4" />
                          </div>
                        </div>

                        <div className="my-3 rounded-2xl bg-white p-2.5 border border-amber-200 text-center">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Voucher PIN</p>
                          <p className="mt-0.5 text-base font-black tracking-widest text-slate-900 font-mono">
                            {red.redemptionCode}
                          </p>
                          <button
                            onClick={() => copyVoucherCode(red.redemptionCode)}
                            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800"
                          >
                            {copiedCode ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            {copiedCode ? "Copied!" : "Copy Code"}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(red.expiresAt).toLocaleDateString()}
                          </span>
                          <span className="font-bold text-amber-600">-{red.creditsSpent} cr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Credit Transaction Ledger */}
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="text-base font-bold text-slate-900">Your Credit Transaction History</h3>
                  <p className="text-xs text-slate-500">Immutable ledger of points & credits earned and redeemed.</p>
                </div>

                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">No transactions recorded yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{tx.description}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(tx.createdAt).toLocaleDateString()} • {tx.type.replace(/_/g, " ")}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-sm font-black ${
                              tx.amount > 0 ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Credits
                          </p>
                          <p className="text-[11px] text-slate-400">Balance: {tx.balanceAfter} cr</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 columns: "How the Point System Works" Side Panel */}
            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-white shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">How Points Work</h4>
                    <p className="text-[11px] text-slate-500">Quick Earning Cheat Sheet</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-amber-100 shadow-2xs">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Report Found Item</p>
                      <p className="text-[10px] text-slate-400">Initial intake bonus</p>
                    </div>
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                      +15 pts & cr
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-amber-100 shadow-2xs">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Report Sighting</p>
                      <p className="text-[10px] text-slate-400">Item journey waypoint</p>
                    </div>
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                      +10 pts & cr
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-amber-100 shadow-2xs">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Desk Handover PIN</p>
                      <p className="text-[10px] text-slate-400">Physical verified release</p>
                    </div>
                    <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-black text-amber-800">
                      +100 pts & cr
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-amber-100 shadow-2xs">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Speedy Return</p>
                      <p className="text-[10px] text-slate-400">Reunited within 48h</p>
                    </div>
                    <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">
                      +50 pts & cr
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-amber-100 shadow-2xs">
                    <div>
                      <p className="text-xs font-bold text-slate-900">High-Value Item</p>
                      <p className="text-[10px] text-slate-400">Laptop, phone, wallet</p>
                    </div>
                    <span className="rounded-lg bg-purple-50 px-2 py-1 text-xs font-black text-purple-700">
                      +50 pts & cr
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-amber-100 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Max potential return:</span>
                    <span className="font-black text-amber-700 text-sm">225 pts & credits</span>
                  </div>

                  <button
                    onClick={() => setActiveTab("rules")}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                  >
                    <HelpCircle className="h-4 w-4 text-amber-400" />
                    Open Full Guide & Rules <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Anti-Fraud Notice Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Security Verified Handover</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Major rewards are granted only when a Security Officer verifies the 6-digit cryptographic PIN (`RC-XXXX`) at the physical handover desk. Self-claiming your own items is strictly prohibited.
                </p>
                <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-brand-700">
                  <Lock className="h-3.5 w-3.5" /> Zero-knowledge fraud protection
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOW THE POINT SYSTEM WORKS (FULL DEDICATED PAGE VIEW) */}
        {activeTab === "rules" && (
          <div className="mt-8 space-y-10">
            {/* Header Hero */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    <Zap className="h-3.5 w-3.5" /> Transparent Campus Civics Architecture
                  </span>
                  <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
                    How the Point & Credit System Works
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600 leading-relaxed">
                    RETRACE operates on a dual-currency reputation engine designed to incentivize fast, honest, and verifiable property returns across campus without any manual paperwork.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/report/found"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700"
                  >
                    <Sparkles className="h-4 w-4" /> Report Found Item
                  </Link>
                  <button
                    onClick={() => setActiveTab("store")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <Gift className="h-4 w-4 text-amber-600" /> Perks Store
                  </button>
                </div>
              </div>
            </div>

            {/* Dual Currency Visual Breakdown */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white p-7 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Lifetime Points (Reputation)</h3>
                    <p className="text-xs text-indigo-700 font-semibold">Non-Spendable • Permanent • Cumulative</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                    <span><strong>Determines Campus Rank</strong>: Determines your #1 to #50 position on the campus leaderboard.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                    <span><strong>Unlocks Karma Tiers</strong>: Bronze Scout $\to$ Silver Detective $\to$ Gold Guardian $\to$ Platinum Legend.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                    <span><strong>Never Decreases</strong>: Redeeming campus vouchers in the perks store does NOT lower your lifetime score.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl border-2 border-amber-100 bg-gradient-to-br from-amber-50/50 via-white to-white p-7 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                    <Coins className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Campus Credits (Spendable)</h3>
                    <p className="text-xs text-amber-700 font-semibold">Spendable • Redeemable • Digital Wallet</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <span><strong>Earned 1:1 with Points</strong>: Whenever you earn points, you receive an equal amount of spendable credits.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <span><strong>Campus Perks Store</strong>: Exchange for free artisan coffee, bookstore 20% discounts, study pod bookings, and parking passes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <span><strong>Instant Digital Vouchers</strong>: Generates an authenticated PIN with a 30-day validity window.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Earning Rules Matrix Cards */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">How to Earn Points & Credits</h3>
                <p className="text-xs text-slate-500">All actions are verified through cryptographic or staff moderation checks.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                      +15 Points & Credits
                    </span>
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                  </div>
                  <h4 className="mt-4 text-base font-bold text-slate-900">Report a Found Item</h4>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Awarded immediately upon submitting a found item report at `/report/found`. Initiates AI visual fingerprinting and candidate matching.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">
                      +10 Points & Credits
                    </span>
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <h4 className="mt-4 text-base font-bold text-slate-900">Submit Item Sighting Waypoint</h4>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Spotted a reported lost item or turned it over to a building desk? Submit a location sighting to build the item's spatio-temporal journey timeline.
                  </p>
                </div>

                <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/40 to-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-white shadow-xs">
                      +100 Points & Credits
                    </span>
                    <ShieldCheck className="h-5 w-5 text-amber-600" />
                  </div>
                  <h4 className="mt-4 text-base font-bold text-slate-900">Security Desk Handover Release</h4>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    The core civic milestone. Awarded when an authorized Security Officer verifies the claimant's identity and releases the item with the 6-digit PIN.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-800">
                      +50 Bonus Points & Credits
                    </span>
                    <Clock className="h-5 w-5 text-indigo-500" />
                  </div>
                  <h4 className="mt-4 text-base font-bold text-slate-900">Speedy Recovery Bonus (&lt;48h)</h4>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Recognizes ultra-fast turnaround. Automatically added if the handover is concluded within 48 hours of the owner's original lost report.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800">
                      +50 Bonus Points & Credits
                    </span>
                    <Award className="h-5 w-5 text-purple-500" />
                  </div>
                  <h4 className="mt-4 text-base font-bold text-slate-900">High-Value Custody Bonus</h4>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Extra compensation for safely securing high-value items (MacBooks, iPhones, jewelry, keys, passports, wallets).
                  </p>
                </div>

                <div className="flex flex-col justify-between rounded-3xl border border-dashed border-amber-300 bg-amber-50/60 p-6 text-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Grand Total Example</span>
                    <p className="mt-1 text-3xl font-black text-amber-900">225 Points</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Finding and returning a lost MacBook within 24 hours unlocks the maximum reward in a single case!
                    </p>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-700 mt-2">
                    15 (Intake) + 100 (Handover) + 50 (Speed) + 50 (High-Value)
                  </div>
                </div>
              </div>
            </div>

            {/* The 4 Karma Tiers */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">The 4 Campus Karma Tiers</h3>
                <p className="text-xs text-slate-500">Lifetime points advance your status and unlock credit multipliers.</p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
                  <div className="text-3xl">🥉</div>
                  <h4 className="mt-3 text-base font-bold text-amber-900">Bronze Scout</h4>
                  <p className="text-xs font-semibold text-amber-700">0 – 99 Points</p>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Entry level for every campus member who reports their first item or sighting.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5">
                  <div className="text-3xl">🥈</div>
                  <h4 className="mt-3 text-base font-bold text-slate-900">Silver Detective</h4>
                  <p className="text-xs font-semibold text-slate-700">100 – 299 Points</p>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Unlocks <strong>1.1x Credit Multiplier</strong> on all returns and a verified Silver halo on your profile.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-5 shadow-sm">
                  <div className="text-3xl">🥇</div>
                  <h4 className="mt-3 text-base font-bold text-amber-900">Gold Guardian</h4>
                  <p className="text-xs font-semibold text-amber-700">300 – 699 Points</p>
                  <p className="mt-2 text-xs text-slate-700 leading-relaxed">
                    Unlocks <strong>1.25x Credit Multiplier</strong>, priority desk check-in, and Gold halo on leaderboard.
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5">
                  <div className="text-3xl">💎</div>
                  <h4 className="mt-3 text-base font-bold text-purple-900">Platinum Legend</h4>
                  <p className="text-xs font-semibold text-purple-700">700+ Points</p>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Elite recognition: official citation on the Dean's Civic Honor Roll and exclusive university swag packs.
                  </p>
                </div>
              </div>
            </div>

            {/* Anti-Fraud & Fair Play FAQ */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Scale className="h-5 w-5 text-brand-600" />
                <h3 className="text-lg font-black text-slate-900">Anti-Fraud & Fair Play Guardrails</h3>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-700" /> Cryptographic PIN Protection
                  </h4>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    No points for handover are awarded until a physical security officer enters the one-time 6-digit release PIN (`RC-XXXX`) generated only on the claimant's device.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-700" /> Zero Self-Dealing Rule
                  </h4>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Users cannot file claims on their own found reports or receive points for transferring property back to themselves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REDEEM CONFIRMATION MODAL */}
        {selectedPerk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              {!redeemedVoucher ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                      Redeem Campus Reward
                    </span>
                    <button
                      onClick={() => setSelectedPerk(null)}
                      className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="my-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
                      {getPerkIcon(selectedPerk.icon)}
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-slate-900">{selectedPerk.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{selectedPerk.description}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Reward Price:</span>
                      <span className="font-bold text-slate-900">{selectedPerk.costCredits} Credits</span>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-600">
                      <span>Your Current Balance:</span>
                      <span className="font-bold text-amber-600">{currentUserRank?.credits || 0} Credits</span>
                    </div>
                    <div className="mt-2 border-t border-slate-200 pt-2 flex justify-between text-xs font-bold text-slate-900">
                      <span>Balance After:</span>
                      <span>{(currentUserRank?.credits || 0) - selectedPerk.costCredits} Credits</span>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errorMessage}
                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedPerk(null)}
                      className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRedeem}
                      disabled={isRedeeming}
                      className="w-1/2 rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 disabled:opacity-50"
                    >
                      {isRedeeming ? "Processing..." : "Confirm & Deduct"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="mt-3 text-xl font-black text-slate-900">Voucher Issued!</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Your voucher for <span className="font-bold text-slate-800">{redeemedVoucher.perkTitle}</span> is ready.
                    </p>
                  </div>

                  <div className="my-6 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-4 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campus Verification PIN</p>
                    <p className="mt-1 text-2xl font-black font-mono tracking-widest text-slate-900">
                      {redeemedVoucher.code}
                    </p>
                    <button
                      onClick={() => copyVoucherCode(redeemedVoucher.code)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800"
                    >
                      {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      {copiedCode ? "Copied PIN!" : "Copy Code"}
                    </button>
                  </div>

                  <p className="text-center text-xs text-slate-400">
                    Valid for 30 days until {redeemedVoucher.expiresAt}.
                  </p>

                  <button
                    onClick={() => {
                      setSelectedPerk(null);
                      setRedeemedVoucher(null);
                      setActiveTab("vouchers");
                    }}
                    className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    View in My Vouchers
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
