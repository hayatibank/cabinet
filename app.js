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

// ==================== STEP 2: FIREBASE IMPORTS ====================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { getAuth, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

import { FIREBASE_CONFIG } from './js/config.js';
import { checkTelegramBinding, silentLogin, validateToken } from './js/api.js';
import { setupLoginHandler, setupRegisterHandler, setupResetHandler, setupFormSwitching } from './auth/authForms.js';
import { getSession, saveSession, getCurrentChatId, listAllSessions } from './js/session.js';
import { showLoadingScreen, showAuthScreen, showCabinet } from './js/ui.js';
import { setupTokenInterceptor, setupPeriodicTokenCheck, setupBackgroundTokenRefresh, ensureFreshToken } from './js/tokenManager.js';
import { getUserData } from './js/userService.js'; // ✅ NEW
import { setupSessionMonitor, setupVisibilityMonitor } from './js/sessionMonitor.js'; // ✅ NEW
import './auth/accountActions.js';
import './cabinet/accountsUI.js';
import { claimHYC } from './HayatiCoin/hycService.js';

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 [app.js] DOMContentLoaded - Starting initialization...');
  
  try {
    // ==================== STEP 1: I18N (CRITICAL FIRST) ====================
    console.log('🌍 [app.js] Step 1/7: Initializing i18n...');
    
    if (!window.i18n) {
      throw new Error('i18n manager not found');
    }
    
    await window.i18n.init();
    console.log('✅ [app.js] i18n ready:', window.i18n.getCurrentLanguage());
    console.log(`📚 [app.js] Loaded ${Object.keys(window.i18n.translations).length} translation keys`);
    
    // ✅ CRITICAL FIX: Wait for DOM to be fully ready before first update
    console.log('⏳ [app.js] Waiting for DOM to be fully ready...');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // ✅ NOW update page translations
    window.i18n.updatePage();
    console.log('✅ [app.js] Initial translations applied to page');
    
    // ==================== STEP 2: TELEGRAM SETUP ====================
    console.log('📱 [app.js] Step 2/7: Setting up Telegram...');
    
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Cyberpunk theme
      tg.setHeaderColor('#0f172a');
      tg.setBackgroundColor('#0f172a');
      
      console.log('✅ [app.js] Telegram WebApp initialized');
      console.log('📱 Platform:', tg.platform);
      console.log('👤 User:', tg.initDataUnsafe?.user);
    } else {
      console.log('ℹ️ Running in browser (not Telegram)');
    }
    
    // ==================== STEP 3: FIREBASE INIT ====================
    console.log('🔥 [app.js] Step 3/7: Initializing Firebase...');
    
    // ✅ Check if Firebase already initialized (prevent duplicate init)
    let app;
    try {
      app = initializeApp(FIREBASE_CONFIG);
    } catch (err) {
      if (err.code === 'app/duplicate-app') {
        console.log('⚠️ Firebase already initialized, using existing instance');
        const { getApp } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js');
        app = getApp();
      } else {
        throw err;
      }
    }
    
    const auth = getAuth(app);
    
    // ✅ Clear any stale auth state on startup
    try {
      await auth.signOut();
      console.log('🧹 Cleared stale Firebase auth state');
    } catch (cleanupErr) {
      console.log('ℹ️ No auth state to clear');
    }
    
    const db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
      // ❌ REMOVED: experimentalForceLongPolling - causes offline issues
    });
    
    console.log('✅ Firebase initialized');
    console.log('🔌 Firestore: WebSocket mode (default)');
    
    // ==================== STEP 4: TOKEN MANAGEMENT ====================
    console.log('🔒 [app.js] Step 4/7: Setting up token management...');
    
    setupTokenInterceptor();
    setupPeriodicTokenCheck();
    setupBackgroundTokenRefresh();
    setupSessionMonitor(); // ✅ NEW: Monitor session expiry
    setupVisibilityMonitor(); // ✅ NEW: Check session on page visible
    
    console.log('✅ Token auto-refresh enabled');
    console.log('✅ Session monitoring enabled');
    
    // ==================== STEP 5: AUTH HANDLERS ====================
    console.log('🔐 [app.js] Step 5/7: Setting up auth handlers...');
    
    setupLoginHandler(auth);
    setupRegisterHandler(auth, db);
    setupResetHandler(auth);
    setupFormSwitching();
    
    console.log('✅ Auth handlers registered');
    
    // ==================== STEP 6: SHOW LOADING SCREEN ====================
    console.log('⏳ [app.js] Step 6/7: Showing loading screen...');
    
    showLoadingScreen(window.i18n.t('common.loading'));
    
    // ==================== STEP 7: SESSION CHECK ====================
    console.log('🔍 [app.js] Step 7/7: Checking session...');
    
    const chatId = getCurrentChatId();
    console.log('📱 ChatId:', chatId || 'none (browser)');
    
    const session = getSession(chatId);
    
    if (session) {
      console.log('✅ Session found:', {
        email: session.email,
        uid: session.uid,
        expires: new Date(session.tokenExpiry).toLocaleString()
      });
      
      // Validate token
      const isValid = await validateToken(session.authToken, session.uid);
      
      if (isValid) {
        console.log('✅ Token valid, loading cabinet...');
        
        // Claim HYC for app login (silent)
        await claimHYC('app_login');
        
        // ✅ Fetch full user data from Firestore (with fallback)
        let userData;
        try {
          userData = await getUserData(session.uid);
        } catch (err) {
          console.warn('⚠️ [Session] Could not fetch user data, using minimal data:', err.message);
          userData = null;
        }
        
        // ✅ NOW show cabinet with full userData (including hayatiId)
        showCabinet(userData || { uid: session.uid, email: session.email });
      } else {
        console.log('⚠️ Token expired');
        showAuthScreen('login');
      }
    } else {
      console.log('ℹ️ No session');
      
      // Try Telegram auto-login
      if (tg && tg.initDataUnsafe?.user) {
        const tgChatId = tg.initDataUnsafe.user.id;
        
        console.log('🔍 Checking Telegram binding:', tgChatId);
        
        const binding = await checkTelegramBinding(tgChatId, tg.initData);
        
        if (binding && binding.bound) {
          console.log('🔗 Telegram bound to:', binding.uid);
          
          const silentLoginResult = await silentLogin(binding.uid, tgChatId, tg.initData);
          
          if (silentLoginResult && silentLoginResult.success) {
            console.log('✅ Silent login successful');
            
            const userCredential = await signInWithCustomToken(auth, silentLoginResult.customToken);
            const user = userCredential.user;
            const idToken = await user.getIdToken(true);
            
            saveSession({
              authToken: idToken,
              tokenExpiry: Date.now() + (60 * 60 * 1000),
              uid: user.uid,
              email: user.email
            }, tgChatId);
            
            // Claim HYC for app login (silent)
            await claimHYC('app_login');
            
            // ✅ Fetch full user data from Firestore (with fallback)
            let userData;
            try {
              userData = await getUserData(user.uid);
            } catch (err) {
              console.warn('⚠️ [Telegram] Could not fetch user data, using minimal data:', err.message);
              userData = null;
            }
            
            showCabinet(userData || { uid: user.uid, email: user.email });
          } else {
            console.log('⚠️ Silent login failed');
            showAuthScreen('login');
          }
        } else {
          console.log('ℹ️ Telegram not bound');
          showAuthScreen('login');
        }
      } else {
        console.log('ℹ️ Not in Telegram');
        showAuthScreen('login');
      }
    }
    
    console.log('✅✅✅ App initialization complete!');
    
    // ✅ Clear cleanup flag on success
    sessionStorage.removeItem('firebase_cleanup_attempted');
    
  } catch (err) {
    console.error('❌❌❌ CRITICAL ERROR during initialization:', err);
    
    // ✅ Handle Firebase auth errors gracefully
    if (err.code && err.code.startsWith('auth/')) {
      console.log('🧹 Firebase auth error detected, clearing state...');
      
      // Check if we already tried cleanup (prevent infinite loop)
      const cleanupAttempted = sessionStorage.getItem('firebase_cleanup_attempted');
      if (cleanupAttempted) {
        console.error('❌ Cleanup already attempted, showing login instead');
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
            console.log(`🗑️ Deleted Firebase DB: ${db.name}`);
          }
        });
      } catch (cleanErr) {
        console.error('⚠️ Cleanup failed:', cleanErr);
      }
      
      // SILENT reload - no alert, just refresh
      console.log('🔄 Reloading page...');
      window.location.reload();
      return;
    }
    
    // Show error to user
    alert(`Initialization failed: ${err.message}\n\nPlease refresh the page.`);
    
    // Show login as fallback
    showAuthScreen('login');
  }
});