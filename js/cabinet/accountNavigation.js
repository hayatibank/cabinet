// webapp/js/cabinet/accountNavigation.js v1.0.0
// Account dashboard navigation (7 steps for individual accounts)
// CHANGELOG v1.0.0:
// - Initial implementation
// - 7-step navigation for individual accounts
// - Step 1: Financial Report (with sub-sections)
// - Steps 2-7: Goals, Cash Flow, Investments, Business, Management, IPO

import { getAccountById } from './accounts.js';

/**
 * Show account dashboard with 7-step navigation
 */
export async function showAccountDashboard(accountId) {
  try {
    console.log(`📊 Loading dashboard for account: ${accountId}`);
    
    // Get account data
    const account = await getAccountById(accountId);
    
    if (!account) {
      alert('❌ Аккаунт не найден');
      return;
    }
    
    // Get container
    const container = document.querySelector('.cabinet-content');
    
    if (!container) {
      console.error('❌ Cabinet content container not found');
      return;
    }
    
    // Render dashboard
    container.innerHTML = `
      <div class="account-dashboard">
        <div class="dashboard-header">
          <button class="btn-back" onclick="window.accountNavigation.goBack()">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 20L0 10 10 0l2 2-6 6h14v4H6l6 6-2 2z"/>
            </svg>
            Назад к списку
          </button>
          <h2>${account.profile?.firstName || 'Аккаунт'} ${account.profile?.lastName || ''}</h2>
          <p class="account-type-badge">${getTypeBadge(account.type)}</p>
        </div>
        
        <nav class="dashboard-nav">
          <button class="nav-step active" data-step="1">
            <span class="step-number">1</span>
            <span class="step-label">Фин. отчёт</span>
          </button>
          <button class="nav-step" data-step="2">
            <span class="step-number">2</span>
            <span class="step-label">Цели</span>
          </button>
          <button class="nav-step" data-step="3">
            <span class="step-number">3</span>
            <span class="step-label">Ден. поток</span>
          </button>
          <button class="nav-step" data-step="4">
            <span class="step-number">4</span>
            <span class="step-label">Инвестиции</span>
          </button>
          <button class="nav-step" data-step="5">
            <span class="step-number">5</span>
            <span class="step-label">Бизнес</span>
          </button>
          <button class="nav-step" data-step="6">
            <span class="step-number">6</span>
            <span class="step-label">Биз. управление</span>
          </button>
          <button class="nav-step" data-step="7">
            <span class="step-number">7</span>
            <span class="step-label">IPO</span>
          </button>
        </nav>
        
        <div class="dashboard-content" id="dashboardContent">
          ${renderStep1(account)}
        </div>
      </div>
    `;
    
    // Attach navigation listeners
    attachDashboardListeners(account);
    
  } catch (err) {
    console.error('❌ Error loading dashboard:', err);
    alert('❌ Ошибка загрузки кабинета');
  }
}

/**
 * Get type badge text
 */
function getTypeBadge(type) {
  const badges = {
    individual: '👤 Физическое лицо',
    business: '🏢 Юридическое лицо',
    government: '🏛️ Госорганизация'
  };
  return badges[type] || 'Аккаунт';
}

/**
 * Render Step 1: Financial Report
 */
