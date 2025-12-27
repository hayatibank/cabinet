# 🎁 Offering Zone Module

**Version:** 1.0.0  
**Description:** Personalized real estate offers based on user's financial position

---

## 📁 Structure

```
/webapp/offeringZone/
├── i18n.js              # RU/EN translations
├── offering-zone.css    # Ferrari-style cards, responsive grid
├── offeringZone.js      # UI rendering logic
├── offeringService.js   # Budget calculation & HBD API
└── README.md            # This file
```

---

## 🎯 Purpose

**Offering Zone** displays personalized real estate investment opportunities to users based on their:
- ✅ Net cash flow (from financial statement)
- ✅ Liquid assets (bank accounts + digital assets)
- ✅ Available budget formula

---

## 💰 Budget Formula

```javascript
availableBudget = (cashFlow × 3) + (liquidAssets × 80%)

Where:
- cashFlow = totalIncome - totalExpenses (yearly)
- liquidAssets = N.1 (Bank accounts) + N.2 (Digital assets)
- 3 years = investment horizon
- 80% = keep 20% as emergency fund
```

**Example:**
```
Cash flow: 500,000 ₽/year
Liquid assets: 2,000,000 ₽

Budget = (500,000 × 3) + (2,000,000 × 0.8)
       = 1,500,000 + 1,600,000
       = 3,100,000 ₽
```

---

## 🏢 Data Source: HBD Collection

**HBD** = HayatiBank Dubai real estate database

### Structure:
```
Firestore:
  └─ HBD/
      ├─ {projectId}/
      │   ├── projectName: "Dubai Hills Estate"
      │   ├── status: "active"
      │   └── units/
      │       └─ {unitId}/
      │           ├── unitPriceAed: 1500000
      │           ├── unitPropertyType: "Apartment"
      │           ├── unitBedrooms: "2BR"
      │           ├── unitAreaTotalSqFt: 1200
      │           ├── unitCashOnCashROI: 0.065
      │           ├── status: "Available"
      │           └── unitFloorplanLink: "https://..."
```

---

## 🔍 Filtering Logic

1. **Fetch all active projects** from HBD
2. **Fetch units** from each project
3. **Filter by criteria:**
   - Status = "Available"
   - Price ≤ user budget (in AED)
   - Has valid price (> 0)
4. **Sort by:**
   - ROI (descending) if available
   - Price (ascending) otherwise
5. **Show top 3** offers

---

## 🌍 i18n Usage

```javascript
import { t } from './i18n.js';

// Main
t('offering.title');          // "🎁 Персональные предложения"
t('offering.subtitle');       // "Основано на вашем финансовом положении"
t('offering.loading');        // "Загрузка предложений..."

// Budget
t('offering.budget');         // "Доступный бюджет"
t('offering.budget.cashFlow'); // "Денежный поток (3 года)"

// Offer details
t('offering.learnMore');      // "Узнать больше"
t('offering.price');          // "Цена"
t('offering.roi');            // "Доходность"

// Units
t('units.sqm');               // "м²"
t('units.bedrooms');          // "спальни"
```

---

## 🎨 CSS Components

### Main Structure
```css
.offering-zone             /* Main container with gradient border */
.offering-header           /* Title + subtitle */
.offering-budget           /* Budget display with breakdown */
.offers-grid               /* Responsive grid (3 → 1 columns) */
```

### States
```css
.offering-loading          /* Loading spinner */
.no-offers                 /* Empty state placeholder */
```

### Offer Cards
```css
.offer-card                /* Ferrari-style card */
.offer-card:hover          /* Lift + glow effect */
.offer-image               /* 200px hero image */
.offer-content             /* Padding + details */
.offer-title               /* Project name (neon-blue) */
.offer-details             /* Property specs */
.offer-price               /* Price in RUB + AED */
.btn-offer                 /* CTA button */
```

### Budget Display
```css
.budget-info               /* Flex container */
.budget-label              /* Muted text */
.budget-amount             /* Large neon-green number */
.budget-breakdown          /* Formula explanation */
```

---

## 🔌 Integration

