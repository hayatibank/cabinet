// webapp/app.js v1.2
// Updated to save full Telegram metadata when linking

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB5CJlw23KPmN5HbY6S9gQKbUgb41_RxMw",
  authDomain: "tms-test-nlyynt.firebaseapp.com",
  databaseURL: "https://tms-test-nlyynt.firebaseio.com",
  projectId: "tms-test-nlyynt",
  storageBucket: "tms-test-nlyynt.appspot.com",
  messagingSenderId: "1036707590928",
  appId: "1:1036707590928:web:3519c03e00297347d0eb95",
  measurementId: "G-BYXEPGS2LM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  console.log('✅ Telegram WebApp initialized');
  console.log('📱 Telegram User:', tg.initDataUnsafe?.user);
}

// API URL
const API_URL = 'https://c4c6f193f4c5.ngrok-free.app'; // Update this to your ngrok URL

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const authScreen = document.getElementById('authScreen');
const cabinetScreen = document.getElementById('cabinetScreen');

// Auth forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const resetForm = document.getElementById('resetForm');

// ======================
// SCREEN MANAGEMENT
// ======================

function showScreen(screenId) {
  [loadingScreen, authScreen, cabinetScreen].forEach(screen => {
    if (screen) screen.classList.add('hidden');
  });
  
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }
}

function showLoadingScreen(message = 'Загрузка...') {
  showScreen('loadingScreen');
  const loadingText = loadingScreen.querySelector('p');
  if (loadingText) loadingText.textContent = message;
}

function showAuthScreen(mode = 'login') {
  showScreen('authScreen');
  
  // Show appropriate form
  if (loginForm) loginForm.classList.add('hidden');
  if (registerForm) registerForm.classList.add('hidden');
  if (resetForm) resetForm.classList.add('hidden');
  
  if (mode === 'login' && loginForm) {
    loginForm.classList.remove('hidden');
  } else if (mode === 'register' && registerForm) {
    registerForm.classList.remove('hidden');
  } else if (mode === 'reset' && resetForm) {
    resetForm.classList.remove('hidden');
  }
  
  clearErrors();
}

function showCabinet(userData) {
  showScreen('cabinetScreen');
  
  // Display user email
  const userEmailEl = document.querySelector('.user-email');
  if (userEmailEl) {
    userEmailEl.textContent = userData.email || 'Unknown';
  }
  
  console.log('✅ Cabinet opened for:', userData.email);
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
    console.log('Chat ID:', chatId);
    
    // STEP 1: Check localStorage for existing session
    const session = localStorage.getItem('hayati_session');
    
    if (session) {
      console.log('🔍 Found session in localStorage');
      const { authToken, tokenExpiry, uid, email } = JSON.parse(session);
      
      // Check if token is still valid (30 days)
      if (Date.now() < tokenExpiry) {
        console.log('✅ Token still valid, validating...');
        
        // Validate token with backend
        const isValid = await validateToken(authToken, uid);
        
        if (isValid) {
          console.log('✅ Token validated, showing cabinet');
          return showCabinet({ uid, email });
        } else {
          console.log('⚠️ Token invalid, clearing session');
          localStorage.removeItem('hayati_session');
        }
      } else {
        console.log('⏰ Token expired, clearing session');
        localStorage.removeItem('hayati_session');
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
// API CALLS
// ======================

async function checkTelegramBinding(chatId, initData) {
  try {
    const response = await fetch(`${API_URL}/api/check-telegram-binding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, initData })
    });
    
    if (!response.ok) {
      console.error('❌ Binding check failed:', response.status);
      return null;
    }
    
    return await response.json();
  } catch (err) {
    console.error('❌ Error checking binding:', err);
    return null;
  }
}

async function silentLogin(uid, chatId, initData) {
  try {
    const response = await fetch(`${API_URL}/api/silent-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, chatId, initData })
    });
    
    if (!response.ok) {
      console.error('❌ Silent login failed:', response.status);
      return null;
    }
    
    return await response.json();
  } catch (err) {
    console.error('❌ Error during silent login:', err);
    return null;
  }
}

async function validateToken(authToken, uid) {
  try {
    const response = await fetch(`${API_URL}/api/validate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authToken, uid })
    });
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.valid === true;
  } catch (err) {
    console.error('❌ Error validating token:', err);
    return false;
  }
}

async function linkTelegramAccount(uid, authToken) {
  try {
    const chatId = tg?.initDataUnsafe?.user?.id;
    const initData = tg?.initData;
    const telegramUser = tg?.initDataUnsafe?.user;
    
    if (!chatId || !initData) {
      console.warn('⚠️ No Telegram data available for linking');
      return false;
    }
    
    console.log('🔗 Linking Telegram account:', {
      chatId,
      username: telegramUser?.username,
      firstName: telegramUser?.first_name
    });
    
    const response = await fetch(`${API_URL}/api/link-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        uid, 
        chatId, 
        initData, 
        telegramUser,
        authToken 
      })
    });
    
    if (!response.ok) {
      console.error('❌ Linking failed:', response.status);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ Telegram linked successfully');
    return result.success === true;
  } catch (err) {
    console.error('❌ Error linking Telegram:', err);
    return false;
  }
}

// ======================
// SESSION MANAGEMENT
// ======================

