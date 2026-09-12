"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function ReportFoundPage() {
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
    incidentTime: "17:05",
    isHighValue: false,
    privateNotes: "",
    custodyStatus: "SECURED_AT_DESK", // SECURED_AT_DESK | IN_PERSONAL_CUSTODY
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
        type: "FOUND",
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        primaryLocationId: formData.primaryLocationId,
        incidentDate: new Date(formData.incidentDate).toISOString(),
        incidentTime: formData.incidentTime,
        imageUrl: imageUrl || undefined,
        isHighValue: formData.isHighValue,
        privateNotes: formData.privateNotes
          ? `Custody: ${formData.custodyStatus}. Notes: ${formData.privateNotes}`
          : `Custody: ${formData.custodyStatus}`,
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
          setError(json.error?.message || "Failed to submit found report");
        }
      }
    } catch {
      setError("Network error submitting report");
    } finally {
      setLoading(false);
    }
  };

  const fillSampleFoundEarbuds = () => {
    const audioCat = categories.find((c) => c.slug.includes("audio")) || categories[0];
    const deskLoc = locations.find((l) => l.name.includes("Desk")) || locations[0];
    setFormData({
      title: "White Wireless Earbuds Case turned in at Library Desk",
      description:
        "Found a white Apple AirPods wireless earbud case on the library entrance concrete ledge around 5:00 PM. Turned into the circulation desk for safekeeping.",
      categoryId: audioCat?.id || "",
      primaryLocationId: deskLoc?.id || "",
      incidentDate: new Date().toISOString().split("T")[0],
      incidentTime: "17:05",
      isHighValue: true,
      privateNotes: "Inspected at desk: blue round sticker on top lid, minor scuff near bottom.",
      custodyStatus: "SECURED_AT_DESK",
    });
    setImageUrl("https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80");
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
              Found Property Registered
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{submittedItem.title}</h1>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Thank you for helping campus property recovery! UniTrace AI will search for active lost reports and notify the owner to submit verification.
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
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Turn-in Intake</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Report a Found Item</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log an item discovered on campus so the rightful owner can be safely identified.
          </p>
        </div>

        <button
          type="button"
          onClick={fillSampleFoundEarbuds}
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
          title="Autofill with sample found earbuds"
        >
          ⚡ Autofill Sample Found Item
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <label className="input-label mb-0" htmlFor="photoUpload">
              1. Item Photo (Captures Visual Fingerprint)
            </label>
            <span className="text-[11px] text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition bg-slate-50/50">
              <input
                id="photoUpload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={imageUploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Camera className="h-5 w-5" />
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  {imageUploading ? "Uploading Photo..." : "Upload Found Item Photo"}
                </div>
                <p className="text-[10px] text-slate-400">Essential for multimodal visual matching</p>
              </div>
            </div>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Uploaded found item" className="h-full w-full object-cover" />
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
                <Sparkles className="h-4 w-4 text-emerald-500 mb-1" />
                <span className="font-semibold text-slate-700">No Photo Uploaded</span>
                <span className="text-[10px] text-slate-400">
                  Taking a clear photo significantly increases the chance of matching with the owner.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Item Details */}
        <div className="card space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Discovery Details</h2>

          <div>
            <label className="input-label" htmlFor="title">
              Item Headline *
            </label>
            <input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              minLength={3}
              placeholder="e.g. White Earbuds Case found at Library Entrance"
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
                Where Discovered or Turned In *
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="input-label" htmlFor="incidentDate">
                Date Discovered *
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

            <div>
              <label className="input-label" htmlFor="custody">
                Current Physical Custody
              </label>
              <select
                id="custody"
                value={formData.custodyStatus}
                onChange={(e) => setFormData({ ...formData, custodyStatus: e.target.value })}
                className="input-field"
              >
                <option value="SECURED_AT_DESK">Turned into Security / Desk</option>
                <option value="IN_PERSONAL_CUSTODY">With me (Student Finder)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="description">
              Public Description * (Omit hidden serial numbers / private codes)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              minLength={10}
              rows={3}
              placeholder="State general characteristics (e.g. 'Found white Apple earbuds case on ledge near entrance steps')."
              className="input-field min-h-24"
            />
          </div>
        </div>

        {/* Private Inspection Notes for Staff Verification */}
        <div className="card space-y-4 border-emerald-200/80 bg-emerald-50/20">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              3. Private Inspection Notes (Staff &amp; Verification Use Only)
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Note down distinct hidden details (e.g. specific stickers, engravings, contents, or serial numbers). These will NOT be published publicly, but will be used as challenge questions to verify genuine ownership!
          </p>

          <div>
            <label className="input-label" htmlFor="privateNotes">
              Confidential Identifying Marks
            </label>
            <textarea
              id="privateNotes"
              value={formData.privateNotes}
              onChange={(e) => setFormData({ ...formData, privateNotes: e.target.value })}
              rows={2}
              placeholder="e.g. Has a circular blue NASA sticker on the top cover, minor bottom scuff, blue ink spot."
              className="input-field"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading || imageUploading} className="btn-primary py-3 px-8 bg-emerald-600 hover:bg-emerald-700">
            {loading ? "Registering Found Item..." : "Submit Found Report"}
          </button>
        </div>
      </form>
    </main>
  );
}
