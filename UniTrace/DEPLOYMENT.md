# UniTrace — Production Deployment Guide

## 1. Production Requirements

* **Node.js**: v18.17.0+ or v20+ (LTS recommended)
* **Database**: PostgreSQL 15+ with `pgvector` extension (or standard SQLite for zero-setup dev)
* **AI Provider**: Google Gemini API Key (`GEMINI_API_KEY`)
* **Object Storage**: Local filesystem storage (default) or S3-compatible cloud bucket (AWS S3, Cloudflare R2, MinIO)

---

## 2. Environment Configuration (`.env`)

```env
# Database Configuration
DATABASE_URL="file:./dev.db" # Or "postgresql://postgres:password@localhost:5432/unitrace?schema=public"

# Security & Session Authentication
AUTH_SECRET="your-32-character-random-secret-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Intelligence Subsystem
GEMINI_API_KEY="" # Provide your Google AI Studio API key
AI_PROVIDER="gemini" # Options: "gemini" | "mock"

# Optional Cloud Storage & Mailer
STORAGE_PROVIDER="local" # Options: "local" | "s3"
RESEND_API_KEY=""
EMAIL_FROM="UniTrace Campus Alerts <no-reply@unitrace.edu>"

# Feature Flags & Demo Mode
ENABLE_DEMO_SEED=true
NEXT_PUBLIC_MAP_PROVIDER="campus-svg" # Options: "campus-svg" | "google-maps"
```

---

## 3. Production Build & Execution

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Synchronize database schema
npx prisma db push

# 4. Populate demo seed data
npm run db:seed

# 5. Build optimized Next.js bundle
npm run build

# 6. Start production server
npm run start
```

---

## 4. Health Checks & Observability

* **Liveness Probe**: `GET /api/meta` returns `status: "ok"`, timestamp, and version.
* **Database Ping**: Verifies connection pool health and response latency.
* **AI Health**: Verifies connectivity with Gemini API or active fallback.
