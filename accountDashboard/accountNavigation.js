/* /webapp/accountDashboard/accountNavigation.js v1.8.0 */
// CHANGELOG v1.8.0:
// - CRITICAL FIX: Removed ALL alert() calls (causing Android freeze)
// - Error messages now show in UI instead of blocking alerts
// - Locked steps no longer show alert popup
// CHANGELOG v1.7.1:
// - OPTIMIZED: Reduced timeout to 2s (was 3s) for faster mobile response
// - ADDED: Loading indicator shows immediately (better UX on slow networks)
// CHANGELOG v1.7.0:
// - FIXED: Permissions check now has 3s timeout (non-blocking for Android/slow networks)
// - Dashboard always loads with step 1 unlocked even if API fails
// CHANGELOG v1.6.0:
// - CHANGED: Now uses Firestore-based permissions (not hardcoded)
// - CHANGED: All 7 steps can be locked/unlocked individually
// - Works with new premiumAccess.js v2.0.0
// CHANGELOG v1.5.0:
// - ADDED: Premium access control for steps 2-4
// - ADDED: Lock icons and disabled state for locked steps
// - ADDED: Step label colors match active border (neon-blue)
// CHANGELOG v1.4.2:
// - FIXED: Import financialReport from ../finStatement/ (modular)
// CHANGELOG v1.4.1:
// - FIXED: goBack() import path (../cabinet/accountsUI.js)
// CHANGELOG v1.4.0:
// - MOVED: From /cabinet/ to /accountDashboard/ (modular)
// - FIXED: Import paths for new module location
// CHANGELOG v1.3.0:
// - MOVED: From /js/cabinet/ to /cabinet/ (modular)
// - FIXED: Import paths for finStatement module
// CHANGELOG v1.2.3:
// - FIXED: Import businessTriangle from ../../businessTriangle/ (modular)
// CHANGELOG v1.2.2:
// - Fixed import path for investments module (now in /investments/)
// CHANGELOG v1.2.1:
// - Added Step 4 (Investments) integration with Level 1 dashboard
// CHANGELOG v1.2.0:
// - FIXED: Step 6 now calls showBusinessManagement() with accountId
// - Added accountId passing to all steps
// - Offering Zone integration confirmed
// Account dashboard navigation with 7 steps

import { getAccountById } from '../cabinet/accounts.js';
import { showBusinessManagement } from '../businessTriangle/businessTriangle.js';
import { renderFinancialReport } from '../finStatement/financialReport.js';
import { renderLevel1 } from '../investments/level1.js';
import { claimHYC } from '../HayatiCoin/hycService.js';
import { checkPremiumStatus, isStepUnlocked } from '../js/utils/premiumAccess.js';

/**
 * Show account dashboard with 7-step navigation
 */
