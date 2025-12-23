/* /webapp/js/cabinet/reports/financialReport.js v1.0.0 */
// Financial Report UI

import { getFinancialReport, calculateAnalysis } from './reportService.js';
import { 
  formatIncomeSection, 
  formatExpensesSection,
  formatAssetsSection,
  formatLiabilitiesSection,
  formatAnalysisSection 
} from './reportFormatters.js';

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
          ${formatExpensesSection(reportData.expenses)}
          ${formatAssetsSection(reportData.assets)}
          ${formatLiabilitiesSection(reportData.liabilities)}
          ${formatAnalysisSection(analysis)}
        </div>
      </div>
    `;
    
    // Attach listeners
    attachReportListeners(accountId);
    
    console.log('✅ Financial report rendered');
    
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