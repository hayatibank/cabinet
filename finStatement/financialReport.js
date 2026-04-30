/* /webapp/js/cabinet/reports/financialReport.js v1.3.0 */
// CHANGELOG v1.3.0:
// - CRITICAL: Made Offering Zone fully async and isolated (prevents Android freeze)
// - Added timeouts: 3s for exchange rates, 5s for offering zone
// - Offering zone now loads in background without blocking financial report
// CHANGELOG v1.2.0:
// - Added Offering Zone integration
// - Fetch exchange rates for unit conversion
// CHANGELOG v1.1.2:
// - Fixed duplicate showEditModal import

import { getFinancialReport, calculateAnalysis } from './reportService.js';
import { initReportManager } from './reportManager.js';
import { 
  formatIncomeSection, 
  formatExpensesSection,
  formatAssetsSection,
  formatLiabilitiesSection,
  formatAnalysisSection 
} from './reportFormatters.js';
import { renderOfferingZone } from '../offeringZone/offeringZone.js';

let mobileExpandResizeBound = false;
let mobileExpandKeydownBound = false;
let mobileExpandedSection = null;
let mobileExpandedPlaceholder = null;
let mobileOverlayNode = null;

function syncReportLabelOverflow() {
  const tracks = document.querySelectorAll('.report-label-track');
  tracks.forEach((track) => {
    const text = track.querySelector('.report-label-text');
    if (!text) return;

    track.classList.remove('is-overflowing');
    track.style.removeProperty('--marquee-distance');

    const overflow = text.scrollWidth - track.clientWidth;
    if (overflow > 6) {
      track.classList.add('is-overflowing');
      track.style.setProperty('--marquee-distance', `-${overflow + 20}px`);
    }
  });
}
/**
 * Render financial report
 */



