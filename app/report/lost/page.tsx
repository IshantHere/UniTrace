"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Upload,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function ReportLostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    primaryLocationId: "",
    incidentDate: new Date().toISOString().split("T")[0],
    incidentTime: "16:30",
    isHighValue: false,
    privateNotes: "",
  });

  const [submittedItem, setSubmittedItem] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/locations").then((r) => r.json()),
    ]).then(([catData, locData]) => {
      if (catData.success) setCategories(catData.data.categories);
      if (locData.success) setLocations(locData.data.locations);
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/items/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        setImageUrl(json.data.url);
      } else {
        setError(json.error?.message || "Image upload failed");
      }
    } catch {
      setError("Network error uploading photo");
    } finally {
      setImageUploading(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    const cat = categories.find((c) => c.id === catId);
    setFormData({
      ...formData,
      categoryId: catId,
      isHighValue: cat?.isHighValue || false,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        type: "LOST",
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        primaryLocationId: formData.primaryLocationId,
        incidentDate: new Date(formData.incidentDate).toISOString(),
        incidentTime: formData.incidentTime,
        imageUrl: imageUrl || undefined,
        isHighValue: formData.isHighValue,
        privateNotes: formData.privateNotes || undefined,
      };

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data?.item) {
        setSubmittedItem(json.data.item);
      } else {
        if (res.status === 401) {
          router.push("/login");
        } else {
          setError(json.error?.message || "Failed to submit lost report");
        }
      }
    } catch {
      setError("Network error submitting report");
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill sample button for rapid test/demo convenience
  const fillSampleAirPods = () => {
    const audioCat = categories.find((c) => c.slug.includes("audio")) || categories[0];
    const libLoc = locations.find((l) => l.name.includes("Library")) || locations[0];
    setFormData({
      title: "Apple AirPods Pro Case with Blue NASA Sticker",
      description:
        "Lost my white Apple AirPods Pro charging case on the library steps around 4:30 PM. It has a distinctive circular blue sticker on the top lid and a faint scratch near the bottom hinge.",
      categoryId: audioCat?.id || "",
      primaryLocationId: libLoc?.id || "",
      incidentDate: new Date().toISOString().split("T")[0],
      incidentTime: "16:30",
      isHighValue: true,
      privateNotes: "Bluetooth name is 'Alex's AirDrop'. Blue circular NASA sticker.",
    });
    setImageUrl("https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80");
  };

  if (submittedItem) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
        <div className="card space-y-4 p-8 border-emerald-200 bg-emerald-50/40">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Report Successfully Logged
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{submittedItem.title}</h1>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your lost item report has been registered into the campus database. UniTrace multimodal matching and visual fingerprinting are now actively scanning incoming found items.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href={`/journey/${submittedItem.id}`} className="btn-secondary">
              View Item Timeline
            </Link>
            <Link href="/dashboard" className="btn-primary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Incident Intake</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Report a Lost Item</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Describe what was misplaced so AI can correlate visual attributes and campus locations.
          </p>
        </div>

        <button
          type="button"
          onClick={fillSampleAirPods}
          className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition"
          title="Autofill with Golden Storyline AirPods data"
        >
          ⚡ Autofill AirPods Demo
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload & Visual Fingerprint Intake */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <label className="input-label mb-0" htmlFor="photoUpload">
              1. Item Photograph (Essential for AI Visual Fingerprinting)
            </label>
            <span className="text-[11px] text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="relative border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center transition bg-slate-50/50">
              <input
                id="photoUpload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={imageUploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Camera className="h-5 w-5" />
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  {imageUploading ? "Uploading & Analyzing..." : "Click or Drag Photo to Upload"}
                </div>
                <p className="text-[10px] text-slate-400">Enables logo, sticker, scratch, and color extraction</p>
              </div>
            </div>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Uploaded item" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] text-white hover:bg-rose-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-100/70 p-4 border border-slate-200 text-center text-xs text-slate-500 flex flex-col items-center justify-center h-full space-y-1">
                <Sparkles className="h-4 w-4 text-brand-500 mb-1" />
                <span className="font-semibold text-slate-700">No Photo Attached Yet</span>
                <span className="text-[10px] text-slate-400">
                  You can proceed without a photo, but AI visual matching will be limited to text descriptions.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Item Details */}
        <div className="card space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Item Description &amp; Details</h2>

          <div>
            <label className="input-label" htmlFor="title">
              Item Title / Name *
            </label>
            <input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              minLength={3}
              placeholder="e.g. Apple AirPods Pro Case with Blue Sticker"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                value={formData.categoryId}
                onChange={handleCategoryChange}
                required
                className="input-field"
              >
                <option value="">Select an Item Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isHighValue ? "★ (High-Value)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label" htmlFor="location">
                Last Seen Campus Location *
              </label>
              <select
                id="location"
                value={formData.primaryLocationId}
                onChange={(e) => setFormData({ ...formData, primaryLocationId: e.target.value })}
                required
                className="input-field"
              >
                <option value="">Select Campus Building &amp; Area</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.building} — {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="incidentDate">
                Date Misplaced *
              </label>
              <input
                id="incidentDate"
                type="date"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label" htmlFor="incidentTime">
                Approximate Time
              </label>
              <input
                id="incidentTime"
                type="time"
                value={formData.incidentTime}
                onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="description">
              Natural-Language Description * (Be specific about colors, marks, textures)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              minLength={10}
              rows={3}
              placeholder="Describe the item as you remember it. Include brand, model, exterior color, and specific circumstances."
              className="input-field min-h-24"
            />
          </div>
        </div>

        {/* Private Verification Hints & Distinguishing Marks */}
        <div className="card space-y-4 border-brand-200/80 bg-brand-50/20">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-brand-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-900">
              3. Private Ownership Verification Details (Hidden from Public)
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Provide unique identifiers known only to you (e.g. specific stickers, engravings, serial number, or Bluetooth name). This will be used by security officers to verify your identity when claiming.
          </p>

          <div>
            <label className="input-label" htmlFor="privateNotes">
              Private Distinguishing Characteristics
            </label>
            <textarea
              id="privateNotes"
              value={formData.privateNotes}
              onChange={(e) => setFormData({ ...formData, privateNotes: e.target.value })}
              rows={2}
              placeholder="e.g. Small circular NASA blue sticker on lid, faint pencil mark on bottom, Bluetooth name 'Alex AirDrop'"
              className="input-field"
            />
          </div>

          {formData.isHighValue && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              <ShieldCheck className="h-4 w-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>High-Value Item Protocol:</strong> This category requires strict zero-knowledge verification before release from campus security desks.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading || imageUploading} className="btn-primary py-3 px-8">
            {loading ? "Registering Report..." : "Submit Lost Report & Scan Matches"}
          </button>
        </div>
      </form>
    </main>
  );
}
