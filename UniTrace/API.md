# UniTrace — API Specification

## 1. Design Standards

* **Base URL**: `/api`
* **Content-Type**: `application/json` (or `multipart/form-data` for file intake)
* **Authentication**: Session cookie (`unitrace_session`) containing cryptographic token
* **Standard Response Envelope**:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2026-09-10T19:50:00.000Z",
    "requestId": "req_c7a91bf4"
  }
}
```

* **Standard Error Envelope**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED | NOT_FOUND | VALIDATION_ERROR | FORBIDDEN | RATE_LIMITED",
    "message": "Human-readable explanation",
    "details": [ ... ]
  }
}
```

---

## 2. Authentication & Identity Endpoints

* `POST /api/auth/register` — Register a new student or general user account.
* `POST /api/auth/login` — Authenticate user and issue secure HTTP-only session cookie.
* `POST /api/auth/logout` — Revoke active session token and clear cookies.
* `GET /api/auth/me` — Return authenticated user profile, permissions, and active institution context.

---

## 3. Items & Reports Endpoints

* `GET /api/items` — Query lost & found items with filter parameters:
  * `type`: `LOST` | `FOUND`
  * `categoryId`: string
  * `locationId`: string
  * `status`: `ACTIVE` | `MATCH_PENDING` | `RECOVERED` | `CLOSED`
  * `query`: Natural language search query
  * `page`, `limit`: Pagination controls
* `POST /api/items` — Submit a new Lost or Found report (supports JSON metadata and image URL).
* `GET /api/items/:id` — Retrieve full item details (redacting private owner details for unauthorized viewers).
* `PATCH /api/items/:id` — Update report details or status (staff or author only).
* `POST /api/items/upload` — Multipart image upload handler (validates MIME, size, optimizes thumbnail).

---

## 4. Matching & Intelligence Endpoints

* `GET /api/match/candidates/:itemId` — Fetch ranked matching candidates for a given lost or found item.
* `GET /api/match/:id` — Retrieve full side-by-side match breakdown, sub-scores, and explainable evidence.
* `POST /api/match/:id/review` — Staff endpoint to confirm or dismiss a candidate match.
* `POST /api/match/recalculate` — Trigger on-demand re-scoring for an item against the active pool.

---

## 5. Probable Item Journey Endpoints

* `GET /api/journey/:itemId` — Retrieve chronological sequence of sightings (observed and AI-inferred).
* `POST /api/journey/sightings` — Record a new physical sighting (staff or campus witness).
* `POST /api/journey/infer-path` — Request AI spatial-temporal trajectory interpolation between sightings.

---

## 6. Ownership Verification & Claims Endpoints

* `POST /api/claims` — Claimant submits an initial ownership claim on a found item.
* `GET /api/claims/my` — Claimant lists all active and past claims.
* `GET /api/claims/queue` — Staff review queue for pending verification submissions.
* `GET /api/claims/:id` — Retrieve full claim details, private answers, and uploaded proof documents.
* `POST /api/claims/:id/verify` — Staff approves, requests additional info, or rejects claim.
* `POST /api/claims/:id/handover` — Staff records physical handover, verifies PIN, and closes case.

---

## 7. Duplicate Detection & Clustering Endpoints

* `GET /api/duplicates/clusters` — Retrieve detected duplicate clusters awaiting staff review.
* `POST /api/duplicates/merge` — Merge multiple reports into a single canonical record with full audit trail.
* `POST /api/duplicates/dismiss` — Dismiss a false-positive duplicate cluster.

---

## 8. Campus Administration & Metrics Endpoints

* `GET /api/admin/metrics` — Aggregate intelligence KPIs (recovery rate, turnaround time, category trends).
* `GET /api/admin/locations` — Manage campus buildings, floors, and geo-coordinates.
* `POST /api/admin/locations` — Create or update campus locations.
* `GET /api/admin/audit-logs` — Immutable audit log inspection.
