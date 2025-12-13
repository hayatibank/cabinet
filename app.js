// app.js - Полностью готовый WebApp для аутентификации
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
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ВАЖНО: Замени эти данные на СВОИ из Firebase проекта
const firebaseConfig = {
  apiKey: "AIzaSyB5CJlw23KPmN5HbY6S9gQKbUgb41_RxMw",
  authDomain: "tms-test-nlyynt.firebaseapp.com",
  projectId: "tms-test-nlyynt",
  storageBucket: "tms-test-nlyynt.appspot.com",
  messagingSenderId: "1036707590928",
  appId: "1:1036707590928:web:3519c03e00297347d0eb95"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  console.log('Telegram WebApp инициализирован');
}

// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode') || 'login';
const tgId = urlParams.get('tg_id'); // ID из Telegram бота

console.log('Mode:', mode, 'Telegram ID:', tgId);

// DOM элементы
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const resetForm = document.getElementById('resetForm');
const loader = document.getElementById('loader');

// === ПЕРЕКЛЮЧЕНИЕ ФОРМ ===
document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  showForm('register');
});

document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  showForm('login');
});

document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  showForm('reset');
});

document.getElementById('backToLoginLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  showForm('login');
});

// Функция показа формы
function showForm(formType) {
  loginForm?.classList.add('hidden');
  registerForm?.classList.add('hidden');
  resetForm?.classList.add('hidden');
  clearErrors();
  
  if (formType === 'login' && loginForm) {
    loginForm.classList.remove('hidden');
  } else if (formType === 'register' && registerForm) {
    registerForm.classList.remove('hidden');
  } else if (formType === 'reset' && resetForm) {
    resetForm.classList.remove('hidden');
  }
}

// Очистка ошибок
function clearErrors() {
  document.querySelectorAll('.error, .success').forEach(el => {
    el.classList.add('hidden');
    el.textContent = '';
  });
}

// Показать ошибку
function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
}

// Показать успех
function showSuccess(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
}

// Показать загрузку
function showLoader() {
  loginForm?.classList.add('hidden');
  registerForm?.classList.add('hidden');
  resetForm?.classList.add('hidden');
  loader?.classList.remove('hidden');
}

// === ВХОД ===
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  clearErrors();
  
  if (!email || !password) {
    showError('loginError', 'Заполните все поля');
    return;
  }
  
  try {
    document.getElementById('loginBtn').disabled = true;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Вход успешен:', userCredential.user.uid);
    // Дальше обработается в onAuthStateChanged
  } catch (error) {
    document.getElementById('loginBtn').disabled = false;
    let errorMessage = 'Ошибка входа';
    
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = 'Неверный email или пароль';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Слишком много попыток. Попробуйте позже';
        break;
      default:
        errorMessage = error.message;
    }
    
    showError('loginError', errorMessage);
  }
});

// === РЕГИСТРАЦИЯ ===
document.getElementById('registerBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
  
  clearErrors();
  
  if (!email || !password || !passwordConfirm) {
    showError('registerError', 'Заполните все поля');
    return;
  }
  
  if (password.length < 6) {
    showError('registerError', 'Пароль минимум 6 символов');
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
    
    // Создаем запись пользователя в Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
      telegramIds: tgId ? [tgId] : [],
      status: 'active'
    });
    
    console.log('Регистрация успешна:', user.uid);
  } catch (error) {
    document.getElementById('registerBtn').disabled = false;
    let errorMessage = 'Ошибка регистрации';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email уже используется';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Неверный формат email';
        break;
      case 'auth/weak-password':
        errorMessage = 'Слабый пароль';
        break;
      default:
        errorMessage = error.message;
    }
    
    showError('registerError', errorMessage);
  }
});

