/* /webapp/js/utils/hayatiId.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - generateHayatiId() - генерация Standard ID из UID
// - validateHayatiId() - валидация формата
// - getHayatiIdTier() - определение уровня (Standard/Signature)
// - formatHayatiId() - форматирование для отображения

/**
 * 🆔 Hayati ID Utility
 * 
 * Система идентификации пользователей в экосистеме Hayati
 * 
 * Два уровня:
 * - Standard (4-8 символов, lowercase, бесплатно)
 * - Signature (1-3 символа, uppercase + цифры, платно)
 */

/**
 * Генерация Standard Hayati ID из Firebase UID
 * @param {string} uid - Firebase UID
 * @returns {string} - Hayati ID (8 символов, lowercase)
 * 
 * @example
 * generateHayatiId("kY29dkf93kdf...") → "ky29dkf9"
 */
export function generateHayatiId(uid) {
  if (!uid || typeof uid !== 'string') {
    throw new Error('Invalid UID');
  }
  
  // Берём первые 8 символов, делаем lowercase, убираем небуквенно-нецифровые
  const hayatiId = uid
    .substring(0, 8)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  
  // Если после очистки меньше 8 символов - дополняем нулями
  return hayatiId.padEnd(8, '0');
}

/**
 * Валидация формата Hayati ID
 * @param {string} hayatiId - ID для проверки
 * @returns {boolean} - true если валидный
 */
export function validateHayatiId(hayatiId) {
  if (!hayatiId || typeof hayatiId !== 'string') {
    return false;
  }
  
  const length = hayatiId.length;
  
  // Standard: 4-8 символов, lowercase, только буквы и цифры
  if (length >= 4 && length <= 8) {
    return /^[a-z0-9]+$/.test(hayatiId);
  }
  
  // Signature: 1-3 символа, любой регистр и цифры
  if (length >= 1 && length <= 3) {
    return /^[a-zA-Z0-9]+$/.test(hayatiId);
  }
  
  return false;
}

/**
 * Определение уровня (тира) Hayati ID
 * @param {string} hayatiId - ID
 * @returns {"standard"|"signature"|"invalid"} - уровень
 */
export function getHayatiIdTier(hayatiId) {
  if (!validateHayatiId(hayatiId)) {
    return 'invalid';
  }
  
  const length = hayatiId.length;
  
  // Signature: 1-3 символа
  if (length >= 1 && length <= 3) {
    return 'signature';
  }
  
  // Standard: 4-8 символов
  return 'standard';
}

/**
 * Форматирование Hayati ID для красивого отображения
 * @param {string} hayatiId - ID
 * @returns {string} - форматированный ID
 * 
 * @example
 * formatHayatiId("ky29dkf9") → "ky29dkf9"
 * formatHayatiId("cr7") → "CR7"
 * formatHayatiId("h") → "H"
 */
export function formatHayatiId(hayatiId) {
  if (!validateHayatiId(hayatiId)) {
    return hayatiId; // Возвращаем как есть, если невалидный
  }
  
  const tier = getHayatiIdTier(hayatiId);
  
  // Signature - показываем в UPPERCASE (если есть буквы)
  if (tier === 'signature') {
    return hayatiId.toUpperCase();
  }
  
  // Standard - показываем в lowercase
  return hayatiId.toLowerCase();
}

/**
 * Получение цвета для отображения по tier
 * @param {string} tier - "standard" | "signature"
 * @returns {string} - CSS цвет
 */
export function getHayatiIdColor(tier) {
  switch (tier) {
    case 'signature':
      return '#ff006e'; // Neon pink для Signature
    case 'standard':
      return '#00f0ff'; // Neon blue для Standard
    default:
      return '#64748b'; // Gray для invalid
  }
}

/**
 * Получение иконки для tier
 * @param {string} tier - "standard" | "signature"
 * @returns {string} - Emoji
 */
export function getHayatiIdIcon(tier) {
  switch (tier) {
    case 'signature':
      return '⭐'; // Звезда для Signature
    case 'standard':
      return '🆔'; // ID badge для Standard
    default:
      return '❓';
  }
}