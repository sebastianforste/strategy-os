/**
 * AUDIT SERVICE - 2027 Security & Compliance Hardening
 * 
 * Comprehensive audit logging for all AI generations.
 * Features:
 * - Immutable audit trail
 * - Export for compliance review
 * - Retention policies
 */

// --- TYPES ---

export interface AuditEntry {
  id: string;
  timestamp: number;
  action: "generate" | "generate_complete" | "refine" | "predict" | "post" | "research" | "council";
  input: string;
  output: string;
  personaId: string;
  platform: string;
  apiUsed: string; // e.g., "gemini-flash"
  durationMs: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface AuditExport {
  exportedAt: string;
  totalEntries: number;
  dateRange: { from: string; to: string };
  entries: AuditEntry[];
}

const DB_NAME = "strategyos-audit";
const DB_VERSION = 1;
const STORE_NAME = "logs";
const MAX_ENTRIES = 10000; // Retention limit

import { AI_CONFIG } from "./config";

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
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("action", "action", { unique: false });
      }
    };
  });
}

// --- DATABASE WRAPPERS ---

async function withStore<T>(
  mode: "readonly" | "readwrite", 
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = callback(store);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- PUBLIC API ---

/**
 * LOG AUDIT ENTRY
 * ---------------
 * Records an action to the audit log.
 */
export async function logAudit(options: {
  action: AuditEntry["action"];
  input: string;
  output: string;
  personaId: string;
  platform: string;
  durationMs: number;
  metadata?: AuditEntry["metadata"];
}): Promise<AuditEntry> {
  const { action, input, output, personaId, platform, durationMs, metadata } = options;
  
  const entry: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    action,
    input: input.substring(0, 1000), // Limit input size
    output: output.substring(0, 2000), // Limit output size
    personaId,
    platform,
    apiUsed: AI_CONFIG.primaryModel, 
    durationMs,
    metadata
  };
  
  await withStore("readwrite", (store) => store.add(entry));
  console.log(`[Audit] Logged: ${entry.action} (${entry.id})`);
  return entry;
}

/**
 * GET AUDIT LOGS
 * --------------
 * Retrieves audit logs with optional filtering.
 */
export async function getAuditLogs(options: {
  action?: AuditEntry["action"];
  from?: number;
  to?: number;
  limit?: number;
} = {}): Promise<AuditEntry[]> {
  const { action, from, to, limit = 100 } = options;
  
  let entries = await withStore<AuditEntry[]>("readonly", (store) => {
    if (action) {
      return store.index("action").getAll(action);
    }
    return store.getAll();
  });

  // Apply date filters
  if (from) entries = entries.filter(e => e.timestamp >= from);
  if (to) entries = entries.filter(e => e.timestamp <= to);
  
  // Sort by timestamp descending and limit
  return entries
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

/**
 * EXPORT AUDIT LOGS
 * -----------------
 * Exports logs as JSON for compliance review.
 */
export async function exportAuditLogs(
  from?: Date,
  to?: Date
): Promise<AuditExport> {
  const entries = await getAuditLogs({
    from: from?.getTime(),
    to: to?.getTime(),
    limit: MAX_ENTRIES
  });
  
  const timestamps = entries.map(e => e.timestamp);
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  
  return {
    exportedAt: new Date().toISOString(),
    totalEntries: entries.length,
    dateRange: {
      from: new Date(minTime).toISOString(),
      to: new Date(maxTime).toISOString()
    },
    entries
  };
}

/**
 * EXPORT AS CSV
 * -------------
 * Converts audit logs to CSV format.
 */
export async function exportAuditAsCSV(from?: Date, to?: Date): Promise<string> {
  const data = await exportAuditLogs(from, to);
  
  const headers = ["id", "timestamp", "action", "personaId", "platform", "apiUsed", "durationMs", "input", "output"];
  const rows = data.entries.map(e => [
    e.id,
    new Date(e.timestamp).toISOString(),
    e.action,
    e.personaId,
    e.platform,
    e.apiUsed,
    e.durationMs,
    `"${e.input.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    `"${e.output.replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ]);
  
  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}

/**
 * GET AUDIT STATS
 * ---------------
 * Returns summary statistics.
 */
export async function getAuditStats(): Promise<{
  totalLogs: number;
  byAction: Record<string, number>;
  avgDuration: number;
}> {
  const entries = await getAuditLogs({ limit: MAX_ENTRIES });
  
  const byAction: Record<string, number> = {};
  let totalDuration = 0;
  
  entries.forEach(e => {
    byAction[e.action] = (byAction[e.action] || 0) + 1;
    totalDuration += e.durationMs;
  });
  
  return {
    totalLogs: entries.length,
    byAction,
    avgDuration: entries.length > 0 ? Math.round(totalDuration / entries.length) : 0
  };
}

/**
 * CLEANUP OLD LOGS
 * ----------------
 * Removes logs older than retention period.
 */
export async function cleanupOldLogs(retentionDays: number = 90): Promise<number> {
  const db = await openDB();
  const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("timestamp");
    const range = IDBKeyRange.upperBound(cutoff);
    const request = index.openCursor(range);
    
    let deleted = 0;
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        deleted++;
        cursor.continue();
      } else {
        console.log(`[Audit] Cleaned up ${deleted} old entries`);
        resolve(deleted);
      }
    };
    request.onerror = () => reject(request.error);
  });
}
