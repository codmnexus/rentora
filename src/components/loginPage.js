import { createUser, loginUser, resetPassword, resendVerificationEmail } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import {
  validatePassword, getPasswordStrength,
  recordFailedLogin, checkLoginLockout, clearLoginAttempts,
  isValidEmail, isValidPhone, sanitizeInput
} from '../utils/authSecurity.js';

export function createLoginPage() {
  const page = document.createElement('div');
  page.className = 'auth-page';

  page.innerHTML = `
    <div class="auth-card">
      <div class="auth-header">
        <h2>Welcome to Rentora</h2>
      </div>
      <div class="auth-tabs">
        <div class="auth-tab active" data-tab="login">Log in</div>
        <div class="auth-tab" data-tab="signup">Sign up</div>
      </div>
      <div class="auth-body" id="auth-form">
        <!-- Login form (default) -->
        <div id="login-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="login-email" placeholder="your@email.com" autocomplete="email" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="login-password" placeholder="Enter password" autocomplete="current-password" />
          </div>
          <div class="form-error" id="login-error" style="display:none"></div>
          <div class="form-info" id="login-info" style="display:none"></div>
          <button class="auth-submit" id="login-btn">Log in</button>
          <div style="text-align:center;margin-top:8px">
            <a href="#" class="auth-link" id="forgot-password-link">Forgot password?</a>
          </div>
        </div>

        <!-- Forgot password form (hidden) -->
        <div id="forgot-form" style="display:none">
          <p style="font-size:13px;color:var(--color-gray-400);margin-bottom:12px">Enter your email and we'll send you a link to reset your password.</p>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="forgot-email" placeholder="your@email.com" autocomplete="email" />
          </div>
          <div class="form-error" id="forgot-error" style="display:none"></div>
          <div class="form-info" id="forgot-info" style="display:none"></div>
          <button class="auth-submit" id="forgot-btn">Send Reset Link</button>
          <div style="text-align:center;margin-top:8px">
            <a href="#" class="auth-link" id="back-to-login-link">Back to login</a>
          </div>
        </div>

        <!-- Email verification notice (hidden) -->
        <div id="verify-notice" style="display:none">
          <div style="text-align:center;padding:24px 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" style="width:48px;height:48px;margin:0 auto 12px;display:block">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:4px">Verify Your Email</h3>
            <p style="font-size:13px;color:var(--color-gray-400);max-width:300px;margin:0 auto 16px" id="verify-message">We've sent a verification link to your email. Please check your inbox and click the link to activate your account.</p>
            <button class="auth-submit" id="resend-verify-btn" style="max-width:200px;margin:0 auto">Resend Verification</button>
            <div style="margin-top:8px">
              <a href="#" class="auth-link" id="back-to-login-from-verify">Back to login</a>
            </div>
          </div>
        </div>

        <!-- Signup form (hidden) -->
        <div id="signup-form" style="display:none">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="signup-name" placeholder="John Doe" autocomplete="name" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="signup-email" placeholder="your@email.com" autocomplete="email" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" class="form-input" id="signup-phone" placeholder="08012345678" autocomplete="tel" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="signup-password" placeholder="Create a strong password" autocomplete="new-password" />
            <div class="password-strength" id="password-strength" style="display:none">
              <div class="password-strength-bar"><div class="password-strength-fill" id="strength-fill"></div></div>
              <span class="password-strength-label" id="strength-label"></span>
            </div>
            <ul class="password-rules" id="password-rules" style="display:none"></ul>
          </div>
          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input type="password" class="form-input" id="signup-confirm-password" placeholder="Re-enter password" autocomplete="new-password" />
          </div>
          <div class="form-group">
            <label class="form-label">I am a</label>
            <select class="form-select" id="signup-role">
              <option value="tenant">Student / Tenant</option>
              <option value="landlord">Landlord</option>
            </select>
          </div>

          <!-- Enhanced Student Profile Fields -->
          <div id="student-profile-fields">
            <div class="profile-fields-header" style="margin:8px 0 4px;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.5px">Student Profile (optional)</div>
            <div class="form-group">
              <label class="form-label">Department</label>
              <input type="text" class="form-input" id="signup-department" placeholder="e.g. Computer Science" />
            </div>
            <div class="form-row" style="margin-bottom:0">
              <div class="form-group">
                <label class="form-label">Budget Range (₦/yr)</label>
                <select class="form-select" id="signup-budget">
                  <option value="">Select range</option>
                  <option value="0-80000">Under ₦80,000</option>
                  <option value="80000-150000">₦80,000 – ₦150,000</option>
                  <option value="150000-250000">₦150,000 – ₦250,000</option>
                  <option value="250000+">₦250,000+</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Preferred Area</label>
                <select class="form-select" id="signup-area">
                  <option value="">Any area</option>
                  <option value="FUTA South Gate">FUTA South Gate</option>
                  <option value="FUTA North Gate">FUTA North Gate</option>
                  <option value="Roadblock">Roadblock</option>
                  <option value="Ijapo Estate">Ijapo Estate</option>
                  <option value="Oba Ile">Oba Ile</option>
                  <option value="Aule">Aule</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Roommate Gender Preference</label>
              <select class="form-select" id="signup-gender-pref">
                <option value="">No preference</option>
                <option value="male">Male only</option>
                <option value="female">Female only</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Student ID (Verification)</label>
              <div class="id-upload-area" id="id-upload-area">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:24px;height:24px;margin-bottom:4px"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 20l-4.5-4.5L13 19l-3-3-5 5"/></svg>
                <span style="font-size:13px;font-weight:600">Upload Student ID</span>
                <span style="font-size:11px;color:#94A3B8">Click to add your student ID card photo</span>
                <input type="file" id="signup-id-file" accept="image/*" style="display:none" />
              </div>
              <div id="id-preview" style="margin-top:6px"></div>
            </div>
          </div>

          <div class="form-error" id="signup-error" style="display:none"></div>
          <button class="auth-submit" id="signup-btn">Create Account</button>
        </div>
      </div>
    </div>
  `;

  // Tab switching
  const tabs = page.querySelectorAll('.auth-tab');
  const loginForm = page.querySelector('#login-form');
  const signupForm = page.querySelector('#signup-form');
  const forgotForm = page.querySelector('#forgot-form');
  const verifyNotice = page.querySelector('#verify-notice');

  function showForm(formId) {
    [loginForm, signupForm, forgotForm, verifyNotice].forEach(f => f.style.display = 'none');
    page.querySelector(`#${formId}`).style.display = '';
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.tab === 'login') showForm('login-form');
      else showForm('signup-form');
    });
  });

  // Toggle student profile fields based on role
  const roleSelect = page.querySelector('#signup-role');
  const studentFields = page.querySelector('#student-profile-fields');
  roleSelect.addEventListener('change', () => {
    studentFields.style.display = roleSelect.value === 'tenant' ? '' : 'none';
  });

  // Student ID upload
  const idUploadArea = page.querySelector('#id-upload-area');
  const idFileInput = page.querySelector('#signup-id-file');
  const idPreview = page.querySelector('#id-preview');
  idUploadArea.addEventListener('click', () => idFileInput.click());
  idFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      idPreview.innerHTML = `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(16,185,129,0.08);border-radius:8px;font-size:12px;color:#059669;font-weight:600">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><circle cx="10" cy="10" r="8"/><path d="M7 10l2.5 2.5L13 8"/></svg>
        ID uploaded — ${sanitizeInput(file.name)}
      </div>`;
    };
    reader.readAsDataURL(file);
  });

  // ---- Password Strength Meter ----
  const passwordInput = page.querySelector('#signup-password');
  const strengthBar = page.querySelector('#password-strength');
  const strengthFill = page.querySelector('#strength-fill');
  const strengthLabel = page.querySelector('#strength-label');
  const rulesEl = page.querySelector('#password-rules');

  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    if (!val) { strengthBar.style.display = 'none'; rulesEl.style.display = 'none'; return; }
    strengthBar.style.display = '';
    rulesEl.style.display = '';

    const { score, maxScore, results } = validatePassword(val);
    const { label, className } = getPasswordStrength(score, maxScore);

    strengthFill.style.width = `${(score / maxScore) * 100}%`;
    strengthFill.className = `password-strength-fill ${className}`;
    strengthLabel.textContent = label;
    strengthLabel.className = `password-strength-label ${className}`;

    rulesEl.innerHTML = results.map(r =>
      `<li class="${r.passed ? 'rule-pass' : 'rule-fail'}">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px">
          ${r.passed ? '<path d="M4 8l3 3 5-5"/>' : '<path d="M4 4l8 8M12 4l-8 8"/>'}
        </svg>
        ${r.label}
      </li>`
    ).join('');
  });

  // ---- Forgot Password ----
  page.querySelector('#forgot-password-link').addEventListener('click', (e) => {
    e.preventDefault();
    showForm('forgot-form');
  });

  page.querySelector('#back-to-login-link').addEventListener('click', (e) => {
    e.preventDefault();
    showForm('login-form');
  });

  page.querySelector('#back-to-login-from-verify')?.addEventListener('click', (e) => {
    e.preventDefault();
    showForm('login-form');
  });

  page.querySelector('#forgot-btn').addEventListener('click', async () => {
    const email = page.querySelector('#forgot-email').value.trim();
    const errEl = page.querySelector('#forgot-error');
    const infoEl = page.querySelector('#forgot-info');
    errEl.style.display = 'none';
    infoEl.style.display = 'none';

    if (!email || !isValidEmail(email)) {
      errEl.textContent = 'Please enter a valid email address';
      errEl.style.display = '';
      return;
    }

    const result = await resetPassword(email);
    if (result.error) {
      errEl.textContent = result.error;
      errEl.style.display = '';
    } else {
      infoEl.textContent = '✅ Password reset email sent! Check your inbox.';
      infoEl.style.display = '';
    }
  });

  // ---- Resend Verification ----
  page.querySelector('#resend-verify-btn')?.addEventListener('click', async () => {
    const result = await resendVerificationEmail();
    if (result.success) {
      showToast('Verification email sent! Check your inbox.', 'success');
    } else {
      showToast(result.error || 'Could not send verification email.', 'error');
    }
  });

  // ---- Login with Rate Limiting ----
  page.querySelector('#login-btn').addEventListener('click', async () => {
    const email = page.querySelector('#login-email').value.trim();
    const password = page.querySelector('#login-password').value;
    const errEl = page.querySelector('#login-error');
    const infoEl = page.querySelector('#login-info');
    errEl.style.display = 'none';
    infoEl.style.display = 'none';

    if (!email || !password) {
      errEl.textContent = 'Please fill in all fields';
      errEl.style.display = '';
      return;
    }

    // Check rate limit before attempting login
    const lockout = checkLoginLockout();
    if (lockout.locked) {
      const mins = Math.ceil(lockout.remainingMs / 60000);
      errEl.textContent = `Too many failed attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`;
      errEl.style.display = '';
      return;
    }

    const result = await loginUser(email, password);

    if (result.error) {
      const rl = recordFailedLogin();
      if (rl.locked) {
        errEl.textContent = 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.';
      } else {
        errEl.textContent = `${result.error} (${rl.remainingAttempts} attempt${rl.remainingAttempts !== 1 ? 's' : ''} remaining)`;
      }
      errEl.style.display = '';
      return;
    }

    // Check if email verification is pending
    if (result.emailNotVerified) {
      page.querySelector('#verify-message').textContent = result.message || 'Please verify your email address.';
      showForm('verify-notice');
      return;
    }

    // Successful login
    clearLoginAttempts();
    showToast(`Welcome back, ${result.user.name}! 🎉`);
    const role = result.user.role;
    if (role === 'admin') navigate('/admin');
    else if (role === 'landlord') navigate('/landlord');
    else navigate('/');
    location.reload();
  });

  // ---- Signup with Validation ----
  page.querySelector('#signup-btn').addEventListener('click', async () => {
    const name = page.querySelector('#signup-name').value.trim();
    const email = page.querySelector('#signup-email').value.trim();
    const phone = page.querySelector('#signup-phone').value.trim();
    const password = page.querySelector('#signup-password').value;
    const confirmPassword = page.querySelector('#signup-confirm-password').value;
    const role = page.querySelector('#signup-role').value;
    const errEl = page.querySelector('#signup-error');
    errEl.style.display = 'none';

    // Required field validation
    if (!name || !email || !phone || !password) {
      errEl.textContent = 'Please fill in all required fields';
      errEl.style.display = '';
      return;
    }

    // Email validation
    if (!isValidEmail(email)) {
      errEl.textContent = 'Please enter a valid email address';
      errEl.style.display = '';
      return;
    }

    // Phone validation
    if (!isValidPhone(phone)) {
      errEl.textContent = 'Please enter a valid Nigerian phone number (e.g. 08012345678)';
      errEl.style.display = '';
      return;
    }

    // Password strength validation
    const { valid } = validatePassword(password);
    if (!valid) {
      errEl.textContent = 'Password does not meet all requirements. Check the checklist above.';
      errEl.style.display = '';
      return;
    }

    // Confirm password match
    if (password !== confirmPassword) {
      errEl.textContent = 'Passwords do not match';
      errEl.style.display = '';
      return;
    }

    const userData = { name: sanitizeInput(name), email, phone: sanitizeInput(phone), password, role };
    // Add student profile fields if tenant
    if (role === 'tenant') {
      userData.department = sanitizeInput(page.querySelector('#signup-department')?.value?.trim() || '');
      userData.budget = page.querySelector('#signup-budget')?.value || '';
      userData.preferredArea = page.querySelector('#signup-area')?.value || '';
      userData.genderPreference = page.querySelector('#signup-gender-pref')?.value || '';
    }

    const result = await createUser(userData);
    if (result.error) {
      errEl.textContent = result.error;
      errEl.style.display = '';
      return;
    }

    // Show verification notice instead of auto-logging in
    if (result.emailVerificationSent) {
      page.querySelector('#verify-message').textContent =
        `We've sent a verification email to ${email}. Please check your inbox and click the link to activate your account.`;
      showForm('verify-notice');
      showToast(`Account created! Please verify your email.`, 'success');
    } else {
      // Fallback: auto login (for demo/localStorage mode)
      await loginUser(email, password);
      showToast(`Account created! Welcome, ${name}! 🎉`);
      if (role === 'landlord') navigate('/landlord');
      else navigate('/');
      location.reload();
    }
  });

  return page;
}
