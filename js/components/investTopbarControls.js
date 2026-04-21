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
  const timezone = document.getElementById('topbarTimezoneSwitch');
  const langMobile = document.getElementById('langMobileSelect');
  const settingsCurrency = document.getElementById('currencySelect');
  const settingsMetric = document.getElementById('metricSystemSelect');

  if (currency) currency.value = prefs.currency;
  if (metric) metric.value = prefs.metricSystem;
  if (timezone) timezone.value = prefs.timezone;
  if (langMobile) langMobile.value = prefs.language;
  if (settingsCurrency) settingsCurrency.value = prefs.currency.toLowerCase();
  if (settingsMetric) settingsMetric.value = prefs.metricSystem;
  setActiveLanguage(prefs.language);
}

function setUserChip(label) {
  const value = String(label || '').trim() || (window.i18n?.t?.('auth.status.guest') || 'Guest');
  const desktop = document.getElementById('userChip');
  const mobile = document.getElementById('userChipMenu');
  if (desktop) desktop.textContent = value;
  if (mobile) mobile.textContent = value;
}

function syncAuthActionState() {
  const button = document.getElementById('topbarAuthButton');
  if (!button) return;
  const cabinetVisible = !document.getElementById('cabinetScreen')?.classList.contains('hidden');
  button.textContent = cabinetVisible
    ? (window.i18n?.t?.('auth.logout.button') || 'Logout')
    : (window.i18n?.t?.('auth.login.submit') || 'Sign In');
}

function initResponsiveTopbar() {
  const btn = document.getElementById('menuToggleBtn');
  const backdrop = document.getElementById('menuBackdrop');
  const panel = document.querySelector('.header-meta');
  const langMobile = document.getElementById('langMobileSelect');

  if (langMobile) {
    langMobile.addEventListener('change', async (event) => {
      const lang = String(event.target.value || 'ru').toLowerCase();
      if (!window.i18n || lang === loadPrefs().language) return;
      await window.i18n.setLanguage(lang);
      savePrefs({ language: lang });
      setActiveLanguage(lang);
    });
  }

  if (!btn || !backdrop || !panel) {
    return;
  }

  const openMenu = () => {
    document.body.classList.add('menu-open');
    btn.setAttribute('aria-expanded', 'true');
  };
  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    btn.setAttribute('aria-expanded', 'false');
  };

  btn.addEventListener('click', () => {
    if (document.body.classList.contains('menu-open')) closeMenu();
    else openMenu();
  });
  backdrop.addEventListener('click', closeMenu);
  panel.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest('#topbarAuthButton')) {
      window.setTimeout(closeMenu, 80);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

function initHeaderRailWheelScroll() {
  const rails = Array.from(document.querySelectorAll('.header-rail'));
  if (!rails.length) return;

  rails.forEach((rail) => {
    if (rail.dataset.wheelBound === '1') return;
    rail.dataset.wheelBound = '1';
    rail.addEventListener('wheel', (event) => {
      if (window.innerWidth <= 900) return;
      if (!(event.currentTarget instanceof HTMLElement)) return;
      const el = event.currentTarget;
      const canScrollX = el.scrollWidth - el.clientWidth > 6;
      if (!canScrollX) return;

      const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(dominantDelta) < 1) return;

      event.preventDefault();
      el.scrollBy({ left: dominantDelta, behavior: 'auto' });
    }, { passive: false });
  });
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

  document.getElementById('topbarTimezoneSwitch')?.addEventListener('change', (event) => {
    const timezone = String(event.target.value || 'utc').toLowerCase();
    savePrefs({ timezone });
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
    const langMobile = document.getElementById('langMobileSelect');
    if (langMobile) langMobile.value = lang;
    syncAuthActionState();
  });

  window.addEventListener(PREFS_CHANGED_EVENT, () => {
    syncControlsFromPrefs();
  });

  document.getElementById('topbarAuthButton')?.addEventListener('click', () => {
    const cabinetVisible = !document.getElementById('cabinetScreen')?.classList.contains('hidden');
    if (cabinetVisible && typeof window.logout === 'function') {
      window.logout();
      return;
    }
    window.location.assign('https://auth.hayatibank.ru/');
  });

  window.addEventListener('cabinetReady', (event) => {
    const detail = event?.detail || {};
    setUserChip(detail.displayName || detail.fullName || detail.email || '');
    syncAuthActionState();
  });

  window.addEventListener('cabinetProfileUpdated', (event) => {
    setUserChip(event?.detail?.displayName || '');
  });
}

function initTopbarControls() {
  if (!document.querySelector('.topbar')) return;
  syncControlsFromPrefs();
  setUserChip('');
  syncAuthActionState();
  attachListeners();
  initResponsiveTopbar();
  initHeaderRailWheelScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTopbarControls);
} else {
  initTopbarControls();
}
