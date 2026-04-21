/* /webapp/js/tokenManager.js v2.0.0 */
// CHANGELOG v2.0.0:
// - BREAKING: Multi-session token management
// - ADDED: Aggressive refresh (15 min before expiry, not 5)
// - ADDED: Pre-request token refresh
// - ADDED: Background token refresh every 10 minutes
// - FIXED: Custom Token → ID Token exchange
// Centralized token management with auto-refresh

import { getAuth } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { getSession, saveSession, getCurrentChatId } from './session.js';

// Track refresh state per chatId to avoid multiple simultaneous refreshes
const refreshState = new Map();

/**
 * Check if token needs refresh (expires in < 15 minutes)
 * @param {string} chatId - Optional chatId
 * @returns {boolean}
 */
function needsRefresh(chatId = null) {
  const session = getSession(chatId);
  if (!session) return false;
  
  const timeUntilExpiry = session.tokenExpiry - Date.now();
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  
  const needs = timeUntilExpiry < FIFTEEN_MINUTES;
  
  if (needs) {
    const minutesLeft = Math.floor(timeUntilExpiry / (60 * 1000));
    console.log(`⚠️ Token refresh needed (${minutesLeft} min left)`);
  }
  
  return needs;
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
 * @param {string} chatId - Optional chatId
 * @returns {Promise<string|null>}
 */
async function refreshToken(chatId = null) {
  const targetChatId = chatId || getCurrentChatId();
  
  if (!targetChatId) {
    console.warn('⚠️ No chatId for token refresh');
    return null;
  }
  
  // Prevent multiple simultaneous refreshes for same chatId
  if (refreshState.get(targetChatId)?.isRefreshing) {
    console.log(`⏳ Token refresh already in progress for chatId: ${targetChatId}, waiting...`);
    return refreshState.get(targetChatId).promise;
  }
  
  // Set refresh state
  const refreshPromise = (async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.warn('⚠️ No authenticated user for token refresh');
        refreshState.delete(targetChatId);
        return null;
      }
      
      console.log(`🔄 Refreshing auth token for chatId: ${targetChatId}...`);
      showRefreshStatus('🔄 Обновление сессии...');
      
      // Force refresh ID token
      const newToken = await user.getIdToken(true);
      
      const session = getSession(targetChatId);
      
      if (!session) {
        console.warn('⚠️ No session found during refresh');
        refreshState.delete(targetChatId);
        return newToken;
      }
      
      // Save updated session
      saveSession({
        ...session,
        authToken: newToken,
        tokenExpiry: Date.now() + (60 * 60 * 1000) // 1 hour
      }, targetChatId);
      
      console.log(`✅ Token refreshed for chatId: ${targetChatId}`);
      console.log(`⏰ New expiry: ${new Date(Date.now() + 60 * 60 * 1000).toLocaleString()}`);
      showRefreshStatus('✅ Сессия обновлена');
      
      refreshState.delete(targetChatId);
      return newToken;
      
    } catch (err) {
      console.error(`❌ Error refreshing token for chatId ${targetChatId}:`, err);
      refreshState.delete(targetChatId);
      showRefreshStatus('❌ Ошибка обновления сессии');
      throw err;
    }
  })();
  
  refreshState.set(targetChatId, {
    isRefreshing: true,
    promise: refreshPromise
  });
  
  return refreshPromise;
}

/**
 * Ensure token is fresh before API call
 * @param {string} chatId - Optional chatId
 * @returns {Promise<string|null>}
 */
export async function ensureFreshToken(chatId = null) {
  const targetChatId = chatId || getCurrentChatId();
  
  if (needsRefresh(targetChatId)) {
    console.log('⚠️ Token expiring soon, refreshing...');
    return await refreshToken(targetChatId);
  }
  
  return getSession(targetChatId)?.authToken || null;
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
      const chatId = getCurrentChatId();
      
      console.log('🔒 Token interceptor: checking token freshness');
      
      // Ensure token is fresh
      const freshToken = await ensureFreshToken(chatId);
      
      if (!freshToken) {
        console.warn('⚠️ No fresh token available');
      } else {
        console.log('✅ Fresh token obtained for request');
      }
      
      if (freshToken) {
        const nextHeaders = new Headers(options.headers || {});
        nextHeaders.set('Authorization', `Bearer ${freshToken}`);
        options.headers = nextHeaders;
      }

      // Update authToken in request body if present
      if (options.body && typeof options.body === 'string') {
        try {
          const body = JSON.parse(options.body);
          if (body.authToken !== undefined && freshToken) {
            console.log('🔄 Updating token in request body');
            body.authToken = freshToken;
            options.body = JSON.stringify(body);
          }
        } catch (e) {
          // Not JSON body, skip
        }
      }
      
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('🔒 Token interceptor installed');
}

/**
 * Setup periodic token check (every 10 minutes)
 */
export function setupPeriodicTokenCheck() {
  setInterval(async () => {
    const chatId = getCurrentChatId();
    
    if (!chatId) {
      console.log('ℹ️ Periodic check: no chatId');
      return;
    }
    
    if (needsRefresh(chatId)) {
      console.log('⏰ Periodic check: token needs refresh');
      await ensureFreshToken(chatId);
    } else {
      const session = getSession(chatId);
      if (session) {
        const minutesLeft = Math.floor((session.tokenExpiry - Date.now()) / (60 * 1000));
        console.log(`✅ Periodic check: token fresh (${minutesLeft} min left)`);
      }
    }
  }, 10 * 60 * 1000); // Every 10 minutes
  
  console.log('⏰ Periodic token check enabled (every 10 min)');
}

/**
 * Setup background token refresh (every 30 minutes)
 * This proactively refreshes tokens before they expire
 */
export function setupBackgroundTokenRefresh() {
  setInterval(async () => {
    const chatId = getCurrentChatId();
    
    if (!chatId) return;
    
    const session = getSession(chatId);
    if (!session) return;
    
    // Refresh if less than 30 minutes left
    const timeLeft = session.tokenExpiry - Date.now();
    const THIRTY_MINUTES = 30 * 60 * 1000;
    
    if (timeLeft < THIRTY_MINUTES) {
      console.log('🔄 Background refresh: proactively refreshing token');
      await refreshToken(chatId);
    }
  }, 30 * 60 * 1000); // Every 30 minutes
  
  console.log('🔄 Background token refresh enabled (every 30 min)');
}

console.log('✅ Token manager v2.0.0 initialized');
