import { getCurrentUser, getPropertiesByLandlord, getConversations, getPropertyById, deleteProperty, markAsRented, markAsAvailable, getInspectionsByLandlord, approveInspection, rescheduleInspection, getWallet, getUserTransactions, updateUser, getReportsByUser } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import { escapeHTML } from '../utils/authSecurity.js';

export async function createLandlordDashboard() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'landlord' && user.role !== 'admin')) { navigate('/login'); return document.createElement('div'); }

  const properties = await getPropertiesByLandlord(user.id);
  const convos = await getConversations(user.id);
  const inspections = await getInspectionsByLandlord(user.id);
  const wallet = await getWallet();
  const formatPrice = (p) => '₦' + p.toLocaleString();

  const page = document.createElement('div');
  page.className = 'dashboard';

  page.innerHTML = `
    <div class="dashboard-header">
      <h1 class="dashboard-greeting">Welcome, <span>${escapeHTML(user.name.split(' ')[0])}</span> 🏠</h1>
      <p class="dashboard-subtitle">Manage your property listings and tenant inquiries</p>
    </div>

    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-card-icon green"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.17 7.83L10 1l6.83 6.83V17a2 2 0 01-2 2H5.17a2 2 0 01-2-2V7.83z"/></svg></div>
        <div class="stat-card-value">${properties.length}</div>
        <div class="stat-card-label">Listings</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon blue"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 9-8 9 8 9 8-4 8-9 8-9-8-9-8z"/><circle cx="10" cy="12" r="3"/></svg></div>
        <div class="stat-card-value">${properties.reduce((s, p) => s + (p.views || 0), 0)}</div>
        <div class="stat-card-label">Views</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon amber"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 8h14M7 2v4M13 2v4"/></svg></div>
        <div class="stat-card-value">${inspections.length}</div>
        <div class="stat-card-label">Inspections</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon red"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13a2 2 0 01-2 2H6l-4 4V5a2 2 0 012-2h12a2 2 0 012 2z"/></svg></div>
        <div class="stat-card-value">${convos.length}</div>
        <div class="stat-card-label">Inquiries</div>
      </div>
      <div class="stat-card" id="ll-wallet-stat" style="cursor:pointer">
        <div class="stat-card-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><circle cx="18" cy="14" r="2"/></svg></div>
        <div class="stat-card-value" id="ll-wallet-balance">₦${(wallet.balance || 0).toLocaleString()}</div>
        <div class="stat-card-label">Wallet Balance</div>
      </div>
    </div>

    ${!user.profileCompleted ? `
    <div class="profile-completion-banner" id="profile-completion-banner">
      <div class="pcb-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <div class="pcb-content">
        <strong>Complete your profile to build trust with tenants</strong>
        <p>Add your property details and verify your identity to increase tenant confidence and get more inquiries.</p>
      </div>
      <button class="pcb-btn" id="open-profile-completion">
        <span>Complete Profile</span>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
      </button>
      <button class="pcb-dismiss" id="dismiss-profile-banner" title="Dismiss">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M6 6l8 8M14 6l-8 8"/></svg>
      </button>
    </div>
    ` : ''}

    <!-- Profile Completion Modal -->
    <div class="profile-modal-overlay" id="profile-modal-overlay" style="display:none">
      <div class="profile-modal">
        <button class="profile-modal-close" id="profile-modal-close">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M6 6l8 8M14 6l-8 8"/></svg>
        </button>
        <div class="profile-modal-header">
          <div class="profile-modal-steps">
            <div class="pm-step active" data-pm-step="1">
              <span class="pm-step-num">1</span>
              <span class="pm-step-label">Property Info</span>
            </div>
            <div class="pm-step-connector"><div class="pm-step-connector-fill" id="pm-connector-fill"></div></div>
            <div class="pm-step" data-pm-step="2">
              <span class="pm-step-num">2</span>
              <span class="pm-step-label">Verification</span>
            </div>
          </div>
        </div>
        <div class="profile-modal-body" id="profile-modal-body"></div>
      </div>
    </div>

    <div class="dashboard-tabs">
      <div class="dashboard-tab active" data-tab="listings">My Listings</div>
      <div class="dashboard-tab" data-tab="inspections">Inspection Requests (${inspections.filter(i => i.status === 'pending').length})</div>
      <div class="dashboard-tab" data-tab="payments">Payments</div>
      <div class="dashboard-tab" data-tab="reports">My Reports</div>
    </div>

    <div id="tab-content"></div>

    <div style="margin-top:24px">
      <button class="header-list-btn" id="add-property-btn">+ Post New Property</button>
    </div>
  `;

  const tabContent = page.querySelector('#tab-content');
  const tabs = page.querySelectorAll('.dashboard-tab');

  function renderListings() {
    tabContent.innerHTML = '';
    if (properties.length === 0) {
      tabContent.innerHTML = '<div class="no-results"><h3>No listings yet</h3><p>Post your first property</p></div>';
      return;
    }
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
      <thead><tr><th>Title</th><th>Area</th><th>Price</th><th>Views</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${properties.map(p => `
          <tr>
            <td style="font-weight:600">${escapeHTML(p.title)}</td>
            <td>${escapeHTML(p.area)}</td>
            <td>${formatPrice(p.price)}</td>
            <td>${p.views || 0}</td>
            <td><span class="status-badge ${p.rented ? 'rejected' : p.status}">${p.rented ? 'Rented' : p.status}</span></td>
            <td>
              ${!p.rented && p.status === 'approved' ? `<button class="action-btn approve" data-rented="${p.id}">Mark Rented</button>` : ''}
              ${p.rented ? `<button class="action-btn verify" data-available="${p.id}">Mark Available</button>` : ''}
              <button class="action-btn reject" data-delete="${p.id}">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;
    tabContent.appendChild(table);
    table.querySelectorAll('[data-rented]').forEach(btn => btn.addEventListener('click', async () => { await markAsRented(btn.dataset.rented); showToast('Marked as rented ✅'); location.reload(); }));
    table.querySelectorAll('[data-available]').forEach(btn => btn.addEventListener('click', async () => { await markAsAvailable(btn.dataset.available); showToast('Available again'); location.reload(); }));
    table.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', async () => { if (confirm('Delete?')) { await deleteProperty(btn.dataset.delete); showToast('Deleted', 'error'); location.reload(); } }));
  }

  async function renderInspections() {
    const items = await getInspectionsByLandlord(user.id);
    tabContent.innerHTML = '';
    if (items.length === 0) {
      tabContent.innerHTML = '<div class="no-results"><h3>No inspection requests</h3><p>Students will request inspections from your listings</p></div>';
      return;
    }
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
      <thead><tr><th>Property</th><th>Student</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${items.map(i => `
          <tr>
            <td style="font-weight:600">${i.propertyTitle}</td>
            <td>${i.tenantName}</td>
            <td>${new Date(i.date).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
            <td>${i.time}</td>
            <td><span class="status-badge ${i.status}">${i.status}</span></td>
            <td>
              ${i.status === 'pending' ? `
                <button class="action-btn approve" data-approve-insp="${i.id}">Confirm</button>
                <button class="action-btn reject" data-cancel-insp="${i.id}">Decline</button>
              ` : `<span style="font-size:12px;color:var(--color-gray-400)">${i.status}</span>`}
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;
    tabContent.appendChild(table);
    table.querySelectorAll('[data-approve-insp]').forEach(btn => btn.addEventListener('click', async () => { await approveInspection(btn.dataset.approveInsp); showToast('Inspection confirmed ✅'); renderInspections(); }));
    table.querySelectorAll('[data-cancel-insp]').forEach(btn => btn.addEventListener('click', async () => { await rescheduleInspection(btn.dataset.cancelInsp, '', ''); showToast('Inspection declined', 'error'); renderInspections(); }));
  }

  async function renderPaymentsPreview() {
    tabContent.innerHTML = '<div style="text-align:center;padding:32px;color:var(--color-gray-400)">Loading...</div>';
    const freshWallet = await getWallet();
    const transactions = await getUserTransactions(user.id);
    const recent = transactions.slice(0, 5);

    tabContent.innerHTML = `
      <div class="payments-preview-section">
        <div class="payments-preview-wallet">
          <div class="payments-preview-bal">
            <div class="payments-preview-bal-label">Available Balance</div>
            <div class="payments-preview-bal-value">₦${(freshWallet.balance || 0).toLocaleString()}</div>
          </div>
          <button class="payments-preview-cta" id="ll-goto-payments">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><circle cx="18" cy="14" r="2"/></svg>
            Go to Payments Hub →
          </button>
        </div>

        ${recent.length === 0 ? `
          <div class="no-results" style="margin-top:20px">
            <h3>No transactions yet</h3>
            <p>Your payment history will appear here once you receive rent payments</p>
          </div>
        ` : `
          <h4 style="font-size:15px;font-weight:700;margin:20px 0 12px;color:var(--color-gray-700)">Recent Activity</h4>
          <div class="payments-tx-list">
            ${recent.map(t => {
              const isCredit = ['deposit', 'escrow_release', 'refund'].includes(t.type);
              const colorClass = isCredit ? 'credit' : 'debit';
              const sign = isCredit ? '+' : '-';
              const amount = Math.abs(t.amount);
              const typeLabels = { deposit: 'Deposit', payment: 'Payment', escrow_hold: 'Escrow Hold', escrow_release: 'Escrow Release', refund: 'Refund', withdraw: 'Withdrawal', fee: 'Fee' };
              const date = t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : t.createdAt?.seconds ? new Date(t.createdAt.seconds * 1000).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : '';
              return `
                <div class="payments-tx-item">
                  <div class="payments-tx-icon ${colorClass}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                      ${isCredit ? '<path d="M12 19V5M5 12l7-7 7 7"/>' : '<path d="M12 5v14M19 12l-7 7-7-7"/>'}
                    </svg>
                  </div>
                  <div class="payments-tx-info">
                    <div class="payments-tx-type">${typeLabels[t.type] || t.type}</div>
                    <div class="payments-tx-date">${date}</div>
                  </div>
                  <div class="payments-tx-right">
                    <div class="payments-tx-amount ${colorClass}">${sign}₦${amount.toLocaleString()}</div>
                    <div class="payments-tx-status"><span class="status-badge ${t.status}">${t.status}</span></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          ${transactions.length > 5 ? '<p style="text-align:center;margin-top:12px;font-size:13px;color:var(--color-gray-400)">Showing 5 of ' + transactions.length + ' transactions</p>' : ''}
        `}
      </div>
    `;

    tabContent.querySelector('#ll-goto-payments')?.addEventListener('click', () => navigate('/payments'));
  }

  async function renderReports() {
    tabContent.innerHTML = '<div style="text-align:center;padding:32px;color:var(--color-gray-400)">Loading reports...</div>';
    const reports = await getReportsByUser(user.id);
    tabContent.innerHTML = '';
    if (reports.length === 0) {
      tabContent.innerHTML = `
        <div class="no-results">
          <h3>No reports submitted</h3>
          <p>If you encounter issues with listings or users, you can report them from the listing detail page</p>
        </div>
      `;
      return;
    }

    const reasonLabels = {
      scam: 'Suspected scam', fake: 'Fake listing', inappropriate: 'Inappropriate content',
      duplicate: 'Duplicate listing', unavailable: 'No longer available', harassment: 'Harassment',
      spam: 'Spam', discrimination: 'Discrimination', unsafe_property: 'Unsafe conditions',
      threatening: 'Threatening behaviour', identity_theft: 'Identity theft',
      wrong_info: 'Incorrect info', already_rented: 'Already rented', wrong_location: 'Wrong location',
      other: 'Other'
    };
    const categoryLabels = {
      safety: '🛡️ Safety', content: '📝 Content', availability: '🏠 Availability',
      conduct: '👤 Conduct', other: '📋 Other'
    };
    const sevColors = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444', critical: '#DC2626' };

    const container = document.createElement('div');
    container.className = 'my-reports-list';
    container.innerHTML = `
      <div class="my-reports-header">
        <h3>Your Reports</h3>
        <span class="my-reports-count">${reports.length} report${reports.length !== 1 ? 's' : ''}</span>
      </div>
      ${reports.map(r => {
        const date = new Date(r.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
        const statusClass = r.status === 'resolved' ? 'approved' : r.status === 'dismissed' ? 'rejected' : 'pending';
        return `
          <div class="my-report-card">
            <div class="my-report-top">
              <div class="my-report-meta">
                ${r.category ? `<span class="my-report-category">${categoryLabels[r.category] || r.category}</span>` : ''}
                <span class="my-report-type-badge ${r.targetType}">${r.targetType === 'property' ? '🏠 Listing' : '🔄 Takeover'}</span>
              </div>
              <span class="status-badge ${statusClass}">${r.status}</span>
            </div>
            <div class="my-report-reason">
              <strong>${reasonLabels[r.reason] || r.reason}</strong>
              ${r.severity ? `<span class="my-report-severity" style="--sev-color:${sevColors[r.severity] || '#F59E0B'}"><span class="my-report-sev-dot"></span>${r.severity}</span>` : ''}
            </div>
            ${r.details ? `<p class="my-report-details">${escapeHTML(r.details).substring(0, 200)}${r.details.length > 200 ? '...' : ''}</p>` : ''}
            ${r.evidenceFileName ? `<div class="my-report-evidence"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12"><path d="M14 10v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3"/><path d="M4 7l4-4 4 4"/><path d="M8 3v9"/></svg> ${escapeHTML(r.evidenceFileName)}</div>` : ''}
            <div class="my-report-footer">
              <span class="my-report-date">${date}</span>
              ${r.status === 'resolved' && r.resolution ? `<span class="my-report-resolution">Resolution: ${escapeHTML(r.resolution)}</span>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    `;
    tabContent.appendChild(container);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.tab === 'listings') renderListings();
      else if (tab.dataset.tab === 'payments') renderPaymentsPreview();
      else if (tab.dataset.tab === 'reports') renderReports();
      else renderInspections();
    });
  });

  page.querySelector('#ll-wallet-stat')?.addEventListener('click', () => navigate('/payments'));
  page.querySelector('#add-property-btn').addEventListener('click', () => navigate('/post-property'));

  // ===========================
  // PROFILE COMPLETION LOGIC
  // ===========================
  const banner = page.querySelector('#profile-completion-banner');
  const modalOverlay = page.querySelector('#profile-modal-overlay');
  const modalBody = page.querySelector('#profile-modal-body');
  let pmCurrentStep = 1;
  let pmData = {
    propertyType: user.propertyType || '',
    propertyCount: user.propertyCount || ''
  };

  // Dismiss banner
  page.querySelector('#dismiss-profile-banner')?.addEventListener('click', () => {
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(-10px)';
    setTimeout(() => { banner.style.display = 'none'; }, 300);
  });

  // Open modal
  page.querySelector('#open-profile-completion')?.addEventListener('click', () => {
    modalOverlay.style.display = '';
    pmCurrentStep = 1;
    renderPmStep();
  });

  // Close modal
  page.querySelector('#profile-modal-close')?.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
  });
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.style.display = 'none';
  });

  function updatePmSteps() {
    page.querySelectorAll('.pm-step').forEach(s => {
      const step = parseInt(s.dataset.pmStep);
      s.classList.toggle('active', step <= pmCurrentStep);
      s.classList.toggle('done', step < pmCurrentStep);
    });
    const fill = page.querySelector('#pm-connector-fill');
    if (fill) fill.style.width = pmCurrentStep >= 2 ? '100%' : '0%';
  }

  function renderPmStep() {
    updatePmSteps();
    if (pmCurrentStep === 1) renderPmPropertyInfo();
    else renderPmVerification();
  }

  function renderPmPropertyInfo() {
    modalBody.innerHTML = `
      <h3 class="pm-title">About your properties</h3>
      <p class="pm-subtitle">Help tenants discover your listings</p>
      <div class="pm-form">
        <div class="pm-field">
          <label>Type of Property</label>
          <select id="pm-property-type">
            <option value="">Select type</option>
            <option value="self-contain" ${pmData.propertyType === 'self-contain' ? 'selected' : ''}>Self-Contain</option>
            <option value="single-room" ${pmData.propertyType === 'single-room' ? 'selected' : ''}>Single Room</option>
            <option value="shared" ${pmData.propertyType === 'shared' ? 'selected' : ''}>Shared Apartment</option>
            <option value="flat" ${pmData.propertyType === 'flat' ? 'selected' : ''}>Flat / Apartment</option>
            <option value="hostel" ${pmData.propertyType === 'hostel' ? 'selected' : ''}>Hostel</option>
            <option value="mixed" ${pmData.propertyType === 'mixed' ? 'selected' : ''}>Mixed / Multiple Types</option>
          </select>
        </div>
        <div class="pm-field">
          <label>How many properties do you manage?</label>
          <select id="pm-property-count">
            <option value="">Select</option>
            <option value="1" ${pmData.propertyCount === '1' ? 'selected' : ''}>1</option>
            <option value="2-5" ${pmData.propertyCount === '2-5' ? 'selected' : ''}>2 – 5</option>
            <option value="6-10" ${pmData.propertyCount === '6-10' ? 'selected' : ''}>6 – 10</option>
            <option value="10+" ${pmData.propertyCount === '10+' ? 'selected' : ''}>10+</option>
          </select>
        </div>
        <div class="pm-actions">
          <button class="pm-btn-primary" id="pm-next-1">
            <span>Next: Verification</span>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
          </button>
          <button class="pm-btn-ghost" id="pm-skip-1">Skip & finish</button>
        </div>
      </div>
    `;

    modalBody.querySelector('#pm-next-1').addEventListener('click', () => {
      pmData.propertyType = modalBody.querySelector('#pm-property-type')?.value || '';
      pmData.propertyCount = modalBody.querySelector('#pm-property-count')?.value || '';
      pmCurrentStep = 2;
      renderPmStep();
    });

    modalBody.querySelector('#pm-skip-1').addEventListener('click', async () => {
      await finishProfileCompletion();
    });
  }

  function renderPmVerification() {
    modalBody.innerHTML = `
      <h3 class="pm-title">Verify your identity</h3>
      <p class="pm-subtitle">Build trust with tenants by verifying your identity</p>
      <div class="pm-form">
        <div class="pm-dropzone" id="pm-verify-dropzone">
          <div class="pm-dropzone-icon">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" width="44" height="44">
              <rect x="6" y="10" width="36" height="28" rx="3"/>
              <circle cx="18" cy="24" r="5"/>
              <path d="M28 18h8M28 24h8M28 30h6"/>
            </svg>
          </div>
          <strong>Upload Valid ID / CAC Document</strong>
          <span>Click or drag to upload (JPG, PNG, PDF)</span>
          <input type="file" id="pm-verify-file" accept="image/*,.pdf" style="display:none" />
        </div>
        <div id="pm-verify-preview"></div>

        <div class="pm-benefits">
          <div class="pm-benefit">
            <svg viewBox="0 0 20 20" fill="none" stroke="#22C55E" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
            <span>Verified badge on your profile</span>
          </div>
          <div class="pm-benefit">
            <svg viewBox="0 0 20 20" fill="none" stroke="#22C55E" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
            <span>Higher response rates from tenants</span>
          </div>
          <div class="pm-benefit">
            <svg viewBox="0 0 20 20" fill="none" stroke="#22C55E" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
            <span>Priority in search results</span>
          </div>
        </div>

        <div class="pm-actions">
          <button class="pm-btn-primary" id="pm-finish">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
            <span>Complete Profile</span>
          </button>
          <button class="pm-btn-ghost" id="pm-skip-2">Skip for now</button>
        </div>
      </div>
    `;

    // File upload
    const dropzone = modalBody.querySelector('#pm-verify-dropzone');
    const fileInput = modalBody.querySelector('#pm-verify-file');
    const preview = modalBody.querySelector('#pm-verify-preview');

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault(); dropzone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handlePmFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files[0]) handlePmFile(e.target.files[0]); });

    function handlePmFile(file) {
      preview.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(16,185,129,0.08);border-radius:10px;font-size:13px;color:#059669;font-weight:600;margin-top:8px">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
          ${escapeHTML(file.name)} uploaded
        </div>
      `;
    }

    modalBody.querySelector('#pm-finish').addEventListener('click', () => finishProfileCompletion());
    modalBody.querySelector('#pm-skip-2').addEventListener('click', () => finishProfileCompletion());
  }

  async function finishProfileCompletion() {
    const updates = {
      propertyType: pmData.propertyType,
      propertyCount: pmData.propertyCount,
      profileCompleted: true
    };
    try {
      await updateUser(user.id, updates);
    } catch (e) { /* non-fatal */ }

    // Hide banner and modal
    if (banner) banner.style.display = 'none';
    if (modalOverlay) modalOverlay.style.display = 'none';

    showToast('Profile completed! 🎉', 'success');
  }

  renderListings();
  return page;
}
