/* /webapp/investments/i18n.js v1.1.0 */
// CHANGELOG v1.1.0:
// - Added translations for HODL, Projects, SpotBot, PaymentsMade sections
// CHANGELOG v1.0.0:
// - Standalone i18n for investments module
// - RU/EN translations for Level 1

const translations = {
  ru: {
    // Level 1 Dashboard
    'level1.title': '📊 Инвестор: уровень №1',
    'level1.subtitle': 'Цифровые финансовые активы',
    'level1.bot': 'Бот (USDT)',
    'level1.hodl': 'HODL (BTC)',
    'level1.projects': 'Проекты',
    'level1.liquidity': 'Ликвидность (RUB)',
    'level1.portfolio': 'Портфель',
    'level1.totalInvested': 'Всего инвестировано',
    'level1.balance': 'Баланс',
    'level1.amount': 'Сумма',
    'level1.date': 'Дата',
    'level1.noBalance': 'Нет данных о балансе',
    'level1.noInvestments': 'Нет активных инвестиций',
    'level1.noCrypto': 'Нет криптоактивов',
    'level1.cryptoPortfolio': 'HODL портфель долгосрочных инвестиций («Хаяти HODL»)',
    'level1.cryptoNote': 'Курсы обновляются каждые 5 минут',
    'level1.unknownInvestment': 'Неизвестная инвестиция',
    
    // Investment Projects
    'projects.title': '📊 Проекты роста капитала',
    'projects.subtitle': 'Инвестиции в проекты',
    'projects.noProjects': 'Нет активных проектов',
    'projects.roi': 'ROI',
    'projects.invested': 'Инвестировано',
    
    // Spot Bot
    'spotBot.title': '🦾 Спотовый бот «Хаяти»',
    'spotBot.subtitle': 'Пассивный доход от торговли',
    'spotBot.noBots': 'Нет активных ботов',
    'spotBot.profit': 'Прибыль',
    'spotBot.active': 'Активен',
    
    // Payments Made
    'payments.title': '💸 Осуществлённые выплаты',
    'payments.subtitle': 'История транзакций',
    'payments.noPayments': 'Нет выплат',
    'payments.made': 'Выплачено',
    'payments.reinvested': 'Реинвестировано',
    'payments.savedInBtc': 'Сохранено в BTC',
    'payments.transferred': 'Переведено',
    'payments.total': 'Всего выплат',
    
    // Balance Section
    'balance.title': '💰 Баланс активов',
    'balance.bot': 'Бот (USDT)',
    'balance.hodl': 'HODL (BTC)',
    'balance.projects': 'Проекты',
    'balance.liquidity': 'Ликвидность (RUB)',
    'balance.total': 'Итого',
    
    // Investment List
    'list.title': '📋 Мои инвестиции',
    'list.empty': 'У вас пока нет активных инвестиций',
    'list.addFirst': 'Добавьте первую инвестицию для начала',
    
    // Investment Item
    'item.roi': 'ROI',
    'item.status': 'Статус',
    'item.date': 'Дата',
    
    // Status
    'status.active': 'Активна',
    'status.completed': 'Завершена',
    'status.pending': 'В ожидании',
    
    // Crypto Portfolio
    'crypto.title': '₿ Крипто-портфель',
    'crypto.empty': 'Нет криптоактивов',
    'crypto.balance': 'Баланс',
    'crypto.price': 'Цена',
    'crypto.change24h': '24ч изменение',
    
    // Actions
    'actions.addInvestment': 'Добавить инвестицию',
    'actions.viewDetails': 'Детали',
    'actions.withdraw': 'Вывести',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка загрузки',
    'common.retry': 'Повторить',
    'common.back': 'Назад',
    
    // Errors
    'error.loadingData': 'Ошибка загрузки данных'
  },
  
  en: {
    // Level 1 Dashboard
    'level1.title': '📊 Investor: Level #1',
    'level1.subtitle': 'Digital Financial Assets',
    'level1.bot': 'Bot (USDT)',
    'level1.hodl': 'HODL (BTC)',
    'level1.projects': 'Projects',
    'level1.liquidity': 'Liquidity (RUB)',
    'level1.portfolio': 'Portfolio',
    'level1.totalInvested': 'Total Invested',
    'level1.balance': 'Balance',
    'level1.amount': 'Amount',
    'level1.date': 'Date',
    'level1.noBalance': 'No balance data',
    'level1.noInvestments': 'No active investments',
    'level1.noCrypto': 'No crypto assets',
    'level1.cryptoPortfolio': 'HODL Long-Term Investment Portfolio (Hayati HODL)',
    'level1.cryptoNote': 'Rates update every 5 minutes',
    'level1.unknownInvestment': 'Unknown investment',
    
    // Investment Projects
    'projects.title': '📊 Capital Growth Projects',
    'projects.subtitle': 'Project investments',
    'projects.noProjects': 'No active projects',
    'projects.roi': 'ROI',
    'projects.invested': 'Invested',
    
    // Spot Bot
    'spotBot.title': '🦾 Hayati Spot Bot',
    'spotBot.subtitle': 'Passive income from trading',
    'spotBot.noBots': 'No active bots',
    'spotBot.profit': 'Profit',
    'spotBot.active': 'Active',
    
    // Payments Made
    'payments.title': '💸 Payments Made',
    'payments.subtitle': 'Transaction history',
    'payments.noPayments': 'No payments',
    'payments.made': 'Paid out',
    'payments.reinvested': 'Reinvested',
    'payments.savedInBtc': 'Saved in BTC',
    'payments.transferred': 'Transferred',
    'payments.total': 'Total payments',
    
    // Balance Section
    'balance.title': '💰 Asset Balance',
    'balance.bot': 'Bot (USDT)',
    'balance.hodl': 'HODL (BTC)',
    'balance.projects': 'Projects',
    'balance.liquidity': 'Liquidity (RUB)',
    'balance.total': 'Total',
    
    // Investment List
    'list.title': '📋 My Investments',
    'list.empty': 'You have no active investments yet',
    'list.addFirst': 'Add your first investment to start',
    
    // Investment Item
    'item.roi': 'ROI',
    'item.status': 'Status',
    'item.date': 'Date',
    
    // Status
    'status.active': 'Active',
    'status.completed': 'Completed',
    'status.pending': 'Pending',
    
    // Crypto Portfolio
    'crypto.title': '₿ Crypto Portfolio',
    'crypto.empty': 'No crypto assets',
    'crypto.balance': 'Balance',
    'crypto.price': 'Price',
    'crypto.change24h': '24h Change',
    
    // Actions
    'actions.addInvestment': 'Add Investment',
    'actions.viewDetails': 'Details',
    'actions.withdraw': 'Withdraw',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Loading error',
    'common.retry': 'Retry',
    'common.back': 'Back',
    
    // Errors
    'error.loadingData': 'Error loading data'
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
    console.log(`🌍 [Investments] Language set to: ${lang}`);
    return true;
  }
  console.warn(`⚠️ [Investments] Language not supported: ${lang}`);
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

console.log('🌍 [Investments] i18n initialized:', currentLanguage);