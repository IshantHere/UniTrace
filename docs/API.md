# UniTrace — API Reference

See the root [`API.md`](../API.md) for full architectural design and contracts.

### Quick Endpoint Reference

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register new campus account |
| POST | `/api/auth/login` | Public | Authenticate session and set cookie |
| POST | `/api/auth/logout` | Session | Revoke active session |
| GET | `/api/auth/me` | Session | Get active user profile and institution |
| GET | `/api/items` | Public | Search lost & found items with filters |
| POST | `/api/items` | User | Report a lost or found item |
| GET | `/api/items/:id` | Public | View item details (redacting private details) |
| POST | `/api/items/upload` | User | Upload image evidence |
| GET | `/api/match/:id` | Session | View side-by-side match breakdown & evidence |
| GET | `/api/match/candidates/:itemId` | Session | Get ranked candidates for item |
| GET | `/api/journey/:itemId` | Public | Get chronological sightings & AI journey trajectory |
| POST | `/api/journey/sightings` | Staff/User | Record physical sighting or waypoint |
| GET | `/api/duplicates/clusters` | Staff | View detected duplicate report clusters |
| POST | `/api/duplicates/merge` | Staff | Merge duplicate reports into canonical item |
| POST | `/api/claims` | User | Submit ownership claim with verification proof |
| GET | `/api/claims` | Session | List claims (claimant or staff queue) |
| POST | `/api/claims/:id/verify` | Staff | Approve / reject ownership claim & issue PIN |
| POST | `/api/claims/:id/handover` | Staff | Record physical handover & release item |
| GET | `/api/analytics` | Admin | Query campus recovery intelligence metrics |
