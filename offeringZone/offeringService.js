/* /webapp/offeringZone/offeringService.js v1.1.1 */
// CHANGELOG v1.1.0:
// - MOVED: From /js/cabinet/reports/ to /offeringZone/ (modular)
// - FIXED: Import paths
// CHANGELOG v1.0.0:
// - Initial release
// - Calculate available budget from financial report
// - Filter units from HBD collection
// - Centralized API calls
// CHANGELOG v1.1.1:
// - FIXED: Status check now reads from /HBD/{projectId}/info/main
// - Added projectInfo fetch before units filtering
// - Minimal "surgical" changes

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
 * Fetch available units from HBD
 * @param {number} maxPrice - Maximum affordable price (AED)
 * @returns {Promise<Array>}
 */
export async function fetchAvailableUnits(maxPrice) {
  try {
    console.log(`🔍 [Offering] Fetching units with maxPrice: ${maxPrice} AED`);
    
    const db = getFirestore();
    const projectsRef = collection(db, 'HBD');
    const projectsSnap = await getDocs(projectsRef);
    
    const allUnits = [];
    
    for (const projectDoc of projectsSnap.docs) {
      const projectId = projectDoc.id;
      
      // ✅ FIXED: Read status from /info/main
      console.log(`📋 [Offering] Checking project: ${projectId}`);
      
      const projectInfoDoc = await getDoc(doc(db, 'HBD', projectId, 'info', 'main'));
      
      if (!projectInfoDoc.exists()) {
        console.warn(`⚠️ [Offering] No info/main for project: ${projectId}`);
        continue;
      }
      
      const projectInfo = projectInfoDoc.data();
      
      // ✅ FIXED: Check status from info/main
      if (projectInfo.status !== 'active') {
        console.log(`⏸️ [Offering] Project ${projectId} is not active (status: ${projectInfo.status})`);
        continue;
      }
      
      console.log(`✅ [Offering] Project ${projectId} is active`);
      
      // Get units
      const unitsRef = collection(db, 'HBD', projectId, 'units');
      const unitsSnap = await getDocs(unitsRef);
      
      console.log(`📦 [Offering] Found ${unitsSnap.size} units in ${projectId}`);
      
      for (const unitDoc of unitsSnap.docs) {
        const unit = unitDoc.data();
        
        // Filter by status and price
        if (unit.status === 'available' && unit.price <= maxPrice) {
          allUnits.push({
            id: unitDoc.id,
            projectId: projectId,
            projectName: projectInfo.name || projectId, // ✅ Use name from info/main
            ...unit,
            projectInfo: projectInfo // ✅ Attach full project info
          });
        }
      }
    }
    
    console.log(`✅ [Offering] Total available units: ${allUnits.length}`);
    
    return allUnits;
    
  } catch (err) {
    console.error('❌ [Offering] Error fetching units:', err);
    throw err;
  }
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
  // 1. Status = Available
  // 2. Price <= budget
  // 3. Has valid price
  const filtered = units.filter(unit => {
    return (
      unit.status === 'Available' &&
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