export async function renderFinancialReport(accountId, year = new Date().getFullYear()) {
  try {
    closeMobileExpandedSection();
    console.log(`📊 Rendering financial report: ${accountId}, ${year}`);
    const t = window.i18n?.t ? window.i18n.t.bind(window.i18n) : (_key, fallback) => fallback || _key;
    
    // Show loading
    const container = document.getElementById('dashboardContent');
    if (!container) {
      console.error('❌ Dashboard content container not found');
      return;
    }
    
    container.innerHTML = `
      <div class="loading-stack financial-report-loading" aria-live="polite" aria-busy="true">
        <div class="spinner"></div>
        <p class="loading-copy" data-i18n="report.loading">${t('report.loading', 'Loading financial report...')}</p>
      </div>
    `;
    
    // Fetch data
    const reportData = await getFinancialReport(accountId, year);
    const analysis = calculateAnalysis(reportData);
    
    // Initialize report manager
    initReportManager(accountId, year);
    
    // Import and expose showEditModal dynamically
    const { showEditModal } = await import('./reportManager.js');
    window.reportManager = { showEditModal };
    
    // Render report
    container.innerHTML = `
      <div class="financial-report">
        <!-- Year Selector -->
        <div class="year-selector">
          ${renderYearSelector(year)}
        </div>
        
        <!-- Report Grid -->
        <div class="report-grid">
          ${formatIncomeSection(reportData.income)}
          ${formatExpensesSection(reportData.expenses, analysis.totalIncome)}
          ${formatAssetsSection(reportData.assets)}
          ${formatLiabilitiesSection(reportData.liabilities, analysis.assetsByBanker, analysis.assetsFactual)}
          ${formatAnalysisSection(analysis)}
        </div>
      </div>
    `;
    
    // Attach listeners
    attachReportListeners(accountId);
    syncReportLabelOverflow();
    
    console.log('вњ… Financial report rendered');
    
    // Offering zone is temporarily disabled.
    // renderOfferingZoneAsync(accountId, year, reportData).catch(err => {
    //   console.error('❌ Offering zone failed (non-critical):', err);
    // });
    
  } catch (err) {
    console.error('❌ Error rendering financial report:', err);
    
    const container = document.getElementById('dashboardContent');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <p>❌ Ошибка загрузки финансового отчета</p>
          <button onclick="location.reload()" class="btn btn-secondary">
            Обновить
          </button>
        </div>
      `;
    }
  }
}

/**
 * Render offering zone asynchronously (non-blocking)
 */
async function renderOfferingZoneAsync(accountId, year, reportData) {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  try {
    console.log('🎁 [Background] Loading offering zone...');

    // fetchExchangeRates already has fallback, so no hard timeout race here
    const rates = await fetchExchangeRates();

    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const stale = document.getElementById('offeringZone');
        if (stale) stale.remove();

        await renderOfferingZone(accountId, year, reportData, rates);
        const mounted = document.getElementById('offeringZone');
        if (!mounted) {
          throw new Error('Offering zone was not mounted');
        }

        console.log(`✅ [Background] Offering zone loaded successfully (attempt ${attempt})`);
        return;
      } catch (attemptErr) {
        console.warn(`⚠️ [Background] Offering zone attempt ${attempt} failed:`, attemptErr?.message || attemptErr);
        if (attempt < maxAttempts) {
          await sleep(700);
        }
      }
    }

    console.warn('⚠️ [Background] Offering zone failed after retries');
  } catch (err) {
    console.warn('⚠️ [Background] Offering zone failed (non-critical):', err?.message || err);
    // Don't show error to user - offering zone is optional
  }
}

/**
 * Fetch exchange rates (RUB, USD)
 */
async function fetchExchangeRates() {
  try {
    // Use CBR API for AED/RUB
    const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js', {
      timeout: 5000
    });
    
    if (!response.ok) throw new Error('Failed to fetch rates');
    
    const data = await response.json();
    
    const rub = data.Valute?.AED?.Value || 25.0; // Fallback
    const usd = 0.272; // Fixed AED/USD rate
    
    console.log('💱 Exchange rates:', { rub, usd });
    
    return { rub, usd };
    
  } catch (err) {
    console.error('⚠️ Error fetching rates, using fallback:', err);
    return {
      rub: 25.0,
      usd: 0.272
    };
  }
}

/**
 * Render year selector
 */
function renderYearSelector(currentYear) {
  const years = [];
  for (let i = -3; i <= 3; i++) {
    years.push(currentYear + i);
  }
  
  return `
    <div class="year-selector-buttons">
      ${years.map(year => `
        <button 
          class="year-btn ${year === currentYear ? 'active' : ''}" 
          data-year="${year}"
        >
          ${year}
        </button>
      `).join('')}
    </div>
  `;
}

/**
 * Attach report event listeners
 */
function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
}

function setupMobileExpandHints() {
  const t = window.i18n?.t ? window.i18n.t.bind(window.i18n) : (key, fallback) => fallback || key;
  const hintText = t('report.tapToView', 'Tap to view');
  const headers = document.querySelectorAll('.report-section h3');
  headers.forEach((header) => {
    let hint = header.querySelector('.section-mobile-hint');
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'section-mobile-hint';
      header.appendChild(hint);
    }
    hint.textContent = hintText;
    hint.classList.toggle('is-visible', isMobileViewport());

    let closeBtn = header.querySelector('.section-mobile-close');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'section-mobile-close';
      closeBtn.setAttribute('aria-label', 'Close expanded section');
      closeBtn.textContent = '×';
      header.appendChild(closeBtn);
    }
  });
}

function focusActiveYearButton() {
  const wrap = document.querySelector('.year-selector-buttons');
  const active = document.querySelector('.year-selector-buttons .year-btn.active');
  if (!active || !wrap) return;
  const targetLeft = active.offsetLeft - Math.max(0, (wrap.clientWidth - active.clientWidth) / 2);
  wrap.scrollTo({
    left: Math.max(0, targetLeft),
    behavior: 'smooth'
  });
}

function ensureMobileOverlay() {
  if (mobileOverlayNode) return mobileOverlayNode;
  mobileOverlayNode = document.createElement('div');
  mobileOverlayNode.className = 'report-mobile-overlay';
  mobileOverlayNode.addEventListener('click', (event) => {
    if (event.target === mobileOverlayNode) {
      closeMobileExpandedSection();
    }
  });
  document.body.appendChild(mobileOverlayNode);
  return mobileOverlayNode;
}

function closeMobileExpandedSection() {
  if (!mobileExpandedSection) return;

  const sectionToClose = mobileExpandedSection;
  sectionToClose.classList.remove('mobile-expanded');

  if (mobileExpandedPlaceholder && mobileExpandedPlaceholder.parentNode) {
    mobileExpandedPlaceholder.parentNode.replaceChild(sectionToClose, mobileExpandedPlaceholder);
  }

  if (mobileOverlayNode) {
    mobileOverlayNode.classList.remove('is-open');
  }

  document.body.classList.remove('report-mobile-open');
  mobileExpandedSection = null;
  mobileExpandedPlaceholder = null;
}

function openMobileExpandedSection(sectionNode) {
  if (!sectionNode || !isMobileViewport()) return;

  if (mobileExpandedSection === sectionNode) {
    closeMobileExpandedSection();
    return;
  }

  closeMobileExpandedSection();

  const overlay = ensureMobileOverlay();
  const placeholder = document.createElement('div');
  placeholder.className = 'report-mobile-placeholder';
  sectionNode.parentNode.insertBefore(placeholder, sectionNode);
  overlay.appendChild(sectionNode);

  sectionNode.classList.add('mobile-expanded');
  overlay.classList.add('is-open');
  document.body.classList.add('report-mobile-open');

  mobileExpandedSection = sectionNode;
  mobileExpandedPlaceholder = placeholder;
}

function attachReportListeners(accountId) {
  // Year selector
  document.querySelectorAll('.year-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const year = parseInt(btn.dataset.year);
      renderFinancialReport(accountId, year);
    });
  });
  focusActiveYearButton();

  setupMobileExpandHints();
  if (!mobileExpandResizeBound) {
    window.addEventListener('resize', () => {
      if (!isMobileViewport()) {
        closeMobileExpandedSection();
      }
      setupMobileExpandHints();
      syncReportLabelOverflow();
    }, { passive: true });
    mobileExpandResizeBound = true;
  }
  if (!mobileExpandKeydownBound) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMobileExpandedSection();
      }
    });
    mobileExpandKeydownBound = true;
  }

  // Section click handlers
  document.querySelectorAll('.report-section h3').forEach(header => {
    const sectionNode = header.closest('.report-section');
    header.style.cursor = 'pointer';
    header.addEventListener('click', (event) => {
      if (isMobileViewport()) {
        if (event.target.closest('.section-mobile-close')) {
          closeMobileExpandedSection();
          return;
        }

        openMobileExpandedSection(sectionNode);
        return;
      }

      const headerClone = header.cloneNode(true);
      headerClone.querySelectorAll('.section-mobile-hint, .section-mobile-close').forEach((node) => node.remove());
      const section = headerClone.textContent.trim();
      showEditModal(section, accountId);
    });
  });
}

/**
 * Show edit modal (placeholder)
 */
function showEditModal(section, accountId) {
  alert(`🚧 Редактирование раздела "${section}" будет доступно в следующей версии`);
  console.log(`📝 Edit modal: ${section} for account ${accountId}`);
}

// Export for global access
if (typeof window !== 'undefined') {
  window.renderFinancialReport = renderFinancialReport;
}

