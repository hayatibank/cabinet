/* /webapp/20L/i18n.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - Standalone i18n for 20L module
// - Extracted from /js/utils/i18n.js
// - RU/EN translations for Lead Management System

const translations = {
  ru: {
    // Product Selector
    '20L.productSelector.title': 'Система управления лидами 20L',
    '20L.productSelector.subtitle': 'Выберите продукт для работы',
    '20L.productSelector.createFirst': 'Создайте первый продукт',
    '20L.productSelector.createFirstDesc': 'Добавьте продукт, с которым вы работаете',
    '20L.productSelector.addProduct': 'Добавить продукт',
    '20L.productSelector.loading': 'Загрузка продуктов...',
    '20L.productSelector.noProducts': 'Нет продуктов',
    '20L.productSelector.selectProduct': 'Выберите продукт',
    
    // Product Form
    '20L.product.name': 'Название продукта',
    '20L.product.nameRequired': 'Обязательное поле',
    '20L.product.namePlaceholder': 'Например: Недвижимость в Дубае',
    '20L.product.comment': 'Комментарий',
    '20L.product.commentOptional': 'Опционально',
    '20L.product.commentPlaceholder': 'Дополнительная информация о продукте',
    '20L.product.save': 'Сохранить продукт',
    '20L.product.saving': 'Сохранение...',
    '20L.product.create': 'Создать продукт',
    '20L.product.created': 'Продукт создан',
    '20L.product.updated': 'Продукт обновлён',
    '20L.product.edit': 'Редактировать',
    '20L.product.delete': 'Удалить',
    '20L.product.selector': 'Выбор продукта',
    '20L.product.addNew': 'Добавить новый',
    '20L.product.createFirstSubtitle': 'Добавьте продукт для начала работы',
    
    // Dashboard
    '20L.dashboard.title': 'Доска лидов',
    '20L.dashboard.backToProducts': 'Назад к продуктам',
    '20L.dashboard.loading': 'Загрузка статистики...',
    '20L.dashboard.addCounterparty': 'Добавить контрагента',
    
    // Statistics
    '20L.stats.leads': 'Лиды',
    '20L.stats.leadsTarget': 'Цель: 20 активных лидов',
    '20L.stats.ic': 'В контакте (IC)',
    '20L.stats.icTarget': 'Активно общаемся',
    '20L.stats.counterparties': 'Контрагенты',
    '20L.stats.counterpartiesTarget': 'Всего в базе',
    '20L.stats.sales': 'Продажи',
    '20L.stats.salesTarget': 'Успешные сделки',
    '20L.stats.progress': 'Прогресс к цели',
    '20L.stats.remaining': 'осталось до цели',
    
    // Filters
    '20L.filter.all': 'Все',
    '20L.filter.status0': 'Серые (0)',
    '20L.filter.statusIC': 'Жёлтые (IC)',
    '20L.filter.statusLead': 'Синие (Lead)',
    '20L.filter.statusSales': 'Зелёные (Sales)',
    
    // Counterparty Card
    '20L.counterparty.stage': 'Этап',
    '20L.counterparty.classification': 'Классификация',
    '20L.counterparty.source': 'Источник',
    '20L.counterparty.noComment': 'Без комментария',
    '20L.counterparty.add': 'Добавить контрагента',
    '20L.counterparty.create': 'Создать контрагента',
    '20L.counterparty.edit': 'Редактировать контрагента',
    '20L.counterparty.name': 'Имя контрагента',
    '20L.counterparty.nameRequired': 'Обязательное поле',
    '20L.counterparty.namePlaceholder': 'Имя компании или человека',
    '20L.counterparty.status': 'Статус',
    '20L.counterparty.statusAuto': 'Авто-устанавливается при создании',
    '20L.counterparty.cycleStage': 'Этап цикла',
    '20L.counterparty.cycleStageAuto': 'Начинается с 1 (CRM)',
    '20L.counterparty.classificationPlaceholder': 'Тип клиента',
    '20L.counterparty.sourcePlaceholder': 'Откуда пришел',
    '20L.counterparty.commentPlaceholder': 'Заметки о контрагенте',
    '20L.counterparty.nextStage': 'Следующий этап',
    '20L.counterparty.maxStage': 'Уже на последнем этапе',
    '20L.counterparty.movedToNextStage': 'Перемещён на следующий этап',
    '20L.counterparty.deleteConfirm': 'Удалить контрагента?',
    '20L.counterparty.deleted': 'Контрагент удалён',
    '20L.counterparty.created': 'Контрагент создан',
    '20L.counterparty.updated': 'Контрагент обновлён',
    
    // Status Names
    '20L.status.0': 'Серый (0)',
    '20L.status.ic': 'В контакте (IC)',
    '20L.status.lead': 'Лид',
    '20L.status.sales': 'Продажа',
    
    // Cycle Stages
    '20L.cycle.1': 'CRM',
    '20L.cycle.2': '0-й звонок',
    '20L.cycle.3': '1-я встреча',
    '20L.cycle.4': '2-я встреча',
    '20L.cycle.5': '3-я встреча',
    '20L.cycle.6': 'Подготовка ОП',
    '20L.cycle.7': 'Отправка ОП',
    '20L.cycle.8': 'Обсуждение ОП',
    '20L.cycle.9': 'Контракт',
    '20L.cycle.10': 'Оплата',
    '20L.cycle.11': 'Доставка',
    
    // Pagination
    '20L.pagination.previous': 'Предыдущие',
    '20L.pagination.next': 'Следующие',
    '20L.pagination.showing': 'Показано',
    '20L.pagination.of': 'из',
    
    // Empty States
    '20L.empty.noCounterparties': 'Нет контрагентов',
    '20L.empty.addFirst': 'Добавьте первого контрагента для начала работы',
    '20L.empty.noFilterResults': 'Нет контрагентов с этим статусом',
    
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
    'common.previous': 'Назад',
    
    // Errors
    'error.loadingData': 'Ошибка загрузки данных',
    'error.noSession': 'Нет активной сессии',
    'error.savingFailed': 'Ошибка сохранения',
    'error.deletingFailed': 'Ошибка удаления',
    'error.notFound': 'Не найдено',
    'error.generic': 'Произошла ошибка'
  },
  
  en: {
    // Product Selector
    '20L.productSelector.title': '20L Lead Management System',
    '20L.productSelector.subtitle': 'Select product to work with',
    '20L.productSelector.createFirst': 'Create first product',
    '20L.productSelector.createFirstDesc': 'Add a product you work with',
    '20L.productSelector.addProduct': 'Add Product',
    '20L.productSelector.loading': 'Loading products...',
    '20L.productSelector.noProducts': 'No products',
    '20L.productSelector.selectProduct': 'Select product',
    
    // Product Form
    '20L.product.name': 'Product name',
    '20L.product.nameRequired': 'Required field',
    '20L.product.namePlaceholder': 'e.g: Dubai Real Estate',
    '20L.product.comment': 'Comment',
    '20L.product.commentOptional': 'Optional',
    '20L.product.commentPlaceholder': 'Additional product info',
    '20L.product.save': 'Save Product',
    '20L.product.saving': 'Saving...',
    '20L.product.create': 'Create Product',
    '20L.product.created': 'Product created',
    '20L.product.updated': 'Product updated',
    '20L.product.edit': 'Edit',
    '20L.product.delete': 'Delete',
    '20L.product.selector': 'Product Selection',
    '20L.product.addNew': 'Add New',
    '20L.product.createFirstSubtitle': 'Add a product to start working',
    
    // Dashboard
    '20L.dashboard.title': 'Lead Board',
    '20L.dashboard.backToProducts': 'Back to Products',
    '20L.dashboard.loading': 'Loading statistics...',
    '20L.dashboard.addCounterparty': 'Add Counterparty',
    
    // Statistics
    '20L.stats.leads': 'Leads',
    '20L.stats.leadsTarget': 'Target: 20 active leads',
    '20L.stats.ic': 'In Contact (IC)',
    '20L.stats.icTarget': 'Actively communicating',
    '20L.stats.counterparties': 'Counterparties',
    '20L.stats.counterpartiesTarget': 'Total in database',
    '20L.stats.sales': 'Sales',
    '20L.stats.salesTarget': 'Successful deals',
    '20L.stats.progress': 'Progress to target',
    '20L.stats.remaining': 'remaining to target',
    
    // Filters
    '20L.filter.all': 'All',
    '20L.filter.status0': 'Gray (0)',
    '20L.filter.statusIC': 'Yellow (IC)',
    '20L.filter.statusLead': 'Blue (Lead)',
    '20L.filter.statusSales': 'Green (Sales)',
    
    // Counterparty Card
    '20L.counterparty.stage': 'Stage',
    '20L.counterparty.classification': 'Classification',
    '20L.counterparty.source': 'Source',
    '20L.counterparty.noComment': 'No comment',
    '20L.counterparty.add': 'Add Counterparty',
    '20L.counterparty.create': 'Create Counterparty',
    '20L.counterparty.edit': 'Edit Counterparty',
    '20L.counterparty.name': 'Counterparty name',
    '20L.counterparty.nameRequired': 'Required field',
    '20L.counterparty.namePlaceholder': 'Company or person name',
    '20L.counterparty.status': 'Status',
    '20L.counterparty.statusAuto': 'Auto-assigned on creation',
    '20L.counterparty.cycleStage': 'Cycle stage',
    '20L.counterparty.cycleStageAuto': 'Starts at 1 (CRM)',
    '20L.counterparty.classificationPlaceholder': 'Client type',
    '20L.counterparty.sourcePlaceholder': 'Where from',
    '20L.counterparty.commentPlaceholder': 'Notes about counterparty',
    '20L.counterparty.nextStage': 'Next Stage',
    '20L.counterparty.maxStage': 'Already at final stage',
    '20L.counterparty.movedToNextStage': 'Moved to next stage',
    '20L.counterparty.deleteConfirm': 'Delete counterparty?',
    '20L.counterparty.deleted': 'Counterparty deleted',
    '20L.counterparty.created': 'Counterparty created',
    '20L.counterparty.updated': 'Counterparty updated',
    
    // Status Names
    '20L.status.0': 'Gray (0)',
    '20L.status.ic': 'In Contact (IC)',
    '20L.status.lead': 'Lead',
    '20L.status.sales': 'Sale',
    
    // Cycle Stages
    '20L.cycle.1': 'CRM',
    '20L.cycle.2': 'Initial Call',
    '20L.cycle.3': '1st Meeting',
    '20L.cycle.4': '2nd Meeting',
    '20L.cycle.5': '3rd Meeting',
    '20L.cycle.6': 'Proposal Prep',
    '20L.cycle.7': 'Send Proposal',
    '20L.cycle.8': 'Discuss Proposal',
    '20L.cycle.9': 'Contract',
    '20L.cycle.10': 'Payment',
    '20L.cycle.11': 'Delivery',
    
    // Pagination
    '20L.pagination.previous': 'Previous',
    '20L.pagination.next': 'Next',
    '20L.pagination.showing': 'Showing',
    '20L.pagination.of': 'of',
    
    // Empty States
    '20L.empty.noCounterparties': 'No counterparties',
    '20L.empty.addFirst': 'Add first counterparty to start working',
    '20L.empty.noFilterResults': 'No counterparties with this status',
    
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
    'common.previous': 'Previous',
    
    // Errors
    'error.loadingData': 'Error loading data',
    'error.noSession': 'No active session',
    'error.savingFailed': 'Save failed',
    'error.deletingFailed': 'Delete failed',
    'error.notFound': 'Not found',
    'error.generic': 'An error occurred'
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
    console.log(`🌍 [20L] Language set to: ${lang}`);
    return true;
  }
  console.warn(`⚠️ [20L] Language not supported: ${lang}`);
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

console.log('🌍 [20L] i18n initialized:', currentLanguage);