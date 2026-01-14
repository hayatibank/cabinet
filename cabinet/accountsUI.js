/* /webapp/cabinet/accountsUI.js v2.4.0 */
// CHANGELOG v2.4.0:
// - ADDED: Check availability before showing Create Account button
// - Button hidden if all account types are unavailable
// CHANGELOG v2.3.1:
// - FIXED: Syntax error - removed extra closing braces on lines 89-90
// CHANGELOG v2.3.0:
// - ADDED: Graceful degradation - show cabinet even if accounts fail to load
// - ADDED: Retry button on error
// - IMPROVED: Error message UX
// CHANGELOG v2.2.2:
// - REMOVED: waitForI18n() - no longer needed
// - ASSUMED: i18n is always ready (guaranteed by app.js)

import { getUserAccounts, deleteAccount } from './accounts.js';
import { showCreateAccountForm } from './createAccount.js';

/**
 * Render accounts list in cabinet
 */
export async function renderAccountsList() {
  // ✅ i18n is guaranteed to be ready (no need to wait)
  const t = window.i18n.t.bind(window.i18n);
  
  try {
    console.log('📋 Loading accounts...');
    
    const accounts = await getUserAccounts();
    const container = document.querySelector('.cabinet-content');
    
    if (!container) {
      console.error('❌ Cabinet content container not found');
      return;
    }
    
    if (accounts.length === 0) {
      container.innerHTML = `
        <div class="no-accounts">
          <p data-i18n="cabinet.noAccounts">${t('cabinet.noAccounts')}</p>
          <p class="subtitle" data-i18n="cabinet.noAccountsSubtitle">${t('cabinet.noAccountsSubtitle')}</p>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="accounts-list">
          ${accounts.map(acc => renderAccountCard(acc)).join('')}
        </div>
      `;
      
      attachAccountListeners();
    }
    
    console.log(`✅ Rendered ${accounts.length} accounts`);
    
  } catch (err) {
    console.error('❌ Error rendering accounts:', err);
    
    // ✅ GRACEFUL DEGRADATION: Show error message but keep cabinet functional
    const t = window.i18n.t.bind(window.i18n);
    const container = document.querySelector('.cabinet-content');
    
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <h3>⚠️ ${'cabinet.errorLoadingAccounts' in window.i18n.translations ? t('cabinet.errorLoadingAccounts') : 'Ошибка загрузки аккаунтов'}</h3>
          <p class="error-details">${err.message || 'Неизвестная ошибка'}</p>
          <p class="error-hint">Возможно, проблема с подключением к серверу. Попробуйте ещё раз.</p>
          <div class="error-actions">
            <button onclick="window.location.reload()" class="btn btn-3d btn-3d-compact">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              <span>Обновить</span>
            </button>
            <button onclick="renderAccountsList()" class="btn btn-secondary btn-3d-compact">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
              </svg>
              <span>Повторить</span>
            </button>
          </div>
        </div>
        
        <div class="cabinet-info">
          <p>📝 <strong>Ваш личный кабинет доступен</strong></p>
          <p>Вы можете продолжить работу после исправления проблемы.</p>
        </div>
      `;
    }
    
    // ✅ DON'T throw - keep cabinet functional
    // throw err;  // ❌ NO! This would crash the whole cabinet
  }
}

// ... rest of the file stays the same ...

/**
 * Render single account card
 */
function renderAccountCard(account) {
  const t = window.i18n.t.bind(window.i18n);
  
  const { accountId, type, profile } = account;
  
  const typeLabels = {
    individual: t('cabinet.accountType.individual'),
    business: t('cabinet.accountType.business'),
    government: t('cabinet.accountType.government')
  };
  
  const typeLabel = typeLabels[type] || t('cabinet.accounts');
  
  let profileName = t('cabinet.account.noName');
  if (type === 'individual' && profile) {
    profileName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  }
  
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
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z"/>
              </svg>
              <span data-i18n="cabinet.account.edit">${t('cabinet.account.edit')}</span>
            </button>
            <button class="dropdown-item dropdown-item-danger" data-action="delete" data-account-id="${accountId}">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z"/>
              </svg>
              <span data-i18n="cabinet.account.delete">${t('cabinet.account.delete')}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="account-body">
        <h3 class="account-name">${profileName}</h3>
      </div>
      
      <div class="account-actions">
        <button class="btn btn-enter" data-action="enter" data-account-id="${accountId}">
          <span class="btn-text" data-i18n="cabinet.account.enter">${t('cabinet.account.enter')}</span>
          <svg class="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 0l10 10-10 10-2-2 6-6H0V8h14l-6-6 2-2z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

// ... rest stays the same (attachAccountListeners, etc) ...

function attachAccountListeners() {
  document.querySelectorAll('.btn-menu-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const accountId = btn.dataset.accountId;
      const menu = document.getElementById(`menu-${accountId}`);
      
      document.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m.id !== `menu-${accountId}`) {
          m.classList.remove('show');
        }
      });
      
      menu.classList.toggle('show');
    });
  });
  
  document.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', () => handleEditAccount(btn.dataset.accountId));
  });
  
  document.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteAccount(btn.dataset.accountId));
  });
  
  document.querySelectorAll('[data-action="enter"]').forEach(btn => {
    btn.addEventListener('click', () => handleEnterAccount(btn.dataset.accountId));
  });
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.account-menu')) {
      document.querySelectorAll('.dropdown-menu').forEach(m => {
        m.classList.remove('show');
      });
    }
  });
}

function handleEditAccount(accountId) {
  const t = window.i18n.t.bind(window.i18n);
  alert(t('cabinet.account.editPlaceholder'));
}

async function handleDeleteAccount(accountId) {
  const t = window.i18n.t.bind(window.i18n);
  
  try {
    const confirmed = confirm(t('cabinet.account.deleteConfirm'));
    if (!confirmed) return;
    
    console.log(`🗑️ Deleting account: ${accountId}`);
    await deleteAccount(accountId);
    alert(t('cabinet.accountDeleted'));
    await renderAccountsList();
  } catch (err) {
    console.error('❌ Error deleting account:', err);
    alert(t('cabinet.createAccount.error'));
  }
}

function handleEnterAccount(accountId) {
  console.log(`🚀 Entering account: ${accountId}`);
  
  import('../accountDashboard/accountNavigation.js').then(module => {
    module.showAccountDashboard(accountId);
  }).catch(err => {
    const t = window.i18n.t.bind(window.i18n);
    console.error('❌ Error loading account navigation:', err);
    alert(t('cabinet.errorLoadingAccounts'));
  });
}

export async function showCreateAccountButton() {
  const t = window.i18n.t.bind(window.i18n);
  const actionsContainer = document.querySelector('.cabinet-actions');
  
  if (!actionsContainer || actionsContainer.querySelector('.btn-create-account')) {
    return;
  }
  
  // ✅ Check availability before showing button
  let canCreateAnything = false;
  try {
    const { checkAccountAvailability } = await import('./accounts.js');
    const availability = await checkAccountAvailability();
    
    canCreateAnything = 
      availability.individual.canCreate ||
      availability.business.canCreate ||
      availability.government.canCreate;
    
    console.log('🔍 Account creation availability:', canCreateAnything);
  } catch (err) {
    console.error('⚠️ Failed to check availability:', err);
    // Default to showing button if check fails
    canCreateAnything = true;
  }
  
  // ✅ Only show create button if user can create something
  if (canCreateAnything) {
    actionsContainer.innerHTML = `
      <button class="btn btn-primary btn-create-account">
        <span data-i18n="cabinet.createAccount">${t('cabinet.createAccount')}</span>
      </button>
      <button onclick="showProfileMenu()" class="btn btn-secondary">
        <span data-i18n="cabinet.settings">${t('cabinet.settings')}</span>
      </button>
      <button onclick="logout()" class="btn btn-ghost">
        <span data-i18n="auth.logout.button">${t('auth.logout.button')}</span>
      </button>
    `;
    
    const createBtn = actionsContainer.querySelector('.btn-create-account');
    if (createBtn) {
      createBtn.onclick = showCreateAccountForm;
    }
  } else {
    // ✅ No create button, just settings and logout
    actionsContainer.innerHTML = `
      <button onclick="showProfileMenu()" class="btn btn-secondary">
        <span data-i18n="cabinet.settings">${t('cabinet.settings')}</span>
      </button>
      <button onclick="logout()" class="btn btn-ghost">
        <span data-i18n="auth.logout.button">${t('auth.logout.button')}</span>
      </button>
    `;
    
    console.log('ℹ️ Create account button hidden (no available types)');
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('cabinetReady', async (event) => {
    console.log('📋 Cabinet ready:', event.detail);
    showCreateAccountButton();
    await renderAccountsList();
  });
}
