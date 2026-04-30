/* /webapp/js/cabinet/reports/reportManager.js v1.3.1 */
// CRUD management for financial report snapshot items

import { getSession } from '../js/session.js';
import { renderFinancialReport } from './financialReport.js';
import {
  buildSnapshotDocument,
  ensureSnapshotCollections,
  fetchFirestoreCollection,
  getFinancialStatementInputItems,
  getLocalizedLabel,
  getSnapshotCollectionName,
  getGroupLabelKey,
  getItemGroupCode,
  reportCodeToDocId,
  setFirestoreDocument
} from './inputItemsReference.js';

const AMOUNT_STEP = 500;

let currentContext = {
  accountId: null,
  year: null,
  referenceItems: []
};
let isOpeningModal = false;

export function initReportManager(accountId, year, referenceItems = []) {
  currentContext.accountId = accountId;
  currentContext.year = year;
  currentContext.referenceItems = Array.isArray(referenceItems) ? referenceItems : [];
}

export async function showEditModal(section, categoryCode) {
  if (isOpeningModal || document.getElementById('reportEditModal')) {
    return;
  }

  try {
    isOpeningModal = true;
    const template = await getCategoryTemplate(section, categoryCode);
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
  } finally {
    isOpeningModal = false;
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
        <button onclick="window.closeReportEditModal()" class="btn-close">&times;</button>
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
    await ensureReferenceContext(session);

    const collection = getSnapshotCollectionName(section);
    const basePath = `accounts/${accountId}/fin_statements/${year}`;
    const items = await fetchFirestoreCollection(`${basePath}/${collection}`, session.authToken);
    return items.find((item) => item.code === categoryCode) || null;
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
    const referenceItems = await ensureReferenceContext(session);
    const template = getCategoryTemplateFromList(referenceItems, section, categoryCode);
    if (!template) {
      throw new Error(`Unknown category code: ${categoryCode}`);
    }
    const existingData = await fetchCategoryData(section, categoryCode);

    const basePath = `accounts/${accountId}/fin_statements/${year}`;
    const collection = getSnapshotCollectionName(section);
    const docId = reportCodeToDocId(categoryCode);

    await setFirestoreDocument(
      `${basePath}/${collection}`,
      docId,
      buildSnapshotDocument(template, amount, existingData?.createdAt),
      session.authToken
    );

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

async function getCategoryTemplate(section, code) {
  const session = getSession();
  const referenceItems = await ensureReferenceContext(session);
  return getCategoryTemplateFromList(referenceItems, section, code);
}

function getCategoryTemplateFromList(referenceItems, section, code) {
  const item = referenceItems.find((entry) => entry.reportSection === section && entry.reportCode === code);
  if (!item) return null;

  const t = window.i18n?.t?.bind(window.i18n);
  const lang = window.i18n?.getCurrentLanguage?.() || document.documentElement.lang || 'ru';
  const groupKey = getGroupLabelKey(item);
  const translatedGroup = typeof t === 'function' ? t(groupKey) : groupKey;

  return {
    ...item,
    code: item.reportCode,
    idx: item.idx,
    groupCode: getItemGroupCode(item.reportCode),
    label: getLocalizedLabel(item.label, lang),
    group: translatedGroup !== groupKey ? translatedGroup : item.reportSubsection
  };
}

async function ensureReferenceContext(session) {
  if (Array.isArray(currentContext.referenceItems) && currentContext.referenceItems.length) {
    return currentContext.referenceItems;
  }

  const referenceItems = await getFinancialStatementInputItems(session.authToken);
  await ensureSnapshotCollections(currentContext.accountId, currentContext.year, session.authToken, referenceItems);
  currentContext.referenceItems = referenceItems;
  return referenceItems;
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    window.closeReportEditModal();
  }
});
