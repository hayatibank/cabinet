/* /webapp/auth/accountActions.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - MOVED: From /js/account.js to /auth/ (modular)
// - Renamed: account.js → accountActions.js
// - FIXED: Import paths for new location
// Account management (Logout, Delete Account)

import { getAuth, deleteUser as firebaseDeleteUser } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { clearSession, getSession } from '../js/session.js';
import { showAuthScreen, showLoadingScreen } from '../js/ui.js';
import { deleteUserAccount, deleteTelegramSession } from '../js/api.js';
import { t } from './i18n.js';

/**
 * Logout user
 */
export async function logout() {
  try {
    console.log('👋 Logging out...');
    
    // Get current session before clearing
    const session = getSession();
    
    // FORCE clear session from localStorage
    clearSession();
    localStorage.removeItem('hayati_session'); // Double clear
    
    // Sign out from Firebase Auth
    const auth = getAuth();
    await auth.signOut();
    
    // Delete telegram_sessions from backend
    if (session && session.uid) {
      console.log('🗑️ Deleting telegram_sessions from backend...');
      
      const tg = window.Telegram?.WebApp;
      const chatId = tg?.initDataUnsafe?.user?.id;
      
      if (chatId) {
        try {
          await deleteTelegramSession(chatId, session.uid, session.authToken);
          console.log('✅ telegram_sessions deleted');
        } catch (err) {
          console.warn('⚠️ Failed to delete telegram_sessions:', err);
        }
      }
    }
    
    console.log('✅ Logged out successfully');
    console.log('🔍 localStorage after logout:', localStorage.getItem('hayati_session'));
    
    // Show auth screen
    showAuthScreen('login');
    
  } catch (err) {
    console.error('❌ Error during logout:', err);
    // Force clear and reload
    clearSession();
    localStorage.removeItem('hayati_session');
    localStorage.clear(); // Nuclear option
    location.reload();
  }
}

/**
 * Delete user account (Auth + Firestore + Sessions)
 */
export async function deleteAccount() {
  try {
    // Confirm with user
    const confirmed = confirm(
      `${t('auth.delete.confirm.title')}\n\n` +
      `${t('auth.delete.confirm.question')}\n\n` +
      `${t('auth.delete.confirm.warning')}\n` +
      `${t('auth.delete.confirm.point1')}\n` +
      `${t('auth.delete.confirm.point2')}\n` +
      `${t('auth.delete.confirm.point3')}\n\n` +
      `${t('auth.delete.confirm.continue')}`
    );
    
    if (!confirmed) {
      console.log(t('auth.delete.cancelled'));
      return false;
    }
    
    showLoadingScreen(t('auth.delete.loading'));
    
    // Get current session
    const session = getSession();
    if (!session) {
      alert(t('auth.error.noSession'));
      showAuthScreen('login');
      return false;
    }
    
    const { uid, authToken } = session;
    
    // Backend deletes EVERYTHING (Firestore + telegram_sessions + Firebase Auth)
    console.log('🗑️ Deleting account from backend...');
    const backendDeleted = await deleteUserAccount(uid, authToken);
    
    if (!backendDeleted) {
      alert(t('auth.error.deleteFailed'));
      showAuthScreen('login');
      return false;
    }
    
    console.log('✅ Account deleted successfully');
    
    // Clear local session
    console.log('🗑️ Clearing local session...');
    clearSession();
    
    // Success
    alert(t('auth.delete.success'));
    
    // Show auth screen
    showAuthScreen('login');
    
    return true;
    
  } catch (err) {
    console.error('❌ Error deleting account:', err);
    
    // Show error
    alert(t('auth.error.deleteFailed'));
    
    // Clear session and show login
    clearSession();
    showAuthScreen('login');
    
    return false;
  }
}

// Expose functions to window for button onclick
window.logout = logout;
window.deleteAccount = deleteAccount;