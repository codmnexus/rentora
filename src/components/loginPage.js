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

        <!-- Onboarding Signup (hidden) -->
        <div id="signup-form" style="display:none">
          <div class="onboarding-container">
            <!-- Progress Bar -->
            <div class="onboarding-progress">
              <div class="onboarding-progress-bar" id="ob-progress-bar"></div>
              <div class="onboarding-steps-indicator">
                <div class="onboarding-step-dot active" data-step="1"><span>1</span></div>
                <div class="onboarding-step-dot" data-step="2"><span>2</span></div>
                <div class="onboarding-step-dot" data-step="3"><span>3</span></div>
                <div class="onboarding-step-dot" data-step="4"><span>4</span></div>
              </div>
            </div>

            <!-- Step Content Area -->
            <div class="onboarding-viewport" id="ob-viewport"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ===========================
  // SHARED UI REFERENCES
  // ===========================
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
      else {
        showForm('signup-form');
        if (obStep === 0) { obStep = 1; renderStep(); }
      }
    });
  });

  // ===========================
  // ONBOARDING STATE
  // ===========================
  let obStep = 0;
  const obData = { role: '', name: '', email: '', phone: '', password: '', confirmPassword: '',
    department: '', budget: '', preferredArea: '', genderPreference: '',
    propertyType: '', propertyCount: '', createdUserId: null };

  const viewport = page.querySelector('#ob-viewport');
  const progressBar = page.querySelector('#ob-progress-bar');
  const dots = page.querySelectorAll('.onboarding-step-dot');

  function updateProgress() {
    const pct = ((obStep - 1) / 3) * 100;
    progressBar.style.width = `${pct}%`;
    dots.forEach(d => {
      const s = parseInt(d.dataset.step);
      d.classList.toggle('active', s === obStep);
      d.classList.toggle('done', s < obStep);
    });
  }

  // ===========================
  // STEP RENDERERS
  // ===========================
  function renderStep(direction = 'forward') {
    updateProgress();
    viewport.className = 'onboarding-viewport';
    void viewport.offsetWidth; // force reflow
    viewport.classList.add(direction === 'forward' ? 'slide-in-right' : 'slide-in-left');

    if (obStep === 1) renderStep1();
    else if (obStep === 2) renderStep2();
    else if (obStep === 3) renderStep3();
    else if (obStep === 4) renderStep4();
  }

  // ---- STEP 1: Role Selection ----
  function renderStep1() {
    viewport.innerHTML = `
      <div class="ob-step-content">
        <div class="ob-step-header">
          <h3 class="ob-step-title">How will you use Rentora?</h3>
          <p class="ob-step-subtitle">Select your role to get a personalized experience</p>
        </div>
        <div class="ob-role-cards">
          <button class="ob-role-card ${obData.role === 'tenant' ? 'selected' : ''}" data-role="tenant">
            <div class="ob-role-icon tenant">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
                <path d="M8 36V20L20 8l12 12v16"/>
                <rect x="15" y="24" width="10" height="12" rx="1"/>
                <path d="M18 30h4"/>
                <circle cx="20" cy="15" r="2"/>
              </svg>
            </div>
            <div class="ob-role-label">Student / Tenant</div>
            <div class="ob-role-desc">I'm looking for accommodation near my school</div>
            <div class="ob-role-features">
              <span>🏠 Browse listings</span>
              <span>💬 Chat with landlords</span>
              <span>📋 Book inspections</span>
            </div>
          </button>
          <button class="ob-role-card ${obData.role === 'landlord' ? 'selected' : ''}" data-role="landlord">
            <div class="ob-role-icon landlord">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
                <rect x="4" y="14" width="32" height="22" rx="2"/>
                <path d="M4 20h32"/>
                <path d="M12 14V8h16v6"/>
                <circle cx="20" cy="27" r="3"/>
                <path d="M20 30v4"/>
              </svg>
            </div>
            <div class="ob-role-label">Landlord</div>
            <div class="ob-role-desc">I have properties to list for students</div>
            <div class="ob-role-features">
              <span>📝 List properties</span>
              <span>💰 Receive payments</span>
              <span>📊 Track earnings</span>
            </div>
          </button>
        </div>
      </div>
    `;

    viewport.querySelectorAll('.ob-role-card').forEach(card => {
      card.addEventListener('click', () => {
        obData.role = card.dataset.role;
        viewport.querySelectorAll('.ob-role-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        setTimeout(() => { obStep = 2; renderStep('forward'); }, 300);
      });
    });
  }

  // ---- STEP 2: Core Credentials ----
  function renderStep2() {
    viewport.innerHTML = `
      <div class="ob-step-content">
        <div class="ob-step-header">
          <div class="ob-step-nav-row">
            <button class="ob-back-btn" id="ob-back-2">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M15 10H5M5 10l5-5M5 10l5 5"/></svg>
            </button>
            <span class="ob-step-tag">Step 2 of 4</span>
          </div>
          <h3 class="ob-step-title">Create your account</h3>
          <p class="ob-step-subtitle">Just the essentials — takes 30 seconds</p>
        </div>

        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-input" id="ob-name" placeholder="John Doe" autocomplete="name" value="${obData.name}" />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" id="ob-email" placeholder="your@email.com" autocomplete="email" value="${obData.email}" />
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="tel" class="form-input" id="ob-phone" placeholder="08012345678" autocomplete="tel" value="${obData.phone}" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="ob-password" placeholder="Create a strong password" autocomplete="new-password" />
          <div class="password-strength" id="ob-strength" style="display:none">
            <div class="password-strength-bar"><div class="password-strength-fill" id="ob-strength-fill"></div></div>
            <span class="password-strength-label" id="ob-strength-label"></span>
          </div>
          <ul class="password-rules" id="ob-password-rules" style="display:none"></ul>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input type="password" class="form-input" id="ob-confirm-password" placeholder="Re-enter password" autocomplete="new-password" />
        </div>

        <div class="form-error" id="ob-error-2" style="display:none"></div>
        <button class="auth-submit ob-next-btn" id="ob-create-btn">
          Create Account
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
        </button>
      </div>
    `;

    // Back button
    viewport.querySelector('#ob-back-2').addEventListener('click', () => { 
      saveStep2Fields();
      obStep = 1; renderStep('backward'); 
    });

    // Password strength meter
    const pwInput = viewport.querySelector('#ob-password');
    const strengthBar = viewport.querySelector('#ob-strength');
    const strengthFill = viewport.querySelector('#ob-strength-fill');
    const strengthLabel = viewport.querySelector('#ob-strength-label');
    const rulesEl = viewport.querySelector('#ob-password-rules');

    pwInput.addEventListener('input', () => {
      const val = pwInput.value;
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

    function saveStep2Fields() {
      obData.name = viewport.querySelector('#ob-name')?.value?.trim() || obData.name;
      obData.email = viewport.querySelector('#ob-email')?.value?.trim() || obData.email;
      obData.phone = viewport.querySelector('#ob-phone')?.value?.trim() || obData.phone;
      obData.password = viewport.querySelector('#ob-password')?.value || obData.password;
      obData.confirmPassword = viewport.querySelector('#ob-confirm-password')?.value || obData.confirmPassword;
    }

    // Create Account
    viewport.querySelector('#ob-create-btn').addEventListener('click', async () => {
      saveStep2Fields();
      const errEl = viewport.querySelector('#ob-error-2');
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
        errEl.textContent = 'Password doesn\'t meet all requirements'; errEl.style.display = ''; return;
      }
      if (obData.password !== obData.confirmPassword) {
        errEl.textContent = 'Passwords do not match'; errEl.style.display = ''; return;
      }

      const btn = viewport.querySelector('#ob-create-btn');
      btn.textContent = 'Creating account...';
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
        btn.innerHTML = 'Create Account <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
        btn.disabled = false;
        return;
      }

      // Store for later profile updates
      if (result.user?.id) obData.createdUserId = result.user.id;

      // Handle email verification flow
      if (result.emailVerificationSent) {
        // Still proceed to step 3 — they can verify email later
        showToast('Account created! Check your email to verify.', 'success');
      } else {
        // localStorage/demo mode — auto login
        await loginUser(obData.email, obData.password);
        showToast(`Account created! 🎉`, 'success');
      }

      obStep = 3;
      renderStep('forward');
    });
  }

  // ---- STEP 3: Personalization ----
  function renderStep3() {
    const isTenant = obData.role === 'tenant';

    viewport.innerHTML = `
      <div class="ob-step-content">
        <div class="ob-step-header">
          <div class="ob-step-nav-row">
            <div></div>
            <span class="ob-step-tag">Step 3 of 4 · Optional</span>
          </div>
          <h3 class="ob-step-title">${isTenant ? 'Tell us your preferences' : 'About your properties'}</h3>
          <p class="ob-step-subtitle">${isTenant ? 'Help us find the perfect accommodation for you' : 'Help tenants discover your listings'}</p>
        </div>

        ${isTenant ? `
          <div class="form-group">
            <label class="form-label">Department</label>
            <input type="text" class="form-input" id="ob-department" placeholder="e.g. Computer Science" value="${obData.department}" />
          </div>
          <div class="form-row" style="margin-bottom:0">
            <div class="form-group">
              <label class="form-label">Budget Range (₦/yr)</label>
              <select class="form-select" id="ob-budget">
                <option value="">Select range</option>
                <option value="0-80000" ${obData.budget === '0-80000' ? 'selected' : ''}>Under ₦80,000</option>
                <option value="80000-150000" ${obData.budget === '80000-150000' ? 'selected' : ''}>₦80,000 – ₦150,000</option>
                <option value="150000-250000" ${obData.budget === '150000-250000' ? 'selected' : ''}>₦150,000 – ₦250,000</option>
                <option value="250000+" ${obData.budget === '250000+' ? 'selected' : ''}>₦250,000+</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Preferred Area</label>
              <select class="form-select" id="ob-area">
                <option value="">Any area</option>
                <option value="FUTA South Gate" ${obData.preferredArea === 'FUTA South Gate' ? 'selected' : ''}>FUTA South Gate</option>
                <option value="FUTA North Gate" ${obData.preferredArea === 'FUTA North Gate' ? 'selected' : ''}>FUTA North Gate</option>
                <option value="Roadblock" ${obData.preferredArea === 'Roadblock' ? 'selected' : ''}>Roadblock</option>
                <option value="Ijapo Estate" ${obData.preferredArea === 'Ijapo Estate' ? 'selected' : ''}>Ijapo Estate</option>
                <option value="Oba Ile" ${obData.preferredArea === 'Oba Ile' ? 'selected' : ''}>Oba Ile</option>
                <option value="Aule" ${obData.preferredArea === 'Aule' ? 'selected' : ''}>Aule</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Roommate Gender Preference</label>
            <select class="form-select" id="ob-gender-pref">
              <option value="">No preference</option>
              <option value="male" ${obData.genderPreference === 'male' ? 'selected' : ''}>Male only</option>
              <option value="female" ${obData.genderPreference === 'female' ? 'selected' : ''}>Female only</option>
            </select>
          </div>
        ` : `
          <div class="form-group">
            <label class="form-label">Type of Property</label>
            <select class="form-select" id="ob-property-type">
              <option value="">Select type</option>
              <option value="self-contain" ${obData.propertyType === 'self-contain' ? 'selected' : ''}>Self-Contain</option>
              <option value="single-room" ${obData.propertyType === 'single-room' ? 'selected' : ''}>Single Room</option>
              <option value="shared" ${obData.propertyType === 'shared' ? 'selected' : ''}>Shared Apartment</option>
              <option value="flat" ${obData.propertyType === 'flat' ? 'selected' : ''}>Flat / Apartment</option>
              <option value="hostel" ${obData.propertyType === 'hostel' ? 'selected' : ''}>Hostel</option>
              <option value="mixed" ${obData.propertyType === 'mixed' ? 'selected' : ''}>Mixed / Multiple Types</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">How many properties do you manage?</label>
            <select class="form-select" id="ob-property-count">
              <option value="">Select</option>
              <option value="1" ${obData.propertyCount === '1' ? 'selected' : ''}>1</option>
              <option value="2-5" ${obData.propertyCount === '2-5' ? 'selected' : ''}>2 – 5</option>
              <option value="6-10" ${obData.propertyCount === '6-10' ? 'selected' : ''}>6 – 10</option>
              <option value="10+" ${obData.propertyCount === '10+' ? 'selected' : ''}>10+</option>
            </select>
          </div>
        `}

        <div class="ob-actions">
          <button class="auth-submit ob-next-btn" id="ob-next-3">
            Continue
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </button>
          <button class="ob-skip-btn" id="ob-skip-3">Skip for now</button>
        </div>
      </div>
    `;

    function saveStep3() {
      if (isTenant) {
        obData.department = viewport.querySelector('#ob-department')?.value?.trim() || '';
        obData.budget = viewport.querySelector('#ob-budget')?.value || '';
        obData.preferredArea = viewport.querySelector('#ob-area')?.value || '';
        obData.genderPreference = viewport.querySelector('#ob-gender-pref')?.value || '';
      } else {
        obData.propertyType = viewport.querySelector('#ob-property-type')?.value || '';
        obData.propertyCount = viewport.querySelector('#ob-property-count')?.value || '';
      }
    }

    viewport.querySelector('#ob-next-3').addEventListener('click', async () => {
      saveStep3();
      // Save profile updates
      if (obData.createdUserId) {
        const updates = isTenant
          ? { department: obData.department, budget: obData.budget, preferredArea: obData.preferredArea, genderPreference: obData.genderPreference }
          : { propertyType: obData.propertyType, propertyCount: obData.propertyCount };
        try { await updateUser(obData.createdUserId, updates); } catch(e) { /* non-fatal */ }
      }
      obStep = 4;
      renderStep('forward');
    });

    viewport.querySelector('#ob-skip-3').addEventListener('click', () => {
      obStep = 4;
      renderStep('forward');
    });
  }

  // ---- STEP 4: Verification ----
  function renderStep4() {
    const isTenant = obData.role === 'tenant';

    viewport.innerHTML = `
      <div class="ob-step-content">
        <div class="ob-step-header">
          <div class="ob-step-nav-row">
            <button class="ob-back-btn" id="ob-back-4">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M15 10H5M5 10l5-5M5 10l5 5"/></svg>
            </button>
            <span class="ob-step-tag">Step 4 of 4 · Optional</span>
          </div>
          <h3 class="ob-step-title">${isTenant ? 'Verify your student status' : 'Verify your identity'}</h3>
          <p class="ob-step-subtitle">${isTenant ? 'Verified students get a trust badge on their profile' : 'Build trust with tenants by verifying your identity'}</p>
        </div>

        <div class="ob-verify-upload" id="ob-verify-dropzone">
          <div class="ob-verify-icon">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
              <rect x="6" y="10" width="36" height="28" rx="3"/>
              <circle cx="18" cy="24" r="5"/>
              <path d="M28 18h8M28 24h8M28 30h6"/>
              <path d="M42 38l-8-8"/>
            </svg>
          </div>
          <div class="ob-verify-text">
            <strong>${isTenant ? 'Upload Student ID Card' : 'Upload Valid ID / CAC Document'}</strong>
            <span>Click or drag to upload (JPG, PNG, PDF)</span>
          </div>
          <input type="file" id="ob-verify-file" accept="image/*,.pdf" style="display:none" />
        </div>
        <div id="ob-verify-preview" style="margin-top:8px"></div>

        <div class="ob-verify-benefits">
          <div class="ob-verify-benefit">
            <svg viewBox="0 0 20 20" fill="none" stroke="var(--color-success)" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
            <span>Trust badge on your profile</span>
          </div>
          <div class="ob-verify-benefit">
            <svg viewBox="0 0 20 20" fill="none" stroke="var(--color-success)" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
            <span>Higher response rates from ${isTenant ? 'landlords' : 'tenants'}</span>
          </div>
          <div class="ob-verify-benefit">
            <svg viewBox="0 0 20 20" fill="none" stroke="var(--color-success)" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
            <span>Priority in search results</span>
          </div>
        </div>

        <div class="ob-actions">
          <button class="auth-submit ob-next-btn" id="ob-finish-btn">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
            Complete Setup
          </button>
          <button class="ob-skip-btn" id="ob-skip-4">Skip for now</button>
        </div>
      </div>
    `;

    // File upload
    const dropzone = viewport.querySelector('#ob-verify-dropzone');
    const fileInput = viewport.querySelector('#ob-verify-file');
    const preview = viewport.querySelector('#ob-verify-preview');
    let uploadedFile = null;

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
      uploadedFile = file;
      preview.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(16,185,129,0.08);border-radius:10px;font-size:13px;color:#059669;font-weight:600">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
          ${sanitizeInput(file.name)} uploaded
        </div>
      `;
    }

    // Back
    viewport.querySelector('#ob-back-4').addEventListener('click', () => {
      obStep = 3; renderStep('backward');
    });

    // Finish
    viewport.querySelector('#ob-finish-btn').addEventListener('click', () => finishOnboarding());
    viewport.querySelector('#ob-skip-4').addEventListener('click', () => finishOnboarding());
  }

  function finishOnboarding() {
    showToast(`Welcome to Rentora, ${obData.name.split(' ')[0]}! 🎉`, 'success');
    if (obData.role === 'landlord') navigate('/landlord');
    else navigate('/');
    location.reload();
  }

  // ===========================
  // LOGIN (unchanged)
  // ===========================
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

  page.querySelector('#resend-verify-btn')?.addEventListener('click', async () => {
    const result = await resendVerificationEmail();
    if (result.success) {
      showToast('Verification email sent! Check your inbox.', 'success');
    } else {
      showToast(result.error || 'Could not send verification email.', 'error');
    }
  });

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

    if (result.emailNotVerified) {
      page.querySelector('#verify-message').textContent = result.message || 'Please verify your email address.';
      showForm('verify-notice');
      return;
    }

    clearLoginAttempts();
    showToast(`Welcome back, ${result.user.name}! 🎉`);
    const role = result.user.role;
    if (role === 'admin') navigate('/admin');
    else if (role === 'landlord') navigate('/landlord');
    else navigate('/');
    location.reload();
  });

  return page;
}
