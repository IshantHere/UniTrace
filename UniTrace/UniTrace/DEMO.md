# UniTrace — Demo Storyline & Seed Data Guide

## 1. Golden Demo Storyline: "The Lost AirPods Case"

UniTrace includes a turnkey, end-to-end demo storyline that showcases the platform's signature capabilities:

### Scene 1: The Loss
* **Character**: Alex Sharma (Student, ID: `STU-2024-8841`)
* **Incident**: Loses a white Apple AirPods Pro case with a distinctive circular blue sticker on the lid and a minor bottom scuff near the Main Library around 4:30 PM.
* **Action**: Alex reports the lost item on UniTrace, typing natural language: *"Lost my white AirPods case near the library steps around 4:30 PM. Has a small blue sticker on top."* and uploads a photo.

### Scene 2: AI Visual Fingerprinting
* The AI Vision engine analyzes the photo and extracts a structured fingerprint:
  * Brand: Apple (Confidence: 0.95)
  * Primary Color: White (Confidence: 0.99)
  * Unique Mark: Small circular blue sticker on top lid (Confidence: 0.92)
  * Condition: Minor surface scuff near bottom hinge (Confidence: 0.84)

### Scene 3: Multimodal Candidate Retrieval & Scoring
* A student worker at the Library Entrance reported finding a *"white wireless earbuds case"* at 5:05 PM (Found Report `FND-1049`).
* UniTrace calculates a composite match score: **94% (Exceptional Match)**.
* Signals evaluated:
  * Visual similarity: 0.96
  * Semantic text similarity: 0.92
  * Attribute overlap (Color, Brand, Blue Sticker): 0.95
  * Spatial proximity: 140 meters (Library -> Library Entrance: 0.95)
  * Temporal compatibility: 35 minutes difference (0.92)

### Scene 4: Side-by-Side Match Inspection
* Alex receives an instant notification: *"High-Confidence Match Found!"*
* Opens Match Details page: side-by-side comparison of lost vs found photo, clear green checkmarks for matching attributes, and explainable evidence.

### Scene 5: Probable Item Journey (Trace Item)
* Alex clicks **"Trace Item Journey"**.
* Interactive timeline shows:
  1. `4:30 PM` — **OBSERVED**: Lost at Main Library Steps (Reporter: Alex)
  2. `5:05 PM` — **OBSERVED**: Found at Library Entrance Desk (Reporter: Campus Monitor)
  3. `5:20 PM` — **AI-INFERRED**: Transit via Central Walkway toward Security Hub (Confidence: 82%)
  4. `5:40 PM` — **OBSERVED**: Logged into Secure Locker at Central Security Desk (Officer: David Vance)

### Scene 6: Zero-Knowledge Ownership Verification
* Alex clicks **"Claim This Item"**.
* System prompts: *"To verify you are the rightful owner, please answer: What distinctive marking or sticker is on the case?"*
* Alex inputs: *"Circular blue sticker on the top lid, slight pencil mark near the back."*
* Verification submitted into Staff Queue.

### Scene 7: Staff Review & Handover
* Officer David Vance opens Staff Claims Queue.
* Inspects Alex's private answer against intake inspection record.
* Clicks **"Approve Claim"** -> System generates Handover PIN `RC-8841`.
* Alex presents Student ID and PIN at Central Security Desk.
* Officer marks **"Handover Complete"**.
* Item transitions to `RECOVERED`. Alex's dashboard updates in real time.

---

## 2. Seed Accounts & Credentials

All demo accounts use the standard password: `Password123!`

| Role | Name | Email | Persona / Responsibilities |
| :--- | :--- | :--- | :--- |
| **Student** | Alex Sharma | `student@apex.edu` | Primary lost item reporter & claimant |
| **Student (Finder)** | Maya Lin | `finder@apex.edu` | Campus Good Samaritan reporting found items |
| **Staff** | Officer David Vance | `staff@apex.edu` | Security desk officer managing claims & handovers |
| **Admin** | Dean Sarah Jenkins | `admin@apex.edu` | Campus Administrator monitoring intelligence KPIs |
| **Super Admin** | System Root | `superadmin@unitrace.io` | Global multi-tenant SaaS administrator |
