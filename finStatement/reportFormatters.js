/* /webapp/finStatement/reportFormatters.js v1.5.0 */
// CHANGELOG v1.5.0:
// - CHANGED: Report rows keep label/value side-by-side on mobile
// - ADDED: Label wrappers for marquee overflow behavior
// - KEPT: Existing financial report math and section structure

export function formatCurrency(amount, currency = '₽') {
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);

  return `${formatted} ${currency}`;
}

export function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatMonths(value) {
  const months = Math.floor(value);
  return `${months} мес.`;
}

function renderLabelCell(content, extraClass = '') {
  const className = ['report-cell', extraClass].filter(Boolean).join(' ');
  return `
    <div class="${className}">
      <span class="report-label-track">
        <span class="report-label-text">${content}</span>
      </span>
    </div>
  `;
}

function trendArrow(isPositive) {
  return isPositive ? '&uarr;' : '&darr;';
}

function statusMark(ok, fallbackDown = false) {
  if (ok === true) return '&#10003;';
  return fallbackDown ? '&darr;' : '&#9888;';
}

export function formatIncomeSection(incomeData) {
  const t = window.i18n.t.bind(window.i18n);
  const getIncomeTotalLabel = (groupKey, fallbackLabel) => {
    const totalKey = `income.${letterMapping[groupKey].total}`;
    const translated = t(totalKey);
    return translated === totalKey ? `${fallbackLabel} ${t('report.total')}` : translated;
  };

  const groups = [
    { key: 'A', label: t('income.A'), items: [] },
    { key: 'C', label: t('income.C'), items: [] },
    { key: 'E', label: t('income.E'), items: [] }
  ];

  let grandTotal = 0;

  incomeData.forEach((item) => {
    const groupKey = item.code.charAt(0);
    const group = groups.find((entry) => entry.key === groupKey);
    if (group) {
      group.items.push(item);
      grandTotal += Number(item.amount) || 0;
    }
  });

  const letterMapping = {
    A: { header: 'A', total: 'B' },
    C: { header: 'C', total: 'D' },
    E: { header: 'E', total: 'F' }
  };

  let html = `
    <div class="report-section income-section">
      <h3>${t('report.income')}</h3>
      <div class="report-table">
  `;

  groups.forEach((group) => {
    const letters = letterMapping[group.key];
    const groupTotal = group.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    html += `
      <div class="report-row group-header-row">
        ${renderLabelCell(`${letters.header}. ${group.label}`)}
        <div class="report-cell amount-cell"></div>
      </div>
    `;

    group.items.forEach((item) => {
      html += `
        <div class="report-row subcategory-row editable-row"
             onclick="window.reportManager.showEditModal('income', '${item.code}')"
             title="${t('common.clickToEdit')}">
          ${renderLabelCell(item.label, 'subcategory-cell')}
          <div class="report-cell amount-cell">${formatCurrency(item.amount || 0)}</div>
        </div>
      `;
    });

    html += `
      <div class="report-row group-total-row">
        ${renderLabelCell(`${letters.total}. ${getIncomeTotalLabel(group.key, group.label)}`)}
        <div class="report-cell amount-cell group-total-amount">${formatCurrency(groupTotal)}</div>
      </div>
    `;
  });

  html += `
      <div class="report-row grand-total-row income-total">
        ${renderLabelCell(t('report.total.income'))}
        <div class="report-cell amount-cell grand-total-amount">${formatCurrency(grandTotal)}</div>
      </div>
    </div>
  </div>
  `;

  return html;
}

