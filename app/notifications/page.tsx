"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Clock, Sparkles } from "lucide-react";

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.notifications) {
          setItems(d.data.notifications);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markAllRead(id?: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((v) =>
      v.map((n) => (id && n.id !== id ? n : { ...n, readAt: new Date().toISOString() }))
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Activity Center</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Notifications</h1>
        </div>
        {items.some((i) => !i.readAt) && (
          <button
            onClick={() => markAllRead()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Mark all read
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="card py-12 text-center text-slate-400 text-sm">Loading notifications...</div>
        ) : items.length === 0 ? (
          <div className="card py-16 text-center space-y-2">
            <Bell className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">You&apos;re all caught up!</h3>
            <p className="text-xs text-slate-500">No unread alerts or match notifications at this time.</p>
          </div>
        ) : (
          items.map((n) => (
            <Link
              key={n.id}
              href={n.actionUrl || "/dashboard"}
              onClick={() => markAllRead(n.id)}
              className={`block rounded-2xl border p-4 transition ${
                n.readAt
                  ? "border-slate-200 bg-white hover:border-slate-300"
                  : "border-brand-200 bg-brand-50/50 hover:border-brand-300 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!n.readAt && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                    <span className="font-bold text-sm text-slate-900">{n.title}</span>
                  </div>
                  <p className="text-xs text-slate-600">{n.message}</p>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
