/* /webapp/app.js v3.4.1 */
// CHANGELOG v3.4.1:
// - FIXED: Removed alerts (silent session handling)
// - FIXED: Infinite reload loop prevention
// - All session management now silent (no user notifications)
// CHANGELOG v3.4.0:
// - ADDED: Session monitoring (checks every minute)
// - ADDED: Visibility monitor (checks when page becomes visible)
// - Auto-redirect to login when session expires
// CHANGELOG v3.3.0:
// - ADDED: Firebase duplicate init protection
// - ADDED: Clear stale auth state on startup (prevents multi-account conflicts)
// - ADDED: Graceful auth error handling (auto-cleanup IndexedDB)
// - FIXED: Session expired/conflict detection with auto-reload
// CHANGELOG v3.2.0:
// - FIXED: Removed experimentalForceLongPolling (causes offline issues)
// - Firestore now uses default WebSocket connection
// CHANGELOG v3.1.1:
// - ADDED: Try-catch fallback for getUserData() (Firestore offline handling)
// - Cabinet now shows even if Firestore is offline
// CHANGELOG v3.1.0:
// - ADDED: getUserData() to fetch full user data from Firestore
// - FIXED: showCabinet() now receives full userData (including hayatiId)
// - User data now loaded before cabinet display
// CHANGELOG v3.0.3:
// - FIXED: Explicit updatePage() call after i18n init with 50ms delay
// - ADDED: Wait for DOM to be fully ready before first translation update

// ==================== STEP 1: LOAD I18N FIRST ====================
import './js/i18n-manager.js';
import './js/components/languageSwitcher.js';
import './js/components/investTopbarControls.js';

// ==================== STEP 2: FIREBASE IMPORTS ====================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { getAuth, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

import { FIREBASE_CONFIG } from './js/config.js';
import { getSession, saveSession, getCurrentChatId, listAllSessions } from './js/session.js';
import { showLoadingScreen, showAuthScreen, showCabinet } from './js/ui.js';
import { setupTokenInterceptor, setupPeriodicTokenCheck, setupBackgroundTokenRefresh, ensureFreshToken } from './js/tokenManager.js';
import { getUserData } from './js/userService.js'; // вњ… NEW
import { setupSessionMonitor, setupVisibilityMonitor } from './js/sessionMonitor.js'; // вњ… NEW
import { setupPreferencesCloudSync } from './js/settings/preferencesCloudSync.js';
import './js/accountActions.js';
import './cabinet/accountsUI.js';
import { claimHYC } from './HayatiCoin/hycService.js';
const ME_API_URL = 'https://api.hayatibank.ru/api/me';

