// webapp/js/cabinet/accountsUI.js v1.3.0
// UI rendering for accounts list and management
// CHANGELOG v1.3.0:
// - Added three-dot menu for account actions
// - Added "Edit" option (UI only, no backend yet)
// - Moved "Delete" to dropdown menu
// - Added Ferrari-style "Enter" button for accounts
// - Improved card layout and responsiveness

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
          <button class="btn-icon btn-menu-toggle" data-action="menu" data-account-id="${accountId}">
            <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
              <circle cx="2" cy="2" r="2"/>
              <circle cx="2" cy="8" r="2"/>
              <circle cx="2" cy="14" r="2"/>
            </svg>
          </button>
          <div class="dropdown-menu" id="menu-${accountId}">
            <button class="dropdown-item" data-action="edit" data-account-id="${accountId}">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
              </svg>
              Редактировать
            </button>
            <button class="dropdown-item dropdown-item-danger" data-action="delete" data-account-id="${accountId}">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
              </svg>
              Удалить
            </button>
          </div>
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
        <button class="btn btn-enter ferrari-style" data-action="enter" data-account-id="${accountId}">
          <span class="btn-shine"></span>
          <span class="btn-text">Войти</span>
          <svg class="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 0l10 10-10 10-2-2 6-6H0V8h14l-6-6 2-2z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

/**
 * Attach event listeners to account cards
 */
function attachAccountListeners() {
  // Menu toggle
  document.querySelectorAll('.btn-menu-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const accountId = btn.dataset.accountId;
      const menu = document.getElementById(`menu-${accountId}`);
      
      // Close all other menus
      document.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m.id !== `menu-${accountId}`) {
          m.classList.remove('show');
        }
      });
      
      menu.classList.toggle('show');
    });
  });
  
  // Edit account (placeholder)
  document.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const accountId = btn.dataset.accountId;
      handleEditAccount(accountId);
    });
  });
  
  // Delete account
  document.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const accountId = btn.dataset.accountId;
      await handleDeleteAccount(accountId);
    });
  });
  
  // Enter account
  document.querySelectorAll('[data-action="enter"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const accountId = btn.dataset.accountId;
      handleEnterAccount(accountId);
    });
  });
  
  // Close menus on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.account-menu')) {
      document.querySelectorAll('.dropdown-menu').forEach(m => {
        m.classList.remove('show');
      });
    }
  });
}

/**
 * Handle account edit (placeholder)
 */
function handleEditAccount(accountId) {
  alert('🚧 Редактирование аккаунта будет доступно в следующей версии');
  console.log(`📝 Edit account: ${accountId}`);
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
 * Handle entering account (navigate to account dashboard)
 */
function handleEnterAccount(accountId) {
  console.log(`🚀 Entering account: ${accountId}`);
  
  // Import and show account navigation
  import('./accountNavigation.js').then(module => {
    module.showAccountDashboard(accountId);
  }).catch(err => {
    console.error('❌ Error loading account navigation:', err);
    alert('❌ Ошибка загрузки кабинета');
  });
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