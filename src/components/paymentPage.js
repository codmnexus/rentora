import { getCurrentUser } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';

export async function createPaymentPage(propertyId) {
  const user = await getCurrentUser();
  if (!user) { navigate('/login'); return document.createElement('div'); }

  const page = document.createElement('div');
  page.className = 'post-property';

  page.innerHTML = `
    <div class="payment-container">
      <button class="detail-back-btn" id="pay-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <h1 style="font-size:24px;font-weight:800;margin-bottom:8px">Secure Payment</h1>
      <p class="subtitle" style="margin-bottom:24px">Your payment is protected by Rentora Escrow</p>

      <!-- Escrow Step Tracker -->
      <div class="escrow-tracker">
        <div class="escrow-step active" id="step-1">
          <div class="escrow-step-icon">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="16" height="12" rx="2"/><path d="M2 8h16"/></svg>
          </div>
          <div class="escrow-step-label">Reserve</div>
          <div class="escrow-step-desc">Payment held in escrow</div>
        </div>
        <div class="escrow-connector"></div>
        <div class="escrow-step" id="step-2">
          <div class="escrow-step-icon">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 10s4-8 9-8 9 8 9 8-4 8-9 8-9-8-9-8z"/><circle cx="10" cy="10" r="3"/></svg>
          </div>
          <div class="escrow-step-label">Confirm</div>
          <div class="escrow-step-desc">Verify property matches</div>
        </div>
        <div class="escrow-connector"></div>
        <div class="escrow-step" id="step-3">
          <div class="escrow-step-icon">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10l3 3 6-6"/><circle cx="10" cy="10" r="8"/></svg>
          </div>
          <div class="escrow-step-label">Release</div>
          <div class="escrow-step-desc">Funds sent to landlord</div>
        </div>
      </div>

      <!-- Payment Form -->
      <div class="form-card" id="payment-form-card">
        <div class="form-card-title">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="16" height="12" rx="2"/><path d="M2 8h16"/></svg>
          Payment Details
        </div>
        <div class="escrow-notice">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px;flex-shrink:0"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/><circle cx="8" cy="11.5" r="1"/></svg>
          <span>Your payment is held securely until you confirm the property matches the listing</span>
        </div>

        <div class="payment-methods">
          <label class="payment-method selected" data-method="card">
            <input type="radio" name="pay-method" value="card" checked />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
            Card Payment
          </label>
          <label class="payment-method" data-method="transfer">
            <input type="radio" name="pay-method" value="transfer" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v4H3zM3 11h18v4H3zM3 19h18"/></svg>
            Bank Transfer
          </label>
        </div>

        <div id="card-fields">
          <div class="form-group">
            <label class="form-label">Card Number</label>
            <input type="text" class="form-input" placeholder="0000 0000 0000 0000" maxlength="19" id="card-number" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Expiry</label>
              <input type="text" class="form-input" placeholder="MM/YY" maxlength="5" />
            </div>
            <div class="form-group">
              <label class="form-label">CVV</label>
              <input type="password" class="form-input" placeholder="•••" maxlength="3" />
            </div>
          </div>
        </div>

        <div id="transfer-fields" style="display:none">
          <div class="transfer-details">
            <div class="booking-detail"><span>Bank</span><span class="booking-detail-value">Rentora Escrow Bank</span></div>
            <div class="booking-detail"><span>Account Number</span><span class="booking-detail-value">0123456789</span></div>
            <div class="booking-detail"><span>Account Name</span><span class="booking-detail-value">Rentora Escrow Ltd</span></div>
          </div>
          <p style="font-size:12px;color:var(--color-gray-400);margin-top:12px">Transfer the exact amount and click "Confirm Transfer" below</p>
        </div>

        <div class="mock-notice">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px;flex-shrink:0"><circle cx="8" cy="8" r="7"/><path d="M8 5v3M8 10v1"/></svg>
          <span>This is a demo — no real payment will be processed</span>
        </div>

        <button class="auth-submit" id="pay-submit" style="width:100%">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;vertical-align:middle;margin-right:6px"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/></svg>
          Pay Securely
        </button>
      </div>

      <!-- Success State (hidden) -->
      <div class="form-card" id="payment-success" style="display:none;text-align:center;padding:40px 24px">
        <div style="width:60px;height:60px;border-radius:50%;background:rgba(16,185,129,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
          <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" style="width:32px;height:32px"><path d="M7 13l3 3 7-7"/><circle cx="12" cy="12" r="10"/></svg>
        </div>
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Payment Held in Escrow!</h2>
        <p style="color:var(--color-gray-500);font-size:14px;margin-bottom:24px">Your payment is safe. Complete your inspection and confirm the property matches the listing to release funds to the landlord.</p>
        <button class="hero-search-btn" id="pay-dashboard" style="max-width:200px;margin:0 auto">Go to Dashboard</button>
      </div>
    </div>
  `;

  // Payment method toggle
  page.querySelectorAll('.payment-method').forEach(label => {
    label.addEventListener('click', () => {
      page.querySelectorAll('.payment-method').forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');
      const method = label.dataset.method;
      page.querySelector('#card-fields').style.display = method === 'card' ? '' : 'none';
      page.querySelector('#transfer-fields').style.display = method === 'transfer' ? '' : 'none';
    });
  });

  // Card number formatting
  page.querySelector('#card-number')?.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
  });

  // Back
  page.querySelector('#pay-back').addEventListener('click', () => window.history.back());

  // Submit
  page.querySelector('#pay-submit').addEventListener('click', () => {
    // Simulate payment
    const btn = page.querySelector('#pay-submit');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    setTimeout(() => {
      page.querySelector('#payment-form-card').style.display = 'none';
      page.querySelector('#payment-success').style.display = '';

      // Activate all steps
      page.querySelectorAll('.escrow-step').forEach(s => s.classList.add('active'));
      page.querySelectorAll('.escrow-connector').forEach(c => c.classList.add('active'));

      // Only first step fully complete
      page.querySelector('#step-1').classList.add('complete');
    }, 1500);
  });

  // Dashboard
  page.querySelector('#pay-dashboard')?.addEventListener('click', () => navigate('/dashboard'));

  return page;
}
