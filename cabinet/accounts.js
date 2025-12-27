/* /webapp/cabinet/accounts.js v1.3.0 */
// CHANGELOG v1.3.0:
// - MOVED: From /js/cabinet/ to /cabinet/ (modular)
// - FIXED: Import paths for config.js and session.js
// Account management logic - Fixed for ngrok

import { API_URL } from '../js/config.js';
import { getSession } from '../js/session.js';

/**
 * Get user's accounts
 */
export async function getUserAccounts() {
  try {
    const session = getSession();
    
    if (!session) {
      throw new Error('No active session');
    }
    
    console.log('📋 Fetching accounts...');
    console.log('🔗 API URL:', API_URL);
    console.log('🔑 Has token:', !!session.authToken);
    
    const url = `${API_URL}/api/accounts?authToken=${encodeURIComponent(session.authToken)}`;
    console.log('📡 Request URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true' // 🔧 FIX: Bypass ngrok warning page
      }
    });
    
    console.log('📨 Response status:', response.status);
    console.log('📨 Content-Type:', response.headers.get('content-type'));
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Server returned non-JSON response:', text.substring(0, 200));
      throw new Error('Server returned HTML instead of JSON. Check ngrok or backend logs.');
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch accounts: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`✅ Fetched ${result.accounts.length} accounts`);
    
    return result.accounts;
    
  } catch (err) {
    console.error('❌ Error fetching accounts:', err);
    throw err;
  }
}

/**
 * Get account by ID
 */
export async function getAccountById(accountId) {
  try {
    const session = getSession();
    
    if (!session) {
      throw new Error('No active session');
    }
    
    const response = await fetch(
      `${API_URL}/api/accounts/${accountId}?authToken=${encodeURIComponent(session.authToken)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' // 🔧 FIX: Bypass ngrok warning page
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch account: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`✅ Fetched account: ${accountId}`);
    
    return result.account;
    
  } catch (err) {
    console.error('❌ Error fetching account:', err);
    throw err;
  }
}

/**
 * Create new account
 */
export async function createAccount(type, profile) {
  try {
    const session = getSession();
    
    if (!session) {
      throw new Error('No active session');
    }
    
    console.log(`🔨 Creating ${type} account...`);
    
    const response = await fetch(`${API_URL}/api/accounts/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true' // 🔧 FIX: Bypass ngrok warning page
      },
      body: JSON.stringify({
        type,
        profile,
        authToken: session.authToken
      })
    });
    
    console.log('📨 Create account response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create account');
    }
    
    const result = await response.json();
    console.log(`✅ Account created: ${result.account.accountId}`);
    
    return result.account;
    
  } catch (err) {
    console.error('❌ Error creating account:', err);
    throw err;
  }
}

/**
 * Delete account
 */
export async function deleteAccount(accountId) {
  try {
    const session = getSession();
    
    if (!session) {
      throw new Error('No active session');
    }
    
    console.log(`🗑️ Deleting account: ${accountId}`);
    
    const response = await fetch(`${API_URL}/api/accounts/${accountId}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true' // 🔧 FIX: Bypass ngrok warning page
      },
      body: JSON.stringify({
        authToken: session.authToken
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete account');
    }
    
    console.log(`✅ Account deleted: ${accountId}`);
    
    return true;
    
  } catch (err) {
    console.error('❌ Error deleting account:', err);
    throw err;
  }
}