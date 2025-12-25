/* /webapp/js/20L/services/counterpartyService.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - CRUD operations for counterparties
// - Status and cycle stage management
// - Centralized API calls

import { getSession } from '../../js/session.js';
import { API_URL } from '../../js/config.js';

/**
 * Get counterparties with optional filters
 */
export async function getCounterparties(accountId, filters = {}) {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');
    
    console.log('📋 Fetching counterparties...');
    
    const params = new URLSearchParams({
      accountId,
      authToken: session.authToken,
      ...filters
    });
    
    const response = await fetch(
      `${API_URL}/api/20L/counterparties?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch counterparties');
    }
    
    const result = await response.json();
    console.log(`✅ Fetched ${result.counterparties.length} counterparties`);
    
    return result.counterparties;
    
  } catch (err) {
    console.error('❌ Error fetching counterparties:', err);
    throw err;
  }
}

/**
 * Create new counterparty
 */
export async function createCounterparty(accountId, counterpartyData) {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');
    
    console.log('➕ Creating counterparty...');
    
    const response = await fetch(`${API_URL}/api/20L/counterparties/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        accountId,
        authToken: session.authToken,
        ...counterpartyData
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create counterparty');
    }
    
    const result = await response.json();
    console.log('✅ Counterparty created:', result.counterparty.id);
    
    return result.counterparty;
    
  } catch (err) {
    console.error('❌ Error creating counterparty:', err);
    throw err;
  }
}

/**
 * Update counterparty
 */
export async function updateCounterparty(accountId, counterpartyId, updates) {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');
    
    console.log('✏️ Updating counterparty...');
    
    const response = await fetch(`${API_URL}/api/20L/counterparties/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        accountId,
        authToken: session.authToken,
        counterpartyId,
        ...updates
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update counterparty');
    }
    
    console.log('✅ Counterparty updated');
    
    return true;
    
  } catch (err) {
    console.error('❌ Error updating counterparty:', err);
    throw err;
  }
}

/**
 * Delete counterparty (soft delete)
 */
export async function deleteCounterparty(accountId, counterpartyId) {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');
    
    console.log('🗑️ Deleting counterparty...');
    
    const response = await fetch(`${API_URL}/api/20L/counterparties/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        accountId,
        authToken: session.authToken,
        counterpartyId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete counterparty');
    }
    
    console.log('✅ Counterparty deleted');
    
    return true;
    
  } catch (err) {
    console.error('❌ Error deleting counterparty:', err);
    throw err;
  }
}

/**
 * Move counterparty to next cycle stage
 * Auto-updates status20L based on rules
 */
export async function moveToNextStage(accountId, counterpartyId, currentStage, currentStatus) {
  try {
    const nextStage = String(Number(currentStage) + 1);
    
    // Determine new status based on stage
    let newStatus = currentStatus;
    
    if (nextStage === '2' && currentStatus === '0') {
      // Moving from CRM to 0-й звонок → IC
      newStatus = 'IC';
    } else if (Number(nextStage) >= 3 && currentStatus === 'IC') {
      // Moving to stage 3+ from IC → Lead
      newStatus = 'Lead';
    } else if (nextStage === '9' && currentStatus === 'Lead') {
      // Moving to Контракт → Sales
      newStatus = 'Sales';
    }
    
    console.log(`📈 Moving to stage ${nextStage}, status: ${currentStatus} → ${newStatus}`);
    
    return await updateCounterparty(accountId, counterpartyId, {
      cycleStage: nextStage,
      status20L: newStatus
    });
    
  } catch (err) {
    console.error('❌ Error moving to next stage:', err);
    throw err;
  }
}