async function restoreSessionFromServerCookie(auth) {
  try {
    const response = await fetch(ME_API_URL, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) return null;

    const payload = await response.json().catch(() => null);
    const customToken = payload?.customToken || '';
    const serverUser = payload?.user || null;
    if (!customToken || !serverUser?.uid) return null;

    const userCredential = await signInWithCustomToken(auth, customToken);
    const user = userCredential.user;
    const idToken = await user.getIdToken(true);
    const chatId = getCurrentChatId();

    saveSession({
      authToken: idToken,
      tokenExpiry: Date.now() + (60 * 60 * 1000),
      uid: user.uid,
      email: user.email || serverUser.email || ''
    }, chatId);

    return { uid: user.uid, email: user.email || serverUser.email || '' };
  } catch (error) {
    console.warn('[app] restoreSessionFromServerCookie failed:', error?.message || error);
    return null;
  }
}

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', async () => {
  console.log('рџљЂ [app.js] DOMContentLoaded - Starting initialization...');
  
  try {
    // ==================== STEP 1: I18N (CRITICAL FIRST) ====================
    console.log('рџЊЌ [app.js] Step 1/7: Initializing i18n...');
    
    if (!window.i18n) {
      throw new Error('i18n manager not found');
    }
    
    await window.i18n.init();
    console.log('вњ… [app.js] i18n ready:', window.i18n.getCurrentLanguage());
    console.log(`рџ“љ [app.js] Loaded ${Object.keys(window.i18n.translations).length} translation keys`);
    
    // вњ… CRITICAL FIX: Wait for DOM to be fully ready before first update
    console.log('вЏі [app.js] Waiting for DOM to be fully ready...');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // вњ… NOW update page translations
    window.i18n.updatePage();
    console.log('вњ… [app.js] Initial translations applied to page');
    
    // ==================== STEP 2: TELEGRAM SETUP ====================
    console.log('рџ“± [app.js] Step 2/7: Setting up Telegram...');
    
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Cyberpunk theme
      tg.setHeaderColor('#0f172a');
      tg.setBackgroundColor('#0f172a');
      
      console.log('вњ… [app.js] Telegram WebApp initialized');
      console.log('рџ“± Platform:', tg.platform);
      console.log('рџ‘¤ User:', tg.initDataUnsafe?.user);
    } else {
      console.log('в„№пёЏ Running in browser (not Telegram)');
    }
    
    // ==================== STEP 3: FIREBASE INIT ====================
    console.log('рџ”Ґ [app.js] Step 3/7: Initializing Firebase...');
    
    // вњ… Check if Firebase already initialized (prevent duplicate init)
    let app;
    try {
      app = initializeApp(FIREBASE_CONFIG);
    } catch (err) {
      if (err.code === 'app/duplicate-app') {
        console.log('вљ пёЏ Firebase already initialized, using existing instance');
        const { getApp } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js');
        app = getApp();
      } else {
        throw err;
      }
    }
    
    const auth = getAuth(app);
    
    // вњ… Clear any stale auth state on startup
    try {
      await auth.signOut();
      console.log('рџ§№ Cleared stale Firebase auth state');
    } catch (cleanupErr) {
      console.log('в„№пёЏ No auth state to clear');
    }
    
    const db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
      // вќЊ REMOVED: experimentalForceLongPolling - causes offline issues
    });
    
    console.log('вњ… Firebase initialized');
    console.log('рџ”Њ Firestore: WebSocket mode (default)');
    
    // ==================== STEP 4: TOKEN MANAGEMENT ====================
    console.log('рџ”’ [app.js] Step 4/7: Setting up token management...');
    
    setupTokenInterceptor();
    setupPeriodicTokenCheck();
    setupBackgroundTokenRefresh();
    setupSessionMonitor(); // вњ… NEW: Monitor session expiry
    setupVisibilityMonitor(); // вњ… NEW: Check session on page visible
    setupPreferencesCloudSync(auth);
    
    console.log('вњ… Token auto-refresh enabled');
    console.log('вњ… Session monitoring enabled');
    
    // ==================== STEP 5: UNIFIED AUTH MODE ====================
    console.log('[app.js] Step 5/7: Unified auth mode active (auth.hayatibank.ru)');
    
    // ==================== STEP 6: SHOW LOADING SCREEN ====================
    console.log('вЏі [app.js] Step 6/7: Showing loading screen...');
    
    showLoadingScreen(window.i18n.t('common.loading'));
    
    // ==================== STEP 7: SESSION CHECK ====================
    console.log('рџ”Ќ [app.js] Step 7/7: Checking session...');
    
    const chatId = getCurrentChatId();
    console.log('рџ“± ChatId:', chatId || 'none (browser)');
    
    const session = getSession(chatId);
    
    if (session) {
      console.log('вњ… Session found:', {
        email: session.email,
        uid: session.uid,
        expires: new Date(session.tokenExpiry).toLocaleString()
      });
      
      // Ensure token is fresh and continue in unified auth mode.
      const freshToken = await ensureFreshToken(chatId);

      if (!freshToken) {
        const restored = await restoreSessionFromServerCookie(auth);
        if (restored?.uid) {
          let userData;
          try {
            userData = await getUserData(restored.uid);
          } catch (err) {
            console.warn('[Restored Session] Could not fetch user data, using minimal data:', err.message);
            userData = null;
          }
          showCabinet(userData || restored);
        } else {
          showAuthScreen('login');
        }
      } else {
        await claimHYC('app_login');

        let userData;
        try {
          userData = await getUserData(session.uid);
        } catch (err) {
          console.warn('вљ пёЏ [Session] Could not fetch user data, using minimal data:', err.message);
          userData = null;
        }

        showCabinet(userData || { uid: session.uid, email: session.email });
      }
    } else {
      console.log('в„№пёЏ No session');
      const restored = await restoreSessionFromServerCookie(auth);
      if (restored?.uid) {
        let userData;
        try {
          userData = await getUserData(restored.uid);
        } catch (err) {
          console.warn('[Restored Session] Could not fetch user data, using minimal data:', err.message);
          userData = null;
        }
        showCabinet(userData || restored);
        console.log('Session restored from server cookie');
        return;
      }
      
      // Unified auth flow only: redirect to auth service.
      showAuthScreen('login');
    }
    
    console.log('вњ…вњ…вњ… App initialization complete!');
    
    // вњ… Clear cleanup flag on success
    sessionStorage.removeItem('firebase_cleanup_attempted');
    
  } catch (err) {
    console.error('вќЊвќЊвќЊ CRITICAL ERROR during initialization:', err);
    
    // вњ… Handle Firebase auth errors gracefully
    if (err.code && err.code.startsWith('auth/')) {
      console.log('рџ§№ Firebase auth error detected, clearing state...');
      
      // Check if we already tried cleanup (prevent infinite loop)
      const cleanupAttempted = sessionStorage.getItem('firebase_cleanup_attempted');
      if (cleanupAttempted) {
        console.error('вќЊ Cleanup already attempted, showing login instead');
        sessionStorage.removeItem('firebase_cleanup_attempted');
        showAuthScreen('login');
        return;
      }
      
      // Mark cleanup as attempted
      sessionStorage.setItem('firebase_cleanup_attempted', 'true');
      
      // Clear IndexedDB and localStorage SILENTLY
      try {
        localStorage.clear();
        const databases = await indexedDB.databases();
        databases.forEach(db => {
          if (db.name?.includes('firebase')) {
            indexedDB.deleteDatabase(db.name);
            console.log(`рџ—‘пёЏ Deleted Firebase DB: ${db.name}`);
          }
        });
      } catch (cleanErr) {
        console.error('вљ пёЏ Cleanup failed:', cleanErr);
      }
      
      // SILENT reload - no alert, just refresh
      console.log('рџ”„ Reloading page...');
      window.location.reload();
      return;
    }
    
    // Show error to user
    alert(`Initialization failed: ${err.message}\n\nPlease refresh the page.`);
    
    // Show login as fallback
    showAuthScreen('login');
  }
});



