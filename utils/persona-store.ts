import { openDB, IDBPDatabase } from 'idb';
import { Persona } from './personas';

const DB_NAME = "strategy-os-personas";
const STORE_NAME = "custom-personas";

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function saveCustomPersona(persona: Persona) {
  const db = await getDB();
  await db.put(STORE_NAME, persona);
}

export async function getCustomPersonas(): Promise<Persona[]> {
  const db = await getDB();
  return await db.getAll(STORE_NAME);
}

export async function deleteCustomPersona(id: string) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function updatePersonaPrompt(id: string, newPrompt: string) {
    const db = await getDB();
    const persona = await db.get(STORE_NAME, id);
    if (persona) {
        persona.basePrompt = newPrompt;
        await db.put(STORE_NAME, persona);
    }
}
