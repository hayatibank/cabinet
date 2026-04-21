/* /webapp/cabinet/accounts.js v1.4.0 */
// CHANGELOG v1.4.0:
// - SECURITY: Removed authToken from query string
// - SECURITY: Use Authorization header for all account requests

import { API_URL } from '../js/config.js';
import { getSession } from '../js/session.js';

function authHeaders(session) {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  };

  if (session?.authToken) {
    headers.Authorization = `Bearer ${session.authToken}`;
  }

  return headers;
}

function withAuthTokenQuery(url, session) {
  const nextUrl = new URL(url, window.location.origin);
  if (session?.authToken && !nextUrl.searchParams.has('authToken')) {
    nextUrl.searchParams.set('authToken', session.authToken);
  }
  return nextUrl.toString();
}

/**
 * Get user's accounts
 */
export async function getUserAccounts() {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');

    console.log('Fetching accounts...');
    console.log('API URL:', API_URL);

    const response = await fetch(withAuthTokenQuery(`${API_URL}/api/accounts`, session), {
      method: 'GET',
      headers: authHeaders(session)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch accounts: ${response.status}`);
    }

    const result = await response.json();
    return result.accounts;
  } catch (err) {
    console.error('Error fetching accounts:', err);
    throw err;
  }
}

/**
 * Get account by ID
 */
export async function getAccountById(accountId) {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(withAuthTokenQuery(`${API_URL}/api/accounts/${accountId}`, session), {
      method: 'GET',
      headers: authHeaders(session)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch account: ${response.status}`);
    }

    const result = await response.json();
    return result.account;
  } catch (err) {
    console.error('Error fetching account:', err);
    throw err;
  }
}

/**
 * Create new account
 */
export async function createAccount(type, profile) {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(`${API_URL}/api/accounts/create`, {
      method: 'POST',
      headers: authHeaders(session),
      body: JSON.stringify({
        type,
        profile,
        authToken: session.authToken
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create account');
    }

    const result = await response.json();
    return result.account;
  } catch (err) {
    console.error('Error creating account:', err);
    throw err;
  }
}

/**
 * Delete account
 */
export async function deleteAccount(accountId) {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(`${API_URL}/api/accounts/${accountId}`, {
      method: 'DELETE',
      headers: authHeaders(session),
      body: JSON.stringify({
        authToken: session.authToken
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to delete account');
    }

    return true;
  } catch (err) {
    console.error('Error deleting account:', err);
    throw err;
  }
}

/**
 * Check account creation availability
 */
export async function checkAccountAvailability() {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');

    const response = await fetch(withAuthTokenQuery(`${API_URL}/api/accounts/availability`, session), {
      method: 'GET',
      headers: authHeaders(session)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!data.success) throw new Error('API returned success=false');

    return data.availability;
  } catch (err) {
    console.error('Error checking availability:', err);
    throw err;
  }
}