### From finStatement
```javascript
import { renderOfferingZone } from '../offeringZone/offeringZone.js';

// After rendering financial report:
const rates = await fetchExchangeRates(); // AED/RUB, AED/USD
await renderOfferingZone(accountId, year, financialData, rates);
```

### Exchange Rates
```javascript
{
  rub: 25.0,  // 1 AED = 25 RUB (ЦБ РФ API)
  usd: 0.272  // 1 AED = 0.272 USD (fixed)
}
```

---

## 📊 Data Flow

```
1. User enters account → accountDashboard
   ↓
2. Step 1: Financial Statement renders
   ↓
3. financialReport.js calls renderOfferingZone()
   ↓
4. offeringService.js:
   - calculateAvailableBudget(financialData)
   - fetchAvailableUnits() → HBD Firestore
   - filterUnitsByBudget(units, budget, rates)
   - getTopOffers(filtered, 3)
   ↓
5. offeringZone.js:
   - createOfferingContainer()
   - updateOfferingContainer()
   - createOfferCard() × 3
   ↓
6. User sees personalized offers 🎁
```

---

## 🚀 Usage Example

```javascript
// Financial data from report
const financialData = {
  income: [...],      // All income categories
  expenses: [...],    // All expense categories
  assets: [...]       // All asset categories
};

// Exchange rates
const rates = {
  rub: 25.0,
  usd: 0.272
};

// Render offering zone
await renderOfferingZone('acc_123', 2024, financialData, rates);
```

---

## 💡 Budget Calculation Examples

### Example 1: High Cash Flow
```
Income:  800,000 ₽/year
Expenses: 300,000 ₽/year
Cash flow: 500,000 ₽/year
Liquid assets: 1,000,000 ₽

Budget = (500,000 × 3) + (1,000,000 × 0.8)
       = 1,500,000 + 800,000
       = 2,300,000 ₽
       ≈ 92,000 AED (at 25 ₽/AED)
```

### Example 2: High Assets
```
Income:  500,000 ₽/year
Expenses: 400,000 ₽/year
Cash flow: 100,000 ₽/year
Liquid assets: 5,000,000 ₽

Budget = (100,000 × 3) + (5,000,000 × 0.8)
       = 300,000 + 4,000,000
       = 4,300,000 ₽
       ≈ 172,000 AED
```

### Example 3: Negative Cash Flow
```
Income:  300,000 ₽/year
Expenses: 400,000 ₽/year
Cash flow: -100,000 ₽/year
Liquid assets: 500,000 ₽

Budget = (-100,000 × 3) + (500,000 × 0.8)
       = -300,000 + 400,000
       = 100,000 ₽
       ≈ 4,000 AED

→ Very few offers (or none)
```

---

## 🎯 Features

- ✅ **Dynamic budget calculation**
- ✅ **Real-time HBD data**
- ✅ **Exchange rate conversion**
- ✅ **ROI-based sorting**
- ✅ **Top 3 offers display**
- ✅ **Responsive Ferrari design**
- ✅ **i18n support (RU/EN)**

---

## 🔄 Future Enhancements

### v1.1.0
- [ ] Filter by property type (apartment, villa, etc.)
- [ ] Filter by location (Dubai Marina, JBR, etc.)
- [ ] Min/max bedrooms selector

### v1.2.0
- [ ] Unit detail modal (full info)
- [ ] Comparison tool (side-by-side)
- [ ] Favorites system

### v2.0.0
- [ ] Contact agent directly
- [ ] Schedule viewing
- [ ] Apply for mortgage
- [ ] Investment calculator

---

## 📝 Notes

- **Formula is conservative:** Uses 3 years (not 5+) and 80% liquid assets (not 100%)
- **Emergency fund:** 20% of liquid assets kept as buffer
- **Currency conversion:** Live rates from ЦБ РФ API
- **HBD data:** Only shows "Available" status units
- **Top 3 limit:** Prevents overwhelming user

---

**Last updated:** 2024-12-27  
**Maintainer:** HayatiBank Team  
**Status:** ✅ Production ready