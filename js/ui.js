/* /webapp/js/ui.js v2.1.0 */
// CHANGELOG v2.1.0:
// - ADDED: Hayati ID display in cabinet
// - Import renderHayatiIdInCabinet component
// CHANGELOG v2.0.0:
// - ADDED: HYC balance display on cabinet open
// - Import getHYCBalance and renderHYCBalance
// CHANGELOG v1.2.0:
// - REMOVED: Dynamic import of ../cabinet/accountsUI.js (circular dependency)
// - ADDED: Event-based cabinet initialization
// - FIXED: Core layer should not import Business layer
// UI management (screens, errors, buttons)

import { getHYCBalance } from '../HayatiCoin/hycService.js';
import { renderHYCBalance } from '../HayatiCoin/hycUI.js';
import { renderHayatiIdInCabinet } from './components/hayatiIdDisplay.js';

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
export async function showCabinet(userData) {
  showScreen('cabinetScreen');
  
  // Display user email
  const userEmailEl = document.querySelector('.user-email');
  if (userEmailEl) {
    userEmailEl.textContent = userData.email || 'Unknown';
  }
  
  console.log('✅ Cabinet opened for:', userData.email);
  
  // ✅ NEW: Render Hayati ID (before HYC, as it's more important)
  try {
    renderHayatiIdInCabinet(userData);
  } catch (err) {
    console.warn('⚠️ [Hayati ID] Failed to render:', err);
    // Silent fail - no UI error
  }
  
  // ✅ Fetch and display HYC balance
  try {
    const hycData = await getHYCBalance();
    if (hycData && hycData.success) {
      renderHYCBalance(hycData.balance);
      console.log('✅ [HYC] Balance displayed:', hycData.balance);
    }
  } catch (err) {
    console.warn('⚠️ [HYC] Failed to load balance:', err);
    // Silent fail - no UI error
  }
  
  // ✅ Emit event for cabinet modules to initialize
  // This allows cabinet module to handle its own initialization
  // without creating circular dependency (Core → Business)
  window.dispatchEvent(new CustomEvent('cabinetReady', { 
    detail: userData 
  }));
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