/* /webapp/investments/level1.js v1.0.2 */
// CHANGELOG v1.0.2:
// - FIXED: Changed `list` to `investments`/`sorted` variables
// - FIXED: All i18n keys use correct prefixes
// CHANGELOG v1.0.1:
// - Moved to standalone investments module
// - Fixed i18n imports and keys
// CHANGELOG v1.0.0:
// - Initial release
// - Display balance, investments, crypto portfolio
// - No currency conversion yet

import { t } from './i18n.js';
import { getBalance, getInvestments, formatCurrency, formatCrypto } from './investmentService.js';





/**
 * Render Level 1 investments dashboard
 */
export async function renderLevel1(accountId) {
  try {
    console.log('📊 Rendering Level 1 for account:', accountId);
    console.log('🌍 Testing i18n:', t('level1.title'));
    console.log('🌍 Current language:', t !== undefined ? 'i18n loaded' : 'i18n NOT loaded');
    
    const container = document.getElementById('dashboardContent');
    if (!container) {
      console.error('❌ Dashboard content container not found');
      return;
    }
    
    // Show loading
    container.innerHTML = `
      <div class="investments-loading">
        <div class="spinner"></div>
        <p>${t('common.loading')}</p>
      </div>
    `;
    
    // Fetch data
    const [balance, investments] = await Promise.all([
      getBalance(accountId),
      getInvestments(accountId)
    ]);
    
    // Render UI
    container.innerHTML = `
      <div class="investments-level1">
        <div class="level1-header">
          <h3>${t('level1.title')}</h3>
          <p class="subtitle">${t('level1.subtitle')}</p>
        </div>
        
        ${renderBalanceSection(balance)}
        ${renderInvestmentsSection(investments)}
        ${renderCryptoPortfolio(balance)}
      </div>
    `;
    
    console.log('✅ Level 1 rendered');
    
  } catch (err) {
    console.error('❌ Error rendering Level 1:', err);
    
    const container = document.getElementById('dashboardContent');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <p>❌ ${t('error.loadingData')}</p>
          <button onclick="location.reload()" class="btn btn-secondary">
            ${t('common.back')}
          </button>
        </div>
      `;
    }
  }
}





/**
 * Render balance section
 */
function renderBalanceSection(balance) {
  if (!balance) {
    return `
      <div class="investment-section">
        <h4>${t('level1.balance')}</h4>
        <div class="empty-state">
          <p>${t('level1.noBalance')}</p>
        </div>
      </div>
    `;
  }
  
  const usdt = balance.usdt || 0;
  const btc = balance.btc || 0;
  const projects = balance.projects || 0;
  const rub = balance.rub || 0;
  
  return `
    <div class="investment-section balance-section">
      <h4>${t('level1.balance')}</h4>
      
      <div class="balance-grid">
        <div class="balance-card">
          <div class="balance-icon">🤖</div>
          <div class="balance-info">
            <div class="balance-label">${t('level1.bot')}</div>
            <div class="balance-amount">${formatCurrency(usdt, '$')}</div>
          </div>
        </div>
        
        <div class="balance-card">
          <div class="balance-icon">₿</div>
          <div class="balance-info">
            <div class="balance-label">${t('level1.hodl')}</div>
            <div class="balance-amount">${formatCrypto(btc, 'BTC')}</div>
          </div>
        </div>
        
        <div class="balance-card">
          <div class="balance-icon">📊</div>
          <div class="balance-info">
            <div class="balance-label">${t('level1.projects')}</div>
            <div class="balance-amount">${formatCurrency(projects, '$')}</div>
          </div>
        </div>
        
        <div class="balance-card">
          <div class="balance-icon">💵</div>
          <div class="balance-info">
            <div class="balance-label">${t('level1.liquidity')}</div>
            <div class="balance-amount">${formatCurrency(rub, '₽')}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}





/**
 * Render crypto portfolio section
 */
function renderCryptoPortfolio(balance) {
  if (!balance) {
    return `
      <div class="investment-section">
        <h4>${t('level1.cryptoPortfolio')}</h4>
        <div class="empty-state">
          <p>${t('level1.noCrypto')}</p>
        </div>
      </div>
    `;
  }
  
  const btc = balance.btc || 0;
  const usdt = balance.usdt || 0;
  
  // Only show if user has crypto
  if (btc === 0 && usdt === 0) {
    return `
      <div class="investment-section">
        <h4>${t('level1.cryptoPortfolio')}</h4>
        <div class="empty-state">
          <p>${t('level1.noCrypto')}</p>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="investment-section crypto-section">
      <h4>${t('level1.cryptoPortfolio')}</h4>
      <p class="subtitle">${t('level1.cryptoNote')}</p>
      
      <div class="crypto-grid">
        ${btc > 0 ? `
          <div class="crypto-card">
            <div class="crypto-icon">₿</div>
            <div class="crypto-info">
              <div class="crypto-name">Bitcoin</div>
              <div class="crypto-symbol">BTC</div>
            </div>
            <div class="crypto-amount">${formatCrypto(btc, 'BTC')}</div>
          </div>
        ` : ''}
        
        ${usdt > 0 ? `
          <div class="crypto-card">
            <div class="crypto-icon">₮</div>
            <div class="crypto-info">
              <div class="crypto-name">Tether</div>
              <div class="crypto-symbol">USDT</div>
            </div>
            <div class="crypto-amount">${formatCurrency(usdt, '$')}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}





/**
 * Render investments section
 */
function renderInvestmentsSection(investments) {
  if (!investments || investments.length === 0) {
    return `
      <div class="investment-section">
        <h4>${t('level1.portfolio')}</h4>
        <div class="empty-state">
          <p>${t('level1.noInvestments')}</p>
        </div>
      </div>
    `;
  }
  
  // Sort by ROI descending
  const sorted = [...investments].sort((a, b) => {
    const roiA = parseFloat(a.roi) || 0;
    const roiB = parseFloat(b.roi) || 0;
    return roiB - roiA;
  });
  
  const totalInvested = sorted.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
  
  return `
    <div class="investment-section portfolio-section">
      <div class="section-header">
        <h4>${t('level1.portfolio')}</h4>
        <div class="total-invested">
          <span class="label">${t('level1.totalInvested')}:</span>
          <span class="amount">${formatCurrency(totalInvested, '$')}</span>
        </div>
      </div>
      
      <div class="investments-grid">
        ${sorted.map(inv => renderInvestmentCard(inv)).join('')}
      </div>
    </div>
  `;
}





/**
 * Render single investment card
 */
function renderInvestmentCard(investment) {
  const name = investment.name || t('level1.unknownInvestment');
  const amount = parseFloat(investment.amount) || 0;
  const roi = parseFloat(investment.roi) || 0;
  const date = investment.date || '';
  
  const roiClass = roi > 0 ? 'positive' : roi < 0 ? 'negative' : 'neutral';
  
  return `
    <div class="investment-card">
      <div class="investment-header">
        <h5 class="investment-name">${name}</h5>
        ${roi !== 0 ? `<span class="investment-roi ${roiClass}">${roi > 0 ? '+' : ''}${roi}%</span>` : ''}
      </div>
      
      <div class="investment-details">
        <div class="detail-row">
          <span class="detail-label">${t('level1.amount')}:</span>
          <span class="detail-value">${formatCurrency(amount, '$')}</span>
        </div>
        
        ${date ? `
          <div class="detail-row">
            <span class="detail-label">${t('level1.date')}:</span>
            <span class="detail-value">${date}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}





// Export for global access
if (typeof window !== 'undefined') {
  window.renderLevel1 = renderLevel1;
}