// webapp/js/api.js
// All backend API calls

import { API_URL } from './config.js';

/**
 * Check if Telegram chatId is linked to Firebase UID
 */
export async function checkTelegramBinding(chatId, initData) {
  try {
    console.log('🔍 Checking Telegram binding...');
    
    const response = await fetch(`${API_URL}/api/check-telegram-binding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, initData })
    });
    
    if (!response.ok) {
      console.error('❌ Binding check failed:', response.status);
      return null;
    }
    
    const result = await response.json();
    console.log('✅ Binding check result:', result);
    return result;
  } catch (err) {
    console.error('❌ Error checking binding:', err);
    return null;
  }
}

/**
 * Silent login using existing Telegram binding
 */
export async function silentLogin(uid, chatId, initData) {
  try {
    console.log('🔐 Attempting silent login...');
    
    const response = await fetch(`${API_URL}/api/silent-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, chatId, initData })
    });
    
    if (!response.ok) {
      console.error('❌ Silent login failed:', response.status);
      return null;
    }
    
    const result = await response.json();
    console.log('✅ Silent login successful');
    return result;
  } catch (err) {
    console.error('❌ Error during silent login:', err);
    return null;
  }
}

/**
 * Validate Firebase auth token
 */
export async function validateToken(authToken, uid) {
  try {
    const response = await fetch(`${API_URL}/api/validate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authToken, uid })
    });
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.valid === true;
  } catch (err) {
    console.error('❌ Error validating token:', err);
    return false;
  }
}

/**
 * Link Telegram account to Firebase user
 */
export async function linkTelegramAccount(uid, authToken, telegramData) {
  try {
    const { chatId, initData, user } = telegramData;
    
    if (!chatId || !initData) {
      console.warn('⚠️ No Telegram data for linking');
      return false;
    }
    
    console.log('🔗 Linking Telegram account:', {
      chatId,
      username: user?.username,
      firstName: user?.first_name
    });
    
    const response = await fetch(`${API_URL}/api/link-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid,
        chatId,
        initData,
        telegramUser: user,
        authToken
      })
    });
    
    if (!response.ok) {
      console.error('❌ Linking failed:', response.status);
      return false;
    }
    
    console.log('✅ Telegram linked successfully');
    return true;
  } catch (err) {
    console.error('❌ Error linking Telegram:', err);
    return false;
  }
}

/**
 * Delete user account (backend endpoint)
 */
export async function deleteUserAccount(uid, authToken) {
  try {
    console.log('🗑️ Deleting user account...');
    
    const response = await fetch(`${API_URL}/api/delete-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, authToken })
    });
    
    if (!response.ok) {
      console.error('❌ Account deletion failed:', response.status);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ Account deleted successfully');
    return result.success === true;
  } catch (err) {
    console.error('❌ Error deleting account:', err);
    return false;
  }
}

/**
 * Delete telegram_sessions (logout)
 */
export async function deleteTelegramSession(chatId, uid, authToken) {
  try {
    console.log('🗑️ Deleting telegram_sessions...');
    
    const response = await fetch(`${API_URL}/api/logout-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, uid, authToken })
    });
    
    if (!response.ok) {
      console.error('❌ Session deletion failed:', response.status);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ telegram_sessions deleted');
    return result.success === true;
  } catch (err) {
    console.error('❌ Error deleting telegram_sessions:', err);
    return false;
  }
}
