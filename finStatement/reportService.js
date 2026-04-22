/* /webapp/finStatement/reportService.js v1.4.0 */
// CHANGELOG v1.4.0:
// - FIXED: All analysis formulas updated to match exact requirements
// - M/G, (D+F)/G, H6/G, J3/G, Q/R, (D+F)/S, S/L, (D+F)/L

import { getSession } from '../js/session.js';
import { API_URL } from '../js/config.js';

const CATEGORIES_STRUCTURE = {
  income: [
    { idx: 1, code: "A.1", group: "A", labelKey: "income.A.1" },
    { idx: 2, code: "A.2", group: "A", labelKey: "income.A.2" },
    { idx: 3, code: "A.3", group: "A", labelKey: "income.A.3" },
    { idx: 4, code: "C.1", group: "C", labelKey: "income.C.1" },
    { idx: 5, code: "C.2", group: "C", labelKey: "income.C.2" },
    { idx: 6, code: "C.3", group: "C", labelKey: "income.C.3" },
    { idx: 7, code: "E.1", group: "E", labelKey: "income.E.1" },
    { idx: 8, code: "E.2", group: "E", labelKey: "income.E.2" },
    { idx: 9, code: "E.3", group: "E", labelKey: "income.E.3" },
    
  ],
  
  expenses: [
    { idx: 1, code: "0.1", group: "0", labelKey: "expenses.0.1" },
    { idx: 2, code: "0.2", group: "0", labelKey: "expenses.0.2" },
    { idx: 3, code: "0.3", group: "0", labelKey: "expenses.0.3" },
    { idx: 4, code: "0.4", group: "0", labelKey: "expenses.0.4" },
    { idx: 5, code: "0.5", group: "0", labelKey: "expenses.0.5" },
    { idx: 6, code: "0.6", group: "0", labelKey: "expenses.0.6" },
    { idx: 7, code: "1.1", group: "1", labelKey: "expenses.1.1" },
    { idx: 8, code: "1.2", group: "1", labelKey: "expenses.1.2" },
    { idx: 9, code: "1.3", group: "1", labelKey: "expenses.1.3" },
    { idx: 10, code: "1.4", group: "1", labelKey: "expenses.1.4" },
    { idx: 11, code: "1.5", group: "1", labelKey: "expenses.1.5" },
    { idx: 12, code: "1.6", group: "1", labelKey: "expenses.1.6" },
    { idx: 13, code: "1.7", group: "1", labelKey: "expenses.1.7" },
    { idx: 14, code: "1.8", group: "1", labelKey: "expenses.1.8" },
    { idx: 15, code: "1.9", group: "1", labelKey: "expenses.1.9" },
    { idx: 16, code: "1.10", group: "1", labelKey: "expenses.1.10" },
    { idx: 18, code: "1.12", group: "1", labelKey: "expenses.1.12" },
    { idx: 19, code: "1.13", group: "1", labelKey: "expenses.1.13" },
    { idx: 20, code: "1.14", group: "1", labelKey: "expenses.1.14" },
    { idx: 21, code: "1.15", group: "1", labelKey: "expenses.1.15" }
  ],
  
  assets: [
    { idx: 1, code: "N.1", group: "N", labelKey: "assets.N.1" },
    { idx: 2, code: "N.2", group: "N", labelKey: "assets.N.2" },
    { idx: 3, code: "N.3", group: "N", labelKey: "assets.N.3" },
    { idx: 4, code: "N.4", group: "N", labelKey: "assets.N.4" },
    { idx: 5, code: "N.5", group: "N", labelKey: "assets.N.5" },
    { idx: 6, code: "N.6", group: "N", labelKey: "assets.N.6" },
    { idx: 7, code: "N.7", group: "N", labelKey: "assets.N.7" },
    { idx: 8, code: "P.1", group: "P", labelKey: "assets.P.1" },
    { idx: 9, code: "P.2", group: "P", labelKey: "assets.P.2" },
    { idx: 10, code: "P.3", group: "P", labelKey: "assets.P.3" }
  ],
  
  liabilities: [
    { idx: 1, code: "T.1", group: "T", labelKey: "liabilities.T.1" },
    { idx: 2, code: "T.2", group: "T", labelKey: "liabilities.T.2" },
    { idx: 3, code: "T.3", group: "T", labelKey: "liabilities.T.3" },
    { idx: 4, code: "T.4", group: "T", labelKey: "liabilities.T.4" },
    { idx: 5, code: "T.5", group: "T", labelKey: "liabilities.T.5" },
    { idx: 6, code: "T.6", group: "T", labelKey: "liabilities.T.6" }
  ]
};

