/* /webapp/js/tokenManager.js v1.0.0 */
// Centralized token management with auto-refresh
// CHANGELOG v1.0.0:
// - Initial release
// - Auto token refresh before expiry
// - Global fetch interceptor
// - User-visible status messages

import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getSession, saveSession } from './session.js';

// Track refresh state to avoid multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise = null;

/**
 * Check if token needs refresh (expires in < 5 minutes)
 */
function needsRefresh() {
  const session = getSession();
  if (!session) return false;
  
  const timeUntilExpiry = session.tokenExpiry - Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;
  
  return timeUntilExpiry < FIVE_MINUTES;
}

/**
 * Show refresh status to user
 */
function showRefreshStatus(message) {
  // Check if we're in loading screen
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingText = loadingScreen?.querySelector('p');
  
  if (loadingText && !loadingScreen.classList.contains('hidden')) {
    loadingText.textContent = message;
    return;
  }
  
  // Otherwise show temporary toast (simple implementation)
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 240, 255, 0.9);
    color: #0f172a;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    animation: slideUp 0.3s ease-out;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/**
 * Refresh Firebase ID token
 */
async function refreshToken() {
  // Prevent multiple simultaneous refreshes
  if (isRefreshing) {
    console.log('⏳ Token refresh already in progress, waiting...');
    return refreshPromise;
  }
  
  isRefreshing = true;
  
  refreshPromise = (async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.warn('⚠️ No authenticated user for token refresh');
        isRefreshing = false;
        return null;
      }
      
      console.log('🔄 Refreshing auth token...');
      showRefreshStatus('🔄 Обновление сессии...');
      
      const newToken = await user.getIdToken(true); // force refresh
      
      const session = getSession();
      saveSession({
        ...session,
        authToken: newToken,
        tokenExpiry: Date.now() + (60 * 60 * 1000) // 1 hour
      });
      
      console.log('✅ Token refreshed successfully');
      console.log('⏰ New expiry:', new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString());
      showRefreshStatus('✅ Сессия обновлена');
      
      isRefreshing = false;
      return newToken;
      
    } catch (err) {
      console.error('❌ Error refreshing token:', err);
      isRefreshing = false;
      showRefreshStatus('❌ Ошибка обновления сессии');
      throw err;
    }
  })();
  
  return refreshPromise;
}

/**
 * Ensure token is fresh before API call
 */
export async function ensureFreshToken() {
  if (needsRefresh()) {
    console.log('⚠️ Token expiring soon, refreshing...');
    return await refreshToken();
  }
  return getSession()?.authToken;
}

/**
 * Setup global fetch interceptor
 */
export function setupTokenInterceptor() {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const [url, options = {}] = args;
    
    // Only intercept API calls to backend
    if (url.includes('/api/')) {
      console.log('🔒 Token interceptor: checking token freshness');
      
      // Ensure token is fresh
      const freshToken = await ensureFreshToken();
      
      if (!freshToken) {
        console.warn('⚠️ No fresh token available');
      }
      
      // Update authToken in request body if present
      if (options.body && typeof options.body === 'string') {
        try {
          const body = JSON.parse(options.body);
          if (body.authToken && freshToken) {
            console.log('🔄 Updating token in request body');
            body.authToken = freshToken;
            options.body = JSON.stringify(body);
          }
        } catch (e) {
          // Not JSON body, skip
        }
      }
      
      // Update authToken in query params if present
      if (url.includes('authToken=') && freshToken) {
        console.log('🔄 Updating token in query params');
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set('authToken', freshToken);
        args[0] = urlObj.toString();
      }
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('🔒 Token interceptor installed');
}

/**
 * Setup periodic token check (every 5 minutes)
 */
export function setupPeriodicTokenCheck() {
  setInterval(async () => {
    if (needsRefresh()) {
      console.log('⏰ Periodic check: token needs refresh');
      await ensureFreshToken();
    } else {
      const session = getSession();
      if (session) {
        const minutesLeft = Math.floor((session.tokenExpiry - Date.now()) / (60 * 1000));
        console.log(`✅ Periodic check: token fresh (${minutesLeft} minutes left)`);
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
  
  console.log('⏰ Periodic token check enabled (every 5 min)');
}