/* /webapp/js/20L/components/productSelector.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - Product selection interface
// - Create first product form

import { getProducts, createProduct } from '../services/productService.js';
import { t } from '../../utils/i18n.js';

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
        <h3>${t('20L.product.createFirst')}</h3>
        <p class="subtitle">${t('20L.product.createFirstSubtitle')}</p>
      </div>
      
      <div class="product-form">
        <div class="input-group">
          <label for="productName">${t('20L.product.name')} *</label>
          <input 
            type="text" 
            id="productName" 
            placeholder="${t('20L.product.namePlaceholder')}"
            required
          >
        </div>
        
        <div class="input-group">
          <label for="productComment">${t('20L.product.comment')}</label>
          <textarea 
            id="productComment" 
            placeholder="${t('20L.product.commentPlaceholder')}"
            rows="3"
          ></textarea>
        </div>
        
        <button onclick="window.saveFirstProduct('${accountId}')" class="btn btn-primary">
          ➕ ${t('20L.product.create')}
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
        <h3>${t('20L.product.selector')}</h3>
        <button onclick="window.showCreateProductModal('${accountId}')" class="btn btn-secondary btn-small">
          ➕ ${t('20L.product.addNew')}
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
    alert(`✅ ${t('20L.product.created')}`);
    
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