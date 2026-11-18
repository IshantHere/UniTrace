"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Compass, Lock, Mail, User, Phone, Shield, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    studentOrStaffId: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Registration failed");
        setLoading(false);
      } else {
        setRedirecting(true);
        const target = json.data?.redirectUrl || "/dashboard";
        // Hard replace guarantees fresh server session rendering
        window.location.replace(target);
        setTimeout(() => {
          window.location.href = target;
        }, 300);
      }
    } catch {
      setError("An unexpected network error occurred");
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
            [ACCOUNT-ENROLLMENT // NEWTON-DIRECTORY]
          </div>
          <h1 className="font-serif text-2xl font-normal tracking-tight text-[#171717]">
            Create Campus Profile
          </h1>
          <p className="text-xs text-[#777777]">
            Join Newton University&apos;s UniTrace intelligence network
          </p>
        </div>

        {redirecting && (
          <div className="rounded border border-[#25845A]/40 bg-[#25845A]/10 p-3.5 text-xs text-[#25845A] flex flex-col gap-1.5 animate-pulse">
            <div className="flex items-center gap-2 font-semibold">
              <Loader2 className="h-4 w-4 animate-spin text-[#25845A]" />
              Account enrolled. Initializing security session...
            </div>
            <p className="text-[11px] text-[#171717]">
              Redirecting to campus terminal. If not redirected automatically,{" "}
              <a href="/dashboard" className="underline font-bold text-[#3867E8]">
                click here to enter dashboard
              </a>.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded border border-[#DC2626]/30 bg-[#DC2626]/5 p-3 text-xs text-[#DC2626]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label" htmlFor="name">
              Full Legal Name *
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#777777]" />
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ishant Singh"
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="email">
              University Email Address *
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#777777]" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="ishant@newton.edu"
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="role">
                Institutional Role
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-field text-xs"
              >
                <option value="STUDENT">Student</option>
                <option value="STAFF">Campus Security / Staff</option>
                <option value="ADMIN">Dean / Administrator</option>
              </select>
            </div>

            <div>
              <label className="input-label" htmlFor="studentOrStaffId">
                Student or Staff ID *
              </label>
              <input
                id="studentOrStaffId"
                type="text"
                value={formData.studentOrStaffId}
                onChange={(e) => setFormData({ ...formData, studentOrStaffId: e.target.value })}
                required
                placeholder="STU-2024-8841"
                className="input-field text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="phone">
              Mobile Number (For Handover Alerts)
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#777777]" />
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="input-field pl-9 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="password">
              Account Password *
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#777777]" />
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                <span>Enrolled! Opening Dashboard...</span>
              </>
            ) : loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Registering Profile...</span>
              </>
            ) : (
              <span>Complete Enrollment</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[#777777] pt-2 border-t border-[#DADAD6]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#171717] hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
