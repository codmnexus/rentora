import { getCurrentUser, getPropertyById, initializePayment, getWallet, createEscrow } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import { escapeHTML } from '../utils/authSecurity.js';

export async function createPaymentPage(propertyId) {
  const user = await getCurrentUser();
  if (!user) { navigate('/login'); return document.createElement('div'); }

  const property = propertyId ? await getPropertyById(propertyId) : null;
  const wallet = await getWallet();

  const page = document.createElement('div');
  page.className = 'post-property';

  const amount = property ? property.price : 0;
  const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
  const isFundedRedirect = window.location.href.includes('funded=true');

  page.innerHTML = `
    <div class="payment-container">
      <button class="detail-back-btn" id="pay-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <h1 style="font-size:24px;font-weight:800;margin-bottom:8px">Secure Payment</h1>
      <p class="subtitle" style="margin-bottom:24px">Your payment is protected by Rentora Escrow</p>

      <!-- Wallet Balance -->
      <div class="form-card" style="margin-bottom:16px;padding:16px 20px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:12px;font-weight:600;color:var(--color-gray-400);text-transform:uppercase;letter-spacing:0.5px">Wallet Balance</div>
            <div style="font-size:24px;font-weight:800;color:var(--color-primary)" id="wallet-balance">₦${(wallet.balance || 0).toLocaleString()}</div>
          </div>
          <button class="hero-search-btn" id="fund-wallet-btn" style="padding:8px 16px;font-size:13px">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"><path d="M8 3v10M3 8h10"/></svg>
            Fund Wallet
          </button>
        </div>
      </div>

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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 13l3 3 7-7"/><circle cx="12" cy="12" r="10"/></svg>
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

        ${property ? `
        <div style="background:var(--color-gray-50);border-radius:10px;padding:14px;margin-bottom:16px">
          <div style="font-weight:700;font-size:15px;margin-bottom:4px">${escapeHTML(property.title)}</div>
          <div style="color:var(--color-gray-400);font-size:13px">${escapeHTML(property.area)} · ${escapeHTML(property.type)}</div>
          <div style="font-weight:800;font-size:20px;color:var(--color-primary);margin-top:8px">₦${amount.toLocaleString()}<span style="font-size:12px;font-weight:400;color:var(--color-gray-400)">/year</span></div>
        </div>` : `
        <div class="form-group">
          <label class="form-label">Amount (₦)</label>
          <input type="number" class="form-input" id="custom-amount" placeholder="Enter amount" min="100" />
        </div>`}

        <div class="escrow-notice">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px;flex-shrink:0"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/><circle cx="8" cy="11.5" r="1"/></svg>
          <span>Your payment is held securely until you confirm the property matches the listing</span>
        </div>

        <div class="payment-methods">
          <label class="payment-method selected" data-method="wallet">
            <input type="radio" name="pay-method" value="wallet" checked />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 100 4 2 2 0 000-4z"/></svg>
            Pay from Wallet
          </label>
          <label class="payment-method" data-method="paystack">
            <input type="radio" name="pay-method" value="paystack" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
            Pay with Card/Transfer
          </label>
        </div>

        <div id="wallet-pay-info" style="font-size:13px;color:var(--color-gray-400);padding:8px 0">
          Amount will be deducted from your wallet and held in escrow.
        </div>

        <div id="paystack-pay-info" style="display:none;font-size:13px;color:var(--color-gray-400);padding:8px 0">
          You'll be redirected to Paystack to complete payment securely via card, bank transfer, or USSD.
        </div>

        <button class="auth-submit" id="pay-submit" style="width:100%">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;vertical-align:middle;margin-right:6px"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/></svg>
          ${property ? `Pay ₦${amount.toLocaleString()} Securely` : 'Fund Wallet'}
        </button>
      </div>

      <!-- Fund Wallet Modal -->
      <div class="form-card" id="fund-wallet-card" style="display:none">
        <div class="form-card-title">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v10M3 8h10"/></svg>
          Fund Your Wallet
        </div>
        <div class="form-group">
          <label class="form-label">Amount (₦)</label>
          <input type="number" class="form-input" id="fund-amount" placeholder="Enter amount" min="100" />
        </div>
        <p style="font-size:12px;color:var(--color-gray-400);margin-bottom:12px">You'll be redirected to Paystack for secure payment via card, bank transfer, or USSD.</p>
        <button class="auth-submit" id="fund-submit" style="width:100%">Fund via Paystack</button>
        <button class="detail-back-btn" id="fund-cancel" style="margin-top:8px">Cancel</button>
      </div>

      <!-- Success State -->
      <div class="form-card" id="payment-success" style="display:none;text-align:center;padding:40px 24px">
        <div style="width:60px;height:60px;border-radius:50%;background:rgba(16,185,129,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
          <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" style="width:32px;height:32px"><path d="M7 13l3 3 7-7"/><circle cx="12" cy="12" r="10"/></svg>
        </div>
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px" id="success-title">Payment Held in Escrow!</h2>
        <p style="color:var(--color-gray-500);font-size:14px;margin-bottom:24px" id="success-desc">Your payment is safe. Complete your inspection and confirm the property matches the listing to release funds to the landlord.</p>
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
      page.querySelector('#wallet-pay-info').style.display = method === 'wallet' ? '' : 'none';
      page.querySelector('#paystack-pay-info').style.display = method === 'paystack' ? '' : 'none';
    });
  });

  // Fund Wallet button
  page.querySelector('#fund-wallet-btn')?.addEventListener('click', () => {
    page.querySelector('#payment-form-card').style.display = 'none';
    page.querySelector('#fund-wallet-card').style.display = '';
  });

  page.querySelector('#fund-cancel')?.addEventListener('click', () => {
    page.querySelector('#payment-form-card').style.display = '';
    page.querySelector('#fund-wallet-card').style.display = 'none';
  });

  // Fund via Paystack
  page.querySelector('#fund-submit')?.addEventListener('click', async () => {
    const fundAmount = parseInt(page.querySelector('#fund-amount').value);
    if (!fundAmount || fundAmount < 100) {
      showToast('Minimum amount is ₦100', 'error');
      return;
    }

    const btn = page.querySelector('#fund-submit');
    btn.textContent = 'Initializing...';
    btn.disabled = true;

    const result = await initializePayment({
      amount: fundAmount,
      email: user.email,
      metadata: { purpose: 'wallet_fund' }
    });

    if (result.error) {
      showToast(result.error, 'error');
      btn.textContent = 'Fund via Paystack';
      btn.disabled = false;
      return;
    }

    // Open Paystack checkout using access_code from server initialization
    if (typeof PaystackPop !== 'undefined' && result.access_code) {
      const popup = new PaystackPop();
      popup.resumeTransaction(result.access_code, {
        onSuccess: async () => {
          showToast('Payment successful! Updating wallet...', 'success');
          page.querySelector('#fund-wallet-card').style.display = 'none';
          page.querySelector('#payment-form-card').style.display = '';
          // Poll wallet balance — webhook needs a few seconds to process
          for (let i = 0; i < 5; i++) {
            await new Promise(r => setTimeout(r, 3000));
            try {
              const updated = await getWallet();
              page.querySelector('#wallet-balance').textContent = `₦${(updated.balance || 0).toLocaleString()}`;
              if ((updated.balance || 0) > (wallet.balance || 0)) break; // Balance increased
            } catch { /* retry */ }
          }
        },
        onCancel: () => {
          showToast('Payment cancelled', 'error');
          btn.textContent = 'Fund via Paystack';
          btn.disabled = false;
        }
      });
    } else if (result.authorization_url) {
      // Fallback: redirect to Paystack (callback_url brings them back)
      window.location.href = result.authorization_url;
    } else {
      showToast('Payment provider not configured. Contact support.', 'error');
      btn.textContent = 'Fund via Paystack';
      btn.disabled = false;
    }
  });

  // Back
  page.querySelector('#pay-back').addEventListener('click', () => window.history.back());

  // Submit Payment
  page.querySelector('#pay-submit').addEventListener('click', async () => {
    const selectedMethod = page.querySelector('input[name="pay-method"]:checked')?.value;
    const payAmount = property ? amount : parseInt(page.querySelector('#custom-amount')?.value || 0);

    if (!payAmount || payAmount < 100) {
      showToast('Minimum payment is ₦100', 'error');
      return;
    }

    const btn = page.querySelector('#pay-submit');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    if (selectedMethod === 'wallet' && property) {
      // Pay from wallet → create escrow
      if ((wallet.balance || 0) < payAmount) {
        showToast('Insufficient wallet balance. Fund your wallet first.', 'error');
        btn.textContent = `Pay ₦${payAmount.toLocaleString()} Securely`;
        btn.disabled = false;
        return;
      }

      const escrowResult = await createEscrow({
        amount: payAmount,
        receiverId: property.landlordId,
        listingId: propertyId,
      });

      if (escrowResult.error) {
        showToast(escrowResult.error, 'error');
        btn.textContent = `Pay ₦${payAmount.toLocaleString()} Securely`;
        btn.disabled = false;
        return;
      }

      // Show success
      page.querySelector('#payment-form-card').style.display = 'none';
      page.querySelector('#payment-success').style.display = '';
      page.querySelectorAll('.escrow-step').forEach(s => s.classList.add('active'));
      page.querySelectorAll('.escrow-connector').forEach(c => c.classList.add('active'));
      page.querySelector('#step-1').classList.add('complete');
      showToast('Payment held in escrow!', 'success');

    } else if (selectedMethod === 'paystack') {
      // Pay via Paystack directly
      const result = await initializePayment({
        amount: payAmount,
        email: user.email,
        metadata: {
          purpose: property ? 'rent_payment' : 'wallet_fund',
          propertyId: propertyId || null,
        }
      });

      if (result.error) {
        showToast(result.error, 'error');
        btn.textContent = property ? `Pay ₦${payAmount.toLocaleString()} Securely` : 'Fund Wallet';
        btn.disabled = false;
        return;
      }

      if (typeof PaystackPop !== 'undefined' && result.access_code) {
        const popup = new PaystackPop();
        popup.resumeTransaction(result.access_code, {
          onSuccess: async () => {
            page.querySelector('#payment-form-card').style.display = 'none';
            page.querySelector('#payment-success').style.display = '';
            if (!property) {
              page.querySelector('#success-title').textContent = 'Wallet Funded!';
              page.querySelector('#success-desc').textContent = 'Your wallet balance is updating...';
            }
            page.querySelectorAll('.escrow-step').forEach(s => s.classList.add('active'));
            page.querySelectorAll('.escrow-connector').forEach(c => c.classList.add('active'));
            page.querySelector('#step-1').classList.add('complete');
            showToast('Payment successful!', 'success');
            // Poll wallet balance
            for (let i = 0; i < 5; i++) {
              await new Promise(r => setTimeout(r, 3000));
              try {
                const updated = await getWallet();
                page.querySelector('#wallet-balance').textContent = `₦${(updated.balance || 0).toLocaleString()}`;
                if ((updated.balance || 0) > (wallet.balance || 0)) {
                  if (!property) page.querySelector('#success-desc').textContent = `Your wallet has been funded with ₦${payAmount.toLocaleString()}.`;
                  break;
                }
              } catch { /* retry */ }
            }
          },
          onCancel: () => {
            showToast('Payment cancelled', 'error');
            btn.textContent = property ? `Pay ₦${payAmount.toLocaleString()} Securely` : 'Fund Wallet';
            btn.disabled = false;
          }
        });
      } else if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        showToast('Payment provider not configured.', 'error');
        btn.textContent = property ? `Pay ₦${payAmount.toLocaleString()} Securely` : 'Fund Wallet';
        btn.disabled = false;
      }
    }
  });

  // Dashboard
  page.querySelector('#pay-dashboard')?.addEventListener('click', () => navigate('/dashboard'));

  // Handle return from Paystack redirect
  if (isFundedRedirect) {
    setTimeout(async () => {
      page.querySelector('#payment-form-card').style.display = 'none';
      page.querySelector('#payment-success').style.display = '';
      page.querySelector('#success-title').textContent = 'Payment Successful!';
      page.querySelector('#success-desc').textContent = 'Updating your wallet balance...';
      page.querySelectorAll('.escrow-step').forEach(s => s.classList.add('active'));
      page.querySelector('#step-1').classList.add('complete');
      showToast('Payment received!', 'success');
      // Poll for updated balance
      for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 3000));
        try {
          const updated = await getWallet();
          page.querySelector('#wallet-balance').textContent = `₦${(updated.balance || 0).toLocaleString()}`;
          if ((updated.balance || 0) > (wallet.balance || 0)) {
            page.querySelector('#success-desc').textContent = 'Your wallet balance has been updated!';
            break;
          }
        } catch { /* retry */ }
      }
    }, 500);
  }

  return page;
}
