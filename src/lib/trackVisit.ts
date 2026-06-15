import { apiPost } from './api'

const SESSION_KEY = 'visitor_session_id'

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

export function getSessionId(): string {
  return getOrCreateSessionId()
}

export async function trackVisit(page: string): Promise<void> {
  try {
    await apiPost('/api/visits', {
      page,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      session_id: getOrCreateSessionId(),
    })
  } catch (err) {
    console.warn('[trackVisit] error:', err)
  }
}

export async function updateActiveUser(): Promise<void> {
  try {
    await apiPost('/api/active-users/heartbeat', {
      session_id: getOrCreateSessionId(),
    })
  } catch (err) {
    console.warn('[updateActiveUser] error:', err)
  }
}
