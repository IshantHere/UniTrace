# UniTrace — AI-Powered Campus Lost & Found Intelligence Platform

> **Transforming campus lost & found from a chaotic cardboard box into an intelligent, secure, multi-modal recovery network.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-30%20Passing-emerald?style=flat)](./tests)

---

## 🌟 What is UniTrace?

Campuses lose thousands of personal items every semester — laptops, AirPods, hydroflasks, IDs, and keys. Traditional lost & found offices rely on static paper binders or simple text message boards where descriptions like *"White AirPods"* create hundreds of false leads.

**UniTrace** is an enterprise-grade lost & found intelligence platform engineered for universities, airports, corporate campuses, and municipal transit hubs. It leverages multimodal AI, visual attribute fingerprinting, spatio-temporal trajectory inference, and zero-knowledge ownership verification to connect lost items with their rightful owners in minutes.

---

## 🚀 Core Innovations & Differentiators

### 1. 👁️ Visual Fingerprinting & Multimodal AI
- Extracts fine-grained visual characteristics: distinct stickers, scratch patterns, logos, engraving, and surface wear.
- Generates high-dimensional vector embeddings for cross-modal similarity search (matching a photo against a text description or another photo).
- Google Gemini 1.5 Flash integration with deterministic offline fallback for offline hackathon demos.

### 2. 🗺️ UniTrace Item Journey (Signature Feature)
- Plots physical sightings on an interactive campus map.
- Strictly separates **`OBSERVED`** physical sightings (verified by staff or badge taps) from **`AI_INFERRED`** trajectory segments.
- Visualizes velocity, direction, elapsed time, and confidence-shaded recovery radar rings.

### 3. 🔍 Explainable Multi-Signal Matching
- Transparent, weighted matching algorithm combining:
  - **Visual Embedding Similarity** (35%)
  - **Structured Visual Fingerprint Overlap** (25%)
  - **Semantic Description Similarity** (20%)
  - **Spatio-Temporal Proximity** (15%)
  - **Category Match** (5%)
- Provides human staff with an explainable evidence breakdown (e.g. *"94% Match: Circular blue NASA sticker match, 2 hours apart, 120m apart"*).

### 4. 🔐 Zero-Knowledge Ownership Verification
- Prevents theft and fraudulent claims on high-value items.
- Public listings redact private markings, serial numbers, and lockscreen wallpapers.
- Claimants must answer secret challenge questions or provide matching proof.
- Staff approves claims and issues a one-time cryptographic **Handover PIN** verified at the security desk before physical custody transfer.

### 5. 📑 Duplicate Report Detection & Clustering
- Automatically clusters multiple student reports for the same incident (e.g. 4 students reporting the same abandoned Hydro Flask in the lecture hall).
- Allows campus staff to merge duplicate reports with a single click, preserving audit trails and keeping all reporters notified.

---

## 👥 Demo Persona Accounts

To test UniTrace without manual login hurdles, a **1-Click Persona Switcher** is embedded at the top of the navigation bar:

| Persona | Name | Role / Purpose | Email | Password |
|:---|:---|:---|:---|:---|
| 🎓 **Student** | Alex Chen | Reports lost AirPods, tracks journey, files claim | `student@apex.edu` | `Password123!` |
| 🔍 **Finder** | Jamie Taylor | Finds AirPods at library, submits photo report | `finder@apex.edu` | `Password123!` |
| 🛡️ **Campus Staff** | Officer Sarah Jenkins | Reviews AI matches, approves claims, releases item | `staff@apex.edu` | `Password123!` |
| ⚙️ **Administrator** | Dean Marcus Vance | Oversees campus analytics, zones, categories | `admin@apex.edu` | `Password123!` |
| 🌐 **Superadmin** | System Overseer | Multi-institution root operator | `superadmin@unitrace.io` | `Password123!` |

---

## ⚡ Quickstart

### Prerequisites
- Node.js 18+ or 20+
- npm

### 1. Clone & Install
```bash
git clone <repo-url>
cd "code flux"
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(Optional: add `GEMINI_API_KEY=your_key` in `.env`. If left empty or invalid, UniTrace automatically uses deterministic mock AI with 100% feature parity).*

### 3. Initialize & Seed Database
```bash
npx prisma db push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎬 9-Scene Golden Demo Walkthrough

Follow this 5-minute storyline to experience the full AI recovery workflow:

1. **Scene 1 — The Discovery (Home Page)**:
   - Visit `/`. Observe campus recovery stats (89% recovery rate, 14m avg recovery time).
   - Click the persona switcher to switch to **Student (Alex Chen)**.

2. **Scene 2 — Reporting Lost Item**:
   - Go to `/report/lost`.
   - Click the **"✨ Load Golden Demo Data"** button to auto-populate the AirPods report with distinctive attributes (blue NASA sticker, minor scuff on corner).
   - Submit the report.

3. **Scene 3 — The Finder's Report**:
   - Switch persona to **Finder (Jamie Taylor)**.
   - Go to `/report/found`.
   - Click **"✨ Load Golden Demo Data"** to auto-populate the found AirPods report at Main Library 2nd Floor.
   - Submit the report.

