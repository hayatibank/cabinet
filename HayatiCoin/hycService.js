/* /webapp/HayatiCoin/hycService.js v1.1.0 */
// CHANGELOG v1.1.0:
// - ADDED: Auto-refresh UI after successful claim/reward
// - Import refreshHYCBalance from hycUI
// CHANGELOG v1.0.0:
// - Initial release
// - API wrapper for HYC operations
// - Silent error handling (no UI alerts)

import { API_URL } from '../js/config.js';
import { getSession } from '../js/session.js';

function authHeaders(session, contentType = true) {
  return {
    ...(contentType ? { 'Content-Type': 'application/json' } : {}),
    ...(session?.authToken ? { Authorization: `Bearer ${session.authToken}` } : {}),
    'ngrok-skip-browser-warning': 'true'
  };
}

function withAuthTokenQuery(url, session) {
  const nextUrl = new URL(url, window.location.origin);
  if (session?.authToken && !nextUrl.searchParams.has('authToken')) {
    nextUrl.searchParams.set('authToken', session.authToken);
  }
  return nextUrl.toString();
}

/**
 * Request registration reward (1 HYC)
 */
export async function requestRegistrationReward(uid) {
  try {
    const session = getSession();
    if (!session) {
      console.warn('⚠️ [HYC] No session for registration reward');
      return null;
    }
    
    console.log('🪙 [HYC] Requesting registration reward...');
    
    const response = await fetch(`${API_URL}/api/hyc/reward`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        uid,
        authToken: session.authToken
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.log('ℹ️ [HYC] Registration reward not granted:', error.error);
      return null;
    }
    
    const result = await response.json();
    console.log('✅ [HYC] Registration reward granted:', result.amount);
    
    // ✅ NEW: Auto-refresh UI
    await refreshHYCBalanceUI();
    
    return result;
  } catch (err) {
    console.error('❌ [HYC] Error requesting registration reward:', err);
    return null;
  }
}

/**
 * Claim HYC for app login (0.01) or dashboard entry (0.02)
 */
export async function claimHYC(type, accountId = null) {
  try {
    const session = getSession();
    if (!session) {
      console.warn('⚠️ [HYC] No session for claim');
      return null;
    }
    
    console.log(`🪙 [HYC] Claiming ${type}...`);
    
    const response = await fetch(`${API_URL}/api/hyc/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        type,
        accountId,
        authToken: session.authToken
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      
      if (response.status === 429) {
        console.log('ℹ️ [HYC] Cooldown active:', error.error);
      } else {
        console.log('ℹ️ [HYC] Claim not granted:', error.error);
      }
      
      return null;
    }
    
    const result = await response.json();
    console.log('✅ [HYC] Claim successful:', result.amount);
    
    // ✅ NEW: Auto-refresh UI
    await refreshHYCBalanceUI();
    
    return result;
  } catch (err) {
    console.error('❌ [HYC] Error claiming:', err);
    return null;
  }
}

/**
 * Get HYC balance
 */
export async function getHYCBalance() {
  try {
    const session = getSession();
    if (!session?.authToken) {
      return null;
    }
    
    const response = await fetch(
      withAuthTokenQuery(`${API_URL}/api/hyc/balance`, session),
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...authHeaders(session, false)
        }
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    return result;
    
  } catch (err) {
    console.error('❌ [HYC] Error getting balance:', err);
    return null;
  }
}

/**
 * Format HYC amount (drop trailing zeros)
 */
export function formatHYC(amount) {
  if (!amount) return '0';
  return parseFloat(amount.toFixed(9)).toString();
}

/**
 * Refresh HYC balance in UI
 * Helper to avoid circular imports
 */
async function refreshHYCBalanceUI() {
  try {
    // Use global function if available
    if (typeof window !== 'undefined' && window.refreshHYCBalance) {
      await window.refreshHYCBalance();
    }
  } catch (err) {
    console.warn('⚠️ [HYC] Could not refresh UI:', err);
  }
}
