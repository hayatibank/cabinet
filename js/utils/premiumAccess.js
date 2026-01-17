/* /webapp/js/utils/premiumAccess.js v2.0.1 */
// CHANGELOG v2.0.1:
// - FIXED: Use API_URL instead of API_BASE (matching config.js export)
// CHANGELOG v2.0.0:
// - CHANGED: Now reads from Firestore via /permissions/:uid endpoint
// - REMOVED: Hardcoded lockedSteps
// - ADDED: Dynamic permissions based on user data
// CHANGELOG v1.0.0:
// - Initial release
// - Client-side premium access checking
// Premium access management for frontend

import { API_URL } from '../config.js';
import { getSession } from '../session.js';

/**
 * Check permissions for current user
 * @returns {Promise<object>} Permissions status
 */
export async function checkPremiumStatus() {
  try {
    const session = getSession();
    
    if (!session || !session.uid) {
      console.warn('⚠️ No session found for permissions check');
      return {
        uid: null,
        permissions: {
          step1: true,
          step2: false,
          step3: false,
          step4: false,
          step5: false,
          step6: false,
          step7: false
        },
        unlockedSteps: [1],
        lockedSteps: [2, 3, 4, 5, 6, 7]
      };
    }
    
    const response = await fetch(`${API_URL}/api/permissions/${session.uid}`);
    
    if (!response.ok) {
      throw new Error(`Permissions check failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Permissions loaded:', data);
    
    return data;
    
  } catch (err) {
    console.error('❌ Permissions check error:', err);
    
    // Default to all locked on error (except step 1)
    return {
      uid: null,
      permissions: {
        step1: true,
        step2: false,
        step3: false,
        step4: false,
        step5: false,
        step6: false,
        step7: false
      },
      unlockedSteps: [1],
      lockedSteps: [2, 3, 4, 5, 6, 7]
    };
  }
}

/**
 * Check if specific step is unlocked
 * @param {number} stepNumber - Step number (1-7)
 * @param {object} permissionsStatus - Permissions status object from checkPremiumStatus()
 * @returns {boolean}
 */
export function isStepUnlocked(stepNumber, permissionsStatus) {
  if (!permissionsStatus || !permissionsStatus.unlockedSteps) {
    // Default: only step 1 unlocked
    return stepNumber === 1;
  }
  
  return permissionsStatus.unlockedSteps.includes(stepNumber);
}
