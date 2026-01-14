/* /webapp/js/sessionMonitor.js v1.0.1 */
// CHANGELOG v1.0.1:
// - FIXED: Removed alert on session expiry (silent redirect)
// CHANGELOG v1.0.0:
// - Initial release
// - Monitor session expiry and auto-refresh
// - Detect navigation to cabinet when session expired
// Session monitoring and auto-refresh

import { getSession } from './session.js';
import { showAuthScreen } from './ui.js';

/**
 * Check if session is valid (not expired)
 * @returns {boolean} True if session is valid
 */
export function isSessionValid() {
  const session = getSession();
  
  if (!session || !session.tokenExpiry) {
    return false;
  }
  
  const now = Date.now();
  const timeLeft = session.tokenExpiry - now;
  
  // Valid if more than 5 minutes left
  return timeLeft > (5 * 60 * 1000);
}

/**
 * Get time until session expires (in milliseconds)
 * @returns {number} Milliseconds until expiry (or 0 if expired)
 */
export function getTimeUntilExpiry() {
  const session = getSession();
  
  if (!session || !session.tokenExpiry) {
    return 0;
  }
  
  const now = Date.now();
  const timeLeft = session.tokenExpiry - now;
  
  return Math.max(0, timeLeft);
}

/**
 * Setup session monitoring
 * Checks every minute and redirects to login if expired
 */
export function setupSessionMonitor() {
  console.log('⏰ [SessionMonitor] Starting session monitoring...');
  
  // Check immediately
  checkSession();
  
  // Check every minute
  setInterval(() => {
    checkSession();
  }, 60 * 1000);
}

/**
 * Check session and redirect to login if expired
 */
function checkSession() {
  const session = getSession();
  
  if (!session) {
    // No session - this is OK if on login screen
    return;
  }
  
  const timeLeft = getTimeUntilExpiry();
  
  if (timeLeft === 0) {
    console.warn('⚠️ [SessionMonitor] Session expired, redirecting to login...');
    
    // Clear session SILENTLY
    localStorage.removeItem('authSession');
    
    // Show login screen (no alert)
    showAuthScreen('login');
  } else if (timeLeft < (10 * 60 * 1000)) {
    // Less than 10 minutes left
    const minutesLeft = Math.floor(timeLeft / 60000);
    console.log(`⏰ [SessionMonitor] Session expires in ${minutesLeft} minutes`);
  }
}

/**
 * Monitor visibility changes and check session when user returns
 */
export function setupVisibilityMonitor() {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('👀 [SessionMonitor] Page visible again, checking session...');
      checkSession();
    }
  });
}
