const PREFS_STORAGE_KEY = 'hayati_prefs_v1';
const PREFS_CHANGED_EVENT = 'hayatiPrefsChanged';

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      language: parsed.language || localStorage.getItem('hayati_lang') || 'ru',
      currency: String(parsed.currency || 'USD').toUpperCase(),
      metricSystem: String(parsed.metricSystem || 'imperial').toLowerCase(),
      timezone: String(parsed.timezone || 'utc').toLowerCase(),
      updatedAtMs: Number(parsed.updatedAtMs || 0) || 0
    };
  } catch (_error) {
    return {
      language: localStorage.getItem('hayati_lang') || 'ru',
      currency: 'USD',
      metricSystem: 'imperial',
      timezone: 'utc',
      updatedAtMs: 0
    };
  }
}

function savePrefs(patch = {}) {
  const current = loadPrefs();
  const next = {
    ...current,
    ...patch,
    updatedAtMs: Date.now()
  };

  localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
  localStorage.setItem('hayati_lang', next.language);
  window.dispatchEvent(new CustomEvent(PREFS_CHANGED_EVENT, {
    detail: { prefs: next, source: 'topbar-controls' }
  }));
  return next;
}

function setActiveLanguage(lang) {
  document.querySelectorAll('.topbar .lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function syncControlsFromPrefs() {
  const prefs = loadPrefs();
  const currency = document.getElementById('topbarCurrencySwitch');
  const metric = document.getElementById('topbarMetricSwitch');
  const settingsCurrency = document.getElementById('currencySelect');
  const settingsMetric = document.getElementById('metricSystemSelect');

  if (currency) currency.value = prefs.currency;
  if (metric) metric.value = prefs.metricSystem;
  if (settingsCurrency) settingsCurrency.value = prefs.currency.toLowerCase();
  if (settingsMetric) settingsMetric.value = prefs.metricSystem;
  setActiveLanguage(prefs.language);
}

function attachListeners() {
  document.querySelectorAll('.topbar .lang-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.lang;
      if (!lang || !window.i18n) return;
      if (lang === loadPrefs().language) return;
      await window.i18n.setLanguage(lang);
      savePrefs({ language: lang });
      setActiveLanguage(lang);
    });
  });

  document.getElementById('topbarCurrencySwitch')?.addEventListener('change', (event) => {
    const currency = String(event.target.value || 'USD').toUpperCase();
    savePrefs({ currency });
    const settingsCurrency = document.getElementById('currencySelect');
    if (settingsCurrency) settingsCurrency.value = currency.toLowerCase();
  });

  document.getElementById('topbarMetricSwitch')?.addEventListener('change', (event) => {
    const metricSystem = String(event.target.value || 'imperial').toLowerCase();
    savePrefs({ metricSystem });
  });

  document.getElementById('currencySelect')?.addEventListener('change', (event) => {
    const currency = String(event.target.value || 'usd').toUpperCase();
    const topbarCurrency = document.getElementById('topbarCurrencySwitch');
    if (topbarCurrency) topbarCurrency.value = currency;
    savePrefs({ currency });
  });

  document.getElementById('metricSystemSelect')?.addEventListener('change', (event) => {
    const metricSystem = String(event.target.value || 'imperial').toLowerCase();
    const topbarMetric = document.getElementById('topbarMetricSwitch');
    if (topbarMetric) topbarMetric.value = metricSystem;
    savePrefs({ metricSystem });
  });

  window.addEventListener('languageChanged', (event) => {
    const lang = event?.detail?.lang || loadPrefs().language;
    savePrefs({ language: lang });
    setActiveLanguage(lang);
  });

  window.addEventListener(PREFS_CHANGED_EVENT, () => {
    syncControlsFromPrefs();
  });
}

function initTopbarControls() {
  if (!document.querySelector('.topbar')) return;
  syncControlsFromPrefs();
  attachListeners();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTopbarControls);
} else {
  initTopbarControls();
}
