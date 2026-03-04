import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import {
  getAuth,
  updateProfile,
  signInWithCustomToken,
  sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js';
import { FIREBASE_CONFIG, API_URL } from '../config.js';
import { getSession } from '../session.js';

const state = {
  isOpen: false,
  isSaving: false,
  isDirty: false,
  original: null,
  newPhotoFile: null,
  currentPhotoURL: ''
};

let appInstance = null;
let authInstance = null;
let storageInstance = null;

function t(key, fallback) {
  try {
    return window.i18n?.t?.(key) || fallback;
  } catch (_error) {
    return fallback;
  }
}

function byId(id) {
  return document.getElementById(id);
}

function setPhotoLoading(isLoading) {
  const spinner = byId('profileEditorPhotoSpinner');
  if (!spinner) return;
  spinner.classList.toggle('hidden', !isLoading);
}

function setPhotoPreviewSource(src) {
  const img = byId('profileEditorPhotoPreview');
  if (!img) return;
  setPhotoLoading(true);
  img.src = src || 'https://placehold.co/120x120/0b1328/6dd5ed?text=H';
}

async function resolveHayatiIdentity() {
  const session = getSession() || {};
  const directId = String(session?.hayatiId || session?.user?.hayatiId || '').trim();
  const directTier = String(session?.hayatiIdTier || session?.user?.hayatiIdTier || '').trim();
  if (directId) return { id: directId, tier: directTier || t('hayatiId.tier.standard', 'Standard') };

  const authToken = String(session?.authToken || '');
  if (!authToken) return { id: '', tier: '' };

  try {
    const response = await fetch(`${API_URL}/api/me`, {
      method: 'GET',
      credentials: 'include',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const payload = await response.json().catch(() => ({}));
    const id = String(
      payload?.hayatiId ||
      payload?.user?.hayatiId ||
      payload?.profile?.hayatiId ||
      ''
    ).trim();
    const tierRaw = String(
      payload?.hayatiIdTier ||
      payload?.user?.hayatiIdTier ||
      payload?.profile?.hayatiIdTier ||
      ''
    ).trim().toLowerCase();

    if (!id) {
      const podText = String(document.querySelector('.ticker-pod.pod-id')?.textContent || '');
      const match = podText.match(/Hayati ID:\s*([A-Za-z0-9_-]+)/i);
      const tierMatch = podText.match(/\[\s*([^\]]+)\s*\]/);
      if (match?.[1]) {
        return { id: match[1], tier: String(tierMatch?.[1] || '').trim() };
      }
      return { id: '', tier: '' };
    }

    const tier = tierRaw === 'signature'
      ? t('hayatiId.tier.signature', 'Signature')
      : t('hayatiId.tier.standard', 'Standard');

    return { id, tier };
  } catch (_error) {
    const podText = String(document.querySelector('.ticker-pod.pod-id')?.textContent || '');
    const match = podText.match(/Hayati ID:\s*([A-Za-z0-9_-]+)/i);
    const tierMatch = podText.match(/\[\s*([^\]]+)\s*\]/);
    if (match?.[1]) {
      return { id: match[1], tier: String(tierMatch?.[1] || '').trim() };
    }
    return { id: '', tier: '' };
  }
}

function showError(text) {
  const el = byId('profileEditorError');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden');
}

function hideError() {
  byId('profileEditorError')?.classList.add('hidden');
}

function showSuccess(text) {
  const el = byId('profileEditorSuccess');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden');
}

function hideSuccess() {
  byId('profileEditorSuccess')?.classList.add('hidden');
}

function normalizePhone(phone = '') {
  const value = String(phone || '').trim();
  if (!value) return '';
  const raw = value.replace(/[^\d+]/g, '');
  const plus = raw.startsWith('+');
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  if (plus) {
    return `+${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('8')) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+7${digits}`;
  }
  return `+${digits}`;
}

function isValidE164(phone = '') {
  if (!phone) return true;
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

function ensureFirebaseClients() {
  if (!appInstance) {
    appInstance = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  }
  if (!authInstance) authInstance = getAuth(appInstance);
  if (!storageInstance) storageInstance = getStorage(appInstance);
}

function extractStoragePathFromDownloadUrl(url = '') {
  try {
    const decoded = decodeURIComponent(String(url || ''));
    const marker = '/o/';
    const idx = decoded.indexOf(marker);
    if (idx === -1) return '';
    const pathAndQuery = decoded.slice(idx + marker.length);
    const qIdx = pathAndQuery.indexOf('?');
    const path = qIdx === -1 ? pathAndQuery : pathAndQuery.slice(0, qIdx);
    return path || '';
  } catch (_error) {
    return '';
  }
}

async function fileToWebpBlob(file, maxSide = 1400, quality = 0.86) {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) return reject(new Error('WEBP_CONVERSION_FAILED'));
      resolve(result);
    }, 'image/webp', quality);
  });

  return blob;
}

