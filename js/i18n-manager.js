/* /webapp/js/i18n-manager.js v1.0.4 */
// CHANGELOG v1.0.4:
// - PERFORMANCE: Incremental page updates (batch of 50 elements)
// - FIXED: Android freeze when switching languages on complex pages

class I18nManager {
  constructor() {
    this.currentLang = 'ru';
    this.translations = {};
    this.fallback = {};
    this.initialized = false;
    this.supportedLanguages = ['ru', 'en', 'ar'];
  }
  
  async init() {
    console.log('🌍 [i18n] Initializing...');
    
    this.currentLang = this.detectLanguage();
    console.log(`🎯 [i18n] Detected language: ${this.currentLang}`);
    
    try {
      await this.loadLanguage('ru');
      this.fallback = { ...this.translations };
      
      if (this.currentLang !== 'ru') {
        await this.loadLanguage(this.currentLang);
      }
      
      this.initialized = true;
      console.log(`✅ [i18n] Ready (${Object.keys(this.translations).length} keys)`);
      
      window.dispatchEvent(new CustomEvent('i18nReady', {
        detail: { lang: this.currentLang }
      }));
      
    } catch (err) {
      console.error('❌ [i18n] Initialization failed:', err);
      this.initialized = false;
    }
  }
  
  detectLanguage() {
    try {
      const saved = localStorage.getItem('hayati_lang');
      if (saved && this.supportedLanguages.includes(saved)) {
        console.log('💾 [i18n] Language from localStorage:', saved);
        return saved;
      }
    } catch (e) {
      console.warn('⚠️ [i18n] localStorage not available');
    }
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (tgUser?.language_code) {
        const lang = tgUser.language_code.toLowerCase().split('-')[0];
        if (this.supportedLanguages.includes(lang)) {
          console.log('🦾 [i18n] Language from Telegram:', lang);
          return lang;
        }
      }
    }
    
    if (typeof navigator !== 'undefined' && navigator.language) {
      const lang = navigator.language.toLowerCase().split('-')[0];
      if (this.supportedLanguages.includes(lang)) {
        console.log('🌐 [i18n] Language from browser:', lang);
        return lang;
      }
    }
    
