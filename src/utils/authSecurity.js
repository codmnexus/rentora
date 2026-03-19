// ============================================
// Rentora — Auth Security Utilities
// ============================================
// Password validation, rate limiting, session timeout, input sanitization, output escaping

// ---- Output Escaping (for rendering in innerHTML) ----
/**
 * Escape HTML entities to prevent XSS when inserting user data into innerHTML.
 * Use this for DISPLAY, not for storage.
 * @param {*} input
 * @returns {string}
 */
export function escapeHTML(input) {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ---- Input Length Limits ----
export const MAX_LENGTHS = {
  title: 100,
  description: 2000,
  address: 200,
  message: 2000,
  reviewText: 1000,
  reportDetails: 1000,
  houseRules: 1000,
  maxPrice: 50000000,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 10,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

// ---- Password Strength Validation ----
const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters', key: 'length' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter', key: 'uppercase' },
  { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter', key: 'lowercase' },
  { test: (p) => /[0-9]/.test(p), label: 'One number', key: 'number' },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: 'One special character (!@#$...)', key: 'special' },
];

/**
 * Validate password strength.
 * @param {string} password
 * @returns {{ valid: boolean, score: number, results: Array<{key: string, label: string, passed: boolean}> }}
 */
export function validatePassword(password) {
  const results = PASSWORD_RULES.map(rule => ({
    key: rule.key,
    label: rule.label,
    passed: rule.test(password),
  }));
  const score = results.filter(r => r.passed).length;
  return {
    valid: score === PASSWORD_RULES.length,
    score,
    maxScore: PASSWORD_RULES.length,
    results,
  };
}

/**
 * Get a strength label and CSS class for the password score.
 */
export function getPasswordStrength(score, maxScore) {
  const ratio = score / maxScore;
  if (ratio === 0) return { label: '', className: '' };
  if (ratio < 0.4) return { label: 'Weak', className: 'strength-weak' };
  if (ratio < 0.7) return { label: 'Fair', className: 'strength-fair' };
  if (ratio < 1) return { label: 'Good', className: 'strength-good' };
  return { label: 'Strong', className: 'strength-strong' };
}

// ---- Client-Side Login Rate Limiter ----
const RATE_LIMIT_KEY = 'rentora_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Record a failed login attempt.
 * @returns {{ locked: boolean, remainingAttempts: number, lockoutEndsAt: number|null }}
 */
export function recordFailedLogin() {
  const data = _getRateLimitData();
  const now = Date.now();

  // If lockout has expired, reset
  if (data.lockoutUntil && now > data.lockoutUntil) {
    _resetRateLimit();
    return recordFailedLogin();
  }

  data.attempts.push(now);

  // Only count recent attempts (within lockout window)
  data.attempts = data.attempts.filter(t => now - t < LOCKOUT_MS);

  if (data.attempts.length >= MAX_ATTEMPTS) {
    data.lockoutUntil = now + LOCKOUT_MS;
  }

  _setRateLimitData(data);

  return {
    locked: !!data.lockoutUntil && now < data.lockoutUntil,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - data.attempts.length),
    lockoutEndsAt: data.lockoutUntil || null,
  };
}

/**
 * Check if the user is currently locked out.
 * @returns {{ locked: boolean, remainingMs: number }}
 */
export function checkLoginLockout() {
  const data = _getRateLimitData();
  const now = Date.now();

  if (data.lockoutUntil && now < data.lockoutUntil) {
    return { locked: true, remainingMs: data.lockoutUntil - now };
  }

  // If lockout has expired, reset
  if (data.lockoutUntil && now >= data.lockoutUntil) {
    _resetRateLimit();
  }

  return { locked: false, remainingMs: 0 };
}

/**
 * Clear rate limit data (call on successful login).
 */
export function clearLoginAttempts() {
  _resetRateLimit();
}

function _getRateLimitData() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { attempts: [], lockoutUntil: null };
    return JSON.parse(raw);
  } catch {
    return { attempts: [], lockoutUntil: null };
  }
}

function _setRateLimitData(data) {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
}

function _resetRateLimit() {
  localStorage.removeItem(RATE_LIMIT_KEY);
}

// ---- Session Timeout Manager ----
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let _sessionTimer = null;
let _onTimeoutCallback = null;
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

/**
 * Start the session idle timer. Calls `onTimeout` after inactivity.
 * Resets on any user interaction.
 * @param {Function} onTimeout - Called when session expires
 */
export function startSessionTimer(onTimeout) {
  _onTimeoutCallback = onTimeout;
  _resetSessionTimer();

  // Listen for user activity to reset the timer
  ACTIVITY_EVENTS.forEach(evt => {
    document.addEventListener(evt, _handleActivity, { passive: true });
  });
}

/**
 * Stop the session timer and remove activity listeners.
 */
export function stopSessionTimer() {
  if (_sessionTimer) {
    clearTimeout(_sessionTimer);
    _sessionTimer = null;
  }
  ACTIVITY_EVENTS.forEach(evt => {
    document.removeEventListener(evt, _handleActivity);
  });
  _onTimeoutCallback = null;
}

let _activityThrottleTimer = null;
function _handleActivity() {
  // Throttle resets to once per 30 seconds to avoid excessive timer resets
  if (_activityThrottleTimer) return;
  _activityThrottleTimer = setTimeout(() => { _activityThrottleTimer = null; }, 30000);
  _resetSessionTimer();
}

function _resetSessionTimer() {
  if (_sessionTimer) clearTimeout(_sessionTimer);
  _sessionTimer = setTimeout(() => {
    if (_onTimeoutCallback) _onTimeoutCallback();
  }, SESSION_TIMEOUT_MS);
}

// ---- Input Sanitization ----
/**
 * Sanitize user input to prevent XSS attacks.
 * Escapes HTML entities and strips script tags.
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize an object's string values (shallow).
 * @param {Object} obj
 * @returns {Object}
 */
export function sanitizeObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === 'string' ? sanitizeInput(value) : value;
  }
  return result;
}

// ---- Email Validation ----
/**
 * Basic email format validation.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---- Phone Validation ----
/**
 * Nigerian phone number validation.
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  return /^0[789][01]\d{8}$/.test(phone.replace(/[\s-]/g, ''));
}
