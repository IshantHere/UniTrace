"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { User, Mail, Shield, Phone, IdCard, CheckCircle2, Coins, Trophy, ArrowRight, Gift } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.user) {
          setUser(d.data.user);
        } else {
          location.href = "/login";
        }
      });
  }, []);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      studentOrStaffId: formData.get("studentOrStaffId") as string,
      phone: formData.get("phone") as string,
    };

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (json.success) {
      setUser(json.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(json.error?.message || "Failed to update profile");
    }
  }

  if (!user) {
    return <main className="mx-auto max-w-2xl px-4 py-20 text-center text-slate-400">Loading profile...</main>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="border-b border-slate-200 pb-5 mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Account Settings</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Campus Identity Profile</h1>
      </div>

      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> Profile updated successfully
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
          {error}
        </div>
      )}

      {/* Campus Finder Karma & Rewards Card */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50/50 to-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Finder Karma & Campus Rewards</h2>
              <p className="text-xs text-slate-500">Tier: {user.tier || "BRONZE"}</p>
            </div>
          </div>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
          >
            Hall of Fame <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-amber-100 pt-4">
          <div className="rounded-xl bg-white p-3 border border-amber-100 shadow-2xs">
            <p className="text-[10px] font-semibold uppercase text-slate-400">Lifetime Points</p>
            <p className="text-xl font-black text-slate-900">{user.points ?? 0} <span className="text-xs font-normal text-slate-400">pts</span></p>
          </div>
          <div className="rounded-xl bg-white p-3 border border-amber-100 shadow-2xs">
            <p className="text-[10px] font-semibold uppercase text-slate-400">Spendable Credits</p>
            <p className="text-xl font-black text-amber-600 flex items-center gap-1">
              <Coins className="h-4 w-4 text-amber-500" />
              {user.credits ?? 0} <span className="text-xs font-normal text-slate-400">cr</span>
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-amber-100 pt-3 text-xs">
          <span className="text-slate-500">Spend credits on dining & bookstore perks:</span>
          <Link
            href="/leaderboard?tab=store"
            className="inline-flex items-center gap-1 font-bold text-amber-700 hover:text-amber-900"
          >
            <Gift className="h-3.5 w-3.5" /> Perks Store
          </Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="card space-y-4">
        <div>
          <label className="input-label" htmlFor="name">
            Full Name
          </label>
          <input id="name" name="name" defaultValue={user.name} required className="input-field" />
        </div>

        <div>
          <label className="input-label" htmlFor="email">
            Institutional Email (Verified)
          </label>
          <input id="email" value={user.email} disabled className="input-field bg-slate-50 text-slate-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label" htmlFor="studentOrStaffId">
              Student / Staff ID
            </label>
            <input
              id="studentOrStaffId"
              name="studentOrStaffId"
              defaultValue={user.studentOrStaffId || ""}
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="role">
              Campus Role
            </label>
            <input id="role" value={user.role} disabled className="input-field bg-slate-50 text-slate-500" />
          </div>
        </div>

        <div>
          <label className="input-label" htmlFor="phone">
            Contact Phone (for recovery SMS)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone || ""}
            placeholder="+1-555-0192"
            className="input-field"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button type="submit" className="btn-primary">
            Save Profile
          </button>
        </div>
      </form>
    </main>
  );
}
