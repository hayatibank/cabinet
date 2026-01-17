/* /webapp/offeringZone/offeringService.js v2.1.0 */
// CHANGELOG v2.1.0:
// - ADDED: 4-second timeout for fetchMarketSnapshot (prevents Android freeze)
// - Market snapshot fetch is now non-blocking and gracefully fails
// CHANGELOG v2.0.0:
// - BREAKING: Now uses market pool (/HBD_AVAILABLE_UNITS)
// - REMOVED: fetchAvailableUnits() - obsolete
// - ADDED: fetchMarketSnapshot() - new method
// - PERFORMANCE: Single collection read instead of nested queries
// CHANGELOG v1.1.0:
// - MOVED: From /js/cabinet/reports/ to /offeringZone/ (modular)
// - FIXED: Import paths

import { getSession } from '../js/session.js';
import { API_URL } from '../js/config.js';

/**
 * Calculate available budget for real estate investment
 * Formula: (cashFlow * 12 * 3) + (liquidAssets * 0.8)
 */
export function calculateAvailableBudget(financialData) {
  const { income, expenses, assets } = financialData;
  
  // Calculate totals
  const totalIncome = sumField(income, 'amount');
  const totalExpenses = sumField(expenses, 'amount');
  const cashFlow = totalIncome - totalExpenses;
  
  // Get liquid assets (N.1 Bank accounts + N.2 Digital assets)
  const bankAccounts = findValue(assets, 'code', 'N.1') || 0;
  const digitalAssets = findValue(assets, 'code', 'N.2') || 0;
  const liquidAssets = bankAccounts + digitalAssets;
  
  // Formula:
  // - 3 years of positive cash flow
  // - 80% of liquid assets (keep 20% as emergency fund)
  const budget = (cashFlow * 3) + (liquidAssets * 0.8);
  
  console.log('💰 Budget calculation:', {
    totalIncome,
    totalExpenses,
    cashFlow,
    liquidAssets,
    availableBudget: budget
  });
  
  return {
    budget: Math.max(0, budget), // Never negative
    cashFlow,
    liquidAssets,
    cashFlowMonthly: cashFlow / 12,
    cashFlowYearly: cashFlow
  };
}

/**
 * 🆕 NEW: Fetch market snapshot from pool
 * @returns {Promise<Array>} Array of available units
 */
export async function fetchMarketSnapshot() {
  try {
    const session = getSession();
    if (!session) throw new Error('No session');
    
    console.log('📊 Fetching market snapshot from pool...');
    
    // ✅ Add timeout to prevent Android freeze (4 seconds)
    const response = await Promise.race([
      fetch(`${API_URL}/api/firestore/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          path: 'HBD_AVAILABLE_UNITS',
          authToken: session.authToken
        })
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Market snapshot timeout')), 4000)
      )
    ]);
    
    if (!response.ok) {
      console.warn('⚠️ Market pool not found or empty');
      return [];
    }
    
    const result = await response.json();
    const units = result.documents || [];
    
    console.log(`✅ Fetched ${units.length} units from market pool`);
    
    // Log snapshot metadata
    if (units.length > 0) {
      const firstUnit = units[0];
      console.log(`📅 Snapshot generated at: ${firstUnit.generatedAt}`);
      console.log(`📍 Source: ${firstUnit.source}`);
    }
    
    return units;
    
  } catch (err) {
    console.error('❌ Error fetching market snapshot:', err.message);
    return [];
  }
}

/**
 * ❌ DEPRECATED: Use fetchMarketSnapshot() instead
 * @deprecated Since v2.0.0
 */
export async function fetchAvailableUnits() {
  console.warn('⚠️ fetchAvailableUnits() is deprecated - use fetchMarketSnapshot()');
  return fetchMarketSnapshot();
}

/**
 * Filter units by budget and criteria
 */
export function filterUnitsByBudget(units, budgetRub, rates) {
  // Convert budget to AED
  const budgetAED = budgetRub / rates.rub;
  
  console.log('🔍 Filtering units:', {
    totalUnits: units.length,
    budgetRub: budgetRub.toLocaleString(),
    budgetAED: budgetAED.toFixed(0)
  });
  
  // Filter criteria:
  // 1. Status = Available (already filtered in pool)
  // 2. Price <= budget
  // 3. Has valid price
  const filtered = units.filter(unit => {
    return (
      unit.unitPriceAed > 0 &&
      unit.unitPriceAed <= budgetAED
    );
  });
  
  // Sort by ROI (descending) if available, otherwise by price (ascending)
  filtered.sort((a, b) => {
    // Prefer units with ROI data
    if (a.unitCashOnCashROI && b.unitCashOnCashROI) {
      return b.unitCashOnCashROI - a.unitCashOnCashROI;
    }
    // Otherwise sort by price (cheaper first = better liquidity)
    return a.unitPriceAed - b.unitPriceAed;
  });
  
  console.log(`✅ Filtered to ${filtered.length} units within budget`);
  
  return filtered;
}

/**
 * Get top N offers
 */
export function getTopOffers(units, count = 3) {
  return units.slice(0, count);
}

// Helper functions
function sumField(array, field) {
  return array.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
}

function findValue(array, keyField, keyValue) {
  const item = array.find(i => i[keyField] === keyValue);
  return item ? (Number(item.amount) || 0) : 0;
}
