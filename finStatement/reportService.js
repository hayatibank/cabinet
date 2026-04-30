/* /webapp/finStatement/reportService.js v1.5.0 */
// CHANGELOG v1.5.0:
// - MOVED: Financial statement items to Firestore-backed reference book
// - CHANGED: Snapshot collections are now the default cabinet source
// - ADDED: Soft migration from legacy system_* collections to snapshot_*
// CHANGELOG v1.4.0:
// - FIXED: All analysis formulas updated to match exact requirements

import { getSession } from '../js/session.js';
import {
  buildSectionStructures,
  ensureSnapshotCollections,
  fetchFirestoreCollection,
  getFinancialStatementInputItems,
  getLocalizedLabel,
  getItemGroupCode,
  getItemLabelKey,
  getGroupLabelKey,
  SNAPSHOT_COLLECTIONS
} from './inputItemsReference.js';

function localizeStructureItem(item) {
  const t = window.i18n?.t?.bind(window.i18n);
  const lang = window.i18n?.getCurrentLanguage?.() || document.documentElement.lang || 'ru';
  const labelKey = getItemLabelKey(item);
  const groupKey = getGroupLabelKey(item);
  const translatedLabel = typeof t === 'function' ? t(labelKey) : labelKey;
  const translatedGroup = typeof t === 'function' ? t(groupKey) : groupKey;

  return {
    ...item,
    code: item.reportCode,
    group: translatedGroup !== groupKey ? translatedGroup : item.reportSubsection,
    groupCode: getItemGroupCode(item.reportCode),
    label: translatedLabel !== labelKey ? translatedLabel : getLocalizedLabel(item.label, lang)
  };
}

export async function getFinancialReport(accountId, year) {
  try {
    console.log(`Loading financial report: ${accountId}, year ${year}`);

    const session = getSession();
    if (!session) throw new Error('No active session');

    const referenceItems = await getFinancialStatementInputItems(session.authToken);
    await ensureSnapshotCollections(accountId, year, session.authToken, referenceItems);

    const sectionStructures = buildSectionStructures(referenceItems);
    const basePath = `accounts/${accountId}/fin_statements/${year}`;

    const [incomeRaw, expensesRaw, assetsRaw, liabilitiesRaw] = await Promise.all([
      fetchFirestoreCollection(`${basePath}/${SNAPSHOT_COLLECTIONS.income}`, session.authToken),
      fetchFirestoreCollection(`${basePath}/${SNAPSHOT_COLLECTIONS.expenses}`, session.authToken),
      fetchFirestoreCollection(`${basePath}/${SNAPSHOT_COLLECTIONS.assets}`, session.authToken),
      fetchFirestoreCollection(`${basePath}/${SNAPSHOT_COLLECTIONS.liabilities}`, session.authToken)
    ]);

    const income = mergeWithStructure(sectionStructures.income, incomeRaw);
    const expenses = mergeWithStructure(sectionStructures.expenses, expensesRaw);
    const assets = mergeWithStructure(sectionStructures.assets, assetsRaw);
    const liabilities = mergeWithStructure(sectionStructures.liabilities, liabilitiesRaw);

    return {
      year,
      income,
      expenses,
      assets,
      liabilities
    };
  } catch (err) {
    console.error('Error fetching financial report:', err);
    throw err;
  }
}

function mergeWithStructure(structure, firestoreData) {
  return structure.map((item) => {
    const match = firestoreData.find((doc) => doc.code === item.reportCode || doc.code === item.code);
    const localizedItem = localizeStructureItem(item);

    return {
      ...localizedItem,
      idx: item.idx,
      amount: match ? (Number(match.amount) || 0) : 0,
      id: match?.id || null
    };
  });
}

export function calculateAnalysis(reportData) {
  const { income, expenses, assets, liabilities } = reportData;

  const passiveIncomeTotal = sumByGroup(income, 'groupCode', 'C');
  const portfolioIncomeTotal = sumByGroup(income, 'groupCode', 'E');
  const totalIncome = sumField(income, 'amount');

  const totalExpenses = sumField(expenses, 'amount');

  const taxes = findValue(expenses, 'code', '0.6') || 0;
  const housingExpenses = findValue(expenses, 'code', '1.3') || 0;

  const activesTotal = sumByGroup(assets, 'groupCode', 'N');
  const luxuryTotal = sumByGroup(assets, 'groupCode', 'P');
  const assetsByBanker = activesTotal + luxuryTotal;
  const assetsFactual = activesTotal;

  const totalLiabilities = sumField(liabilities, 'amount');

  const cashFlow = totalIncome - totalExpenses;
  const savingRate = totalIncome > 0 ? (cashFlow / totalIncome) : 0;
  const cashFlowGrowth = cashFlow > 0;

  const moneyWorking = totalIncome > 0
    ? ((passiveIncomeTotal + portfolioIncomeTotal) / totalIncome)
    : 0;
  const moneyWorkingGrowth = moneyWorking > 0;

  const taxRate = totalIncome > 0 ? (taxes / totalIncome) : 0;

  const housingRate = totalIncome > 0 ? (housingExpenses / totalIncome) : 0;
  const housingOk = housingRate <= 0.33;

  const luxuryRate = assetsByBanker > 0 ? (luxuryTotal / assetsByBanker) : 0;
  const luxuryOk = luxuryRate <= 0.33;

  const assetYield = assetsFactual > 0
    ? ((passiveIncomeTotal + portfolioIncomeTotal) / assetsFactual)
    : 0;

  const security = totalExpenses > 0 ? (assetsFactual / totalExpenses) : 0;

  const expensesCoveredByPassiveIncomeRatio = totalExpenses > 0
    ? ((passiveIncomeTotal + portfolioIncomeTotal) / totalExpenses)
    : 0;
  const expensesCoveredTarget = expensesCoveredByPassiveIncomeRatio >= 2;

  return {
    totalIncome,
    totalExpenses,
    assetsByBanker,
    assetsFactual,
    totalLiabilities,
    passiveIncomeTotal,
    portfolioIncomeTotal,
    cashFlow,
    taxes,
    housingExpenses,
    luxuryTotal,

    savingRate,
    moneyWorking,
    taxRate,
    housingRate,
    luxuryRate,
    assetYield,
    security,
    expensesCoveredByPassiveIncomeRatio,

    cashFlowGrowth,
    moneyWorkingGrowth,
    housingOk,
    luxuryOk,
    expensesCoveredTarget
  };
}

function sumField(array, field) {
  return array.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
}

function findValue(array, keyField, keyValue) {
  const item = array.find((entry) => entry[keyField] === keyValue);
  return item ? (Number(item.amount) || 0) : 0;
}

function sumByGroup(array, groupField, groupValue) {
  return array
    .filter((item) => item[groupField] === groupValue)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}
