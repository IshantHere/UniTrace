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
    setPassword("Newton123!");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: "Newton123!" }),
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
      <div className="card w-full p-8 sm:p-10 space-y-6 border-[#DADAD6] bg-white rounded">
        <div className="text-center space-y-2 border-b border-[#DADAD6] pb-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded border border-[#DADAD6] bg-[#F7F7F5] text-[#171717]">
            <Compass className="h-5 w-5" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
            [AUTH-SYSTEM // ACCESS-GATEWAY]
          </div>
          <h1 className="font-serif text-2xl font-normal tracking-tight text-[#171717]">
            Sign in to UniTrace
          </h1>
          <p className="text-xs text-[#777777]">
            Newton University precision campus intelligence network
          </p>
        </div>

        {error && (
          <div className="rounded border border-[#DC2626]/30 bg-[#DC2626]/5 p-3 text-xs text-[#DC2626]">
            {error}
          </div>
        )}

        {/* 1-Click Demo Persona Switcher */}
        <div className="rounded border border-[#DADAD6] bg-[#F7F7F5] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-semibold text-[#171717]">
              DEMO PERSONA SIMULATOR
            </span>
            <span className="font-mono text-[10px] text-[#777777]">1-CLICK AUTH</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickFillAndLogin("student@newton.edu")}
              className="flex flex-col items-start rounded border border-[#DADAD6] bg-white p-2.5 text-left transition hover:border-[#171717]"
            >
              <span className="text-xs font-semibold text-[#171717]">Ishant Singh</span>
              <span className="text-[10px] text-[#777777] font-mono">Student (Owner)</span>
            </button>

            <button
              type="button"
              onClick={() => quickFillAndLogin("staff@newton.edu")}
              className="flex flex-col items-start rounded border border-[#DADAD6] bg-white p-2.5 text-left transition hover:border-[#171717]"
            >
              <span className="text-xs font-semibold text-[#171717]">Vijay Kumar</span>
              <span className="text-[10px] text-[#777777] font-mono">Staff (Security Desk)</span>
            </button>

            <button
              type="button"
              onClick={() => quickFillAndLogin("finder@newton.edu")}
              className="flex flex-col items-start rounded border border-[#DADAD6] bg-white p-2.5 text-left transition hover:border-[#171717]"
            >
              <span className="text-xs font-semibold text-[#171717]">Garvit Chahal</span>
              <span className="text-[10px] text-[#777777] font-mono">Student (Finder)</span>
            </button>

            <button
              type="button"
              onClick={() => quickFillAndLogin("admin@newton.edu")}
              className="flex flex-col items-start rounded border border-[#DADAD6] bg-white p-2.5 text-left transition hover:border-[#171717]"
            >
              <span className="text-xs font-semibold text-[#171717]">Anil Sharma</span>
              <span className="text-[10px] text-[#777777] font-mono">Admin (Dean Analytics)</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="input-label" htmlFor="email">
              Institutional Email / Username
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#777777]" />
              <input
                id="email"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@newton.edu or username (e.g. student, ishant)"
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#777777]" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-xs">
            {loading ? "Authenticating Credentials..." : "Sign in to Account"}
          </button>
        </form>

        <div className="text-center text-xs text-[#777777] pt-2 border-t border-[#DADAD6]">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-medium text-[#171717] hover:underline">
            Register campus profile
          </Link>
        </div>
      </div>
    </div>
  );
}
