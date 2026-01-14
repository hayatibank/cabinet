/* /webapp/js/components/hayatiIdDisplay.js v2.0.0 */
// CHANGELOG v2.0.0:
// - REDESIGN: Compact display like email (one line)
// - Small copy icon button (no text)
// - Removed info text and label
// CHANGELOG v1.0.1:
// - FIXED: Safe translation fallback (handles i18n not ready edge case)
// CHANGELOG v1.0.0:
// - Initial release
// - Display Hayati ID in cabinet
// - Copy to clipboard functionality
// - i18n support

/**
 * Render Hayati ID in cabinet
 * @param {Object} userData - User data object with hayatiId field
 */
export function renderHayatiIdInCabinet(userData) {
  if (!userData || !userData.hayatiId) {
    console.warn('⚠️ No Hayati ID found in userData');
    return;
  }

  const hayatiId = userData.hayatiId;
  const tier = userData.hayatiIdTier || 'standard';

  console.log(`🆔 Rendering Hayati ID: ${hayatiId} (${tier})`);

  // Find insert position (before user email)
  const userEmailEl = document.querySelector('.user-email');
  if (!userEmailEl) {
    console.error('❌ Cannot find .user-email element');
    return;
  }

  // Check if already rendered
  const existingContainer = document.querySelector('.hayati-id-container');
  if (existingContainer) {
    console.log('ℹ️ Hayati ID already rendered, skipping');
    return;
  }

  // Get translations (safe fallback)
  const t = (key) => {
    try {
      return window.i18n?.t?.(key) || key;
    } catch (err) {
      console.warn(`⚠️ Translation failed for key: ${key}`, err);
      return key;
    }
  };
  
  const labelText = t('hayatiId.label');
  const copyText = t('hayatiId.copy');
  const copiedText = t('hayatiId.copied');
  const infoText = t('hayatiId.info');
  const tierText = tier === 'signature' 
    ? t('hayatiId.tier.signature') 
    : t('hayatiId.tier.standard');

  // Create HTML (compact: just like email line)
  const html = `
    <div class="hayati-id-container">
      <span>Hayati 🆔:</span>
      <div class="hayati-id-value">
        <span>${hayatiId}</span>
        <span class="hayati-id-tier ${tier}">${tierText}</span>
      </div>
      <button class="hayati-id-copy-btn" data-hayati-id="${hayatiId}" title="${copyText}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span class="copy-text">${copyText}</span>
      </button>
    </div>
  `;

  // Insert before user email
  userEmailEl.insertAdjacentHTML('beforebegin', html);

  // Attach copy event listener
  const copyBtn = document.querySelector('.hayati-id-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => handleCopyHayatiId(hayatiId, copyBtn, copiedText, copyText));
  }

  console.log('✅ Hayati ID rendered successfully');
}

/**
 * Handle copy Hayati ID to clipboard
 * @param {string} hayatiId - Hayati ID to copy
 * @param {HTMLElement} btn - Copy button element
 * @param {string} copiedText - "Copied!" text
 * @param {string} copyText - "Copy" text
 */
function handleCopyHayatiId(hayatiId, btn, copiedText, copyText) {
  // Copy to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(hayatiId)
      .then(() => {
        console.log('✅ Hayati ID copied:', hayatiId);
        showCopySuccess(btn, copiedText, copyText);
      })
      .catch(err => {
        console.error('❌ Failed to copy:', err);
        fallbackCopy(hayatiId);
        showCopySuccess(btn, copiedText, copyText);
      });
  } else {
    // Fallback for older browsers
    fallbackCopy(hayatiId);
    showCopySuccess(btn, copiedText, copyText);
  }
}

/**
 * Show copy success feedback
 * @param {HTMLElement} btn - Copy button
 * @param {string} copiedText - "Copied!" text
 * @param {string} copyText - Original "Copy" text
 */
function showCopySuccess(btn, copiedText, copyText) {
  const textSpan = btn.querySelector('.copy-text');
  
  // Change button state
  btn.classList.add('copied');
  if (textSpan) {
    textSpan.textContent = copiedText;
  }

  // Reset after 2 seconds
  setTimeout(() => {
    btn.classList.remove('copied');
    if (textSpan) {
      textSpan.textContent = copyText;
    }
  }, 2000);
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 */
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    console.log('✅ Fallback copy successful');
  } catch (err) {
    console.error('❌ Fallback copy failed:', err);
  }
  
  document.body.removeChild(textarea);
}