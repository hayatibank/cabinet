/* /webapp/js/cabinet/businessTriangle.js v1.2.0 */
// CHANGELOG v1.2.0:
// - Added Product Selector (like year selector in financial report)
// - Fixed accountId passing to 20L system
// - Triangle now opens AFTER product selection
// - Removed broken i18n dynamic import
// Business Management Triangle Component

/**
 * Show Business Management screen with product selector
 * @param {string} accountId - Account ID (REQUIRED)
 * @param {string} containerId - Container selector
 */
export async function showBusinessManagement(accountId, containerId = '#dashboardContent') {
  try {
    if (!accountId) {
      console.error('❌ accountId is required for Business Management');
      alert('❌ Ошибка: аккаунт не определен');
      return;
    }
    
    console.log('📊 Opening Business Management for account:', accountId);
    
    // Set global accountId for 20L system
    window.currentAccountId = accountId;
    
    // Import and render product selector for 20L
    const { renderProductSelector } = await import('../../20L/components/productSelector.js');
    
    await renderProductSelector(accountId);
    
    console.log('✅ Business Management opened');
    
  } catch (err) {
    console.error('❌ Error opening Business Management:', err);
    alert('❌ Ошибка загрузки бизнес-управления');
  }
}

/**
 * Render Business Triangle (legacy - called from product selector)
 * @deprecated Use showBusinessManagement() instead
 */
export function renderBusinessTriangle(containerId = '.cabinet-content') {
  const container = document.querySelector(containerId);
  
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('🔺 Rendering Business Triangle');
  
  container.innerHTML = `
    <div class="business-triangle-container">
      
      <h2 class="triangle-title">📊 Бизнес-управление</h2>
      
      <div class="triangle-wrapper">
        <!-- SVG Background Triangle with edges -->
        <svg class="triangle-svg" viewBox="0 0 500 433" xmlns="http://www.w3.org/2000/svg">
          <!-- Main triangle outline -->
          <polygon 
            points="250,20 480,413 20,413" 
            fill="transparent" 
            stroke="#333" 
            stroke-width="2"
          />
          
          <!-- Left edge (КОМАНДА) - black fill with yellow stroke -->
          <line 
            x1="250" y1="20" 
            x2="20" y2="413" 
            stroke="#ffd700" 
            stroke-width="8"
          />
          <line 
            x1="250" y1="20" 
            x2="20" y2="413" 
            stroke="#1a1a1a" 
            stroke-width="6"
          />
          
          <!-- Right edge (ЛИДЕРСТВО) - black fill with yellow stroke -->
          <line 
            x1="250" y1="20" 
            x2="480" y2="413" 
            stroke="#ffd700" 
            stroke-width="8"
          />
          <line 
            x1="250" y1="20" 
            x2="480" y2="413" 
            stroke="#1a1a1a" 
            stroke-width="6"
          />
        </svg>
        
        <!-- Clickable Areas -->
        
        <!-- BLACK EDGES TEXT -->
        <div class="triangle-area area-team" data-area="team" title="КОМАНДА">
          КОМАНДА
        </div>
        
        <div class="triangle-area area-leadership" data-area="leadership" title="ЛИДЕРСТВО">
          ЛИДЕРСТВО
        </div>
        
        <!-- BOTTOM EDGE TEXT -->
        <div class="triangle-area area-mission" data-area="mission" title="МИССИЯ">
          МИССИЯ
        </div>
        
        <!-- PURPLE LEVELS -->
        <div class="triangle-area purple-level area-product" data-area="product" title="Продукт">
          Продукт
        </div>
        
        <div class="triangle-area purple-level area-legal" data-area="legal" title="Юридическое">
          Юридическое
        </div>
        
        <div class="triangle-area purple-level area-systems" data-area="systems" title="Системы">
          Системы
        </div>
        
        <div class="triangle-area purple-level area-communications" data-area="communications" title="Коммуникации">
          Коммуникации
        </div>
        
        <div class="triangle-area purple-level area-cash-flow" data-area="cashFlow" title="Денежный поток">
          Денежный поток
        </div>
      </div>
    </div>
  `;
  
  // Attach click handlers
  attachTriangleHandlers();
}

/**
 * Attach click handlers to triangle areas
 */
function attachTriangleHandlers() {
  document.querySelectorAll('.triangle-area').forEach(area => {
    area.addEventListener('click', () => {
      const areaName = area.dataset.area;
      handleTriangleClick(areaName);
    });
  });
}

/**
 * Handle triangle area click
 */
function handleTriangleClick(area) {
  console.log(`🔺 Clicked area: ${area}`);
  
  // Remove active state from all
  document.querySelectorAll('.triangle-area').forEach(el => {
    el.classList.remove('active');
  });
  
  // Add active state to clicked
  const clickedArea = document.querySelector(`[data-area="${area}"]`);
  if (clickedArea) {
    clickedArea.classList.add('active');
  }
  
  // Handle different areas
  switch(area) {
    case 'mission':
      showMissionPanel();
      break;
    case 'team':
      showTeamPanel();
      break;
    case 'leadership':
      showLeadershipPanel();
      break;
    case 'product':
      showProductPanel();
      break;
    case 'legal':
      showLegalPanel();
      break;
    case 'systems':
      showSystemsPanel();
      break;
    case 'communications':
      showCommunicationsPanel();
      break;
    case 'cashFlow':
      showCashFlowPanel();
      break;
    default:
      console.warn('⚠️ Unknown area:', area);
  }
}

// Panel functions (placeholders for now)
function showMissionPanel() {
  alert(`🎯 МИССИЯ\n\nВ разработке...`);
}

function showTeamPanel() {
  alert(`👥 КОМАНДА\n\nВ разработке...`);
}

function showLeadershipPanel() {
  alert(`👑 ЛИДЕРСТВО\n\nВ разработке...`);
}

function showProductPanel() {
  alert(`📦 Продукт\n\nВ разработке...`);
}

function showLegalPanel() {
  alert(`⚖️ Юридическое\n\nВ разработке...`);
}

function showSystemsPanel() {
  alert(`⚙️ Системы\n\nВ разработке...`);
}

/**
 * Show Communications Panel → 20L System
 */
async function showCommunicationsPanel() {
  try {
    console.log('📞 Opening Communications...');
    
    // Get accountId
    const accountId = window.currentAccountId;
    
    if (!accountId) {
      alert('❌ Ошибка: аккаунт не определен');
      return;
    }
    
    // Import and show product selector for 20L
    const { renderProductSelector } = await import('../../20L/components/productSelector.js');
    
    // Get container
    const container = document.getElementById('dashboardContent');
    if (!container) {
      console.error('❌ Dashboard content container not found');
      return;
    }
    
    // Render product selector
    await renderProductSelector(accountId);
    
    console.log('✅ Communications (20L) opened');
    
  } catch (err) {
    console.error('❌ Error opening Communications:', err);
    alert('❌ Ошибка загрузки системы Коммуникаций');
  }
}

function showCashFlowPanel() {
  alert(`💰 Денежный поток\n\nВ разработке...`);
}

// Make functions globally accessible
if (typeof window !== 'undefined') {
  window.renderBusinessTriangle = renderBusinessTriangle;
  window.showBusinessManagement = showBusinessManagement;
  window.handleTriangleClick = handleTriangleClick;
}