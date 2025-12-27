/* /webapp/20L/components/counterpartyModal.js v1.0.2 */
// CHANGELOG v1.0.2:
// - FIXED: Import i18n from ../i18n.js (module-local)
// CHANGELOG v1.0.1:
// - CHANGED: Classification field from input to select dropdown
// - ADDED: Predefined classification options (ПП, IC, Lead, посетитель, покупатель, клиент, приверженец)
// CHANGELOG v1.0.0:
// - Initial release
// - Create/Edit counterparty modal
// - Cycle stage progression
// - Status management

import { getCounterparties, createCounterparty, updateCounterparty, deleteCounterparty, moveToNextStage } from '../services/counterpartyService.js';
import { renderDashboard } from './dashboard.js';
import { t } from '../i18n.js';

/**
 * Show create counterparty modal
 */
window.showCreateCounterpartyModal = function(accountId, productId) {
  const modal = createCounterpartyModal(accountId, productId, null);
  document.body.appendChild(modal);
  
  // Focus name input
  setTimeout(() => {
    const nameInput = document.getElementById('counterpartyName');
    if (nameInput) nameInput.focus();
  }, 100);
};

/**
 * Open counterparty modal (edit)
 */
window.openCounterpartyModal = async function(accountId, productId, counterpartyId) {
  try {
    // Fetch counterparty data
    const counterparties = await getCounterparties(accountId, { productId });
    const counterparty = counterparties.find(cp => cp.id === counterpartyId);
    
    if (!counterparty) {
      alert(t('error.notFound'));
      return;
    }
    
    const modal = createCounterpartyModal(accountId, productId, counterparty);
    document.body.appendChild(modal);
    
  } catch (err) {
    console.error('❌ Error opening counterparty modal:', err);
    alert(t('error.loadingData'));
  }
};

/**
 * Create counterparty modal HTML
 */
function createCounterpartyModal(accountId, productId, counterparty = null) {
  const isEdit = !!counterparty;
  const modal = document.createElement('div');
  modal.className = 'modal counterparty-modal';
  modal.id = 'counterpartyModal';
  
  const statusOptions = ['0', 'IC', 'Lead', 'Sales'];
  const cycleStages = Array.from({ length: 11 }, (_, i) => i + 1);
  
  // ✅ Classification options
  const classificationOptions = [
    { value: '', label: '—' },
    { value: 'ПП', label: 'ПП' },
    { value: 'IC', label: 'IC' },
    { value: 'Lead', label: 'Lead' },
    { value: 'посетитель', label: 'посетитель' },
    { value: 'покупатель', label: 'покупатель' },
    { value: 'клиент', label: 'клиент' },
    { value: 'приверженец', label: 'приверженец' }
  ];
  
  modal.innerHTML = `
    <div class="modal-overlay" onclick="window.closeCounterpartyModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>${isEdit ? t('20L.counterparty.edit') : t('20L.counterparty.create')}</h3>
        <button onclick="window.closeCounterpartyModal()" class="btn-close">×</button>
      </div>
      
      <div class="modal-body">
        <form id="counterpartyForm" onsubmit="event.preventDefault(); window.saveCounterparty('${accountId}', '${productId}', ${isEdit ? `'${counterparty.id}'` : 'null'})">
          
          <!-- Name -->
          <div class="input-group">
            <label for="counterpartyName">${t('20L.counterparty.name')} *</label>
            <input 
              type="text" 
              id="counterpartyName" 
              value="${isEdit ? counterparty.name : ''}"
              placeholder="${t('20L.counterparty.namePlaceholder')}"
              required
            >
          </div>
          
          <!-- Status & Stage (read-only for new, editable for existing) -->
          <div class="form-row">
            <div class="input-group">
              <label for="counterpartyStatus">${t('20L.counterparty.status')}</label>
              <select id="counterpartyStatus" ${!isEdit ? 'disabled' : ''}>
                ${statusOptions.map(status => `
                  <option value="${status}" ${isEdit && counterparty.status20L === status ? 'selected' : ''}>
                    ${t(`20L.status.${status.toLowerCase()}`)}
                  </option>
                `).join('')}
              </select>
              ${!isEdit ? `<small>${t('20L.counterparty.statusAuto')}</small>` : ''}
            </div>
            
            <div class="input-group">
              <label for="counterpartyCycleStage">${t('20L.counterparty.cycleStage')}</label>
              <select id="counterpartyCycleStage" ${!isEdit ? 'disabled' : ''}>
                ${cycleStages.map(stage => `
                  <option value="${stage}" ${isEdit && Number(counterparty.cycleStage) === stage ? 'selected' : ''}>
                    ${stage}. ${t(`20L.cycle.${stage}`)}
                  </option>
                `).join('')}
              </select>
              ${!isEdit ? `<small>${t('20L.counterparty.cycleStageAuto')}</small>` : ''}
            </div>
          </div>
          
          <!-- Classification & Source -->
          <div class="form-row">
            <div class="input-group">
              <label for="counterpartyClassification">${t('20L.counterparty.classification')}</label>
              <select id="counterpartyClassification">
                ${classificationOptions.map(opt => `
                  <option value="${opt.value}" ${isEdit && counterparty.classification === opt.value ? 'selected' : ''}>
                    ${opt.label}
                  </option>
                `).join('')}
              </select>
            </div>
            
            <div class="input-group">
              <label for="counterpartySource">${t('20L.counterparty.source')}</label>
              <input 
                type="text" 
                id="counterpartySource"
                value="${isEdit && counterparty.source ? counterparty.source : ''}"
                placeholder="${t('20L.counterparty.sourcePlaceholder')}"
              >
            </div>
          </div>
          
          <!-- Comment -->
          <div class="input-group">
            <label for="counterpartyComment">${t('20L.counterparty.comment')}</label>
            <textarea 
              id="counterpartyComment" 
              rows="3"
              placeholder="${t('20L.counterparty.commentPlaceholder')}"
            >${isEdit && counterparty.comment ? counterparty.comment : ''}</textarea>
          </div>
          
          <!-- Action Buttons -->
          <div class="form-actions">
            ${isEdit ? `
              <button type="button" onclick="window.moveCounterpartyToNextStage('${accountId}', '${productId}', '${counterparty.id}')" class="btn btn-secondary">
                📈 ${t('20L.counterparty.nextStage')}
              </button>
            ` : ''}
            
            <button type="submit" class="btn btn-primary">
              💾 ${t('common.save')}
            </button>
            
            ${isEdit ? `
              <button type="button" onclick="window.deleteCounterpartyConfirm('${accountId}', '${productId}', '${counterparty.id}')" class="btn btn-danger">
                🗑️ ${t('common.delete')}
              </button>
            ` : ''}
          </div>
          
          <div id="counterpartyError" class="error hidden"></div>
          <div id="counterpartySuccess" class="success hidden"></div>
        </form>
      </div>
    </div>
  `;
  
  return modal;
}

