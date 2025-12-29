/* /webapp/app.js v1.3.1 */
// CHANGELOG v1.3.1:
// - FIXED: Force Firestore to use Long Polling instead of WebSocket
// - This fixes "WebChannelConnection RPC Write stream transport errored"
// - Added experimentalForceLongPolling to initializeFirestore
// CHANGELOG v1.3.0:
// - FIXED: Import paths updated for auth module
// - ADDED: Cabinet module initialization
// - REMOVED: Reliance on ui.js auto-loading cabinet
// CHANGELOG v1.2.6:
// - Added global token refresh interceptor
// - Added periodic token health check
// - Improved session reliability for Telegram miniapp

// Main entry point

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { getAuth, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

// Import modules
import { FIREBASE_CONFIG } from './js/config.js';
import { checkTelegramBinding, silentLogin, validateToken } from './js/api.js';
import { setupLoginHandler, setupRegisterHandler, setupResetHandler, setupFormSwitching } from './auth/authForms.js';
import { getSession, saveSession } from './js/session.js';
import { showLoadingScreen, showAuthScreen, showCabinet } from './js/ui.js';
import { setupTokenInterceptor, setupPeriodicTokenCheck } from './js/tokenManager.js';
import './auth/accountActions.js'; // Imports logout & deleteAccount functions
import './cabinet/accountsUI.js'; // Registers cabinetReady event listener

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);

// ✅ FIXED: Initialize Firestore with Long Polling (no WebSocket)
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,  // ✅ Disable WebSocket, use HTTP Long Polling
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

console.log('✅ Firebase initialized');
console.log('🔌 Firestore: Long Polling mode (WebSocket disabled)');

// ✅ Setup token management system
setupTokenInterceptor();
setupPeriodicTokenCheck();
console.log('🔒 Token auto-refresh system enabled');

// Get Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  console.log('✅ Telegram WebApp initialized');
  console.log('📱 Telegram User:', tg.initDataUnsafe?.user);
}

// ======================
// MAIN INITIALIZATION
// ======================

async function initMiniApp() {
  try {
    showLoadingScreen('Проверка авторизации...');
    
    const chatId = tg?.initDataUnsafe?.user?.id;
    const initData = tg?.initData;
    
    console.log('📱 Mini App started');
    if (chatId) console.log('👤 Chat ID:', chatId);
    
    // STEP 1: Check localStorage for existing session
    const session = getSession();
    
    if (session) {
      console.log('🔍 Found session, validating...');
      
      const isValid = await validateToken(session.authToken, session.uid);
      
      if (isValid) {
        console.log('✅ Token valid, showing cabinet');
        return showCabinet({ uid: session.uid, email: session.email });
      } else {
        console.log('⚠️ Token invalid, clearing');
      }
    }
    
    // STEP 2: Check Telegram binding (if opened from Telegram)
    if (chatId && initData) {
      console.log('🔍 Checking Telegram binding...');
      
      const binding = await checkTelegramBinding(chatId, initData);
      
      if (binding && binding.bound && binding.uid) {
        console.log('✅ Found Telegram binding, attempting silent login...');
        
        const loginResult = await silentLogin(binding.uid, chatId, initData);
        
        if (loginResult && loginResult.success) {
          console.log('✅ Silent login successful');
          
          // Exchange Custom Token for ID Token
          try {
            console.log('🔄 Exchanging custom token for ID token...');
            
            const userCredential = await signInWithCustomToken(auth, loginResult.authToken);
            const idToken = await userCredential.user.getIdToken();
            
            console.log('✅ ID Token obtained');
            
            // Save session with ID Token
            saveSession({
              authToken: idToken,
              tokenExpiry: loginResult.tokenExpiry,
              uid: loginResult.uid,
              email: loginResult.email
            });
            
            return showCabinet({
              uid: loginResult.uid,
              email: loginResult.email
            });
          } catch (tokenError) {
            console.error('❌ Error exchanging custom token:', tokenError);
            
            // Fallback: save as-is
            saveSession({
              authToken: loginResult.authToken,
              tokenExpiry: loginResult.tokenExpiry,
              uid: loginResult.uid,
              email: loginResult.email
            });
            
            return showCabinet({
              uid: loginResult.uid,
              email: loginResult.email
            });
          }
        }
      }
    }
    
    // STEP 3: No session and no binding - show auth screen
    console.log('🔓 No session found, showing auth screen');
    showAuthScreen('login');
    
  } catch (err) {
    console.error('❌ Error initializing Mini App:', err);
    showAuthScreen('login');
  }
}

// ======================
// SETUP EVENT HANDLERS
// ======================

window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Mini App DOM loaded');
  
  // Setup auth form handlers
  setupLoginHandler(auth);
  setupRegisterHandler(auth, db);
  setupResetHandler(auth);
  setupFormSwitching();
  
  // Initialize app
  initMiniApp();
});