export async function showAccountDashboard(accountId) {

  await claimHYC('dashboard_entry', accountId);
  try {
    console.log(`📊 Loading dashboard for account: ${accountId}`);
    
    // Set global accountId for nested components
    window.currentAccountId = accountId;
    
    // Check premium status (non-blocking, defaults to step1 unlocked)
    let premiumStatus;
    try {
      // ✅ Race with 2-second timeout (shorter for mobile)
      premiumStatus = await Promise.race([
        checkPremiumStatus(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ]);
      console.log('✅ Premium status loaded:', premiumStatus);
    } catch (err) {
      console.warn('⚠️ Premium check failed/timeout (normal on slow networks):', err.message);
      // ✅ Default: step 1 unlocked, rest locked
      premiumStatus = {
        uid: null,
        permissions: {
          step1: true,
          step2: false,
          step3: false,
          step4: false,
          step5: false,
          step6: false,
          step7: false
        },
        unlockedSteps: [1],
        lockedSteps: [2, 3, 4, 5, 6, 7]
      };
    }
    
    // Get account data
    const account = await getAccountById(accountId);
    
    if (!account) {
      console.error('❌ Account not found:', accountId);
      // Show error in UI instead of alert
      container.innerHTML = `
        <div class="error-screen" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
          padding: 40px;
          text-align: center;
        ">
          <div style="font-size: 64px;">❌</div>
          <h2 style="color: var(--neon-pink);">Аккаунт не найден</h2>
          <button class="btn btn-3d" onclick="window.accountNavigation.goBack()">
            <span>← Назад к списку</span>
          </button>
        </div>
      `;
      return;
    }
    
    // Get container
    const container = document.querySelector('.cabinet-content');
    
    if (!container) {
      console.error('❌ Cabinet content container not found');
      return;
    }
    
    // ✅ Show loading immediately
    container.innerHTML = `
      <div class="loading-dashboard" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        gap: 16px;
      ">
        <div class="spinner" style="
          border: 3px solid rgba(0, 240, 255, 0.1);
          border-top: 3px solid var(--neon-blue);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        "></div>
        <p style="color: var(--text-muted);">📏 Загрузка кабинета...</p>
      </div>
    `;
    
    // Render dashboard with locked steps
    container.innerHTML = `
      <div class="account-dashboard">
        <div class="dashboard-header">
          <button class="btn-back" onclick="window.accountNavigation.goBack()">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 20L0 10 10 0l2 2-6 6h14v4H6l6 6-2 2z"/>
            </svg>
            <span data-i18n="dashboard.backToList">Назад к списку</span>
          </button>
          <h2>${account.profile?.firstName || 'Аккаунт'} ${account.profile?.lastName || ''}</h2>
          <p class="account-type-badge">${getTypeBadge(account.type)}</p>
        </div>
        
        <nav class="dashboard-nav">
          ${renderStep(1, 'Фин. отчёт', true, premiumStatus)}
          ${renderStep(2, 'Цели', false, premiumStatus)}
          ${renderStep(3, 'Ден. поток', false, premiumStatus)}
          ${renderStep(4, 'Инвестиции', false, premiumStatus)}
          ${renderStep(5, 'Бизнес', false, premiumStatus)}
          ${renderStep(6, 'Биз. управление', false, premiumStatus)}
          ${renderStep(7, 'IPO', false, premiumStatus)}
        </nav>
        
        <div class="dashboard-content" id="dashboardContent">
          <!-- Content will be loaded here -->
        </div>
      </div>
    `;
    
    // Load Step 1 (Financial Report + Offering Zone) immediately
    await renderFinancialReport(account.accountId);
    
    // Attach navigation listeners with premium status
    attachDashboardListeners(account, premiumStatus);
    
  } catch (err) {
    console.error('❌ Error loading dashboard:', err);
    // Show error in UI instead of alert
    const container = document.querySelector('.cabinet-content');
    if (container) {
      container.innerHTML = `
        <div class="error-screen" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
          padding: 40px;
          text-align: center;
        ">
          <div style="font-size: 64px;">⚠️</div>
          <h2 style="color: var(--neon-pink);">Ошибка загрузки</h2>
          <p style="color: var(--text-muted); font-size: 14px;">${err.message}</p>
          <button class="btn btn-3d" onclick="window.accountNavigation.goBack()">
            <span>← Назад к списку</span>
          </button>
        </div>
      `;
    }
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
 * Render single step button
 */
function renderStep(stepNumber, label, isActive, premiumStatus) {
  const isLocked = !isStepUnlocked(stepNumber, premiumStatus);
  const activeClass = isActive ? 'active' : '';
  const lockedClass = isLocked ? 'locked' : '';
  const lockIcon = isLocked ? '<span class="lock-icon">🔒</span>' : '';
  
  return `
    <button class="nav-step ${activeClass} ${lockedClass}" data-step="${stepNumber}" ${isLocked ? 'disabled' : ''}>
      ${lockIcon}
      <span class="step-number">${stepNumber}</span>
      <span class="step-label">${label}</span>
    </button>
  `;
}

/**
 * Attach dashboard navigation listeners
 */
function attachDashboardListeners(account, premiumStatus) {
  const navButtons = document.querySelectorAll('.nav-step');
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const step = parseInt(btn.dataset.step);
      
      // Check if step is locked
      if (!isStepUnlocked(step, premiumStatus)) {
        const message = window.i18n?.t('premium.locked.message') || '🔒 Этот раздел доступен только premium пользователям.\n\nСкоро будет доступно для всех!';
        console.log('🔒 Step locked:', step, message);
        // ✅ Don't show alert on Android - just log and prevent action
        return;
      }
      
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
      // Financial Report + Offering Zone
      await renderFinancialReport(account.accountId);
      break;
      
    case 2:
      contentContainer.innerHTML = renderComingSoon(2, '🎯 Цели');
      break;
      
    case 3:
      contentContainer.innerHTML = renderComingSoon(3, '💵 Денежный поток');
      break;
      
    case 4:
      // ✅ NEW: Investment Level 1 Dashboard
      await renderLevel1(account.accountId);
      break;
      
    case 5:
      contentContainer.innerHTML = renderComingSoon(5, '🏢 Бизнес');
      break;
      
    case 6:
      // Business Management with Product Selector
      await showBusinessManagement(account.accountId, '#dashboardContent');
      break;
      
    case 7:
      contentContainer.innerHTML = renderComingSoon(7, '🚀 IPO');
      break;
      
    default:
      await renderFinancialReport(account.accountId);
  }
}

/**
 * Render Step 4: Investments (LEGACY - kept for reference)
 * Now using renderLevel1() from investments/level1.js
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
  // Clear global accountId
  delete window.currentAccountId;
  
  import('../cabinet/accountsUI.js').then(module => {
    module.renderAccountsList();
  });
}

// Expose goBack globally
window.accountNavigation = { goBack };