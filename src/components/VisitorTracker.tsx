import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackVisit, updateActiveUser } from '@/lib/trackVisit';

const HEARTBEAT_MS = 30_000; // 30 seconds

/**
 * Invisible component that must live inside <BrowserRouter>.
 * - Tracks every route change as a visit.
 * - Sends a heartbeat every 30s to keep the session "active".
 * Renders nothing to the DOM.
 */
export function VisitorTracker() {
  const { pathname } = useLocation();
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track page view on every route change
  useEffect(() => {
    trackVisit(pathname);
  }, [pathname]);

  // Heartbeat: mark session active on mount, then every 30s
  useEffect(() => {
    updateActiveUser();
    heartbeatRef.current = setInterval(updateActiveUser, HEARTBEAT_MS);
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  return null;
}
