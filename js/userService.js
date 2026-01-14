/* /webapp/js/userService.js v2.0.0 */
// CHANGELOG v2.0.0:
// - BREAKING: Now uses backend API instead of direct Firestore access
// - Solves Firestore WebSocket connection issues
// - More reliable and consistent with other API calls
// CHANGELOG v1.0.1:
// - FIXED: Return null instead of throwing error (graceful degradation)
// CHANGELOG v1.0.0:
// - Initial release
// - Fetch user data from Firestore
// User data service

import { API_URL } from './config.js';
import { getSession } from './session.js';

/**
 * Get user data via backend API
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User data including hayatiId
 */
export async function getUserData(uid) {
  try {
    console.log(`📋 [UserService] Fetching user data for: ${uid}`);
    
    // Get auth token
    const session = getSession();
    if (!session || !session.authToken) {
      console.error('❌ [UserService] No auth token available');
      return null;
    }
    
    // Fetch from backend API
    const url = `${API_URL}/api/users/${uid}?authToken=${encodeURIComponent(session.authToken)}`;
    
    console.log(`📡 [UserService] Request URL: ${url.replace(/authToken=.+/, 'authToken=***')}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ [UserService] API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.error(`❌ [UserService] API returned success=false`);
      return null;
    }
    
    const userData = data.userData;
    
    console.log(`✅ [UserService] User data loaded:`, {
      uid: userData.uid,
      email: userData.email,
      hayatiId: userData.hayatiId,
      hayatiIdTier: userData.hayatiIdTier
    });
    
    return userData;
    
  } catch (err) {
    console.error(`❌ [UserService] Error fetching user data:`, err);
    return null; // ✅ Return null instead of throwing
  }
}

/**
 * Get user's Hayati ID via backend API
 * @param {string} uid - User ID
 * @returns {Promise<string|null>} Hayati ID or null
 */
export async function getUserHayatiId(uid) {
  try {
    const userData = await getUserData(uid);
    return userData?.hayatiId || null;
  } catch (err) {
    console.error(`❌ [UserService] Error fetching Hayati ID:`, err);
    return null;
  }
}
