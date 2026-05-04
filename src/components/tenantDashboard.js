import { getCurrentUser, getSavedListings, getPropertyById, getConversations, getUserById, getTakeoversByStudent, getInspectionsByTenant, updateUser, getWallet, getUserTransactions, getReportsByUser } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { createPropertyCard } from './propertyCard.js';
import { createTakeoverCard } from './takeoverCard.js';
import { escapeHTML } from '../utils/authSecurity.js';

export async function createTenantDashboard() {
  const user = await getCurrentUser();
  if (!user) { navigate('/login'); return document.createElement('div'); }

  const saved = await getSavedListings(user.id);
  const savedProperties = (await Promise.all(saved.map(s => getPropertyById(s.propertyId)))).filter(Boolean);
  const convos = await getConversations(user.id);
  const myTakeovers = await getTakeoversByStudent(user.id);
  const myInspections = await getInspectionsByTenant(user.id);
  const wallet = await getWallet();

  const page = document.createElement('div');
  page.className = 'dashboard';

  page.innerHTML = `
    <div class="dashboard-header">
      <h1 class="dashboard-greeting">Hey, <span>${escapeHTML(user.name.split(' ')[0])}</span> 👋</h1>
      <p class="dashboard-subtitle">Find and manage your student housing</p>
    </div>

    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-card-icon green"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.17 7.83L10 1l6.83 6.83V17a2 2 0 01-2 2H5.17a2 2 0 01-2-2V7.83z"/></svg></div>
        <div class="stat-card-value">${savedProperties.length}</div>
        <div class="stat-card-label">Saved Homes</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon blue"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13a2 2 0 01-2 2H6l-4 4V5a2 2 0 012-2h12a2 2 0 012 2z"/></svg></div>
        <div class="stat-card-value">${convos.length}</div>
        <div class="stat-card-label">Conversations</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon amber"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 8h14M7 2v4M13 2v4"/></svg></div>
        <div class="stat-card-value">${myInspections.length}</div>
        <div class="stat-card-label">Inspections</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon red"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 9V7a4 4 0 014-4h14" stroke-width="1.5"/></svg></div>
        <div class="stat-card-value">${myTakeovers.length}</div>
        <div class="stat-card-label">Takeover Posts</div>
      </div>
      <div class="stat-card" id="tenant-wallet-stat" style="cursor:pointer">
        <div class="stat-card-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 100 4 2 2 0 000-4z"/></svg></div>
        <div class="stat-card-value" id="stat-wallet-balance">₦${(wallet.balance || 0).toLocaleString()}</div>
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
        <strong>Complete your profile to get the most out of Rentora</strong>
        <p>Add your housing preferences and verify your student status to get personalized recommendations and a trust badge.</p>
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
              <span class="pm-step-label">Preferences</span>
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
      <div class="dashboard-tab active" data-tab="saved">Saved Homes</div>
      <div class="dashboard-tab" data-tab="wallet">Wallet</div>
      <div class="dashboard-tab" data-tab="inspections">Inspections</div>
      <div class="dashboard-tab" data-tab="takeovers">My Takeovers</div>
      <div class="dashboard-tab" data-tab="reports">My Reports</div>
      <div class="dashboard-tab" data-tab="messages">Messages</div>
      <div class="dashboard-tab" data-tab="profile">Edit Profile</div>
    </div>

    <div id="tab-content"></div>

    <div style="margin-top:24px">
      <button class="hero-search-btn" id="post-takeover-btn" style="max-width:300px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
        Post Room Takeover
      </button>
    </div>
  `;

  const tabContent = page.querySelector('#tab-content');
  const tabs = page.querySelectorAll('.dashboard-tab');

  async function renderSaved() {
    tabContent.innerHTML = '';
    if (savedProperties.length === 0) {
      tabContent.innerHTML = '<div class="no-results"><h3>No saved homes yet</h3><p>Browse listings and save your favorites</p></div>';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'property-grid';
    for (const p of savedProperties) {
      grid.appendChild(await createPropertyCard(p));
    }
    tabContent.appendChild(grid);
  }

  function renderInspections() {
    tabContent.innerHTML = '';
    if (myInspections.length === 0) {
      tabContent.innerHTML = '<div class="no-results"><h3>No inspections booked</h3><p>Book an inspection from any property detail page</p></div>';
      return;
    }
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
      <thead><tr><th>Property</th><th>Landlord</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
      <tbody>
        ${myInspections.map(i => `
          <tr>
            <td style="font-weight:600">${i.propertyTitle}</td>
            <td>${i.landlordName || 'N/A'}</td>
            <td>${new Date(i.date).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
            <td>${i.time}</td>
            <td><span class="status-badge ${i.status}">${i.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    `;
    tabContent.appendChild(table);
  }

  async function renderTakeovers() {
    tabContent.innerHTML = '';
    if (myTakeovers.length === 0) {
      tabContent.innerHTML = '<div class="no-results"><h3>No takeover posts yet</h3><p>Post a room takeover if you\'re leaving</p></div>';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'property-grid';
    for (const t of myTakeovers) {
      grid.appendChild(await createTakeoverCard(t));
    }
    tabContent.appendChild(grid);
  }

  async function renderMessages() {
    tabContent.innerHTML = '';
    if (convos.length === 0) {
      tabContent.innerHTML = '<div class="no-results"><h3>No messages yet</h3><p>Contact a landlord to start a conversation</p></div>';
      return;
    }
    for (const c of convos) {
      const other = await getUserById(c.otherUserId);
      const prop = await getPropertyById(c.propertyId);
      const item = document.createElement('div');
      item.className = 'conversation-item';
      item.style.cssText = 'cursor:pointer;padding:16px;border:1px solid var(--color-gray-100);border-radius:12px;margin-bottom:8px';
      item.innerHTML = `
        <div class="conversation-avatar">${escapeHTML(other?.name?.charAt(0) || '?')}</div>
        <div class="conversation-info">
          <div class="conversation-name">${escapeHTML(other?.name || 'User')}</div>
          <div class="conversation-preview">${escapeHTML(prop?.title || 'Property')} — ${escapeHTML(c.lastMessage.message)}</div>
        </div>
        <div class="conversation-time">${new Date(c.lastMessage.timestamp).toLocaleDateString()}</div>
      `;
      item.addEventListener('click', () => navigate(`/messages?to=${c.otherUserId}&property=${c.propertyId}`));
      tabContent.appendChild(item);
    }
  }

  async function renderEditProfile() {
    const fresh = await getCurrentUser();
    tabContent.innerHTML = `
      <div class="edit-profile-form">
        <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:4px">Edit Your Profile</h3>
        <p style="font-size:13px;color:var(--color-gray-400);margin-bottom:12px">Update your details and housing preferences</p>

        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-input" id="ep-name" value="${fresh.name || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="tel" class="form-input" id="ep-phone" value="${fresh.phone || ''}" />
        </div>

        <div style="margin:4px 0;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.5px">Housing Preferences</div>

        <div class="form-group">
          <label class="form-label">Department</label>
          <input type="text" class="form-input" id="ep-department" value="${fresh.department || ''}" placeholder="e.g. Computer Science" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Budget Range (₦/yr)</label>
            <select class="form-select" id="ep-budget">
              <option value="">Select range</option>
              <option value="0-80000" ${fresh.budget === '0-80000' ? 'selected' : ''}>Under ₦80,000</option>
              <option value="80000-150000" ${fresh.budget === '80000-150000' ? 'selected' : ''}>₦80,000 – ₦150,000</option>
              <option value="150000-250000" ${fresh.budget === '150000-250000' ? 'selected' : ''}>₦150,000 – ₦250,000</option>
              <option value="250000+" ${fresh.budget === '250000+' ? 'selected' : ''}>₦250,000+</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Preferred Area</label>
            <select class="form-select" id="ep-area">
              <option value="">Any area</option>
              <option value="FUTA South Gate" ${fresh.preferredArea === 'FUTA South Gate' ? 'selected' : ''}>FUTA South Gate</option>
              <option value="FUTA North Gate" ${fresh.preferredArea === 'FUTA North Gate' ? 'selected' : ''}>FUTA North Gate</option>
              <option value="Roadblock" ${fresh.preferredArea === 'Roadblock' ? 'selected' : ''}>Roadblock</option>
              <option value="Ijapo Estate" ${fresh.preferredArea === 'Ijapo Estate' ? 'selected' : ''}>Ijapo Estate</option>
              <option value="Oba Ile" ${fresh.preferredArea === 'Oba Ile' ? 'selected' : ''}>Oba Ile</option>
              <option value="Aule" ${fresh.preferredArea === 'Aule' ? 'selected' : ''}>Aule</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Roommate Gender Preference</label>
          <select class="form-select" id="ep-gender-pref">
            <option value="">No preference</option>
            <option value="male" ${fresh.genderPreference === 'male' ? 'selected' : ''}>Male only</option>
            <option value="female" ${fresh.genderPreference === 'female' ? 'selected' : ''}>Female only</option>
          </select>
        </div>

        <div id="ep-msg" style="display:none;font-size:13px;color:var(--color-success);font-weight:600"></div>
        <button class="edit-profile-save" id="ep-save">Save Changes</button>
      </div>
    `;

    tabContent.querySelector('#ep-save').addEventListener('click', async () => {
      const updates = {
        name: tabContent.querySelector('#ep-name').value.trim() || fresh.name,
        phone: tabContent.querySelector('#ep-phone').value.trim() || fresh.phone,
        department: tabContent.querySelector('#ep-department').value.trim(),
        budget: tabContent.querySelector('#ep-budget').value,
        preferredArea: tabContent.querySelector('#ep-area').value,
        genderPreference: tabContent.querySelector('#ep-gender-pref').value,
        avatar: (tabContent.querySelector('#ep-name').value.trim() || fresh.name).charAt(0).toUpperCase()
      };
      await updateUser(fresh.id, updates);
      const msg = tabContent.querySelector('#ep-msg');
      msg.textContent = 'Profile updated successfully! ✅';
      msg.style.display = '';
      setTimeout(() => { msg.style.display = 'none'; }, 3000);
    });
  }

  async function renderWallet() {
    tabContent.innerHTML = '<div style="text-align:center;padding:32px;color:var(--color-gray-400)">Loading wallet...</div>';
    const freshWallet = await getWallet();
    const transactions = await getUserTransactions(user.id);

    tabContent.innerHTML = `
      <div class="wallet-dashboard">
        <div class="wallet-balance-card">
          <div class="wallet-balance-header">
            <div>
              <div style="font-size:12px;font-weight:600;color:var(--color-gray-400);text-transform:uppercase;letter-spacing:0.5px">Available Balance</div>
              <div style="font-size:32px;font-weight:800;color:var(--color-primary);margin-top:4px" id="dash-wallet-balance">₦${(freshWallet.balance || 0).toLocaleString()}</div>
            </div>
            <button class="hero-search-btn" id="dash-fund-btn" style="padding:10px 20px;font-size:14px">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"><path d="M8 3v10M3 8h10"/></svg>
              Fund Wallet
            </button>
          </div>
        </div>

        <div style="margin-top:24px">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:12px">Transaction History</h3>
          ${transactions.length === 0 ? '<div class="no-results"><h3>No transactions yet</h3><p>Fund your wallet to get started</p></div>' : `
            <div class="transaction-list">
              ${transactions.map(t => {
                const isCredit = ['deposit', 'escrow_release', 'refund'].includes(t.type);
                const sign = isCredit ? '+' : '-';
                const colorClass = isCredit ? 'credit' : 'debit';
                const amount = Math.abs(t.amount);
                const date = t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : t.createdAt?.seconds ? new Date(t.createdAt.seconds * 1000).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
                const typeLabels = { deposit: 'Deposit', payment: 'Payment', escrow_hold: 'Escrow Hold', escrow_release: 'Escrow Release', refund: 'Refund', withdraw: 'Withdrawal', fee: 'Fee' };
                return `
                  <div class="transaction-item">
                    <div class="transaction-icon ${colorClass}">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px">
                        ${isCredit ? '<path d="M12 19V5M5 12l7-7 7 7"/>' : '<path d="M12 5v14M19 12l-7 7-7-7"/>'}
                      </svg>
                    </div>
                    <div class="transaction-details">
                      <div class="transaction-type">${typeLabels[t.type] || t.type}</div>
                      <div class="transaction-date">${date}</div>
                    </div>
                    <div class="transaction-amount ${colorClass}">${sign}₦${amount.toLocaleString()}</div>
                    <div class="transaction-status">
                      <span class="status-badge ${t.status}">${t.status}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    // Update the stat card too
    const statBal = page.querySelector('#stat-wallet-balance');
    if (statBal) statBal.textContent = `₦${(freshWallet.balance || 0).toLocaleString()}`;

    tabContent.querySelector('#dash-fund-btn')?.addEventListener('click', () => navigate('/payments'));
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
      if (tab.dataset.tab === 'saved') renderSaved();
      else if (tab.dataset.tab === 'wallet') renderWallet();
      else if (tab.dataset.tab === 'inspections') renderInspections();
      else if (tab.dataset.tab === 'takeovers') renderTakeovers();
      else if (tab.dataset.tab === 'reports') renderReports();
      else if (tab.dataset.tab === 'profile') renderEditProfile();
      else renderMessages();
    });
  });

  page.querySelector('#tenant-wallet-stat')?.addEventListener('click', () => navigate('/payments'));
  page.querySelector('#post-takeover-btn').addEventListener('click', () => navigate('/post-takeover'));

  // ===========================
  // PROFILE COMPLETION LOGIC
  // ===========================
  const banner = page.querySelector('#profile-completion-banner');
  const modalOverlay = page.querySelector('#profile-modal-overlay');
  const modalBody = page.querySelector('#profile-modal-body');
  let pmCurrentStep = 1;
  let pmData = {
    department: user.department || '',
    budget: user.budget || '',
    preferredArea: user.preferredArea || '',
    genderPreference: user.genderPreference || ''
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
    if (pmCurrentStep === 1) renderPmPreferences();
    else renderPmVerification();
  }

  function renderPmPreferences() {
    modalBody.innerHTML = `
      <h3 class="pm-title">Tell us your preferences</h3>
      <p class="pm-subtitle">Help us find the perfect accommodation for you</p>
      <div class="pm-form">
        <div class="pm-field">
          <label>Department</label>
          <input type="text" id="pm-department" placeholder="e.g. Computer Science" value="${pmData.department}" />
        </div>
        <div class="pm-field-row">
          <div class="pm-field">
            <label>Budget Range (₦/yr)</label>
            <select id="pm-budget">
              <option value="">Select range</option>
              <option value="0-80000" ${pmData.budget === '0-80000' ? 'selected' : ''}>Under ₦80,000</option>
              <option value="80000-150000" ${pmData.budget === '80000-150000' ? 'selected' : ''}>₦80,000 – ₦150,000</option>
              <option value="150000-250000" ${pmData.budget === '150000-250000' ? 'selected' : ''}>₦150,000 – ₦250,000</option>
              <option value="250000+" ${pmData.budget === '250000+' ? 'selected' : ''}>₦250,000+</option>
            </select>
          </div>
          <div class="pm-field">
            <label>Preferred Area</label>
            <select id="pm-area">
              <option value="">Any area</option>
              <option value="FUTA South Gate" ${pmData.preferredArea === 'FUTA South Gate' ? 'selected' : ''}>FUTA South Gate</option>
              <option value="FUTA North Gate" ${pmData.preferredArea === 'FUTA North Gate' ? 'selected' : ''}>FUTA North Gate</option>
              <option value="Roadblock" ${pmData.preferredArea === 'Roadblock' ? 'selected' : ''}>Roadblock</option>
              <option value="Ijapo Estate" ${pmData.preferredArea === 'Ijapo Estate' ? 'selected' : ''}>Ijapo Estate</option>
              <option value="Oba Ile" ${pmData.preferredArea === 'Oba Ile' ? 'selected' : ''}>Oba Ile</option>
              <option value="Aule" ${pmData.preferredArea === 'Aule' ? 'selected' : ''}>Aule</option>
            </select>
          </div>
        </div>
        <div class="pm-field">
          <label>Roommate Gender Preference</label>
          <select id="pm-gender-pref">
            <option value="">No preference</option>
            <option value="male" ${pmData.genderPreference === 'male' ? 'selected' : ''}>Male only</option>
            <option value="female" ${pmData.genderPreference === 'female' ? 'selected' : ''}>Female only</option>
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
      pmData.department = modalBody.querySelector('#pm-department')?.value?.trim() || '';
      pmData.budget = modalBody.querySelector('#pm-budget')?.value || '';
      pmData.preferredArea = modalBody.querySelector('#pm-area')?.value || '';
      pmData.genderPreference = modalBody.querySelector('#pm-gender-pref')?.value || '';
      pmCurrentStep = 2;
      renderPmStep();
    });

    modalBody.querySelector('#pm-skip-1').addEventListener('click', async () => {
      await finishProfileCompletion();
    });
  }

  function renderPmVerification() {
    modalBody.innerHTML = `
      <h3 class="pm-title">Verify your student status</h3>
      <p class="pm-subtitle">Verified students get a trust badge and higher response rates</p>
      <div class="pm-form">
        <div class="pm-dropzone" id="pm-verify-dropzone">
          <div class="pm-dropzone-icon">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" width="44" height="44">
              <rect x="6" y="10" width="36" height="28" rx="3"/>
              <circle cx="18" cy="24" r="5"/>
              <path d="M28 18h8M28 24h8M28 30h6"/>
            </svg>
          </div>
          <strong>Upload Student ID Card</strong>
          <span>Click or drag to upload (JPG, PNG, PDF)</span>
          <input type="file" id="pm-verify-file" accept="image/*,.pdf" style="display:none" />
        </div>
        <div id="pm-verify-preview"></div>

        <div class="pm-benefits">
          <div class="pm-benefit">
            <svg viewBox="0 0 20 20" fill="none" stroke="#22C55E" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
            <span>Trust badge on your profile</span>
          </div>
          <div class="pm-benefit">
            <svg viewBox="0 0 20 20" fill="none" stroke="#22C55E" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
            <span>Higher response rates from landlords</span>
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
      department: pmData.department,
      budget: pmData.budget,
      preferredArea: pmData.preferredArea,
      genderPreference: pmData.genderPreference,
      profileCompleted: true
    };
    try {
      await updateUser(user.id, updates);
    } catch (e) { /* non-fatal */ }

    // Hide banner and modal
    if (banner) banner.style.display = 'none';
    if (modalOverlay) modalOverlay.style.display = 'none';

    // Show success feedback
    const { showToast } = await import('./header.js');
    showToast('Profile completed! 🎉', 'success');
  }

  renderSaved();
  return page;
}
