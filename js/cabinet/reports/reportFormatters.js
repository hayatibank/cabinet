/* /webapp/js/cabinet/reports/reportFormatters.js v1.1.0 */
// CHANGELOG v1.1.0:
// - Added category/subcategory hierarchy
// - Added visual indentation
// - Added color coding (green totals, red expenses)
// - Show all categories even if amount = 0

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
 * Format income section with hierarchy
 */
export function formatIncomeSection(incomeData) {
  // Group by parent category
  const groups = [
    { key: 'A', label: 'Найм', items: [] },
    { key: 'C', label: 'Активы', items: [] },
    { key: 'E', label: 'Портфолио', items: [] }
  ];
  
  let grandTotal = 0;
  
  incomeData.forEach(item => {
    const groupKey = item.code.charAt(0);
    const group = groups.find(g => g.key === groupKey);
    if (group) {
      group.items.push(item);
      grandTotal += Number(item.amount) || 0;
    }
  });
  
  let html = `
    <div class="report-section income-section">
      <h3>💰 Доходы</h3>
      <div class="report-table">
  `;
  
  // Render each group with correct letters
  const letterMapping = {
    'A': { header: 'A', total: 'B' },
    'C': { header: 'C', total: 'D' },
    'E': { header: 'E', total: 'F' }
  };
  
  groups.forEach(group => {
    const letters = letterMapping[group.key];
    const groupTotal = group.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    
    // Group header
    html += `
      <div class="report-row group-header-row">
        <div class="report-cell">${letters.header}. ${group.label}</div>
        <div class="report-cell amount-cell"></div>
      </div>
    `;
    
    // Subcategories
    group.items.forEach(item => {
      html += `
        <div class="report-row subcategory-row editable-row" 
             onclick="window.reportManager.showEditModal('income', '${item.code}')"
             title="Нажмите для редактирования">
          <div class="report-cell subcategory-cell">${item.label}</div>
          <div class="report-cell amount-cell">${formatCurrency(item.amount || 0)}</div>
        </div>
      `;
    });
    
    // Group total
    html += `
      <div class="report-row group-total-row">
        <div class="report-cell">${letters.total}. ${group.label} итого</div>
        <div class="report-cell amount-cell group-total-amount">${formatCurrency(groupTotal)}</div>
      </div>
    `;
  });
  
  // Grand total
  html += `
    <div class="report-row grand-total-row income-total">
      <div class="report-cell">G. ДОХОДЫ ИТОГО</div>
      <div class="report-cell amount-cell grand-total-amount">${formatCurrency(grandTotal)}</div>
    </div>
  `;
  
  html += `
      </div>
    </div>
  `;
  
  return html;
}

/**
 * Format expenses section with hierarchy + cash flow
 */
export function formatExpensesSection(expensesData, totalIncome = 0) {
  // Group by parent category
  const groups = {
    '0': { label: 'Предварительные', items: [], letter: 'H' },
    '1': { label: 'Основные', items: [], letter: 'J' }
  };
  
  let grandTotal = 0;
  
  expensesData.forEach(item => {
    const groupKey = item.code.charAt(0);
    if (groups[groupKey]) {
      groups[groupKey].items.push(item);
      grandTotal += Number(item.amount) || 0;
    }
  });
  
  const cashFlow = totalIncome - grandTotal;
  const isPositive = cashFlow >= 0;
  
  let html = `
    <div class="report-section expenses-section">
      <h3>💸 Расходы</h3>
      <div class="report-table">
  `;
  
  // Render each group
  Object.entries(groups).forEach(([key, group]) => {
    const groupTotal = group.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    
    // Group header
    html += `
      <div class="report-row group-header-row">
        <div class="report-cell">${group.letter}. ${group.label}</div>
        <div class="report-cell amount-cell"></div>
      </div>
    `;
    
    // Subcategories
    group.items.forEach(item => {
      html += `
        <div class="report-row subcategory-row editable-row"
             onclick="window.reportManager.showEditModal('expenses', '${item.code}')"
             title="Нажмите для редактирования">
          <div class="report-cell subcategory-cell">${item.label}</div>
          <div class="report-cell amount-cell">${formatCurrency(item.amount || 0)}</div>
        </div>
      `;
    });
    
    // Group total
    const nextLetter = String.fromCharCode(group.letter.charCodeAt(0) + 1);
    html += `
      <div class="report-row group-total-row">
        <div class="report-cell">${nextLetter}. ${group.label} итого</div>
        <div class="report-cell amount-cell group-total-amount">${formatCurrency(groupTotal)}</div>
      </div>
    `;
  });
  
  // L. Grand total (expenses)
  html += `
    <div class="report-row grand-total-row expenses-total">
      <div class="report-cell">L. РАСХОДЫ ИТОГО</div>
      <div class="report-cell amount-cell grand-total-amount">${formatCurrency(grandTotal)}</div>
    </div>
  `;
  
  // M. Cash Flow (inside same section)
  html += `
    <div class="report-row grand-total-row cash-flow-row ${isPositive ? 'positive-flow' : 'negative-flow'}">
      <div class="report-cell">M. ЧИСТЫЙ ДЕНЕЖНЫЙ ПОТОК</div>
      <div class="report-cell amount-cell grand-total-amount">${formatCurrency(cashFlow)}</div>
    </div>
  `;
  
  html += `
      </div>
    </div>
  `;
  
  return html;
}

/**
 * Format assets section with hierarchy
 */
