// Polyfill to prevent crashes when localStorage is unavailable (e.g., Safari Private Mode)
// Replaces Storage methods with in-memory fallbacks instead of throwing exceptions.
// This enables libraries expecting localStorage (like auth/session clients) to function in-memory.

(() => {
  if (typeof window === 'undefined') return;

  try {
    const t = '__ls_test__';
    window.localStorage.setItem(t, '1');
    window.localStorage.removeItem(t);
    // If the above succeeds, nothing to patch
    return;
  } catch (err) {
    const memory = new Map<string, string>();
    const ls = window.localStorage as Storage;

    const safeGet = (key: string): string | null => {
      return memory.has(key) ? memory.get(key)! : null;
    };

    const safeSet = (key: string, value: string): void => {
      // Persist in-memory only; ignore real storage errors
      memory.set(String(key), String(value));
    };

    const safeRemove = (key: string): void => {
      memory.delete(String(key));
    };

    const safeClear = (): void => {
      memory.clear();
    };

    // Patch instance methods if possible
    try { (ls as any).getItem = safeGet; } catch {}
    try { (ls as any).setItem = safeSet; } catch {}
    try { (ls as any).removeItem = safeRemove; } catch {}
    try { (ls as any).clear = safeClear; } catch {}

    // Patch prototype as a broader safety net
    try { (Storage.prototype as any).getItem = function(key: string) { return safeGet(key); }; } catch {}
    try { (Storage.prototype as any).setItem = function(key: string, value: string) { safeSet(key, value); }; } catch {}
    try { (Storage.prototype as any).removeItem = function(key: string) { safeRemove(key); }; } catch {}
    try { (Storage.prototype as any).clear = function() { safeClear(); }; } catch {}

    // Mark for diagnostics
    (window as any).__SAFE_STORAGE_FALLBACK__ = true;
    console.warn('[safe-storage] localStorage unavailable; using in-memory fallback.');
  }
})();