4. **Scene 4 — AI Multi-Signal Match & Visual Fingerprint**:
   - Switch persona to **Staff (Officer Jenkins)**.
   - Open `/match/match_airpods_apex`.
   - View the side-by-side comparison with **94% match score** and inspect the explainable evidence breakdown (visual overlap, color match, location proximity).

5. **Scene 5 — Interactive UniTrace Journey**:
   - Click **"View UniTrace Journey"** or navigate to `/journey/item_airpods_lost_1`.
   - Observe the interactive SVG campus map showing waypoints from Student Center $\rightarrow$ Central Lawn $\rightarrow$ Main Library.
   - Notice the distinct dashed lines for `AI_INFERRED` path vs solid lines for `OBSERVED` checkpoints.

6. **Scene 6 — Filing an Ownership Claim**:
   - Switch persona back to **Student (Alex Chen)**.
   - Go to `/claims/new?itemId=item_airpods_found_1`.
   - Submit secret verification details: *"NASA worm logo sticker with blue background on top lid, tiny scuff mark on bottom-left"* and lockscreen proof.

7. **Scene 7 — Staff Claim Approval & PIN Generation**:
   - Switch persona to **Staff (Officer Jenkins)**.
   - Go to `/staff/claims`.
   - Review Alex's claim, inspect the zero-knowledge evidence, and click **"Approve Claim"**.
   - The system generates a secure 6-digit handover PIN (`784920`).

8. **Scene 8 — Physical Handover Verification Desk**:
   - Go to `/staff/handover`.
   - Enter Handover PIN `784920` or click **"Load Demo Claim"**.
   - Verify claimant ID and click **"Complete Handover & Release Item"**.
   - The item status automatically updates to `RECOVERED` with an immutable audit record.

9. **Scene 9 — Duplicate Detection & Campus Analytics**:
   - Go to `/staff/clusters` to see duplicate reports automatically clustered (e.g. Hydro Flask reports in Science Hall).
   - Go to `/admin/dashboard` to inspect the campus recovery health score, category distribution, and heatmaps.

---

## 🧪 Automated Testing

UniTrace includes a comprehensive Vitest test suite covering unit math, AI services, state machines, and end-to-end integration:

```bash
# Run all unit and integration tests
npm test

# Run tests in watch mode
npm run test:watch
```

**Test Coverage Summary:**
- `tests/unit/auth.test.ts` — Password hashing, verification, cookie extraction
- `tests/unit/validators.test.ts` — Zod schema validation for reports & claims
- `tests/unit/items.test.ts` — Redaction of private notes & zero-knowledge security
- `tests/unit/ai-vision.test.ts` — Visual fingerprint extraction & cosine similarity
- `tests/unit/matching.test.ts` — Weighted multi-signal matching score computation
- `tests/unit/journey.test.ts` — Sighting timeline sorting & spatial speed sanity
- `tests/unit/duplicates.test.ts` — Duplicate report clustering & score thresholds
- `tests/unit/claims.test.ts` — Claim status machine & 6-digit PIN validation
- `tests/integration/golden-storyline.test.ts` — Complete 9-scene end-to-end lifecycle

---

## 🏗️ Architecture & Project Structure

```
├── app/                        # Next.js 14 App Router
│   ├── (auth)/                 # Login, Register pages
│   ├── admin/                  # Campus intelligence, categories, locations, audit logs
│   ├── api/                    # REST API endpoints (auth, items, match, journey, claims)
│   ├── claims/                 # Ownership verification & claimant claim dashboard
│   ├── dashboard/              # Student / finder personal dashboard
│   ├── journey/                # Sighting timeline & interactive campus map
│   ├── match/                  # Explainable match breakdown & candidate viewer
│   ├── report/                 # Lost and found report submission wizards
│   ├── search/                 # Natural language campus search
│   └── staff/                  # Staff operations, claim verification, custody handover
├── components/                 # Reusable UI components (Navbar, Persona Switcher, Map)
├── lib/                        # Core backend libraries & domain logic
│   ├── ai/                     # Gemini provider, mock AI fallback, vector store
│   ├── auth.ts                 # Session tokens & RBAC permissions
│   ├── claims/                 # Verification state machine & PIN generator
│   ├── duplicates/             # DBSCAN-style report clusterer & merger
│   ├── journey/                # Trajectory tracker & spatial waypoint interpolation
│   ├── matching/               # Multi-signal weighted scorer & evidence builder
│   └── prisma.ts               # Prisma ORM client singleton
├── prisma/                     # Database schema & Apex University seed script
├── public/                     # Static assets & sample item images
└── tests/                      # Unit & integration test suites
```

---

## 🔒 Security & Privacy Architecture

1. **Zero-Knowledge Field Redaction**: Sensitive attributes (`serialNumber`, `privateNotes`, `secretQuestions`) are stripped from public API responses and only visible to verified staff and the original reporter.
2. **Role-Based Access Control (RBAC)**: Strict permission boundaries enforcing `STUDENT`, `FINDER`, `STAFF`, `ADMIN`, and `SUPERADMIN` access tiers.
3. **Tamper-Resistant Handover**: High-value items cannot be released without matching claimant identification and verification of the cryptographically generated 6-digit Handover PIN.
4. **Immutable Audit Trails**: Every status transition, report merge, and physical custody transfer is permanently recorded with actor ID, timestamp, and IP.

---

## 📄 License

UniTrace is open source under the [MIT License](LICENSE).