export function formatAssetsSection(assetsData) {
  // Group by parent category
  const groups = {
    'N': { label: 'Активы', items: [] },
    'P': { label: 'Роскошь', items: [] }
  };
  
  let activesTotal = 0;
  let luxuryTotal = 0;
  
  assetsData.forEach(item => {
    const groupKey = item.code.charAt(0);
    if (groups[groupKey]) {
      groups[groupKey].items.push(item);
      if (groupKey === 'N') {
        activesTotal += Number(item.amount) || 0;
      } else if (groupKey === 'P') {
        luxuryTotal += Number(item.amount) || 0;
      }
    }
  });
  
  const assetsByBanker = activesTotal + luxuryTotal; // R
  const assetsFactual = activesTotal; // S
  
  let html = `
    <div class="report-section assets-section">
      <h3>📊 Активы</h3>
      <div class="report-table">
  `;
  
  // N. Активы group
  html += `
    <div class="report-row group-header-row">
      <div class="report-cell">N. Активы</div>
      <div class="report-cell amount-cell"></div>
    </div>
  `;
  
  groups['N'].items.forEach(item => {
    html += `
      <div class="report-row subcategory-row editable-row"
           onclick="window.reportManager.showEditModal('assets', '${item.code}')"
           title="Нажмите для редактирования">
        <div class="report-cell subcategory-cell">${item.label}</div>
        <div class="report-cell amount-cell">${formatCurrency(item.amount || 0)}</div>
      </div>
    `;
  });
  
  html += `
    <div class="report-row group-total-row">
      <div class="report-cell">O. Активы подытог</div>
      <div class="report-cell amount-cell group-total-amount">${formatCurrency(activesTotal)}</div>
    </div>
  `;
  
  // P. Роскошь group
  html += `
    <div class="report-row group-header-row">
      <div class="report-cell">P. Роскошь</div>
      <div class="report-cell amount-cell"></div>
    </div>
  `;
  
  groups['P'].items.forEach(item => {
    html += `
      <div class="report-row subcategory-row editable-row"
           onclick="window.reportManager.showEditModal('assets', '${item.code}')"
           title="Нажмите для редактирования">
        <div class="report-cell subcategory-cell">${item.label}</div>
        <div class="report-cell amount-cell">${formatCurrency(item.amount || 0)}</div>
      </div>
    `;
  });
  
  html += `
    <div class="report-row group-total-row">
      <div class="report-cell">Q. Роскошь итого</div>
      <div class="report-cell amount-cell group-total-amount">${formatCurrency(luxuryTotal)}</div>
    </div>
  `;
  
  // R. АКТИВЫ ИТОГО по банкиру
  html += `
    <div class="report-row grand-total-row assets-total">
      <div class="report-cell">R. АКТИВЫ ИТОГО по банкиру</div>
      <div class="report-cell amount-cell grand-total-amount">${formatCurrency(assetsByBanker)}</div>
    </div>
  `;
  
  // S. АКТИВЫ ИТОГО факт
  html += `
    <div class="report-row grand-total-row assets-factual">
      <div class="report-cell">S. АКТИВЫ ИТОГО факт</div>
      <div class="report-cell amount-cell grand-total-amount">${formatCurrency(assetsFactual)}</div>
    </div>
  `;
  
  html += `
      </div>
    </div>
  `;
  
  return html;
}

/**
 * Format liabilities section with hierarchy + net worth
 */
export function formatLiabilitiesSection(liabilitiesData, assetsByBanker = 0, assetsFactual = 0) {
  let total = 0;
  
  liabilitiesData.forEach(item => {
    total += Number(item.amount) || 0;
  });
  
  // Calculate net worth
  const netWorthByBanker = assetsByBanker - total; // V = R - U
  const netWorthFactual = assetsFactual - total;   // W = S - U
  
  let html = `
    <div class="report-section liabilities-section">
      <h3>📉 Пассивы</h3>
      <div class="report-table">
        <div class="report-row group-header-row">
          <div class="report-cell">T. Пассивы</div>
          <div class="report-cell amount-cell"></div>
        </div>
  `;
  
  liabilitiesData.forEach(item => {
    html += `
      <div class="report-row subcategory-row editable-row"
           onclick="window.reportManager.showEditModal('liabilities', '${item.code}')"
           title="Нажмите для редактирования">
        <div class="report-cell subcategory-cell">${item.label}</div>
        <div class="report-cell amount-cell">${formatCurrency(item.amount || 0)}</div>
      </div>
    `;
  });
  
  // U. ПАССИВЫ ИТОГО
  html += `
    <div class="report-row grand-total-row liabilities-total">
      <div class="report-cell">U. ПАССИВЫ ИТОГО</div>
      <div class="report-cell amount-cell grand-total-amount">${formatCurrency(total)}</div>
    </div>
  `;
  
  // V. СОСТОЯНИЕ по банкиру (R - U)
  const vPositive = netWorthByBanker >= 0;
  html += `
    <div class="report-row grand-total-row net-worth-row ${vPositive ? 'positive-net-worth' : 'negative-net-worth'}">
      <div class="report-cell">V. СОСТОЯНИЕ по банкиру (R - U)</div>
      <div class="report-cell amount-cell grand-total-amount">${formatCurrency(netWorthByBanker)}</div>
    </div>
  `;
  
  // W. СОСТОЯНИЕ факт (S - U)
  const wPositive = netWorthFactual >= 0;
  html += `
    <div class="report-row grand-total-row net-worth-row ${wPositive ? 'positive-net-worth' : 'negative-net-worth'}">
      <div class="report-cell">W. СОСТОЯНИЕ факт (S - U)</div>
      <div class="report-cell amount-cell grand-total-amount">${formatCurrency(netWorthFactual)}</div>
    </div>
  `;
  
  html += `
      </div>
    </div>
  `;
  
  return html;
}

/**
 * Format analysis section
 */
export function formatAnalysisSection(analysis) {
  return `
    <div class="report-section analysis-section">
      <h3>📈 Анализ</h3>
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