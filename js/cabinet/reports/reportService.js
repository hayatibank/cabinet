/* /webapp/js/cabinet/reports/reportService.js v1.1.0 */
// CHANGELOG v1.1.0:
// - Merge Firestore data with categories.js template
// - Fill missing categories with amount = 0

import { getSession } from '../../session.js';
import { API_URL } from '../../config.js';

// Categories template (from utils/categories.js)
const CATEGORIES_TEMPLATE = {
  income: [
    { idx: 1, code: "A.1", group: "Найм", label: "Зарплата #1" },
    { idx: 2, code: "A.2", group: "Найм", label: "Зарплата #2" },
    { idx: 3, code: "A.3", group: "Найм", label: "Прочее зарплата" },
    { idx: 4, code: "C.1", group: "Активы", label: "Бизнес (NET)" },
    { idx: 5, code: "C.2", group: "Активы", label: "Недвижимость (NET)" },
    { idx: 6, code: "C.3", group: "Активы", label: "Прочее активы" },
    { idx: 7, code: "E.1", group: "Портфолио", label: "Банковские продукты" },
    { idx: 8, code: "E.2", group: "Портфолио", label: "Дивиденды" },
    { idx: 9, code: "E.3", group: "Портфолио", label: "Роялти" },
    { idx: 10, code: "E.4", group: "Портфолио", label: "Прочее роялти" }
  ],
  
  expenses: [
    { idx: 1, code: "0.1", group: "Предварительные", label: "Инвестиции" },
    { idx: 2, code: "0.2", group: "Предварительные", label: "Сбережения" },
    { idx: 3, code: "0.3", group: "Предварительные", label: "Благотворительность" },
    { idx: 4, code: "0.4", group: "Предварительные", label: "Карман" },
    { idx: 5, code: "0.5", group: "Предварительные", label: "Развлечения" },
    { idx: 6, code: "0.6", group: "Предварительные", label: "Налоги" },
    { idx: 7, code: "1.1", group: "Основные", label: "Питание" },
    { idx: 8, code: "1.2", group: "Основные", label: "Супружество" },
    { idx: 9, code: "1.3", group: "Основные", label: "Жилье (рассрочка/рент + КУ)" },
    { idx: 10, code: "1.4", group: "Основные", label: "Гардероб" },
    { idx: 11, code: "1.5", group: "Основные", label: "Транспорт" },
    { idx: 12, code: "1.6", group: "Основные", label: "Коммуникации" },
    { idx: 13, code: "1.7", group: "Основные", label: "Фитнес" },
    { idx: 14, code: "1.8", group: "Основные", label: "Хобби" },
    { idx: 15, code: "1.9", group: "Основные", label: "Здоровье" },
    { idx: 16, code: "1.10", group: "Основные", label: "Дети" },
    { idx: 17, code: "1.11", group: "Основные", label: "Банковские услуги" },
    { idx: 18, code: "1.12", group: "Основные", label: "Транспортные рассрочки" },
    { idx: 19, code: "1.13", group: "Основные", label: "Образовательные рассрочки" },
    { idx: 20, code: "1.14", group: "Основные", label: "Персональные займы" },
    { idx: 21, code: "1.15", group: "Основные", label: "Прочее задолженности" },
    { idx: 22, code: "1.16", group: "Основные", label: "Прочее расходы" }
  ],
  
  assets: [
    { idx: 1, code: "N.1", group: "Активы", label: "Банковские счета" },
    { idx: 2, code: "N.2", group: "Активы", label: "Цифровые активы" },
    { idx: 3, code: "N.3", group: "Активы", label: "Инвестиционный сертификаты" },
    { idx: 4, code: "N.4", group: "Активы", label: "Дебиторская задолженность" },
    { idx: 5, code: "N.5", group: "Активы", label: "Бизнес (оценка, NET)" },
    { idx: 6, code: "N.6", group: "Активы", label: "Недвижимость (минус рассрочка)" },
    { idx: 7, code: "N.7", group: "Активы", label: "Прочее активы" },
    { idx: 8, code: "P.1", group: "Роскошь", label: "Дом" },
    { idx: 9, code: "P.2", group: "Роскошь", label: "Автомобиль(и)" },
    { idx: 10, code: "P.3", group: "Роскошь", label: "Прочее роскошь" }
  ],
  
  liabilities: [
    { idx: 1, code: "T.1", group: "Пассивы", label: "Жилищная рассрочка" },
    { idx: 2, code: "T.2", group: "Пассивы", label: "Банковские услуги" },
    { idx: 3, code: "T.3", group: "Пассивы", label: "Транспортные рассрочки" },
    { idx: 4, code: "T.4", group: "Пассивы", label: "Образовательные рассрочки" },
    { idx: 5, code: "T.5", group: "Пассивы", label: "Персональные займы" },
    { idx: 6, code: "T.6", group: "Пассивы", label: "Прочее пассивы" }
  ]
};

