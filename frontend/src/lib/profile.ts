import { Experience } from '@/types';

export interface StoredProfile {
  skills: string[];
  experience: Experience;
  availableHours: number;
  sessionId?: string;
}

const STORAGE_KEY = 'contribflow:profile';
const listeners = new Set<() => void>();

// useSyncExternalStore requires getSnapshot to return a referentially stable
// value when the underlying data hasn't changed - cache the parsed result
// keyed on the raw string so repeated calls don't produce a new object
// reference (which would otherwise trigger an infinite re-render loop).
let cachedRaw: string | null = null;
let cachedValue: StoredProfile | null = null;

export function saveProfile(profile: StoredProfile) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  listeners.forEach((listener) => listener());
}

export function loadProfile(): StoredProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (raw === cachedRaw) {
    return cachedValue;
  }

  cachedRaw = raw;
  if (!raw) {
    cachedValue = null;
    return cachedValue;
  }

  try {
    cachedValue = JSON.parse(raw) as StoredProfile;
  } catch {
    cachedValue = null;
  }
  return cachedValue;
}

export function subscribeProfile(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function saveSessionId(sessionId: string) {
  const profile = loadProfile();
  if (profile) {
    saveProfile({ ...profile, sessionId });
  }
}
