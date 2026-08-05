const STORAGE_KEY = 'eltyca:clientId';

/** Persisted per-browser, generated once — lets the online server recognize a page refresh
 *  as the same player reclaiming their slot rather than a 3rd connection (see
 *  packages/server/src/room.ts's assignPlayerSlot). This is the app's first use of
 *  localStorage; everything else so far has been purely in-memory. */
export function getOrCreateClientId(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
