/* /webapp/accountDashboard/i18n.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - Standalone i18n for Account Dashboard module
// - RU/EN translations for 7-step navigation

const translations = {
  ru: {
    // Dashboard Main
    'dashboard.backToList': 'Назад к списку',
    'dashboard.account': 'Аккаунт',
    'dashboard.loading': 'Загрузка...',
    'dashboard.errorLoading': '❌ Ошибка загрузки кабинета',
    'dashboard.accountNotFound': '❌ Аккаунт не найден',
    
    // Account Types (badges)
    'dashboard.accountType.individual': '👤 Физическое лицо',
    'dashboard.accountType.business': '🏢 Юридическое лицо',
    'dashboard.accountType.government': '🏛️ Госорганизация',
    
    // 7 Steps Navigation
    'dashboard.step1': 'Фин. отчёт',
    'dashboard.step1.title': '📊 Финансовый отчёт',
    'dashboard.step1.desc': 'Отчёт о доходах, расходах, активах и пассивах',
    
    'dashboard.step2': 'Цели',
    'dashboard.step2.title': '🎯 Цели',
    'dashboard.step2.desc': 'Финансовые цели и планирование',
    
    'dashboard.step3': 'Ден. поток',
    'dashboard.step3.title': '💵 Денежный поток',
    'dashboard.step3.desc': 'Анализ движения денежных средств',
    
    'dashboard.step4': 'Инвестиции',
    'dashboard.step4.title': '📈 Инвестиции',
    'dashboard.step4.desc': 'Инвестиционный портфель',
    
    'dashboard.step5': 'Бизнес',
    'dashboard.step5.title': '🏢 Бизнес',
    'dashboard.step5.desc': 'Управление бизнесом',
    
    'dashboard.step6': 'Биз. управление',
    'dashboard.step6.title': '📊 Бизнес-управление',
    'dashboard.step6.desc': 'Треугольник управления и система 20L',
    
    'dashboard.step7': 'IPO',
    'dashboard.step7.title': '🚀 IPO',
    'dashboard.step7.desc': 'Выход на биржу',
    
    // Coming Soon
    'dashboard.comingSoon': 'Раздел в разработке',
    'dashboard.comingSoonIcon': '🚧',
    'dashboard.comingSoonDesc': 'Этот раздел будет доступен в следующих версиях',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.back': 'Назад',
    'common.close': 'Закрыть',
    'common.refresh': 'Обновить'
  },
  
  en: {
    // Dashboard Main
    'dashboard.backToList': 'Back to list',
    'dashboard.account': 'Account',
    'dashboard.loading': 'Loading...',
    'dashboard.errorLoading': '❌ Error loading cabinet',
    'dashboard.accountNotFound': '❌ Account not found',
    
    // Account Types (badges)
    'dashboard.accountType.individual': '👤 Individual',
    'dashboard.accountType.business': '🏢 Business',
    'dashboard.accountType.government': '🏛️ Government',
    
    // 7 Steps Navigation
    'dashboard.step1': 'Fin. Report',
    'dashboard.step1.title': '📊 Financial Report',
    'dashboard.step1.desc': 'Income, expenses, assets and liabilities report',
    
    'dashboard.step2': 'Goals',
    'dashboard.step2.title': '🎯 Goals',
    'dashboard.step2.desc': 'Financial goals and planning',
    
    'dashboard.step3': 'Cash Flow',
    'dashboard.step3.title': '💵 Cash Flow',
    'dashboard.step3.desc': 'Cash flow analysis',
    
    'dashboard.step4': 'Investments',
    'dashboard.step4.title': '📈 Investments',
    'dashboard.step4.desc': 'Investment portfolio',
    
    'dashboard.step5': 'Business',
    'dashboard.step5.title': '🏢 Business',
    'dashboard.step5.desc': 'Business management',
    
    'dashboard.step6': 'Bus. Management',
    'dashboard.step6.title': '📊 Business Management',
    'dashboard.step6.desc': 'Management triangle and 20L system',
    
    'dashboard.step7': 'IPO',
    'dashboard.step7.title': '🚀 IPO',
    'dashboard.step7.desc': 'Going public',
    
    // Coming Soon
    'dashboard.comingSoon': 'Section in development',
    'dashboard.comingSoonIcon': '🚧',
    'dashboard.comingSoonDesc': 'This section will be available in future versions',
    
    // Common
    'common.loading': 'Loading...',
    'common.back': 'Back',
    'common.close': 'Close',
    'common.refresh': 'Refresh'
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
    console.log(`🌍 [AccountDashboard] Language set to: ${lang}`);
    return true;
  }
  console.warn(`⚠️ [AccountDashboard] Language not supported: ${lang}`);
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

console.log('🌍 [AccountDashboard] i18n initialized:', currentLanguage);