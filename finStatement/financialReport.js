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
/**
 * Render financial report
 */



export async function renderFinancialReport(accountId, year = new Date().getFullYear()) {
  try {
    console.log(`📊 Rendering financial report: ${accountId}, ${year}`);
    
    // Show loading
    const container = document.getElementById('dashboardContent');
    if (!container) {
      console.error('❌ Dashboard content container not found');
      return;
    }
    
    container.innerHTML = `
      <div class="financial-report-loading">
        <div class="spinner"></div>
        <p>Загрузка финансового отчета...</p>
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
    
    console.log('✅ Financial report rendered');
    
    // ✅ NEW: Render Offering Zone (NON-BLOCKING, ISOLATED)
    // Don't wait for offering zone - let it load in background
    renderOfferingZoneAsync(accountId, year, reportData).catch(err => {
      console.error('❌ Offering zone failed (non-critical):', err);
    });
    
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
  try {
    console.log('🎁 [Background] Loading offering zone...');
    
    // ✅ Fetch exchange rates with timeout
    const rates = await Promise.race([
      fetchExchangeRates(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Rates timeout')), 3000))
    ]);
    
    // ✅ Render offering zone with timeout
    await Promise.race([
      renderOfferingZone(accountId, year, reportData, rates),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Offering zone timeout')), 5000))
    ]);
    
    console.log('✅ [Background] Offering zone loaded successfully');
    
  } catch (err) {
    console.warn('⚠️ [Background] Offering zone failed (non-critical):', err.message);
    // Don't show error to user - offering zone is optional
  }
}

/**
 * Fetch exchange rates (RUB, USD)
 */
async function fetchExchangeRates() {
  try {
    // Use ЦБ РФ API for AED/RUB
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
function attachReportListeners(accountId) {
  // Year selector
  document.querySelectorAll('.year-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const year = parseInt(btn.dataset.year);
      renderFinancialReport(accountId, year);
    });
  });
  
  // Section click handlers (for future modal editing)
  document.querySelectorAll('.report-section h3').forEach(header => {
    header.style.cursor = 'pointer';
    header.addEventListener('click', () => {
      const section = header.textContent.trim();
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