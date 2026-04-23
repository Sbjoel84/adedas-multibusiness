import { supabase } from './supabase';

const SESSION_KEY = 'visitor_session_id';

/** Returns an existing session ID from localStorage or creates a new one. */
function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getSessionId(): string {
  return getOrCreateSessionId();
}

/**
 * Records a page visit in the `visits` table.
 * Call this on every route change. Errors are swallowed so tracking
 * never breaks the user experience.
 */
export async function trackVisit(page: string): Promise<void> {
  try {
    const { error } = await supabase.from('visits').insert({
      page,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      session_id: getOrCreateSessionId(),
    });
    if (error) console.warn('[trackVisit] insert error:', error.message);
  } catch (err) {
    console.warn('[trackVisit] unexpected error:', err);
  }
}

/**
 * Upserts the current session into `active_users`.
 * Should be called on mount and then on a 30-second interval.
 * Rows older than 2 minutes are considered inactive.
 */
export async function updateActiveUser(): Promise<void> {
  try {
    const { error } = await supabase.from('active_users').upsert(
      { session_id: getOrCreateSessionId(), last_seen: new Date().toISOString() },
      { onConflict: 'session_id' }
    );
    if (error) console.warn('[updateActiveUser] upsert error:', error.message);
  } catch (err) {
    console.warn('[updateActiveUser] unexpected error:', err);
  }
}
