/* /webapp/js/utils/i18n.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - Support for RU/EN languages
// - Centralized translations for entire app

const translations = {
  ru: {
    // Auth
    'auth.login': 'Вход',
    'auth.register': 'Регистрация',
    'auth.logout': 'Выйти',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    
    // Cabinet
    'cabinet.title': 'Личный кабинет',
    'cabinet.welcome': 'Добро пожаловать',
    
    // Financial Report
    'report.income': 'Доходы',
    'report.expenses': 'Расходы',
    'report.assets': 'Активы',
    'report.liabilities': 'Пассивы',
    'report.analysis': 'Анализ',
    'report.cashFlow': 'Чистый денежный поток',
    'report.netWorth': 'Состояние',
    
    // Offering Zone
    'offering.title': '🎁 Персональные предложения',
    'offering.subtitle': 'Основано на вашем финансовом положении',
    'offering.budget': 'Доступный бюджет',
    'offering.noOffers': 'Пока нет подходящих предложений',
    'offering.loading': 'Загрузка предложений...',
    'offering.learnMore': 'Узнать больше',
    'offering.location': 'Местоположение',
    'offering.type': 'Тип',
    'offering.area': 'Площадь',
    'offering.roi': 'Доходность',
    'offering.handover': 'Передача',
    
    // Business Triangle
    'triangle.mission': 'МИССИЯ',
    'triangle.team': 'КОМАНДА',
    'triangle.leadership': 'ЛИДЕРСТВО',
    'triangle.product': 'Продукт',
    'triangle.legal': 'Юридическое',
    'triangle.systems': 'Системы',
    'triangle.communications': 'Коммуникации',
    'triangle.cashFlow': 'Денежный поток',
    'triangle.backToAccount': 'Назад к аккаунту',
    'triangle.businessManagement': 'Бизнес-управление',
    
    // Units
    'unit.available': 'Доступно',
    'unit.reserved': 'Зарезервировано',
    'unit.sold': 'Продано',
    
    // Errors
    'error.loadingData': 'Ошибка загрузки данных',
    'error.noSession': 'Нет активной сессии',
    
    // Business Triangle
    'businessManagement': 'Биз. управление',
    'backToAccount': 'Назад к аккаунту',
    'mission': 'МИССИЯ',
    'team': 'КОМАНДА',
    'leadership': 'ЛИДЕРСТВО',
    'product': 'Продукт',
    'legal': 'Юридическое',
    'systems': 'Системы',
    'communications': 'Коммуникации',
    'cashFlow': 'Денежный поток',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.back': 'Назад',
    'common.next': 'Далее',
    'common.close': 'Закрыть'
  },
  
  en: {
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    
    // Cabinet
    'cabinet.title': 'Cabinet',
    'cabinet.welcome': 'Welcome',
    
    // Financial Report
    'report.income': 'Income',
    'report.expenses': 'Expenses',
    'report.assets': 'Assets',
    'report.liabilities': 'Liabilities',
    'report.analysis': 'Analysis',
    'report.cashFlow': 'Net Cash Flow',
    'report.netWorth': 'Net Worth',
    
    // Offering Zone
    'offering.title': '🎁 Personal Offers',
    'offering.subtitle': 'Based on your financial position',
    'offering.budget': 'Available Budget',
    'offering.noOffers': 'No suitable offers yet',
    'offering.loading': 'Loading offers...',
    'offering.learnMore': 'Learn More',
    'offering.location': 'Location',
    'offering.type': 'Type',
    'offering.area': 'Area',
    'offering.roi': 'ROI',
    'offering.handover': 'Handover',
    
    // Business Triangle
    'triangle.mission': 'MISSION',
    'triangle.team': 'TEAM',
    'triangle.leadership': 'LEADERSHIP',
    'triangle.product': 'Product',
    'triangle.legal': 'Legal',
    'triangle.systems': 'Systems',
    'triangle.communications': 'Communications',
    'triangle.cashFlow': 'Cash Flow',
    'triangle.backToAccount': 'Back to Account',
    'triangle.businessManagement': 'Business Management',
    
    // Units
    'unit.available': 'Available',
    'unit.reserved': 'Reserved',
    'unit.sold': 'Sold',
    
    // Errors
    'error.loadingData': 'Error loading data',
    'error.noSession': 'No active session',
    
    // Business Triangle
    'businessManagement': 'Business Management',
    'backToAccount': 'Back to Account',
    'mission': 'MISSION',
    'team': 'TEAM',
    'leadership': 'LEADERSHIP',
    'product': 'Product',
    'legal': 'Legal',
    'systems': 'Systems',
    'communications': 'Communications',
    'cashFlow': 'Cash Flow',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
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
    console.log(`🌍 Language set to: ${lang}`);
    return true;
  }
  console.warn(`⚠️ Language not supported: ${lang}`);
  return false;
}

/**
 * Get current language
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages() {
  return Object.keys(translations);
}

// Auto-detect language from Telegram
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  const tgLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
  if (tgLang === 'en') {
    setLanguage('en');
  }
}

console.log('🌍 i18n initialized:', currentLanguage);