function getLabel(labelKey) {
  const t = window.i18n.t.bind(window.i18n);
  return t(labelKey);
}

export async function getFinancialReport(accountId, year) {
  try {
    console.log(`📊 Fetching financial report: ${accountId}, year ${year}`);
    
    const session = getSession();
    if (!session) throw new Error('No active session');
    
    const basePath = `accounts/${accountId}/fin_statements/${year}`;
    
    const [incomeRaw, expensesRaw, assetsRaw, liabilitiesRaw] = await Promise.all([
      fetchCollection(basePath, 'system_income_categories', session.authToken),
      fetchCollection(basePath, 'system_exp_categories', session.authToken),
      fetchCollection(basePath, 'system_asset_categories', session.authToken),
      fetchCollection(basePath, 'system_liability_categories', session.authToken)
    ]);
    
    const income = mergeWithStructure(CATEGORIES_STRUCTURE.income, incomeRaw);
    const expenses = mergeWithStructure(CATEGORIES_STRUCTURE.expenses, expensesRaw);
    const assets = mergeWithStructure(CATEGORIES_STRUCTURE.assets, assetsRaw);
    const liabilities = mergeWithStructure(CATEGORIES_STRUCTURE.liabilities, liabilitiesRaw);
    
    console.log('✅ Financial report loaded');
    
    return {
      year,
      income,
      expenses,
      assets,
      liabilities
    };
    
  } catch (err) {
    console.error('❌ Error fetching financial report:', err);
    throw err;
  }
}

function mergeWithStructure(structure, firestoreData) {
  return structure.map(item => {
    const match = firestoreData.find(d => d.code === item.code);
    const transportInstallments = item.code === "1.5"
      ? firestoreData.find(d => d.code === "1.11")
      : null;
    const legacyPortfolioOther = item.code === "E.3"
      ? firestoreData.find(d => d.code === "E.4")
      : null;
    
    return {
      ...item,
      label: getLabel(item.labelKey),
      amount:
        (match ? (Number(match.amount) || 0) : 0) +
        (transportInstallments ? (Number(transportInstallments.amount) || 0) : 0) +
        (legacyPortfolioOther ? (Number(legacyPortfolioOther.amount) || 0) : 0),
      id: match?.id || null
    };
  });
}

async function fetchCollection(basePath, collection, authToken) {
  try {
    const response = await fetch(`${API_URL}/api/firestore/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        path: `${basePath}/${collection}`,
        authToken
      })
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Collection ${collection} not found, returning empty array`);
      return [];
    }
    
    const result = await response.json();
    return result.documents || [];
    
  } catch (err) {
    console.warn(`⚠️ Error fetching ${collection}:`, err.message);
    return [];
  }
}

