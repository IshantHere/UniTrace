/**
 * lib/realtime/bus.ts
 *
 * In-memory Event Bus singleton for Next.js 14 App Router.
 * Connects background server-side AI matching and claims processing
 * with active client Server-Sent Events (SSE) connections.
 */

import { EventEmitter } from "events";

export interface RealtimeMatchEvent {
  matchId: string;
  lostItemId: string;
  foundItemId: string;
  itemTitle: string;
  itemImage?: string;
  score: number; // e.g. 0.94
  confidenceTier: string; // "EXCEPTIONAL", "HIGH", etc.
  locationName: string;
  recipientUserId: string;
  timestamp: string;
}

export interface RealtimeClaimEvent {
  claimId: string;
  itemId: string;
  itemTitle: string;
  status: string;
  recipientUserId: string;
  handoverCode?: string;
  timestamp: string;
}

class NotificationBus extends EventEmitter {
  constructor() {
    super();
    // Allow multiple concurrent browser connections without EventEmitter memory leak warnings
    this.setMaxListeners(100);
  }
}

// Preserve singleton across Next.js dev hot-reloads
const globalForBus = globalThis as unknown as { notificationBus?: NotificationBus };
export const bus = globalForBus.notificationBus ?? new NotificationBus();
if (process.env.NODE_ENV !== "production") globalForBus.notificationBus = bus;

/**
 * Emit a high-confidence match event to all connected clients.
 */
export function emitMatchFound(event: RealtimeMatchEvent): void {
  bus.emit("match_detected", event);
}

/**
 * Emit an ownership claim lifecycle update event.
 */
export function emitClaimStatusChanged(event: RealtimeClaimEvent): void {
  bus.emit("claim_updated", event);
}