async function uploadProfilePhoto(uid, file) {
  ensureFirebaseClients();
  const webpBlob = await fileToWebpBlob(file);
  const objectPath = `users/${uid}/photoURL/${Date.now()}.webp`;
  const storageRef = ref(storageInstance, objectPath);
  await uploadBytes(storageRef, webpBlob, { contentType: 'image/webp' });
  const photoURL = await getDownloadURL(storageRef);
  return { photoURL, objectPath };
}

async function deletePreviousPhotoIfManaged(uid, previousUrl) {
  if (!previousUrl) return;
  const path = extractStoragePathFromDownloadUrl(previousUrl);
  if (!path) return;
  if (!path.startsWith(`users/${uid}/photoURL/`)) return;
  try {
    ensureFirebaseClients();
    await deleteObject(ref(storageInstance, path));
  } catch (_error) {
    // Ignore deletion failures to avoid blocking profile update.
  }
}

async function updateAuthProfileServer(payload) {
  const session = getSession();
  const authToken = session?.authToken || '';
  if (!payload?.uid || !authToken) {
    throw new Error('AUTH_REQUIRED');
  }

  const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(payload.uid)}/auth-profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authToken,
      displayName: payload.displayName,
      photoURL: payload.photoURL,
      phoneNumber: payload.phoneNumber
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.success === false) {
    throw new Error(String(body?.error || body?.details || `HTTP_${response.status}`));
  }
}

async function ensureAuthUser() {
  ensureFirebaseClients();
  if (authInstance.currentUser) return authInstance.currentUser;

  const session = getSession();
  const bearerToken = String(session?.authToken || '');
  const response = await fetch(`${API_URL}/api/me`, {
    method: 'GET',
    credentials: 'include',
    headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}
  });
  if (!response.ok) {
    throw new Error('AUTH_REQUIRED');
  }

  const payload = await response.json().catch(() => ({}));
  const customToken = String(payload?.customToken || '');
  if (!customToken) {
    throw new Error('AUTH_REQUIRED');
  }

  const userCredential = await signInWithCustomToken(authInstance, customToken);
  return userCredential?.user || null;
}

function setEditorBusy(isBusy) {
  state.isSaving = isBusy;
  const saveBtn = byId('profileEditorSaveBtn');
  const saveLabel = byId('profileEditorSaveText');
  const cancelBtn = byId('profileEditorCancelBtn');
  const closeBtn = document.querySelector('#profileEditorModal .btn-close');
  if (saveBtn) saveBtn.disabled = isBusy;
  if (saveLabel) {
    saveLabel.textContent = isBusy
      ? t('profileEditor.saving', 'Saving...')
      : t('profileEditor.save', 'Save Profile');
  }
  if (cancelBtn) cancelBtn.disabled = isBusy;
  if (closeBtn) closeBtn.disabled = isBusy;
}

function readFormValues() {
  return {
    displayName: String(byId('profileEditorDisplayName')?.value || '').trim(),
    phoneNumber: normalizePhone(byId('profileEditorPhoneNumber')?.value || '')
  };
}

function updateDirtyState() {
  if (!state.original) {
    state.isDirty = false;
    return;
  }
  const current = readFormValues();
  state.isDirty =
    current.displayName !== state.original.displayName ||
    current.phoneNumber !== state.original.phoneNumber ||
    state.currentPhotoURL !== state.original.photoURL ||
    !!state.newPhotoFile;
}