function saveSession(sessionData) {
  localStorage.setItem('hayati_session', JSON.stringify(sessionData));
  console.log('💾 Session saved to localStorage');
}

function clearSession() {
  localStorage.removeItem('hayati_session');
  console.log('🗑️ Session cleared');
}

// ======================
// AUTH FORMS
// ======================

function clearErrors() {
  document.querySelectorAll('.error, .success').forEach(el => {
    el.classList.add('hidden');
    el.textContent = '';
  });
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
}

function showSuccess(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
}

// LOGIN
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  
  clearErrors();
  
  if (!email || !password) {
    showError('loginError', 'Заполните все поля');
    return;
  }
  
  try {
    document.getElementById('loginBtn').disabled = true;
    showLoadingScreen('Вход в систему...');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    
    console.log('✅ Login successful:', user.email);
    
    // Link Telegram if opened from Telegram
    await linkTelegramAccount(user.uid, token);
    
    // Save session
    saveSession({
      authToken: token,
      tokenExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000),
      uid: user.uid,
      email: user.email
    });
    
    // Show cabinet
    showCabinet({ uid: user.uid, email: user.email });
    
  } catch (error) {
    document.getElementById('loginBtn').disabled = false;
    
    let errorMessage = 'Ошибка входа';
    if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Неверный email или пароль';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'Пользователь не найден';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Неверный пароль';
    }
    
    showAuthScreen('login');
    showError('loginError', errorMessage);
  }
});

// REGISTER
document.getElementById('registerBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('registerEmail')?.value.trim();
  const password = document.getElementById('registerPassword')?.value;
  const passwordConfirm = document.getElementById('registerPasswordConfirm')?.value;
  
  clearErrors();
  
  if (!email || !password || !passwordConfirm) {
    showError('registerError', 'Заполните все поля');
    return;
  }
  
  if (password.length < 6) {
    showError('registerError', 'Пароль должен быть минимум 6 символов');
    return;
  }
  
  if (password !== passwordConfirm) {
    showError('registerError', 'Пароли не совпадают');
    return;
  }
  
  try {
    document.getElementById('registerBtn').disabled = true;
    showLoadingScreen('Регистрация...');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    
    // Get Telegram data if available
    const tgUser = tg?.initDataUnsafe?.user;
    const tgChatId = tgUser?.id;
    
    // Create user document in Firestore with full structure
    await setDoc(doc(db, 'users', user.uid), {
      // SSOT: Firebase Auth UID
      uid: user.uid,
      email: user.email,
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Status
      status: 'active',
      createdBy: tgChatId ? 'telegram-mini-app' : 'web',
      
      // Profile
      profile: {
        createdAt: serverTimestamp(),
        userType: tgChatId ? 'telegram' : 'web',
        riskLevel: 'unknown',
        segment: 'registered' // lead → registered → active
      },
      
      // Contacts
      contacts: {
        email: user.email,
        phone: null,
        telegram: tgUser?.username ? `https://t.me/${tgUser.username}` : null
      },
      
      // Telegram metadata (if registered from Telegram)
      ...(tgUser && {
        tgId: tgUser.id,
        tgUsername: tgUser.username || null,
        tgLanguage: tgUser.language_code || null,
        tgIsPremium: tgUser.is_premium || false,
        nameFirst: tgUser.first_name || null,
        nameLast: tgUser.last_name || null,
        nameFull: `${tgUser.first_name || ''}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`.trim() || null
      }),
      
      // Arrays
      telegramAccounts: [],
      userAccessIDs: tgChatId ? [String(tgChatId), tgChatId] : [],
      userActionCasesPermitted: [
        'balanceShow',
        'paymentsShow',
        'expenseItemsShowAll'
      ]
    });
    
    console.log('✅ User document created in Firestore');
    console.log('✅ Registration successful:', user.email);
    
    // Link Telegram if opened from Telegram
    if (tgChatId) {
      await linkTelegramAccount(user.uid, token);
    }
    
    // Save session
    saveSession({
      authToken: token,
      tokenExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000),
      uid: user.uid,
      email: user.email
    });
    
    // Show cabinet
    showCabinet({ uid: user.uid, email: user.email });
    
  } catch (error) {
    document.getElementById('registerBtn').disabled = false;
    
    let errorMessage = 'Ошибка регистрации';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Этот email уже зарегистрирован';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Неверный формат email';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Слишком простой пароль';
    }
    
    showAuthScreen('register');
    showError('registerError', errorMessage);
  }
});

// RESET PASSWORD
document.getElementById('resetBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('resetEmail')?.value.trim();
  
  clearErrors();
  
  if (!email) {
    showError('resetError', 'Введите email');
    return;
  }
  
  try {
    document.getElementById('resetBtn').disabled = true;
    await sendPasswordResetEmail(auth, email);
    
    showSuccess('resetSuccess', 'Ссылка для сброса пароля отправлена на ваш email');
    document.getElementById('resetEmail').value = '';
    
    setTimeout(() => showAuthScreen('login'), 3000);
  } catch (error) {
    document.getElementById('resetBtn').disabled = false;
    
    let errorMessage = 'Ошибка отправки';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Пользователь с таким email не найден';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Неверный формат email';
    }
    
    showError('resetError', errorMessage);
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

// ======================
// START APP
// ======================

window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Mini App DOM loaded');
  initMiniApp();
});
