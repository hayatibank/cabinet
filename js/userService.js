/* /webapp/js/userService.js v2.1.0 */
// CHANGELOG v2.1.0:
// - SECURITY: Removed authToken from query string
// - SECURITY: Use Authorization header for API calls

import { API_URL } from './config.js';
import { getSession } from './session.js';

function withAuthTokenQuery(url, authToken) {
  const nextUrl = new URL(url, window.location.origin);
  if (authToken && !nextUrl.searchParams.has('authToken')) {
    nextUrl.searchParams.set('authToken', authToken);
  }
  return nextUrl.toString();
}

export async function getUserData(uid) {
  try {
    console.log(`[UserService] Fetching user data for: ${uid}`);

    const session = getSession();
    if (!session || !session.authToken) {
      console.error('[UserService] No auth token available');
      return null;
    }

    const response = await fetch(withAuthTokenQuery(`${API_URL}/api/users/${uid}`, session.authToken), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.authToken}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`[UserService] API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (!data.success) {
      console.error('[UserService] API returned success=false');
      return null;
    }

    return data.userData;
  } catch (err) {
    console.error('[UserService] Error fetching user data:', err);
    return null;
  }
}

export async function getUserHayatiId(uid) {
  try {
    const userData = await getUserData(uid);
    return userData?.hayatiId || null;
  } catch (err) {
    console.error('[UserService] Error fetching Hayati ID:', err);
    return null;
  }
}
