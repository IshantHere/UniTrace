"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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
import { getItemImageUrl } from "@/lib/images";
import { getClientItems, mergeItems } from "@/lib/client-storage";

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
  const executeSearch = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (type !== "ALL") params.set("type", type);
    if (categoryId) params.set("categoryId", categoryId);
    if (locationId) params.set("locationId", locationId);
    if (status) params.set("status", status);
    params.set("limit", "50");

    // Retrieve local client items and filter according to active criteria
    const localItems = getClientItems().filter((item) => {
      if (type !== "ALL" && item.type !== type) return false;
      if (categoryId && item.categoryId !== categoryId) return false;
      if (locationId && item.primaryLocationId !== locationId) return false;
      if (status && item.status !== status) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const descMatch = item.description?.toLowerCase().includes(q);
        const catMatch = item.category?.name?.toLowerCase().includes(q);
        const locMatch = item.primaryLocation?.name?.toLowerCase().includes(q);
        const bldMatch = item.primaryLocation?.building?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !catMatch && !locMatch && !bldMatch) return false;
      }
      return true;
    });

    fetch(`/api/items?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const serverItems = (d.success && d.data?.items) ? d.data.items : [];
        setItems(mergeItems(serverItems, localItems));
      })
      .catch(() => {
        setItems(localItems);
      })
      .finally(() => setLoading(false));
  }, [query, type, categoryId, locationId, status]);

  useEffect(() => {
    executeSearch();
    const handleItemSaved = () => executeSearch();
    window.addEventListener("unitrace_item_saved", handleItemSaved);
    window.addEventListener("focus", handleItemSaved);
    return () => {
      window.removeEventListener("unitrace_item_saved", handleItemSaved);
      window.removeEventListener("focus", handleItemSaved);
    };
  }, [executeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const setPresetSearch = (text: string) => {
    setQuery(text);
    const params = new URLSearchParams();
    params.set("query", text);
    if (type !== "ALL") params.set("type", type);
    params.set("limit", "50");
    setLoading(true);
    fetch(`/api/items?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.items) {
          setItems(d.data.items);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="border-b border-[#DADAD6] pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
            [DISCOVERY-SYSTEM // SEARCH-INDEX]
          </span>
          <span className="badge-neutral text-[10px]">
            CAMPUS-WIDE INVENTORY
          </span>
        </div>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
          Search Lost &amp; Found Inventory
        </h1>
        <p className="text-xs text-[#777777] mt-1 max-w-xl">
          Query registered specimens by visual traits, brand, stickers, colors, or campus facility coordinates.
        </p>
      </div>

      {/* Main Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#777777]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 'AirPods case with blue NASA sticker' or 'navy hydro flask'..."
          className="w-full rounded border border-[#DADAD6] bg-white py-3.5 pl-11 pr-28 text-xs font-mono outline-none transition focus:border-[#171717]"
        />
        <button
          type="submit"
          className="absolute right-2 btn-primary text-xs py-2 px-4"
        >
          Execute Search
        </button>
      </form>

      {/* Quick Example Query Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono text-[10px] uppercase text-[#777777]">SUGGESTIONS:</span>
        <button
          type="button"
          onClick={() => setPresetSearch("AirPods case with blue sticker")}
          className="border border-[#DADAD6] bg-white hover:border-[#171717] px-2.5 py-1 text-[11px] font-mono text-[#171717] rounded transition"
        >
          &quot;AirPods case with blue sticker&quot;
        </button>
        <button
          type="button"
          onClick={() => setPresetSearch("Navy blue water bottle")}
          className="border border-[#DADAD6] bg-white hover:border-[#171717] px-2.5 py-1 text-[11px] font-mono text-[#171717] rounded transition"
        >
          &quot;Navy blue water bottle&quot;
        </button>
        <button
          type="button"
          onClick={() => setPresetSearch("Library")}
          className="border border-[#DADAD6] bg-white hover:border-[#171717] px-2.5 py-1 text-[11px] font-mono text-[#171717] rounded transition"
        >
          &quot;Main Library&quot;
        </button>
      </div>

      {/* Filter Row */}
      <div className="card p-4 sm:p-5 bg-white border-[#DADAD6] rounded">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="input-label mb-1" htmlFor="typeFilter">
              Record Type
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
              Classification Category
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
              Campus Facility
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
              Resolution Status
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
        <div className="flex items-center justify-between border-b border-[#DADAD6] pb-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
            {loading ? "SEARCHING CORRELATION INDEX..." : `${items.length} SPECIMENS MATCHING CRITERIA`}
          </span>
        </div>

        {loading ? (
          <div className="card p-12 text-center text-[#777777] text-xs font-mono border-[#DADAD6] bg-white">
            [QUERYING CAMPUS INDEX...]
          </div>
        ) : items.length === 0 ? (
          <div className="card p-16 text-center space-y-3 border-[#DADAD6] bg-white rounded">
            <Search className="mx-auto h-8 w-8 text-[#777777]" />
            <h2 className="text-sm font-semibold text-[#171717]">No matching specimens found</h2>
            <p className="text-xs text-[#777777] max-w-sm mx-auto">
              Try adjusting your query keywords or filters. If you lost an item, file an incident report so multimodal AI can correlate incoming inventory.
            </p>
            <div className="pt-2">
              <Link href="/report/lost" className="btn-primary text-xs">
                File Lost Item Report
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
                  className="card p-5 space-y-4 border-[#DADAD6] bg-white hover:border-[#171717] transition flex flex-col justify-between rounded"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          item.type === "LOST"
                            ? "bg-[#DC2626]/5 text-[#DC2626] border-[#DC2626]/20"
                            : "bg-[#25845A]/5 text-[#25845A] border-[#25845A]/20"
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="font-mono text-[10px] text-[#777777]">
                        {item.status}
                      </span>
                    </div>

                    <div className="aspect-video w-full rounded bg-[#171717] overflow-hidden relative border border-[#DADAD6]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getItemImageUrl(item)}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-[#171717] truncate">{item.title}</h3>
                      <p className="text-xs text-[#777777] flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span>{(item.primaryLocation?.building || "Main Campus")} — {(item.primaryLocation?.name || "Campus Facility")}</span>
                      </p>
                      <p className="font-mono text-[10px] text-[#777777]">
                        {new Date(item.incidentDate).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="text-xs text-[#777777] line-clamp-2 bg-[#F7F7F5] p-2.5 rounded border border-[#DADAD6]">
                      &quot;{item.description}&quot;
                    </p>

                    {hasMatch && (
                      <div className="rounded border border-[#25845A]/30 bg-[#25845A]/5 px-3 py-1.5 text-xs text-[#25845A] flex items-center justify-between font-mono">
                        <span>AI CORRELATION CANDIDATE</span>
                        <span className="font-bold">{Math.round(hasMatch.overallScore * 100)}%</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#DADAD6] flex items-center justify-between text-xs">
                    <Link
                      href={`/journey/${item.id}`}
                      className="font-mono text-[11px] text-[#777777] hover:text-[#171717] transition"
                    >
                      Timeline &rarr;
                    </Link>

                    {item.type === "FOUND" ? (
                      <Link
                        href={`/claims/new?itemId=${item.id}`}
                        className="btn-primary text-xs py-1 px-3 flex items-center gap-1"
                      >
                        <span>Claim</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    ) : hasMatch ? (
                      <Link
                        href={`/match/${hasMatch.id}`}
                        className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"
                      >
                        <span>Inspect Match</span>
                        <ChevronRight className="h-3 w-3" />
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
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="card p-12 text-center text-[#777777] text-xs font-mono border-[#DADAD6] bg-white">[LOADING SEARCH ENGINE...]</div>}>
        <SearchContent />
      </Suspense>
    </main>
  );
}
