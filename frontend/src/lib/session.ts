const SESSION_KEY = 'contribflow:sessionId';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = window.localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}
