import { createUser, loginUser, resetPassword, resendVerificationEmail, updateUser } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import {
  validatePassword, getPasswordStrength,
  recordFailedLogin, checkLoginLockout, clearLoginAttempts,
  isValidEmail, isValidPhone, sanitizeInput
} from '../utils/authSecurity.js';

export function createLoginPage() {
  const page = document.createElement('div');
  page.className = 'auth-page-root';

  page.innerHTML = `
    <!-- ==================== LOGIN (Split Card) ==================== -->
    <div class="auth-split-page" id="auth-login-wrapper">
      <!-- BRANDED LEFT PANEL -->
      <div class="auth-brand-panel" id="auth-brand-panel">
        <div class="auth-brand-content">
          <div class="auth-brand-logo">
            <div class="auth-brand-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span class="auth-brand-logo-text">Rent<span>ora</span></span>
          </div>

          <h1 class="auth-brand-title">Welcome to Rentora!</h1>
          <p class="auth-brand-subtitle">Nigeria's smartest student housing marketplace. Find your next home or list your property in minutes.</p>

          <div class="auth-brand-floating-images">
            <div class="auth-brand-float-item auth-float-1">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M6 42V20L24 6l18 14v22"/><rect x="16" y="28" width="16" height="14" rx="1"/><path d="M22 35h4"/></svg>
            </div>
            <div class="auth-brand-float-item auth-float-2">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><rect x="4" y="8" width="40" height="32" rx="3"/><path d="M4 18h40"/><circle cx="14" cy="30" r="5"/><path d="M24 24h14M24 32h10"/></svg>
            </div>
            <div class="auth-brand-float-item auth-float-3">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><circle cx="24" cy="18" r="8"/><path d="M8 42c0-8 7-14 16-14s16 6 16 14"/></svg>
            </div>
            <div class="auth-brand-float-item auth-float-4">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M20 6L6 18v24h14V30h8v12h14V18L28 6"/><path d="M20 6h8v8h-8z"/></svg>
            </div>
          </div>

          <div class="auth-brand-dots">
            <span class="auth-dot active"></span>
            <span class="auth-dot"></span>
            <span class="auth-dot"></span>
          </div>

          <div class="auth-brand-stats">
            <div class="auth-brand-stat">
              <strong>5,000+</strong>
              <span>Active Listings</span>
            </div>
            <div class="auth-brand-stat">
              <strong>10,000+</strong>
              <span>Happy Students</span>
            </div>
            <div class="auth-brand-stat">
              <strong>98%</strong>
              <span>Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT FORM PANEL (Login only) -->
      <div class="auth-form-panel">
        <div class="auth-form-panel-inner">
          <div class="auth-view" id="login-view">
            <div class="auth-form-header">
              <h2 class="auth-form-title">Welcome Back</h2>
              <p class="auth-form-subtitle">Don't have an account? <a href="#" class="auth-link-accent" id="switch-to-signup">Sign Up</a></p>
            </div>

            <div id="login-form" class="auth-fields">
              <div class="auth-field">
                <label class="auth-field-label">Email</label>
                <input type="email" class="auth-field-input" id="login-email" placeholder="your@email.com" autocomplete="email" />
              </div>
              <div class="auth-field">
                <label class="auth-field-label">Password</label>
                <div class="auth-field-password-wrap">
                  <input type="password" class="auth-field-input" id="login-password" placeholder="Enter password" autocomplete="current-password" />
                  <button type="button" class="auth-field-eye" id="login-eye" tabindex="-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>

              <div class="auth-field-row">
                <label class="auth-checkbox-label"><input type="checkbox" id="login-remember" /> Remember me</label>
                <a href="#" class="auth-link-subtle" id="forgot-password-link">Forgot password?</a>
              </div>

              <div class="auth-form-error" id="login-error" style="display:none"></div>
              <div class="auth-form-info" id="login-info" style="display:none"></div>

              <button class="auth-primary-btn" id="login-btn">
                <span>Log In</span>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
              </button>

              <div class="auth-divider-line"><span>Or continue with</span></div>

              <button class="auth-social-btn" id="google-login-btn">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <!-- Forgot password form (hidden) -->
            <div id="forgot-form" style="display:none" class="auth-fields">
              <p class="auth-form-hint">Enter your email and we'll send you a link to reset your password.</p>
              <div class="auth-field">
                <label class="auth-field-label">Email</label>
                <input type="email" class="auth-field-input" id="forgot-email" placeholder="your@email.com" autocomplete="email" />
              </div>
              <div class="auth-form-error" id="forgot-error" style="display:none"></div>
              <div class="auth-form-info" id="forgot-info" style="display:none"></div>
              <button class="auth-primary-btn" id="forgot-btn">Send Reset Link</button>
              <div style="text-align:center;margin-top:8px">
                <a href="#" class="auth-link-subtle" id="back-to-login-link">← Back to login</a>
              </div>
            </div>

            <!-- Email verification notice (hidden) -->
            <div id="verify-notice" style="display:none" class="auth-fields">
              <div class="auth-verify-notice">
                <div class="auth-verify-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <h3>Verify Your Email</h3>
                <p id="verify-message">We've sent a verification link to your email. Please check your inbox and click the link to activate your account.</p>
                <button class="auth-primary-btn" id="resend-verify-btn" style="max-width:240px;margin:0 auto">Resend Verification</button>
                <a href="#" class="auth-link-subtle" id="back-to-login-from-verify" style="display:block;text-align:center;margin-top:8px">Back to login</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== SIGNUP (Clean Full-Page) ==================== -->
    <div class="signup-fullpage" id="signup-fullpage" style="display:none">
      <!-- Top bar -->
      <div class="signup-topbar">
        <div class="signup-topbar-logo">
          <div class="auth-brand-logo-icon" style="background:rgba(27,46,107,0.08);color:var(--color-primary)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <span class="signup-topbar-brand">Rent<span>ora</span></span>
        </div>
        <button class="signup-topbar-back" id="signup-back-to-login">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M15 10H5M5 10l5-5M5 10l5 5"/></svg>
          <span>Back to Login</span>
        </button>
      </div>

      <!-- Progress dots -->
      <div class="signup-progress" id="signup-progress">
        <div class="signup-progress-dot active" data-step="1"><span>1</span></div>
        <div class="signup-progress-connector"><div class="signup-progress-connector-fill" id="signup-connector-1"></div></div>
        <div class="signup-progress-dot" data-step="2"><span>2</span></div>
      </div>

      <!-- Step content area -->
      <div class="signup-content" id="signup-content"></div>
    </div>
  `;

  // ===========================
  // DOM REFERENCES
  // ===========================
  const loginWrapper = page.querySelector('#auth-login-wrapper');
  const signupWrapper = page.querySelector('#signup-fullpage');
  const loginForm = page.querySelector('#login-form');
  const forgotForm = page.querySelector('#forgot-form');
  const verifyNotice = page.querySelector('#verify-notice');

  function showLoginSection(sectionId) {
    [loginForm, forgotForm, verifyNotice].forEach(s => s.style.display = 'none');
    page.querySelector(`#${sectionId}`).style.display = '';
  }

  function showLogin() {
    loginWrapper.style.display = '';
    signupWrapper.style.display = 'none';
    showLoginSection('login-form');
  }

  function showSignup() {
    loginWrapper.style.display = 'none';
    signupWrapper.style.display = '';
    if (obStep === 0) { obStep = 1; renderStep(); }
  }

  // Password visibility toggle (login)
  const loginEye = page.querySelector('#login-eye');
  const loginPwField = page.querySelector('#login-password');
  loginEye.addEventListener('click', () => {
    const isPassword = loginPwField.type === 'password';
    loginPwField.type = isPassword ? 'text' : 'password';
    loginEye.innerHTML = isPassword
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  });

  // Switch to signup
  page.querySelector('#switch-to-signup').addEventListener('click', (e) => {
    e.preventDefault();
    showSignup();
  });

  // Switch back to login
  page.querySelector('#signup-back-to-login').addEventListener('click', () => {
    showLogin();
  });

  // ===========================
  // ONBOARDING STATE
  // ===========================
  let obStep = 0;
  const obData = {
    role: '', name: '', email: '', phone: '', password: '', confirmPassword: ''
  };

  const signupContent = page.querySelector('#signup-content');

  function updateProgress() {
    const dots = page.querySelectorAll('.signup-progress-dot');
    const connectors = page.querySelectorAll('.signup-progress-connector-fill');
    dots.forEach(d => {
      const s = parseInt(d.dataset.step);
      d.classList.toggle('active', s <= obStep);
      d.classList.toggle('done', s < obStep);
    });
    connectors.forEach((c, i) => {
      c.classList.toggle('filled', i + 1 < obStep);
    });
  }

  // ===========================
  // STEP RENDERERS
  // ===========================
  function renderStep(direction = 'forward') {
    updateProgress();
    signupContent.className = 'signup-content';
    void signupContent.offsetWidth;
    signupContent.classList.add(direction === 'forward' ? 'signup-slide-in' : 'signup-slide-back');

    if (obStep === 1) renderStep1();
    else if (obStep === 2) renderStep2();
  }

  // ---- STEP 1: Create Account ----
  function renderStep1() {
    signupContent.innerHTML = `
      <div class="signup-step">
        <h2 class="signup-step-title">Create Your Account</h2>
        <p class="signup-step-subtitle">Already have an account? <a href="#" class="auth-link-accent" id="ob-switch-login">Sign In</a></p>

        <div class="signup-form">
          <div class="signup-field">
            <label>Full Name</label>
            <input type="text" id="ob-name" placeholder="John Doe" autocomplete="name" value="${obData.name}" />
          </div>
          <div class="signup-field">
            <label>Email</label>
            <input type="email" id="ob-email" placeholder="your@email.com" autocomplete="email" value="${obData.email}" />
          </div>
          <div class="signup-field">
            <label>Phone Number</label>
            <input type="tel" id="ob-phone" placeholder="08012345678" autocomplete="tel" value="${obData.phone}" />
          </div>
          <div class="signup-field">
            <label>Password</label>
            <div class="signup-field-pw">
              <input type="password" id="ob-password" placeholder="Create a strong password" autocomplete="new-password" />
              <button type="button" class="signup-field-eye" id="ob-pw-eye" tabindex="-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div class="signup-pw-strength" id="ob-strength" style="display:none">
              <div class="signup-pw-track"><div class="signup-pw-fill" id="ob-strength-fill"></div></div>
              <span class="signup-pw-label" id="ob-strength-label"></span>
            </div>
            <ul class="signup-pw-rules" id="ob-password-rules" style="display:none"></ul>
          </div>
          <div class="signup-field">
            <label>Confirm Password</label>
            <input type="password" id="ob-confirm-password" placeholder="Re-enter password" autocomplete="new-password" />
          </div>

          <div class="signup-error" id="ob-error-1" style="display:none"></div>

          <button class="signup-btn-primary" id="ob-next-1">
            <span>Next</span>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
          </button>

          <div class="signup-divider"><span>Or sign up with</span></div>

          <button class="signup-btn-social" id="google-signup-btn">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    `;

    // Switch to login
    signupContent.querySelector('#ob-switch-login').addEventListener('click', (e) => {
      e.preventDefault(); showLogin();
    });

    // Password eye toggle
    const pwEye = signupContent.querySelector('#ob-pw-eye');
    const pwField = signupContent.querySelector('#ob-password');
    pwEye.addEventListener('click', () => {
      const isPassword = pwField.type === 'password';
      pwField.type = isPassword ? 'text' : 'password';
      pwEye.innerHTML = isPassword
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    });

    // Password strength
    const strengthBar = signupContent.querySelector('#ob-strength');
    const strengthFill = signupContent.querySelector('#ob-strength-fill');
    const strengthLabel = signupContent.querySelector('#ob-strength-label');
    const rulesEl = signupContent.querySelector('#ob-password-rules');

    pwField.addEventListener('input', () => {
      const val = pwField.value;
      if (!val) { strengthBar.style.display = 'none'; rulesEl.style.display = 'none'; return; }
      strengthBar.style.display = ''; rulesEl.style.display = '';

      const { score, maxScore, results } = validatePassword(val);
      const { label, className } = getPasswordStrength(score, maxScore);

      strengthFill.style.width = `${(score / maxScore) * 100}%`;
      strengthFill.className = `signup-pw-fill ${className}`;
      strengthLabel.textContent = label;
      strengthLabel.className = `signup-pw-label ${className}`;

      rulesEl.innerHTML = results.map(r =>
        `<li class="${r.passed ? 'pass' : 'fail'}">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px">
            ${r.passed ? '<path d="M4 8l3 3 5-5"/>' : '<path d="M4 4l8 8M12 4l-8 8"/>'}
          </svg>
          ${r.label}
        </li>`
      ).join('');
    });

    function saveStep1() {
      obData.name = signupContent.querySelector('#ob-name')?.value?.trim() || obData.name;
      obData.email = signupContent.querySelector('#ob-email')?.value?.trim() || obData.email;
      obData.phone = signupContent.querySelector('#ob-phone')?.value?.trim() || obData.phone;
      obData.password = signupContent.querySelector('#ob-password')?.value || obData.password;
      obData.confirmPassword = signupContent.querySelector('#ob-confirm-password')?.value || obData.confirmPassword;
    }

    signupContent.querySelector('#ob-next-1').addEventListener('click', () => {
      saveStep1();
      const errEl = signupContent.querySelector('#ob-error-1');
      errEl.style.display = 'none';

      if (!obData.name || !obData.email || !obData.phone || !obData.password) {
        errEl.textContent = 'Please fill in all fields'; errEl.style.display = ''; return;
      }
      if (!isValidEmail(obData.email)) {
        errEl.textContent = 'Please enter a valid email address'; errEl.style.display = ''; return;
      }
      if (!isValidPhone(obData.phone)) {
        errEl.textContent = 'Enter a valid Nigerian phone number (e.g. 08012345678)'; errEl.style.display = ''; return;
      }
      const { valid } = validatePassword(obData.password);
      if (!valid) {
        errEl.textContent = "Password doesn't meet all requirements"; errEl.style.display = ''; return;
      }
      if (obData.password !== obData.confirmPassword) {
        errEl.textContent = 'Passwords do not match'; errEl.style.display = ''; return;
      }

      obStep = 2;
      renderStep('forward');
    });
  }

  // ---- STEP 2: Select User Type ----
  function renderStep2() {
    signupContent.innerHTML = `
      <div class="signup-step">
        <h2 class="signup-step-title">Select User Type</h2>
        <p class="signup-step-subtitle">You can change your account at any time</p>

        <div class="signup-role-cards">
          <button class="signup-role-card ${obData.role === 'tenant' ? 'selected' : ''}" data-role="tenant">
            <div class="signup-role-icon">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" width="52" height="52">
                <circle cx="32" cy="20" r="10"/>
                <path d="M14 56c0-10 8-18 18-18s18 8 18 18"/>
                <path d="M32 30v8"/>
                <path d="M28 38h8"/>
              </svg>
            </div>
            <strong>Student / Tenant</strong>
            <span>I'm looking for accommodation near my school</span>
            <div class="signup-role-bar"></div>
          </button>

          <button class="signup-role-card ${obData.role === 'landlord' ? 'selected' : ''}" data-role="landlord">
            <div class="signup-role-icon">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" width="52" height="52">
                <circle cx="26" cy="22" r="8" fill="rgba(66,133,244,0.15)"/>
                <circle cx="40" cy="22" r="8"/>
                <path d="M12 52c0-8 6-14 14-14"/>
                <path d="M26 38c4 0 8 1.5 11 4"/>
                <path d="M52 52c0-8-6-14-14-14"/>
                <path d="M32 10v6M32 10l-4 3M32 10l4 3"/>
              </svg>
            </div>
            <strong>Landlord</strong>
            <span>I have properties to list for students</span>
            <div class="signup-role-bar"></div>
          </button>
        </div>

        <div class="signup-error" id="ob-error-2" style="display:none"></div>

        <button class="signup-btn-primary" id="ob-next-2">
          <span>Create Account</span>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
        </button>
      </div>
    `;

    // Role selection
    signupContent.querySelectorAll('.signup-role-card').forEach(card => {
      card.addEventListener('click', () => {
        obData.role = card.dataset.role;
        signupContent.querySelectorAll('.signup-role-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });

    // Next — create account
    signupContent.querySelector('#ob-next-2').addEventListener('click', async () => {
      const errEl = signupContent.querySelector('#ob-error-2');
      errEl.style.display = 'none';

      if (!obData.role) {
        errEl.textContent = 'Please select how you will use Rentora';
        errEl.style.display = '';
        return;
      }

      const btn = signupContent.querySelector('#ob-next-2');
      btn.querySelector('span').textContent = 'Creating account...';
      btn.disabled = true;

      const userData = {
        name: sanitizeInput(obData.name),
        email: obData.email,
        phone: sanitizeInput(obData.phone),
        password: obData.password,
        role: obData.role
      };

      const result = await createUser(userData);
      if (result.error) {
        errEl.textContent = result.error;
        errEl.style.display = '';
        btn.querySelector('span').textContent = 'Create Account';
        btn.disabled = false;
        return;
      }

      if (result.emailVerificationSent) {
        showToast('Account created! Check your email to verify.', 'success');
        // Show verification notice on login view
        showLogin();
        showLoginSection('verify-notice');
        return;
      } else {
        await loginUser(obData.email, obData.password);
        showToast(`Welcome to Rentora, ${obData.name.split(' ')[0]}! 🎉`, 'success');
      }

      // Redirect to dashboard immediately
      if (obData.role === 'landlord') navigate('/landlord');
      else navigate('/');
      location.reload();
    });
  }

  // Steps 3 & 4 (preferences + verification) are now handled
  // post-login via the profile completion banner on the dashboard.

  // ===========================
  // LOGIN HANDLERS (untouched)
  // ===========================
  page.querySelector('#forgot-password-link').addEventListener('click', (e) => {
    e.preventDefault(); showLoginSection('forgot-form');
  });

  page.querySelector('#back-to-login-link').addEventListener('click', (e) => {
    e.preventDefault(); showLoginSection('login-form');
  });

  page.querySelector('#back-to-login-from-verify')?.addEventListener('click', (e) => {
    e.preventDefault(); showLoginSection('login-form');
  });

  page.querySelector('#forgot-btn').addEventListener('click', async () => {
    const email = page.querySelector('#forgot-email').value.trim();
    const errEl = page.querySelector('#forgot-error');
    const infoEl = page.querySelector('#forgot-info');
    errEl.style.display = 'none'; infoEl.style.display = 'none';

    if (!email || !isValidEmail(email)) {
      errEl.textContent = 'Please enter a valid email address'; errEl.style.display = ''; return;
    }
    const result = await resetPassword(email);
    if (result.error) { errEl.textContent = result.error; errEl.style.display = ''; }
    else { infoEl.textContent = '✅ Password reset email sent! Check your inbox.'; infoEl.style.display = ''; }
  });

  page.querySelector('#resend-verify-btn')?.addEventListener('click', async () => {
    const result = await resendVerificationEmail();
    if (result.success) showToast('Verification email sent! Check your inbox.', 'success');
    else showToast(result.error || 'Could not send verification email.', 'error');
  });

  page.querySelector('#login-btn').addEventListener('click', async () => {
    const email = page.querySelector('#login-email').value.trim();
    const password = page.querySelector('#login-password').value;
    const errEl = page.querySelector('#login-error');
    const infoEl = page.querySelector('#login-info');
    errEl.style.display = 'none'; infoEl.style.display = 'none';

    if (!email || !password) {
      errEl.textContent = 'Please fill in all fields'; errEl.style.display = ''; return;
    }

    const lockout = checkLoginLockout();
    if (lockout.locked) {
      const mins = Math.ceil(lockout.remainingMs / 60000);
      errEl.textContent = `Too many failed attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`;
      errEl.style.display = ''; return;
    }

    const result = await loginUser(email, password);

    if (result.error) {
      const rl = recordFailedLogin();
      errEl.textContent = rl.locked
        ? 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.'
        : `${result.error} (${rl.remainingAttempts} attempt${rl.remainingAttempts !== 1 ? 's' : ''} remaining)`;
      errEl.style.display = ''; return;
    }

    if (result.emailNotVerified) {
      page.querySelector('#verify-message').textContent = result.message || 'Please verify your email address.';
      showLoginSection('verify-notice'); return;
    }

    clearLoginAttempts();
    showToast(`Welcome back, ${result.user.name}! 🎉`);
    const role = result.user.role;
    if (role === 'admin') navigate('/admin');
    else if (role === 'landlord') navigate('/landlord');
    else navigate('/');
    location.reload();
  });

  // Brand panel animations
  const floatItems = page.querySelectorAll('.auth-brand-float-item');
  floatItems.forEach((item, i) => { item.style.animationDelay = `${i * 0.8}s`; });

  let activeDotIndex = 0;
  const brandDots = page.querySelectorAll('.auth-dot');
  setInterval(() => {
    brandDots.forEach(d => d.classList.remove('active'));
    activeDotIndex = (activeDotIndex + 1) % brandDots.length;
    brandDots[activeDotIndex].classList.add('active');
  }, 3000);

  return page;
}
