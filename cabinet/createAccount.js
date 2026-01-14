/* /webapp/cabinet/createAccount.js v2.0.0 */
// CHANGELOG v2.0.0:
// - ADDED: Check account availability before rendering form
// - ADDED: Dynamic disabled state based on .env feature flags
// - Cards are disabled if featureEnabled=false
// CHANGELOG v1.7.0:
// - MIGRATED: From modular i18n to global window.i18n
// - REMOVED: import { t } (Android freeze fix)

import { createAccount } from './accounts.js';
import { renderAccountsList } from './accountsUI.js';
import { refreshHYCBalance } from '../HayatiCoin/hycUI.js';
import { formatHYC } from '../HayatiCoin/hycService.js';

/**
 * Show create account form
 */
export async function showCreateAccountForm() {
  const t = window.i18n.t.bind(window.i18n);
  
  console.log('📝 Showing create account form');
  
  const container = document.querySelector('.cabinet-content');
  
  if (!container) {
    console.error('❌ Cabinet content container not found');
    return;
  }
  
  // ✅ Check availability
  let availability;
  try {
    const { checkAccountAvailability } = await import('./accounts.js');
    availability = await checkAccountAvailability();
  } catch (err) {
    console.error('⚠️ Failed to get availability:', err);
    // Default to individual only
    availability = {
      individual: { featureEnabled: true, canCreate: true },
      business: { featureEnabled: false, canCreate: false },
      government: { featureEnabled: false, canCreate: false }
    };
  }
  
  // Determine which type is selected by default
  let defaultType = 'individual';
  if (!availability.individual.canCreate && availability.business.canCreate) {
    defaultType = 'business';
  } else if (!availability.individual.canCreate && !availability.business.canCreate && availability.government.canCreate) {
    defaultType = 'government';
  }
  
  container.innerHTML = `
    <div class="create-account-form">
      <h2 data-i18n="cabinet.createAccount.title">${t('cabinet.createAccount.title')}</h2>
      
      <div class="account-type-selector">
        <p class="form-label" data-i18n="cabinet.accountType.selectType">${t('cabinet.accountType.selectType')}:</p>
        
        <div class="type-cards">
          <div class="type-card ${availability.individual.canCreate ? (defaultType === 'individual' ? 'active' : '') : 'disabled'}" data-type="individual">
            <div class="type-icon">👤</div>
            <h3 data-i18n="cabinet.createAccount.individual">${t('cabinet.createAccount.individual')}</h3>
            <p data-i18n="cabinet.createAccount.individualDesc">${t('cabinet.createAccount.individualDesc')}</p>
          </div>
          
          <div class="type-card ${availability.business.canCreate ? (defaultType === 'business' ? 'active' : '') : 'disabled'}" data-type="business">
            <div class="type-icon">🏢</div>
            <h3 data-i18n="cabinet.createAccount.business">${t('cabinet.createAccount.business')}</h3>
            <p data-i18n="cabinet.createAccount.businessDesc">${t('cabinet.createAccount.businessDesc')}</p>
          </div>
          
          <div class="type-card ${availability.government.canCreate ? (defaultType === 'government' ? 'active' : '') : 'disabled'}" data-type="government">
            <div class="type-icon">🏛️</div>
            <h3 data-i18n="cabinet.createAccount.government">${t('cabinet.createAccount.government')}</h3>
            <p data-i18n="cabinet.createAccount.governmentDesc">${t('cabinet.createAccount.governmentDesc')}</p>
          </div>
        </div>
      </div>
      
      <div id="individualForm" class="account-form">
        <h3 data-i18n="cabinet.createAccount.individual">${t('cabinet.createAccount.individual')}</h3>
        
        <div class="input-group">
          <label for="firstName">
            <span data-i18n="cabinet.createAccount.firstName">${t('cabinet.createAccount.firstName')}</span>
            <span data-i18n="cabinet.createAccount.required">${t('cabinet.createAccount.required')}</span>
          </label>
          <input 
            type="text" 
            id="firstName" 
            data-i18n="cabinet.createAccount.firstNamePlaceholder"
            placeholder="${t('cabinet.createAccount.firstNamePlaceholder')}" 
            required>
        </div>
        
        <div class="input-group">
          <label for="lastName">
            <span data-i18n="cabinet.createAccount.lastName">${t('cabinet.createAccount.lastName')}</span>
            <span data-i18n="cabinet.createAccount.required">${t('cabinet.createAccount.required')}</span>
          </label>
          <input 
            type="text" 
            id="lastName" 
            data-i18n="cabinet.createAccount.lastNamePlaceholder"
            placeholder="${t('cabinet.createAccount.lastNamePlaceholder')}" 
            required>
        </div>
        
        <div class="input-group">
          <label for="birthDate" data-i18n="cabinet.createAccount.birthDate">${t('cabinet.createAccount.birthDate')}</label>
          <input type="date" id="birthDate">
        </div>
        
        <div class="form-actions">
          <!-- Ferrari Button -->
          <button id="createIndividualBtn" class="btn-3d btn-3d-ferrari btn-3d-large">
            <svg class="btn-icon btn-icon-left" width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 0c5.5 0 10 4.5 10 10s-4.5 10-10 10S0 15.5 0 10 4.5 0 10 0zm1 5H9v4H5v2h4v4h2v-4h4V9h-4V5z"/>
            </svg>
            <span data-i18n="cabinet.createAccount.submit">${t('cabinet.createAccount.submit')}</span>
          </button>
          
          <!-- Glass Button -->
          <button id="cancelBtn" class="btn-3d btn-3d-glass">
            <svg class="btn-icon btn-icon-left" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 0l10 10-10 10-2-2 6-6H0V8h14l-6-6 2-2z"/>
            </svg>
            <span data-i18n="cabinet.createAccount.cancel">${t('cabinet.createAccount.cancel')}</span>
          </button>
        </div>
        
        <div id="createError" class="error hidden"></div>
      </div>
      
      <div id="businessForm" class="account-form hidden">
        <h3 data-i18n="cabinet.createAccount.business">${t('cabinet.createAccount.business')}</h3>
        <p class="info-text" data-i18n="cabinet.createAccount.inDevelopment">${t('cabinet.createAccount.inDevelopment')}</p>
      </div>
      
      <div id="governmentForm" class="account-form hidden">
        <h3 data-i18n="cabinet.createAccount.government">${t('cabinet.createAccount.government')}</h3>
        <p class="info-text" data-i18n="cabinet.createAccount.inDevelopment">${t('cabinet.createAccount.inDevelopment')}</p>
      </div>
    </div>
  `;
  
  attachFormListeners();
}

