/* /webapp/js/20L/services/dashboardService.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - Calculate dashboard statistics
// - Centralized API calls

import { getSession } from '../../session.js';
import { API_URL } from '../../config.js';

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(accountId, productId = null) {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');
    
    console.log('📊 Fetching dashboard stats...');
    
    const params = new URLSearchParams({
      accountId,
      authToken: session.authToken
    });
    
    if (productId) {
      params.append('productId', productId);
    }
    
    const response = await fetch(
      `${API_URL}/api/20L/dashboard/stats?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    
    const result = await response.json();
    console.log('✅ Dashboard stats:', result.stats);
    
    return result.stats;
    
  } catch (err) {
    console.error('❌ Error fetching dashboard stats:', err);
    throw err;
  }
}

/**
 * Calculate leads efficiency
 */
export function calculateEfficiency(stats) {
  const { leads, ic, sales } = stats;
  
  // Target: 20 IC → 5 Leads → 1 Sale (20:5:1)
  const targetRatio = {
    icToLeads: 4,    // 20/5 = 4
    leadsToSales: 5  // 5/1 = 5
  };
  
  const currentRatio = {
    icToLeads: ic > 0 ? (ic / Math.max(leads, 1)).toFixed(1) : 0,
    leadsToSales: leads > 0 ? (leads / Math.max(sales, 1)).toFixed(1) : 0
  };
  
  return {
    target: targetRatio,
    current: currentRatio,
    isEfficient: {
      icToLeads: currentRatio.icToLeads <= targetRatio.icToLeads * 1.2, // 20% tolerance
      leadsToSales: currentRatio.leadsToSales <= targetRatio.leadsToSales * 1.2
    }
  };
}

/**
 * Get leads progress (towards 20 goal)
 */
export function getLeadsProgress(stats) {
  const { leads } = stats;
  const target = 20;
  
  return {
    current: leads,
    target: target,
    percentage: Math.min((leads / target) * 100, 100).toFixed(0),
    remaining: Math.max(target - leads, 0)
  };
}