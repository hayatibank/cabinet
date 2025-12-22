// i18n.js - Internationalization
// Translations for Business Triangle

const translations = {
  ru: {
    // Black edges
    mission: 'МИССИЯ',
    team: 'КОМАНДА',
    leadership: 'ЛИДЕРСТВО',
    
    // Purple levels
    product: 'Продукт',
    legal: 'Юридическое',
    systems: 'Системы',
    communications: 'Коммуникации',
    cashFlow: 'Денежный поток',
    
    // UI
    backToAccount: 'Назад к аккаунту',
    businessManagement: 'Бизнес-управление'
  },
  
  en: {
    // Black edges
    mission: 'MISSION',
    team: 'TEAM',
    leadership: 'LEADERSHIP',
    
    // Purple levels
    product: 'Product',
    legal: 'Legal',
    systems: 'Systems',
    communications: 'Communications',
    cashFlow: 'Cash Flow',
    
    // UI
    backToAccount: 'Back to Account',
    businessManagement: 'Business Management'
  }
};

// Current language
let currentLang = 'ru';

// Get translation
function t(key) {
  return translations[currentLang][key] || key;
}

// Set language
function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    console.log(`🌍 Language set to: ${lang}`);
    return true;
  }
  return false;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { t, setLanguage, translations };
}