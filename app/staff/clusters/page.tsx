"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function StaffClustersPage() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadClusters = async () => {
    try {
      const res = await fetch("/api/duplicates/clusters");
      const json = await res.json();
      if (json.success && json.data?.clusters) {
        setClusters(json.data.clusters);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClusters();
  }, []);

  const handleMerge = async (cluster: any, canonicalItemId: string) => {
    setActionLoading(cluster.id);
    setMessage("");

    const itemIds = cluster.members.map((m: any) => m.item.id);

    try {
      const res = await fetch("/api/duplicates/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clusterId: cluster.id,
          canonicalItemId,
          itemIds,
          notes: "Staff verified reports describe the exact same discovered item.",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage(`Successfully merged ${json.data.mergedCount} duplicate reports into canonical record.`);
        await loadClusters();
      } else {
        alert(json.error?.message || "Merge failed");
      }
    } catch {
      alert("Network error during merge");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (clusterId: string) => {
    setActionLoading(clusterId);
    try {
      const res = await fetch("/api/duplicates/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clusterId }),
      });
      const json = await res.json();
      if (json.success) {
        await loadClusters();
      }
    } catch {
      alert("Failed to dismiss cluster");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingClusters = clusters.filter((c) => c.status === "SUGGESTED");
  const mergedClusters = clusters.filter((c) => c.status === "MERGED");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Staff Ops</span>
            <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">Deduplication Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Duplicate Report Clusters
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review AI-detected duplicate reports filed by different students for the same physical object.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/staff/dashboard" className="btn-secondary text-xs">
            Back to Staff Queue
          </Link>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {message}
        </div>
      )}

      {/* Suggested Clusters Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GitFork className="h-4 w-4 text-brand-600" />
            Suggested Clusters Awaiting Review ({pendingClusters.length})
          </h2>
          <span className="text-xs text-slate-500">Threshold: &gt;= 85% Multi-Signal Correlation</span>
        </div>

        {loading ? (
          <div className="card py-12 text-center text-slate-400 text-sm">Scanning cluster graphs...</div>
        ) : pendingClusters.length === 0 ? (
          <div className="card py-16 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800">No duplicate clusters pending review</h3>
            <p className="text-xs text-slate-500">All campus intake reports are currently deduplicated.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingClusters.map((cluster) => {
              const canonicalId = cluster.canonicalItemId || cluster.members[0]?.itemId;

              return (
                <div key={cluster.id} className="card border-brand-200 space-y-5 p-6 bg-white shadow-card">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-black text-xs">
                        {Math.round(cluster.averageSimilarity * 100)}%
                      </span>
                      <div>
                        <div className="font-bold text-sm text-slate-900">
                          Probable Duplicate Group ({cluster.members.length} Reports)
                        </div>
                        <div className="text-xs text-slate-500">
                          Detected {new Date(cluster.detectedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDismiss(cluster.id)}
                        disabled={actionLoading === cluster.id}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Dismiss Cluster
                      </button>
                      <button
                        onClick={() => handleMerge(cluster, canonicalId)}
                        disabled={actionLoading === cluster.id}
                        className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-700 shadow-sm transition"
                      >
                        {actionLoading === cluster.id ? "Merging..." : "Approve & Merge Group"}
                      </button>
                    </div>
                  </div>

                  {/* Member Reports Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cluster.members.map((m: any, idx: number) => {
                      const item = m.item;
                      const isCanonical = item.id === canonicalId;

                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl border p-4 space-y-3 transition ${
                            isCanonical
                              ? "border-brand-500 bg-brand-50/30 ring-2 ring-brand-500/20"
                              : "border-slate-200 bg-slate-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`badge ${
                                isCanonical
                                  ? "bg-brand-100 text-brand-800 font-bold"
                                  : "bg-slate-200 text-slate-700 font-medium"
                              }`}
                            >
                              {isCanonical ? "★ PRIMARY CANONICAL CANDIDATE" : `REPORT #${idx + 1}`}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(item.incidentDate).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex gap-3">
                            <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.images[0]?.url || "https://images.unsplash.com/photo-1602143407151-7111542de6e8"}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <h3 className="font-bold text-sm text-slate-900 truncate">{item.title}</h3>
                              <p className="text-xs text-slate-600 flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                {item.primaryLocation?.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Reporter: {item.reporter?.name}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                            &quot;{item.description}&quot;
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Merged Clusters History */}
      {mergedClusters.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            Previously Merged Clusters ({mergedClusters.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {mergedClusters.map((c) => (
              <div key={c.id} className="card p-4 space-y-2 bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="badge bg-emerald-100 text-emerald-800 font-bold text-xs">
                    ✓ MERGED INTO CANONICAL RECORD
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{c.id}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Merged {c.members.length} reports into canonical record:{" "}
                  <strong className="text-slate-900">{c.canonicalItem?.title || c.canonicalItemId}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