export function calculateAnalysis(reportData) {
  const { income, expenses, assets, liabilities } = reportData;
  
  // Calculate income totals by group
  const employmentIncome = sumByGroup(income, 'group', 'A'); // A group (not used but kept for reference)
  const passiveIncomeTotal = sumByGroup(income, 'group', 'C'); // D = C group total
  const portfolioIncomeTotal = sumByGroup(income, 'group', 'E'); // F = E group total
  const totalIncome = sumField(income, 'amount'); // G
  
  // Calculate expense totals
  const totalExpenses = sumField(expenses, 'amount'); // L
  
  // Get specific expense values
  const taxes = findValue(expenses, 'code', '0.6') || 0; // H6 (but code is 0.6)
  const housingExpenses = findValue(expenses, 'code', '1.3') || 0; // J3 (but code is 1.3)
  
  // Calculate asset totals
  const activesTotal = sumByGroup(assets, 'group', 'N'); // O
  const luxuryTotal = sumByGroup(assets, 'group', 'P'); // Q
  const assetsByBanker = activesTotal + luxuryTotal; // R
  const assetsFactual = activesTotal; // S
  
  // Calculate liabilities
  const totalLiabilities = sumField(liabilities, 'amount'); // U
  
  // ✅ FORMULA 1: Сколько вы сохраняете? M / G
  const cashFlow = totalIncome - totalExpenses; // M
  const savingRate = totalIncome > 0 ? (cashFlow / totalIncome) : 0;
  const cashFlowGrowth = cashFlow > 0;
  
  // ✅ FORMULA 2: Работают ли ваши деньги на вас? (D+F)/G
  const moneyWorking = totalIncome > 0 
    ? ((passiveIncomeTotal + portfolioIncomeTotal) / totalIncome) 
    : 0;
  const moneyWorkingGrowth = moneyWorking > 0;
  
  // ✅ FORMULA 3: Сколько вы платите налогов? H6/G (code 0.6)
  const taxRate = totalIncome > 0 ? (taxes / totalIncome) : 0;
  
  // ✅ FORMULA 4: Сколько уходит на жилье? J3/G (code 1.3)
  const housingRate = totalIncome > 0 ? (housingExpenses / totalIncome) : 0;
  const housingOk = housingRate <= 0.33;
  
  // ✅ FORMULA 5: Сколько вы тратите на роскошь? Q/R
  const luxuryRate = assetsByBanker > 0 ? (luxuryTotal / assetsByBanker) : 0;
  const luxuryOk = luxuryRate <= 0.33;
  
  // ✅ FORMULA 6: Каков ваш возврат на активы? (D+F)/S
  const assetYield = assetsFactual > 0 
    ? ((passiveIncomeTotal + portfolioIncomeTotal) / assetsFactual) 
    : 0;
  
  // ✅ FORMULA 7: Насколько вы богаты? S/L
  const security = totalExpenses > 0 ? (assetsFactual / totalExpenses) : 0;
  
  // ✅ FORMULA 8: Насколько ваши расходы покрыты пассивным доходом? (D+F)/L
  const expensesCoveredByPassiveIncomeRatio = totalExpenses > 0 
    ? ((passiveIncomeTotal + portfolioIncomeTotal) / totalExpenses) 
    : 0;
  const expensesCoveredTarget = expensesCoveredByPassiveIncomeRatio >= 2;
  
  return {
    // Values
    totalIncome, // G
    totalExpenses, // L
    assetsByBanker, // R
    assetsFactual, // S
    totalLiabilities, // U
    passiveIncomeTotal, // D
    portfolioIncomeTotal, // F
    cashFlow, // M
    taxes, // H6 (0.6)
    housingExpenses, // J3 (1.3)
    luxuryTotal, // Q
    
    // Calculated metrics
    savingRate, // M/G
    moneyWorking, // (D+F)/G
    taxRate, // H6/G
    housingRate, // J3/G
    luxuryRate, // Q/R
    assetYield, // (D+F)/S
    security, // S/L
    expensesCoveredByPassiveIncomeRatio, // (D+F)/L
    
    // Status indicators
    cashFlowGrowth,
    moneyWorkingGrowth,
    housingOk,
    luxuryOk,
    expensesCoveredTarget
  };
}

function sumField(array, field) {
  return array.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
}

function findValue(array, keyField, keyValue) {
  const item = array.find(i => i[keyField] === keyValue);
  return item ? (Number(item.amount) || 0) : 0;
}

function sumByGroup(array, groupField, groupValue) {
  return array
    .filter(item => item[groupField] === groupValue)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}
