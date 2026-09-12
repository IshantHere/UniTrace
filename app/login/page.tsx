"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Compass, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Invalid credentials");
      } else {
        const role = json.data.user.role;
        if (role === "STAFF") {
          router.push("/staff/dashboard");
        } else if (role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("An unexpected network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const quickFillAndLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: "Password123!" }),
      });

      const json = await res.json();
      if (json.success) {
        const role = json.data.user.role;
        if (role === "STAFF") {
          router.push("/staff/dashboard");
        } else if (role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      } else {
        setError(json.error?.message || "Login failed");
      }
    } catch {
      setError("Network error during demo login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-lg items-center px-4 py-12 sm:px-6">
      <div className="card w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md ring-4 ring-brand-100">
            <Compass className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to UniTrace</h1>
          <p className="text-xs text-slate-500">Access campus lost &amp; found intelligence</p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}

        {/* 1-Click Demo Persona Switcher */}
        <div className="rounded-2xl border border-brand-200/80 bg-brand-50/50 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" /> One-Click Demo Personas
            </span>
            <span className="text-[10px] text-brand-600 font-medium">Instant Access</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickFillAndLogin("student@apex.edu")}
              className="flex flex-col items-start rounded-xl border border-brand-200/60 bg-white p-2.5 text-left transition hover:border-brand-400 hover:shadow-sm active:scale-[0.98]"
            >
              <span className="text-xs font-bold text-slate-900">🎓 Alex Sharma</span>
              <span className="text-[10px] text-slate-500">Student (Lost Item Owner)</span>
            </button>

            <button
              type="button"
              onClick={() => quickFillAndLogin("staff@apex.edu")}
              className="flex flex-col items-start rounded-xl border border-brand-200/60 bg-white p-2.5 text-left transition hover:border-brand-400 hover:shadow-sm active:scale-[0.98]"
            >
              <span className="text-xs font-bold text-slate-900">🛡️ Officer Vance</span>
              <span className="text-[10px] text-slate-500">Staff (Verification &amp; Release)</span>
            </button>

            <button
              type="button"
              onClick={() => quickFillAndLogin("finder@apex.edu")}
              className="flex flex-col items-start rounded-xl border border-brand-200/60 bg-white p-2.5 text-left transition hover:border-brand-400 hover:shadow-sm active:scale-[0.98]"
            >
              <span className="text-xs font-bold text-slate-900">🔍 Maya Lin</span>
              <span className="text-[10px] text-slate-500">Finder (Good Samaritan)</span>
            </button>

            <button
              type="button"
              onClick={() => quickFillAndLogin("admin@apex.edu")}
              className="flex flex-col items-start rounded-xl border border-brand-200/60 bg-white p-2.5 text-left transition hover:border-brand-400 hover:shadow-sm active:scale-[0.98]"
            >
              <span className="text-xs font-bold text-slate-900">🏛️ Dean Jenkins</span>
              <span className="text-[10px] text-slate-500">Campus Admin (Analytics)</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="input-label" htmlFor="email">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@apex.edu"
                className="input-field pl-9"
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-field pl-9"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Signing in..." : "Sign in to Account"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Register campus profile
          </Link>
        </div>
      </div>
    </div>
  );
}
