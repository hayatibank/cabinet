/* /webapp/js/cabinet/businessTriangle.js v1.1.0 */
// CHANGELOG v1.1.0:
// - Fixed i18n import path (now uses js/utils/i18n.js)
// - Added title "📊 Биз. управление" back
// Business Management Triangle Component

/**
 * Render Business Triangle
 */
export function renderBusinessTriangle(containerId = '.cabinet-content') {
  const container = document.querySelector(containerId);
  
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  console.log('🔺 Rendering Business Triangle');
  
  // Import translations
  import('../utils/i18n.js').then(i18n => {
    const t = i18n.t;
    
    container.innerHTML = `
      <div class="business-triangle-container">
        <button class="triangle-back-btn" onclick="window.accountNavigation.goBack()">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 20L0 10 10 0l2 2-6 6h14v4H6l6 6-2 2z"/>
          </svg>
          ${t('backToAccount')}
        </button>
        
        <h2 class="triangle-title">📊 ${t('businessManagement')}</h2>
        
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
          <div class="triangle-area area-team" data-area="team" title="${t('team')}">
            ${t('team')}
          </div>
          
          <div class="triangle-area area-leadership" data-area="leadership" title="${t('leadership')}">
            ${t('leadership')}
          </div>
          
          <!-- BOTTOM EDGE TEXT -->
          <div class="triangle-area area-mission" data-area="mission" title="${t('mission')}">
            ${t('mission')}
          </div>
          
          <!-- PURPLE LEVELS -->
          <div class="triangle-area purple-level area-product" data-area="product" title="${t('product')}">
            ${t('product')}
          </div>
          
          <div class="triangle-area purple-level area-legal" data-area="legal" title="${t('legal')}">
            ${t('legal')}
          </div>
          
          <div class="triangle-area purple-level area-systems" data-area="systems" title="${t('systems')}">
            ${t('systems')}
          </div>
          
          <div class="triangle-area purple-level area-communications" data-area="communications" title="${t('communications')}">
            ${t('communications')}
          </div>
          
          <div class="triangle-area purple-level area-cash-flow" data-area="cashFlow" title="${t('cashFlow')}">
            ${t('cashFlow')}
          </div>
        </div>
      </div>
    `;
    
    // Attach click handlers
    attachTriangleHandlers();
  }).catch(err => {
    console.error('❌ Error loading i18n:', err);
    // Fallback: render without translations
    renderTriangleFallback(container);
  });
}

/**
 * Fallback render without i18n
 *       <button class="triangle-back-btn" onclick="window.accountNavigation.goBack()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 20L0 10 10 0l2 2-6 6h14v4H6l6 6-2 2z"/>
        </svg>
        Назад к аккаунту
      </button>
 */
function renderTriangleFallback(container) {
  container.innerHTML = `
    <div class="business-triangle-container">
    

      
      <h2 class="triangle-title">📊 Биз. управление</h2>
      
      <div class="triangle-wrapper">
        <svg class="triangle-svg" viewBox="0 0 500 433" xmlns="http://www.w3.org/2000/svg">
          <polygon 
            points="250,20 480,413 20,413" 
            fill="transparent" 
            stroke="#333" 
            stroke-width="2"
          />
          <line x1="250" y1="20" x2="20" y2="413" stroke="#ffd700" stroke-width="8"/>
          <line x1="250" y1="20" x2="20" y2="413" stroke="#1a1a1a" stroke-width="6"/>
          <line x1="250" y1="20" x2="480" y2="413" stroke="#ffd700" stroke-width="8"/>
          <line x1="250" y1="20" x2="480" y2="413" stroke="#1a1a1a" stroke-width="6"/>
        </svg>
        
        <div class="triangle-area area-team" data-area="team" title="КОМАНДА">
          КОМАНДА
        </div>
        
        <div class="triangle-area area-leadership" data-area="leadership" title="ЛИДЕРСТВО">
          ЛИДЕРСТВО
        </div>
        
        <div class="triangle-area area-mission" data-area="mission" title="МИССИЯ">
          МИССИЯ
        </div>
        
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

function showCommunicationsPanel() {
  alert(`📞 Коммуникации\n\nВ разработке...`);
}

function showCashFlowPanel() {
  alert(`💰 Денежный поток\n\nВ разработке...`);
}

// Make functions globally accessible
if (typeof window !== 'undefined') {
  window.renderBusinessTriangle = renderBusinessTriangle;
  window.handleTriangleClick = handleTriangleClick;
}