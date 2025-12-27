/* /webapp/businessTriangle/i18n.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - Standalone i18n for Business Triangle module
// - RU/EN translations

const translations = {
  ru: {
    // Main Title
    'triangle.title': '📊 Бизнес-управление',
    'triangle.subtitle': 'Система управления бизнесом',
    'triangle.backToAccount': 'Назад к аккаунту',
    
    // Triangle Areas
    'triangle.mission': 'МИССИЯ',
    'triangle.team': 'КОМАНДА',
    'triangle.leadership': 'ЛИДЕРСТВО',
    'triangle.product': 'Продукт',
    'triangle.legal': 'Юридическое',
    'triangle.systems': 'Системы',
    'triangle.communications': 'Коммуникации',
    'triangle.cashFlow': 'Денежный поток',
    
    // Tooltips
    'triangle.missionTooltip': 'Миссия компании',
    'triangle.teamTooltip': 'Команда и люди',
    'triangle.leadershipTooltip': 'Лидерство и управление',
    'triangle.productTooltip': 'Продукт и услуги',
    'triangle.legalTooltip': 'Юридические аспекты',
    'triangle.systemsTooltip': 'Системы и процессы',
    'triangle.communicationsTooltip': 'Коммуникации и продажи',
    'triangle.cashFlowTooltip': 'Денежный поток и финансы',
    
    // Placeholders
    'triangle.inDevelopment': 'В разработке...',
    'triangle.comingSoon': 'Скоро...',
    
    // Product Selector (20L integration)
    'triangle.selectProduct': 'Выберите продукт для работы',
    'triangle.createProduct': 'Создать продукт',
    
    // Errors
    'triangle.noAccountId': 'Ошибка: аккаунт не определен',
    'triangle.loadingError': 'Ошибка загрузки бизнес-управления',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.back': 'Назад',
    'common.close': 'Закрыть'
  },
  
  en: {
    // Main Title
    'triangle.title': '📊 Business Management',
    'triangle.subtitle': 'Business Management System',
    'triangle.backToAccount': 'Back to Account',
    
    // Triangle Areas
    'triangle.mission': 'MISSION',
    'triangle.team': 'TEAM',
    'triangle.leadership': 'LEADERSHIP',
    'triangle.product': 'Product',
    'triangle.legal': 'Legal',
    'triangle.systems': 'Systems',
    'triangle.communications': 'Communications',
    'triangle.cashFlow': 'Cash Flow',
    
    // Tooltips
    'triangle.missionTooltip': 'Company mission',
    'triangle.teamTooltip': 'Team and people',
    'triangle.leadershipTooltip': 'Leadership and management',
    'triangle.productTooltip': 'Product and services',
    'triangle.legalTooltip': 'Legal aspects',
    'triangle.systemsTooltip': 'Systems and processes',
    'triangle.communicationsTooltip': 'Communications and sales',
    'triangle.cashFlowTooltip': 'Cash flow and finance',
    
    // Placeholders
    'triangle.inDevelopment': 'In development...',
    'triangle.comingSoon': 'Coming soon...',
    
    // Product Selector (20L integration)
    'triangle.selectProduct': 'Select product to work with',
    'triangle.createProduct': 'Create product',
    
    // Errors
    'triangle.noAccountId': 'Error: account not defined',
    'triangle.loadingError': 'Error loading business management',
    
    // Common
    'common.loading': 'Loading...',
    'common.back': 'Back',
    'common.close': 'Close'
  }
};

// Current language (default: ru)
let currentLanguage = 'ru';

/**
 * Get translation for key
 */
export function t(key, lang = null) {
  const language = lang || currentLanguage;
  return translations[language]?.[key] || key;
}

/**
 * Set current language
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    console.log(`🌍 [BusinessTriangle] Language set to: ${lang}`);
    return true;
  }
  console.warn(`⚠️ [BusinessTriangle] Language not supported: ${lang}`);
  return false;
}

/**
 * Get current language
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

// Auto-detect language from Telegram
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  const tgLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
  if (tgLang === 'en') {
    setLanguage('en');
  }
}

console.log('🌍 [BusinessTriangle] i18n initialized:', currentLanguage);