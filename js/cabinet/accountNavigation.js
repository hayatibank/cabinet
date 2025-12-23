/* /webapp/js/cabinet/accountNavigation.js v1.1.1 */
// CHANGELOG v1.1.1:
// - Integrated Financial Report into Step 1
// - Replaced placeholder with real report

import { getAccountById } from './accounts.js';
import { renderBusinessTriangle } from './businessTriangle.js';
import { renderFinancialReport } from './reports/financialReport.js'; // 🆕 NEW

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
          <!-- Content will be loaded here -->
        </div>
      </div>
    `;
    
    // Load Step 1 (Financial Report) immediately
    await renderFinancialReport(account.accountId);
    
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
 * Attach dashboard navigation listeners
 */
function attachDashboardListeners(account) {
  const navButtons = document.querySelectorAll('.nav-step');
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const step = parseInt(btn.dataset.step);
      
      // Update active state
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Render step content
      await renderStepContent(step, account);
    });
  });
}

/**
 * Render step content based on step number
 */
async function renderStepContent(stepNumber, account) {
  const contentContainer = document.getElementById('dashboardContent');
  
  switch (stepNumber) {
    case 1:
      // Financial Report
      await renderFinancialReport(account.accountId);
      break;
      
    case 2:
      contentContainer.innerHTML = renderComingSoon(2, '🎯 Цели');
      break;
      
    case 3:
      contentContainer.innerHTML = renderComingSoon(3, '💵 Денежный поток');
      break;
      
    case 4:
      contentContainer.innerHTML = renderStep4(account);
      break;
      
    case 5:
      contentContainer.innerHTML = renderComingSoon(5, '🏢 Бизнес');
      break;
      
    case 6:
      setTimeout(() => renderBusinessTriangle('#dashboardContent'), 0);
      break;
      
    case 7:
      contentContainer.innerHTML = renderComingSoon(7, '🚀 IPO');
      break;
      
    default:
      await renderFinancialReport(account.accountId);
  }
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
            <span class="level-badge">Цифровые активы</span>
          </div>
          <p>Инвестиции в ЦФА (цифровые финансовые активы)</p>
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
 * Render coming soon placeholder
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
 * Go back to accounts list
 */
function goBack() {
  import('./accountsUI.js').then(module => {
    module.renderAccountsList();
  });
}

// Expose goBack globally
window.accountNavigation = { goBack };