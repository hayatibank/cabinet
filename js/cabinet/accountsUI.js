// webapp/js/cabinet/accountsUI.js
// UI rendering for accounts list and management

import { getUserAccounts, deleteAccount } from './accounts.js';
import { showCreateAccountForm } from './createAccount.js';

/**
 * Render accounts list in cabinet
 */
export async function renderAccountsList() {
  try {
    console.log('📋 Loading accounts...');
    
    // Get accounts
    const accounts = await getUserAccounts();
    
    // Get container
    const container = document.querySelector('.cabinet-content');
    
    if (!container) {
      console.error('❌ Cabinet content container not found');
      return;
    }
    
    // Render
    if (accounts.length === 0) {
      container.innerHTML = `
        <div class="no-accounts">
          <p>📋 У вас пока нет аккаунтов</p>
          <p class="subtitle">Создайте первый аккаунт для начала работы</p>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="accounts-list">
          ${accounts.map(acc => renderAccountCard(acc)).join('')}
        </div>
      `;
      
      // Attach event listeners
      attachAccountListeners();
    }
    
    console.log(`✅ Rendered ${accounts.length} accounts`);
    
  } catch (err) {
    console.error('❌ Error rendering accounts:', err);
    
    const container = document.querySelector('.cabinet-content');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <p>❌ Ошибка загрузки аккаунтов</p>
          <button onclick="location.reload()" class="btn btn-secondary">
            Обновить
          </button>
        </div>
      `;
    }
  }
}

/**
 * Render single account card
 */
function renderAccountCard(account) {
  const { accountId, type, profile, balance } = account;
  
  // Type labels
  const typeLabels = {
    individual: '👤 Физическое лицо',
    business: '🏢 Юридическое лицо',
    government: '🏛️ Госорганизация'
  };
  
  const typeLabel = typeLabels[type] || 'Аккаунт';
  
  // Profile name
  let profileName = 'Без имени';
  if (type === 'individual' && profile) {
    profileName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  } else if (type === 'business' && profile?.companyName) {
    profileName = profile.companyName;
  } else if (type === 'government' && profile?.organizationName) {
    profileName = profile.organizationName;
  }
  
  // Balance display
  const balanceRub = balance?.rub || 0;
  const balanceFormatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(balanceRub);
  
  return `
    <div class="account-card" data-account-id="${accountId}">
      <div class="account-header">
        <div class="account-type">${typeLabel}</div>
        <div class="account-menu">
          <button class="btn-icon" data-action="menu">⋮</button>
        </div>
      </div>
      
      <div class="account-body">
        <h3 class="account-name">${profileName}</h3>
        <div class="account-balance">
          <span class="balance-label">Баланс:</span>
          <span class="balance-amount">${balanceFormatted}</span>
        </div>
      </div>
      
      <div class="account-actions">
        <button class="btn btn-danger btn-small" data-action="delete">
          Удалить
        </button>
      </div>
    </div>
  `;
}

/**
 * Attach event listeners to account cards
 */
function attachAccountListeners() {
  // Delete account
  document.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const card = e.target.closest('.account-card');
      const accountId = card.dataset.accountId;
      await handleDeleteAccount(accountId);
    });
  });
}

/**
 * Handle account deletion
 */
async function handleDeleteAccount(accountId) {
  try {
    const confirmed = confirm(
      '⚠️ ВНИМАНИЕ!\n\n' +
      'Вы действительно хотите удалить этот аккаунт?\n\n' +
      'Это действие нельзя отменить.'
    );
    
    if (!confirmed) {
      return;
    }
    
    console.log(`🗑️ Deleting account: ${accountId}`);
    
    await deleteAccount(accountId);
    
    alert('✅ Аккаунт успешно удалён');
    
    // Reload accounts list
    await renderAccountsList();
    
  } catch (err) {
    console.error('❌ Error deleting account:', err);
    alert('❌ Ошибка удаления аккаунта');
  }
}

/**
 * Show create account button
 */
export function showCreateAccountButton() {
  const actionsContainer = document.querySelector('.cabinet-actions');
  
  if (!actionsContainer) {
    console.error('❌ Cabinet actions container not found');
    return;
  }
  
  // Check if button already exists
  if (actionsContainer.querySelector('.btn-create-account')) {
    return;
  }
  
  // Add create account button
  const createBtn = document.createElement('button');
  createBtn.className = 'btn btn-primary btn-create-account';
  createBtn.textContent = '➕ Создать аккаунт';
  createBtn.onclick = showCreateAccountForm;
  
  // Insert before logout button
  const logoutBtn = actionsContainer.querySelector('[onclick="logout()"]');
  if (logoutBtn) {
    actionsContainer.insertBefore(createBtn, logoutBtn);
  } else {
    actionsContainer.prepend(createBtn);
  }
}