/**
 * Attach form event listeners
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
  document.querySelectorAll('.type-card').forEach(card => {
    card.classList.remove('active');
  });
  document.querySelector(`[data-type="${type}"]`)?.classList.add('active');
  
  document.querySelectorAll('.account-form').forEach(form => {
    form.classList.add('hidden');
  });
  document.getElementById(`${type}Form`)?.classList.remove('hidden');
}

/**
 * Handle create individual account (with 3D loading state)
 */
async function handleCreateIndividual() {
  const t = window.i18n.t.bind(window.i18n);
  
  try {
    const firstName = document.getElementById('firstName')?.value.trim();
    const lastName = document.getElementById('lastName')?.value.trim();
    const birthDate = document.getElementById('birthDate')?.value;
    
    document.getElementById('createError')?.classList.add('hidden');
    
    if (!firstName || !lastName) {
      showError(t('cabinet.createAccount.fillRequired'));
      return;
    }
    
    const btn = document.getElementById('createIndividualBtn');
    
    // 3D Loading State
    btn.disabled = true;
    btn.classList.add('loading');
    
    const account = await createAccount('individual', {
      firstName,
      lastName,
      birthDate: birthDate || null
    });
    
    console.log('✅ Individual account created:', account.accountId);
    
    // 3D Success State
    btn.classList.remove('loading');
    btn.classList.add('success');
    
    // Silent HYC reward
    if (account.hycReward) {
      await refreshHYCBalance();
      console.log(`🔇 Silent reward: ${formatHYC(account.hycReward.amount)} HYC`);
    }
    
    setTimeout(async () => {
      alert(t('cabinet.accountCreated'));
      await renderAccountsList();
    }, 500);
    
  } catch (err) {
    console.error('❌ Error creating individual account:', err);
    
    const btn = document.getElementById('createIndividualBtn');
    
    // 3D Error State
    btn.classList.remove('loading');
    btn.classList.add('error');
    
    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove('error');
    }, 400);
    
    showError(err.message || t('cabinet.createAccount.error'));
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