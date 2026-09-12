# UniTrace — Security & Privacy Architecture

## 1. Core Security Tenets

UniTrace processes high-value personal assets, sensitive location sightings, and personal identification records. The security model enforces **Defense-in-Depth**:
1. **Never Expose Sensitive Marks Publicly**: Found item listings omit private distinguishing marks, serial numbers, and sensitive verification answers to prevent fraudulent claims.
2. **Server-Side Authorization (RBAC)**: All API routes and server actions validate permissions on the server. Client-side navigation guards are strictly UX helpers.
3. **Cryptographic Integrity**: Session tokens are stored using high-entropy random bytes hashed with SHA-256 in the database. Passwords are keyed using salted `bcrypt` hashes.
4. **Audit Immutability**: All claim reviews, status modifications, merges, and handovers generate immutable `AuditLog` rows.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Public / Anon | Student / User | Staff / Security | Campus Admin | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| View Public Found Listings | ✅ (Redacted) | ✅ (Redacted) | ✅ (Unredacted) | ✅ (Unredacted) | ✅ |
| Report Lost Item | ❌ | ✅ (Own) | ✅ (Any) | ✅ | ✅ |
| Report Found Item | ❌ | ✅ (Own) | ✅ (Any) | ✅ | ✅ |
| View Candidate Matches | ❌ | ✅ (Own reports) | ✅ (All) | ✅ | ✅ |
| Submit Ownership Claim | ❌ | ✅ | ❌ (Self-dealing restricted) | ❌ | ❌ |
| Review & Verify Claims | ❌ | ❌ | ✅ | ✅ | ✅ |
| Execute Physical Handover | ❌ | ❌ | ✅ | ✅ | ✅ |
| Review Duplicate Clusters | ❌ | ❌ | ✅ | ✅ | ✅ |
| Execute Report Merge | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Locations & Categories | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Institutional Analytics | ❌ | ❌ | Read-Only | ✅ | ✅ |
| View Audit Logs | ❌ | ❌ | Read-Only | ✅ | ✅ |
| Multi-Tenant Management | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Zero-Knowledge Ownership Verification

To prevent "social engineering" where an unauthorized user claims a found laptop by reading public description details:
* Public listings only display high-level attributes (e.g., "Silver Laptop, 13-inch, found in Library").
* The original finder or intake officer records specific verification questions (e.g. *"What sticker is on the underside?"*, *"What color is the protective silicone sleeve?"*, *"What are the last 4 digits of the serial number?"*).
* Claimants must answer these privately without seeing hints.
* Claimants can upload proof of purchase or prior personal photos of the item.
* Staff reviews answers in a secure backoffice portal before scheduling handover.

---

## 4. Safe File Upload & Media Handling

* **Whitelisted MIME Types**: `image/jpeg`, `image/png`, `image/webp`.
* **Max Payload**: 5MB per image.
* **Content Validation**: File magic bytes inspection to prevent extension spoofing.
* **Sanitization**: Filenames are regenerated with UUIDs to prevent directory traversal (`../../`).
* **Storage Isolation**: Uploads are stored in isolated paths with no executable permissions.

---

## 5. Privacy Protection & PII Safeguards

* Claimant contact phone numbers, student IDs, and home emails are strictly hidden from other students and finders.
* In-app status updates and controlled notifications are used for communications.
* Finder and claimant never exchange raw PII unless explicitly authorized during an official in-person handover at a verified Security Desk.
