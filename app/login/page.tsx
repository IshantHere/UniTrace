"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { Compass, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [targetUrl, setTargetUrl] = useState("/dashboard");

  // Check if redirect query parameter is set e.g. /login?redirect=/report/lost
  const resolveTarget = (fallbackUrl: string) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const customRedirect = params.get("redirect") || params.get("callbackUrl") || params.get("from");
      if (customRedirect && customRedirect.startsWith("/")) {
        return customRedirect;
      }
    }
    return fallbackUrl;
  };

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
        setLoading(false);
      } else {
        const role = json.data?.user?.role;
        const defaultRoute =
          role === "STAFF"
            ? "/staff/dashboard"
            : role === "ADMIN" || role === "SUPER_ADMIN"
            ? "/admin/dashboard"
            : "/dashboard";

        const target = resolveTarget(json.data?.redirectUrl || defaultRoute);
        setTargetUrl(target);
        setRedirecting(true);

        // Immediate hard navigation with fallback
        window.location.replace(target);
        setTimeout(() => {
          window.location.href = target;
        }, 150);
      }
    } catch {
      setError("An unexpected network error occurred");
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
        const role = json.data?.user?.role;
        const defaultRoute =
          role === "STAFF"
            ? "/staff/dashboard"
            : role === "ADMIN" || role === "SUPER_ADMIN"
            ? "/admin/dashboard"
            : "/dashboard";

        const target = resolveTarget(json.data?.redirectUrl || defaultRoute);
        setTargetUrl(target);
        setRedirecting(true);

        window.location.replace(target);
        setTimeout(() => {
          window.location.href = target;
        }, 150);
      } else {
        setError(json.error?.message || "Login failed");
        setLoading(false);
      }
    } catch {
      setError("Network error during demo login");
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

        {redirecting && (
          <div className="rounded border border-[#25845A]/30 bg-[#25845A]/10 p-3.5 text-xs text-[#25845A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span className="font-semibold">Session established. Opening campus console...</span>
            </div>
            <a href={targetUrl} className="underline font-bold text-[11px] ml-2 shrink-0">
              Click to Enter &rarr;
            </a>
          </div>
        )}

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

          <button type="submit" disabled={loading || redirecting} className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2">
            {redirecting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Redirecting to Console...</span>
              </>
            ) : loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <span>Sign in to Account</span>
            )}
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
