export type OfflineReportStatus = "draft" | "pending" | "sent";
export type OfflinePhotoStatus = "draft" | "pending" | "uploaded";

export type OfflineReport = {
  id: string;
  payload_json: string;
  status: OfflineReportStatus;
  created_at: string;
  updated_at: string;
};

export type OfflinePhoto = {
  id: string;
  report_id: string;
  field_key: string;
  file_name: string;
  blob: Blob;
  status: OfflinePhotoStatus;
  created_at: string;
  remote_url?: string;
  coords?: { lat: number; lng: number } | null;
};

const DB_NAME = "hhtelecom_offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("reports")) {
        const store = db.createObjectStore("reports", { keyPath: "id" });
        store.createIndex("status_idx", "status", { unique: false });
      }
      if (!db.objectStoreNames.contains("photos")) {
        const store = db.createObjectStore("photos", { keyPath: "id" });
        store.createIndex("status_idx", "status", { unique: false });
        store.createIndex("report_idx", "report_id", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let req: IDBRequest<T> | void;
    try {
      req = fn(store);
    } catch (e) {
      reject(e);
      return;
    }
    tx.oncomplete = () => resolve(req ? (req as any).result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function upsertReport(report: OfflineReport): Promise<void> {
  await withStore("reports", "readwrite", (store) => store.put(report));
}

export async function getReportsByStatus(status: OfflineReportStatus): Promise<OfflineReport[]> {
  const db = await openDb();
  const tx = db.transaction("reports", "readonly");
  const store = tx.objectStore("reports");
  const idx = store.index("status_idx");
  const req = idx.getAll(status);
  return requestToPromise(req);
}

export async function updateReportStatus(id: string, status: OfflineReportStatus, updatedAt?: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("reports", "readwrite");
  const store = tx.objectStore("reports");
  const existing = await requestToPromise(store.get(id));
  if (!existing) return;
  const next = { ...existing, status, updated_at: updatedAt || new Date().toISOString() } as OfflineReport;
  store.put(next);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function deletePhotosByReport(reportId: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("photos", "readwrite");
  const store = tx.objectStore("photos");
  const idx = store.index("report_idx");
  const req = idx.getAllKeys(reportId);
  const keys = await requestToPromise(req);
  for (const key of keys) {
    store.delete(key as IDBValidKey);
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function upsertPhotos(photos: OfflinePhoto[]): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("photos", "readwrite");
  const store = tx.objectStore("photos");
  for (const p of photos) {
    store.put(p);
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getPhotosByStatus(status: OfflinePhotoStatus): Promise<OfflinePhoto[]> {
  const db = await openDb();
  const tx = db.transaction("photos", "readonly");
  const store = tx.objectStore("photos");
  const idx = store.index("status_idx");
  const req = idx.getAll(status);
  return requestToPromise(req);
}

export async function updatePhotoStatus(id: string, status: OfflinePhotoStatus, remoteUrl?: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("photos", "readwrite");
  const store = tx.objectStore("photos");
  const existing = await requestToPromise(store.get(id));
  if (!existing) return;
  const next = { ...existing, status, remote_url: remoteUrl || (existing as any).remote_url } as OfflinePhoto;
  store.put(next);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
