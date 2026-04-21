/* /webapp/js/20L/services/productService.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - CRUD operations for products
// - Centralized API calls

import { getSession } from '../../js/session.js';
import { API_URL } from '../../js/config.js';

function authHeaders(session) {
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(session?.authToken ? { Authorization: `Bearer ${session.authToken}` } : {})
  };
}

function withAuthTokenQuery(url, session) {
  const nextUrl = new URL(url, window.location.origin);
  if (session?.authToken && !nextUrl.searchParams.has('authToken')) {
    nextUrl.searchParams.set('authToken', session.authToken);
  }
  return nextUrl.toString();
}

/**
 * Get all products for account
 */
export async function getProducts(accountId) {
  try {
    const session = getSession();
    if (!session?.authToken) throw new Error('No active session');
    
    console.log('📋 Fetching products...');
    
    const response = await fetch(
      withAuthTokenQuery(`${API_URL}/api/20L/products?accountId=${encodeURIComponent(accountId)}`, session),
      {
        method: 'GET',
        headers: authHeaders(session)
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const result = await response.json();
    console.log(`✅ Fetched ${result.products.length} products`);
    
    return result.products;
    
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    throw err;
  }
}

/**
 * Create new product
 */
export async function createProduct(accountId, productData) {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');
    
    console.log('➕ Creating product...');
    
    const response = await fetch(`${API_URL}/api/20L/products/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        accountId,
        authToken: session.authToken,
        ...productData
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    
    const result = await response.json();
    console.log('✅ Product created:', result.product.id);
    
    return result.product;
    
  } catch (err) {
    console.error('❌ Error creating product:', err);
    throw err;
  }
}

/**
 * Update product
 */
export async function updateProduct(accountId, productId, updates) {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');
    
    console.log('✏️ Updating product...');
    
    const response = await fetch(`${API_URL}/api/20L/products/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        accountId,
        authToken: session.authToken,
        productId,
        ...updates
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    
    console.log('✅ Product updated');
    
    return true;
    
  } catch (err) {
    console.error('❌ Error updating product:', err);
    throw err;
  }
}

/**
 * Delete product (soft delete)
 */
export async function deleteProduct(accountId, productId) {
  try {
    const session = getSession();
    if (!session) throw new Error('No active session');
    
    console.log('🗑️ Deleting product...');
    
    const response = await fetch(`${API_URL}/api/20L/products/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        accountId,
        authToken: session.authToken,
        productId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    
    console.log('✅ Product deleted');
    
    return true;
    
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    throw err;
  }
}
