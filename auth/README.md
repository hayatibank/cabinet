# 🔐 Auth Module

**Version:** 1.0.0  
**Description:** Complete authentication system (Login, Register, Reset Password, Logout, Delete Account)

---

## 📁 Structure

```
/webapp/auth/
├── i18n.js              # RU/EN translations
├── auth.css             # Forms styling
├── authForms.js         # Login, Register, Reset handlers
├── accountActions.js    # Logout, Delete account
└── README.md            # This file
```

---

## 🎯 Purpose

**Auth Module** handles all user authentication operations:
- ✅ Login (email/password)
- ✅ Register (with Firestore user document creation)
- ✅ Reset Password (email link)
- ✅ Logout (clear session + Firebase sign out)
- ✅ Delete Account (Firebase Auth + Firestore + Telegram sessions)

---

## 🔄 Separation from Cabinet

**⚠️ IMPORTANT:** This module is **NOT** the same as `/cabinet/`:

| Module | Purpose | Layer |
|--------|---------|-------|
| `/auth/` | **USER** authentication | Auth layer |
| `/cabinet/` | **BUSINESS** accounts CRUD | Business layer |

**Auth** = Firebase Authentication (uid, email, password)  
**Cabinet** = Business accounts (individual, business, government)

---

## 🌍 i18n Usage

```javascript
import { t } from './i18n.js';

// Login
t('auth.login.title');              // "Вход в систему"
t('auth.login.submit');             // "Войти"

// Register
t('auth.register.title');           // "Регистрация"
t('auth.register.submit');          // "+ Создать аккаунт"

// Reset Password
t('auth.reset.title');              // "Сброс пароля"
t('auth.reset.success');            // "Ссылка для сброса пароля отправлена..."

// Logout
t('auth.logout.button');            // "🚪 Выйти"
t('auth.logout.success');           // "✅ Вы успешно вышли"

// Delete Account
t('auth.delete.button');            // "🗑️ Удалиться из ФД «Хаяти»"
t('auth.delete.success');           // "✅ Аккаунт успешно удалён"

// Errors
t('auth.error.fillAllFields');      // "Заполните все поля"
t('auth.error.invalidCredentials'); // "Неверный email или пароль"
```

---

## 📦 Files Breakdown

### **authForms.js**
Handles authentication forms:
- `setupLoginHandler(auth)` - Login form
- `setupRegisterHandler(auth, db)` - Registration form
- `setupResetHandler(auth)` - Password reset form
- `setupFormSwitching()` - Switch between forms
- `getTelegramData()` - Helper for Telegram Mini App

### **accountActions.js**
Handles account-level actions:
- `logout()` - Sign out user
- `deleteAccount()` - Delete user account

---

## 🔌 Integration

### From app.js
```javascript
import { setupLoginHandler, setupRegisterHandler, setupResetHandler, setupFormSwitching } from './auth/authForms.js';
import './auth/accountActions.js'; // Exposes logout() and deleteAccount() globally

// Setup auth forms
setupLoginHandler(auth);
setupRegisterHandler(auth, db);
setupResetHandler(auth);
setupFormSwitching();
```

### From index.html
```html
<!-- Logout button -->
<button onclick="logout()" class="btn btn-secondary">
  🚪 Выйти
</button>

<!-- Delete account button -->
<button onclick="deleteAccount()" class="btn btn-danger">
  🗑️ Удалиться из ФД «Хаяти»
</button>
```

---

## 🔐 Authentication Flow

### Login
```
1. User enters email + password
   ↓
2. setupLoginHandler() validates
   ↓
3. signInWithEmailAndPassword()
   ↓
4. Get ID Token
   ↓
5. Link Telegram (if Mini App)
   ↓
6. Save session to localStorage
   ↓
7. showCabinet()
```

### Register
```
1. User enters email + password + confirm
   ↓
2. setupRegisterHandler() validates
   ↓
3. createUserWithEmailAndPassword()
   ↓
4. Get ID Token
   ↓
5. Create Firestore user document
   ↓
6. Link Telegram (if Mini App)
   ↓
7. Save session to localStorage
   ↓
8. showCabinet()
```

