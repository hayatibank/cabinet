/* /webapp/auth/authForms.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - MOVED: From /js/auth.js to /auth/ (modular)
// - SPLIT: Separated forms logic from account actions
// - FIXED: Import paths for new location
// Authentication form handlers (Login, Register, Reset Password)

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

import { linkTelegramAccount } from '../js/api.js';
import { saveSession } from '../js/session.js';
import { showLoadingScreen, showAuthScreen, showCabinet, showError, showSuccess, clearErrors } from '../js/ui.js';
import { t } from './i18n.js';

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
      showError('loginError', t('auth.error.fillAllFields'));
      return;
    }
    
    try {
      const loginBtn = document.getElementById('loginBtn');
      loginBtn.disabled = true;
      showLoadingScreen(t('common.loading'));
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get ID Token
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
      
      let errorMessage = t('auth.error.loginFailed');
      if (error.code === 'auth/invalid-credential') {
        errorMessage = t('auth.error.invalidCredentials');
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = t('auth.error.userNotFound');
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = t('auth.error.wrongPassword');
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
      showError('registerError', t('auth.error.fillAllFields'));
      return;
    }
    
    if (password.length < 6) {
      showError('registerError', t('auth.error.passwordTooShort'));
      return;
    }
    
    if (password !== passwordConfirm) {
      showError('registerError', t('auth.error.passwordsDontMatch'));
      return;
    }
    
    try {
      const registerBtn = document.getElementById('registerBtn');
      registerBtn.disabled = true;
      showLoadingScreen(t('common.loading'));
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get ID Token
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
      
      let errorMessage = t('auth.error.registerFailed');
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('auth.error.emailInUse');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t('auth.error.invalidEmail');
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t('auth.error.weakPassword');
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
      showError('resetError', t('auth.error.fillAllFields'));
      return;
    }
    
    try {
      const resetBtn = document.getElementById('resetBtn');
      resetBtn.disabled = true;
      
      await sendPasswordResetEmail(auth, email);
      
      showSuccess('resetSuccess', t('auth.reset.success'));
      document.getElementById('resetEmail').value = '';
      
      setTimeout(() => {
        resetBtn.disabled = false;
        showAuthScreen('login');
      }, 3000);
      
    } catch (error) {
      document.getElementById('resetBtn').disabled = false;
      
      let errorMessage = t('auth.error.resetFailed');
      if (error.code === 'auth/user-not-found') {
        errorMessage = t('auth.error.userNotFound');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t('auth.error.invalidEmail');
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