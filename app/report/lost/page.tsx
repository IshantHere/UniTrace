"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Layers,
} from "lucide-react";

// Client-side image optimizer to resize and compress high-resolution phone photos
function compressImage(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve("");
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      if (!rawResult) {
        resolve("");
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(rawResult);
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(rawResult);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } catch {
          resolve(rawResult);
        }
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  });
}

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

    const inputEl = e.target;
    setImageUploading(true);
    setError("");

    try {
      // 1. Immediately create optimized client-side preview
      const optimizedDataUrl = await compressImage(file);
      if (optimizedDataUrl) {
        setImageUrl(optimizedDataUrl);
      }

      // 2. Transmit to server upload endpoint
      const res = await fetch("/api/items/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: optimizedDataUrl || undefined }),
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        setImageUrl(json.data.url);
      }
    } catch (uploadErr) {
      console.warn("Upload fallback using local image data:", uploadErr);
    } finally {
      setImageUploading(false);
      if (inputEl) inputEl.value = "";
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
      privateNotes: "Bluetooth name is 'Ishant's AirDrop'. Blue circular NASA sticker on front.",
    });
    setImageUrl("https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80");
  };

  if (submittedItem) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="card p-8 sm:p-10 border-[#DADAD6] bg-white space-y-6">
          <div className="flex items-start justify-between border-b border-[#DADAD6] pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="badge-verified">
                  ✓ INTAKE REGISTERED
                </span>
                <span className="font-mono text-[10px] text-[#777777] uppercase">
                  SPECIMEN #{submittedItem.id.slice(-8)}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#171717] pt-1">
                {submittedItem.title}
              </h1>
              <p className="text-xs text-[#777777]">
                Logged into the Newton University central lost-and-found intelligence registry.
              </p>
            </div>
            <div className="h-10 w-10 border border-[#25845A]/30 bg-[#25845A]/10 text-[#25845A] flex items-center justify-center rounded">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-[#DADAD6] p-4 bg-[#F7F7F5] rounded text-xs">
            <div>
              <div className="font-mono text-[10px] uppercase text-[#777777]">Status</div>
              <div className="font-semibold text-[#171717] mt-0.5">ACTIVE SCANNING</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-[#777777]">Multi-Modal Matching</div>
              <div className="font-semibold text-[#3867E8] mt-0.5">Fingerprint Active</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-[#777777]">Zero-Knowledge Shield</div>
              <div className="font-semibold text-[#25845A] mt-0.5">Enabled (Private)</div>
            </div>
          </div>

          <div className="text-xs text-[#777777] leading-relaxed">
            The UniTrace correlation pipeline is actively analyzing incoming intake items, security turn-ins, and visual camera streams across campus corridors. When an intake candidate exceeds the 80% confidence threshold, an automated notification will appear in your dashboard.
          </div>

          <div className="pt-4 border-t border-[#DADAD6] flex flex-wrap items-center justify-end gap-3">
            <Link href={`/journey/${submittedItem.id}`} className="btn-secondary text-xs">
              Open Journey Timeline
            </Link>
            <Link href="/dashboard" className="btn-primary text-xs">
              Return to Student Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Top Protocol Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DADAD6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
              [INTAKE-SYSTEM // PROTOCOL-LOST]
            </span>
            <span className="badge-neutral text-[10px]">
              INCIDENT REGISTRY
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#171717]">
            Report a Lost Item
          </h1>
          <p className="text-xs text-[#777777] mt-1 max-w-xl">
            Register a misplaced possession into the campus precision intelligence network. Visual attributes and spatiotemporal coordinates will be cross-referenced automatically against incoming inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={fillSampleAirPods}
          className="self-start sm:self-auto border border-[#DADAD6] bg-white px-3 py-1.5 text-xs font-mono font-medium text-[#171717] hover:border-[#171717] transition rounded"
          title="Autofill with Golden Storyline AirPods data (Ishant Singh)"
        >
          ⚡ Autofill AirPods Demo
        </button>
      </div>

      {error && (
        <div className="rounded border border-[#DC2626]/30 bg-[#DC2626]/5 p-3.5 text-xs text-[#DC2626] flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Visual Evidence & Fingerprinting */}
        <section className="card p-6 sm:p-7 space-y-4 border-[#DADAD6] bg-white">
          <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#171717]">01</span>
              <h2 className="text-sm font-semibold tracking-tight text-[#171717]">
                Visual Evidence &amp; Fingerprint Acquisition
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[#777777]">JPG, PNG, WEBP &le; 5MB</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            <div className="relative border border-dashed border-[#DADAD6] hover:border-[#171717] rounded p-6 text-center transition bg-[#F7F7F5] flex flex-col items-center justify-center min-h-[160px]">
              <input
                id="photoUpload"
                type="file"
                accept="image/*,image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleImageUpload}
                disabled={imageUploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-2">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded border border-[#DADAD6] bg-white text-[#171717]">
                  <Camera className="h-4 w-4" />
                </div>
                <div className="text-xs font-medium text-[#171717]">
                  {imageUploading ? "Analyzing & Extracting Features..." : "Click or Drag Specimen Photograph"}
                </div>
                <p className="text-[10px] text-[#777777]">
                  Extracts stickers, logos, scuffs, color histograms, and geometric ratios
                </p>
              </div>
            </div>

            {imageUrl ? (
              <div className="relative rounded overflow-hidden aspect-video bg-[#171717] border border-[#DADAD6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Uploaded item" className="h-full w-full object-cover" />
                <div className="absolute top-2 left-2 badge-verified text-[10px]">
                  FINGERPRINT READY
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 rounded bg-[#171717]/80 hover:bg-[#DC2626] px-2 py-0.5 text-[10px] font-mono text-white transition"
                >
                  REMOVE
                </button>
              </div>
            ) : (
              <div className="rounded bg-[#F7F7F5] p-5 border border-[#DADAD6] text-center text-xs text-[#777777] flex flex-col items-center justify-center space-y-1.5">
                <Sparkles className="h-4 w-4 text-[#777777]" />
                <span className="font-medium text-[#171717]">No Photograph Uploaded</span>
                <span className="text-[10px] text-[#777777] max-w-xs">
                  While text-only reports are supported, attaching a photo enables high-confidence visual vector matching (&ge; 90%).
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Step 2: Spatiotemporal & Categorical Details */}
        <section className="card p-6 sm:p-7 space-y-5 border-[#DADAD6] bg-white">
          <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#171717]">02</span>
              <h2 className="text-sm font-semibold tracking-tight text-[#171717]">
                Item Description &amp; Spatiotemporal Attributes
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[#777777]">* REQUIRED FIELDS</span>
          </div>

          <div>
            <label className="input-label" htmlFor="title">
              Item Designation / Title *
            </label>
            <input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              minLength={3}
              placeholder="e.g. Apple AirPods Pro Case with Blue NASA Sticker"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="category">
                Classification Category *
              </label>
              <select
                id="category"
                value={formData.categoryId}
                onChange={handleCategoryChange}
                required
                className="input-field"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isHighValue ? "— High-Value Protocol" : ""}
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
                className="input-field font-mono text-xs"
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
                className="input-field font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="description">
              Public Description * (Colors, distinctive wear, context)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              minLength={10}
              rows={3}
              placeholder="State observable characteristics: exterior finish, noticeable scratches, decals, or specific context where it was dropped."
              className="input-field min-h-[90px]"
            />
          </div>
        </section>

        {/* Step 3: Zero-Knowledge Verification Challenge */}
        <section className="card p-6 sm:p-7 space-y-4 border-[#DADAD6] bg-[#F7F7F5]">
          <div className="flex items-center justify-between border-b border-[#DADAD6] pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#171717]">03</span>
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#171717]" />
                <h2 className="text-sm font-semibold tracking-tight text-[#171717]">
                  Private Ownership Verification Marks
                </h2>
              </div>
            </div>
            <span className="badge-signal text-[10px]">ZERO-KNOWLEDGE VAULT</span>
          </div>

          <p className="text-xs text-[#777777] leading-relaxed">
            Record confidential distinguishing characteristics known exclusively to you (e.g. hidden engraving, exact sticker placement, serial number, or device pairing name). This information is encrypted, kept strictly confidential, and never published on public boards. Campus security officers use it as a verification challenge before property release.
          </p>

          <div>
            <label className="input-label" htmlFor="privateNotes">
              Confidential Verification Notes
            </label>
            <textarea
              id="privateNotes"
              value={formData.privateNotes}
              onChange={(e) => setFormData({ ...formData, privateNotes: e.target.value })}
              rows={2}
              placeholder="e.g. Small circular NASA sticker on top lid, faint pencil mark on bottom, Bluetooth name 'Ishant AirDrop'"
              className="input-field bg-white"
            />
          </div>

          {formData.isHighValue && (
            <div className="rounded border border-[#C27803]/30 bg-[#C27803]/5 p-3 text-xs text-[#C27803] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>High-Value Item Protocol:</strong> This category mandates multi-point zero-knowledge verification and photo ID attestation prior to physical handover from central security depots.
              </span>
            </div>
          )}
        </section>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/dashboard" className="btn-secondary text-xs">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || imageUploading}
            className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2"
          >
            {loading ? "Registering Specimen..." : "Submit Report & Initiate AI Scan"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </main>
  );
}
