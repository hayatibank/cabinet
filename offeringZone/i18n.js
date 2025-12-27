/* /webapp/offeringZone/i18n.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - Standalone i18n for Offering Zone module
// - RU/EN translations for personalized real estate offers

const translations = {
  ru: {
    // Main
    'offering.title': '🎁 Персональные предложения',
    'offering.subtitle': 'Основано на вашем финансовом положении',
    'offering.loading': 'Загрузка предложений...',
    'offering.noOffers': 'Пока нет подходящих предложений',
    'offering.noOffersDesc': 'Увеличьте свой денежный поток или ликвидные активы',
    'offering.error': '❌ Ошибка загрузки предложений',
    
    // Budget
    'offering.budget': 'Доступный бюджет',
    'offering.budget.cashFlow': 'Денежный поток (3 года)',
    'offering.budget.liquidAssets': 'Ликвидные активы (80%)',
    'offering.budget.formula': 'Формула: (денежный поток × 3) + (ликвидные активы × 80%)',
    
    // Offer Details
    'offering.learnMore': 'Узнать больше',
    'offering.price': 'Цена',
    'offering.location': 'Местоположение',
    'offering.type': 'Тип',
    'offering.bedrooms': 'Спальни',
    'offering.area': 'Площадь',
    'offering.roi': 'Доходность',
    'offering.handover': 'Передача',
    'offering.status': 'Статус',
    
    // Property Types
    'property.apartment': 'Квартира',
    'property.studio': 'Студия',
    'property.penthouse': 'Пентхаус',
    'property.villa': 'Вилла',
    'property.townhouse': 'Таунхаус',
    
    // Status
    'status.available': 'Доступно',
    'status.reserved': 'Зарезервировано',
    'status.sold': 'Продано',
    
    // Units
    'units.sqm': 'м²',
    'units.sqft': 'кв.фт',
    'units.bedroom': 'спальня',
    'units.bedrooms': 'спальни',
    
    // Actions
    'action.viewDetails': 'Посмотреть детали',
    'action.contact': 'Связаться',
    'action.compare': 'Сравнить',
    'action.favorite': 'В избранное',
    
    // Messages
    'message.comingSoon': 'Детальная информация о юните будет доступна в следующей версии',
    'message.projectLabel': 'Проект',
    'message.unitLabel': 'Юнит',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.retry': 'Повторить'
  },
  
  en: {
    // Main
    'offering.title': '🎁 Personal Offers',
    'offering.subtitle': 'Based on your financial position',
    'offering.loading': 'Loading offers...',
    'offering.noOffers': 'No suitable offers yet',
    'offering.noOffersDesc': 'Increase your cash flow or liquid assets',
    'offering.error': '❌ Error loading offers',
    
    // Budget
    'offering.budget': 'Available Budget',
    'offering.budget.cashFlow': 'Cash Flow (3 years)',
    'offering.budget.liquidAssets': 'Liquid Assets (80%)',
    'offering.budget.formula': 'Formula: (cash flow × 3) + (liquid assets × 80%)',
    
    // Offer Details
    'offering.learnMore': 'Learn More',
    'offering.price': 'Price',
    'offering.location': 'Location',
    'offering.type': 'Type',
    'offering.bedrooms': 'Bedrooms',
    'offering.area': 'Area',
    'offering.roi': 'ROI',
    'offering.handover': 'Handover',
    'offering.status': 'Status',
    
    // Property Types
    'property.apartment': 'Apartment',
    'property.studio': 'Studio',
    'property.penthouse': 'Penthouse',
    'property.villa': 'Villa',
    'property.townhouse': 'Townhouse',
    
    // Status
    'status.available': 'Available',
    'status.reserved': 'Reserved',
    'status.sold': 'Sold',
    
    // Units
    'units.sqm': 'm²',
    'units.sqft': 'sq.ft',
    'units.bedroom': 'bedroom',
    'units.bedrooms': 'bedrooms',
    
    // Actions
    'action.viewDetails': 'View Details',
    'action.contact': 'Contact',
    'action.compare': 'Compare',
    'action.favorite': 'Add to Favorites',
    
    // Messages
    'message.comingSoon': 'Detailed unit information will be available in the next version',
    'message.projectLabel': 'Project',
    'message.unitLabel': 'Unit',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry'
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
    console.log(`🌍 [OfferingZone] Language set to: ${lang}`);
    return true;
  }
  console.warn(`⚠️ [OfferingZone] Language not supported: ${lang}`);
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

console.log('🌍 [OfferingZone] i18n initialized:', currentLanguage);