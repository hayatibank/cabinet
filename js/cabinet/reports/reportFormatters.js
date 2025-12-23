/* /webapp/js/cabinet/reports/reportFormatters.js v1.0.0 */
// Formatters for financial report data

/**
 * Format currency
 */
export function formatCurrency(amount, currency = '₽') {
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
  
  return `${formatted} ${currency}`;
}

/**
 * Format percentage
 */
export function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format months
 */
export function formatMonths(value) {
  const months = Math.floor(value);
  return `${months} мес.`;
}

/**
 * Format income section
 */
export function formatIncomeSection(incomeData) {
  if (!incomeData || incomeData.length === 0) {
    return `
      <div class="report-section income-section">
        <h3>Доходы</h3>
        <div class="report-table">
          <div class="report-row header-row">
            <div class="report-cell">Категория</div>
            <div class="report-cell">Подкатегория</div>
            <div class="report-cell amount-cell">Сумма (₽)</div>
          </div>
          <div class="empty-state">Нет данных</div>
        </div>
      </div>
    `;
  }
  
  // Group by category
  const grouped = groupByCategory(incomeData);
  
  let rows = '';
  let total = 0;
  
  Object.entries(grouped).forEach(([categoryCode, items]) => {
    const category = items[0];
    const categoryTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    total += categoryTotal;
    
    rows += `
      <div class="report-row category-row">
        <div class="report-cell category-cell">${category.group || categoryCode}</div>
        <div class="report-cell">${category.label}</div>
        <div class="report-cell amount-cell">${formatCurrency(categoryTotal)}</div>
      </div>
    `;
  });
  
  return `
    <div class="report-section income-section">
      <h3>Доходы</h3>
      <div class="report-table">
        <div class="report-row header-row">
          <div class="report-cell">Категория</div>
          <div class="report-cell">Подкатегория</div>
          <div class="report-cell amount-cell">Сумма (₽)</div>
        </div>
        ${rows}
        <div class="report-row total-row">
          <div class="report-cell">ИТОГО</div>
          <div class="report-cell"></div>
          <div class="report-cell amount-cell total-amount">${formatCurrency(total)}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format expenses section
 */
export function formatExpensesSection(expensesData) {
  if (!expensesData || expensesData.length === 0) {
    return `
      <div class="report-section expenses-section">
        <h3>Расходы</h3>
        <div class="report-table">
          <div class="report-row header-row">
            <div class="report-cell">Категория</div>
            <div class="report-cell">Подкатегория</div>
            <div class="report-cell amount-cell">Сумма (₽)</div>
          </div>
          <div class="empty-state">Нет данных</div>
        </div>
      </div>
    `;
  }
  
  const grouped = groupByCategory(expensesData);
  
  let rows = '';
  let total = 0;
  
  Object.entries(grouped).forEach(([categoryCode, items]) => {
    const category = items[0];
    const categoryTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    total += categoryTotal;
    
    rows += `
      <div class="report-row category-row">
        <div class="report-cell category-cell">${category.group || categoryCode}</div>
        <div class="report-cell">${category.label}</div>
        <div class="report-cell amount-cell">${formatCurrency(categoryTotal)}</div>
      </div>
    `;
  });
  
  return `
    <div class="report-section expenses-section">
      <h3>Расходы</h3>
      <div class="report-table">
        <div class="report-row header-row">
          <div class="report-cell">Категория</div>
          <div class="report-cell">Подкатегория</div>
          <div class="report-cell amount-cell">Сумма (₽)</div>
        </div>
        ${rows}
        <div class="report-row total-row">
          <div class="report-cell">ИТОГО</div>
          <div class="report-cell"></div>
          <div class="report-cell amount-cell total-amount">${formatCurrency(total)}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format assets section
 */
export function formatAssetsSection(assetsData) {
  if (!assetsData || assetsData.length === 0) {
    return `
      <div class="report-section assets-section">
        <h3>Активы</h3>
        <div class="report-table">
          <div class="report-row header-row">
            <div class="report-cell">Категория</div>
            <div class="report-cell">Подкатегория</div>
            <div class="report-cell amount-cell">Сумма (₽)</div>
          </div>
          <div class="empty-state">Нет данных</div>
        </div>
      </div>
    `;
  }
  
  const grouped = groupByCategory(assetsData);
  
  let rows = '';
  let total = 0;
  
  Object.entries(grouped).forEach(([categoryCode, items]) => {
    const category = items[0];
    const categoryTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    total += categoryTotal;
    
    rows += `
      <div class="report-row category-row">
        <div class="report-cell category-cell">${category.group || categoryCode}</div>
        <div class="report-cell">${category.label}</div>
        <div class="report-cell amount-cell">${formatCurrency(categoryTotal)}</div>
      </div>
    `;
  });
  
  return `
    <div class="report-section assets-section">
      <h3>Активы</h3>
      <div class="report-table">
        <div class="report-row header-row">
          <div class="report-cell">Категория</div>
          <div class="report-cell">Подкатегория</div>
          <div class="report-cell amount-cell">Сумма (₽)</div>
        </div>
        ${rows}
        <div class="report-row total-row">
          <div class="report-cell">ИТОГО</div>
          <div class="report-cell"></div>
          <div class="report-cell amount-cell total-amount">${formatCurrency(total)}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format liabilities section
 */
export function formatLiabilitiesSection(liabilitiesData) {
  if (!liabilitiesData || liabilitiesData.length === 0) {
    return `
      <div class="report-section liabilities-section">
        <h3>Пассивы</h3>
        <div class="report-table">
          <div class="report-row header-row">
            <div class="report-cell">Категория</div>
            <div class="report-cell">Подкатегория</div>
            <div class="report-cell amount-cell">Сумма (₽)</div>
          </div>
          <div class="empty-state">Нет данных</div>
        </div>
      </div>
    `;
  }
  
  const grouped = groupByCategory(liabilitiesData);
  
  let rows = '';
  let total = 0;
  
  Object.entries(grouped).forEach(([categoryCode, items]) => {
    const category = items[0];
    const categoryTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    total += categoryTotal;
    
    rows += `
      <div class="report-row category-row">
        <div class="report-cell category-cell">${category.group || categoryCode}</div>
        <div class="report-cell">${category.label}</div>
        <div class="report-cell amount-cell">${formatCurrency(categoryTotal)}</div>
      </div>
    `;
  });
  
  return `
    <div class="report-section liabilities-section">
      <h3>Пассивы</h3>
      <div class="report-table">
        <div class="report-row header-row">
          <div class="report-cell">Категория</div>
          <div class="report-cell">Подкатегория</div>
          <div class="report-cell amount-cell">Сумма (₽)</div>
        </div>
        ${rows}
        <div class="report-row total-row">
          <div class="report-cell">ИТОГО</div>
          <div class="report-cell"></div>
          <div class="report-cell amount-cell total-amount">${formatCurrency(total)}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format analysis section
 */
export function formatAnalysisSection(analysis) {
  return `
    <div class="report-section analysis-section">
      <h3>Анализ</h3>
      <div class="report-table analysis-table">
        <div class="report-row header-row">
          <div class="report-cell metric-cell">📊 Метрика</div>
          <div class="report-cell formula-cell">💡 Формула</div>
          <div class="report-cell value-cell">🔢 Показатель</div>
        </div>
        
        <div class="report-row">
          <div class="report-cell">Сколько вы сохраняете?</div>
          <div class="report-cell formula">Денежный поток / Общий доход<br><span class="formula-note">***должен расти</span></div>
          <div class="report-cell value-cell ${analysis.cashFlowGrowth ? 'positive' : 'negative'}">
            ${formatCurrency(analysis.cashFlow)}
            ${analysis.cashFlowGrowth ? '↑' : '↓'}
          </div>
        </div>
        
        <div class="report-row">
          <div class="report-cell">Работают ли ваши деньги на вас?</div>
          <div class="report-cell formula">Активы итого + портфолио итого / Общий доход<br><span class="formula-note">***должен расти</span></div>
          <div class="report-cell value-cell ${analysis.moneyWorkingGrowth ? 'positive' : 'negative'}">
            ${analysis.moneyWorking.toFixed(2)}x
            ${analysis.moneyWorkingGrowth ? '↑' : '↓'}
          </div>
        </div>
        
        <div class="report-row">
          <div class="report-cell">Сколько вы платите налогов?</div>
          <div class="report-cell formula">Налоги / Общий доход</div>
          <div class="report-cell value-cell">
            ${formatPercent(analysis.taxRate)}
          </div>
        </div>
        
        <div class="report-row">
          <div class="report-cell">Сколько уходит на жильё?</div>
          <div class="report-cell formula">Расходы на жильё / Доход<br><span class="formula-note">***не более 33%</span></div>
          <div class="report-cell value-cell ${analysis.housingOk ? 'positive' : 'warning'}">
            ${formatPercent(analysis.housingRate)}
            ${analysis.housingOk ? '✓' : '⚠'}
          </div>
        </div>
        
        <div class="report-row">
          <div class="report-cell">Сколько вы тратите на роскошь?</div>
          <div class="report-cell formula">Роскошь итого / Активы по банкиру<br><span class="formula-note">***не более 33%</span></div>
          <div class="report-cell value-cell ${analysis.luxuryOk ? 'positive' : 'warning'}">
            ${formatPercent(analysis.luxuryRate)}
            ${analysis.luxuryOk ? '✓' : '⚠'}
          </div>
        </div>
        
        <div class="report-row">
          <div class="report-cell">Какова ваша доходность от активов?</div>
          <div class="report-cell formula">Активы итого + портфолио итого / Активы итого факт</div>
          <div class="report-cell value-cell">
            ${analysis.assetYield.toFixed(2)}x
          </div>
        </div>
        
        <div class="report-row">
          <div class="report-cell">Насколько вы обеспечены?</div>
          <div class="report-cell formula">Активы итого факт / Расходы<br><span class="formula-note">***измеряется в месяцах</span></div>
          <div class="report-cell value-cell">
            ${formatMonths(analysis.security)}
          </div>
        </div>
        
        <div class="report-row">
          <div class="report-cell">Насколько ваши расходы покрыты пассивным доходом?</div>
          <div class="report-cell formula">Активы итого + портфолио итого / Расходы итого<br><span class="formula-note">***должен расти к 200%</span></div>
          <div class="report-cell value-cell ${analysis.expensesCoveredTarget ? 'positive' : 'negative'}">
            ${formatPercent(analysis.expensesCovered)}
            ${analysis.expensesCoveredTarget ? '✓' : '↓'}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Group data by category
 */
function groupByCategory(data) {
  const grouped = {};
  
  data.forEach(item => {
    const code = item.code || 'unknown';
    if (!grouped[code]) {
      grouped[code] = [];
    }
    grouped[code].push(item);
  });
  
  return grouped;
}