function bindInputListeners() {
  ['profileEditorDisplayName', 'profileEditorPhoneNumber'].forEach((id) => {
    byId(id)?.addEventListener('input', () => {
      hideError();
      hideSuccess();
      updateDirtyState();
    });
  });

  byId('profileEditorPhotoFile')?.addEventListener('change', (event) => {
    const file = event?.target?.files?.[0] || null;
    state.newPhotoFile = file;
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreviewSource(objectUrl);
      const fileLabel = byId('profileEditorPhotoFilename');
      if (fileLabel) fileLabel.textContent = file.name;
    }
    hideError();
    hideSuccess();
    updateDirtyState();
  });
}

function showCloseConfirm() {
  byId('profileEditorCloseConfirm')?.classList.remove('hidden');
}

function hideCloseConfirm() {
  byId('profileEditorCloseConfirm')?.classList.add('hidden');
}

function closeEditorNow() {
  state.isOpen = false;
  state.isDirty = false;
  state.isSaving = false;
  state.newPhotoFile = null;
  state.currentPhotoURL = '';
  state.original = null;
  byId('profileEditorModal')?.classList.add('hidden');
  hideCloseConfirm();
  document.body.style.overflow = 'auto';
}

async function openProfileEditor() {
  const user = await ensureAuthUser().catch(() => null);
  if (!user) {
    byId('profileEditorModal')?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    showError(t('profileEditor.errorNotAuthorized', 'Authorization required. Please sign in again.'));
    return;
  }

  hideError();
  hideSuccess();
  state.newPhotoFile = null;

  const email = String(user.email || '');
  const displayName = String(user.displayName || '');
  const phoneNumber = normalizePhone(String(user.phoneNumber || ''));
  const photoURL = String(user.photoURL || '');
  const hayati = await resolveHayatiIdentity();

  byId('profileEditorEmail').value = email;
  byId('profileEditorDisplayName').value = displayName;
  byId('profileEditorPhoneNumber').value = phoneNumber;
  byId('profileEditorHayatiId').value = hayati.id || '-';
  byId('profileEditorHayatiTier').textContent = `[ ${hayati.tier || '-'} ]`;
  byId('profileEditorPhotoFile').value = '';
  const fileLabel = byId('profileEditorPhotoFilename');
  if (fileLabel) fileLabel.textContent = '';

  setPhotoPreviewSource(photoURL);

  applyEmailVerificationUI(user);

  state.original = {
    displayName,
    phoneNumber,
    photoURL
  };
  state.currentPhotoURL = photoURL;
  state.isDirty = false;
  state.isOpen = true;

  byId('profileMenu')?.classList.add('hidden');
  byId('profileEditorModal')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function applyEmailVerificationUI(user, emailVerifiedText = '') {
  const isVerified = !!user?.emailVerified;
  const text = emailVerifiedText || (isVerified
    ? t('profileEditor.emailAlreadyVerified', 'Email verified')
    : t('profileEditor.emailNotVerified', 'Not verified'));
  const badge = byId('profileEditorEmailVerifiedBadge');
  if (badge) {
    badge.textContent = text;
    badge.classList.toggle('verified', isVerified);
  }

  const verifyBtn = byId('profileEditorVerifyEmailBtn');
  if (verifyBtn) {
    verifyBtn.disabled = false;
    verifyBtn.classList.toggle('hidden', isVerified);
    verifyBtn.textContent = isVerified
      ? t('profileEditor.emailAlreadyVerified', 'Email verified')
      : t('profileEditor.sendVerification', 'Send verification email');
  }
}

async function refreshProfileEmailVerificationStatus() {
  const user = await ensureAuthUser().catch(() => null);
  if (!user) {
    showError(t('profileEditor.errorNotAuthorized', 'Authorization required. Please sign in again.'));
    return;
  }
  await user.reload();
  applyEmailVerificationUI(user);
}

async function sendProfileEmailVerification() {
  const user = await ensureAuthUser().catch(() => null);
  if (!user) {
    showError(t('profileEditor.errorNotAuthorized', 'Authorization required. Please sign in again.'));
    return;
  }
  hideError();
  hideSuccess();

  if (user.emailVerified) {
    applyEmailVerificationUI(user);
    showSuccess(t('profileEditor.emailAlreadyVerified', 'Email verified'));
    return;
  }

  try {
    await sendEmailVerification(user);
    showSuccess(t('profileEditor.emailVerificationSent', 'Verification email sent'));
  } catch (error) {
    const msg = String(error?.message || '');
    showError(`${t('profileEditor.emailVerificationFailed', 'Failed to send verification email')}: ${msg}`);
  }
}

async function saveProfileEditor() {
  const user = await ensureAuthUser().catch(() => null);
  if (!user) {
    showError(t('profileEditor.errorNotAuthorized', 'Authorization required. Please sign in again.'));
    return;
  }

  hideError();
  hideSuccess();

  const values = readFormValues();
  if (!values.displayName) {
    showError(t('profileEditor.errorDisplayNameRequired', 'Display name is required.'));
    return;
  }

  if (!isValidE164(values.phoneNumber)) {
    showError(t('profileEditor.errorInvalidPhone', 'Phone number must be in E.164 format, example: +79991234567.'));
    return;
  }

  setEditorBusy(true);
  try {
    let finalPhotoURL = state.currentPhotoURL;
    if (state.newPhotoFile) {
      const upload = await uploadProfilePhoto(user.uid, state.newPhotoFile);
      finalPhotoURL = upload.photoURL;
    }

    await updateAuthProfileServer({
      uid: user.uid,
      displayName: values.displayName,
      photoURL: finalPhotoURL || null,
      phoneNumber: values.phoneNumber || null
    });

    await updateProfile(user, {
      displayName: values.displayName,
      photoURL: finalPhotoURL || null
    });

    const previousPhoto = state.original?.photoURL || '';
    if (state.newPhotoFile && previousPhoto && previousPhoto !== finalPhotoURL) {
      await deletePreviousPhotoIfManaged(user.uid, previousPhoto);
    }

    const updatedPayload = {
      displayName: values.displayName,
      phoneNumber: values.phoneNumber,
      photoURL: finalPhotoURL || ''
    };
    state.original = { ...updatedPayload };
    state.currentPhotoURL = updatedPayload.photoURL;
    state.isDirty = false;
    state.newPhotoFile = null;
    const fileLabel = byId('profileEditorPhotoFilename');
    if (fileLabel) fileLabel.textContent = '';
    showSuccess(t('profileEditor.successSaved', 'Profile updated successfully.'));

    try {
      window.dispatchEvent(new CustomEvent('cabinetProfileUpdated', { detail: updatedPayload }));
    } catch (_error) {
      // no-op
    }
  } catch (error) {
    const raw = String(error?.message || '').trim();
    if (raw.includes('Phone number')) {
      showError(t('profileEditor.errorInvalidPhone', 'Phone number must be in E.164 format, example: +79991234567.'));
    } else if (raw.includes('AUTH_REQUIRED') || raw.includes('AUTH_TOKEN') || raw.includes('INVALID_AUTH_TOKEN')) {
      showError(t('profileEditor.errorNotAuthorized', 'Authorization required. Please sign in again.'));
    } else {
      showError(`${t('profileEditor.errorSaveFailed', 'Failed to update profile. Please try again.')}${raw ? ` (${raw})` : ''}`);
    }
    console.error('[profileEditor] save failed:', raw || error);
  } finally {
    setEditorBusy(false);
  }
}

function attemptCloseProfileEditor() {
  if (state.isSaving) return;
  if (state.isDirty) {
    showCloseConfirm();
    return;
  }
  closeEditorNow();
}

function cancelCloseProfileEditor() {
  hideCloseConfirm();
}

function forceCloseProfileEditor() {
  closeEditorNow();
}

function registerUiEvents() {
  const preview = byId('profileEditorPhotoPreview');
  if (preview) {
    preview.addEventListener('load', () => setPhotoLoading(false));
    preview.addEventListener('error', () => setPhotoLoading(false));
  }

  document.querySelector('#profileEditorModal [data-editor-overlay="true"]')?.addEventListener('click', () => {
    attemptCloseProfileEditor();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!state.isOpen) return;
    attemptCloseProfileEditor();
  });
}

function exposeGlobals() {
  window.openProfileEditor = openProfileEditor;
  window.saveProfileEditor = saveProfileEditor;
  window.sendProfileEmailVerification = sendProfileEmailVerification;
  window.refreshProfileEmailVerificationStatus = refreshProfileEmailVerificationStatus;
  window.attemptCloseProfileEditor = attemptCloseProfileEditor;
  window.cancelCloseProfileEditor = cancelCloseProfileEditor;
  window.forceCloseProfileEditor = forceCloseProfileEditor;
}

function init() {
  exposeGlobals();
  bindInputListeners();
  registerUiEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
