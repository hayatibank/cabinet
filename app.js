// app.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
// Заменить только блок onAuthStateChanged (строки 248-313)

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase конфигурация
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Получаем Telegram WebApp данные
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  console.log('🔥 Telegram WebApp initialized');
  console.log('📱 Init data:', tg.initDataUnsafe);
  console.log('👤 User:', tg.initDataUnsafe?.user);
}

// Проверяем параметр mode в URL
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');

console.log('📋 URL params:', window.location.search);
console.log('🎯 Mode:', mode);

// DOM элементы
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const resetForm = document.getElementById('resetForm');
const loader = document.getElementById('loader');

// Кнопки переключения форм
document.getElementById('showRegisterLink').addEventListener('click', (e) => {
  e.preventDefault();
  showForm('register');
});

document.getElementById('showLoginLink').addEventListener('click', (e) => {
  e.preventDefault();
  showForm('login');
});

document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
  e.preventDefault();
  showForm('reset');
});

document.getElementById('backToLoginLink').addEventListener('click', (e) => {
  e.preventDefault();
  showForm('login');
});

function showForm(formType) {
  loginForm.classList.add('hidden');
  registerForm.classList.add('hidden');
  resetForm.classList.add('hidden');
  clearErrors();
  
  if (formType === 'login') {
    loginForm.classList.remove('hidden');
  } else if (formType === 'register') {
    registerForm.classList.remove('hidden');
  } else if (formType === 'reset') {
    resetForm.classList.remove('hidden');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (mode === 'register') {
    showForm('register');
  } else {
    showForm('login');
  }
});

function clearErrors() {
  document.querySelectorAll('.error, .success').forEach(el => {
    el.classList.add('hidden');
    el.textContent = '';
  });
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.classList.remove('hidden');
}

function showSuccess(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.classList.remove('hidden');
}

function showLoader() {
  loginForm.classList.add('hidden');
  registerForm.classList.add('hidden');
  resetForm.classList.add('hidden');
  loader.classList.remove('hidden');
}

// ВХОД
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  clearErrors();
  
  if (!email || !password) {
    showError('loginError', 'Заполните все поля');
    return;
  }
  
  try {
    document.getElementById('loginBtn').disabled = true;
    await signInWithEmailAndPassword(auth, email, password);
    // Успешный вход - обрабатывается в onAuthStateChanged
  } catch (error) {
    document.getElementById('loginBtn').disabled = false;
    let errorMessage = 'Ошибка входа';
    
    if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Неверный email или пароль';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'Пользователь не найден';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Неверный пароль';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Слишком много попыток. Попробуйте позже';
    }
    
    showError('loginError', errorMessage);
  }
});

// РЕГИСТРАЦИЯ
document.getElementById('registerBtn').addEventListener('click', async () => {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
  
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('🎉 Registration successful:', user.uid);
    
    // Создаём запись в Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
      status: 'active',
      accounts: [],
      telegramAccounts: []
    });
    
    console.log('✅ Firestore document created');
    
    // Успешная регистрация - обрабатывается в onAuthStateChanged
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
    
    showError('registerError', errorMessage);
  }
});

// СБРОС ПАРОЛЯ
document.getElementById('resetBtn').addEventListener('click', async () => {
  const email = document.getElementById('resetEmail').value.trim();
  
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
    
    setTimeout(() => showForm('login'), 3000);
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

// ==========================================
// 🔥 КЛЮЧЕВОЙ БЛОК: ОБРАБОТКА АВТОРИЗАЦИИ
// ==========================================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('🔥 User authenticated:', user.uid);
    showLoader();
    
    try {
      // Получаем ID token
      const token = await user.getIdToken();
      console.log('✅ Token received');
      
      // Создаём payload для бота
      const authPayload = {
        type: 'auth_success',
        uid: user.uid,
        email: user.email,
        token: token,
        timestamp: Date.now()
      };
      
      console.log('📦 Auth payload:', authPayload);
      
      // Проверяем запущен ли WebApp внутри Telegram
      const isInTelegram = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
      
      if (isInTelegram) {
        console.log('✅ Running in Telegram WebApp');
        console.log('👤 Telegram user:', tg.initDataUnsafe.user);
        
        // 🔥 ОТПРАВЛЯЕМ ДАННЫЕ БОТУ
        console.log('📤 Sending data to bot via tg.sendData()...');
        
        try {
          tg.sendData(JSON.stringify(authPayload));
          console.log('✅ Data sent successfully');
        } catch (sendError) {
          console.error('❌ Error sending data:', sendError);
        }
        
        // Закрываем WebApp через 1 секунду (даём время на отправку)
        setTimeout(() => {
          console.log('🔒 Closing WebApp...');
          tg.close();
        }, 1000);
        
      } else {
        console.log('🌐 Running in browser (not Telegram)');
        
        // Запущен в браузере - используем Deep Link
        const authPayloadB64 = btoa(JSON.stringify(authPayload));
        const botUsername = 'HayatiBankBot';
        const deepLink = `https://t.me/${botUsername}?start=auth_${authPayloadB64}`;
        
        console.log('🔗 Deep link generated:', deepLink.substring(0, 50) + '...');
        
        loader.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
            <h2 style="color: var(--success); margin-bottom: 16px;">Успешно!</h2>
            <p style="color: var(--text-muted); margin-bottom: 24px;">
              Вы авторизованы как:<br>
              <strong style="color: var(--text);">${user.email}</strong>
            </p>
            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 24px;">
              Теперь откройте бота в Telegram, нажав кнопку ниже:
            </p>
            <a href="${deepLink}" class="btn btn-primary" style="display: inline-block; text-decoration: none;">
              Открыть бота
            </a>
            <p style="color: var(--text-muted); font-size: 12px; margin-top: 16px;">
              Или вернитесь в бота и нажмите "💼 Мой кабинет"
            </p>
          </div>
        `;
      }
    } catch (error) {
      console.error('❌ Error in auth handler:', error);
      showError('loginError', 'Ошибка получения токена');
      showForm('login');
    }
  }
});
