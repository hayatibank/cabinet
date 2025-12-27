/* /webapp/js/utils/i18n.js v1.1.2 */
// CHANGELOG v1.1.2:
// - Added investment.* keys for Level 1 dashboard
// CHANGELOG v1.1.1:
// - ADDED: Missing 20L.stats.remaining key
// - FIXED: 20L.dashboard.addCounterparty key
// CHANGELOG v1.1.0:
// - Added 20L system keys
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
    
    // Units
    'unit.available': 'Доступно',
    'unit.reserved': 'Зарезервировано',
    'unit.sold': 'Продано',
    
    // Errors
    'error.loadingData': 'Ошибка загрузки данных',
    'error.noSession': 'Нет активной сессии',
    'error.savingFailed': 'Ошибка сохранения',
    'error.deletingFailed': 'Ошибка удаления',
    'error.notFound': 'Не найдено',
    'error.generic': 'Произошла ошибка',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.back': 'Назад',
    'common.next': 'Далее',
    'common.close': 'Закрыть',
    'common.yes': 'Да',
    'common.no': 'Нет',
    'common.previous': 'Назад'
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
    
    // Units
    'unit.available': 'Available',
    'unit.reserved': 'Reserved',
    'unit.sold': 'Sold',
    
    // Errors
    'error.loadingData': 'Error loading data',
    'error.noSession': 'No active session',
    'error.savingFailed': 'Save failed',
    'error.deletingFailed': 'Delete failed',
    'error.notFound': 'Not found',
    'error.generic': 'An error occurred',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.previous': 'Previous'
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