/* /webapp/js/20L/components/dashboard.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - Dashboard with statistics
// - Counterparties list with pagination
// - Filters by status

import { getCounterparties, createCounterparty } from '../services/counterpartyService.js';
import { getDashboardStats, getLeadsProgress } from '../services/dashboardService.js';
import { t } from '../../utils/i18n.js';

// Pagination state
let currentPage = 1;
const itemsPerPage = 10;
let currentFilters = {};

/**
 * Render dashboard
 */
export async function renderDashboard(accountId, productId) {
  try {
    console.log('📊 Rendering 20L dashboard...');
    
    const container = document.getElementById('dashboardContent');
    if (!container) {
      console.error('❌ Container not found');
      return;
    }
    
    // Show loading
    container.innerHTML = `
      <div class="dashboard-loading">
        <div class="spinner"></div>
        <p>${t('common.loading')}</p>
      </div>
    `;
    
    // Fetch data
    const [stats, counterparties] = await Promise.all([
      getDashboardStats(accountId, productId),
      getCounterparties(accountId, { productId, ...currentFilters })
    ]);
    
    const progress = getLeadsProgress(stats);
    
    // Render dashboard
    container.innerHTML = `
      <div class="leads-dashboard">
        <!-- Header with back button -->
        <div class="dashboard-header-row">
          <button onclick="window.backToProductSelector('${accountId}')" class="btn-back">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 20L0 10 10 0l2 2-6 6h14v4H6l6 6-2 2z"/>
            </svg>
            ${t('20L.dashboard.backToProducts')}
          </button>
        </div>
        
        <!-- Statistics Cards -->
        <div class="dashboard-stats">
          <div class="stat-card stat-leads">
            <div class="stat-header">
              <span class="stat-icon">🎯</span>
              <span class="stat-label">${t('20L.leads')}</span>
            </div>
            <div class="stat-value">${stats.leads}/<span class="stat-target">20</span></div>
            <div class="stat-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress.percentage}%"></div>
              </div>
              <span class="progress-text">${progress.remaining} ${t('20L.dashboard.remaining')}</span>
            </div>
          </div>
          
          <div class="stat-card stat-ic">
            <div class="stat-header">
              <span class="stat-icon">📞</span>
              <span class="stat-label">${t('20L.ic')}</span>
            </div>
            <div class="stat-value">${stats.ic}</div>
          </div>
          
          <div class="stat-card stat-counterparties">
            <div class="stat-header">
              <span class="stat-icon">👥</span>
              <span class="stat-label">${t('20L.counterparties')}</span>
            </div>
            <div class="stat-value">${stats.counterparties}</div>
          </div>
          
          <div class="stat-card stat-sales">
            <div class="stat-header">
              <span class="stat-icon">✅</span>
              <span class="stat-label">${t('20L.sales')}</span>
            </div>
            <div class="stat-value">${stats.sales}</div>
          </div>
        </div>
        
        <!-- Filters and Add Button -->
        <div class="dashboard-controls">
          <div class="filter-buttons">
            <button 
              class="filter-btn ${!currentFilters.status20L ? 'active' : ''}" 
              onclick="window.filterByStatus('${accountId}', '${productId}', null)"
            >
              ${t('20L.filter.all')}
            </button>
            <button 
              class="filter-btn status-0 ${currentFilters.status20L === '0' ? 'active' : ''}" 
              onclick="window.filterByStatus('${accountId}', '${productId}', '0')"
            >
              ${t('20L.status.0')}
            </button>
            <button 
              class="filter-btn status-ic ${currentFilters.status20L === 'IC' ? 'active' : ''}" 
              onclick="window.filterByStatus('${accountId}', '${productId}', 'IC')"
            >
              ${t('20L.status.ic')}
            </button>
            <button 
              class="filter-btn status-lead ${currentFilters.status20L === 'Lead' ? 'active' : ''}" 
              onclick="window.filterByStatus('${accountId}', '${productId}', 'Lead')"
            >
              ${t('20L.status.lead')}
            </button>
            <button 
              class="filter-btn status-sales ${currentFilters.status20L === 'Sales' ? 'active' : ''}" 
              onclick="window.filterByStatus('${accountId}', '${productId}', 'Sales')"
            >
              ${t('20L.status.sales')}
            </button>
          </div>
          
          <button onclick="window.showCreateCounterpartyModal('${accountId}', '${productId}')" class="btn btn-primary">
            ➕ ${t('20L.counterparty.add')}
          </button>
        </div>
        
        <!-- Counterparties List -->
        <div class="counterparties-list">
          ${renderCounterpartiesList(counterparties, accountId, productId)}
        </div>
        
        <!-- Pagination -->
        ${renderPagination(counterparties.length, accountId, productId)}
      </div>
    `;
    
    console.log('✅ Dashboard rendered');
    
  } catch (err) {
    console.error('❌ Error rendering dashboard:', err);
    const container = document.getElementById('dashboardContent');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <p>❌ ${t('error.loadingData')}</p>
        </div>
      `;
    }
  }
}

/**
 * Render counterparties list
 */
function renderCounterpartiesList(counterparties, accountId, productId) {
  if (counterparties.length === 0) {
    return `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.3;">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <p>${t('20L.counterparty.empty')}</p>
      </div>
    `;
  }
  
  // Pagination
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageCounterparties = counterparties.slice(start, end);
  
  return pageCounterparties.map(cp => {
    const statusClass = `status-${cp.status20L.toLowerCase()}`;
    const statusLabel = t(`20L.status.${cp.status20L.toLowerCase()}`);
    const stageLabel = t(`20L.cycle.${cp.cycleStage}`);
    
    return `
      <div class="counterparty-card ${statusClass}" onclick="window.openCounterpartyModal('${accountId}', '${productId}', '${cp.id}')">
        <div class="counterparty-header">
          <div class="counterparty-name">${cp.name}</div>
          <div class="counterparty-status">${statusLabel}</div>
        </div>
        <div class="counterparty-details">
          <span class="detail-item">📊 ${stageLabel}</span>
          ${cp.classification ? `<span class="detail-item">🏷️ ${cp.classification}</span>` : ''}
          ${cp.source ? `<span class="detail-item">📍 ${cp.source}</span>` : ''}
        </div>
        ${cp.comment ? `<div class="counterparty-comment">${cp.comment}</div>` : ''}
      </div>
    `;
  }).join('');
}

/**
 * Render pagination
 */
function renderPagination(totalItems, accountId, productId) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return '';
  
  let buttons = [];
  
  if (currentPage > 1) {
    buttons.push(`
      <button onclick="window.goToPage('${accountId}', '${productId}', ${currentPage - 1})" class="pagination-btn">
        ← ${t('common.previous')}
      </button>
    `);
  }
  
  buttons.push(`
    <span class="pagination-info">${currentPage} / ${totalPages}</span>
  `);
  
  if (currentPage < totalPages) {
    buttons.push(`
      <button onclick="window.goToPage('${accountId}', '${productId}', ${currentPage + 1})" class="pagination-btn">
        ${t('common.next')} →
      </button>
    `);
  }
  
  return `
    <div class="pagination">
      ${buttons.join('')}
    </div>
  `;
}

/**
 * Global handlers
 */
window.backToProductSelector = async function(accountId) {
  const { renderProductSelector } = await import('./productSelector.js');
  await renderProductSelector(accountId);
};

window.filterByStatus = async function(accountId, productId, status) {
  currentFilters = status ? { status20L: status } : {};
  currentPage = 1;
  await renderDashboard(accountId, productId);
};

window.goToPage = async function(accountId, productId, page) {
  currentPage = page;
  await renderDashboard(accountId, productId);
};