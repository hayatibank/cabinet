/* /webapp/offeringZone/offeringZone.js v1.3.0 */
// CHANGELOG v1.3.0:
// - MIGRATED: From modular i18n to global window.i18n
// - REMOVED: import { t } (Android freeze fix)
// - ADDED: Inline t() helper
// CHANGELOG v1.2.0:
// - UPDATED: Now uses fetchMarketSnapshot() instead of fetchAvailableUnits()
// - ADDED: Snapshot metadata logging
// CHANGELOG v1.1.0:
// - MOVED: From /js/cabinet/reports/ to /offeringZone/ (modular)
// - FIXED: Import paths

import {
  calculateAvailableBudget,
  fetchMarketSnapshot,
  filterUnitsByBudget,
  getTopOffers,
  fetchProjectMain
} from './offeringService.js';

const offerUnitRegistry = new Map();
let detailsModalEl = null;

/**
 * Render offering zone
 */
export async function renderOfferingZone(accountId, year, financialData, rates) {
  const t = window.i18n.t.bind(window.i18n);
  
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
    
    // Fetch from market pool
    const allUnits = await fetchMarketSnapshot();
    
    if (allUnits.length === 0) {
    await updateOfferingContainer(offeringContainer, budgetInfo, [], rates);
      return;
    }
    
    // Filter by budget
    const filteredUnits = filterUnitsByBudget(allUnits, budgetInfo.budget, rates);
    
    // Get top 3
    const topOffers = getTopOffers(filteredUnits, 3);
    
    // Update UI
    await updateOfferingContainer(offeringContainer, budgetInfo, topOffers, rates);
    
    console.log('✅ Offering zone rendered');
    
  } catch (err) {
    console.error('❌ Error rendering offering zone:', err);
  }
}

/**
 * Create offering container (initial state)
 */
function createOfferingContainer(budgetInfo, state = 'loading') {
  const t = window.i18n.t.bind(window.i18n);
  
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
        <div class="budget-label">${t('offering.budgetPlan')}:</div>
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
async function updateOfferingContainer(container, budgetInfo, offers, rates) {
  const t = window.i18n.t.bind(window.i18n);
  
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
        <span class="budget-label">${t('offering.budgetPlan')}:</span>
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

  const heroMap = new Map();
  const uniqueProjectIds = [...new Set(offers.map((u) => String(u.projectId || '').trim()).filter(Boolean))];
  if (uniqueProjectIds.length) {
    const mains = await Promise.all(uniqueProjectIds.map((projectId) => fetchProjectMain(projectId)));
    uniqueProjectIds.forEach((projectId, index) => {
      heroMap.set(projectId, firstMediaFromProjectMain(mains[index]));
    });
  }

  offers.forEach(unit => {
    const projectId = String(unit.projectId || '').trim();
    const fallbackImage = heroMap.get(projectId) || '';
    const card = createOfferCard(unit, rates, fallbackImage);
    offersGrid.appendChild(card);
  });
  
  container.appendChild(offersGrid);
}

/**
 * Create offer card
 */
function createOfferCard(unit, rates, fallbackImage = '') {
  const t = window.i18n.t.bind(window.i18n);
  
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
  
  const unitKey = String(unit.compositeId || `${unit.projectId || ''}_${unit.id || unit.unitNumber || ''}`);
  offerUnitRegistry.set(unitKey, unit);

  card.innerHTML = `
    ${(unit.unitFloorplanLink && unit.unitFloorplanLink !== '-') || fallbackImage ? `
      <div class="offer-image" style="background-image: url('${(unit.unitFloorplanLink && unit.unitFloorplanLink !== '-' ? unit.unitFloorplanLink : fallbackImage)}');"></div>
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
      
      <button class="btn btn-primary btn-offer" onclick="window.openUnitDetails('${encodeURIComponent(unitKey)}')">
        ${t('offering.tapToView')}
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
window.openUnitDetails = function(encodedKey) {
  openUnitDetailsModal(encodedKey);
};

function localizedField(value, lang = (window.i18n?.getCurrentLanguage?.() || 'ru')) {
  if (value == null) return '-';
  if (typeof value === 'number' || typeof value === 'string') return String(value);
  if (typeof value !== 'object') return '-';
  if ('value' in value) return localizedField(value.value, lang);
  if (value[lang] != null) return String(value[lang]);
  if (value.en != null) return String(value.en);
  if (value.ru != null) return String(value.ru);
  return '-';
}

function renderEconomicsBlock(projectMain) {
  const lang = window.i18n?.getCurrentLanguage?.() || 'ru';
  const economics = projectMain?.economics || null;
  if (!economics || typeof economics !== 'object') {
    return '';
  }

  const entry = economics.entryTicketAED?.value ?? economics.entryTicketAED;
  const irrValue = localizedField(economics.irrRange, lang);
  const irrText = /%/.test(irrValue) ? irrValue : `${irrValue}%`;
  return `
    <div class="unit-economics">
      <h4>${t('section.economics') || 'Economics'}</h4>
      <div class="unit-detail-grid">
        <div><span>Asset Class</span><b>${localizedField(economics.assetClass, lang)}</b></div>
        <div><span>Risk</span><b>${localizedField(economics.riskProfile, lang)}</b></div>
        <div><span>Horizon</span><b>${localizedField(economics.horizon, lang)}</b></div>
        <div><span>Strategy</span><b>${localizedField(economics.strategy, lang)}</b></div>
        <div><span>IRR</span><b>${irrText}</b></div>
        <div><span>Entry</span><b>${formatCurrency(Number(entry) || 0)} AED</b></div>
      </div>
    </div>
  `;
}

function firstMediaFromProjectMain(projectMain) {
  if (!projectMain || typeof projectMain !== 'object') return '';
  const normalizeMediaCandidate = (value) => {
    if (!value) return '';
    if (typeof value === 'string') {
      const v = value.trim();
      if (!v || v === '-') return '';
      return v;
    }
    if (typeof value === 'object') {
      const nestedCandidates = [
        value.hyperlink,
        value.text,
        value.url,
        value.src,
        value.en,
        value.ru
      ];
      for (const nested of nestedCandidates) {
        const normalized = normalizeMediaCandidate(nested);
        if (normalized) return normalized;
      }
    }
    return '';
  };

  const candidates = [
    projectMain.projectIntroImgLink,
    projectMain.heroImage,
    projectMain.image,
    projectMain.coverImage,
    projectMain.thumbnail,
    projectMain.projectIntroImg
  ];
  for (const item of candidates) {
    const media = normalizeMediaCandidate(item);
    if (media) return media;
  }
  return '';
}

function ensureDetailsModal() {
  if (detailsModalEl) return detailsModalEl;
  detailsModalEl = document.createElement('div');
  detailsModalEl.className = 'unit-details-modal hidden';
  detailsModalEl.innerHTML = `
    <div class="unit-details-backdrop" data-close-unit-details="1"></div>
    <div class="unit-details-dialog">
      <button class="unit-details-close" type="button" data-close-unit-details="1">×</button>
      <div class="unit-details-body" id="unitDetailsBody"></div>
    </div>
  `;
  document.body.appendChild(detailsModalEl);

  detailsModalEl.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-unit-details="1"]')) {
      detailsModalEl.classList.add('hidden');
    }
  });

  return detailsModalEl;
}

