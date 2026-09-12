"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  Tag,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<string>("ALL"); // ALL | LOST | FOUND
  const [categoryId, setCategoryId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load categories & locations for filters
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/locations").then((r) => r.json()),
    ]).then(([catData, locData]) => {
      if (catData.success) setCategories(catData.data.categories);
      if (locData.success) setLocations(locData.data.locations);
    });
  }, []);

  // Perform search query
  const executeSearch = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (type !== "ALL") params.set("type", type);
    if (categoryId) params.set("categoryId", categoryId);
    if (locationId) params.set("locationId", locationId);
    if (status) params.set("status", status);

    fetch(`/api/items?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.items) {
          setItems(d.data.items);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    executeSearch();
  }, [type, categoryId, locationId, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const setPresetSearch = (text: string) => {
    setQuery(text);
    const params = new URLSearchParams();
    params.set("query", text);
    if (type !== "ALL") params.set("type", type);
    setLoading(true);
    fetch(`/api/items?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.items) {
          setItems(d.data.items);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
          Campus Discovery Engine
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Search Lost &amp; Found Items
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Describe items naturally, by appearance, brand, color, or location. Tolerates spelling variations.
        </p>
      </div>

      {/* Main Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 'AirPods with blue sticker near library' or 'navy hydro flask bottle'..."
          className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-12 pr-28 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
        />
        <button
          type="submit"
          className="absolute right-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition"
        >
          Search
        </button>
      </form>

      {/* Quick Example Query Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Try searching:</span>
        <button
          type="button"
          onClick={() => setPresetSearch("AirPods case with blue sticker")}
          className="rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1 font-medium text-slate-700 transition"
        >
          &quot;AirPods case with blue sticker&quot;
        </button>
        <button
          type="button"
          onClick={() => setPresetSearch("Navy blue water bottle")}
          className="rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1 font-medium text-slate-700 transition"
        >
          &quot;Navy blue water bottle&quot;
        </button>
        <button
          type="button"
          onClick={() => setPresetSearch("Library")}
          className="rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1 font-medium text-slate-700 transition"
        >
          &quot;Main Library&quot;
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="card p-4 bg-slate-50 border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="input-label mb-1" htmlFor="typeFilter">
              Report Type
            </label>
            <select
              id="typeFilter"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-field py-1.5 text-xs"
            >
              <option value="ALL">All Items (Lost &amp; Found)</option>
              <option value="FOUND">Found Only</option>
              <option value="LOST">Lost Only</option>
            </select>
          </div>

          <div>
            <label className="input-label mb-1" htmlFor="catFilter">
              Category
            </label>
            <select
              id="catFilter"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field py-1.5 text-xs"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label mb-1" htmlFor="locFilter">
              Building / Area
            </label>
            <select
              id="locFilter"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="input-field py-1.5 text-xs"
            >
              <option value="">All Campus Locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.building} — {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label mb-1" htmlFor="statusFilter">
              Status
            </label>
            <select
              id="statusFilter"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field py-1.5 text-xs"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="RECOVERED">Recovered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {loading ? "Searching Campus Grid..." : `${items.length} Matching Belongings Found`}
          </span>
        </div>

        {loading ? (
          <div className="card py-16 text-center text-slate-400 text-sm">Searching items...</div>
        ) : items.length === 0 ? (
          <div className="card py-16 text-center space-y-3">
            <Search className="mx-auto h-8 w-8 text-slate-300" />
            <h2 className="text-base font-bold text-slate-800">No matching items found</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or filters. If you lost an item, file a lost report so AI can notify you when someone discovers it!
            </p>
            <div className="pt-2">
              <Link href="/report/lost" className="btn-primary">
                File a Lost Report
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const hasMatch =
                item.type === "LOST"
                  ? item.lostMatches?.[0]
                  : item.foundMatches?.[0];

              return (
                <div
                  key={item.id}
                  className="card p-4 space-y-3 hover:border-slate-300 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`badge ${
                          item.type === "LOST"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {item.status}
                      </span>
                    </div>

                    <div className="aspect-video w-full rounded-xl bg-slate-100 overflow-hidden relative border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.images[0]?.url || "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434"}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{item.title}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {item.primaryLocation.building} — {item.primaryLocation.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(item.incidentDate).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      &quot;{item.description}&quot;
                    </p>

                    {hasMatch && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800 flex items-center justify-between">
                        <span>AI Match Candidate</span>
                        <span>{Math.round(hasMatch.overallScore * 100)}%</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link
                      href={`/journey/${item.id}`}
                      className="font-semibold text-slate-600 hover:text-slate-900"
                    >
                      View Timeline
                    </Link>

                    {item.type === "FOUND" ? (
                      <Link
                        href={`/claims/new?itemId=${item.id}`}
                        className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        Claim Property <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : hasMatch ? (
                      <Link
                        href={`/match/${hasMatch.id}`}
                        className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        Inspect Match <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="card py-20 text-center text-slate-400 text-sm">Loading search...</div>}>
        <SearchContent />
      </Suspense>
    </main>
  );
}
