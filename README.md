# UniTrace — Campus Lost & Found Intelligence Platform

> **AI-powered campus lost-and-found intelligence platform combining visual fingerprinting, journey tracking, and zero-knowledge ownership verification.**

🌐 **Live Demo:** [https://uni-trace-delta.vercel.app](https://uni-trace-delta.vercel.app)

---

## ⚡ Overview

UniTrace transforms traditional campus lost-and-found into an intelligent operational network. Built for university campuses, it replaces disorganized lost-and-found boxes with automated visual matching, spatio-temporal journey tracking, and cryptographically verified handovers.

### Key Capabilities
- 👁️ **Visual Fingerprint Matching:** Analyzes photos to detect unique stickers, scratches, logos, and distinct wear patterns.
- 🗺️ **UniTrace Journey:** Visualizes item movement across campus on an interactive map, clearly differentiating verified physical checkpoints (`OBSERVED`) from AI trajectory estimates (`AI_INFERRED`).
- 🔐 **Zero-Knowledge Ownership Verification:** Protects sensitive item details (serial numbers, private markings) and requires claimants to prove ownership before issuing a secure 6-digit handover PIN.
- 🏆 **Finder Rewards & Leaderboard:** Campus credit economy that rewards honest finders with reputation points and campus dining/bookstore credits.
- 🛡️ **Staff Operations & Handover Desk:** Streamlined triage interface for security staff to review AI matches, verify claims, resolve duplicates, and safely transfer physical custody.

---

## 👥 Demo Accounts (Newton University)

All test personas use password: **`Newton123!`**

| Role | Name | Email | Access |
| :--- | :--- | :--- | :--- |
| 🎓 **Student / Owner** | Ishant Singh | `student@newton.edu` | Report lost items, view matches, track journey, file claims |
| 🔍 **Finder** | Garvit Chahal | `finder@newton.edu` | Report found items, earn credits, view finder leaderboard |
| 🛡️ **Campus Staff** | Vijay Kumar | `staff@newton.edu` | Triage incoming reports, review AI matches, execute handovers |
| ⚙️ **Administrator** | Anil Sharma | `admin@newton.edu` | Executive analytics, recovery metrics, audit logs |

*(A 1-click test credential selector is also available on the [Login Page](https://uni-trace-delta.vercel.app/login)).*

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Swiss monochrome precision design system)
- **Database & ORM:** [Prisma ORM](https://www.prisma.io/) with SQLite (Serverless `/tmp` bridge for zero-config deployment)
- **Authentication:** Stateless HMAC-SHA256 signed session tokens
- **Icons:** [Lucide React](https://lucide.dev/)
- **Testing:** [Vitest](https://vitest.dev/) (61 passing unit & integration tests)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm / pnpm / yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/IshantHere/UniTrace.git
   cd UniTrace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Initialize database & seed demo data:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run the automated test suite covering authentication, AI matching, journey reconstruction, rewards, and claim lifecycles:

```bash
npm test
```

All 61 unit and integration tests validate the platform against real-world campus scenarios.

---

## 📁 Repository Structure

```
├── app/                  # Next.js 14 App Router pages & API endpoints
│   ├── (auth)/           # Login & registration portals
│   ├── admin/            # Executive analytics & audit logs
│   ├── api/              # RESTful API endpoints (auth, items, match, journey, claims)
│   ├── dashboard/        # Student / finder workspace
│   ├── journey/          # Campus map & trajectory reconstruction
│   ├── leaderboard/      # Finder reputation & campus credit rankings
│   ├── match/            # Side-by-side explainable AI matching screen
│   ├── report/           # Lost and found reporting workflows
│   ├── search/           # Campus lost & found registry search
│   └── staff/            # Security staff triage & custody handover desk
├── components/           # Reusable UI widgets & navigation
├── lib/                  # Core domain logic (auth, matching, vision, rewards)
├── prisma/               # Schema definition & Newton University seed dataset
├── public/               # Static assets & item photography
└── tests/                # Vitest unit & integration test suites
```

---

## 📄 License

This project is licensed under the MIT License.
