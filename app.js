// webapp/app.js v1.4.3 - MONOLITHIC (no ES6 modules)
// Single file, guaranteed to work

(async function() {
  console.log('🚀 Mini App v1.4.3 started');
  console.log('📦 Monolithic version (no modules)');

  // ======================
  // CONFIGURATION
  // ======================
  
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyB5CJlw23KPmN5HbY6S9gQKbUgb41_RxMw",
    authDomain: "tms-test-nlyynt.firebaseapp.com",
    databaseURL: "https://tms-test-nlyynt.firebaseio.com",
    projectId: "tms-test-nlyynt",
    storageBucket: "tms-test-nlyynt.appspot.com",
    messagingSenderId: "1036707590928",
    appId: "1:1036707590928:web:3519c03e00297347d0eb95",
    measurementId: "G-BYXEPGS2LM"
  };

  let API_URL = null;

  // ======================
  // FETCH API CONFIG
  // ======================
  
  async function fetchApiConfig() {
    // Priority 1: Manual override
    const manualOverride = localStorage.getItem('hayati_api_url');
    if (manualOverride) {
      API_URL = manualOverride;
      console.log('🔧 Using API_URL from localStorage:', API_URL);
      return true;
    }

    // Priority 2: Try backend
    const possibleBackends = [
      'https://hayati-bank-test.loca.lt',
      'http://localhost:3000'
    ];

    for (const backendUrl of possibleBackends) {
      try {
        console.log(`🔍 Trying backend: ${backendUrl}`);
        
        const response = await fetch(`${backendUrl}/api/config`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
          const config = await response.json();
          API_URL = config.apiUrl;
          
          console.log(`✅ API config loaded from: ${backendUrl}`);
          console.log(`🌐 Using API_URL: ${API_URL}`);
          
          return true;
        }
      } catch (err) {
        console.warn(`⚠️ Backend not available: ${backendUrl}`);
      }
    }

    // Fallback
    API_URL = 'http://localhost:3000';
    console.warn('⚠️ Using fallback API_URL:', API_URL);
    
    return false;
  }

  // Helper functions
  window.setApiUrl = function(url) {
    localStorage.setItem('hayati_api_url', url);
    console.log('✅ API_URL saved:', url);
    console.log('🔄 Reload page to apply');
  };

  window.getApiUrl = function() {
    return API_URL;
  };

  // ======================
  // FIREBASE IMPORTS (CDN)
  // ======================
  
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
  const { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
  } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
  const { 
    getFirestore, 
    doc, 
    setDoc,
    serverTimestamp 
  } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

  // Initialize Firebase
  const app = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('✅ Firebase initialized');

  // ======================
  // TELEGRAM WEBAPP
  // ======================
  
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    console.log('✅ Telegram WebApp initialized');
    console.log('📱 User:', tg.initDataUnsafe?.user);
  }

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
  // SESSION MANAGEMENT
  // ======================
  
  const SESSION_KEY = 'hayati_session';

  function saveSession(sessionData) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      console.log('💾 Session saved');
      console.log('📅 Expires:', new Date(sessionData.tokenExpiry).toLocaleString());
      return true;
    } catch (err) {
      console.error('❌ Error saving session:', err);
      return false;
    }
  }

  function getSession() {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      
      if (!sessionStr) {
        console.log('ℹ️ No session in localStorage');
        return null;
      }
      
      const session = JSON.parse(sessionStr);
      
      if (Date.now() >= session.tokenExpiry) {
        console.log('⏰ Session expired');
        clearSession();
        return null;
      }
      
      console.log('✅ Valid session found');
      console.log('👤 User:', session.email);
      
      return session;
    } catch (err) {
      console.error('❌ Error reading session:', err);
      clearSession();
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    console.log('🗑️ Session cleared');
  }

  // ======================
  // UI MANAGEMENT
  // ======================
  
  const loadingScreen = document.getElementById('loadingScreen');
  const authScreen = document.getElementById('authScreen');
  const cabinetScreen = document.getElementById('cabinetScreen');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const resetForm = document.getElementById('resetForm');

  function showScreen(screenId) {
    [loadingScreen, authScreen, cabinetScreen].forEach(screen => {
      if (screen) screen.classList.add('hidden');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) targetScreen.classList.remove('hidden');
  }

  function showLoadingScreen(message = 'Загрузка...') {
    showScreen('loadingScreen');
    const loadingText = loadingScreen?.querySelector('p');
    if (loadingText) loadingText.textContent = message;
  }

  function showAuthScreen(mode = 'login') {
    showScreen('authScreen');
    
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
    
    const userEmailEl = document.querySelector('.user-email');
    if (userEmailEl) {
      userEmailEl.textContent = userData.email || 'Unknown';
    }
    
    console.log('✅ Cabinet opened for:', userData.email);
  }

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
    console.error(`❌ ${elementId}:`, message);
  }

  function showSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      el.classList.remove('hidden');
    }
    console.log(`✅ ${elementId}:`, message);
  }

  // ======================
  // API CALLS
  // ======================
  
  async function checkTelegramBinding(chatId, initData) {
    try {
      console.log('🔍 Checking Telegram binding...');
      
      const response = await fetch(`${API_URL}/api/check-telegram-binding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, initData })
      });
      
      if (!response.ok) {
        console.error('❌ Binding check failed:', response.status);
        return null;
      }
      
      const result = await response.json();
      console.log('✅ Binding check result:', result);
      return result;
    } catch (err) {
      console.error('❌ Error checking binding:', err);
      return null;
    }
  }

  async function silentLogin(uid, chatId, initData) {
    try {
      console.log('🔐 Attempting silent login...');
      
      const response = await fetch(`${API_URL}/api/silent-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, chatId, initData })
      });
      
      if (!response.ok) {
        console.error('❌ Silent login failed:', response.status);
        return null;
      }
      
      const result = await response.json();
      console.log('✅ Silent login successful');
      return result;
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
      
      if (!response.ok) return false;
      
      const result = await response.json();
      return result.valid === true;
    } catch (err) {
      console.error('❌ Error validating token:', err);
      return false;
    }
  }

  async function linkTelegramAccount(uid, authToken, telegramData) {
    try {
      if (!telegramData) {
        console.warn('⚠️ No Telegram data for linking');
        return false;
      }
      
      const { chatId, initData, user } = telegramData;
      
      console.log('🔗 Linking Telegram account...');
      
      const response = await fetch(`${API_URL}/api/link-telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, chatId, initData, telegramUser: user, authToken })
      });
      
      if (!response.ok) {
        console.error('❌ Linking failed:', response.status);
        return false;
      }
      
      console.log('✅ Telegram linked successfully');
      return true;
    } catch (err) {
      console.error('❌ Error linking Telegram:', err);
      return false;
    }
  }

  // ======================
  // MAIN INITIALIZATION
  // ======================
  
  async function initMiniApp() {
    try {
      showLoadingScreen('Загрузка конфигурации...');
      
      // STEP 0: Fetch API config
      await fetchApiConfig();
      
      if (!API_URL) {
        throw new Error('Failed to load API configuration');
      }
      
      showLoadingScreen('Проверка авторизации...');
      
      const telegramData = getTelegramData();
      const chatId = telegramData?.chatId;
      const initData = telegramData?.initData;
      
      console.log('📱 Mini App initialized');
      if (chatId) console.log('👤 Telegram User ID:', chatId);
      
      // STEP 1: Check localStorage
      const session = getSession();
      
      if (session) {
        console.log('🔍 Found session, validating...');
        
        const isValid = await validateToken(session.authToken, session.uid);
        
        if (isValid) {
          console.log('✅ Token valid, showing cabinet');
          return showCabinet({ uid: session.uid, email: session.email });
        } else {
          console.log('⚠️ Token invalid, clearing');
          clearSession();
        }
      }
      
      // STEP 2: Check Telegram binding
      if (chatId && initData) {
        console.log('🔍 Checking Telegram binding...');
        
        const binding = await checkTelegramBinding(chatId, initData);
        
        if (binding && binding.bound && binding.uid) {
          console.log('✅ Found binding, attempting silent login...');
          
          const loginResult = await silentLogin(binding.uid, chatId, initData);
          
          if (loginResult && loginResult.success) {
            console.log('✅ Silent login successful!');
            
            saveSession({
              authToken: loginResult.authToken,
              tokenExpiry: loginResult.tokenExpiry,
              uid: loginResult.uid,
              email: loginResult.email
            });
            
            return showCabinet({ uid: loginResult.uid, email: loginResult.email });
          } else {
            console.warn('⚠️ Silent login failed');
          }
        } else {
          console.log('ℹ️ No binding found');
        }
      }
      
      // STEP 3: Show auth screen
      console.log('🔓 No authentication, showing login');
      showAuthScreen('login');
      
    } catch (err) {
      console.error('❌ Error initializing:', err);
      showAuthScreen('login');
    }
  }

  // ======================
  // AUTH HANDLERS
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
    
    try {
      const btn = document.getElementById('loginBtn');
      btn.disabled = true;
      showLoadingScreen('Вход...');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      const telegramData = getTelegramData();
      if (telegramData) {
        await linkTelegramAccount(user.uid, token, telegramData);
      }
      
      saveSession({
        authToken: token,
        tokenExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000),
        uid: user.uid,
        email: user.email
      });
      
      showCabinet({ uid: user.uid, email: user.email });
      
    } catch (error) {
      document.getElementById('loginBtn').disabled = false;
      
      let errorMessage = 'Ошибка входа';
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Неверный email или пароль';
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
      const btn = document.getElementById('registerBtn');
      btn.disabled = true;
      showLoadingScreen('Регистрация...');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      const telegramData = getTelegramData();
      const tgUser = telegramData?.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
        status: 'active',
        profile: {
          userType: tgUser ? 'telegram' : 'web',
          riskLevel: 'unknown',
          segment: 'registered'
        },
        contacts: {
          email: user.email,
          telegram: tgUser?.username ? `https://t.me/${tgUser.username}` : null
        },
        ...(tgUser && {
          tgId: tgUser.id,
          tgUsername: tgUser.username,
          nameFirst: tgUser.first_name,
          nameLast: tgUser.last_name
        }),
        telegramAccounts: [],
        userAccessIDs: [],
        userActionCasesPermitted: ['balanceShow', 'paymentsShow', 'expenseItemsShowAll']
      });
      
      if (telegramData) {
        await linkTelegramAccount(user.uid, token, telegramData);
      }
      
      saveSession({
        authToken: token,
        tokenExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000),
        uid: user.uid,
        email: user.email
      });
      
      showCabinet({ uid: user.uid, email: user.email });
      
    } catch (error) {
      document.getElementById('registerBtn').disabled = false;
      
      let errorMessage = 'Ошибка регистрации';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Этот email уже зарегистрирован';
      }
      
      showAuthScreen('register');
      showError('registerError', errorMessage);
    }
  });

  // RESET
  document.getElementById('resetBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('resetEmail')?.value.trim();
    
    clearErrors();
    
    if (!email) {
      showError('resetError', 'Введите email');
      return;
    }
    
    try {
      const btn = document.getElementById('resetBtn');
      btn.disabled = true;
      
      await sendPasswordResetEmail(auth, email);
      
      showSuccess('resetSuccess', 'Ссылка для сброса пароля отправлена');
      document.getElementById('resetEmail').value = '';
      
      setTimeout(() => {
        btn.disabled = false;
        showAuthScreen('login');
      }, 3000);
      
    } catch (error) {
      document.getElementById('resetBtn').disabled = false;
      
      let errorMessage = 'Ошибка отправки';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Пользователь не найден';
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

  // Logout
  window.logout = function() {
    clearSession();
    showAuthScreen('login');
    console.log('👋 Logged out');
  };

  // ======================
  // START
  // ======================
  
  console.log('🎬 Starting initialization...');
  await initMiniApp();

})();
