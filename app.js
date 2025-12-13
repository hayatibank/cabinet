// app.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  // Временно закомментируем неиспользуемое:
  // sendPasswordResetEmail,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  // getDoc, // Закомментируем временно
  // serverTimestamp // Закомментируем временно
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase конфигурация (Используем Вашу конфигурацию)
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

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ----------------------------------------------------------------------
// НОВАЯ КЛЮЧЕВАЯ ЛОГИКА MVP: Передача UID в Telegram
// ----------------------------------------------------------------------

/**
 * Ключевая функция: Отправляет UID обратно в Telegram-бота и закрывает WebApp.
 * @param {string} uid - Firebase User ID
 */
function redirectToTelegramWithUid(uid) {
    const statusElement = document.getElementById('status-message');
    
    // Проверяем, открыт ли WebApp из Telegram (нужно подключить telegram-web-app.js)
    if (window.Telegram && window.Telegram.WebApp) {
        statusElement.textContent = 'Авторизация успешна. Отправка данных боту...';
        
        // 1. Отправляем UID боту в виде JSON-строки
        window.Telegram.WebApp.sendData(JSON.stringify({ 
            event: 'auth_success',
            uid: uid 
        }));
        
        // 2. Закрываем WebApp
        window.Telegram.WebApp.close();
        
    } else {
        // Если открыто в браузере
        statusElement.textContent = `Авторизация успешна. Ваш UID: ${uid}. Теперь вернитесь в Telegram.`;
        console.log("Успешная авторизация. UID:", uid);
    }
}


/**
 * Обработчик регистрации
 */
window.handleRegistration = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // MVP СЦЕНАРИЙ: После регистрации сразу передаем UID в Telegram
        redirectToTelegramWithUid(user.uid);
        
    } catch (error) {
        // Улучшенная обработка ошибок
        const errorMessage = error.message.replace(/Firebase: /, '');
        document.getElementById('status-message').textContent = `Ошибка регистрации: ${errorMessage}`;
        console.error("Ошибка регистрации:", error.code, error.message);
    }
};

/**
 * Обработчик входа
 */
window.handleLogin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // MVP СЦЕНАРИЙ: После входа сразу передаем UID в Telegram
        redirectToTelegramWithUid(user.uid);
        
    } catch (error) {
        const errorMessage = error.message.replace(/Firebase: /, '');
        document.getElementById('status-message').textContent = `Ошибка входа: ${errorMessage}`;
        console.error("Ошибка входа:", error.code, error.message);
    }
};

// ----------------------------------------------------------------------
// ВРЕМЕННО КОММЕНТИРУЕМ СТАРУЮ ЛОГИКУ, которая не нужна для MVP
// ----------------------------------------------------------------------

/*
// /**
//  * Форматировать инвестиции
//  * /
// const formatInvestments = (investments) => {
//    // ...
// }

// /**
//  * Форматировать общую сводку (dashboard)
//  * /
// const formatDashboard = (stats) => {
//    // ...
// }
*/

// // Убедитесь, что handleRegistration и handleLogin привязаны к вашей форме в index.html.
