const PREFS_STORAGE_KEY = 'hayati_prefs_v1';
const PREFS_CHANGED_EVENT = 'hayatiPrefsChanged';

function loadSharedPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      language: parsed.language || localStorage.getItem('hayati_lang') || 'ru',
      currency: String(parsed.currency || 'usd').toLowerCase(),
      metricSystem: String(parsed.metricSystem || 'imperial').toLowerCase(),
      timezone: String(parsed.timezone || 'utc').toLowerCase(),
      updatedAtMs: Number(parsed.updatedAtMs || 0) || 0
    };
  } catch (_error) {
    return {
      language: localStorage.getItem('hayati_lang') || 'ru',
      currency: 'usd',
      metricSystem: 'imperial',
      timezone: 'utc',
      updatedAtMs: 0
    };
  }
}

function saveSharedPrefs(patch = {}) {
  const current = loadSharedPrefs();
  const next = {
    ...current,
    ...patch,
    updatedAtMs: Date.now()
  };

  localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({
    language: next.language,
    currency: String(next.currency || 'usd').toUpperCase(),
    metricSystem: String(next.metricSystem || 'imperial').toLowerCase(),
    timezone: next.timezone,
    updatedAtMs: next.updatedAtMs
  }));
  localStorage.setItem('hayati_lang', next.language);
  window.dispatchEvent(new CustomEvent(PREFS_CHANGED_EVENT, {
    detail: { prefs: next, source: 'profile-settings' }
  }));
  return next;
}

function syncSettingsControls() {
  const prefs = loadSharedPrefs();
  const languageSelect = document.getElementById('languageSelect');
  const currencySelect = document.getElementById('currencySelect');
  const timezoneSelect = document.getElementById('timezoneSelect');
  const metricSystemSelect = document.getElementById('metricSystemSelect');
  const topbarMetricSwitch = document.getElementById('topbarMetricSwitch');

  if (languageSelect) languageSelect.value = prefs.language;
  if (currencySelect) currencySelect.value = prefs.currency;
  if (timezoneSelect) timezoneSelect.value = prefs.timezone;
  if (metricSystemSelect) metricSystemSelect.value = prefs.metricSystem;
  if (topbarMetricSwitch) topbarMetricSwitch.value = prefs.metricSystem;
}

function showProfileMenu() {
  document.getElementById('profileMenu')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProfileMenu() {
  document.getElementById('profileMenu')?.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

async function handleLanguageChange(lang) {
  if (!window.i18n) return;
  const select = document.getElementById('languageSelect');
  if (select) select.disabled = true;

  try {
    await window.i18n.setLanguage(lang);
    saveSharedPrefs({ language: lang });
  } finally {
    if (select) select.disabled = false;
  }
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const wrapper = input.closest('.password-input-wrapper');
  const eyeIcon = wrapper?.querySelector('.eye-icon');
  const eyeOffIcon = wrapper?.querySelector('.eye-off-icon');

  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon?.classList.add('hidden');
    eyeOffIcon?.classList.remove('hidden');
  } else {
    input.type = 'password';
    eyeIcon?.classList.remove('hidden');
    eyeOffIcon?.classList.add('hidden');
  }
}

function attachSettingsListeners() {
  document.getElementById('currencySelect')?.addEventListener('change', (event) => {
    saveSharedPrefs({ currency: event.target.value });
  });

  document.getElementById('timezoneSelect')?.addEventListener('change', (event) => {
    saveSharedPrefs({ timezone: event.target.value });
  });

  document.getElementById('metricSystemSelect')?.addEventListener('change', (event) => {
    saveSharedPrefs({ metricSystem: String(event.target.value || 'imperial').toLowerCase() });
  });

  window.addEventListener('languageChanged', (event) => {
    const language = event?.detail?.lang || loadSharedPrefs().language;
    saveSharedPrefs({ language });
    syncSettingsControls();
  });

  window.addEventListener(PREFS_CHANGED_EVENT, () => {
    syncSettingsControls();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeProfileMenu();
    }
  });
}

function exposeGlobals() {
  window.showProfileMenu = showProfileMenu;
  window.closeProfileMenu = closeProfileMenu;
  window.handleLanguageChange = handleLanguageChange;
  window.togglePassword = togglePassword;
}

function initProfileSettings() {
  exposeGlobals();
  attachSettingsListeners();
  syncSettingsControls();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfileSettings);
} else {
  initProfileSettings();
}
