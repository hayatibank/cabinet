/* /webapp/accountDashboard/accountNavigation.js v1.9.0 */
// CHANGELOG v1.9.0:
// - Rewritten with clean i18n fallbacks (no mojibake)
// - Fixed container usage before declaration on account-not-found path
// - Unified dashboard step labels via i18n keys

import { getAccountById } from '../cabinet/accounts.js';
import { showBusinessManagement } from '../businessTriangle/businessTriangle.js';
import { renderFinancialReport } from '../finStatement/financialReport.js';
import { renderLevel1 } from '../investments/level1.js';
import { claimHYC } from '../HayatiCoin/hycService.js';
import { checkPremiumStatus, isStepUnlocked } from '../js/utils/premiumAccess.js';

function t(key) {
  return window.i18n?.t?.(key) || key;
}

function getDefaultPremiumStatus() {
  return {
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

function normalizePremiumStatus(status) {
  const safe = status && typeof status === 'object' ? status : {};
  const unlocked = Array.isArray(safe.unlockedSteps) ? [...safe.unlockedSteps] : [];
  if (!unlocked.includes(1)) unlocked.unshift(1);

  return {
    uid: safe.uid || null,
    permissions: {
      step1: true,
      step2: !!safe.permissions?.step2,
      step3: !!safe.permissions?.step3,
      step4: !!safe.permissions?.step4,
      step5: !!safe.permissions?.step5,
      step6: !!safe.permissions?.step6,
      step7: !!safe.permissions?.step7
    },
    unlockedSteps: unlocked,
    lockedSteps: [2, 3, 4, 5, 6, 7].filter((step) => !unlocked.includes(step))
  };
}

function getTypeBadge(type) {
  const badges = {
    individual: t('cabinet.accountType.individual'),
    business: t('cabinet.accountType.business'),
    government: t('cabinet.accountType.government')
  };
  return badges[type] || t('dashboard.account');
}

function renderStep(stepNumber, label, isActive, premiumStatus) {
  const isLocked = !isStepUnlocked(stepNumber, premiumStatus);
  const activeClass = isActive ? 'active' : '';
  const lockedClass = isLocked ? 'locked' : '';
  const lockIcon = isLocked ? '<span class="lock-icon" aria-hidden="true">&#128274;</span>' : '';

  return `
    <button class="nav-step ${activeClass} ${lockedClass}" data-step="${stepNumber}" ${isLocked ? 'disabled' : ''}>
      ${lockIcon}
      <span class="step-number">${stepNumber}</span>
      <span class="step-label">${label}</span>
    </button>
  `;
}

function renderComingSoon(stepNumber, title) {
  return `
    <div class="step-content step-${stepNumber}">
      <h3>${title}</h3>
      <div class="coming-soon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <p>${t('dashboard.comingSoon')}</p>
      </div>
    </div>
  `;
}

async function renderStepContent(stepNumber, account) {
  const contentContainer = document.getElementById('dashboardContent');

  switch (stepNumber) {
    case 1:
      await renderFinancialReport(account.accountId);
      break;
    case 2:
      if (contentContainer) contentContainer.innerHTML = renderComingSoon(2, t('dashboard.step2'));
      break;
    case 3:
      if (contentContainer) contentContainer.innerHTML = renderComingSoon(3, t('dashboard.step3'));
      break;
    case 4:
      await renderLevel1(account.accountId);
      break;
    case 5:
      if (contentContainer) contentContainer.innerHTML = renderComingSoon(5, t('dashboard.step5'));
      break;
    case 6:
      await showBusinessManagement(account.accountId, '#dashboardContent');
      break;
    case 7:
      if (contentContainer) contentContainer.innerHTML = renderComingSoon(7, t('dashboard.step7'));
      break;
    default:
      await renderFinancialReport(account.accountId);
  }
}

function attachDashboardListeners(account, premiumStatus) {
  const navButtons = document.querySelectorAll('.nav-step');

  navButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const step = parseInt(btn.dataset.step || '1', 10);

      if (!isStepUnlocked(step, premiumStatus)) {
        const message = t('premium.locked.message');
        console.log('[dashboard] step locked:', step, message);
        return;
      }

      navButtons.forEach((node) => node.classList.remove('active'));
      btn.classList.add('active');

      await renderStepContent(step, account);
    });
  });
}

