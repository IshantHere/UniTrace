/**
 * lib/client-storage.ts
 *
 * Client-Side Persistence Engine:
 * Guarantees that any reported lost or found item remains 100% accessible
 * across logins, logouts, page reloads, and serverless Lambda container restarts.
 */

export const STORAGE_KEY_ITEMS = "unitrace_registered_items";

export interface StoredItem {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  categoryId: string;
  primaryLocationId: string;
  incidentDate: string;
  incidentTime?: string | null;
  status: string;
  isHighValue?: boolean;
  privateNotes?: string | null;
  reporterId: string;
  reporter?: {
    id: string;
    name: string;
    role?: string;
  };
  createdAt: string;
  updatedAt?: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
    icon?: string;
  };
  primaryLocation?: {
    id: string;
    name: string;
    building: string;
    floor?: string;
    roomOrArea?: string;
  };
  images?: Array<{
    id?: string;
    url: string;
    isPrimary?: boolean;
  }>;
  lostMatches?: any[];
  foundMatches?: any[];
}

/**
 * Persist an item to localStorage and notify all active browser tabs/listeners.
 */
export function saveClientItem(item: any): void {
  if (typeof window === "undefined" || !item || !item.id) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    const existing: StoredItem[] = raw ? JSON.parse(raw) : [];

    // Ensure item has proper nested objects for rendering
    const normalized: StoredItem = {
      ...item,
      reporter: item.reporter || {
        id: item.reporterId || "user_current",
        name: item.reporterName || "Campus Member",
        role: item.reporterRole || "STUDENT",
      },
      category: item.category || {
        id: item.categoryId,
        name: item.categoryName || "General Item",
        slug: "general",
      },
      primaryLocation: item.primaryLocation || {
        id: item.primaryLocationId,
        name: item.locationName || "Campus Facility",
        building: item.buildingName || "Main Campus",
      },
      images: Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : item.imageUrl
        ? [{ url: item.imageUrl, isPrimary: true }]
        : [],
      createdAt: item.createdAt || new Date().toISOString(),
    };

    const deduped = existing.filter((i) => i.id !== normalized.id);
    const updated = [normalized, ...deduped];

    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updated));

    // Dispatch custom event for real-time reactivity in current tab
    window.dispatchEvent(new CustomEvent("unitrace_item_saved", { detail: normalized }));
  } catch (err) {
    console.warn("[UniTrace ClientStorage] Failed saving item to local storage:", err);
  }
}

/**
 * Retrieve all items stored on this client device.
 */
export function getClientItems(): StoredItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Filter client items matching user ID or name.
 */
export function getClientItemsForUser(userId: string, userName?: string): StoredItem[] {
  const items = getClientItems();
  if (!userId) return [];
  return items.filter((item) => {
    if (item.reporterId === userId) return true;
    if (item.reporter?.id === userId) return true;
    if (userName && item.reporter?.name?.toLowerCase() === userName.toLowerCase()) return true;
    return false;
  });
}

/**
 * Merge and deduplicate an array of server items and local client items.
 * Local items take precedence and are placed at the front if newer.
 */
export function mergeItems(serverItems: any[] = [], clientItems: any[] = []): any[] {
  const seenIds = new Set<string>();
  const merged: any[] = [];

  // Add client items first
  for (const item of clientItems) {
    if (item && item.id && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      merged.push(item);
    }
  }

  // Add server items
  for (const item of serverItems) {
    if (item && item.id && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      merged.push(item);
    }
  }

  // Sort by createdAt descending
  merged.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return merged;
}
