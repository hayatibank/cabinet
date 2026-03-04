/* /webapp/js/components/hayatiIdDisplay.js v2.1.0 */
// CHANGELOG v2.1.0:
// - FIXED: UTF-8 only (removed mojibake strings)
// - FIXED: Label now taken from i18n key (no hardcoded text)
// - CLEANUP: Standardized logs

/**
 * Render Hayati ID in cabinet
 * @param {Object} userData - User data object with hayatiId field
 */
export function renderHayatiIdInCabinet(userData) {
  if (!userData || !userData.hayatiId) {
    console.warn('[hayati-id] No Hayati ID found in user data');
    return;
  }

  const hayatiId = userData.hayatiId;
  const tier = userData.hayatiIdTier || 'standard';

  const userEmailEl = document.querySelector('.user-email');
  if (!userEmailEl) {
    console.error('[hayati-id] Cannot find .user-email element');
    return;
  }

  const existingContainer = document.querySelector('.hayati-id-container');
  if (existingContainer) {
    console.log('[hayati-id] already rendered, skipping');
    return;
  }

  const t = (key) => {
    try {
      return window.i18n?.t?.(key) || key;
    } catch {
      return key;
    }
  };

  const labelText = t('hayatiId.label');
  const copyText = t('hayatiId.copy');
  const copiedText = t('hayatiId.copied');
  const tierText = tier === 'signature'
    ? t('hayatiId.tier.signature')
    : t('hayatiId.tier.standard');

  const html = `
    <div class="hayati-id-container">
      <span>${labelText}:</span>
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

  userEmailEl.insertAdjacentHTML('beforebegin', html);

  const copyBtn = document.querySelector('.hayati-id-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => handleCopyHayatiId(hayatiId, copyBtn, copiedText, copyText));
  }

  try {
    window.dispatchEvent(new CustomEvent('hayatiIdUpdated', {
      detail: {
        hayatiId,
        tier,
        tierText
      }
    }));
  } catch (_error) {
    // no-op
  }

  console.log('[hayati-id] rendered successfully');
}

/**
 * Handle copy Hayati ID to clipboard
 * @param {string} hayatiId - Hayati ID to copy
 * @param {HTMLElement} btn - Copy button element
 * @param {string} copiedText - "Copied!" text
 * @param {string} copyText - "Copy" text
 */
function handleCopyHayatiId(hayatiId, btn, copiedText, copyText) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(hayatiId)
      .then(() => {
        console.log('[hayati-id] copied:', hayatiId);
        showCopySuccess(btn, copiedText, copyText);
      })
      .catch((err) => {
        console.error('[hayati-id] Failed to copy:', err);
        fallbackCopy(hayatiId);
        showCopySuccess(btn, copiedText, copyText);
      });
  } else {
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

  btn.classList.add('copied');
  if (textSpan) {
    textSpan.textContent = copiedText;
  }

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
    console.log('[hayati-id] fallback copy successful');
  } catch (err) {
    console.error('[hayati-id] fallback copy failed:', err);
  }

  document.body.removeChild(textarea);
}