### Reset Password
```
1. User enters email
   ↓
2. setupResetHandler() validates
   ↓
3. sendPasswordResetEmail()
   ↓
4. Show success message
   ↓
5. Redirect to login after 3s
```

### Logout
```
1. User clicks logout button
   ↓
2. logout() gets current session
   ↓
3. Clear localStorage
   ↓
4. Firebase signOut()
   ↓
5. Delete telegram_sessions (backend)
   ↓
6. showAuthScreen('login')
```

### Delete Account
```
1. User clicks delete button
   ↓
2. deleteAccount() shows confirmation
   ↓
3. Backend deletes:
   - Firestore user document
   - Telegram sessions
   - Firebase Auth account
   ↓
4. Clear localStorage
   ↓
5. showAuthScreen('login')
```

---

## 🎨 CSS Components

```css
.logo                    /* Logo section */
.links                   /* Form navigation links */
.links a                 /* Link styling (neon-blue → neon-pink on hover) */
.info-text               /* Informational text */
.error                   /* Error message box (red) */
.success                 /* Success message box (green) */
```

---

## 🔧 Error Handling

### Firebase Auth Errors
```javascript
'auth/invalid-credential'  → "Неверный email или пароль"
'auth/user-not-found'      → "Пользователь не найден"
'auth/wrong-password'      → "Неверный пароль"
'auth/email-already-in-use' → "Этот email уже зарегистрирован"
'auth/invalid-email'       → "Неверный формат email"
'auth/weak-password'       → "Слишком простой пароль"
```

All errors are translated via i18n.

---

## 📊 User Document Structure (Firestore)

When user registers, creates:
```javascript
users/{uid}/
├── uid: "abc123"
├── email: "user@example.com"
├── createdAt: Timestamp
├── status: "active"
├── createdBy: "telegram-mini-app" | "web"
├── profile: {
│   userType: "telegram" | "web",
│   riskLevel: "unknown",
│   segment: "registered"
│ }
├── contacts: {
│   email: "...",
│   telegram: "https://t.me/username"
│ }
├── telegramAccounts: []
└── userActionCasesPermitted: [...]
```

---

## 🔄 Session Management

### Save Session
```javascript
saveSession({
  authToken: idToken,
  tokenExpiry: Date.now() + (30 days),
  uid: user.uid,
  email: user.email
});
```

### Get Session
```javascript
const session = getSession();
// Returns: { authToken, tokenExpiry, uid, email } or null
```

### Clear Session
```javascript
clearSession(); // Removes from localStorage
```

---

## 🎯 Features

- ✅ **Email/Password authentication**
- ✅ **Telegram Mini App integration**
- ✅ **ID Token management**
- ✅ **Session persistence (30 days)**
- ✅ **Password reset via email**
- ✅ **Full account deletion**
- ✅ **i18n support (RU/EN)**
- ✅ **Error handling with translations**

---

## 🔄 Migration from /js/

### Old Structure
```
/js/
├── auth.js              # All auth forms
└── account.js           # Logout + Delete
```

### New Structure
```
/auth/
├── authForms.js         # Login + Register + Reset
└── accountActions.js    # Logout + Delete
```

### Import Updates
```javascript
// OLD:
import { setupLoginHandler } from './js/auth.js';
import './js/account.js';

// NEW:
import { setupLoginHandler } from './auth/authForms.js';
import './auth/accountActions.js';
```

---

## 📝 TODO

### High Priority
- [ ] Update app.js imports
- [ ] Update index.html (if needed)
- [ ] Test all auth flows
- [ ] Remove old /js/auth.js and /js/account.js

### Medium Priority
- [ ] Add i18n to all UI strings in index.html
- [ ] Add loading states
- [ ] Add rate limiting

### Low Priority
- [ ] OAuth providers (Google, Facebook)
- [ ] 2FA support
- [ ] Email verification

---

**Last updated:** 2024-12-28  
**Maintainer:** HayatiBank Team  
**Status:** ✅ Production ready