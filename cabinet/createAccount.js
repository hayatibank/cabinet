// webapp/cabinet/createAccount.js v1.4.1
// CHANGELOG v1.4.1:
// - CHANGED: Silent rewards (no modal, no notification)
// - KEEP: Auto-refresh HYC balance (user sees updated number)
// CHANGELOG v1.4.0:
// - ADDED: HYC reward notification after account creation
// - ADDED: Auto-refresh HYC balance display
// CHANGELOG v1.3.0:
// - MOVED: From /js/cabinet/ to /cabinet/ (modular)
// - TODO: Add i18n integration (next version)
// Create account form and logic

import { createAccount } from './accounts.js';
import { renderAccountsList } from './accountsUI.js';
import { refreshHYCBalance } from '../HayatiCoin/hycUI.js';
import { formatHYC } from '../HayatiCoin/hycService.js';

/**
 * Show create account form
 */
export function showCreateAccountForm() {
  console.log('📝 Showing create account form');
  
  const container = document.querySelector('.cabinet-content');
  
  if (!container) {
    console.error('❌ Cabinet content container not found');
    return;
  }
  
  container.innerHTML = `
    <div class="create-account-form">
      <h2>➕ Создание аккаунта</h2>
      
      <div class="account-type-selector">
        <p class="form-label">Выберите тип аккаунта:</p>
        
        <div class="type-cards">
          <div class="type-card active" data-type="individual">
            <div class="type-icon">👤</div>
            <h3>Физическое лицо</h3>
            <p>Для личных финансов</p>
          </div>
          
          <div class="type-card disabled" data-type="business">
            <div class="type-icon">🏢</div>
            <h3>ЮЛ / ИП</h3>
            <p>Скоро...</p>
          </div>
          
          <div class="type-card disabled" data-type="government">
            <div class="type-icon">🏛️</div>
            <h3>Госорганы</h3>
            <p>Скоро...</p>
          </div>
        </div>
      </div>
      
      <div id="individualForm" class="account-form">
        <h3>👤 Физическое лицо</h3>
        
        <div class="input-group">
          <label for="firstName">Имя *</label>
          <input type="text" id="firstName" placeholder="Иван" required>
        </div>
        
        <div class="input-group">
          <label for="lastName">Фамилия *</label>
          <input type="text" id="lastName" placeholder="Петров" required>
        </div>
        
        <div class="input-group">
          <label for="birthDate">Дата рождения</label>
          <input type="date" id="birthDate">
        </div>
        
        <div class="form-actions">
          <button id="createIndividualBtn" class="btn btn-primary">
            Создать аккаунт
          </button>
          <button id="cancelBtn" class="btn btn-secondary">
            Отмена
          </button>
        </div>
        
        <div id="createError" class="error hidden"></div>
      </div>
      
      <div id="businessForm" class="account-form hidden">
        <h3>🏢 Юридическое лицо / ИП</h3>
        <p class="info-text">В разработке...</p>
      </div>
      
      <div id="governmentForm" class="account-form hidden">
        <h3>🏛️ Государственная организация</h3>
        <p class="info-text">В разработке...</p>
      </div>
    </div>
  `;
  
  // Attach event listeners
  attachFormListeners();
}

/**
 * Attach event listeners to form
 */
function attachFormListeners() {
  // Type selector
  document.querySelectorAll('.type-card:not(.disabled)').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.type;
      selectAccountType(type);
    });
  });
  
  // Create individual account
  document.getElementById('createIndividualBtn')?.addEventListener('click', handleCreateIndividual);
  
  // Cancel button
  document.getElementById('cancelBtn')?.addEventListener('click', async () => {
    await renderAccountsList();
  });
}

/**
 * Select account type
 */
function selectAccountType(type) {
  // Update active type card
  document.querySelectorAll('.type-card').forEach(card => {
    card.classList.remove('active');
  });
  document.querySelector(`[data-type="${type}"]`)?.classList.add('active');
  
  // Show appropriate form
  document.querySelectorAll('.account-form').forEach(form => {
    form.classList.add('hidden');
  });
  document.getElementById(`${type}Form`)?.classList.remove('hidden');
}

/**
 * Handle create individual account
 */
async function handleCreateIndividual() {
  try {
    const firstName = document.getElementById('firstName')?.value.trim();
    const lastName = document.getElementById('lastName')?.value.trim();
    const birthDate = document.getElementById('birthDate')?.value;
    
    // Clear errors
    document.getElementById('createError')?.classList.add('hidden');
    
    // Validate
    if (!firstName || !lastName) {
      showError('Заполните имя и фамилию');
      return;
    }
    
    // Disable button
    const btn = document.getElementById('createIndividualBtn');
    btn.disabled = true;
    btn.textContent = 'Создание...';
    
    // Create account
    const account = await createAccount('individual', {
      firstName,
      lastName,
      birthDate: birthDate || null
    });
    
    console.log('✅ Individual account created:', account.accountId);
    
    // 🔇 SILENT: Just refresh balance (no notification)
    if (account.hycReward) {
      await refreshHYCBalance();
      console.log(`🔇 Silent reward: ${formatHYC(account.hycReward.amount)} HYC`);
    }
    
    // Simple success
    alert('✅ Аккаунт успешно создан!');
    
    // Reload accounts list
    await renderAccountsList();
    
  } catch (err) {
    console.error('❌ Error creating individual account:', err);
    
    // Re-enable button
    const btn = document.getElementById('createIndividualBtn');
    btn.disabled = false;
    btn.textContent = 'Создать аккаунт';
    
    // Show error
    showError(err.message || 'Ошибка создания аккаунта');
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorEl = document.getElementById('createError');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
}