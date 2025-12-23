/* /webapp/js/cabinet/reports/reportManager.js v1.0.0 */
// CRUD management for financial report items

import { getSession } from '../../session.js';
import { API_URL } from '../../config.js';
import { renderFinancialReport } from './financialReport.js';

// Store current context
let currentContext = {
  accountId: null,
  year: null
};

/**
 * Initialize manager with account context
 */
export function initReportManager(accountId, year) {
  currentContext.accountId = accountId;
  currentContext.year = year;
  console.log('📊 Report manager initialized:', accountId, year);
}

/**
 * Show edit modal for category item
 */
export async function showEditModal(section, categoryCode) {
  try {
    console.log(`📝 Opening edit modal: ${section}, ${categoryCode}`);
    
    // Get category template
    const template = getCategoryTemplate(section, categoryCode);
    if (!template) {
      console.error('❌ Unknown category code:', categoryCode);
      return;
    }
    
    // Fetch current value from Firestore
    const currentData = await fetchCategoryData(section, categoryCode);
    const currentAmount = currentData?.amount || 0;
    
    // Create and show modal
    const modal = createEditModal(template, currentAmount, section, categoryCode);
    document.body.appendChild(modal);
    
    // Focus input
    setTimeout(() => {
      const input = document.getElementById('editAmount');
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
    
  } catch (err) {
    console.error('❌ Error showing edit modal:', err);
    alert('Ошибка открытия редактора');
  }
}

/**
 * Create edit modal HTML
 */
function createEditModal(template, currentAmount, section, categoryCode) {
  const modal = document.createElement('div');
  modal.className = 'modal report-edit-modal';
  modal.id = 'reportEditModal';
  
  const sectionInfo = {
    'income': { emoji: '💰', title: 'Доходы', color: '#00ff9f' },
    'expenses': { emoji: '💸', title: 'Расходы', color: '#ff006e' },
    'assets': { emoji: '📊', title: 'Активы', color: '#00f0ff' },
    'liabilities': { emoji: '📉', title: 'Пассивы', color: '#ffd700' }
  };
  
  const info = sectionInfo[section];
  
  modal.innerHTML = `
    <div class="modal-overlay" onclick="window.closeReportEditModal()"></div>
    <div class="modal-content report-modal-content">
      <div class="modal-header">
        <h3 style="color: ${info.color}">${info.emoji} ${info.title}</h3>
        <button onclick="window.closeReportEditModal()" class="btn-close">×</button>
      </div>
      <div class="modal-body">
        <div class="edit-form">
          <div class="category-info">
            <div class="category-label">${template.label}</div>
            <div class="category-code">${template.code} — ${template.group}</div>
          </div>
          
          <div class="input-group">
            <label for="editAmount">Сумма (₽)</label>
            <input 
              type="number" 
              id="editAmount" 
              class="amount-input" 
              value="${currentAmount}"
              placeholder="0"
              step="0.01"
              min="0"
              onkeypress="if(event.key === 'Enter') window.saveReportItem('${section}', '${categoryCode}')"
            >
          </div>
          
          <div class="form-actions">
            <button onclick="window.saveReportItem('${section}', '${categoryCode}')" class="btn btn-primary btn-save">
              💾 Сохранить
            </button>
            <button onclick="window.deleteReportItem('${section}', '${categoryCode}')" class="btn btn-danger btn-delete">
              🗑️ Обнулить
            </button>
            <button onclick="window.closeReportEditModal()" class="btn btn-secondary">
              ✖️ Отмена
            </button>
          </div>
          
          <div id="modalError" class="error hidden"></div>
          <div id="modalSuccess" class="success hidden"></div>
        </div>
      </div>
    </div>
  `;
  
  return modal;
}

/**
 * Fetch category data from Firestore
 */
async function fetchCategoryData(section, categoryCode) {
  try {
    const session = getSession();
    if (!session) throw new Error('No session');
    
    const { accountId, year } = currentContext;
    const collectionMap = {
      'income': 'system_income_categories',
      'expenses': 'system_exp_categories',
      'assets': 'system_asset_categories',
      'liabilities': 'system_liability_categories'
    };
    
    const collection = collectionMap[section];
    const basePath = `accounts/${accountId}/fin_statements/${year}`;
    
    const response = await fetch(`${API_URL}/api/firestore/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        path: `${basePath}/${collection}`,
        authToken: session.authToken
      })
    });
    
    if (!response.ok) return null;
    
    const result = await response.json();
    const items = result.documents || [];
    
    return items.find(item => item.code === categoryCode);
    
  } catch (err) {
    console.error('❌ Error fetching category data:', err);
    return null;
  }
}

/**
 * Save report item
 */
window.saveReportItem = async function(section, categoryCode) {
  try {
    const amountInput = document.getElementById('editAmount');
    const amount = parseFloat(amountInput.value) || 0;
    
    if (amount < 0) {
      showModalError('Сумма не может быть отрицательной');
      return;
    }
    
    // Show loading
    const saveBtn = document.querySelector('.btn-save');
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Сохранение...';
    
    const session = getSession();
    if (!session) throw new Error('No session');
    
    const { accountId, year } = currentContext;
    const collectionMap = {
      'income': 'system_income_categories',
      'expenses': 'system_exp_categories',
      'assets': 'system_asset_categories',
      'liabilities': 'system_liability_categories'
    };
    
    const collection = collectionMap[section];
    const basePath = `accounts/${accountId}/fin_statements/${year}`;
    const docId = categoryCode.replace(/\./g, '_');
    
    // Get template
    const template = getCategoryTemplate(section, categoryCode);
    
    // Save to Firestore
    const response = await fetch(`${API_URL}/api/firestore/set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        path: `${basePath}/${collection}`,
        docId: docId,
        data: {
          code: categoryCode,
          label: template.label,
          group: template.group,
          idx: template.idx,
          amount: amount
        },
        authToken: session.authToken
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save');
    }
    
    console.log('✅ Saved:', categoryCode, amount);
    
    // Show success
    showModalSuccess('✅ Сохранено!');
    
    // Close and reload
    setTimeout(() => {
      closeReportEditModal();
      renderFinancialReport(accountId, year);
    }, 800);
    
  } catch (err) {
    console.error('❌ Error saving:', err);
    showModalError('❌ Ошибка сохранения');
    
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Сохранить';
    }
  }
};

/**
 * Delete (set to 0) report item
 */
window.deleteReportItem = async function(section, categoryCode) {
  const confirmed = confirm('Обнулить эту запись?');
  if (!confirmed) return;
  
  const amountInput = document.getElementById('editAmount');
  amountInput.value = '0';
  
  await window.saveReportItem(section, categoryCode);
};

/**
 * Close modal
 */
window.closeReportEditModal = function() {
  const modal = document.getElementById('reportEditModal');
  if (modal) {
    modal.remove();
  }
};

/**
 * Show modal error
 */
function showModalError(message) {
  const errorEl = document.getElementById('modalError');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    setTimeout(() => errorEl.classList.add('hidden'), 3000);
  }
}

