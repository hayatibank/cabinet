/* /webapp/js/ui.js v2.2.0 */
// CHANGELOG v2.2.0:
// - FIXED: Document title now reflects loading/auth/cabinet screens
// - FIXED: Title updates on language change while staying on current screen
// - KEPT: Existing screen/error/success APIs

import { getHYCBalance } from '../HayatiCoin/hycService.js';
import { renderHYCBalance } from '../HayatiCoin/hycUI.js';
import { renderHayatiIdInCabinet } from './components/hayatiIdDisplay.js';

const loadingScreen = document.getElementById('loadingScreen');
const authScreen = document.getElementById('authScreen');
const cabinetScreen = document.getElementById('cabinetScreen');

const UNIFIED_AUTH_URL = 'https://auth.hayatibank.ru/';
const RETURN_COOKIE_NAME = 'hayati_return_to';

function setReturnCookie(targetUrl) {
  try {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    const host = location.hostname || '';
    const domain = host.endsWith('.hayatibank.ru') ? '; Domain=.hayatibank.ru' : '';
    document.cookie = `${RETURN_COOKIE_NAME}=${encodeURIComponent(targetUrl)}; Path=/${domain}; SameSite=Lax; Max-Age=120${secure}`;
  } catch (_error) {
    // no-op
  }
}

function t(key, fallback) {
  try {
    return window.i18n?.t?.(key) || fallback;
  } catch (_error) {
    return fallback;
  }
}

function setDocumentTitle(mode = 'auth') {
  if (mode === 'cabinet') {
    document.title = t('app.title.cabinet', 'FH of Hayati - Cabinet');
    return;
  }
  if (mode === 'loading') {
    document.title = t('app.title.loading', 'FH of Hayati - Loading');
    return;
  }
  document.title = t('app.title', 'FH of Hayati - Sign In');
}

export function showScreen(screenId) {
  [loadingScreen, authScreen, cabinetScreen].forEach((screen) => {
    if (screen) screen.classList.add('hidden');
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }
}

export function showLoadingScreen(message = 'Loading...') {
  showScreen('loadingScreen');
  setDocumentTitle('loading');

  const loadingText = loadingScreen?.querySelector('p');
  if (loadingText) loadingText.textContent = message;
}

export function showAuthScreen(mode = 'login') {
  const target = new URL(UNIFIED_AUTH_URL);
  setReturnCookie(window.location.href);
  if (mode && mode !== 'login') target.searchParams.set('mode', mode);
  window.location.replace(target.toString());
}

export async function showCabinet(userData) {
  showScreen('cabinetScreen');
  setDocumentTitle('cabinet');

  const userEmailEl = document.querySelector('.user-email');
  if (userEmailEl) {
    userEmailEl.textContent = userData.email || 'Unknown';
  }

  console.log('[ui] cabinet opened for:', userData.email);

  try {
    renderHayatiIdInCabinet(userData);
  } catch (err) {
    console.warn('[ui] Hayati ID render failed:', err);
  }

  try {
    const hycData = await getHYCBalance();
    if (hycData && hycData.success) {
      renderHYCBalance(hycData.balance);
      console.log('[ui] HYC balance displayed:', hycData.balance);
    }
  } catch (err) {
    console.warn('[ui] HYC balance load failed:', err);
  }

  window.dispatchEvent(new CustomEvent('cabinetReady', {
    detail: userData
  }));
}

export function clearErrors() {
  document.querySelectorAll('.error, .success').forEach((el) => {
    el.classList.add('hidden');
    el.textContent = '';
  });
}

export function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
  console.error(`[ui] ${elementId}:`, message);
}

export function showSuccess(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
  console.log(`[ui] ${elementId}:`, message);
}

if (typeof window !== 'undefined') {
  window.addEventListener('languageChanged', () => {
    if (cabinetScreen && !cabinetScreen.classList.contains('hidden')) {
      setDocumentTitle('cabinet');
      return;
    }
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
      setDocumentTitle('loading');
      return;
    }
    setDocumentTitle('auth');
  });
}
