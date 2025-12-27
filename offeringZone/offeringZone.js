/* /webapp/offeringZone/offeringZone.js v1.1.0 */
// CHANGELOG v1.1.0:
// - MOVED: From /js/cabinet/reports/ to /offeringZone/ (modular)
// - FIXED: Import paths for i18n
// CHANGELOG v1.0.0:
// - Initial release
// - Display personalized real estate offers
// - Calculate budget from financial report
// - Show top-3 units from HBD

import { t } from './i18n.js';
import { calculateAvailableBudget, fetchAvailableUnits, filterUnitsByBudget, getTopOffers } from './offeringService.js';

/**
 * Render offering zone
 */
export async function renderOfferingZone(accountId, year, financialData, rates) {
  try {
    console.log('🎁 Rendering offering zone...');
    
    // Check if container exists
    const reportContainer = document.querySelector('.financial-report');
    if (!reportContainer) {
      console.warn('⚠️ Financial report container not found');
      return;
    }
    
    // Calculate available budget
    const budgetInfo = calculateAvailableBudget(financialData);
    
    // Show loading state
    const offeringContainer = createOfferingContainer(budgetInfo, 'loading');
    reportContainer.appendChild(offeringContainer);
    
    // Fetch units
    const allUnits = await fetchAvailableUnits();
    
    if (allUnits.length === 0) {
      updateOfferingContainer(offeringContainer, budgetInfo, [], rates);
      return;
    }
    
    // Filter by budget
    const filteredUnits = filterUnitsByBudget(allUnits, budgetInfo.budget, rates);
    
    // Get top 3
    const topOffers = getTopOffers(filteredUnits, 3);
    
    // Update UI
    updateOfferingContainer(offeringContainer, budgetInfo, topOffers, rates);
    
    console.log('✅ Offering zone rendered');
    
  } catch (err) {
    console.error('❌ Error rendering offering zone:', err);
  }
}

/**
 * Create offering container (initial state)
 */
function createOfferingContainer(budgetInfo, state = 'loading') {
  const container = document.createElement('div');
  container.className = 'offering-zone';
  container.id = 'offeringZone';
  
  if (state === 'loading') {
    container.innerHTML = `
      <div class="offering-header">
        <h3>${t('offering.title')}</h3>
        <p class="offering-subtitle">${t('offering.subtitle')}</p>
      </div>
      
      <div class="offering-budget">
        <div class="budget-label">${t('offering.budget')}:</div>
        <div class="budget-amount">${formatCurrency(budgetInfo.budget)} ₽</div>
      </div>
      
      <div class="offering-loading">
        <div class="spinner"></div>
        <p>${t('offering.loading')}</p>
      </div>
    `;
  }
  
  return container;
}

/**
 * Update offering container with offers
 */
function updateOfferingContainer(container, budgetInfo, offers, rates) {
  // Clear container
  container.innerHTML = '';
  
  // Header
  const header = document.createElement('div');
  header.className = 'offering-header';
  header.innerHTML = `
    <h3>${t('offering.title')}</h3>
    <p class="offering-subtitle">${t('offering.subtitle')}</p>
  `;
  container.appendChild(header);
  
  // Budget display
  const budgetDisplay = document.createElement('div');
  budgetDisplay.className = 'offering-budget';
  budgetDisplay.innerHTML = `
    <div class="budget-info">
      <div class="budget-item">
        <span class="budget-label">${t('offering.budget')}:</span>
        <span class="budget-amount">${formatCurrency(budgetInfo.budget)} ₽</span>
      </div>
      <div class="budget-breakdown">
        <span>💰 ${t('offering.budget.cashFlow')}: ${formatCurrency(budgetInfo.cashFlowYearly * 3)} ₽</span>
        <span>🏦 ${t('offering.budget.liquidAssets')}: ${formatCurrency(budgetInfo.liquidAssets * 0.8)} ₽</span>
      </div>
    </div>
  `;
  container.appendChild(budgetDisplay);
  
  // Offers
  if (offers.length === 0) {
    const noOffers = document.createElement('div');
    noOffers.className = 'no-offers';
    noOffers.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.3; margin-bottom: 16px;">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <p>${t('offering.noOffers')}</p>
      <p class="subtitle" style="margin-top: 8px;">${t('offering.noOffersDesc')}</p>
    `;
    container.appendChild(noOffers);
    return;
  }
  
  // Offers grid
  const offersGrid = document.createElement('div');
  offersGrid.className = 'offers-grid';
  
  offers.forEach(unit => {
    const card = createOfferCard(unit, rates);
    offersGrid.appendChild(card);
  });
  
  container.appendChild(offersGrid);
}

/**
 * Create offer card
 */
function createOfferCard(unit, rates) {
  const card = document.createElement('div');
  card.className = 'offer-card';
  
  // Convert price to RUB
  const priceRub = unit.unitPriceAed * rates.rub;
  
  // Format area
  let areaText = '';
  if (unit.unitAreaTotalSqFt) {
    const areaSqM = (unit.unitAreaTotalSqFt * 0.092903).toFixed(1);
    areaText = `${areaSqM} ${t('units.sqm')}`;
  }
  
  // Format ROI
  let roiText = '';
  if (unit.unitCashOnCashROI) {
    roiText = `${(unit.unitCashOnCashROI * 100).toFixed(1)}%`;
  }
  
  card.innerHTML = `
    ${unit.unitFloorplanLink && unit.unitFloorplanLink !== '-' ? `
      <div class="offer-image" style="background-image: url('${unit.unitFloorplanLink}');"></div>
    ` : `
      <div class="offer-image offer-image-placeholder">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.3;">
          <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
        </svg>
      </div>
    `}
    
    <div class="offer-content">
      <h4 class="offer-title">${unit.projectName || t('message.projectLabel')}</h4>
      
      <div class="offer-details">
        ${unit.unitPropertyType && unit.unitPropertyType !== '-' ? `
          <div class="offer-detail">
            <span class="detail-icon">🏢</span>
            <span>${unit.unitPropertyType}</span>
          </div>
        ` : ''}
        
        ${unit.unitBedrooms && unit.unitBedrooms !== '-' ? `
          <div class="offer-detail">
            <span class="detail-icon">🛏</span>
            <span>${unit.unitBedrooms}</span>
          </div>
        ` : ''}
        
        ${areaText ? `
          <div class="offer-detail">
            <span class="detail-icon">📐</span>
            <span>${areaText}</span>
          </div>
        ` : ''}
        
        ${roiText ? `
          <div class="offer-detail roi-detail">
            <span class="detail-icon">📈</span>
            <span>${roiText} ${t('offering.roi')}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="offer-price">
        <span class="price-label">${t('offering.price')}:</span>
        <span class="price-amount">${formatCurrency(priceRub)} ₽</span>
        <span class="price-aed">${Math.round(unit.unitPriceAed).toLocaleString()} AED</span>
      </div>
      
      <button class="btn btn-primary btn-offer" onclick="window.openUnitDetails('${unit.projectId}', '${unit.id}')">
        ${t('offering.learnMore')}
      </button>
    </div>
  `;
  
  return card;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
}

/**
 * Open unit details (placeholder)
 */
window.openUnitDetails = function(projectId, unitId) {
  console.log('🏢 Opening unit details:', projectId, unitId);
  alert(`${t('message.comingSoon')}\n\n${t('message.projectLabel')}: ${projectId}\n${t('message.unitLabel')}: ${unitId}`);
};