function renderStep1(account) {
  const balance = account.balance || { rub: 0, usd: 0, aed: 0, btc: 0 };
  
  return `
    <div class="step-content step-1">
      <h3>📊 Финансовый отчёт</h3>
      
      <div class="financial-report">
        <div class="balance-section">
          <h4>💰 Баланс</h4>
          <div class="balance-grid">
            <div class="balance-item">
              <span class="currency">₽</span>
              <span class="amount">${formatNumber(balance.rub || 0)}</span>
            </div>
            <div class="balance-item">
              <span class="currency">$</span>
              <span class="amount">${formatNumber(balance.usd || 0)}</span>
            </div>
            <div class="balance-item">
              <span class="currency">AED</span>
              <span class="amount">${formatNumber(balance.aed || 0)}</span>
            </div>
            <div class="balance-item">
              <span class="currency">₿</span>
              <span class="amount">${formatNumber(balance.btc || 0)}</span>
            </div>
          </div>
        </div>
        
        <div class="report-actions">

          <button class="report-btn" data-action="income">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
            <span>Доходы</span>
          </button>

          <button class="report-btn" data-action="expenses">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"/>
            </svg>
            <span>Расходы</span>
          </button>
          
          <button class="report-btn" data-action="assets">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v3h20V7M20 18c0 1.11-.89 2-2 2H6c-1.11 0-2-.89-2-2v-8h16v8m-7.5-3.5h-1V17h-1v-2.5h-1v-1h1V11h1v2.5h1v1z"/>
            </svg>
            <span>Активы</span>
          </button>
          
          <button class="report-btn" data-action="liabilities">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
            <span>Пассивы</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Step 2: Goals
 */
function renderStep2(account) {
  return `
    <div class="step-content step-2">
      <h3>🎯 Цели</h3>
      <div class="coming-soon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <p>Раздел в разработке</p>
      </div>
    </div>
  `;
}

/**
 * Render Step 3: Cash Flow
 */
function renderStep3(account) {
  return `
    <div class="step-content step-3">
      <h3>💵 Денежный поток</h3>
      <div class="coming-soon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <p>Раздел в разработке</p>
      </div>
    </div>
  `;
}

/**
 * Render Step 4: Investments
 */
function renderStep4(account) {
  return `
    <div class="step-content step-4">
      <h3>📈 Инвестиции</h3>
      
      <div class="investment-levels">
        <div class="level-card">
          <div class="level-header">
            <h4>📊 Уровень №1</h4>
            <span class="level-badge">Трейдинг</span>
          </div>
          <p>Торговля на финансовых рынках</p>
          <button class="btn btn-secondary btn-small">Скоро</button>
        </div>
        
        <div class="level-card">
          <div class="level-header">
            <h4>🏢 Уровень №2</h4>
            <span class="level-badge">Недвижимость</span>
          </div>
          <p>Инвестиции в недвижимость</p>
          <button class="btn btn-secondary btn-small">Скоро</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Step 5-7: Coming Soon
 */
function renderComingSoon(stepNumber, title) {
  return `
    <div class="step-content step-${stepNumber}">
      <h3>${title}</h3>
      <div class="coming-soon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <p>Раздел в разработке</p>
      </div>
    </div>
  `;
}

/**
 * Attach dashboard navigation listeners
 */
function attachDashboardListeners(account) {
  const navButtons = document.querySelectorAll('.nav-step');
  const contentContainer = document.getElementById('dashboardContent');
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.dataset.step;
      
      // Update active state
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Render step content
      contentContainer.innerHTML = renderStepContent(parseInt(step), account);
      
      // Attach step-specific listeners
      attachStepListeners(parseInt(step), account);
    });
  });
}

/**
 * Render step content based on step number
 */
function renderStepContent(stepNumber, account) {
  switch (stepNumber) {
    case 1: return renderStep1(account);
    case 2: return renderStep2(account);
    case 3: return renderStep3(account);
    case 4: return renderStep4(account);
    case 5: return renderComingSoon(5, '🏢 Бизнес');
    case 6: return renderComingSoon(6, '📊 Биз. управление');
    case 7: return renderComingSoon(7, '🚀 IPO');
    default: return renderStep1(account);
  }
}

/**
 * Attach step-specific listeners
 */
function attachStepListeners(stepNumber, account) {
  if (stepNumber === 1) {
    // Financial report action buttons
    document.querySelectorAll('.report-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        handleReportAction(action, account);
      });
    });
  }
}

/**
 * Handle financial report actions
 */
function handleReportAction(action, account) {
  console.log(`📊 Report action: ${action} for account ${account.accountId}`);
  alert(`🚧 ${action.toUpperCase()}: раздел в разработке`);
}

/**
 * Go back to accounts list
 */
function goBack() {
  import('./accountsUI.js').then(module => {
    module.renderAccountsList();
  });
}

/**
 * Format number with locale
 */
function formatNumber(num) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

// Expose goBack globally
window.accountNavigation = { goBack };