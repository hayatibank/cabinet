/* /webapp/investments/level1.js v1.1.0 */
// CHANGELOG v1.1.0:
// - Added 4 sections: HODL, Projects, SpotBot, PaymentsMade
// - All sections use horizontal scroll carousel
// - Proper naming as per user specification
// CHANGELOG v1.0.2:
// - FIXED: Changed `list` to `investments`/`sorted` variables
// - FIXED: All i18n keys use correct prefixes

import { t } from './i18n.js';
import { getBalance, getInvestmentProjects, getPayments, formatCurrency, formatCrypto } from './investmentService.js';

/**
 * Render Level 1 investments dashboard
 */
export async function renderLevel1(accountId) {
  try {
    console.log('📊 Rendering Level 1 for account:', accountId);
    
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
    const [balance, investmentProjects, payments] = await Promise.all([
      getBalance(accountId),
      getInvestmentProjects(accountId),
      getPayments(accountId, 50)
    ]);
    
    // Render UI
    container.innerHTML = `
      <div class="investments-level1">
        <div class="level1-header">
          <h3>${t('level1.title')}</h3>
          <p class="subtitle">${t('level1.subtitle')}</p>
        </div>
        
        ${renderBalanceSection(balance)}
        ${renderHodlPortfolio(balance)}
        ${renderInvestmentProjectsSection(investmentProjects)}
        ${renderSpotBotsSection(investmentProjects)}
        ${renderPaymentsMadeSection(payments)}
      </div>
    `;
    
    // Attach carousel scroll handlers
    attachCarouselHandlers();
    
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
          <div class="balance-icon">🦾</div>
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
 * Render HODL портфель долгосрочных инвестиций («Хаяти HODL»)
 */
function renderHodlPortfolio(balance) {
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
    <div class="investment-section hodl-section">
      <h4>${t('level1.cryptoPortfolio')}</h4>
      <p class="subtitle">${t('level1.cryptoNote')}</p>
      
      <div class="carousel-wrapper">
        <button class="carousel-btn carousel-prev" data-carousel="hodl">←</button>
        <div class="carousel-track" data-track="hodl">
          ${btc > 0 ? `
            <div class="crypto-card carousel-item">
              <div class="crypto-icon">₿</div>
              <div class="crypto-info">
                <div class="crypto-name">Bitcoin</div>
                <div class="crypto-symbol">BTC</div>
              </div>
              <div class="crypto-amount">${formatCrypto(btc, 'BTC')}</div>
            </div>
          ` : ''}
          
          ${usdt > 0 ? `
            <div class="crypto-card carousel-item">
              <div class="crypto-icon">₮</div>
              <div class="crypto-info">
                <div class="crypto-name">Tether</div>
                <div class="crypto-symbol">USDT</div>
              </div>
              <div class="crypto-amount">${formatCurrency(usdt, '$')}</div>
            </div>
          ` : ''}
        </div>
        <button class="carousel-btn carousel-next" data-carousel="hodl">→</button>
      </div>
    </div>
  `;
}

/**
 * Render проекты - рост капитала
 */
function renderInvestmentProjectsSection(investmentProjects) {
  if (!investmentProjects || investmentProjects.length === 0) {
    return `
      <div class="investment-section">
        <h4>${t('projects.title')}</h4>
        <div class="empty-state">
          <p>${t('projects.noProjects')}</p>
        </div>
      </div>
    `;
  }
  
  // Sort by ROI descending
  const sorted = [...investmentProjects].sort((a, b) => {
    const roiA = parseFloat(a.roi) || 0;
    const roiB = parseFloat(b.roi) || 0;
    return roiB - roiA;
  });
  
  const totalInvested = sorted.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
  
  return `
    <div class="investment-section projects-section">
      <div class="section-header">
        <h4>${t('projects.title')}</h4>
        <div class="total-invested">
          <span class="label">${t('projects.invested')}:</span>
          <span class="amount">${formatCurrency(totalInvested, '$')}</span>
        </div>
      </div>
      <p class="subtitle">${t('projects.subtitle')}</p>
      
      <div class="carousel-wrapper">
        <button class="carousel-btn carousel-prev" data-carousel="projects">←</button>
        <div class="carousel-track" data-track="projects">
          ${sorted.map(project => renderProjectCard(project)).join('')}
        </div>
        <button class="carousel-btn carousel-next" data-carousel="projects">→</button>
      </div>
    </div>
  `;
}

/**
 * Render Спотовый бот «Хаяти» - пассивный доход
 */
function renderSpotBotsSection(investmentProjects) {
  // TODO: Separate collection for spot bots
  // For now, use same data with filter or placeholder
  
  return `
    <div class="investment-section spotbot-section">
      <div class="section-header">
        <h4>${t('spotBot.title')}</h4>
      </div>
      <p class="subtitle">${t('spotBot.subtitle')}</p>
      
      <div class="empty-state">
        <p>${t('spotBot.noBots')}</p>
      </div>
    </div>
  `;
}

/**
 * Render осуществленные выплаты
 */
function renderPaymentsMadeSection(payments) {
  if (!payments || payments.length === 0) {
    return `
      <div class="investment-section">
        <h4>${t('payments.title')}</h4>
        <div class="empty-state">
          <p>${t('payments.noPayments')}</p>
        </div>
      </div>
    `;
  }
  
  const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amountMade) || 0), 0);
  
  return `
    <div class="investment-section payments-section">
      <div class="section-header">
        <h4>${t('payments.title')}</h4>
        <div class="total-invested">
          <span class="label">${t('payments.total')}:</span>
          <span class="amount">${formatCurrency(totalPaid, '$')}</span>
        </div>
      </div>
      <p class="subtitle">${t('payments.subtitle')}</p>
      
      <div class="carousel-wrapper">
        <button class="carousel-btn carousel-prev" data-carousel="payments">←</button>
        <div class="carousel-track" data-track="payments">
          ${payments.map(payment => renderPaymentCard(payment)).join('')}
        </div>
        <button class="carousel-btn carousel-next" data-carousel="payments">→</button>
      </div>
    </div>
  `;
}

/**
 * Render project card
 */
function renderProjectCard(project) {
  const name = project.name || t('level1.unknownInvestment');
  const amount = parseFloat(project.amount) || 0;
  const roi = parseFloat(project.roi) || 0;
  const date = project.date || '';
  
  const roiClass = roi > 0 ? 'positive' : roi < 0 ? 'negative' : 'neutral';
  
  return `
    <div class="investment-card carousel-item">
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

/**
 * Render payment card
 */
function renderPaymentCard(payment) {
  const date = payment.date || '';
  const amountMade = parseFloat(payment.amountMade) || 0;
  const amountReinvested = parseFloat(payment.amountReinvested) || 0;
  const amountSavedInBtc = parseFloat(payment.amountSavedInBtc) || 0;
  const amountTransferred = parseFloat(payment.amountTransferred) || 0;
  
  return `
    <div class="payment-card carousel-item">
      <div class="payment-header">
        <h5 class="payment-date">📅 ${date}</h5>
      </div>
      
      <div class="payment-details">
        ${amountMade > 0 ? `
          <div class="detail-row">
            <span class="detail-label">💸 ${t('payments.made')}:</span>
            <span class="detail-value positive">${formatCurrency(amountMade, '$')}</span>
          </div>
        ` : ''}
        
        ${amountReinvested > 0 ? `
          <div class="detail-row">
            <span class="detail-label">🔄 ${t('payments.reinvested')}:</span>
            <span class="detail-value">${formatCurrency(amountReinvested, '$')}</span>
          </div>
        ` : ''}
        
        ${amountSavedInBtc > 0 ? `
          <div class="detail-row">
            <span class="detail-label">₿ ${t('payments.savedInBtc')}:</span>
            <span class="detail-value">${formatCrypto(amountSavedInBtc, 'BTC')}</span>
          </div>
        ` : ''}
        
        ${amountTransferred > 0 ? `
          <div class="detail-row">
            <span class="detail-label">📤 ${t('payments.transferred')}:</span>
            <span class="detail-value">${formatCurrency(amountTransferred, '$')}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Attach carousel scroll handlers
 */
function attachCarouselHandlers() {
  document.querySelectorAll('.carousel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const carouselName = btn.dataset.carousel;
      const track = document.querySelector(`[data-track="${carouselName}"]`);
      const direction = btn.classList.contains('carousel-prev') ? -1 : 1;
      
      if (track) {
        const cardWidth = track.querySelector('.carousel-item')?.offsetWidth || 300;
        const gap = 20; // From CSS
        const scrollAmount = (cardWidth + gap) * direction;
        
        track.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Export for global access
if (typeof window !== 'undefined') {
  window.renderLevel1 = renderLevel1;
}