// === СБРОС ПАРОЛЯ ===
document.getElementById('resetBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('resetEmail').value.trim();
  
  clearErrors();
  
  if (!email) {
    showError('resetError', 'Введите email');
    return;
  }
  
  try {
    document.getElementById('resetBtn').disabled = true;
    await sendPasswordResetEmail(auth, email);
    
    showSuccess('resetSuccess', 'Ссылка для сброса отправлена на email');
    document.getElementById('resetEmail').value = '';
    
    setTimeout(() => showForm('login'), 3000);
  } catch (error) {
    document.getElementById('resetBtn').disabled = false;
    let errorMessage = 'Ошибка отправки';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Пользователь не найден';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Неверный формат email';
    }
    
    showError('resetError', errorMessage);
  }
});

// === ОСНОВНАЯ ФУНКЦИЯ - ОТПРАВКА ДАННЫХ В БОТА ===
async function sendAuthToBot(user, token) {
  console.log('Отправляем данные в бота...');
  
  // Данные для отправки
  const authData = {
    type: 'auth_success',
    uid: user.uid,
    email: user.email,
    token: token,
    telegram_id: tgId || (tg?.initDataUnsafe?.user?.id) || null,
    timestamp: new Date().toISOString()
  };
  
  console.log('Данные для отправки:', authData);
  
  // Проверяем, запущен ли в Telegram WebApp
  if (tg && tg.sendData) {
    console.log('Отправляем через Telegram WebApp...');
    tg.sendData(JSON.stringify(authData));
    
    // Закрываем WebApp через 1 секунду
    setTimeout(() => {
      if (tg.close) tg.close();
    }, 1000);
    
    return true;
  } else {
    console.log('Запущен в браузере, показываем deep link...');
    // Кодируем данные в base64 для передачи через URL
    const encodedData = btoa(JSON.stringify(authData));
    const botUsername = 'HayatiHodlBot'; // ЗАМЕНИ НА СВОЙ
    const deepLink = `https://t.me/${botUsername}?start=auth_${encodedData}`;
    
    // Показываем пользователю ссылку
    showDeepLinkScreen(user.email, deepLink);
    return false;
  }
}

// Экран с deep link для браузера
function showDeepLinkScreen(email, deepLink) {
  if (!loader) return;
  
  loader.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
      <h2 style="color: #16a34a; margin-bottom: 16px;">Авторизация успешна!</h2>
      <p style="color: #94a3b8; margin-bottom: 24px;">
        Вы вошли как:<br>
        <strong style="color: #f1f5f9;">${email}</strong>
      </p>
      <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">
        Чтобы продолжить в боте, нажмите кнопку ниже:
      </p>
      <a href="${deepLink}" 
         style="display: inline-block; background: #2563eb; color: white; 
                padding: 12px 24px; border-radius: 8px; text-decoration: none;
                font-weight: 600; margin-bottom: 16px;">
        Открыть в Telegram боте
      </a>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">
        Или вернитесь в бота и нажмите "💼 Мой кабинет"
      </p>
    </div>
  `;
}

// === СЛУШАТЕЛЬ ИЗМЕНЕНИЯ АВТОРИЗАЦИИ ===
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('Пользователь авторизован:', user.email);
    showLoader();
    
    try {
      // Получаем токен
      const token = await user.getIdToken();
      console.log('Токен получен');
      
      // Отправляем данные в бота
      await sendAuthToBot(user, token);
      
    } catch (error) {
      console.error('Ошибка получения токена:', error);
      showError('loginError', 'Ошибка авторизации');
      showForm('login');
    }
  } else {
    console.log('Пользователь не авторизован');
    // Показываем форму при загрузке
    setTimeout(() => {
      if (mode === 'register') {
        showForm('register');
      } else {
        showForm('login');
      }
    }, 500);
  }
});

// Показываем нужную форму при загрузке
window.addEventListener('DOMContentLoaded', () => {
  console.log('Страница загружена');
  setTimeout(() => {
    if (mode === 'register') {
      showForm('register');
    } else {
      showForm('login');
    }
  }, 100);
});
