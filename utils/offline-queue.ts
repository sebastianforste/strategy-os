/**
 * OFFLINE QUEUE SERVICE - 2027 Edge/PWA Enhancement
 * 
 * IndexedDB-based queue for drafts created while offline.
 * Features:
 * - Store drafts locally when offline
 * - Sync with server when back online
 * - Background sync via Service Worker
 */

// --- TYPES ---

export interface OfflineDraft {
  id: string;
  timestamp: number;
  input: string;
  personaId: string;
  platform: "linkedin" | "twitter";
  status: "pending" | "syncing" | "synced" | "failed";
  result?: {
    textPost: string;
    imagePrompt?: string;
  };
}

const DB_NAME = "strategyos-offline";
const DB_VERSION = 1;
const STORE_NAME = "drafts";

// --- DATABASE UTILITIES ---

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

// --- PUBLIC API ---

/**
 * QUEUE DRAFT FOR OFFLINE PROCESSING
 * -----------------------------------
 * Saves a draft to IndexedDB when offline.
 */
export async function queueDraft(
  input: string,
  personaId: string,
  platform: "linkedin" | "twitter"
): Promise<OfflineDraft> {
  const db = await openDB();
  
  const draft: OfflineDraft = {
    id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    input,
    personaId,
    platform,
    status: "pending"
  };
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(draft);
    
    request.onsuccess = () => {
      console.log(`[Offline Queue] Draft queued: ${draft.id}`);
      resolve(draft);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * GET ALL PENDING DRAFTS
 * ----------------------
 * Retrieves all drafts that haven't been synced yet.
 */
export async function getPendingDrafts(): Promise<OfflineDraft[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("status");
    const request = index.getAll("pending");
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * GET ALL DRAFTS
 * --------------
 * Retrieves all drafts regardless of status.
 */
export async function getAllDrafts(): Promise<OfflineDraft[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
      // Sort by timestamp descending
      const drafts = request.result as OfflineDraft[];
      drafts.sort((a, b) => b.timestamp - a.timestamp);
      resolve(drafts);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * UPDATE DRAFT STATUS
 * -------------------
 * Updates the status of a draft after sync attempt.
 */
export async function updateDraftStatus(
  id: string,
  status: OfflineDraft["status"],
  result?: OfflineDraft["result"]
): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const draft = getRequest.result;
      if (draft) {
        draft.status = status;
        if (result) draft.result = result;
        
        const updateRequest = store.put(draft);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error(`Draft not found: ${id}`));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * DELETE DRAFT
 * ------------
 * Removes a draft from the queue.
 */
export async function deleteDraft(id: string): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * CHECK IF ONLINE
 * ---------------
 * Utility to check network status.
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * REGISTER SYNC LISTENER
 * ----------------------
 * Listens for online status and triggers sync.
 */
export function registerOnlineSyncListener(
  onSync: () => Promise<void>
): () => void {
  if (typeof window === "undefined") return () => {};
  
  const handler = async () => {
    console.log("[Offline Queue] Online detected, syncing...");
    await onSync();
  };
  
  window.addEventListener("online", handler);
  
  // Return cleanup function
  return () => window.removeEventListener("online", handler);
}
