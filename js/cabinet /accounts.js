// webapp/js/cabinet/accounts.js
// Account management logic

import { API_URL } from '../config.js';
import { getSession } from '../session.js';

/**
 * Get user's accounts
 */
export async function getUserAccounts() {
  try {
    const session = getSession();
    
    if (!session) {
      throw new Error('No active session');
    }
    
    const response = await fetch(`${API_URL}/api/accounts?authToken=${session.authToken}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts: ${response.status}`);
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
      `${API_URL}/api/accounts/${accountId}?authToken=${session.authToken}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch account: ${response.status}`);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        profile,
        authToken: session.authToken
      })
    });
    
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
      headers: { 'Content-Type': 'application/json' },
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
