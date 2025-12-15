// webapp/js/account.js
// Account management (Logout, Delete Account)

import { getAuth, deleteUser as firebaseDeleteUser } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { clearSession, getSession } from './session.js';
import { showAuthScreen, showLoadingScreen } from './ui.js';
import { deleteUserAccount } from './api.js';

/**
 * Logout user
 */
export async function logout() {
  try {
    console.log('👋 Logging out...');
    
    // Clear session from localStorage
    clearSession();
    
    // Sign out from Firebase Auth
    const auth = getAuth();
    await auth.signOut();
    
    console.log('✅ Logged out successfully');
    
    // Show auth screen
    showAuthScreen('login');
    
  } catch (err) {
    console.error('❌ Error during logout:', err);
    // Force clear and reload
    clearSession();
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
      '⚠️ ВНИМАНИЕ!\n\n' +
      'Вы действительно хотите удалить аккаунт?\n\n' +
      'Это действие:\n' +
      '• Удалит все ваши данные\n' +
      '• Удалит аккаунт из Firebase\n' +
      '• НЕВОЗМОЖНО ОТМЕНИТЬ\n\n' +
      'Продолжить?'
    );
    
    if (!confirmed) {
      console.log('ℹ️ Account deletion cancelled');
      return false;
    }
    
    showLoadingScreen('Удаление аккаунта...');
    
    // Get current session
    const session = getSession();
    if (!session) {
      alert('❌ Ошибка: нет активной сессии');
      showAuthScreen('login');
      return false;
    }
    
    const { uid, authToken } = session;
    
    // Step 1: Delete from backend (Firestore + telegram_sessions)
    console.log('🗑️ Step 1: Deleting from backend...');
    const backendDeleted = await deleteUserAccount(uid, authToken);
    
    if (!backendDeleted) {
      alert('❌ Ошибка удаления данных из Firestore');
      showAuthScreen('login');
      return false;
    }
    
    console.log('✅ Step 1 complete: Backend data deleted');
    
    // Step 2: Delete from Firebase Auth
    console.log('🗑️ Step 2: Deleting from Firebase Auth...');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      await firebaseDeleteUser(currentUser);
      console.log('✅ Step 2 complete: Auth user deleted');
    } else {
      console.warn('⚠️ No current user in Firebase Auth');
    }
    
    // Step 3: Clear local session
    console.log('🗑️ Step 3: Clearing local session...');
    clearSession();
    console.log('✅ Step 3 complete: Session cleared');
    
    // Success
    alert('✅ Аккаунт успешно удалён');
    console.log('✅ Account deletion complete');
    
    // Show auth screen
    showAuthScreen('login');
    
    return true;
    
  } catch (err) {
    console.error('❌ Error deleting account:', err);
    
    // Show error
    let errorMessage = 'Ошибка удаления аккаунта';
    
    if (err.code === 'auth/requires-recent-login') {
      errorMessage = 'Для удаления аккаунта нужно заново войти в систему';
    }
    
    alert(`❌ ${errorMessage}`);
    
    // Clear session and show login
    clearSession();
    showAuthScreen('login');
    
    return false;
  }
}

// Expose functions to window for button onclick
window.logout = logout;
window.deleteAccount = deleteAccount;