/**
 * Save counterparty (create or update)
 */
window.saveCounterparty = async function(accountId, productId, counterpartyId) {
  try {
    const form = document.getElementById('counterpartyForm');
    const errorEl = document.getElementById('counterpartyError');
    const successEl = document.getElementById('counterpartySuccess');
    
    // Get form data
    const data = {
      name: document.getElementById('counterpartyName').value.trim(),
      classification: document.getElementById('counterpartyClassification').value,
      source: document.getElementById('counterpartySource').value.trim(),
      comment: document.getElementById('counterpartyComment').value.trim(),
      productId
    };
    
    // Validate
    if (!data.name) {
      errorEl.textContent = t('20L.counterparty.nameRequired');
      errorEl.classList.remove('hidden');
      return;
    }
    
    // Hide errors
    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');
    
    // Create or update
    if (counterpartyId) {
      // Update (include status and stage if changed)
      data.status20L = document.getElementById('counterpartyStatus').value;
      data.cycleStage = document.getElementById('counterpartyCycleStage').value;
      
      await updateCounterparty(accountId, counterpartyId, data);
      
      successEl.textContent = t('20L.counterparty.updated');
      successEl.classList.remove('hidden');
    } else {
      // Create (status and stage auto-assigned)
      await createCounterparty(accountId, data);
      
      successEl.textContent = t('20L.counterparty.created');
      successEl.classList.remove('hidden');
    }
    
    // Close and reload
    setTimeout(async () => {
      window.closeCounterpartyModal();
      await renderDashboard(accountId, productId);
    }, 1000);
    
  } catch (err) {
    console.error('❌ Error saving counterparty:', err);
    const errorEl = document.getElementById('counterpartyError');
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
    }
  }
};

/**
 * Move counterparty to next stage
 */
window.moveCounterpartyToNextStage = async function(accountId, productId, counterpartyId) {
  try {
    const currentStage = document.getElementById('counterpartyCycleStage').value;
    const currentStatus = document.getElementById('counterpartyStatus').value;
    
    if (Number(currentStage) >= 11) {
      alert(t('20L.counterparty.maxStage'));
      return;
    }
    
    await moveToNextStage(accountId, counterpartyId, currentStage, currentStatus);
    
    alert(t('20L.counterparty.movedToNextStage'));
    
    window.closeCounterpartyModal();
    await renderDashboard(accountId, productId);
    
  } catch (err) {
    console.error('❌ Error moving to next stage:', err);
    alert(t('error.generic'));
  }
};

/**
 * Delete counterparty (with confirmation)
 */
window.deleteCounterpartyConfirm = async function(accountId, productId, counterpartyId) {
  const confirmed = confirm(t('20L.counterparty.deleteConfirm'));
  if (!confirmed) return;
  
  try {
    await deleteCounterparty(accountId, counterpartyId);
    
    alert(t('20L.counterparty.deleted'));
    
    window.closeCounterpartyModal();
    await renderDashboard(accountId, productId);
    
  } catch (err) {
    console.error('❌ Error deleting counterparty:', err);
    alert(t('error.generic'));
  }
};

/**
 * Close modal
 */
window.closeCounterpartyModal = function() {
  const modal = document.getElementById('counterpartyModal');
  if (modal) modal.remove();
};

// Escape key handler
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeCounterpartyModal();
  }
});