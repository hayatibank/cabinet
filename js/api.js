/* /webapp/js/api.js v2.0.0 */
// CHANGELOG v2.0.0:
// - REMOVED: legacy Telegram binding/silent login/token validation helpers
// - CLEANUP: removed ngrok-specific headers
// - KEPT: account linking and user/session management helpers

import { API_URL } from './config.js';

/**
 * Link Telegram account to Firebase user
 */
export async function linkTelegramAccount(uid, authToken, telegramData) {
  try {
    const { chatId, initData, user } = telegramData;

    if (!chatId || !initData) {
      console.warn('[api] No Telegram data for linking');
      return false;
    }

    const response = await fetch(`${API_URL}/api/link-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uid,
        chatId,
        initData,
        telegramUser: user,
        authToken
      })
    });

    if (!response.ok) {
      console.error('[api] Linking failed:', response.status);
      return false;
    }

    console.log('[api] Telegram linked successfully');
    return true;
  } catch (err) {
    console.error('[api] Error linking Telegram:', err);
    return false;
  }
}

/**
 * Delete user account (backend endpoint)
 */
export async function deleteUserAccount(uid, authToken) {
  try {
    const response = await fetch(`${API_URL}/api/delete-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uid, authToken })
    });

    if (!response.ok) {
      console.error('[api] Account deletion failed:', response.status);
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (err) {
    console.error('[api] Error deleting account:', err);
    return false;
  }
}

/**
 * Delete telegram_sessions (logout)
 */
export async function deleteTelegramSession(chatId, uid, authToken) {
  try {
    const response = await fetch(`${API_URL}/api/logout-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chatId, uid, authToken })
    });

    if (!response.ok) {
      console.error('[api] Session deletion failed:', response.status);
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (err) {
    console.error('[api] Error deleting telegram_sessions:', err);
    return false;
  }
}

/**
 * Create user document via backend
 */
export async function createUserDocument(uid, authToken, userData) {
  try {
    const response = await fetch(`${API_URL}/api/users/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uid, authToken, userData })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('[api] User creation failed:', error);
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (err) {
    console.error('[api] Error creating user document:', err);
    return false;
  }
}
