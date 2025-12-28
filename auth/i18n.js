/* /webapp/auth/i18n.js v1.0.0 */
// CHANGELOG v1.0.0:
// - Initial release
// - Standalone i18n for Auth module
// - RU/EN translations for login, register, reset, logout, delete account

const translations = {
  ru: {
    // Login
    'auth.login.title': 'Вход в систему',
    'auth.login.email': 'Email',
    'auth.login.emailPlaceholder': 'your@email.com',
    'auth.login.password': 'Пароль',
    'auth.login.passwordPlaceholder': '••••••••',
    'auth.login.submit': 'Войти',
    'auth.login.forgotPassword': 'Забыли пароль?',
    'auth.login.noAccount': 'Нет аккаунта?',
    'auth.login.register': 'Регистрация',
    
    // Register
    'auth.register.title': 'Регистрация',
    'auth.register.email': 'Email',
    'auth.register.emailPlaceholder': 'your@email.com',
    'auth.register.password': 'Пароль',
    'auth.register.passwordPlaceholder': 'Минимум 6 символов',
    'auth.register.passwordConfirm': 'Подтвердите пароль',
    'auth.register.passwordConfirmPlaceholder': '••••••••',
    'auth.register.submit': '+ Создать аккаунт',
    'auth.register.haveAccount': 'Уже есть аккаунт?',
    'auth.register.login': 'Войти',
    
    // Reset Password
    'auth.reset.title': 'Сброс пароля',
    'auth.reset.info': 'Введите ваш email, и мы отправим ссылку для сброса пароля',
    'auth.reset.email': 'Email',
    'auth.reset.emailPlaceholder': 'your@email.com',
    'auth.reset.submit': 'Отправить ссылку',
    'auth.reset.backToLogin': 'Назад к входу',
    'auth.reset.success': 'Ссылка для сброса пароля отправлена на ваш email',
    
    // Logout
    'auth.logout.button': '🚪 Выйти',
    'auth.logout.loading': 'Выход...',
    'auth.logout.success': '✅ Вы успешно вышли',
    
    // Delete Account
    'auth.delete.button': '🗑️ Удалиться из ФД «Хаяти»',
    'auth.delete.confirm.title': '⚠️ ВНИМАНИЕ!',
    'auth.delete.confirm.question': 'Вы действительно хотите удалить аккаунт?',
    'auth.delete.confirm.warning': 'Это действие:',
    'auth.delete.confirm.point1': '• Удалит все ваши данные',
    'auth.delete.confirm.point2': '• Удалит аккаунт из Firebase',
    'auth.delete.confirm.point3': '• НЕВОЗМОЖНО ОТМЕНИТЬ',
    'auth.delete.confirm.continue': 'Продолжить?',
    'auth.delete.loading': 'Удаление аккаунта...',
    'auth.delete.success': '✅ Аккаунт успешно удалён',
    'auth.delete.cancelled': 'ℹ️ Удаление отменено',
    
    // Errors
    'auth.error.fillAllFields': 'Заполните все поля',
    'auth.error.passwordTooShort': 'Пароль должен быть минимум 6 символов',
    'auth.error.passwordsDontMatch': 'Пароли не совпадают',
    'auth.error.invalidCredentials': 'Неверный email или пароль',
    'auth.error.userNotFound': 'Пользователь не найден',
    'auth.error.wrongPassword': 'Неверный пароль',
    'auth.error.emailInUse': 'Этот email уже зарегистрирован',
    'auth.error.invalidEmail': 'Неверный формат email',
    'auth.error.weakPassword': 'Слишком простой пароль',
    'auth.error.noSession': '❌ Ошибка: нет активной сессии',
    'auth.error.deleteFailed': '❌ Ошибка удаления аккаунта',
    'auth.error.loginFailed': 'Ошибка входа',
    'auth.error.registerFailed': 'Ошибка регистрации',
    'auth.error.resetFailed': 'Ошибка отправки',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.email': 'Email',
    'common.password': 'Пароль',
    'common.submit': 'Отправить',
    'common.cancel': 'Отмена',
    'common.back': 'Назад'
  },
  
  en: {
    // Login
    'auth.login.title': 'Sign In',
    'auth.login.email': 'Email',
    'auth.login.emailPlaceholder': 'your@email.com',
    'auth.login.password': 'Password',
    'auth.login.passwordPlaceholder': '••••••••',
    'auth.login.submit': 'Sign In',
    'auth.login.forgotPassword': 'Forgot password?',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.register': 'Register',
    
    // Register
    'auth.register.title': 'Register',
    'auth.register.email': 'Email',
    'auth.register.emailPlaceholder': 'your@email.com',
    'auth.register.password': 'Password',
    'auth.register.passwordPlaceholder': 'Minimum 6 characters',
    'auth.register.passwordConfirm': 'Confirm Password',
    'auth.register.passwordConfirmPlaceholder': '••••••••',
    'auth.register.submit': '+ Create Account',
    'auth.register.haveAccount': 'Already have an account?',
    'auth.register.login': 'Sign In',
    
    // Reset Password
    'auth.reset.title': 'Reset Password',
    'auth.reset.info': 'Enter your email and we will send you a password reset link',
    'auth.reset.email': 'Email',
    'auth.reset.emailPlaceholder': 'your@email.com',
    'auth.reset.submit': 'Send Reset Link',
    'auth.reset.backToLogin': 'Back to Sign In',
    'auth.reset.success': 'Password reset link sent to your email',
    
    // Logout
    'auth.logout.button': '🚪 Logout',
    'auth.logout.loading': 'Logging out...',
    'auth.logout.success': '✅ Successfully logged out',
    
    // Delete Account
    'auth.delete.button': '🗑️ Delete from FD "Hayati"',
    'auth.delete.confirm.title': '⚠️ WARNING!',
    'auth.delete.confirm.question': 'Are you sure you want to delete your account?',
    'auth.delete.confirm.warning': 'This action will:',
    'auth.delete.confirm.point1': '• Delete all your data',
    'auth.delete.confirm.point2': '• Remove account from Firebase',
    'auth.delete.confirm.point3': '• CANNOT BE UNDONE',
    'auth.delete.confirm.continue': 'Continue?',
    'auth.delete.loading': 'Deleting account...',
    'auth.delete.success': '✅ Account successfully deleted',
    'auth.delete.cancelled': 'ℹ️ Deletion cancelled',
    
    // Errors
    'auth.error.fillAllFields': 'Please fill in all fields',
    'auth.error.passwordTooShort': 'Password must be at least 6 characters',
    'auth.error.passwordsDontMatch': 'Passwords do not match',
    'auth.error.invalidCredentials': 'Invalid email or password',
    'auth.error.userNotFound': 'User not found',
    'auth.error.wrongPassword': 'Wrong password',
    'auth.error.emailInUse': 'This email is already registered',
    'auth.error.invalidEmail': 'Invalid email format',
    'auth.error.weakPassword': 'Password is too weak',
    'auth.error.noSession': '❌ Error: no active session',
    'auth.error.deleteFailed': '❌ Error deleting account',
    'auth.error.loginFailed': 'Login failed',
    'auth.error.registerFailed': 'Registration failed',
    'auth.error.resetFailed': 'Reset failed',
    
    // Common
    'common.loading': 'Loading...',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.back': 'Back'
  }
};

// Current language (default: ru)
let currentLanguage = 'ru';

/**
 * Get translation for key
 */
export function t(key, lang = null) {
  const language = lang || currentLanguage;
  return translations[language]?.[key] || key;
}

/**
 * Set current language
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    console.log(`🌍 [Auth] Language set to: ${lang}`);
    return true;
  }
  console.warn(`⚠️ [Auth] Language not supported: ${lang}`);
  return false;
}

/**
 * Get current language
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

// Auto-detect language from Telegram
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  const tgLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
  if (tgLang === 'en') {
    setLanguage('en');
  }
}

console.log('🌍 [Auth] i18n initialized:', currentLanguage);