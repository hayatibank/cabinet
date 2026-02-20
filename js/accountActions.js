/* /webapp/js/accountActions.js v1.0.0 */
// Purpose: account actions (logout, delete account) for cabinet runtime.

import { getAuth } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { clearSession, getSession, getCurrentChatId } from './session.js';
import { showAuthScreen, showLoadingScreen } from './ui.js';
import { deleteUserAccount, deleteTelegramSession } from './api.js';

const LOGOUT_API_URL = 'https://api.hayatibank.ru/api/logout';

export async function logout() {
  try {
    const chatId = getCurrentChatId();
    const session = getSession(chatId);

    clearSession(chatId);

    const auth = getAuth();
    await auth.signOut();

    try {
      await fetch(LOGOUT_API_URL, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.warn('[logout] Server session clear failed:', err?.message || err);
    }

    if (session && session.uid && chatId) {
      try {
        await deleteTelegramSession(chatId, session.uid, session.authToken);
      } catch (err) {
        console.warn('[logout] Failed to delete telegram session:', err?.message || err);
      }
    }

    showAuthScreen('login');
  } catch (err) {
    console.error('[logout] Error:', err);
    clearSession(getCurrentChatId());
    location.reload();
  }
}

export async function deleteAccount() {
  try {
    const t = window.i18n.t.bind(window.i18n);

    const confirmed = confirm(
      `${t('auth.delete.confirm.title')}\n\n` +
      `${t('auth.delete.confirm.question')}\n\n` +
      `${t('auth.delete.confirm.warning')}\n` +
      `${t('auth.delete.confirm.point1')}\n` +
      `${t('auth.delete.confirm.point2')}\n` +
      `${t('auth.delete.confirm.point3')}\n\n` +
      `${t('auth.delete.confirm.continue')}`
    );

    if (!confirmed) return false;

    showLoadingScreen(t('auth.delete.loading'));

    const chatId = getCurrentChatId();
    const session = getSession(chatId);

    if (!session) {
      alert(t('auth.error.noSession'));
      showAuthScreen('login');
      return false;
    }

    const { uid, authToken } = session;
    const backendDeleted = await deleteUserAccount(uid, authToken);

    if (!backendDeleted) {
      alert(t('auth.error.deleteFailed'));
      showAuthScreen('login');
      return false;
    }

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('hayati_session_')) continue;
      const sessionStr = localStorage.getItem(key);
      if (!sessionStr) continue;
      const sess = JSON.parse(sessionStr);
      if (sess.uid === uid) keysToRemove.push(key);
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem('hayati_session');
    localStorage.removeItem('hayati_current_chat');

    alert(t('auth.delete.success'));
    showAuthScreen('login');
    return true;
  } catch (err) {
    const t = window.i18n.t.bind(window.i18n);
    console.error('[deleteAccount] Error:', err);
    alert(t('auth.error.deleteFailed'));
    localStorage.clear();
    showAuthScreen('login');
    return false;
  }
}

window.logout = logout;
window.deleteAccount = deleteAccount;

