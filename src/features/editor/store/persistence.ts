import type { Project } from '@/features/editor/model/types';

const DB_NAME = 'video-editor';
const STORES = ['projects', 'cache'] as const;
type StoreName = (typeof STORES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb() {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => STORES.forEach(name => request.result.createObjectStore(name));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function run<T>(store: StoreName, mode: IDBTransactionMode, action: (s: IDBObjectStore) => IDBRequest) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const request = action(db.transaction(store, mode).objectStore(store));
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
  });
}

export const dbGet = <T>(store: StoreName, key: string) => run<T | undefined>(store, 'readonly', s => s.get(key));
export const dbPut = (store: StoreName, key: string, value: unknown) => run(store, 'readwrite', s => s.put(value, key));
export const dbDelete = (store: StoreName, key: string) => run(store, 'readwrite', s => s.delete(key));
export const dbAll = <T>(store: StoreName) => run<T[]>(store, 'readonly', s => s.getAll());

export const saveProject = (project: Project) => dbPut('projects', project.id, project);
export const loadProject = (id: string) => dbGet<Project>('projects', id);
export const deleteProject = (id: string) => dbDelete('projects', id);
export const listProjects = async () => (await dbAll<Project>('projects')).sort((a, b) => b.updatedAt - a.updatedAt);
