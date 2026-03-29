import { getCurrentUser, getWallet, getUserTransactions, getUserEscrows, requestWithdrawal, initializePayment } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import { escapeHTML } from '../utils/authSecurity.js';

export async function createPaymentsHub() {
  const user = await getCurrentUser();
  if (!user) { navigate('/login'); return document.createElement('div'); }

  const wallet = await getWallet();
  const transactions = await getUserTransactions(user.id);
  const escrows = await getUserEscrows(user.id);

  const page = document.createElement('div');
  page.className = 'dashboard payments-hub';

  const isLandlord = user.role === 'landlord' || user.role === 'admin';

  // Summary stats
  const totalIn = transactions
    .filter(t => ['deposit', 'escrow_release', 'refund'].includes(t.type) && t.status === 'completed')
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalOut = transactions
    .filter(t => ['payment', 'escrow_hold', 'withdraw', 'fee'].includes(t.type) && t.status === 'completed')
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const activeEscrows = escrows.filter(e => e.status === 'held' || e.status === 'pending');
  const escrowTotal = activeEscrows.reduce((s, e) => s + (e.amount || 0), 0);

  page.innerHTML = `
    <div class="dashboard-header">
      <h1 class="dashboard-greeting">Payments <span>💳</span></h1>
      <p class="dashboard-subtitle">Manage your wallet, transactions, and escrow</p>
    </div>

    <!-- Wallet Overview Cards -->
    <div class="payments-overview">
      <div class="payments-wallet-card">
        <div class="payments-wallet-card-inner">
          <div class="payments-wallet-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><circle cx="18" cy="14" r="2"/></svg>
          </div>
          <div class="payments-wallet-label">Available Balance</div>
          <div class="payments-wallet-amount" id="ph-wallet-balance">₦${(wallet.balance || 0).toLocaleString()}</div>
          <div class="payments-wallet-actions">
            <button class="payments-action-btn primary" id="ph-fund-btn">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M8 3v10M3 8h10"/></svg>
              Fund Wallet
            </button>
            ${isLandlord ? `
            <button class="payments-action-btn secondary" id="ph-withdraw-btn">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M8 13V3M3 8l5 5 5-5"/></svg>
              Withdraw
            </button>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="payments-stat-cards">
        <div class="payments-stat">
          <div class="payments-stat-icon income">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10 15V5M5 10l5-5 5 5"/></svg>
          </div>
          <div class="payments-stat-value">₦${totalIn.toLocaleString()}</div>
          <div class="payments-stat-label">Total Income</div>
        </div>
        <div class="payments-stat">
          <div class="payments-stat-icon expense">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10 5v10M15 10l-5 5-5-5"/></svg>
          </div>
          <div class="payments-stat-value">₦${totalOut.toLocaleString()}</div>
          <div class="payments-stat-label">Total Spent</div>
        </div>
        <div class="payments-stat">
          <div class="payments-stat-icon escrow">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M5 10V8a5 5 0 0110 0v2"/><rect x="3" y="10" width="14" height="8" rx="2"/><circle cx="10" cy="14" r="1.5"/></svg>
          </div>
          <div class="payments-stat-value">₦${escrowTotal.toLocaleString()}</div>
          <div class="payments-stat-label">In Escrow (${activeEscrows.length})</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="dashboard-tabs">
      <div class="dashboard-tab active" data-tab="transactions">All Transactions</div>
      <div class="dashboard-tab" data-tab="escrows">Escrow</div>
    </div>

    <div id="ph-tab-content"></div>

    <!-- Fund Wallet Modal -->
    <div class="ph-modal-overlay" id="ph-fund-modal" style="display:none">
      <div class="ph-modal">
        <div class="ph-modal-header">
          <h3 class="ph-modal-title">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10 3v14M3 10h14"/></svg>
            Fund Wallet
          </h3>
          <button class="ph-modal-close" id="ph-fund-close">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 5l10 10M15 5L5 15"/></svg>
          </button>
        </div>
        <div class="ph-modal-body">
          <label class="ph-modal-label">Amount (₦)</label>
          <input type="number" class="form-input" id="ph-fund-amount" placeholder="Enter amount" min="100" />
          <div class="ph-quick-amounts">
            <button class="ph-quick-btn" data-amount="1000">₦1,000</button>
            <button class="ph-quick-btn" data-amount="2000">₦2,000</button>
            <button class="ph-quick-btn" data-amount="5000">₦5,000</button>
            <button class="ph-quick-btn" data-amount="10000">₦10,000</button>
            <button class="ph-quick-btn" data-amount="20000">₦20,000</button>
            <button class="ph-quick-btn" data-amount="50000">₦50,000</button>
          </div>
          <p class="ph-modal-hint">You'll be redirected to Paystack for secure payment via card, bank transfer, or USSD.</p>
          <button class="auth-submit" id="ph-fund-submit" style="width:100%">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:middle;margin-right:6px"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/></svg>
            Fund via Paystack
          </button>
        </div>
      </div>
    </div>

    <!-- Withdraw Modal -->
    <div class="ph-modal-overlay" id="ph-withdraw-modal" style="display:none">
      <div class="ph-modal">
        <div class="ph-modal-header">
          <h3 class="ph-modal-title">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10 17V3M3 10l7 7 7-7"/></svg>
            Withdraw Funds
          </h3>
          <button class="ph-modal-close" id="ph-withdraw-close">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 5l10 10M15 5L5 15"/></svg>
          </button>
        </div>
        <div class="ph-modal-body">
          <div class="ph-withdraw-balance">
            Available: <strong id="ph-withdraw-avail">₦${(wallet.balance || 0).toLocaleString()}</strong>
          </div>
          <label class="ph-modal-label">Amount (₦)</label>
          <input type="number" class="form-input" id="ph-withdraw-amount" placeholder="Enter amount" min="100" max="${wallet.balance || 0}" />
          <label class="ph-modal-label">Bank Name</label>
          <input type="text" class="form-input" id="ph-withdraw-bank" placeholder="e.g. Access Bank" />
          <label class="ph-modal-label">Account Number</label>
          <input type="text" class="form-input" id="ph-withdraw-acct" placeholder="10-digit account number" maxlength="10" />
          <label class="ph-modal-label">Account Name</label>
          <input type="text" class="form-input" id="ph-withdraw-name" placeholder="Account holder name" />
          <p class="ph-modal-hint">Withdrawals are typically processed within 24 hours on business days.</p>
          <button class="auth-submit" id="ph-withdraw-submit" style="width:100%">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:middle;margin-right:6px"><path d="M8 13V3M3 8l5 5 5-5"/></svg>
            Request Withdrawal
          </button>
        </div>
      </div>
    </div>
  `;

  const tabContent = page.querySelector('#ph-tab-content');
  const tabs = page.querySelectorAll('.dashboard-tab');

  // ---- Transactions Tab ----
  function renderTransactions(filter = 'all') {
    let filtered = [...transactions];
    if (filter === 'income') filtered = filtered.filter(t => ['deposit', 'escrow_release', 'refund'].includes(t.type));
    if (filter === 'expense') filtered = filtered.filter(t => ['payment', 'escrow_hold', 'withdraw', 'fee'].includes(t.type));

    // Sort by date descending
    filtered.sort((a, b) => {
      const aTime = a.createdAt?.seconds || a.createdAt?.toDate?.()?.getTime() / 1000 || 0;
      const bTime = b.createdAt?.seconds || b.createdAt?.toDate?.()?.getTime() / 1000 || 0;
      return bTime - aTime;
    });

    tabContent.innerHTML = `
      <div class="payments-filter-bar">
        <button class="payments-filter-chip ${filter === 'all' ? 'active' : ''}" data-filter="all">All</button>
        <button class="payments-filter-chip ${filter === 'income' ? 'active' : ''}" data-filter="income">Income</button>
        <button class="payments-filter-chip ${filter === 'expense' ? 'active' : ''}" data-filter="expense">Expenses</button>
      </div>

      ${filtered.length === 0 ? `
        <div class="no-results">
          <svg viewBox="0 0 48 48" fill="none" stroke="#94A3B8" stroke-width="1.5" width="48" height="48" style="margin-bottom:12px"><rect x="6" y="10" width="36" height="28" rx="3"/><path d="M6 18h36"/><circle cx="16" cy="28" r="3"/><path d="M24 26h12M24 32h8"/></svg>
          <h3>No transactions yet</h3>
          <p>Your payment history will appear here</p>
        </div>
      ` : `
        <div class="payments-tx-list">
          ${filtered.map(t => {
            const isCredit = ['deposit', 'escrow_release', 'refund'].includes(t.type);
            const sign = isCredit ? '+' : '-';
            const colorClass = isCredit ? 'credit' : 'debit';
            const amount = Math.abs(t.amount);
            const date = formatDate(t.createdAt);
            const time = formatTime(t.createdAt);
            const typeLabels = {
              deposit: 'Wallet Deposit', payment: 'Rent Payment', escrow_hold: 'Escrow Hold',
              escrow_release: 'Escrow Release', refund: 'Refund', withdraw: 'Withdrawal', fee: 'Service Fee'
            };
            const typeIcons = {
              deposit: '<path d="M12 19V5M5 12l7-7 7 7"/>',
              payment: '<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>',
              escrow_hold: '<path d="M5 11V9a7 7 0 0114 0v2"/><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="16" r="1.5"/>',
              escrow_release: '<path d="M7 13l3 3 7-7"/><circle cx="12" cy="12" r="10"/>',
              refund: '<path d="M3 12a9 9 0 109-9"/><path d="M3 3v9h9"/>',
              withdraw: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
              fee: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>'
            };
            return `
              <div class="payments-tx-item">
                <div class="payments-tx-icon ${colorClass}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    ${typeIcons[t.type] || typeIcons.payment}
                  </svg>
                </div>
                <div class="payments-tx-info">
                  <div class="payments-tx-type">${typeLabels[t.type] || t.type}</div>
                  <div class="payments-tx-date">${date} · ${time}</div>
                </div>
                <div class="payments-tx-right">
                  <div class="payments-tx-amount ${colorClass}">${sign}₦${amount.toLocaleString()}</div>
                  <div class="payments-tx-status"><span class="status-badge ${t.status}">${t.status}</span></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    // Filter chips
    tabContent.querySelectorAll('.payments-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => renderTransactions(chip.dataset.filter));
    });
  }

  // ---- Escrows Tab ----
  function renderEscrows() {
    const sorted = [...escrows].sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    tabContent.innerHTML = `
      ${sorted.length === 0 ? `
        <div class="no-results">
          <svg viewBox="0 0 48 48" fill="none" stroke="#94A3B8" stroke-width="1.5" width="48" height="48" style="margin-bottom:12px"><path d="M12 22V18a12 12 0 0124 0v4"/><rect x="8" y="22" width="32" height="20" rx="3"/><circle cx="24" cy="32" r="3"/></svg>
          <h3>No escrow transactions</h3>
          <p>Escrow holds will appear here when you make a rent payment</p>
        </div>
      ` : `
        <div class="payments-escrow-list">
          ${sorted.map(e => {
            const statusColors = {
              held: 'pending', pending: 'pending', released: 'approved', refunded: 'rejected', expired: 'rejected'
            };
            const statusLabels = {
              held: 'Funds Held', pending: 'Pending', released: 'Released', refunded: 'Refunded', expired: 'Expired'
            };
            const date = formatDate(e.createdAt);
            return `
              <div class="payments-escrow-card">
                <div class="payments-escrow-header">
                  <div class="payments-escrow-amount">₦${(e.amount || 0).toLocaleString()}</div>
                  <span class="status-badge ${statusColors[e.status] || e.status}">${statusLabels[e.status] || e.status}</span>
                </div>
                <div class="payments-escrow-details">
                  <div class="payments-escrow-detail">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3"/></svg>
                    ${date}
                  </div>
                  ${e.listingId ? `
                  <div class="payments-escrow-detail">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M3 7l5-5 5 5v7H3V7z"/><path d="M6 14V10h4v4"/></svg>
                    Property: ${escapeHTML(e.listingId.substring(0, 8))}...
                  </div>
                  ` : ''}
                  ${e.receiverId ? `
                  <div class="payments-escrow-detail">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="8" cy="5" r="3"/><path d="M3 14c0-2.76 2.24-5 5-5s5 2.24 5 5"/></svg>
                    ${user.role === 'landlord' ? 'From tenant' : 'To landlord'}
                  </div>
                  ` : ''}
                </div>
                <div class="payments-escrow-progress">
                  <div class="payments-escrow-step ${['held', 'released', 'refunded'].includes(e.status) ? 'done' : 'active'}">
                    <div class="payments-escrow-dot"></div>
                    <span>Payment</span>
                  </div>
                  <div class="payments-escrow-line ${['released', 'refunded'].includes(e.status) ? 'done' : ''}"></div>
                  <div class="payments-escrow-step ${e.status === 'held' ? 'active' : ['released', 'refunded'].includes(e.status) ? 'done' : ''}">
                    <div class="payments-escrow-dot"></div>
                    <span>Held</span>
                  </div>
                  <div class="payments-escrow-line ${['released', 'refunded'].includes(e.status) ? 'done' : ''}"></div>
                  <div class="payments-escrow-step ${['released', 'refunded'].includes(e.status) ? 'done' : ''}">
                    <div class="payments-escrow-dot"></div>
                    <span>${e.status === 'refunded' ? 'Refunded' : 'Released'}</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;
  }

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.tab === 'transactions') renderTransactions();
      else renderEscrows();
    });
  });

  // ---- Modal helpers ----
  const fundModal = page.querySelector('#ph-fund-modal');
  const withdrawModal = page.querySelector('#ph-withdraw-modal');

  function openModal(modal) {
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
  }
  function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 200);
  }

  async function refreshBalance() {
    const updated = await getWallet();
    wallet.balance = updated.balance;
    page.querySelector('#ph-wallet-balance').textContent = `₦${(updated.balance || 0).toLocaleString()}`;
    const availEl = page.querySelector('#ph-withdraw-avail');
    if (availEl) availEl.textContent = `₦${(updated.balance || 0).toLocaleString()}`;
    const maxEl = page.querySelector('#ph-withdraw-amount');
    if (maxEl) maxEl.max = updated.balance || 0;
  }

  // ---- Fund Wallet ----
  page.querySelector('#ph-fund-btn')?.addEventListener('click', () => openModal(fundModal));
  page.querySelector('#ph-fund-close')?.addEventListener('click', () => closeModal(fundModal));
  fundModal?.querySelector('.ph-modal-overlay')?.addEventListener?.('click', () => {});
  fundModal?.addEventListener('click', (e) => { if (e.target === fundModal) closeModal(fundModal); });

  // Quick amount buttons
  page.querySelectorAll('.ph-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      page.querySelector('#ph-fund-amount').value = btn.dataset.amount;
      page.querySelectorAll('.ph-quick-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Fund submit
  page.querySelector('#ph-fund-submit')?.addEventListener('click', async () => {
    const fundAmount = parseInt(page.querySelector('#ph-fund-amount').value);
    if (!fundAmount || fundAmount < 100) {
      showToast('Minimum amount is ₦100', 'error');
      return;
    }

    const btn = page.querySelector('#ph-fund-submit');
    btn.textContent = 'Initializing...';
    btn.disabled = true;

    try {
      const result = await initializePayment({
        amount: fundAmount,
        email: user.email,
        metadata: { purpose: 'wallet_fund' }
      });

      if (result.error) {
        showToast(result.error, 'error');
        btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:middle;margin-right:6px"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/></svg>Fund via Paystack`;
        btn.disabled = false;
        return;
      }

      // Open Paystack checkout
      if (typeof PaystackPop !== 'undefined' && result.access_code) {
        const popup = new PaystackPop();
        popup.resumeTransaction(result.access_code, {
          onSuccess: async () => {
            closeModal(fundModal);
            showToast('Payment successful! Updating wallet...', 'success');
            // Poll wallet balance
            for (let i = 0; i < 5; i++) {
              await new Promise(r => setTimeout(r, 3000));
              try {
                await refreshBalance();
                if ((wallet.balance || 0) > 0) break;
              } catch { /* retry */ }
            }
            btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:middle;margin-right:6px"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/></svg>Fund via Paystack`;
            btn.disabled = false;
          },
          onCancel: () => {
            showToast('Payment cancelled', 'error');
            btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:middle;margin-right:6px"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/></svg>Fund via Paystack`;
            btn.disabled = false;
          }
        });
      } else if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        showToast('Payment provider not configured. Contact support.', 'error');
        btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:middle;margin-right:6px"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/></svg>Fund via Paystack`;
        btn.disabled = false;
      }
    } catch (err) {
      showToast('Something went wrong. Try again.', 'error');
      btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:middle;margin-right:6px"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/></svg>Fund via Paystack`;
      btn.disabled = false;
    }
  });

  // ---- Withdraw ----
  page.querySelector('#ph-withdraw-btn')?.addEventListener('click', () => openModal(withdrawModal));
  page.querySelector('#ph-withdraw-close')?.addEventListener('click', () => closeModal(withdrawModal));
  withdrawModal?.addEventListener('click', (e) => { if (e.target === withdrawModal) closeModal(withdrawModal); });

  page.querySelector('#ph-withdraw-submit')?.addEventListener('click', async () => {
    const amount = parseInt(page.querySelector('#ph-withdraw-amount').value);
    const bank = page.querySelector('#ph-withdraw-bank').value.trim();
    const acct = page.querySelector('#ph-withdraw-acct').value.trim();
    const name = page.querySelector('#ph-withdraw-name').value.trim();

    if (!amount || amount < 100) { showToast('Minimum withdrawal is ₦100', 'error'); return; }
    if (amount > (wallet.balance || 0)) { showToast('Insufficient balance', 'error'); return; }
    if (!bank) { showToast('Enter your bank name', 'error'); return; }
    if (!acct || acct.length < 10) { showToast('Enter a valid 10-digit account number', 'error'); return; }
    if (!name) { showToast('Enter the account holder name', 'error'); return; }

    const btn = page.querySelector('#ph-withdraw-submit');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    try {
      const result = await requestWithdrawal(amount);
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        closeModal(withdrawModal);
        showToast('Withdrawal request submitted! Funds will arrive within 24 hours.', 'success');
        await refreshBalance();
      }
    } catch {
      showToast('Withdrawal failed. Try again later.', 'error');
    }

    btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:middle;margin-right:6px"><path d="M8 13V3M3 8l5 5 5-5"/></svg>Request Withdrawal`;
    btn.disabled = false;
  });

  // Initial render
  renderTransactions();

  return page;
}

// --- Helper functions ---
function formatDate(timestamp) {
  try {
    const d = timestamp?.toDate ? timestamp.toDate() :
      timestamp?.seconds ? new Date(timestamp.seconds * 1000) :
      timestamp ? new Date(timestamp) : null;
    if (!d) return 'N/A';
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return 'N/A'; }
}

function formatTime(timestamp) {
  try {
    const d = timestamp?.toDate ? timestamp.toDate() :
      timestamp?.seconds ? new Date(timestamp.seconds * 1000) :
      timestamp ? new Date(timestamp) : null;
    if (!d) return '';
    return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}
