import { createUser, loginUser } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';

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
            <input type="email" class="form-input" id="login-email" placeholder="your@email.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="login-password" placeholder="Enter password" />
          </div>
          <div class="form-error" id="login-error" style="display:none"></div>
          <button class="auth-submit" id="login-btn">Log in</button>
          <div class="auth-divider">or</div>
          <button class="auth-google">
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92a8.78 8.78 0 002.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26a5.4 5.4 0 01-8.09-2.84H1.03v2.33A9 9 0 009 18z"/><path fill="#FBBC05" d="M3.96 10.72a5.41 5.41 0 010-3.44V4.95H1.03a9 9 0 000 8.1l2.93-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 001.03 4.95L3.96 7.28A5.36 5.36 0 019 3.58z"/></svg>
            Continue with Google
          </button>
        </div>
        <!-- Signup form (hidden) -->
        <div id="signup-form" style="display:none">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="signup-name" placeholder="John Doe" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="signup-email" placeholder="your@email.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" class="form-input" id="signup-phone" placeholder="08012345678" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="signup-password" placeholder="Create password" />
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
          <div class="auth-divider">or</div>
          <button class="auth-google">
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92a8.78 8.78 0 002.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26a5.4 5.4 0 01-8.09-2.84H1.03v2.33A9 9 0 009 18z"/><path fill="#FBBC05" d="M3.96 10.72a5.41 5.41 0 010-3.44V4.95H1.03a9 9 0 000 8.1l2.93-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 001.03 4.95L3.96 7.28A5.36 5.36 0 019 3.58z"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
      <div style="padding:0 24px 24px;text-align:center">
        <p style="font-size:12px;color:#94A3B8">Demo accounts: <strong>tunde@email.com</strong> (tenant) · <strong>adekunle@email.com</strong> (landlord) · <strong>admin@rentora.com</strong> (admin) — password: <strong>pass123</strong> / <strong>admin123</strong></p>
      </div>
    </div>
  `;

  // Tab switching
  const tabs = page.querySelectorAll('.auth-tab');
  const loginForm = page.querySelector('#login-form');
  const signupForm = page.querySelector('#signup-form');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.tab === 'login') { loginForm.style.display = ''; signupForm.style.display = 'none'; }
      else { loginForm.style.display = 'none'; signupForm.style.display = ''; }
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
    reader.onload = (ev) => {
      idPreview.innerHTML = `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(16,185,129,0.08);border-radius:8px;font-size:12px;color:#059669;font-weight:600">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><circle cx="10" cy="10" r="8"/><path d="M7 10l2.5 2.5L13 8"/></svg>
        ID uploaded — ${file.name}
      </div>`;
    };
    reader.readAsDataURL(file);
  });

  // Login
  page.querySelector('#login-btn').addEventListener('click', async () => {
    const email = page.querySelector('#login-email').value.trim();
    const password = page.querySelector('#login-password').value;
    const errEl = page.querySelector('#login-error');
    if (!email || !password) { errEl.textContent = 'Please fill in all fields'; errEl.style.display = ''; return; }
    const result = await loginUser(email, password);
    if (result.error) { errEl.textContent = result.error; errEl.style.display = ''; return; }
    showToast(`Welcome back, ${result.user.name}! 🎉`);
    const role = result.user.role;
    if (role === 'admin') navigate('/admin');
    else if (role === 'landlord') navigate('/landlord');
    else navigate('/');
    location.reload();
  });

  // Signup
  page.querySelector('#signup-btn').addEventListener('click', async () => {
    const name = page.querySelector('#signup-name').value.trim();
    const email = page.querySelector('#signup-email').value.trim();
    const phone = page.querySelector('#signup-phone').value.trim();
    const password = page.querySelector('#signup-password').value;
    const role = page.querySelector('#signup-role').value;
    const errEl = page.querySelector('#signup-error');
    if (!name || !email || !phone || !password) { errEl.textContent = 'Please fill in all fields'; errEl.style.display = ''; return; }

    const userData = { name, email, phone, password, role };
    // Add student profile fields if tenant
    if (role === 'tenant') {
      userData.department = page.querySelector('#signup-department')?.value?.trim() || '';
      userData.budget = page.querySelector('#signup-budget')?.value || '';
      userData.preferredArea = page.querySelector('#signup-area')?.value || '';
      userData.genderPreference = page.querySelector('#signup-gender-pref')?.value || '';
    }

    const result = await createUser(userData);
    if (result.error) { errEl.textContent = result.error; errEl.style.display = ''; return; }
    // Auto login
    await loginUser(email, password);
    showToast(`Account created! Welcome, ${name}! 🎉`);
    if (role === 'landlord') navigate('/landlord');
    else navigate('/');
    location.reload();
  });

  return page;
}
