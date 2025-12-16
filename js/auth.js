// webapp/js/auth.js v1.2.5 - Always get ID tokens
// Authentication handlers (Login, Register, Reset Password)

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

import { linkTelegramAccount } from './api.js';
import { saveSession } from './session.js';
import { showLoadingScreen, showAuthScreen, showCabinet, showError, showSuccess, clearErrors } from './ui.js';

// Get Telegram WebApp
const tg = window.Telegram?.WebApp;

/**
 * Setup login form handler
 */
export function setupLoginHandler(auth) {
  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    clearErrors();
    
    if (!email || !password) {
      showError('loginError', 'Заполните все поля');
      return;
    }
    
    try {
      const loginBtn = document.getElementById('loginBtn');
      loginBtn.disabled = true;
      showLoadingScreen('Вход в систему...');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 🔧 FIX: Get ID Token (not custom token)
      const token = await user.getIdToken();
      
      console.log('✅ Login successful:', user.email);
      console.log('✅ ID Token obtained');
      
      // Link Telegram if opened from Telegram
      const telegramData = getTelegramData();
      if (telegramData) {
        await linkTelegramAccount(user.uid, token, telegramData);
      }
      
      // Save session with ID Token
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
}

/**
 * Setup register form handler
 */
export function setupRegisterHandler(auth, db) {
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
      const registerBtn = document.getElementById('registerBtn');
      registerBtn.disabled = true;
      showLoadingScreen('Регистрация...');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 🔧 FIX: Get ID Token (not custom token)
      const token = await user.getIdToken();
      
      console.log('✅ Registration successful:', user.email);
      console.log('✅ ID Token obtained');
      
      // Get Telegram data if available
      const tgUser = tg?.initDataUnsafe?.user;
      const tgChatId = tgUser?.id;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        createdBy: tgChatId ? 'telegram-mini-app' : 'web',
        
        profile: {
          createdAt: serverTimestamp(),
          userType: tgChatId ? 'telegram' : 'web',
          riskLevel: 'unknown',
          segment: 'registered'
        },
        
        contacts: {
          email: user.email,
          phone: null,
          telegram: tgUser?.username ? `https://t.me/${tgUser.username}` : null
        },
        
        ...(tgUser && {
          tgId: tgUser.id,
          tgUsername: tgUser.username || null,
          tgLanguage: tgUser.language_code || null,
          tgIsPremium: tgUser.is_premium || false,
          nameFirst: tgUser.first_name || null,
          nameLast: tgUser.last_name || null,
          nameFull: `${tgUser.first_name || ''}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`.trim() || null
        }),
        
        telegramAccounts: [],
        userAccessIDs: tgChatId ? [String(tgChatId), tgChatId] : [],
        userActionCasesPermitted: [
          'balanceShow',
          'paymentsShow',
          'expenseItemsShowAll'
        ]
      });
      
      console.log('✅ User document created in Firestore');
      
      // Link Telegram if opened from Telegram
      const telegramData = getTelegramData();
      if (telegramData) {
        await linkTelegramAccount(user.uid, token, telegramData);
      }
      
      // Save session with ID Token
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
}

/**
 * Setup reset password form handler
 */
export function setupResetHandler(auth) {
  document.getElementById('resetBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('resetEmail')?.value.trim();
    
    clearErrors();
    
    if (!email) {
      showError('resetError', 'Введите email');
      return;
    }
    
    try {
      const resetBtn = document.getElementById('resetBtn');
      resetBtn.disabled = true;
      
      await sendPasswordResetEmail(auth, email);
      
      showSuccess('resetSuccess', 'Ссылка для сброса пароля отправлена на ваш email');
      document.getElementById('resetEmail').value = '';
      
      setTimeout(() => {
        resetBtn.disabled = false;
        showAuthScreen('login');
      }, 3000);
      
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
}

/**
 * Setup form switching handlers
 */
export function setupFormSwitching() {
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
}

/**
 * Helper: Get Telegram data
 */
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