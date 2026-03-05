import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { getAuth, signInWithCustomToken, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { getFirestore, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';
import { FIREBASE_CONFIG, PREFERENCES_API_URL } from '../config.js';
import { getSession } from '../session.js';

const PREFS_STORAGE_KEY = 'hayati_prefs_v1';
const PREFS_CHANGED_EVENT = 'hayatiPrefsChanged';
const ME_API_URL = 'https://api.hayatibank.ru/api/me';

const DEFAULT_PREFS = {
  language: 'ru',
  currency: 'USD',
  metricSystem: 'imperial',
  timezone: 'utc',
  updatedAtMs: 0
};

const PREFS_API_CANDIDATES = [
  window.HAYATI_PREFS_API_URL,
  PREFERENCES_API_URL
].filter(Boolean);

let initialized = false;
let isApplyingRemote = false;
let pushTimer = null;
let realtimeUnsub = null;
let realtimeUid = '';
let realtimeActive = false;
let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let boundAuthInstance = null;

function normalizePrefs(raw = {}) {
  return {
    language: String(raw.language || DEFAULT_PREFS.language).toLowerCase(),
    currency: String(raw.currency || DEFAULT_PREFS.currency).toUpperCase(),
    metricSystem: String(raw.metricSystem || DEFAULT_PREFS.metricSystem).toLowerCase(),
    timezone: String(raw.timezone || DEFAULT_PREFS.timezone).toLowerCase(),
    updatedAtMs: Number(raw.updatedAtMs || 0) || 0
  };
}

function readLocalPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return normalizePrefs({
      ...parsed,
      language: parsed.language || localStorage.getItem('hayati_lang') || DEFAULT_PREFS.language
    });
  } catch (_error) {
    return normalizePrefs({
      language: localStorage.getItem('hayati_lang') || DEFAULT_PREFS.language
    });
  }
}

function writeLocalPrefs(prefs, source = 'cloud') {
  const next = normalizePrefs(prefs);
  localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
  localStorage.setItem('hayati_lang', next.language);
  localStorage.setItem('hb_lang', next.language);
  window.dispatchEvent(new CustomEvent(PREFS_CHANGED_EVENT, {
    detail: { prefs: next, source }
  }));
  return next;
}

function getSessionAuth() {
  const session = getSession();
  if (!session?.uid || !session?.authToken) return null;
  return {
    uid: String(session.uid),
    authToken: String(session.authToken)
  };
}

function buildHeaders(authToken, includeJson = false) {
  const headers = {
    Authorization: `Bearer ${authToken}`
  };

  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

async function apiGetPreferences(uid, authToken) {
  let lastError = null;

  for (const endpoint of PREFS_API_CANDIDATES) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: buildHeaders(authToken, false)
      });

      if (!response.ok) {
        lastError = new Error(`GET ${endpoint} -> ${response.status}`);
        continue;
      }

      const payload = await response.json().catch(() => ({}));
      const prefs = payload?.preferences || payload?.data?.preferences || payload?.data || null;
      if (!prefs || typeof prefs !== 'object') continue;

      return normalizePrefs(prefs);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  return null;
}

async function apiPutPreferences(uid, authToken, prefs) {
  let lastError = null;

  for (const endpoint of PREFS_API_CANDIDATES) {
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: buildHeaders(authToken, true),
        body: JSON.stringify({
          uid,
          ...normalizePrefs(prefs)
        })
      });

      if (!response.ok) {
        lastError = new Error(`PUT ${endpoint} -> ${response.status}`);
        continue;
      }

      return true;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  return false;
}

async function apiGetMeEnvelope(authToken) {
  if (!authToken) return null;
  try {
    const response = await fetch(ME_API_URL, {
      method: 'GET',
      credentials: 'include',
      headers: buildHeaders(authToken, false)
    });
    if (!response.ok) return null;
    const payload = await response.json().catch(() => null);
    if (!payload || payload.ok === false) return null;

    const user = payload.user || payload.result?.user || null;
    const uid = String(user?.uid || payload.uid || payload.result?.uid || '').trim();
    if (!uid) return null;

    const customToken = String(
      payload.customToken ||
      payload.result?.customToken ||
      payload.user?.customToken ||
      ''
    );

    return { uid, customToken };
  } catch (_error) {
    return null;
  }
}

function ensureFirebaseClients(authInstance = null) {
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  }
  if (!firebaseAuth) {
    firebaseAuth = authInstance || getAuth(firebaseApp);
  }
  if (!firestoreDb) {
    firestoreDb = getFirestore(firebaseApp);
  }
  return {
    auth: authInstance || firebaseAuth,
    db: firestoreDb
  };
}

function stopRealtimeListener() {
  if (typeof realtimeUnsub === 'function') {
    realtimeUnsub();
  }
  realtimeUnsub = null;
  realtimeUid = '';
  realtimeActive = false;
}

