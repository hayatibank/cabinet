/* /webapp/js/cabinet/reports/reportManager.js v1.2.0 */
// CRUD management for financial report items

import { getSession } from '../js/session.js';
import { API_URL } from '../js/config.js';
import { renderFinancialReport } from './financialReport.js';

const AMOUNT_STEP = 500;

let currentContext = {
  accountId: null,
  year: null
};

export function initReportManager(accountId, year) {
  currentContext.accountId = accountId;
  currentContext.year = year;
  console.log('Report manager initialized:', accountId, year);
}

export async function showEditModal(section, categoryCode) {
  try {
    console.log(`Opening edit modal: ${section}, ${categoryCode}`);

    const template = getCategoryTemplate(section, categoryCode);
    if (!template) {
      console.error('Unknown category code:', categoryCode);
      return;
    }

    const currentData = await fetchCategoryData(section, categoryCode);
    const currentAmount = currentData?.amount || 0;

    const modal = createEditModal(template, currentAmount, section, categoryCode);
    document.body.appendChild(modal);

    setTimeout(() => {
      const input = document.getElementById('editAmount');
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  } catch (err) {
    console.error('Error showing edit modal:', err);
    alert(window.i18n.t('report.modal.openError'));
  }
}

function createEditModal(template, currentAmount, section, categoryCode) {
  const t = window.i18n.t.bind(window.i18n);
  const modal = document.createElement('div');
  modal.className = 'modal report-edit-modal';
  modal.id = 'reportEditModal';

  const sectionInfo = {
    income: { title: t('report.income'), color: '#00ff9f' },
    expenses: { title: t('report.expenses'), color: '#ff006e' },
    assets: { title: t('report.assets'), color: '#00f0ff' },
    liabilities: { title: t('report.liabilities'), color: '#ffd700' }
  };

  const info = sectionInfo[section];

  modal.innerHTML = `
    <div class="modal-overlay" onclick="window.closeReportEditModal()"></div>
    <div class="modal-content report-modal-content">
      <div class="modal-header">
        <h3 style="color: ${info.color}">${info.title}</h3>
        <button onclick="window.closeReportEditModal()" class="btn-close">×</button>
      </div>
      <div class="modal-body">
        <div class="edit-form">
          <div class="category-info">
            <div class="category-label">${template.label}</div>
            <div class="category-code">${template.code} — ${template.group}</div>
          </div>

          <div class="input-group">
            <label for="editAmount">${t('report.modal.amount')} (₽)</label>
            <div class="amount-editor">
              <button type="button" class="btn btn-secondary amount-step-btn" onclick="window.bumpReportAmount(-${AMOUNT_STEP})">-${AMOUNT_STEP}</button>
              <input
                type="number"
                id="editAmount"
                class="amount-input"
                value="${currentAmount}"
                placeholder="0"
                step="${AMOUNT_STEP}"
                min="0"
                inputmode="numeric"
                onkeypress="if(event.key === 'Enter') window.saveReportItem('${section}', '${categoryCode}')"
              >
              <button type="button" class="btn btn-secondary amount-step-btn" onclick="window.bumpReportAmount(${AMOUNT_STEP})">+${AMOUNT_STEP}</button>
            </div>
          </div>

          <div class="form-actions report-modal-actions">
            <button onclick="window.saveReportItem('${section}', '${categoryCode}')" class="btn btn-primary btn-save report-action-btn">
              <span class="btn-label">${t('common.save')}</span>
            </button>
            <button onclick="window.deleteReportItem('${section}', '${categoryCode}')" class="btn btn-danger btn-delete report-action-btn">
              <span class="btn-label">${t('report.modal.reset')}</span>
            </button>
            <button onclick="window.closeReportEditModal()" class="btn btn-secondary report-action-btn">
              <span class="btn-label">${t('common.cancel')}</span>
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

window.bumpReportAmount = function(delta) {
  const amountInput = document.getElementById('editAmount');
  if (!amountInput) return;

  const currentValue = parseFloat(amountInput.value) || 0;
  const nextValue = Math.max(0, currentValue + delta);
  amountInput.value = String(nextValue);
  amountInput.focus();
  amountInput.select();
};

async function fetchCategoryData(section, categoryCode) {
  try {
    const session = getSession();
    if (!session) throw new Error('No session');

    const { accountId, year } = currentContext;
    const collectionMap = {
      income: 'system_income_categories',
      expenses: 'system_exp_categories',
      assets: 'system_asset_categories',
      liabilities: 'system_liability_categories'
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
    return items.find((item) => item.code === categoryCode);
  } catch (err) {
    console.error('Error fetching category data:', err);
    return null;
  }
}

window.saveReportItem = async function(section, categoryCode) {
  try {
    const t = window.i18n.t.bind(window.i18n);
    const amountInput = document.getElementById('editAmount');
    const amount = parseFloat(amountInput.value) || 0;

    if (amount < 0) {
      showModalError(t('report.modal.negativeAmount'));
      return;
    }

    const saveBtn = document.querySelector('.btn-save');
    const saveBtnLabel = saveBtn?.querySelector('.btn-label');
    if (saveBtn) saveBtn.disabled = true;
    if (saveBtnLabel) saveBtnLabel.textContent = t('report.modal.saving');

    const session = getSession();
    if (!session) throw new Error('No session');

    const { accountId, year } = currentContext;
    const collectionMap = {
      income: 'system_income_categories',
      expenses: 'system_exp_categories',
      assets: 'system_asset_categories',
      liabilities: 'system_liability_categories'
    };

    const collection = collectionMap[section];
    const basePath = `accounts/${accountId}/fin_statements/${year}`;
    const docId = categoryCode.replace(/\./g, '_');
    const template = getCategoryTemplate(section, categoryCode);

    const response = await fetch(`${API_URL}/api/firestore/set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        path: `${basePath}/${collection}`,
        docId,
        data: {
          code: categoryCode,
          label: template.label,
          group: template.group,
          idx: template.idx,
          amount
        },
        authToken: session.authToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save');
    }

    console.log('Saved:', categoryCode, amount);
    showModalSuccess(t('report.modal.saved'));

    setTimeout(() => {
      window.closeReportEditModal();
      renderFinancialReport(accountId, year);
    }, 500);
  } catch (err) {
    const t = window.i18n.t.bind(window.i18n);
    console.error('Error saving:', err);
    showModalError(t('report.modal.saveError'));

    const saveBtn = document.querySelector('.btn-save');
    const saveBtnLabel = saveBtn?.querySelector('.btn-label');
    if (saveBtn) saveBtn.disabled = false;
    if (saveBtnLabel) saveBtnLabel.textContent = t('common.save');
  }
};

