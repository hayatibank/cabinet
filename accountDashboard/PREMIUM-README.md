# 🔒 Premium Access Control System

## 📋 Overview

Dashboard steps 2-4 are now locked for regular users:
- **Step 2**: Цели (Goals)
- **Step 3**: Денежный поток (Cash Flow)
- **Step 4**: Инвестиции (Investments)

Premium users have full access to all 7 steps.

---

## 🎨 Visual Changes

### 1. Step Labels Color
All step labels now use **neon-blue** color (`var(--neon-blue)`) for better visibility, matching the active step border color.

### 2. Locked Steps
Locked steps display:
- 🔒 Lock icon in top-right corner
- Reduced opacity (0.5)
- Disabled cursor (not-allowed)
- Muted label color
- No hover effects

---

## 🔧 Configuration

### Backend (.env)

Add these variables to your `.env` file:

```env
# Premium users who have access to Steps 2-4
# Format: comma-separated UIDs or "all" for everyone
# Example: PREMIUM_USERS=uid1,uid2,uid3 or PREMIUM_USERS=all
PREMIUM_USERS=your_admin_uid

# Enable/disable premium features
PREMIUM_FEATURES_ENABLED=true
```

### How to Add Users

**Option 1: Specific UIDs**
```env
PREMIUM_USERS=abc123,def456,ghi789
```

**Option 2: Everyone**
```env
PREMIUM_USERS=all
```

**Option 3: Disable System**
```env
PREMIUM_FEATURES_ENABLED=false
```

---

## 🌐 API Endpoint

### Check Premium Status

**GET** `/api/premium/status?uid={userId}`

**Response:**
```json
{
  "success": true,
  "hasPremium": true,
  "systemEnabled": true,
  "lockedSteps": [],
  "unlockedSteps": [1, 2, 3, 4, 5, 6, 7]
}
```

**Non-Premium Response:**
```json
{
  "success": true,
  "hasPremium": false,
  "systemEnabled": true,
  "lockedSteps": [2, 3, 4],
  "unlockedSteps": [1, 5, 6, 7]
}
```

---

## 📁 Files Modified

### Backend

**Created:**
- ✅ `/utils/premiumAccess.js` - Premium access logic

**Updated:**
- ✅ `/server/app.js` v2.3.0 - Added `/api/premium/status` endpoint
- ✅ `/.env` - Added `PREMIUM_USERS` and `PREMIUM_FEATURES_ENABLED`

### Frontend

**Created:**
- ✅ `/webapp/js/utils/premiumAccess.js` - Client-side premium checking

**Updated:**
- ✅ `/webapp/accountDashboard/dashboard.css` v1.1.0 - Locked step styles
- ✅ `/webapp/accountDashboard/accountNavigation.js` v1.5.0 - Premium integration
- ✅ `/webapp/i18n/ru.json` - Added premium translations
- ✅ `/webapp/i18n/en.json` - Added premium translations

---

## 🔍 How It Works

### 1. User Opens Dashboard
```javascript
// Check premium status from API
const premiumStatus = await checkPremiumStatus();
// { hasPremium: false, lockedSteps: [2, 3, 4] }
```

### 2. Render Steps
```javascript
// Steps 2-4 rendered with .locked class and 🔒 icon
${renderStep(2, 'Цели', false, premiumStatus)}
// <button class="nav-step locked" disabled>
//   <span class="lock-icon">🔒</span>
//   ...
// </button>
```

### 3. User Clicks Locked Step
```javascript
if (!isStepUnlocked(step, premiumStatus)) {
  alert(i18n.t('premium.locked.message'));
  return;
}
```

---

## 🚀 Future Enhancements

### Phase 2: Firebase-based Control

Instead of `.env`, store premium status in Firestore:

```javascript
users/{uid}/premium {
  enabled: true,
  unlockedSteps: [1, 2, 3, 4, 5, 6, 7],
  expiresAt: timestamp
}
```

**Benefits:**
- Real-time updates (no restart needed)
- Per-user granular control
- Expiration dates support
- Admin UI for management

### Phase 3: Subscription System

- Monthly/yearly subscriptions
- Payment integration
- Auto-renewal
- Trial periods

---

## 🧪 Testing

### Test as Premium User

1. Add your UID to `.env`:
```env
PREMIUM_USERS=your_firebase_uid
```

2. Restart backend:
```bash
node index.js
```

3. Open dashboard - all steps unlocked ✅

### Test as Regular User

1. Set different UID in `.env`:
```env
PREMIUM_USERS=some_other_uid
```

2. Restart backend
3. Open dashboard - steps 2-4 locked 🔒

### Test with System Disabled

```env
PREMIUM_FEATURES_ENABLED=false
```

All users get regular access (steps 2-4 locked).

---

## 🌍 Internationalization

Premium messages support multiple languages:

**Russian:**
```json
{
  "premium.locked.title": "🔒 Premium раздел",
  "premium.locked.message": "Этот раздел доступен только premium пользователям.\n\nСкоро будет доступно для всех!"
}
```

**English:**
```json
{
  "premium.locked.title": "🔒 Premium Section",
  "premium.locked.message": "This section is only available for premium users.\n\nComing soon for everyone!"
}
```

---

## 💡 Usage Examples

### Check if User is Premium

```javascript
import { checkPremiumStatus } from './js/utils/premiumAccess.js';

const status = await checkPremiumStatus();
console.log(status.hasPremium); // true or false
```

### Check Specific Step

```javascript
import { isStepUnlocked } from './js/utils/premiumAccess.js';

const canAccessStep3 = isStepUnlocked(3, premiumStatus);
if (canAccessStep3) {
  // Show content
} else {
  // Show lock message
}
```

### Backend Check

```javascript
const { hasPremiumAccess } = require('./utils/premiumAccess');

if (hasPremiumAccess(userId)) {
  // Grant access
} else {
  // Deny access
}
```

---

## ⚠️ Important Notes

1. **Security**: This is UI-only protection. Add server-side checks for sensitive operations.
2. **Caching**: Premium status is checked on dashboard load, not cached.
3. **Default Behavior**: On error, defaults to locked (safe fallback).
4. **UID Source**: Uses Firebase UID from current session.

---

## 📝 Changelog

### v1.0.0 (2025-01-16)
- ✅ Initial release
- ✅ Steps 2-4 locked for non-premium users
- ✅ Lock icons and visual feedback
- ✅ Step labels color improved (neon-blue)
- ✅ i18n support for premium messages
- ✅ .env-based configuration
- ✅ API endpoint for status checks

---

**Last updated:** 2025-01-16  
**Status:** ✅ Production ready
