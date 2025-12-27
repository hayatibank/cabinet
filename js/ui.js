/* /webapp/js/ui.js v1.1.0 */
// CHANGELOG v1.1.0:
// - FIXED: Import path for cabinet module (now ../cabinet/)
// UI management (screens, errors, buttons)

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const authScreen = document.getElementById('authScreen');
const cabinetScreen = document.getElementById('cabinetScreen');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const resetForm = document.getElementById('resetForm');

/**
 * Show specific screen
 */
export function showScreen(screenId) {
  [loadingScreen, authScreen, cabinetScreen].forEach(screen => {
    if (screen) screen.classList.add('hidden');
  });
  
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }
}

/**
 * Show loading screen
 */
export function showLoadingScreen(message = 'Загрузка...') {
  showScreen('loadingScreen');
  const loadingText = loadingScreen?.querySelector('p');
  if (loadingText) loadingText.textContent = message;
}

/**
 * Show authentication screen
 */
export function showAuthScreen(mode = 'login') {
  showScreen('authScreen');
  
  // Hide all forms
  if (loginForm) loginForm.classList.add('hidden');
  if (registerForm) registerForm.classList.add('hidden');
  if (resetForm) resetForm.classList.add('hidden');
  
  // Show appropriate form
  if (mode === 'login' && loginForm) {
    loginForm.classList.remove('hidden');
  } else if (mode === 'register' && registerForm) {
    registerForm.classList.remove('hidden');
  } else if (mode === 'reset' && resetForm) {
    resetForm.classList.remove('hidden');
  }
  
  clearErrors();
}

/**
 * Show cabinet screen
 */
export function showCabinet(userData) {
  showScreen('cabinetScreen');
  
  // Display user email
  const userEmailEl = document.querySelector('.user-email');
  if (userEmailEl) {
    userEmailEl.textContent = userData.email || 'Unknown';
  }
  
  console.log('✅ Cabinet opened for:', userData.email);
  
  // Load accounts (async import to avoid circular dependencies)
  setTimeout(async () => {
    try {
      const { renderAccountsList, showCreateAccountButton } = await import('../cabinet/accountsUI.js');
      showCreateAccountButton();
      await renderAccountsList();
    } catch (err) {
      console.error('❌ Error loading accounts:', err);
    }
  }, 100);
}

/**
 * Clear all error and success messages
 */
export function clearErrors() {
  document.querySelectorAll('.error, .success').forEach(el => {
    el.classList.add('hidden');
    el.textContent = '';
  });
}

/**
 * Show error message
 */
export function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
  console.error(`❌ ${elementId}:`, message);
}

/**
 * Show success message
 */
export function showSuccess(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
  console.log(`✅ ${elementId}:`, message);
}