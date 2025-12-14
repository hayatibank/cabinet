// webapp/app.js v1.4 - Modular structure, fixed session persistence

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Import modules
import { FIREBASE_CONFIG, fetchApiConfig } from './js/config.js';
import { checkTelegramBinding, silentLogin, validateToken } from './js/api.js';
import { login, register, resetPassword } from './js/auth.js';
import { getSession, saveSession, clearSession } from './js/session.js';
import { 
  showLoadingScreen, 
  showAuthScreen, 
  showCabinet, 
  clearErrors,
  showError,
  showSuccess 
} from './js/ui.js';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

// Get Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  console.log('✅ Telegram WebApp initialized');
  console.log('📱 User:', tg.initDataUnsafe?.user);
}

// Telegram data helper
function getTelegramData() {
  if (!tg || !tg.initDataUnsafe?.user) {
    return null;
  }
  
  return {
    chatId: tg.initDataUnsafe.user.id,
    initData: tg.initData,
    user: tg.initDataUnsafe.user
  };
}

// ======================
// MAIN INITIALIZATION
// ======================

async function initMiniApp() {
  try {
    showLoadingScreen('Загрузка конфигурации...');
    
    // STEP 0: Fetch API configuration
    await fetchApiConfig();
    
    showLoadingScreen('Проверка авторизации...');
    
    const telegramData = getTelegramData();
    const chatId = telegramData?.chatId;
    const initData = telegramData?.initData;
    
    console.log('📱 Mini App started');
    if (chatId) {
      console.log('👤 Telegram User ID:', chatId);
    }
    
    // STEP 1: Check localStorage for existing session
    const session = getSession();
    
    if (session) {
      console.log('🔍 Found valid session in localStorage');
      console.log('👤 User:', session.email);
      
      // Validate token with backend
      const isValid = await validateToken(session.authToken, session.uid);
      
      if (isValid) {
        console.log('✅ Token validated, showing cabinet');
        return showCabinet({ 
          uid: session.uid, 
          email: session.email 
        });
      } else {
        console.log('⚠️ Token invalid, clearing session');
        clearSession();
      }
    }
    
    // STEP 2: Check Telegram binding (silent login)
    if (chatId && initData) {
      console.log('🔍 Checking Telegram binding...');
      
      const binding = await checkTelegramBinding(chatId, initData);
      
      if (binding && binding.bound && binding.uid) {
        console.log('✅ Found Telegram binding');
        console.log('🔐 Attempting silent login...');
        
        const loginResult = await silentLogin(binding.uid, chatId, initData);
        
        if (loginResult && loginResult.success) {
          console.log('✅ Silent login successful');
          
          // Save session to localStorage
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
        } else {
          console.warn('⚠️ Silent login failed');
        }
      } else {
        console.log('ℹ️ No Telegram binding found');
      }
    }
    
    // STEP 3: No session and no binding - show auth screen
    console.log('🔓 No authentication found, showing login screen');
    showAuthScreen('login');
    
  } catch (err) {
    console.error('❌ Error initializing Mini App:', err);
    showAuthScreen('login');
  }
}

// ======================
// EVENT HANDLERS
// ======================

// LOGIN
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  
  clearErrors();
  
  if (!email || !password) {
    showError('loginError', 'Заполните все поля');
    return;
  }
  
  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  
  const telegramData = getTelegramData();
  const result = await login(auth, email, password, telegramData);
  
  if (!result.success) {
    btn.disabled = false;
  }
});

// REGISTER
document.getElementById('registerBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('registerEmail')?.value.trim();
  const password = document.getElementById('registerPassword')?.value;
  const passwordConfirm = document.getElementById('registerPasswordConfirm')?.value;
  
  clearErrors();
  
  const btn = document.getElementById('registerBtn');
  btn.disabled = true;
  
  const telegramData = getTelegramData();
  const result = await register(auth, db, email, password, passwordConfirm, telegramData);
  
  if (!result.success) {
    btn.disabled = false;
  }
});

// RESET PASSWORD
document.getElementById('resetBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('resetEmail')?.value.trim();
  
  clearErrors();
  
  const btn = document.getElementById('resetBtn');
  btn.disabled = true;
  
  const result = await resetPassword(auth, email);
  
  if (result.success) {
    showSuccess('resetSuccess', 'Ссылка для сброса пароля отправлена на ваш email');
    document.getElementById('resetEmail').value = '';
    
    setTimeout(() => {
      btn.disabled = false;
      showAuthScreen('login');
    }, 3000);
  } else {
    btn.disabled = false;
  }
});

// Form switching
document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  showAuthScreen('register');
});

document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  showAuthScreen('login');
});

document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  showAuthScreen('reset');
});

document.getElementById('backToLoginLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  showAuthScreen('login');
});

// LOGOUT (if you add a logout button)
window.logout = function() {
  clearSession();
  showAuthScreen('login');
  console.log('👋 Logged out');
};

// ======================
// START APP
// ======================

window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Mini App DOM loaded');
  console.log('📦 Version: 1.4 (modular)');
  initMiniApp();
});
