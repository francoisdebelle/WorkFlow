import { SEED_DATABASE } from '../data/seedData';
import { StudyFlowDatabase } from '../types/studyflow';

const STORAGE_KEY = 'studyflow_local_db_v1';
const IDB_NAME = 'StudyFlowDB';
const IDB_STORE = 'state';
const IDB_RECORD_KEY = 'main';

function openIndexedDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveToIndexedDb(data: StudyFlowDatabase): Promise<void> {
  const db = await openIndexedDb();
  if (!db) return;
  try {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(data, IDB_RECORD_KEY);
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  } catch {
    db.close();
  }
}

export async function loadFromIndexedDb(): Promise<StudyFlowDatabase | null> {
  const db = await openIndexedDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(IDB_RECORD_KEY);
      req.onsuccess = () => {
        const result = req.result as StudyFlowDatabase | undefined;
        db.close();
        if (result && Array.isArray(result.courses) && Array.isArray(result.tasks)) {
          resolve(result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => {
        db.close();
        resolve(null);
      };
    } catch {
      db.close();
      resolve(null);
    }
  });
}

export function loadDatabaseSync(): StudyFlowDatabase {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StudyFlowDatabase;
      if (parsed && Array.isArray(parsed.courses) && Array.isArray(parsed.tasks)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seed data if storage is unavailable or corrupted
  }
  const cloned = structuredClone(SEED_DATABASE);
  saveDatabase(cloned);
  return cloned;
}

export function saveDatabase(data: StudyFlowDatabase): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors in restricted frames
  }
  void saveToIndexedDb(data);
}

export function resetDatabase(): StudyFlowDatabase {
  const fresh = structuredClone(SEED_DATABASE);
  saveDatabase(fresh);
  return fresh;
}

export function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
