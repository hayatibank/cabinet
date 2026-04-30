import { API_URL } from '../js/config.js';

const REFERENCE_COLLECTION_PATH = 'referenceBooksCabinet/financialStatementInputItemsIndividualDefault/items';

const SNAPSHOT_COLLECTIONS = {
  income: 'snapshot_income_categories',
  expenses: 'snapshot_exp_categories',
  assets: 'snapshot_asset_categories',
  liabilities: 'snapshot_liability_categories'
};

const LEGACY_SYSTEM_COLLECTIONS = {
  income: 'system_income_categories',
  expenses: 'system_exp_categories',
  assets: 'system_asset_categories',
  liabilities: 'system_liability_categories'
};

const SUBSECTION_GROUP_KEYS = {
  income: {
    earned: 'income.A',
    passive: 'income.C',
    portfolio: 'income.E'
  },
  expenses: {
    preliminary: 'expenses.0',
    main: 'expenses.1'
  },
  assets: {
    factual: 'assets.N',
    luxury: 'assets.P'
  },
  liabilities: {
    main: 'liabilities.T'
  }
};

const INPUT_ITEMS_SEED = [
  { reportSection: 'income', reportSubsection: 'earned', reportCode: 'A.1', order: 110, label: { en: 'Salary #1', ru: 'Зарплата #1', ar: 'Salary #1' } },
  { reportSection: 'income', reportSubsection: 'earned', reportCode: 'A.2', order: 120, label: { en: 'Salary #2', ru: 'Зарплата #2', ar: 'Salary #2' } },
  { reportSection: 'income', reportSubsection: 'earned', reportCode: 'A.3', order: 130, label: { en: 'Other earned income', ru: 'Прочий наемный доход', ar: 'Other earned income' } },
  { reportSection: 'income', reportSubsection: 'passive', reportCode: 'C.1', order: 210, label: { en: 'Business (NET)', ru: 'Бизнес (NET)', ar: 'Business (NET)' } },
  { reportSection: 'income', reportSubsection: 'passive', reportCode: 'C.2', order: 220, label: { en: 'Real estate (NET)', ru: 'Недвижимость (NET)', ar: 'Real estate (NET)' } },
  { reportSection: 'income', reportSubsection: 'passive', reportCode: 'C.3', order: 230, label: { en: 'Other passive income', ru: 'Прочий пассивный доход', ar: 'Other passive income' } },
  { reportSection: 'income', reportSubsection: 'portfolio', reportCode: 'E.1', order: 310, label: { en: 'Long-term investing', ru: 'Долгосрочное инвестирование', ar: 'Long-term investing' } },
  { reportSection: 'income', reportSubsection: 'portfolio', reportCode: 'E.2', order: 320, label: { en: 'Investment projects', ru: 'Инвестиционные проекты', ar: 'Investment projects' } },
  { reportSection: 'income', reportSubsection: 'portfolio', reportCode: 'E.3', order: 330, label: { en: 'Other portfolio income', ru: 'Прочий портфельный доход', ar: 'Other portfolio income' } },

  { reportSection: 'expenses', reportSubsection: 'preliminary', reportCode: '0.1', order: 110, label: { en: 'Investments', ru: 'Инвестиции', ar: 'Investments' } },
  { reportSection: 'expenses', reportSubsection: 'preliminary', reportCode: '0.2', order: 120, label: { en: 'Savings', ru: 'Сбережения', ar: 'Savings' } },
  { reportSection: 'expenses', reportSubsection: 'preliminary', reportCode: '0.3', order: 130, label: { en: 'Charity', ru: 'Благотворительность', ar: 'Charity' } },
  { reportSection: 'expenses', reportSubsection: 'preliminary', reportCode: '0.4', order: 140, label: { en: 'Pocket money', ru: 'Карман', ar: 'Pocket money' } },
  { reportSection: 'expenses', reportSubsection: 'preliminary', reportCode: '0.5', order: 150, label: { en: 'Entertainment', ru: 'Развлечения', ar: 'Entertainment' } },
  { reportSection: 'expenses', reportSubsection: 'preliminary', reportCode: '0.6', order: 160, label: { en: 'Taxes', ru: 'Налоги', ar: 'Taxes' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.1', order: 210, label: { en: 'Food', ru: 'Питание', ar: 'Food' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.2', order: 220, label: { en: 'Marriage', ru: 'Супружество', ar: 'Marriage' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.3', order: 230, label: { en: 'Housing (installment/rent + utilities)', ru: 'Жилье (рассрочка/рент + КУ)', ar: 'Housing (installment/rent + utilities)' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.4', order: 240, label: { en: 'Wardrobe', ru: 'Гардероб', ar: 'Wardrobe' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.5', order: 250, label: { en: 'Transport (incl. installments)', ru: 'Транспорт (вкл. рассрочки)', ar: 'Transport (incl. installments)' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.6', order: 260, label: { en: 'Communications', ru: 'Коммуникации', ar: 'Communications' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.7', order: 270, label: { en: 'Fitness', ru: 'Фитнес', ar: 'Fitness' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.8', order: 280, label: { en: 'Hobbies', ru: 'Хобби', ar: 'Hobbies' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.9', order: 290, label: { en: 'Health', ru: 'Здоровье', ar: 'Health' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.10', order: 300, label: { en: 'Children', ru: 'Дети', ar: 'Children' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.11', order: 310, label: { en: 'Other installments', ru: 'Прочие рассрочки', ar: 'Other installments' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.12', order: 320, label: { en: 'Personal loans', ru: 'Персональные займы', ar: 'Personal loans' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.13', order: 330, label: { en: 'Other debts', ru: 'Прочие задолженности', ar: 'Other debts' } },
  { reportSection: 'expenses', reportSubsection: 'main', reportCode: '1.14', order: 340, label: { en: 'Other expenses', ru: 'Прочие расходы', ar: 'Other expenses' } },

  { reportSection: 'assets', reportSubsection: 'factual', reportCode: 'N.1', order: 110, label: { en: 'Bank accounts', ru: 'Банковские счета', ar: 'Bank accounts' } },
  { reportSection: 'assets', reportSubsection: 'factual', reportCode: 'N.2', order: 120, label: { en: 'Cash', ru: 'Наличные д/с', ar: 'Cash' } },
  { reportSection: 'assets', reportSubsection: 'factual', reportCode: 'N.3', order: 130, label: { en: 'Digital assets', ru: 'ЦФА', ar: 'Digital assets' } },
  { reportSection: 'assets', reportSubsection: 'factual', reportCode: 'N.4', order: 140, label: { en: 'Accounts receivable', ru: 'Дебиторская задолженность', ar: 'Accounts receivable' } },
  { reportSection: 'assets', reportSubsection: 'factual', reportCode: 'N.5', order: 150, label: { en: 'Portfolio', ru: 'Портфель', ar: 'Portfolio' } },
  { reportSection: 'assets', reportSubsection: 'factual', reportCode: 'N.6', order: 160, label: { en: 'Business (valuation, NET)', ru: 'Бизнес (оценка, NET)', ar: 'Business (valuation, NET)' } },
  { reportSection: 'assets', reportSubsection: 'factual', reportCode: 'N.7', order: 170, label: { en: 'Real estate (minus installments)', ru: 'Недвижимость (минус рассрочка)', ar: 'Real estate (minus installments)' } },
  { reportSection: 'assets', reportSubsection: 'factual', reportCode: 'N.8', order: 180, label: { en: 'Other assets', ru: 'Прочие активы', ar: 'Other assets' } },
  { reportSection: 'assets', reportSubsection: 'luxury', reportCode: 'P.1', order: 210, label: { en: 'Home(s)', ru: 'Дом(а)', ar: 'Home(s)' } },
  { reportSection: 'assets', reportSubsection: 'luxury', reportCode: 'P.2', order: 220, label: { en: 'Car(s)', ru: 'Автомобиль(и)', ar: 'Car(s)' } },
  { reportSection: 'assets', reportSubsection: 'luxury', reportCode: 'P.3', order: 230, label: { en: 'Other luxury', ru: 'Прочая роскошь', ar: 'Other luxury' } },

  { reportSection: 'liabilities', reportSubsection: 'main', reportCode: 'T.1', order: 110, label: { en: 'Housing installments', ru: 'Жилищные рассрочки', ar: 'Housing installments' } },
  { reportSection: 'liabilities', reportSubsection: 'main', reportCode: 'T.2', order: 120, label: { en: 'Transport installments', ru: 'Транспортные рассрочки', ar: 'Transport installments' } },
  { reportSection: 'liabilities', reportSubsection: 'main', reportCode: 'T.3', order: 130, label: { en: 'Other installments', ru: 'Прочие рассрочки', ar: 'Other installments' } },
  { reportSection: 'liabilities', reportSubsection: 'main', reportCode: 'T.4', order: 140, label: { en: 'Personal loans', ru: 'Персональные займы', ar: 'Personal loans' } },
  { reportSection: 'liabilities', reportSubsection: 'main', reportCode: 'T.5', order: 150, label: { en: 'Other debts', ru: 'Прочие задолженности', ar: 'Other debts' } },
  { reportSection: 'liabilities', reportSubsection: 'main', reportCode: 'T.6', order: 160, label: { en: 'Other liabilities', ru: 'Прочие пассивы', ar: 'Other liabilities' } }
].map((item) => ({
  ...item,
  status: 'active'
}));

let referenceItemsCache = null;
let referenceItemsPromise = null;
const snapshotEnsurePromises = new Map();

export { SNAPSHOT_COLLECTIONS, LEGACY_SYSTEM_COLLECTIONS, buildSnapshotDocument };

export function getSnapshotCollectionName(section) {
  return SNAPSHOT_COLLECTIONS[section];
}

export function reportCodeToDocId(reportCode) {
  return String(reportCode || '').replace(/\./g, '_');
}

export function getCurrentLanguage() {
  return window.i18n?.getCurrentLanguage?.() || document.documentElement.lang || 'ru';
}

export function getLocalizedLabel(labelMap, lang = getCurrentLanguage()) {
  return String(
    labelMap?.[lang] ||
    labelMap?.en ||
    labelMap?.ru ||
    ''
  ).trim();
}

export function getItemGroupCode(reportCode) {
  return String(reportCode || '').split('.')[0] || '';
}

export function getItemLabelKey(item) {
  return `${item.reportSection}.${item.reportCode}`;
}

export function getGroupLabelKey(item) {
  return SUBSECTION_GROUP_KEYS[item.reportSection]?.[item.reportSubsection] || '';
}

export function localizeReferenceItem(item, lang = getCurrentLanguage()) {
  const t = window.i18n?.t?.bind(window.i18n);
  const labelKey = getItemLabelKey(item);
  const groupLabelKey = getGroupLabelKey(item);
  const translatedLabel = typeof t === 'function' ? t(labelKey) : labelKey;
  const translatedGroup = typeof t === 'function' ? t(groupLabelKey) : groupLabelKey;

  return {
    ...item,
    code: item.reportCode,
    groupCode: getItemGroupCode(item.reportCode),
    label: translatedLabel !== labelKey ? translatedLabel : getLocalizedLabel(item.label, lang),
    group: translatedGroup !== groupLabelKey ? translatedGroup : item.reportSubsection,
    idx: Number(item.idx) || 0
  };
}

export function buildSectionStructures(referenceItems) {
  const structures = {
    income: [],
    expenses: [],
    assets: [],
    liabilities: []
  };

  const counters = {
    income: 0,
    expenses: 0,
    assets: 0,
    liabilities: 0
  };

  referenceItems
    .slice()
    .sort((a, b) => Number(a.order) - Number(b.order))
    .forEach((item) => {
      const section = item.reportSection;
      counters[section] += 1;
      structures[section].push({
        ...item,
        idx: counters[section],
        code: item.reportCode,
        group: getItemGroupCode(item.reportCode),
        labelKey: getItemLabelKey(item)
      });
    });

  return structures;
}

export async function getFinancialStatementInputItems(authToken) {
  if (referenceItemsCache) {
    return referenceItemsCache;
  }

  if (!referenceItemsPromise) {
    referenceItemsPromise = loadAndSeedReferenceItems(authToken)
      .then((items) => {
        referenceItemsCache = items;
        return items;
      })
      .finally(() => {
        referenceItemsPromise = null;
      });
  }

  return referenceItemsPromise;
}

export async function ensureSnapshotCollections(accountId, year, authToken, referenceItems) {
  const cacheKey = `${accountId}::${year}`;
  if (!snapshotEnsurePromises.has(cacheKey)) {
    snapshotEnsurePromises.set(
      cacheKey,
      seedSnapshotCollections(accountId, year, authToken, referenceItems).finally(() => {
        snapshotEnsurePromises.delete(cacheKey);
      })
    );
  }

  return snapshotEnsurePromises.get(cacheKey);
}

export async function fetchFirestoreCollection(path, authToken) {
  try {
    const response = await fetch(`${API_URL}/api/firestore/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        path,
        authToken
      })
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return Array.isArray(result.documents) ? result.documents : [];
  } catch (_error) {
    return [];
  }
}

export async function setFirestoreDocument(path, docId, data, authToken) {
  const response = await fetch(`${API_URL}/api/firestore/set`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify({
      path,
      docId,
      data,
      authToken
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to save Firestore document: ${path}/${docId}`);
  }

  return response.json();
}

async function loadAndSeedReferenceItems(authToken) {
  const existingDocs = await fetchFirestoreCollection(REFERENCE_COLLECTION_PATH, authToken);
  const existingByCode = new Map(existingDocs.map((doc) => [String(doc.reportCode || '').trim(), doc]));

  const writes = INPUT_ITEMS_SEED
    .filter((seed) => needsReferenceUpsert(existingByCode.get(seed.reportCode), seed))
    .map((seed) => {
      const existing = existingByCode.get(seed.reportCode);
      const docId = reportCodeToDocId(seed.reportCode);

      return setFirestoreDocument(
        REFERENCE_COLLECTION_PATH,
        docId,
        {
          status: seed.status,
          createdAt: existing?.createdAt || new Date().toISOString(),
          label: seed.label,
          reportSection: seed.reportSection,
          reportSubsection: seed.reportSubsection,
          reportCode: seed.reportCode,
          order: seed.order
        },
        authToken
      );
    });

  if (writes.length) {
    await Promise.all(writes);
  }

  const finalDocs = writes.length
    ? await fetchFirestoreCollection(REFERENCE_COLLECTION_PATH, authToken)
    : existingDocs;

  return normalizeReferenceItems(finalDocs);
}

async function seedSnapshotCollections(accountId, year, authToken, referenceItems) {
  const basePath = `accounts/${accountId}/fin_statements/${year}`;

  await Promise.all(
    Object.keys(SNAPSHOT_COLLECTIONS).map(async (section) => {
      const snapshotPath = `${basePath}/${SNAPSHOT_COLLECTIONS[section]}`;
      const legacyPath = `${basePath}/${LEGACY_SYSTEM_COLLECTIONS[section]}`;
      const [snapshotDocs, legacyDocs] = await Promise.all([
        fetchFirestoreCollection(snapshotPath, authToken),
        fetchFirestoreCollection(legacyPath, authToken)
      ]);

      const snapshotByCode = remapLegacyLikeSnapshotDocs(section, snapshotDocs);
      const legacyByCode = remapLegacyLikeSnapshotDocs(section, legacyDocs);
      const sectionItems = referenceItems
        .filter((item) => item.reportSection === section)
        .sort((a, b) => Number(a.order) - Number(b.order))
        .map((item, index) => ({ ...item, idx: index + 1 }));

      const writes = sectionItems
        .filter((item) => shouldWriteSnapshotItem(item, snapshotByCode, legacyByCode))
        .map((item) => {
          const currentSnapshot = snapshotByCode.get(item.reportCode);
          const legacy = legacyByCode.get(item.reportCode);
          const source = currentSnapshot || legacy;
          const amount = Number(source?.amount) || 0;

          return setFirestoreDocument(
            snapshotPath,
            reportCodeToDocId(item.reportCode),
            buildSnapshotDocument(item, amount, legacy?.createdAt),
            authToken
          );
        });

      if (writes.length) {
        await Promise.all(writes);
      }
    })
  );
}

function shouldWriteSnapshotItem(item, snapshotByCode, legacyByCode) {
  const snapshotDoc = snapshotByCode.get(item.reportCode);
  if (!snapshotDoc) return true;

  const expectedLabel = normalizeLabelMap(item.label);
  const actualLabel = normalizeLabelMap(snapshotDoc.labelMap || snapshotDoc.label || {});
  if (JSON.stringify(expectedLabel) !== JSON.stringify(actualLabel)) {
    return true;
  }

  return !snapshotDoc.createdAt && legacyByCode.has(item.reportCode);
}

function remapLegacyLikeSnapshotDocs(section, docs) {
  const byCode = new Map(docs.map((doc) => [String(doc.code || '').trim(), doc]));
  if (section !== 'assets') {
    return byCode;
  }

  const hasNewTail = byCode.has('N.8');
  const n3 = byCode.get('N.3');
  const n3Label = String(n3?.label || n3?.labelMap?.en || n3?.labelMap?.ru || '').toLowerCase();
  const looksOldAssetsShape = !hasNewTail && n3 && !n3Label.includes('digital') && !n3Label.includes('цфа');
  if (!looksOldAssetsShape) {
    return byCode;
  }

  const remapped = new Map();
  for (const [code, doc] of byCode.entries()) {
    const shiftedCode = shiftLegacyAssetCode(code);
    remapped.set(shiftedCode, { ...doc, code: shiftedCode });
  }
  return remapped;
}

function shiftLegacyAssetCode(code) {
  switch (code) {
    case 'N.3':
      return 'N.4';
    case 'N.4':
      return 'N.5';
    case 'N.5':
      return 'N.6';
    case 'N.6':
      return 'N.7';
    case 'N.7':
      return 'N.8';
    default:
      return code;
  }
}

function buildSnapshotDocument(item, amount = 0, createdAt = null) {
  return {
    status: 'active',
    createdAt: createdAt || new Date().toISOString(),
    code: item.reportCode,
    idx: item.idx,
    order: item.order,
    reportSection: item.reportSection,
    reportSubsection: item.reportSubsection,
    groupCode: getItemGroupCode(item.reportCode),
    label: getLocalizedLabel(item.label, 'ru'),
    labelMap: item.label,
    amount: Number(amount) || 0
  };
}

function needsReferenceUpsert(existing, seed) {
  if (!existing) return true;

  return (
    String(existing.status || '') !== seed.status ||
    String(existing.reportSection || '') !== seed.reportSection ||
    String(existing.reportSubsection || '') !== seed.reportSubsection ||
    String(existing.reportCode || '') !== seed.reportCode ||
    Number(existing.order) !== Number(seed.order) ||
    JSON.stringify(normalizeLabelMap(existing.label)) !== JSON.stringify(normalizeLabelMap(seed.label))
  );
}

function normalizeReferenceItems(docs) {
  const allowedCodes = new Set(INPUT_ITEMS_SEED.map((item) => item.reportCode));
  const normalized = docs
    .map((doc) => ({
      status: String(doc.status || 'active'),
      createdAt: doc.createdAt || null,
      label: normalizeLabelMap(doc.label),
      reportSection: String(doc.reportSection || '').trim(),
      reportSubsection: String(doc.reportSubsection || '').trim(),
      reportCode: String(doc.reportCode || doc.code || '').trim(),
      order: Number(doc.order) || 0
    }))
    .filter((doc) => doc.status === 'active' && doc.reportSection && doc.reportCode && allowedCodes.has(doc.reportCode))
    .sort((a, b) => Number(a.order) - Number(b.order));

  const counters = {
    income: 0,
    expenses: 0,
    assets: 0,
    liabilities: 0
  };

  return normalized.map((item) => {
    counters[item.reportSection] += 1;
    return {
      ...item,
      idx: counters[item.reportSection]
    };
  });
}

function normalizeLabelMap(label) {
  return {
    en: String(label?.en || '').trim(),
    ru: String(label?.ru || '').trim(),
    ar: String(label?.ar || '').trim()
  };
}