async function openUnitDetailsModal(encodedKey) {
  const t = window.i18n.t.bind(window.i18n);
  const key = decodeURIComponent(String(encodedKey || ''));
  const unit = offerUnitRegistry.get(key);
  if (!unit) return;

  const modal = ensureDetailsModal();
  const body = modal.querySelector('#unitDetailsBody');
  if (!body) return;
  body.innerHTML = `<div class="unit-details-loading">${t('offering.loading')}</div>`;
  modal.classList.remove('hidden');

  const projectMain = await fetchProjectMain(unit.projectId);
  const fallbackImage = firstMediaFromProjectMain(projectMain);
  const image = unit.unitFloorplanLink && unit.unitFloorplanLink !== '-' ? unit.unitFloorplanLink : fallbackImage;
  const priceAed = Number(unit.unitPriceAed) || 0;

  body.innerHTML = `
    <div class="unit-details-header">
      <h3>${unit.projectName || '-'}</h3>
      <p>${unit.projectId || '-'} | ${unit.unitNumber || unit.id || '-'}</p>
    </div>
    ${image ? `<div class="unit-details-image" style="background-image:url('${image}')"></div>` : ''}
    <div class="unit-detail-grid">
      <div><span>Status</span><b>${unit.status || '-'}</b></div>
      <div><span>Bedrooms</span><b>${unit.unitBedrooms || '-'}</b></div>
      <div><span>Type</span><b>${unit.unitType || '-'}</b></div>
      <div><span>View</span><b>${unit.unitView || '-'}</b></div>
      <div><span>Area (sqft)</span><b>${unit.unitAreaTotalSqFt || '-'}</b></div>
      <div><span>Price (AED)</span><b>${formatCurrency(priceAed)} AED</b></div>
      <div><span>Handover</span><b>${unit.unitHandoverDate || '-'}</b></div>
      <div><span>Building</span><b>${unit.buildingCode || '-'}</b></div>
    </div>
    ${renderEconomicsBlock(projectMain)}
  `;
}