function applyCloudLanguageIfNeeded(nextPrefs) {
  const cloudLang = nextPrefs.language;
  if (!window.i18n?.isSupported?.(cloudLang)) return;

  const currentLang = window.i18n?.getCurrentLanguage?.();
  if (currentLang === cloudLang) return;

  window.i18n.setLanguage(cloudLang).catch((error) => {
    console.warn('[prefsSync] Language apply failed:', error?.message || error);
  });
}

function processRemotePrefs(rawPrefs = {}, source = 'cloud-stream') {
  const cloudPrefs = normalizePrefs(rawPrefs);
  const localPrefs = readLocalPrefs();

  if (cloudPrefs.updatedAtMs > localPrefs.updatedAtMs) {
    isApplyingRemote = true;
    writeLocalPrefs(cloudPrefs, source);
    applyCloudLanguageIfNeeded(cloudPrefs);
    isApplyingRemote = false;
    return;
  }

  if (localPrefs.updatedAtMs > cloudPrefs.updatedAtMs) {
    scheduleCloudPush(localPrefs);
  }
}

async function startRealtimeListener(authInstance) {
  const auth = getSessionAuth();
  if (!auth?.uid) {
    stopRealtimeListener();
    return false;
  }

  const clients = ensureFirebaseClients(authInstance);
  const activeAuth = clients.auth;

  let targetUid = auth.uid;
  if (activeAuth?.currentUser?.uid) {
    targetUid = String(activeAuth.currentUser.uid);
  }

  if (!activeAuth?.currentUser || targetUid !== auth.uid) {
    const me = await apiGetMeEnvelope(auth.authToken);
    if (me?.uid) {
      targetUid = me.uid;
      if (me.customToken) {
        try {
          await signInWithCustomToken(activeAuth, me.customToken);
        } catch (_error) {
          // Stream may still work if user is already authenticated.
        }
      }
    }
  }

  if (!targetUid) {
    stopRealtimeListener();
    return false;
  }

  if (realtimeUid === targetUid && typeof realtimeUnsub === 'function') {
    realtimeActive = true;
    return true;
  }

  stopRealtimeListener();

  realtimeUid = targetUid;
  const ref = doc(clients.db, `users/${targetUid}/preferences/global`);
  realtimeUnsub = onSnapshot(ref, (snapshot) => {
    if (!snapshot.exists()) return;
    const data = snapshot.data();
    if (!data || typeof data !== 'object') return;
    realtimeActive = true;
    processRemotePrefs(data, 'cloud-stream');
  }, () => {
    realtimeActive = false;
  });

  realtimeActive = true;
  return true;
}

function scheduleCloudPush(prefs) {
  if (pushTimer) clearTimeout(pushTimer);

  pushTimer = setTimeout(async () => {
    const auth = getSessionAuth();
    if (!auth) return;

    try {
      await apiPutPreferences(auth.uid, auth.authToken, prefs);
    } catch (error) {
      console.warn('[prefsSync] Cloud push skipped:', error?.message || error);
    }
  }, 400);
}

async function pullCloudPrefs() {
  const auth = getSessionAuth();
  if (!auth) return;

  try {
    const cloudPrefs = await apiGetPreferences(auth.uid, auth.authToken);
    if (!cloudPrefs) return;
    processRemotePrefs(cloudPrefs, 'cloud-sync');
  } catch (error) {
    console.warn('[prefsSync] Cloud pull skipped:', error?.message || error);
  }
}

export function setupPreferencesCloudSync(authInstance) {
  if (initialized) return;
  initialized = true;

  boundAuthInstance = authInstance || null;

  const bootstrap = readLocalPrefs();
  if (!bootstrap.updatedAtMs) {
    writeLocalPrefs({ ...bootstrap, updatedAtMs: Date.now() }, 'bootstrap');
  }

  window.addEventListener(PREFS_CHANGED_EVENT, (event) => {
    if (isApplyingRemote) return;

    const incoming = event?.detail?.prefs || readLocalPrefs();
    const normalized = normalizePrefs({
      ...incoming,
      updatedAtMs: Number(incoming.updatedAtMs || Date.now())
    });

    scheduleCloudPush(normalized);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void startRealtimeListener(authInstance);
      if (!realtimeActive) {
        void pullCloudPrefs();
      }
    }
  });

  window.addEventListener('focus', () => {
    void startRealtimeListener(authInstance);
    if (!realtimeActive) {
      void pullCloudPrefs();
    }
  });

  if (authInstance) {
    onAuthStateChanged(authInstance, () => {
      void startRealtimeListener(authInstance);
      if (!realtimeActive) {
        void pullCloudPrefs();
      }
    });
  }

  void startRealtimeListener(authInstance);
  void pullCloudPrefs();
}

export function refreshPreferencesCloudSync() {
  if (!initialized) return;
  void startRealtimeListener(boundAuthInstance);
  if (!realtimeActive) {
    void pullCloudPrefs();
  }
}