    console.log('🏁 [i18n] Using default language: ru');
    return 'ru';
  }
  
  async loadLanguage(lang) {
    try {
      console.log(`📦 [i18n] Loading ${lang}.json...`);
      
      const response = await fetch(`./i18n/${lang}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (lang === 'ru') {
        this.fallback = data;
      }
      
      if (lang === this.currentLang) {
        this.translations = data;
      }
      
      console.log(`✅ [i18n] Loaded ${lang}.json (${Object.keys(data).length} keys)`);
      
    } catch (err) {
      console.error(`❌ [i18n] Failed to load ${lang}.json:`, err);
      
      if (Object.keys(this.fallback).length === 0) {
        throw new Error('Failed to load any translations');
      }
    }
  }
  
  t(key) {
    if (!this.initialized) {
      console.warn(`⚠️ [i18n] Not initialized, returning key: ${key}`);
      return key;
    }
    
    if (this.translations[key] !== undefined) {
      return this.translations[key];
    }
    
    if (this.fallback[key] !== undefined) {
      console.warn(`⚠️ [i18n] Key "${key}" not found in ${this.currentLang}, using fallback`);
      return this.fallback[key];
    }
    
    console.warn(`⚠️ [i18n] Key "${key}" not found in any language`);
    return key;
  }
  
  async setLanguage(lang) {
    if (!this.supportedLanguages.includes(lang)) {
      console.error(`❌ [i18n] Language "${lang}" not supported`);
      return false;
    }
    
    if (this.currentLang === lang) {
      console.log(`ℹ️ [i18n] Already using ${lang}`);
      return true;
    }
    
    console.log(`🔄 [i18n] Switching to ${lang}...`);
    
    try {
      await this.loadLanguage(lang);
      this.currentLang = lang;
      
      try {
        localStorage.setItem('hayati_lang', lang);
      } catch (e) {
        console.warn('⚠️ [i18n] Could not save language preference');
      }
      
      console.log(`✅ [i18n] Switched to ${lang}`);
      
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { lang }
      }));
      
      // ✅ CRITICAL FIX: Use incremental update
      await this.updatePageIncremental();
      
      return true;
      
    } catch (err) {
      console.error(`❌ [i18n] Failed to switch to ${lang}:`, err);
      return false;
    }
  }
  
  /**
   * ✅ NEW: Incremental page update (prevents Android freeze)
   * Updates in batches of 50 elements with delays
   */
  async updatePageIncremental() {
    console.log('🔄 [i18n] Starting incremental page update...');
    
    const BATCH_SIZE = 50;
    let updated = 0;
    let skipped = 0;
    
    // Get all elements
    const elements = Array.from(document.querySelectorAll('[data-i18n]'));
    console.log(`📊 Found ${elements.length} translatable elements`);
    
    // Process in batches
    for (let i = 0; i < elements.length; i += BATCH_SIZE) {
      const batch = elements.slice(i, i + BATCH_SIZE);
      
      // Update batch
      batch.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = this.t(key);
        
        if (translation === key) {
          skipped++;
          return;
        }
        
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'input' || tagName === 'textarea') {
          if (element.hasAttribute('placeholder')) {
            element.placeholder = translation;
            updated++;
          }
        } else if (tagName === 'button') {
          const span = element.querySelector('span');
          if (span) {
            span.textContent = translation;
          } else {
            element.textContent = translation;
          }
          updated++;
        } else {
          element.textContent = translation;
          updated++;
        }
      });
      
      // ✅ YIELD TO UI: Let browser breathe between batches
      if (i + BATCH_SIZE < elements.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
        console.log(`⏳ Updated ${Math.min(i + BATCH_SIZE, elements.length)}/${elements.length} elements...`);
      }
    }
    
    // Update title
    const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
    if (titleKey) {
      const titleTranslation = this.t(titleKey);
      if (titleTranslation !== titleKey) {
        document.title = titleTranslation;
        updated++;
      }
    }
    
    console.log(`✅ [i18n] Update complete: ${updated} updated, ${skipped} skipped`);
  }
  
  /**
   * Legacy update method (kept for initial page load)
   */
  updatePage() {
    console.log('🔄 [i18n] Updating page translations...');
    
    requestAnimationFrame(() => {
      let updated = 0;
      let skipped = 0;
      
      const elements = document.querySelectorAll('[data-i18n]');
      
      elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = this.t(key);
        
        if (translation === key) {
          skipped++;
          return;
        }
        
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'input' || tagName === 'textarea') {
          if (element.hasAttribute('placeholder')) {
            element.placeholder = translation;
            updated++;
          }
        } else if (tagName === 'button') {
          const span = element.querySelector('span');
          if (span) {
            span.textContent = translation;
          } else {
            element.textContent = translation;
          }
          updated++;
        } else {
          element.textContent = translation;
          updated++;
        }
      });
      
      const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
      if (titleKey) {
        const titleTranslation = this.t(titleKey);
        if (titleTranslation !== titleKey) {
          document.title = titleTranslation;
          updated++;
        }
      }
      
      console.log(`✅ [i18n] Updated ${updated} elements, skipped ${skipped} missing keys`);
    });
  }
  
  getCurrentLanguage() {
    return this.currentLang;
  }
  
  getSupportedLanguages() {
    return [...this.supportedLanguages];
  }
  
  isSupported(lang) {
    return this.supportedLanguages.includes(lang);
  }
}

if (typeof window !== 'undefined') {
  window.i18n = new I18nManager();
  console.log('✅ [i18n] Global manager created: window.i18n');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18nManager;
}
