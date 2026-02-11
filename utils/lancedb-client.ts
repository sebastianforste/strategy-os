import * as lancedb from "@lancedb/lancedb";
import fs from "fs";
import path from "path";

/**
 * Shared LanceDB Client
 * ---------------------
 * Standardizes database connections across StrategyOS memory modules.
 */

const globalForLance = global as unknown as { 
  dbInstances: Record<string, lancedb.Connection> 
};

if (!globalForLance.dbInstances) {
  globalForLance.dbInstances = {};
}

/**
 * Gets or creates a LanceDB connection for a specific path.
 */
export async function getLanceDB(dbPath: string): Promise<lancedb.Connection> {
  if (!globalForLance.dbInstances[dbPath]) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    globalForLance.dbInstances[dbPath] = await lancedb.connect(dbPath);
  }
  return globalForLance.dbInstances[dbPath];
}

/**
 * Helper to open or create a table.
 */
export async function openOrCreateTable(
  db: lancedb.Connection, 
  tableName: string, 
  data: any[]
): Promise<lancedb.Table> {
  const tableNames = await db.tableNames();
  if (tableNames.includes(tableName)) {
    return await db.openTable(tableName);
  } else {
    return await db.createTable(tableName, data);
  }
}
