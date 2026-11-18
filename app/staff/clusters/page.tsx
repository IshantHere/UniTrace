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
import { getItemImageUrl } from "@/lib/images";

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
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DADAD6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              [STAFF-OPS // DEDUPLICATION-GRAPH]
            </span>
            <span className="badge-signal text-[10px]">
              GRAPH CLUSTER ENGINE
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
            Duplicate Report Clusters
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Review AI-detected duplicate reports filed independently by different students or staff for the same physical object.
          </p>
        </div>

        <Link href="/staff/dashboard" className="btn-secondary text-xs self-start sm:self-auto">
          Back to Staff Overview
        </Link>
      </div>

      {message && (
        <div className="rounded border border-[#25845A]/30 bg-[#25845A]/5 p-4 text-xs font-medium text-[#25845A] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Suggested Clusters Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
          <h2 className="text-sm font-semibold tracking-tight text-[#171717] flex items-center gap-2">
            <GitFork className="h-4 w-4 text-[#171717]" />
            <span>Suggested Clusters Awaiting Review ({pendingClusters.length})</span>
          </h2>
          <span className="font-mono text-[10px] text-[#777777]">
            THRESHOLD &ge; 85% MULTI-SIGNAL SIMILARITY
          </span>
        </div>

        {loading ? (
          <div className="card p-12 text-center text-[#777777] text-xs font-mono border-[#DADAD6] bg-white">
            [SCANNING REPOSITORY CORRELATION GRAPHS...]
          </div>
        ) : pendingClusters.length === 0 ? (
          <div className="card p-16 text-center space-y-3 border-[#DADAD6] bg-white rounded">
            <CheckCircle2 className="mx-auto h-8 w-8 text-[#25845A]" />
            <h3 className="text-sm font-semibold text-[#171717]">No duplicate clusters pending review</h3>
            <p className="text-xs text-[#777777]">All campus intake reports are currently normalized and deduplicated.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingClusters.map((cluster) => {
              const canonicalId = cluster.canonicalItemId || cluster.members[0]?.itemId;

              return (
                <div key={cluster.id} className="card border-[#DADAD6] space-y-5 p-6 sm:p-7 bg-white rounded">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#DADAD6] pb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded border border-[#3867E8]/30 bg-[#3867E8]/10 text-[#3867E8] font-mono font-bold text-xs">
                        {Math.round(cluster.averageSimilarity * 100)}%
                      </span>
                      <div>
                        <div className="font-semibold text-sm text-[#171717]">
                          Probable Duplicate Group ({cluster.members.length} Reports)
                        </div>
                        <div className="font-mono text-[10px] text-[#777777]">
                          Detected {new Date(cluster.detectedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDismiss(cluster.id)}
                        disabled={actionLoading === cluster.id}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        Dismiss Cluster
                      </button>
                      <button
                        onClick={() => handleMerge(cluster, canonicalId)}
                        disabled={actionLoading === cluster.id}
                        className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                      >
                        <GitFork className="h-3.5 w-3.5" />
                        <span>{actionLoading === cluster.id ? "Merging..." : "Approve & Merge Group"}</span>
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
                          className={`rounded border p-4 space-y-3 transition ${
                            isCanonical
                              ? "border-[#171717] bg-[#F7F7F5]"
                              : "border-[#DADAD6] bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${
                                isCanonical
                                  ? "bg-[#171717] text-white border-[#171717]"
                                  : "bg-[#F7F7F5] text-[#777777] border-[#DADAD6]"
                              }`}
                            >
                              {isCanonical ? "★ PRIMARY CANONICAL CANDIDATE" : `REPORT #${idx + 1}`}
                            </span>
                            <span className="font-mono text-[10px] text-[#777777]">
                              {new Date(item.incidentDate).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex gap-3">
                            <div className="h-16 w-16 rounded bg-[#F7F7F5] overflow-hidden border border-[#DADAD6] flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getItemImageUrl(item)}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <h3 className="font-semibold text-sm text-[#171717] truncate">{item.title}</h3>
                              <p className="text-xs text-[#777777] flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 text-[#777777] flex-shrink-0" />
                                {item.primaryLocation?.name}
                              </p>
                              <p className="font-mono text-[10px] text-[#777777]">
                                Reporter: {item.reporter?.name}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-[#777777] bg-[#F7F7F5] p-2.5 rounded border border-[#DADAD6] line-clamp-2">
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
        <section className="space-y-4 pt-4 border-t border-[#DADAD6]">
          <h2 className="text-sm font-semibold tracking-tight text-[#171717]">
            Previously Merged Clusters ({mergedClusters.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {mergedClusters.map((c) => (
              <div key={c.id} className="card p-4 space-y-2 bg-white border-[#DADAD6] rounded">
                <div className="flex items-center justify-between">
                  <span className="badge-verified text-[10px]">
                    ✓ MERGED INTO CANONICAL RECORD
                  </span>
                  <span className="font-mono text-[10px] text-[#777777]">{c.id}</span>
                </div>
                <div className="text-xs text-[#777777]">
                  Merged {c.members.length} reports into canonical record:{" "}
                  <strong className="text-[#171717]">{c.canonicalItem?.title || c.canonicalItemId}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
