/* /webapp/20L/components/productSelector.js v1.0.2 */
// CHANGELOG v1.0.2:
// - FIXED: Import i18n from ../i18n.js (module-local)
// CHANGELOG v1.0.1:
// - FIXED: Added missing window.showCreateProductModal function
// - FIXED: Added window.editProduct function
// - Modal-based product creation for existing products list
// CHANGELOG v1.0.0:
// - Initial release
// - Product selection interface
// - Create first product form

import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService.js';
import { t } from '../i18n.js';

/**
 * Render product selector
 */
export async function renderProductSelector(accountId) {
  try {
    console.log('📦 Rendering product selector...');
    
    const container = document.getElementById('dashboardContent');
    if (!container) {
      console.error('❌ Container not found');
      return;
    }
    
    // Show loading
    container.innerHTML = `
      <div class="product-selector-loading">
        <div class="spinner"></div>
        <p>${t('common.loading')}</p>
      </div>
    `;
    
    // Fetch products
    const products = await getProducts(accountId);
    
    // No products → show create form
    if (products.length === 0) {
      renderCreateProductForm(container, accountId);
      return;
    }
    
    // Has products → show selector
    renderProductList(container, accountId, products);
    
  } catch (err) {
    console.error('❌ Error rendering product selector:', err);
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
 * Render create product form (first time)
 */
function renderCreateProductForm(container, accountId) {
  container.innerHTML = `
    <div class="product-selector">
      <div class="product-selector-header">
        <h3>${t('20L.productSelector.createFirst')}</h3>
        <p class="subtitle">${t('20L.productSelector.createFirstDesc')}</p>
      </div>
      
      <div class="product-form">
        <div class="input-group">
          <label for="productName">${t('20L.product.name')} *</label>
          <input 
            type="text" 
            id="productName" 
            placeholder="${t('20L.product.nameRequired')}"
            required
          >
        </div>
        
        <div class="input-group">
          <label for="productComment">${t('20L.product.comment')}</label>
          <textarea 
            id="productComment" 
            placeholder="${t('20L.product.commentOptional')}"
            rows="3"
          ></textarea>
        </div>
        
        <button onclick="window.saveFirstProduct('${accountId}')" class="btn btn-primary">
          ➕ ${t('20L.product.save')}
        </button>
        
        <div id="productError" class="error hidden"></div>
      </div>
    </div>
  `;
}

/**
 * Render product list
 */
function renderProductList(container, accountId, products) {
  container.innerHTML = `
    <div class="product-selector">
      <div class="product-selector-header">
        <h3>${t('20L.productSelector.title')}</h3>
        <button onclick="window.showCreateProductModal('${accountId}')" class="btn btn-secondary btn-small">
          ➕ ${t('20L.productSelector.addProduct')}
        </button>
      </div>
      
      <div class="product-list">
        ${products.map(product => `
          <div class="product-card" onclick="window.selectProduct('${accountId}', '${product.id}')">
            <div class="product-info">
              <h4 class="product-name">${product.name}</h4>
              ${product.comment ? `<p class="product-comment">${product.comment}</p>` : ''}
            </div>
            <div class="product-actions">
              <button 
                onclick="event.stopPropagation(); window.editProduct('${accountId}', '${product.id}')" 
                class="btn-icon"
                title="${t('common.edit')}"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z"/>
                </svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Save first product (global handler)
 */
window.saveFirstProduct = async function(accountId) {
  try {
    const nameInput = document.getElementById('productName');
    const commentInput = document.getElementById('productComment');
    const errorEl = document.getElementById('productError');
    
    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();
    
    // Validate
    if (!name) {
      errorEl.textContent = t('20L.product.nameRequired');
      errorEl.classList.remove('hidden');
      return;
    }
    
    // Hide error
    errorEl.classList.add('hidden');
    
    // Create product
    await createProduct(accountId, { name, comment });
    
    // Reload selector
    await renderProductSelector(accountId);
    
    // Show success
    alert(`✅ Продукт создан!`);
    
  } catch (err) {
    console.error('❌ Error saving product:', err);
    const errorEl = document.getElementById('productError');
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
    }
  }
};

/**
 * Show create product modal (for adding new products when list exists)
 */
window.showCreateProductModal = function(accountId) {
  console.log('➕ Opening create product modal');
  
  const modal = createProductModal(accountId, null);
  document.body.appendChild(modal);
  
  // Focus name input
  setTimeout(() => {
    const nameInput = document.getElementById('modalProductName');
    if (nameInput) nameInput.focus();
  }, 100);
};

/**
 * Edit product
 */
window.editProduct = async function(accountId, productId) {
  try {
    console.log('✏️ Opening edit product modal:', productId);
    
    // Fetch product data
    const products = await getProducts(accountId);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      alert('❌ Продукт не найден');
      return;
    }
    
    const modal = createProductModal(accountId, product);
    document.body.appendChild(modal);
    
  } catch (err) {
    console.error('❌ Error opening edit modal:', err);
    alert('❌ Ошибка загрузки продукта');
  }
};

/**
 * Create product modal HTML
 */
function createProductModal(accountId, product = null) {
  const isEdit = !!product;
  const modal = document.createElement('div');
  modal.className = 'modal product-modal';
  modal.id = 'productModal';
  
  modal.innerHTML = `
    <div class="modal-overlay" onclick="window.closeProductModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>${isEdit ? '✏️ Редактировать продукт' : '➕ Добавить продукт'}</h3>
        <button onclick="window.closeProductModal()" class="btn-close">×</button>
      </div>
      
      <div class="modal-body">
        <form id="productModalForm" onsubmit="event.preventDefault(); window.saveProduct('${accountId}', ${isEdit ? `'${product.id}'` : 'null'})">
          
          <div class="input-group">
            <label for="modalProductName">${t('20L.product.name')} *</label>
            <input 
              type="text" 
              id="modalProductName" 
              value="${isEdit ? product.name : ''}"
              placeholder="${t('20L.product.nameRequired')}"
              required
            >
          </div>
          
          <div class="input-group">
            <label for="modalProductComment">${t('20L.product.comment')}</label>
            <textarea 
              id="modalProductComment" 
              rows="3"
              placeholder="${t('20L.product.commentOptional')}"
            >${isEdit && product.comment ? product.comment : ''}</textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              💾 ${t('common.save')}
            </button>
            
            ${isEdit ? `
              <button type="button" onclick="window.deleteProductConfirm('${accountId}', '${product.id}')" class="btn btn-danger">
                🗑️ ${t('common.delete')}
              </button>
            ` : ''}
          </div>
          
          <div id="productModalError" class="error hidden"></div>
          <div id="productModalSuccess" class="success hidden"></div>
        </form>
      </div>
    </div>
  `;
  
  return modal;
}

/**
 * Save product (create or update)
 */
window.saveProduct = async function(accountId, productId) {
  try {
    const errorEl = document.getElementById('productModalError');
    const successEl = document.getElementById('productModalSuccess');
    
    const name = document.getElementById('modalProductName').value.trim();
    const comment = document.getElementById('modalProductComment').value.trim();
    
    // Validate
    if (!name) {
      errorEl.textContent = t('20L.product.nameRequired');
      errorEl.classList.remove('hidden');
      return;
    }
    
    // Hide errors
    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');
    
    // Create or update
    if (productId) {
      await updateProduct(accountId, productId, { name, comment });
      successEl.textContent = '✅ Продукт обновлён!';
    } else {
      await createProduct(accountId, { name, comment });
      successEl.textContent = '✅ Продукт создан!';
    }
    
    successEl.classList.remove('hidden');
    
    // Close and reload
    setTimeout(async () => {
      window.closeProductModal();
      await renderProductSelector(accountId);
    }, 1000);
    
  } catch (err) {
    console.error('❌ Error saving product:', err);
    const errorEl = document.getElementById('productModalError');
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
    }
  }
};

/**
 * Delete product (with confirmation)
 */
window.deleteProductConfirm = async function(accountId, productId) {
  const confirmed = confirm('⚠️ Удалить продукт?\n\nЭто действие нельзя отменить.');
  if (!confirmed) return;
  
  try {
    await deleteProduct(accountId, productId);
    
    alert('✅ Продукт удалён');
    
    window.closeProductModal();
    await renderProductSelector(accountId);
    
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    alert('❌ Ошибка удаления');
  }
};

/**
 * Close product modal
 */
window.closeProductModal = function() {
  const modal = document.getElementById('productModal');
  if (modal) modal.remove();
};

/**
 * Select product and navigate to dashboard
 */
window.selectProduct = async function(accountId, productId) {
  console.log('📦 Selected product:', productId);
  
  // Save selected product to sessionStorage
  sessionStorage.setItem('selectedProductId', productId);
  
  // Navigate to dashboard
  const { renderDashboard } = await import('./dashboard.js');
  await renderDashboard(accountId, productId);
};

// Escape key handler for product modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeProductModal();
  }
});