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
    
    const session = getSession();
    if (!session) {
      throw new Error('No session');
    }

    // 1️⃣ Get all projects
    const projectsResponse = await fetch(`${API_URL}/api/firestore/get`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        path: 'HBD',
        authToken: session.authToken
      })
    });

    if (!projectsResponse.ok) {
      throw new Error('Failed to fetch projects');
    }

    const projectsData = await projectsResponse.json();
    const projects = projectsData.documents || [];
    
    console.log(`📋 [Offering] Found ${projects.length} projects`);
    
    const allUnits = [];

    // 2️⃣ For each project
    for (const project of projects) {
      const projectId = project.id;
      
      console.log(`🔍 [Offering] Checking project: ${projectId}`);
      
      // ✅ FIXED: Fetch project info from /info/main
      const projectInfoResponse = await fetch(`${API_URL}/api/firestore/get`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          path: `HBD/${projectId}/info`,
          authToken: session.authToken
        })
      });
      
      if (!projectInfoResponse.ok) {
        console.warn(`⚠️ [Offering] Failed to fetch info for project: ${projectId}`);
        continue;
      }
      
      const projectInfoData = await projectInfoResponse.json();
      const projectInfos = projectInfoData.documents || [];
      
      // Find 'main' document
      const mainInfo = projectInfos.find(doc => doc.id === 'main');
      
      if (!mainInfo) {
        console.warn(`⚠️ [Offering] No info/main for project: ${projectId}`);
        continue;
      }
      
      // ✅ FIXED: Check status from info/main
      if (mainInfo.status !== 'active') {
        console.log(`⏸️ [Offering] Project ${projectId} is not active (status: ${mainInfo.status})`);
        continue;
      }
      
      console.log(`✅ [Offering] Project ${projectId} is active`);
      
      // 3️⃣ Get units for active project
      const unitsResponse = await fetch(`${API_URL}/api/firestore/get`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          path: `HBD/${projectId}/units`,
          authToken: session.authToken
        })
      });

      if (!unitsResponse.ok) {
        console.warn(`⚠️ [Offering] Failed to fetch units for project: ${projectId}`);
        continue;
      }

      const unitsData = await unitsResponse.json();
      const units = unitsData.documents || [];
      
      console.log(`📦 [Offering] Found ${units.length} units in ${projectId}`);
      
      // 4️⃣ Filter units by status and price
      for (const unit of units) {
        if (unit.status === 'available' && unit.price <= maxPrice) {
          allUnits.push({
            ...unit,
            projectId: projectId,
            projectName: mainInfo.name || projectId, // ✅ Use name from info/main
            projectLocation: mainInfo.location || '', // ✅ Bonus
            projectInfo: mainInfo // ✅ Attach full project info
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