export async function showAccountDashboard(accountId) {
  await claimHYC('dashboard_entry', accountId);

  try {
    console.log('[dashboard] loading account:', accountId);
    window.currentAccountId = accountId;

    const container = document.querySelector('.cabinet-content');
    if (!container) {
      console.error('[dashboard] cabinet content container not found');
      return;
    }

    let premiumStatus;
    try {
      premiumStatus = await checkPremiumStatus();
      premiumStatus = normalizePremiumStatus(premiumStatus);
      console.log('[dashboard] premium status loaded:', premiumStatus);
    } catch (err) {
      console.warn('[dashboard] premium check failed:', err.message);
      premiumStatus = getDefaultPremiumStatus();
    }

    const account = await getAccountById(accountId);
    if (!account) {
      container.innerHTML = `
        <div class="error-screen" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;padding:40px;text-align:center;">
          <div style="font-size:64px;">!</div>
          <h2 style="color: var(--neon-pink);">${t('dashboard.accountNotFound')}</h2>
          <button class="btn btn-3d" onclick="window.accountNavigation.goBack()">
            <span>${t('dashboard.backToList')}</span>
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="loading-dashboard" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;">
        <div class="spinner" style="border:3px solid rgba(0, 240, 255, 0.1);border-top:3px solid var(--neon-blue);border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;"></div>
        <p style="color: var(--text-muted);">${t('dashboard.loading')}</p>
      </div>
    `;

    container.innerHTML = `
      <div class="account-dashboard">
        <div class="dashboard-header">
          <button class="btn-back" onclick="window.accountNavigation.goBack()">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 20L0 10 10 0l2 2-6 6h14v4H6l6 6-2 2z"/>
            </svg>
            <span data-i18n="dashboard.backToList">${t('dashboard.backToList')}</span>
          </button>
          <h2>${account.profile?.firstName || t('dashboard.account')} ${account.profile?.lastName || ''}</h2>
          <p class="account-type-badge">${getTypeBadge(account.type)}</p>
        </div>

        <nav class="dashboard-nav">
          ${renderStep(1, t('dashboard.step1'), true, premiumStatus)}
          ${renderStep(2, t('dashboard.step2'), false, premiumStatus)}
          ${renderStep(3, t('dashboard.step3'), false, premiumStatus)}
          ${renderStep(4, t('dashboard.step4'), false, premiumStatus)}
          ${renderStep(5, t('dashboard.step5'), false, premiumStatus)}
          ${renderStep(6, t('dashboard.step6'), false, premiumStatus)}
          ${renderStep(7, t('dashboard.step7'), false, premiumStatus)}
        </nav>

        <div class="dashboard-content" id="dashboardContent"></div>
      </div>
    `;

    await renderFinancialReport(account.accountId);
    attachDashboardListeners(account, premiumStatus);
  } catch (err) {
    console.error('[dashboard] error loading:', err);
    const container = document.querySelector('.cabinet-content');
    if (!container) return;

    container.innerHTML = `
      <div class="error-screen" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;padding:40px;text-align:center;">
        <div style="font-size:64px;">!</div>
        <h2 style="color: var(--neon-pink);">${t('dashboard.errorLoading')}</h2>
        <p style="color: var(--text-muted); font-size: 14px;">${err.message}</p>
        <button class="btn btn-3d" onclick="window.accountNavigation.goBack()">
          <span>${t('dashboard.backToList')}</span>
        </button>
      </div>
    `;
  }
}

function goBack() {
  delete window.currentAccountId;
  import('../cabinet/accountsUI.js').then((module) => {
    module.renderAccountsList();
  });
}

window.accountNavigation = { goBack };
