/* /webapp/js/utils/i18n.js v1.1.0 */
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
    
    // 20L System - Product Selector
    '20L.productSelector.title': 'Система управления лидами 20L',
    '20L.productSelector.subtitle': 'Выберите продукт для работы',
    '20L.productSelector.createFirst': 'Создайте первый продукт',
    '20L.productSelector.createFirstDesc': 'Добавьте продукт, с которым вы работаете',
    '20L.productSelector.addProduct': 'Добавить продукт',
    '20L.productSelector.loading': 'Загрузка продуктов...',
    '20L.productSelector.noProducts': 'Нет продуктов',
    '20L.productSelector.selectProduct': 'Выберите продукт',
    
    // 20L System - Product Form
    '20L.product.name': 'Название продукта',
    '20L.product.nameRequired': 'Обязательное поле',
    '20L.product.comment': 'Комментарий',
    '20L.product.commentOptional': 'Опционально',
    '20L.product.save': 'Сохранить продукт',
    '20L.product.saving': 'Сохранение...',
    '20L.product.edit': 'Редактировать',
    '20L.product.delete': 'Удалить',
    
    // 20L System - Dashboard
    '20L.dashboard.title': 'Доска лидов',
    '20L.dashboard.backToProducts': 'Назад к продуктам',
    '20L.dashboard.loading': 'Загрузка статистики...',
    '20L.dashboard.addCounterparty': 'Добавить контрагента',
    
    // 20L System - Statistics
    '20L.stats.leads': 'Лиды',
    '20L.stats.leadsTarget': 'Цель: 20 активных лидов',
    '20L.stats.ic': 'В контакте (IC)',
    '20L.stats.icTarget': 'Активно общаемся',
    '20L.stats.counterparties': 'Контрагенты',
    '20L.stats.counterpartiesTarget': 'Всего в базе',
    '20L.stats.sales': 'Продажи',
    '20L.stats.salesTarget': 'Успешные сделки',
    '20L.stats.progress': 'Прогресс к цели',
    
    // 20L System - Filters
    '20L.filter.all': 'Все',
    '20L.filter.status0': 'Серые (0)',
    '20L.filter.statusIC': 'Желтые (IC)',
    '20L.filter.statusLead': 'Синие (Lead)',
    '20L.filter.statusSales': 'Зеленые (Sales)',
    
    // 20L System - Counterparty Card
    '20L.counterparty.stage': 'Этап',
    '20L.counterparty.classification': 'Классификация',
    '20L.counterparty.source': 'Источник',
    '20L.counterparty.noComment': 'Без комментария',
    
    // 20L System - Counterparty Modal
    '20L.modal.createTitle': 'Добавить контрагента',
    '20L.modal.editTitle': 'Редактировать контрагента',
    '20L.modal.name': 'Имя контрагента',
    '20L.modal.nameRequired': 'Обязательное поле',
    '20L.modal.status': 'Статус',
    '20L.modal.statusHelp': 'Авто-устанавливается при создании',
    '20L.modal.cycleStage': 'Этап цикла',
    '20L.modal.cycleStageHelp': '1-11',
    '20L.modal.classification': 'Классификация',
    '20L.modal.classificationPlaceholder': 'Тип клиента',
    '20L.modal.source': 'Источник',
    '20L.modal.sourcePlaceholder': 'Откуда пришел',
    '20L.modal.comment': 'Комментарий',
    '20L.modal.commentPlaceholder': 'Заметки о контрагенте',
    '20L.modal.moveToNext': 'Перейти на следующий этап',
    '20L.modal.delete': 'Удалить контрагента',
    '20L.modal.save': 'Сохранить',
    '20L.modal.saving': 'Сохранение...',
    '20L.modal.cancel': 'Отмена',
    
    // 20L System - Status Names
    '20L.status.0': 'Серый (0)',
    '20L.status.IC': 'В контакте (IC)',
    '20L.status.Lead': 'Лид',
    '20L.status.Sales': 'Продажа',
    
    // 20L System - Pagination
    '20L.pagination.previous': 'Предыдущие',
    '20L.pagination.next': 'Следующие',
    '20L.pagination.showing': 'Показано',
    '20L.pagination.of': 'из',
    
    // 20L System - Empty States
    '20L.empty.noCounterparties': 'Нет контрагентов',
    '20L.empty.addFirst': 'Добавьте первого контрагента для начала работы',
    '20L.empty.noFilterResults': 'Нет контрагентов с этим статусом',
    
    // 20L System - Confirmations
    '20L.confirm.deleteCounterparty': 'Удалить контрагента?',
    '20L.confirm.deleteCounterpartyText': 'Это действие нельзя отменить',
    
    // Units
    'unit.available': 'Доступно',
    'unit.reserved': 'Зарезервировано',
    'unit.sold': 'Продано',
    
    // Errors
    'error.loadingData': 'Ошибка загрузки данных',
    'error.noSession': 'Нет активной сессии',
    'error.savingFailed': 'Ошибка сохранения',
    'error.deletingFailed': 'Ошибка удаления',
    
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
    'common.no': 'Нет'
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
    
    // 20L System - Product Selector
    '20L.productSelector.title': '20L Lead Management System',
    '20L.productSelector.subtitle': 'Select product to work with',
    '20L.productSelector.createFirst': 'Create first product',
    '20L.productSelector.createFirstDesc': 'Add a product you work with',
    '20L.productSelector.addProduct': 'Add Product',
    '20L.productSelector.loading': 'Loading products...',
    '20L.productSelector.noProducts': 'No products',
    '20L.productSelector.selectProduct': 'Select product',
    
    // 20L System - Product Form
    '20L.product.name': 'Product name',
    '20L.product.nameRequired': 'Required field',
    '20L.product.comment': 'Comment',
    '20L.product.commentOptional': 'Optional',
    '20L.product.save': 'Save Product',
    '20L.product.saving': 'Saving...',
    '20L.product.edit': 'Edit',
    '20L.product.delete': 'Delete',
    
    // 20L System - Dashboard
    '20L.dashboard.title': 'Lead Board',
    '20L.dashboard.backToProducts': 'Back to Products',
    '20L.dashboard.loading': 'Loading statistics...',
    '20L.dashboard.addCounterparty': 'Add Counterparty',
    
    // 20L System - Statistics
    '20L.stats.leads': 'Leads',
    '20L.stats.leadsTarget': 'Target: 20 active leads',
    '20L.stats.ic': 'In Contact (IC)',
    '20L.stats.icTarget': 'Actively communicating',
    '20L.stats.counterparties': 'Counterparties',
    '20L.stats.counterpartiesTarget': 'Total in database',
    '20L.stats.sales': 'Sales',
    '20L.stats.salesTarget': 'Successful deals',
    '20L.stats.progress': 'Progress to target',
    
    // 20L System - Filters
    '20L.filter.all': 'All',
    '20L.filter.status0': 'Gray (0)',
    '20L.filter.statusIC': 'Yellow (IC)',
    '20L.filter.statusLead': 'Blue (Lead)',
    '20L.filter.statusSales': 'Green (Sales)',
    
    // 20L System - Counterparty Card
    '20L.counterparty.stage': 'Stage',
    '20L.counterparty.classification': 'Classification',
    '20L.counterparty.source': 'Source',
    '20L.counterparty.noComment': 'No comment',
    
    // 20L System - Counterparty Modal
    '20L.modal.createTitle': 'Add Counterparty',
    '20L.modal.editTitle': 'Edit Counterparty',
    '20L.modal.name': 'Counterparty name',
    '20L.modal.nameRequired': 'Required field',
    '20L.modal.status': 'Status',
    '20L.modal.statusHelp': 'Auto-assigned on creation',
    '20L.modal.cycleStage': 'Cycle stage',
    '20L.modal.cycleStageHelp': '1-11',
    '20L.modal.classification': 'Classification',
    '20L.modal.classificationPlaceholder': 'Client type',
    '20L.modal.source': 'Source',
    '20L.modal.sourcePlaceholder': 'Where from',
    '20L.modal.comment': 'Comment',
    '20L.modal.commentPlaceholder': 'Notes about counterparty',
    '20L.modal.moveToNext': 'Move to next stage',
    '20L.modal.delete': 'Delete counterparty',
    '20L.modal.save': 'Save',
    '20L.modal.saving': 'Saving...',
    '20L.modal.cancel': 'Cancel',
    
    // 20L System - Status Names
    '20L.status.0': 'Gray (0)',
    '20L.status.IC': 'In Contact (IC)',
    '20L.status.Lead': 'Lead',
    '20L.status.Sales': 'Sale',
    
    // 20L System - Pagination
    '20L.pagination.previous': 'Previous',
    '20L.pagination.next': 'Next',
    '20L.pagination.showing': 'Showing',
    '20L.pagination.of': 'of',
    
    // 20L System - Empty States
    '20L.empty.noCounterparties': 'No counterparties',
    '20L.empty.addFirst': 'Add first counterparty to start working',
    '20L.empty.noFilterResults': 'No counterparties with this status',
    
    // 20L System - Confirmations
    '20L.confirm.deleteCounterparty': 'Delete counterparty?',
    '20L.confirm.deleteCounterpartyText': 'This action cannot be undone',
    
    // Units
    'unit.available': 'Available',
    'unit.reserved': 'Reserved',
    'unit.sold': 'Sold',
    
    // Errors
    'error.loadingData': 'Error loading data',
    'error.noSession': 'No active session',
    'error.savingFailed': 'Save failed',
    'error.deletingFailed': 'Delete failed',
    
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
    'common.no': 'No'
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