export function formatExpensesSection(expensesData, totalIncome = 0) {
  const t = window.i18n.t.bind(window.i18n);

  const groups = {
    0: { label: t('expenses.0'), items: [], letter: 'H' },
    1: { label: t('expenses.1'), items: [], letter: 'J' }
  };

  let grandTotal = 0;

  expensesData.forEach((item) => {
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
      <h3>${t('report.expenses')}</h3>
      <div class="report-table">
  `;

  Object.values(groups).forEach((group) => {
    const groupTotal = group.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const nextLetter = String.fromCharCode(group.letter.charCodeAt(0) + 1);

    html += `
      <div class="report-row group-header-row">
        ${renderLabelCell(`${group.letter}. ${group.label}`)}
        <div class="report-cell amount-cell"></div>
      </div>
    `;

    group.items.forEach((item) => {
      html += `
        <div class="report-row subcategory-row editable-row"
             onclick="window.reportManager.showEditModal('expenses', '${item.code}')"
             title="${t('common.clickToEdit')}">
          ${renderLabelCell(item.label, 'subcategory-cell')}
          <div class="report-cell amount-cell">${formatCurrency(item.amount || 0)}</div>
        </div>
      `;
    });

    html += `
      <div class="report-row group-total-row">
        ${renderLabelCell(`${nextLetter}. ${group.label} ${t('report.total')}`)}
        <div class="report-cell amount-cell group-total-amount">${formatCurrency(groupTotal)}</div>
      </div>
    `;
  });

  html += `
      <div class="report-row grand-total-row expenses-total">
        ${renderLabelCell(t('report.total.expenses'))}
        <div class="report-cell amount-cell grand-total-amount">${formatCurrency(grandTotal)}</div>
      </div>
      <div class="report-row grand-total-row cash-flow-row ${isPositive ? 'positive-flow' : 'negative-flow'}">
        ${renderLabelCell(t('report.cashFlow'))}
        <div class="report-cell amount-cell grand-total-amount">${formatCurrency(cashFlow)}</div>
      </div>
    </div>
  </div>
  `;

  return html;
}

export function formatAssetsSection(assetsData) {
  const t = window.i18n.t.bind(window.i18n);

  const groups = {
    N: { label: t('assets.N'), items: [] },
    P: { label: t('assets.P'), items: [] }
  };

  let activesTotal = 0;
  let luxuryTotal = 0;

  assetsData.forEach((item) => {
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

  const assetsByBanker = activesTotal + luxuryTotal;
  const assetsFactual = activesTotal;

  let html = `
    <div class="report-section assets-section">
      <h3>${t('report.assets')}</h3>
      <div class="report-table">
        <div class="report-row group-header-row">
          ${renderLabelCell(`N. ${groups.N.label}`)}
          <div class="report-cell amount-cell"></div>
        </div>
  `;

  groups.N.items.forEach((item) => {
    html += `
      <div class="report-row subcategory-row editable-row"
           onclick="window.reportManager.showEditModal('assets', '${item.code}')"
           title="${t('common.clickToEdit')}">
        ${renderLabelCell(item.label, 'subcategory-cell')}
        <div class="report-cell amount-cell">${formatCurrency(item.amount || 0)}</div>
      </div>
    `;
  });

  html += `
      <div class="report-row group-total-row">
        ${renderLabelCell(`O. ${groups.N.label} ${t('report.subtotal')}`)}
        <div class="report-cell amount-cell group-total-amount">${formatCurrency(activesTotal)}</div>
      </div>
      <div class="report-row group-header-row">
        ${renderLabelCell(`P. ${groups.P.label}`)}
        <div class="report-cell amount-cell"></div>
      </div>
  `;

  groups.P.items.forEach((item) => {
    html += `
      <div class="report-row subcategory-row editable-row"
           onclick="window.reportManager.showEditModal('assets', '${item.code}')"
           title="${t('common.clickToEdit')}">
        ${renderLabelCell(item.label, 'subcategory-cell')}
        <div class="report-cell amount-cell">${formatCurrency(item.amount || 0)}</div>
      </div>
    `;
  });

  html += `
      <div class="report-row group-total-row">
        ${renderLabelCell(`Q. ${groups.P.label} ${t('report.total')}`)}
        <div class="report-cell amount-cell group-total-amount">${formatCurrency(luxuryTotal)}</div>
      </div>
      <div class="report-row grand-total-row assets-total">
        ${renderLabelCell(t('report.total.assets.banker'))}
        <div class="report-cell amount-cell grand-total-amount">${formatCurrency(assetsByBanker)}</div>
      </div>
      <div class="report-row grand-total-row assets-factual">
        ${renderLabelCell(t('report.total.assets.factual'))}
        <div class="report-cell amount-cell grand-total-amount">${formatCurrency(assetsFactual)}</div>
      </div>
    </div>
  </div>
  `;

  return html;
}

export function formatLiabilitiesSection(liabilitiesData, assetsByBanker = 0, assetsFactual = 0) {
  const t = window.i18n.t.bind(window.i18n);

  let total = 0;
  liabilitiesData.forEach((item) => {
    total += Number(item.amount) || 0;
  });

  const netWorthByBanker = assetsByBanker - total;
  const netWorthFactual = assetsFactual - total;
  const vPositive = netWorthByBanker >= 0;
  const wPositive = netWorthFactual >= 0;

  let html = `
    <div class="report-section liabilities-section">
      <h3>${t('report.liabilities')}</h3>
      <div class="report-table">
        <div class="report-row group-header-row">
          ${renderLabelCell(`T. ${t('liabilities.T')}`)}
          <div class="report-cell amount-cell"></div>
        </div>
  `;

  liabilitiesData.forEach((item) => {
    html += `
      <div class="report-row subcategory-row editable-row"
           onclick="window.reportManager.showEditModal('liabilities', '${item.code}')"
           title="${t('common.clickToEdit')}">
        ${renderLabelCell(item.label, 'subcategory-cell')}
        <div class="report-cell amount-cell">${formatCurrency(item.amount || 0)}</div>
      </div>
    `;
  });

  html += `
      <div class="report-row grand-total-row liabilities-total">
        ${renderLabelCell(t('report.total.liabilities'))}
        <div class="report-cell amount-cell grand-total-amount">${formatCurrency(total)}</div>
      </div>
      <div class="report-row grand-total-row net-worth-row ${vPositive ? 'positive-net-worth' : 'negative-net-worth'}">
        ${renderLabelCell(t('report.netWorth.banker'))}
        <div class="report-cell amount-cell grand-total-amount">${formatCurrency(netWorthByBanker)}</div>
      </div>
      <div class="report-row grand-total-row net-worth-row ${wPositive ? 'positive-net-worth' : 'negative-net-worth'}">
        ${renderLabelCell(t('report.netWorth.factual'))}
        <div class="report-cell amount-cell grand-total-amount">${formatCurrency(netWorthFactual)}</div>
      </div>
    </div>
  </div>
  `;

  return html;
}

export function formatAnalysisSection(analysis) {
  const t = window.i18n.t.bind(window.i18n);

  return `
    <div class="report-section analysis-section">
      <h3>${t('report.analysis')}</h3>
      <div class="report-table analysis-table">
        <div class="report-row header-row">
          <div class="report-cell metric-cell">&#128202; ${t('analysis.metric')}</div>
          <div class="report-cell formula-cell">&#128161; ${t('analysis.formula')}</div>
          <div class="report-cell value-cell">&#128290; ${t('analysis.value')}</div>
        </div>

        <div class="report-row">
          <div class="report-cell">${t('analysis.saving')}</div>
          <div class="report-cell formula">${t('analysis.formula.saving')}<br><span class="formula-note">${t('analysis.note.shouldGrow')}</span></div>
          <div class="report-cell value-cell ${analysis.cashFlowGrowth ? 'positive' : 'negative'}">
            ${formatPercent(analysis.savingRate)} ${trendArrow(analysis.cashFlowGrowth)}
          </div>
        </div>

        <div class="report-row">
          <div class="report-cell">${t('analysis.moneyWorking')}</div>
          <div class="report-cell formula">${t('analysis.formula.moneyWorking')}<br><span class="formula-note">${t('analysis.note.shouldGrow')}</span></div>
          <div class="report-cell value-cell ${analysis.moneyWorkingGrowth ? 'positive' : 'negative'}">
            ${formatPercent(analysis.moneyWorking)} ${trendArrow(analysis.moneyWorkingGrowth)}
          </div>
        </div>

        <div class="report-row">
          <div class="report-cell">${t('analysis.taxes')}</div>
          <div class="report-cell formula">${t('analysis.formula.taxes')}</div>
          <div class="report-cell value-cell">${formatPercent(analysis.taxRate)}</div>
        </div>

        <div class="report-row">
          <div class="report-cell">${t('analysis.housing')}</div>
          <div class="report-cell formula">${t('analysis.formula.housing')}<br><span class="formula-note">${t('analysis.note.max33')}</span></div>
          <div class="report-cell value-cell ${analysis.housingOk ? 'positive' : 'warning'}">
            ${formatPercent(analysis.housingRate)} ${statusMark(analysis.housingOk)}
          </div>
        </div>

        <div class="report-row">
          <div class="report-cell">${t('analysis.luxury')}</div>
          <div class="report-cell formula">${t('analysis.formula.luxury')}<br><span class="formula-note">${t('analysis.note.max33')}</span></div>
          <div class="report-cell value-cell ${analysis.luxuryOk ? 'positive' : 'warning'}">
            ${formatPercent(analysis.luxuryRate)} ${statusMark(analysis.luxuryOk)}
          </div>
        </div>

        <div class="report-row">
          <div class="report-cell">${t('analysis.assetYield')}</div>
          <div class="report-cell formula">${t('analysis.formula.assetYield')}</div>
          <div class="report-cell value-cell">${formatPercent(analysis.assetYield)}</div>
        </div>

        <div class="report-row">
          <div class="report-cell">${t('analysis.security')}</div>
          <div class="report-cell formula">${t('analysis.formula.security')}<br><span class="formula-note">${t('analysis.note.months')}</span></div>
          <div class="report-cell value-cell">${formatMonths(analysis.security)}</div>
        </div>

        <div class="report-row">
          <div class="report-cell">${t('analysis.expensesCoveredByPassiveIncome')}</div>
          <div class="report-cell formula">${t('analysis.formula.expensesCoveredByPassiveIncome')}<br><span class="formula-note">${t('analysis.note.target200')}</span></div>
          <div class="report-cell value-cell ${analysis.expensesCoveredTarget ? 'positive' : 'negative'}">
            ${formatPercent(analysis.expensesCoveredByPassiveIncomeRatio)} ${statusMark(analysis.expensesCoveredTarget, true)}
          </div>
        </div>
      </div>
    </div>
  `;
}
