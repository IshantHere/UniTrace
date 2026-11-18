# UniTrace — Production Deployment Guide

## 1. Production Requirements

* **Node.js**: v18.17.0+ or v20+ (LTS recommended)
* **Database**: Local SQLite for development and demos
* **AI Provider**: Google Gemini API Key (`GEMINI_API_KEY`)
* **Object Storage**: Local filesystem storage (default) or S3-compatible cloud bucket (AWS S3, Cloudflare R2, MinIO)

---

## 2. Environment Configuration (`.env`)

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

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

# 3. Synchronize the local SQLite schema
npm run db:push

# 4. Optional: seed a new, isolated demo database only
npm run db:seed

# 5. Build optimized Next.js bundle (does not modify or seed the database)
npm run build

# 6. Start production server
npm run start
```

The current Prisma schema is configured for SQLite, which is suitable for local development and demos but is not persistent across serverless deployments. Production hosting requires a separate PostgreSQL configuration and migration before deployment. The demo seed includes publicly documented demo accounts; never run it against a database containing real users or reports.

---

## 4. Health Checks & Observability

* **Liveness Probe**: `GET /api/meta` returns `status: "ok"`, timestamp, and version.
* **Database Ping**: Verifies connection pool health and response latency.
* **AI Health**: Verifies connectivity with Gemini API or active fallback.
