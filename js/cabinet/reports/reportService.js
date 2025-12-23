/* /webapp/js/cabinet/reports/reportService.js v1.0.0 */
// Service for fetching financial report data from Firestore

import { getSession } from '../../session.js';
import { API_URL } from '../../config.js';

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
    const [income, expenses, assets, liabilities] = await Promise.all([
      fetchCollection(basePath, 'system_income_categories', session.authToken),
      fetchCollection(basePath, 'system_exp_categories', session.authToken),
      fetchCollection(basePath, 'system_asset_categories', session.authToken),
      fetchCollection(basePath, 'system_liability_categories', session.authToken)
    ]);
    
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
  const totalAssets = sumField(assets, 'amount');
  const totalLiabilities = sumField(liabilities, 'amount');
  
  // Get specific values for formulas
  const taxes = findValue(expenses, 'code', '0.6') || 0;
  const housingExpenses = findValue(expenses, 'code', '1.3') || 0;
  const luxuryTotal = sumByGroup(assets, 'group', 'Роскошь');
  
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
  
  const security = totalAssets > 0 ? (totalAssets / totalExpenses) : 0;
  // ***измеряется в месяцах
  
  const expensesCovered = totalIncome > 0 
    ? ((totalAssets + totalIncome) / totalExpenses) 
    : 0;
  const expensesCoveredTarget = expensesCovered >= 2; // ***должен расти к 200%
  
  return {
    // Values
    totalIncome,
    totalExpenses,
    totalAssets,
    totalLiabilities,
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