/**
 * Get financial report data for specific year
 */
export async function getFinancialReport(accountId, year) {
  try {
    console.log(`📊 Fetching financial report: ${accountId}, year ${year}`);
    
    const session = getSession();
    if (!session) throw new Error('No active session');
    
    const basePath = `accounts/${accountId}/fin_statements/${year}`;
    
    // Fetch all categories in parallel
    const [incomeRaw, expensesRaw, assetsRaw, liabilitiesRaw] = await Promise.all([
      fetchCollection(basePath, 'system_income_categories', session.authToken),
      fetchCollection(basePath, 'system_exp_categories', session.authToken),
      fetchCollection(basePath, 'system_asset_categories', session.authToken),
      fetchCollection(basePath, 'system_liability_categories', session.authToken)
    ]);
    
    // Merge with template (fill missing with 0)
    const income = mergeWithTemplate(CATEGORIES_TEMPLATE.income, incomeRaw);
    const expenses = mergeWithTemplate(CATEGORIES_TEMPLATE.expenses, expensesRaw);
    const assets = mergeWithTemplate(CATEGORIES_TEMPLATE.assets, assetsRaw);
    const liabilities = mergeWithTemplate(CATEGORIES_TEMPLATE.liabilities, liabilitiesRaw);
    
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

/**
 * Merge template with Firestore data
 */
function mergeWithTemplate(template, firestoreData) {
  return template.map(item => {
    // Find matching data from Firestore
    const match = firestoreData.find(d => d.code === item.code);
    
    return {
      ...item,
      amount: match ? (Number(match.amount) || 0) : 0,
      id: match?.id || null
    };
  });
}

/**
 * Fetch collection from Firestore via backend
 */
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

/**
 * Calculate analysis metrics
 */
export function calculateAnalysis(reportData) {
  const { income, expenses, assets, liabilities } = reportData;
  
  // Calculate totals
  const totalIncome = sumField(income, 'amount');
  const totalExpenses = sumField(expenses, 'amount');
  const totalLiabilities = sumField(liabilities, 'amount');
  
  // Calculate asset totals (needed for V and W)
  const activesTotal = sumByGroup(assets, 'group', 'Активы'); // N group
  const luxuryTotal = sumByGroup(assets, 'group', 'Роскошь'); // P group
  const assetsByBanker = activesTotal + luxuryTotal; // R = O + Q
  const assetsFactual = activesTotal; // S = O
  const totalAssets = assetsByBanker; // For other calculations
  
  // Get specific values for formulas
  const taxes = findValue(expenses, 'code', '0.6') || 0;
  const housingExpenses = findValue(expenses, 'code', '1.3') || 0;
  
  // Calculate metrics
  const cashFlow = totalIncome - totalExpenses;
  const cashFlowGrowth = cashFlow > 0; // ***должен расти
  
  const moneyWorking = (totalAssets + totalIncome > 0) 
    ? ((totalAssets + totalIncome) / totalIncome) 
    : 0;
  const moneyWorkingGrowth = moneyWorking > 1; // ***должен расти
  
  const taxRate = totalIncome > 0 ? (taxes / totalIncome) : 0;
  
  const housingRate = totalIncome > 0 ? (housingExpenses / totalIncome) : 0;
  const housingOk = housingRate <= 0.33; // ***не более 33%
  
  const luxuryRate = totalAssets > 0 ? (luxuryTotal / totalAssets) : 0;
  const luxuryOk = luxuryRate <= 0.33; // ***не более 33%
  
  const assetYield = totalAssets > 0 
    ? ((totalAssets + totalIncome) / totalAssets) 
    : 0;
  
  const security = totalExpenses > 0 ? (totalAssets / totalExpenses) : 0;
  // ***измеряется в месяцах
  
  const expensesCovered = totalExpenses > 0 
    ? ((totalAssets + totalIncome) / totalExpenses) 
    : 0;
  const expensesCoveredTarget = expensesCovered >= 2; // ***должен расти к 200%
  
  return {
    // Values
    totalIncome,
    totalExpenses,
    totalAssets,
    totalLiabilities,
    assetsByBanker,    // R - for V calculation
    assetsFactual,     // S - for W calculation
    cashFlow,
    moneyWorking,
    taxRate,
    housingRate,
    luxuryRate,
    assetYield,
    security,
    expensesCovered,
    
    // Status indicators
    cashFlowGrowth,
    moneyWorkingGrowth,
    housingOk,
    luxuryOk,
    expensesCoveredTarget
  };
}

// Helper functions
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