window.deleteReportItem = async function(section, categoryCode) {
  const confirmed = confirm(window.i18n.t('report.modal.resetConfirm'));
  if (!confirmed) return;

  const amountInput = document.getElementById('editAmount');
  if (amountInput) amountInput.value = '0';

  await window.saveReportItem(section, categoryCode);
};

window.closeReportEditModal = function() {
  const modal = document.getElementById('reportEditModal');
  if (modal) modal.remove();
};

function showModalError(message) {
  const errorEl = document.getElementById('modalError');
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  setTimeout(() => errorEl.classList.add('hidden'), 3000);
}

function showModalSuccess(message) {
  const successEl = document.getElementById('modalSuccess');
  if (!successEl) return;
  successEl.textContent = message;
  successEl.classList.remove('hidden');
}

function getCategoryTemplate(section, code) {
  const templates = {
    income: [
      { idx: 1, code: 'A.1', group: 'Employment', label: 'Salary #1' },
      { idx: 2, code: 'A.2', group: 'Employment', label: 'Salary #2' },
      { idx: 3, code: 'A.3', group: 'Employment', label: 'Other earned income' },
      { idx: 4, code: 'C.1', group: 'Assets', label: 'Business (NET)' },
      { idx: 5, code: 'C.2', group: 'Assets', label: 'Real estate (NET)' },
      { idx: 6, code: 'C.3', group: 'Assets', label: 'Other passive income' },
      { idx: 7, code: 'E.1', group: 'Portfolio', label: 'Long-term investing' },
      { idx: 8, code: 'E.2', group: 'Portfolio', label: 'Investment projects' },
      { idx: 9, code: 'E.3', group: 'Portfolio', label: 'Other portfolio income' }
    ],
    expenses: [
      { idx: 1, code: '0.1', group: 'Preliminary', label: 'Investments' },
      { idx: 2, code: '0.2', group: 'Preliminary', label: 'Savings' },
      { idx: 3, code: '0.3', group: 'Preliminary', label: 'Charity' },
      { idx: 4, code: '0.4', group: 'Preliminary', label: 'Pocket money' },
      { idx: 5, code: '0.5', group: 'Preliminary', label: 'Entertainment' },
      { idx: 6, code: '0.6', group: 'Preliminary', label: 'Taxes' },
      { idx: 7, code: '1.1', group: 'Main', label: 'Food' },
      { idx: 8, code: '1.2', group: 'Main', label: 'Marriage' },
      { idx: 9, code: '1.3', group: 'Main', label: 'Housing (installment/rent + utilities)' },
      { idx: 10, code: '1.4', group: 'Main', label: 'Wardrobe' },
      { idx: 11, code: '1.5', group: 'Main', label: 'Transport (incl. installments)' },
      { idx: 12, code: '1.6', group: 'Main', label: 'Communications' },
      { idx: 13, code: '1.7', group: 'Main', label: 'Fitness' },
      { idx: 14, code: '1.8', group: 'Main', label: 'Hobbies' },
      { idx: 15, code: '1.9', group: 'Main', label: 'Health' },
      { idx: 16, code: '1.10', group: 'Main', label: 'Children' },
      { idx: 18, code: '1.12', group: 'Main', label: 'Other installments' },
      { idx: 19, code: '1.13', group: 'Main', label: 'Personal loans' },
      { idx: 20, code: '1.14', group: 'Main', label: 'Other debts' },
      { idx: 21, code: '1.15', group: 'Main', label: 'Other expenses' },
      { idx: 22, code: '1.16', group: 'Main', label: 'Other expenses' }
    ],
    assets: [
      { idx: 1, code: 'N.1', group: 'Assets', label: 'Bank accounts' },
      { idx: 2, code: 'N.2', group: 'Assets', label: 'Digital assets' },
      { idx: 3, code: 'N.3', group: 'Assets', label: 'Investment certificates' },
      { idx: 4, code: 'N.4', group: 'Assets', label: 'Accounts receivable' },
      { idx: 5, code: 'N.5', group: 'Assets', label: 'Business (valuation, NET)' },
      { idx: 6, code: 'N.6', group: 'Assets', label: 'Real estate (minus installments)' },
      { idx: 7, code: 'N.7', group: 'Assets', label: 'Other assets' },
      { idx: 8, code: 'P.1', group: 'Luxury', label: 'Home(s)' },
      { idx: 9, code: 'P.2', group: 'Luxury', label: 'Car(s)' },
      { idx: 10, code: 'P.3', group: 'Luxury', label: 'Other luxury' }
    ],
    liabilities: [
      { idx: 1, code: 'T.1', group: 'Liabilities', label: 'Housing installments' },
      { idx: 2, code: 'T.2', group: 'Liabilities', label: 'Transport installments' },
      { idx: 3, code: 'T.3', group: 'Liabilities', label: 'Other installments' },
      { idx: 4, code: 'T.4', group: 'Liabilities', label: 'Personal loans' },
      { idx: 5, code: 'T.5', group: 'Liabilities', label: 'Other debts' },
      { idx: 6, code: 'T.6', group: 'Liabilities', label: 'Other liabilities' }
    ]
  };

  const lang = window.i18n?.getCurrentLanguage?.() || 'ru';
  const localize = {
    Employment: { ru: 'Наемный доход', en: 'Employment' },
    Assets: { ru: 'Активы', en: 'Assets' },
    Portfolio: { ru: 'Портфель', en: 'Portfolio' },
    Preliminary: { ru: 'Предварительные', en: 'Preliminary' },
    Main: { ru: 'Основные', en: 'Main' },
    Luxury: { ru: 'Роскошь', en: 'Luxury' },
    Liabilities: { ru: 'Пассивы', en: 'Liabilities' },
    'Salary #1': { ru: 'Зарплата #1', en: 'Salary #1' },
    'Salary #2': { ru: 'Зарплата #2', en: 'Salary #2' },
    'Other salary': { ru: 'Прочий наемный доход', en: 'Other earned income' },
    'Other salary income': { ru: 'Прочий наемный доход', en: 'Other earned income' },
    'Other employment income': { ru: 'Прочий наемный доход', en: 'Other earned income' },
    'Other earned income': { ru: 'Прочий наемный доход', en: 'Other earned income' },
    'Business (NET)': { ru: 'Бизнес (NET)', en: 'Business (NET)' },
    'Real estate (NET)': { ru: 'Недвижимость (NET)', en: 'Real estate (NET)' },
    'Other assets': { ru: 'Прочие активы', en: 'Other assets' },
    'Other asset income': { ru: 'Прочий пассивный доход', en: 'Other passive income' },
    'Other passive income': { ru: 'Прочий пассивный доход', en: 'Other passive income' },
    'Bank products': { ru: 'Долгосрочное инвестирование', en: 'Long-term investing' },
    Dividends: { ru: 'Инвестиционные проекты', en: 'Investment projects' },
    Royalties: { ru: 'Прочий портфельный доход', en: 'Other portfolio income' },
    'Other royalties': { ru: 'Прочий портфельный доход', en: 'Other portfolio income' },
    'Long-term investing': { ru: 'Долгосрочное инвестирование', en: 'Long-term investing' },
    'Investment projects': { ru: 'Инвестиционные проекты', en: 'Investment projects' },
    'Other portfolio income': { ru: 'Прочий портфельный доход', en: 'Other portfolio income' },
    Investments: { ru: 'Инвестиции', en: 'Investments' },
    Savings: { ru: 'Сбережения', en: 'Savings' },
    Charity: { ru: 'Благотворительность', en: 'Charity' },
    'Pocket money': { ru: 'Карман', en: 'Pocket money' },
    Entertainment: { ru: 'Развлечения', en: 'Entertainment' },
    Taxes: { ru: 'Налоги', en: 'Taxes' },
    Food: { ru: 'Питание', en: 'Food' },
    Marriage: { ru: 'Супружество', en: 'Marriage' },
    'Housing (installment/rent + utilities)': { ru: 'Жилье (рассрочка/рент + КУ)', en: 'Housing (installment/rent + utilities)' },
    Wardrobe: { ru: 'Гардероб', en: 'Wardrobe' },
    Transport: { ru: 'Транспорт (вкл. рассрочки)', en: 'Transport (incl. installments)' },
    'Transport (incl. installments)': { ru: 'Транспорт (вкл. рассрочки)', en: 'Transport (incl. installments)' },
    Communications: { ru: 'Коммуникации', en: 'Communications' },
    Fitness: { ru: 'Фитнес', en: 'Fitness' },
    Hobbies: { ru: 'Хобби', en: 'Hobbies' },
    Health: { ru: 'Здоровье', en: 'Health' },
    Children: { ru: 'Дети', en: 'Children' },
    'Transport installments': { ru: 'Транспорт (вкл. рассрочки)', en: 'Transport (incl. installments)' },
    'Other installments': { ru: 'Прочие рассрочки', en: 'Other installments' },
    'Personal loans': { ru: 'Персональные займы', en: 'Personal loans' },
    'Other debts': { ru: 'Прочие задолженности', en: 'Other debts' },
    'Other expenses': { ru: 'Прочие расходы', en: 'Other expenses' },
    'Bank accounts': { ru: 'Банковские счета', en: 'Bank accounts' },
    'Digital assets': { ru: 'Наличные д/с', en: 'Digital assets' },
    'Investment certificates': { ru: 'Инвестиционные сертификаты', en: 'Investment certificates' },
    'Accounts receivable': { ru: 'Дебиторская задолженность', en: 'Accounts receivable' },
    'Business (valuation, NET)': { ru: 'Бизнес (оценка, NET)', en: 'Business (valuation, NET)' },
    'Real estate (minus installments)': { ru: 'Недвижимость (минус рассрочка)', en: 'Real estate (minus installments)' },
    'Home(s)': { ru: 'Дом(а)', en: 'Home(s)' },
    'Car(s)': { ru: 'Автомобиль(и)', en: 'Car(s)' },
    'Other luxury': { ru: 'Прочая роскошь', en: 'Other luxury' },
    'Housing installments': { ru: 'Жилищные рассрочки', en: 'Housing installments' },
    'Other liabilities': { ru: 'Прочие пассивы', en: 'Other liabilities' }
  };

  const template = templates[section]?.find((item) => item.code === code);
  if (!template) return null;

  return {
    ...template,
    group: localize[template.group]?.[lang] || template.group,
    label: localize[template.label]?.[lang] || template.label
  };
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    window.closeReportEditModal();
  }
});
