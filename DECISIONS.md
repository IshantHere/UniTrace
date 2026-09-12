# UniTrace — Architecture Decisions & Trade-offs (ADR)

## ADR 001: Next.js 14 App Router as Unified Full-Stack Platform

* **Context**: Need a responsive, high-performance web platform that serves public landing pages, student portals, staff operations, and secure API routes.
* **Decision**: Adopt Next.js 14 with App Router, React Server Components (RSC), and Server Actions / API routes.
* **Consequences**: Single codebase eliminates API synchronization drift; React Server Components enable instant server-side data fetching and SEO; Tailwind CSS provides a cohesive institutional design system.

---

## ADR 002: Dual Database Strategy (Prisma ORM with SQLite for zero-setup dev, PostgreSQL for production)

* **Context**: Production requirements specify PostgreSQL with pgvector. However, local developer environments, CI pipelines, and quick-start evaluations may lack local PostgreSQL or Docker daemons installed on the developer's machine (verified on current host).
* **Decision**: Architect the data model using Prisma ORM with standard relational SQL types compatible with both PostgreSQL and SQLite. For production, the database URL points to PostgreSQL with pgvector. For local zero-friction execution, SQLite (`dev.db`) is supported with a built-in TypeScript vector similarity calculation service.
* **Consequences**: Zero friction during setup and testing; 100% portability to PostgreSQL in production with zero schema rework.

---

## ADR 003: AI Provider Abstraction Layer

* **Context**: The platform relies on Gemini for image understanding and vector generation, but must not be tightly coupled to a single vendor or fail when offline/unbilled during automated testing.
* **Decision**: Abstract all AI capabilities behind `AIService`, `VisionService`, and `EmbeddingService` interfaces. Include both the live Google Gemini implementation and a deterministic `MockAIService` provider.
* **Consequences**: Seamless switching between live Gemini and deterministic mock providers for testing; future support for local models (e.g. Gemma 4 / Ollama) without modifying business logic.

---

## ADR 004: Multi-Signal Matching Formulation over Pure Vector Cosine

* **Context**: Generic vector similarity often fails to capture crucial real-world discriminators (e.g., two black laptops look visually similar in embeddings, but one has a unique red sticker, was lost in a different building 5 days earlier).
* **Decision**: Construct a composite weighted scoring engine combining Visual Similarity (30%), Semantic Text Similarity (25%), Structured Attribute & Feature Intersections (20%), Spatial Proximity (15%), and Temporal Decay (10%).
* **Consequences**: Drastically lower false-positive rates, transparent explainability for students and security officers, and tunable scoring weights.

---

## ADR 005: Explicit Distinction Between OBSERVED and AI-INFERRED Journey Events

* **Context**: Reconstructing the probable movement of lost items across campus buildings is a signature feature, but presenting algorithmic guesses as ground truth risks liability and campus confusion.
* **Decision**: Tag every timeline checkpoint explicitly as `OBSERVED` (human report with verified timestamp and location) or `AI_INFERRED` (spatio-temporal path interpolation). Visual styles and badges in the UI clearly convey this distinction.
* **Consequences**: High operational trust, safety compliance, and clear communication with security staff.
