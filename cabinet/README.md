# 💼 Cabinet Module

**Version:** 1.0.0  
**Description:** Personal cabinet with multi-account management system

---

## 📁 Structure

```
/webapp/cabinet/
├── i18n.js              # RU/EN translations
├── cabinet.css          # Unified styles (cabinet + create account)
├── accounts.js          # Account CRUD API calls
├── accountsUI.js        # UI rendering for account list
├── createAccount.js     # Create account form
├── accountNavigation.js # 7-step account dashboard
└── README.md            # This file
```

---

## 🎯 Features

### 1️⃣ **Account List**
- Display all user accounts
- Support for 3 account types:
  - 👤 Individual (physical person)
  - 🏢 Business (legal entity / IP)
  - 🏛️ Government organization
- Ferrari-style "Enter" button for each account
- Three-dot menu: Edit / Delete

### 2️⃣ **Create Account**
- Type selector with 3 options
- Individual account form:
  - First name *
  - Last name *
  - Birth date (optional)
- Business & Government: Coming soon

### 3️⃣ **Account Navigation (7 steps)**
When entering an account, user sees 7-step dashboard:

| Step | Name | Status |
|------|------|--------|
| 1 | Financial Statement | ✅ Working |
| 2 | Goals | 🚧 Coming soon |
| 3 | Cash Flow | 🚧 Coming soon |
| 4 | Investments | ✅ Working (Level 1) |
| 5 | Business | 🚧 Coming soon |
| 6 | Business Management | ✅ Working (Triangle → 20L) |
| 7 | IPO | 🚧 Coming soon |

---

## 🌍 i18n Usage

```javascript
import { t } from './i18n.js';

// Examples
t('cabinet.title');              // "💼 Личный кабинет"
t('cabinet.createAccount');      // "➕ Создать аккаунт"
t('cabinet.noAccounts');         // "У вас пока нет аккаунтов"
t('cabinet.accountType.individual'); // "👤 Физическое лицо"
```

### Key Categories

**Main:**
- `cabinet.title`
- `cabinet.welcome`
- `cabinet.userEmail`

**Account List:**
- `cabinet.accounts`
- `cabinet.noAccounts`
- `cabinet.createAccount`
- `cabinet.loadingAccounts`

**Account Types:**
- `cabinet.accountType.individual`
- `cabinet.accountType.business`
- `cabinet.accountType.government`

**Create Form:**
- `cabinet.createAccount.*` (title, firstName, lastName, etc.)

**Navigation:**
- `cabinet.nav.step1` through `cabinet.nav.step7`

**Actions:**
- `cabinet.actions.logout`
- `cabinet.actions.settings`
- `cabinet.actions.deleteAccount`

---

## 🎨 CSS Components

### Main Structure
```css
.cabinet-header       /* Header with title and user email */
.cabinet-content      /* Main content container */
.cabinet-actions      /* Bottom action buttons */
```

### Account List
```css
.accounts-list        /* Grid layout for accounts */
.account-card         /* Single account card */
.account-header       /* Card header (type + menu) */
.account-body         /* Card body (name + balance) */
.account-actions      /* Ferrari-style enter button */
.account-menu         /* Three-dot dropdown menu */
```

### Create Account
```css
.create-account-form  /* Form container */
.account-type-selector /* Type selection cards */
.type-card            /* Single type card */
.type-card.active     /* Selected type */
.type-card.disabled   /* Disabled type (coming soon) */
.account-form         /* Form fields container */
```

### Empty States
```css
.no-accounts          /* No accounts placeholder */
.error-message        /* Error state */
```

---

## 🔌 Integration with Other Modules

### Financial Statement
```javascript
import { renderFinancialReport } from '../finStatement/financialReport.js';
await renderFinancialReport(accountId);
```

### Investments
```javascript
import { renderLevel1 } from '../investments/level1.js';
await renderLevel1(accountId);
```

### Business Management
```javascript
import { showBusinessManagement } from '../businessTriangle/businessTriangle.js';
await showBusinessManagement(accountId);
```

---

## 🚀 Usage

### Initialize Cabinet
```javascript
import { showCabinet } from './cabinet/ui.js';

showCabinet({
  uid: 'user123',
  email: 'user@example.com'
});
```

### Create Account
```javascript
import { showCreateAccountForm } from './cabinet/createAccount.js';

showCreateAccountForm();
```

### Enter Account Dashboard
```javascript
import { showAccountDashboard } from './cabinet/accountNavigation.js';

await showAccountDashboard('account_xyz');
```

---

## 📊 Account Data Structure

```javascript
{
  accountId: "acc_123",
  type: "individual",           // individual | business | government
  profile: {
    firstName: "Иван",
    lastName: "Петров",
    birthDate: "1990-01-01"     // optional
  },
  balance: {
    rub: 150000,                // main balance in RUB
    usd: 0,
    eur: 0
  },
  createdAt: "2024-12-27T10:00:00Z",
  status: "active"
}
```

---

## 🔐 Backend API Endpoints

All calls use `ngrok-skip-browser-warning: true` header.

### Get Accounts
```http
GET /api/accounts
Authorization: Bearer <token>
```

### Get Account by ID
```http
GET /api/accounts/:accountId
Authorization: Bearer <token>
```

### Create Account
```http
POST /api/accounts/create
{
  "type": "individual",
  "profile": { ... },
  "authToken": "<token>"
}
```

### Delete Account
```http
DELETE /api/accounts/:accountId
{
  "authToken": "<token>"
}
```

---

## 🎯 Roadmap

### v1.1.0 (Next)
- [ ] Integrate i18n in all UI strings
- [ ] Edit account functionality
- [ ] Business account creation
- [ ] Government account creation

### v1.2.0 (Future)
- [ ] Account settings modal
- [ ] Profile picture upload
- [ ] Multi-currency balance display
- [ ] Account sharing/permissions

### v2.0.0 (Long-term)
- [ ] Family accounts (shared access)
- [ ] Company structure (departments)
- [ ] Role-based access control

---

## 📝 Notes

- **Модульная архитектура:** Все файлы изолированы в `/cabinet/`
- **Standalone i18n:** Не зависит от core `/js/utils/i18n.js`
- **CSS консолидация:** Объединены `cabinet.css` + `create-account.css`
- **Ferrari стиль:** Кнопка "Войти" с градиентом и анимацией

---

## 🐛 Known Issues

1. **Edit account:** UI placeholder, backend not implemented
2. **Business/Government:** Forms exist but disabled
3. **Account navigation:** Some steps (2, 3, 5, 7) are placeholders

---

**Last updated:** 2024-12-27  
**Maintainer:** HayatiBank Team
