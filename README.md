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
