export type StoredPhoto = {
  id: string;
  name: string;
  type: string;
  size: number;
  bytes: ArrayBuffer;
  createdAt: number;
};

export type PhotoSessionSummary = {
  id: string;
  name: string;
  type: string;
  size: number;
};

const sessionTtlMs = 60 * 60 * 1000;

const store = globalThis as typeof globalThis & {
  sellTradePhotoSessions?: Map<string, StoredPhoto[]>;
};

function getStore() {
  if (!store.sellTradePhotoSessions) {
    store.sellTradePhotoSessions = new Map();
  }

  return store.sellTradePhotoSessions;
}

export function getPhotoSession(sessionId: string) {
  cleanupPhotoSessions();
  return getStore().get(sessionId) ?? [];
}

export function setPhotoSession(sessionId: string, photos: StoredPhoto[]) {
  cleanupPhotoSessions();
  getStore().set(sessionId, photos);
}

export function clearPhotoSession(sessionId: string) {
  getStore().delete(sessionId);
}

export function summarizePhotos(photos: StoredPhoto[]): PhotoSessionSummary[] {
  return photos.map(({ id, name, type, size }) => ({ id, name, type, size }));
}

export function cleanupPhotoSessions() {
  const now = Date.now();

  for (const [sessionId, photos] of getStore().entries()) {
    if (photos.every((photo) => now - photo.createdAt > sessionTtlMs)) {
      getStore().delete(sessionId);
    }
  }
}
