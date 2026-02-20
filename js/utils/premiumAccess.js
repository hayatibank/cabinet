/* /webapp/js/utils/premiumAccess.js v2.1.0 */
// CHANGELOG v2.1.0:
// - FIXED: Avoid false locked state on slow first permissions load
// - ADDED: Retry logic + sessionStorage cache fallback

import { getSession } from '../session.js';

const PERMISSIONS_API_URL = 'https://api.hayatibank.ru/api/permissions';
const PERMISSIONS_CACHE_KEY = 'hb_permissions_cache_v1';

function getDefaultPermissions() {
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

function readCachedPermissions(uid) {
  if (!uid) return null;

  try {
    const raw = sessionStorage.getItem(PERMISSIONS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.uid !== uid || !Array.isArray(parsed.unlockedSteps)) return null;

    return parsed;
  } catch (_err) {
    return null;
  }
}

function writeCachedPermissions(payload) {
  if (!payload || !payload.uid) return;

  try {
    sessionStorage.setItem(PERMISSIONS_CACHE_KEY, JSON.stringify(payload));
  } catch (_err) {
    // ignore storage errors
  }
}

async function fetchPermissionsOnce() {
  const response = await fetch(PERMISSIONS_API_URL, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`Permissions check failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Check permissions for current user
 * @returns {Promise<object>} Permissions status
 */
export async function checkPremiumStatus() {
  const session = getSession();

  if (!session || !session.uid) {
    console.warn('[permissions] No session found for permissions check');
    return getDefaultPermissions();
  }

  try {
    let data;

    try {
      data = await fetchPermissionsOnce();
    } catch (firstErr) {
      console.warn('[permissions] First attempt failed, retrying...', firstErr?.message || firstErr);
      await new Promise((resolve) => setTimeout(resolve, 450));
      data = await fetchPermissionsOnce();
    }

    data.uid = data.uid || session.uid;
    writeCachedPermissions(data);

    console.log('[permissions] Loaded:', data);
    return data;
  } catch (err) {
    console.error('[permissions] API error:', err);

    const cached = readCachedPermissions(session.uid);
    if (cached) {
      console.warn('[permissions] Using cached permissions after API error');
      return cached;
    }

    return getDefaultPermissions();
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
    return stepNumber === 1;
  }

  return permissionsStatus.unlockedSteps.includes(stepNumber);
}
