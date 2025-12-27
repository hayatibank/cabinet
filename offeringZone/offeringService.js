/* /webapp/offeringZone/offeringService.js v1.1.0 */
// CHANGELOG v1.1.0:
// - MOVED: From /js/cabinet/reports/ to /offeringZone/ (modular)
// - FIXED: Import paths
// CHANGELOG v1.0.0:
// - Initial release
// - Calculate available budget from financial report
// - Filter units from HBD collection
// - Centralized API calls

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
    cashFlowMonthly: cashFlow,
    cashFlowYearly: cashFlow * 12
  };
}

/**
 * Fetch units from HBD (all projects)
 */
export async function fetchAvailableUnits() {
  try {
    const session = getSession();
    if (!session) throw new Error('No session');
    
    console.log('🏢 Fetching HBD units...');
    
    // Fetch all projects
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
      console.warn('⚠️ No projects found');
      return [];
    }
    
    const projectsResult = await projectsResponse.json();
    const projects = projectsResult.documents || [];
    
    // Fetch units from all active projects
    const allUnits = [];
    
    for (const project of projects) {
      // Check if project is active
      if (project.status !== 'active') continue;
      
      // Fetch units
      const unitsResponse = await fetch(`${API_URL}/api/firestore/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          path: `HBD/${project.id}/units`,
          authToken: session.authToken
        })
      });
      
      if (unitsResponse.ok) {
        const unitsResult = await unitsResponse.json();
        const units = unitsResult.documents || [];
        
        // Add project info to each unit
        units.forEach(unit => {
          unit.projectId = project.id;
          unit.projectName = project.projectName || project.id;
        });
        
        allUnits.push(...units);
      }
    }
    
    console.log(`✅ Fetched ${allUnits.length} units from ${projects.length} projects`);
    
    return allUnits;
    
  } catch (err) {
    console.error('❌ Error fetching units:', err);
    return [];
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