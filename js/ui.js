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
const tickerTextEl = document.getElementById('cabinetTickerText');
const backIconEl = document.getElementById('dashboardBackIcon');

const UNIFIED_AUTH_URL = 'https://auth.hayatibank.ru/';
const RETURN_COOKIE_NAME = 'hayati_return_to';

const tickerState = {
  accountType: '',
  displayName: '',
  fullName: '',
  email: '',
  hayatiId: '',
  tier: '',
  hycBalance: ''
};

function extractBestDisplayName(userData = {}) {
  const pick = (...values) => {
    for (const value of values) {
      const normalized = String(value || '').trim();
      if (normalized) return normalized;
    }
    return '';
  };

  const direct = pick(
    userData.displayName,
    userData.fullName,
    userData.full_name,
    userData.name,
    userData.username,
    userData.userName
  );
  if (direct) return direct;

  const topLevel = pick(
    `${pick(userData.firstName)} ${pick(userData.lastName)}`.trim(),
    `${pick(userData.givenName)} ${pick(userData.familyName)}`.trim(),
    `${pick(userData.first_name)} ${pick(userData.last_name)}`.trim()
  );
  if (topLevel) return topLevel;

  const nestedSources = [
    userData.profile,
    userData.user,
    userData.firebaseUser,
    userData.telegramUser,
    userData.telegram,
    userData.data
  ];
  for (const source of nestedSources) {
    if (!source || typeof source !== 'object') continue;
    const nested = pick(
      source.displayName,
      source.fullName,
      source.full_name,
      source.name,
      `${pick(source.firstName)} ${pick(source.lastName)}`.trim(),
      `${pick(source.givenName)} ${pick(source.familyName)}`.trim(),
      `${pick(source.first_name)} ${pick(source.last_name)}`.trim(),
      source.username,
      source.userName
    );
    if (nested) return nested;
  }

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const tgName = pick(
    `${pick(tgUser?.first_name)} ${pick(tgUser?.last_name)}`.trim(),
    tgUser?.username
  );
  if (tgName) return tgName;

  return '';
}

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

function updateCabinetTicker() {
  if (!tickerTextEl) return;
  const tLabel = t('hayatiId.label', 'Hayati ID');
  const hycLabel = 'Hayati vCoin';
  const displayNameLabel = t('cabinet.ticker.displayName', 'Display name');

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const pods = [];
  const fullName = String(tickerState.fullName || '').trim();
  const displayName = String(tickerState.displayName || '').trim();
  if (fullName) {
    pods.push(`<span class="ticker-pod pod-name">${escapeHtml(fullName)}</span>`);
  }
  if (displayName && displayName.toLowerCase() !== fullName.toLowerCase()) {
    pods.push(`<span class="ticker-pod pod-display">${escapeHtml(displayNameLabel)}: ${escapeHtml(displayName)}</span>`);
  }
  if (tickerState.email) {
    pods.push(`<span class="ticker-pod pod-email">${escapeHtml(tickerState.email)}</span>`);
  }
  if (tickerState.hayatiId) {
    const tier = String(tickerState.tier || '').trim();
    const tierChip = tier ? ` <span class="ticker-tier">[ ${escapeHtml(tier)} ]</span>` : '';
    pods.push(`<span class="ticker-pod pod-id">${escapeHtml(tLabel)}: ${escapeHtml(tickerState.hayatiId)}${tierChip}</span>`);
  }
  if (tickerState.hycBalance) {
    pods.push(`<span class="ticker-pod pod-coin">${hycLabel}: ${escapeHtml(tickerState.hycBalance)} vHYC</span>`);
  }

  tickerTextEl.innerHTML = pods.join('') || '<span class="ticker-pod">-</span>';
}

function setCabinetHeaderTitle(inAccountContext = false) {
  const cabinetTitle = document.querySelector('.cabinet-header h2');
  if (!cabinetTitle) return;
  cabinetTitle.textContent = inAccountContext
    ? t('cabinet.accountType.individual', '👤 Individual')
    : t('cabinet.accounts', 'Accounts');
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
  setCabinetHeaderTitle(false);

  const userEmailEl = document.querySelector('.user-email');
  if (userEmailEl) {
    userEmailEl.textContent = userData.email || 'Unknown';
  }
  const candidateDisplayName = extractBestDisplayName(userData);
  tickerState.displayName = candidateDisplayName || '';
  tickerState.email = userData.email || '';

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
      tickerState.hycBalance = Number(hycData.balance || 0).toFixed(3).replace(/\.?0+$/, '');
    }
  } catch (err) {
    console.warn('[ui] HYC balance load failed:', err);
  }

  window.dispatchEvent(new CustomEvent('cabinetReady', {
    detail: userData
  }));

  updateCabinetTicker();
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
  backIconEl?.addEventListener('click', () => {
    try {
      window.accountNavigation?.goBack?.();
    } catch (_err) {
      // no-op
    }
  });

  window.addEventListener('cabinetAccountContextChanged', (event) => {
    const detail = event?.detail || {};
    tickerState.accountType = detail.accountType || '';
    tickerState.fullName = detail.fullName || '';
    setCabinetHeaderTitle(true);
    backIconEl?.classList.remove('hidden');
    updateCabinetTicker();
  });

  window.addEventListener('cabinetAccountContextCleared', () => {
    tickerState.accountType = '';
    tickerState.fullName = '';
    setCabinetHeaderTitle(false);
    backIconEl?.classList.add('hidden');
    updateCabinetTicker();
  });

  window.addEventListener('hayatiIdUpdated', (event) => {
    const detail = event?.detail || {};
    tickerState.hayatiId = detail.hayatiId || '';
    tickerState.tier = detail.tierText || '';
    updateCabinetTicker();
  });

  window.addEventListener('hycBalanceUpdated', (event) => {
    const detail = event?.detail || {};
    tickerState.hycBalance = detail.formatted || '';
    updateCabinetTicker();
  });

  window.addEventListener('cabinetProfileUpdated', (event) => {
    const detail = event?.detail || {};
    if (detail.displayName) {
      tickerState.displayName = String(detail.displayName);
    }
    updateCabinetTicker();
  });

  window.addEventListener('languageChanged', () => {
    setCabinetHeaderTitle(Boolean(tickerState.fullName));
    if (cabinetScreen && !cabinetScreen.classList.contains('hidden')) {
      setDocumentTitle('cabinet');
      updateCabinetTicker();
      return;
    }
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
      setDocumentTitle('loading');
      updateCabinetTicker();
      return;
    }
    updateCabinetTicker();
    setDocumentTitle('auth');
  });
}