/**
 * Show modal success
 */
function showModalSuccess(message) {
  const successEl = document.getElementById('modalSuccess');
  if (successEl) {
    successEl.textContent = message;
    successEl.classList.remove('hidden');
  }
}

/**
 * Get category template
 */
function getCategoryTemplate(section, code) {
  const templates = {
    income: [
      { idx: 1, code: "A.1", group: "Найм", label: "Зарплата #1" },
      { idx: 2, code: "A.2", group: "Найм", label: "Зарплата #2" },
      { idx: 3, code: "A.3", group: "Найм", label: "Прочее зарплата" },
      { idx: 4, code: "C.1", group: "Активы", label: "Бизнес (NET)" },
      { idx: 5, code: "C.2", group: "Активы", label: "Недвижимость (NET)" },
      { idx: 6, code: "C.3", group: "Активы", label: "Прочее активы" },
      { idx: 7, code: "E.1", group: "Портфолио", label: "Банковские продукты" },
      { idx: 8, code: "E.2", group: "Портфолио", label: "Дивиденды" },
      { idx: 9, code: "E.3", group: "Портфолио", label: "Роялти" },
      { idx: 10, code: "E.4", group: "Портфолио", label: "Прочее роялти" }
    ],
    expenses: [
      { idx: 1, code: "0.1", group: "Предварительные", label: "Инвестиции" },
      { idx: 2, code: "0.2", group: "Предварительные", label: "Сбережения" },
      { idx: 3, code: "0.3", group: "Предварительные", label: "Благотворительность" },
      { idx: 4, code: "0.4", group: "Предварительные", label: "Карман" },
      { idx: 5, code: "0.5", group: "Предварительные", label: "Развлечения" },
      { idx: 6, code: "0.6", group: "Предварительные", label: "Налоги" },
      { idx: 7, code: "1.1", group: "Основные", label: "Питание" },
      { idx: 8, code: "1.2", group: "Основные", label: "Супружество" },
      { idx: 9, code: "1.3", group: "Основные", label: "Жилье (рассрочка/рент + КУ)" },
      { idx: 10, code: "1.4", group: "Основные", label: "Гардероб" },
      { idx: 11, code: "1.5", group: "Основные", label: "Транспорт" },
      { idx: 12, code: "1.6", group: "Основные", label: "Коммуникации" },
      { idx: 13, code: "1.7", group: "Основные", label: "Фитнес" },
      { idx: 14, code: "1.8", group: "Основные", label: "Хобби" },
      { idx: 15, code: "1.9", group: "Основные", label: "Здоровье" },
      { idx: 16, code: "1.10", group: "Основные", label: "Дети" },
      { idx: 17, code: "1.11", group: "Основные", label: "Банковские услуги" },
      { idx: 18, code: "1.12", group: "Основные", label: "Транспортные рассрочки" },
      { idx: 19, code: "1.13", group: "Основные", label: "Образовательные рассрочки" },
      { idx: 20, code: "1.14", group: "Основные", label: "Персональные займы" },
      { idx: 21, code: "1.15", group: "Основные", label: "Прочее задолженности" },
      { idx: 22, code: "1.16", group: "Основные", label: "Прочее расходы" }
    ],
    assets: [
      { idx: 1, code: "N.1", group: "Активы", label: "Банковские счета" },
      { idx: 2, code: "N.2", group: "Активы", label: "Цифровые активы" },
      { idx: 3, code: "N.3", group: "Активы", label: "Инвестиционный сертификаты" },
      { idx: 4, code: "N.4", group: "Активы", label: "Дебиторская задолженность" },
      { idx: 5, code: "N.5", group: "Активы", label: "Бизнес (оценка, NET)" },
      { idx: 6, code: "N.6", group: "Активы", label: "Недвижимость (минус рассрочка)" },
      { idx: 7, code: "N.7", group: "Активы", label: "Прочее активы" },
      { idx: 8, code: "P.1", group: "Роскошь", label: "Дом" },
      { idx: 9, code: "P.2", group: "Роскошь", label: "Автомобиль(и)" },
      { idx: 10, code: "P.3", group: "Роскошь", label: "Прочее роскошь" }
    ],
    liabilities: [
      { idx: 1, code: "T.1", group: "Пассивы", label: "Жилищная рассрочка" },
      { idx: 2, code: "T.2", group: "Пассивы", label: "Банковские услуги" },
      { idx: 3, code: "T.3", group: "Пассивы", label: "Транспортные рассрочки" },
      { idx: 4, code: "T.4", group: "Пассивы", label: "Образовательные рассрочки" },
      { idx: 5, code: "T.5", group: "Пассивы", label: "Персональные займы" },
      { idx: 6, code: "T.6", group: "Пассивы", label: "Прочее пассивы" }
    ]
  };
  
  const sectionTemplates = templates[section];
  return sectionTemplates?.find(t => t.code === code);
}

// Escape key handler
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeReportEditModal();
  }
});