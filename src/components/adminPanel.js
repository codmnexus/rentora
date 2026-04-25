import { getCurrentUser, getProperties, getPendingProperties, getUsers, approveProperty, rejectProperty, verifyLandlord, banUser, getAnalytics, getPendingTakeovers, approveTakeover, rejectTakeover, getPendingReports, resolveReport, dismissReport, getPropertyById, getTakeoverById, deleteProperty, getUserById, updateUser } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';

export async function createAdminPanel() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') { navigate('/login'); return document.createElement('div'); }

  const analytics = await getAnalytics();
  const pending = await getPendingProperties();
  const pendingTakeovers = await getPendingTakeovers();
  const pendingReports = await getPendingReports();
  const allUsers = (await getUsers()).filter(u => u.role !== 'admin');
  const formatPrice = (p) => '₦' + p.toLocaleString();

  const page = document.createElement('div');
  page.className = 'dashboard';

  // Generate trend mock data (random for now, in production these would be derived from actuals)
  const trends = {
    listings: { pct: 12, dir: 'up' },
    pending: { pct: 3, dir: 'down' },
    reports: { pct: 8, dir: 'up' },
    users: { pct: 15, dir: 'up' }
  };

  page.innerHTML = `
    <div class="dashboard-header">
      <h1 class="dashboard-greeting">Admin <span>Panel</span> ⚡</h1>
      <p class="dashboard-subtitle">Manage listings, takeovers, reports, and platform analytics</p>
    </div>

    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-card-icon green"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.17 7.83L10 1l6.83 6.83V17a2 2 0 01-2 2H5.17a2 2 0 01-2-2V7.83z"/></svg></div>
        <div class="stat-card-value">${analytics.totalListings}<span class="trend-indicator ${trends.listings.dir}">↑${trends.listings.pct}%</span></div>
        <div class="stat-card-label">Listings</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon amber"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2"/></svg></div>
        <div class="stat-card-value">${analytics.pendingListings + analytics.pendingTakeovers}<span class="trend-indicator ${trends.pending.dir}">↓${trends.pending.pct}%</span></div>
        <div class="stat-card-label">Pending</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon red"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg></div>
        <div class="stat-card-value">${analytics.pendingReports}<span class="trend-indicator ${trends.reports.dir}">↑${trends.reports.pct}%</span></div>
        <div class="stat-card-label">Reports</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon blue"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="4"/><circle cx="15" cy="7" r="4"/><path d="M0 18c0-3 2-6 7-6s7 3 7 6"/></svg></div>
        <div class="stat-card-value">${analytics.totalUsers}<span class="trend-indicator ${trends.users.dir}">↑${trends.users.pct}%</span></div>
        <div class="stat-card-label">Users</div>
      </div>
    </div>

    <div class="dashboard-tabs">
      <div class="dashboard-tab active" data-tab="pending">Listings (${pending.length})</div>
      <div class="dashboard-tab" data-tab="takeovers">Takeovers (${pendingTakeovers.length})</div>
      <div class="dashboard-tab" data-tab="reports">Reports (${pendingReports.length})</div>
      <div class="dashboard-tab" data-tab="users">Users</div>
      <div class="dashboard-tab" data-tab="analytics">Analytics</div>
    </div>

    <div id="tab-content"></div>
  `;

  const tabContent = page.querySelector('#tab-content');
  const tabs = page.querySelectorAll('.dashboard-tab');

  async function renderPending() {
    const items = await getPendingProperties();
    tabContent.innerHTML = items.length === 0 ? '<div class="no-results"><h3>No pending listings</h3></div>' : '';
    if (items.length === 0) return;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch';
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `<thead><tr><th>Title</th><th>Landlord</th><th>Area</th><th>Price</th><th>Actions</th></tr></thead><tbody>${items.map(p => `<tr><td style="font-weight:600">${p.title}</td><td>${p.landlordName || 'N/A'}</td><td>${p.area}</td><td>${formatPrice(p.price)}</td><td><button class="action-btn approve" data-approve="${p.id}">Approve</button><button class="action-btn reject" data-reject="${p.id}">Reject</button></td></tr>`).join('')}</tbody>`;
    wrapper.appendChild(table);
    tabContent.appendChild(wrapper);
    table.querySelectorAll('[data-approve]').forEach(b => b.addEventListener('click', async () => { await approveProperty(b.dataset.approve); showToast('Approved ✅'); renderPending(); }));
    table.querySelectorAll('[data-reject]').forEach(b => b.addEventListener('click', async () => { await rejectProperty(b.dataset.reject); showToast('Rejected', 'error'); renderPending(); }));
  }

  async function renderTakeovers() {
    const items = await getPendingTakeovers();
    tabContent.innerHTML = items.length === 0 ? '<div class="no-results"><h3>No pending takeovers</h3></div>' : '';
    if (items.length === 0) return;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch';
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `<thead><tr><th>Title</th><th>Student</th><th>Area</th><th>Rent</th><th>Actions</th></tr></thead><tbody>${items.map(t => `<tr><td style="font-weight:600">${t.title}</td><td>${t.studentName || 'N/A'}</td><td>${t.area}</td><td>${formatPrice(t.rent)}</td><td><button class="action-btn approve" data-tapprove="${t.id}">Approve</button><button class="action-btn reject" data-treject="${t.id}">Reject</button></td></tr>`).join('')}</tbody>`;
    wrapper.appendChild(table);
    tabContent.appendChild(wrapper);
    table.querySelectorAll('[data-tapprove]').forEach(b => b.addEventListener('click', async () => { await approveTakeover(b.dataset.tapprove); showToast('Approved ✅'); renderTakeovers(); }));
    table.querySelectorAll('[data-treject]').forEach(b => b.addEventListener('click', async () => { await rejectTakeover(b.dataset.treject); showToast('Rejected', 'error'); renderTakeovers(); }));
  }

  async function renderReports() {
    const items = await getPendingReports();
    if (items.length === 0) {
      tabContent.innerHTML = '<div class="no-results"><h3>No pending reports</h3><p>Users haven\'t reported any issues</p></div>';
      return;
    }

    // Enrich reports with target data
    const enriched = await Promise.all(items.map(async (r) => {
      let target = null;
      let targetOwner = null;
      if (r.targetType === 'property') {
        target = await getPropertyById(r.targetId);
        if (target?.landlordId) targetOwner = await getUserById(target.landlordId);
      } else if (r.targetType === 'takeover') {
        target = await getTakeoverById(r.targetId);
        if (target?.studentId) targetOwner = await getUserById(target.studentId);
      }
      return { ...r, target, targetOwner };
    }));

    tabContent.innerHTML = `
      <div class="admin-reports-list">
        ${enriched.map((r, i) => `
          <div class="admin-report-card" data-report-idx="${i}">
            <div class="admin-report-header">
              <div class="admin-report-meta">
                <span class="admin-report-type-badge ${r.targetType}">${r.targetType === 'property' ? '🏠 Listing' : '🔄 Takeover'}</span>
                <span class="admin-report-reason-badge">${formatReasonLabel(r.reason)}</span>
                <span class="admin-report-date">${new Date(r.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <button class="admin-report-expand" data-expand="${i}" title="Expand">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M6 8l4 4 4-4"/></svg>
              </button>
            </div>

            <div class="admin-report-summary">
              <div class="admin-report-reporter">
                <div class="admin-report-avatar">${r.reporterName?.charAt(0) || '?'}</div>
                <div>
                  <strong>${r.reporterName}</strong> reported ${r.targetType === 'property' ? 'a listing' : 'a takeover'}
                  <div class="admin-report-preview">${r.details || 'No additional details provided'}</div>
                </div>
              </div>
            </div>

            <div class="admin-report-detail" id="report-detail-${i}" style="display:none">
              ${r.target ? `
                <div class="admin-report-target-card">
                  <div class="admin-report-target-header">
                    <div class="admin-report-target-icon">${r.targetType === 'property' ? '🏠' : '🔄'}</div>
                    <div class="admin-report-target-info">
                      <strong>${r.target.title || 'Untitled'}</strong>
                      <span>${r.target.area || ''} ${r.target.price ? ' · ₦' + r.target.price.toLocaleString() : ''}</span>
                    </div>
                    <span class="status-badge ${r.target.status === 'approved' ? 'approved' : r.target.status === 'rejected' ? 'rejected' : 'pending'}">${r.target.status || 'unknown'}</span>
                  </div>
                  ${r.targetOwner ? `
                    <div class="admin-report-owner">
                      <span>Posted by:</span>
                      <strong>${r.targetOwner.name}</strong>
                      <span class="admin-report-owner-email">${r.targetOwner.email}</span>
                      ${r.targetOwner.banned ? '<span class="status-badge rejected">BANNED</span>' : ''}
                    </div>
                  ` : ''}
                </div>
              ` : '<div class="admin-report-target-missing">⚠️ Reported content no longer exists or could not be loaded</div>'}

              <div class="admin-report-actions-grid">
                ${r.target && r.target.status !== 'rejected' ? `
                  <button class="admin-action-btn danger" data-action="takedown" data-report-id="${r.id}" data-target-id="${r.targetId}" data-target-type="${r.targetType}">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    <span>Take Down</span>
                    <small>Remove listing from platform</small>
                  </button>
                ` : ''}
                ${r.targetOwner && !r.targetOwner.banned ? `
                  <button class="admin-action-btn danger-outline" data-action="ban-owner" data-report-id="${r.id}" data-owner-id="${r.targetOwner.id}" data-owner-name="${r.targetOwner.name}">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M4.93 4.93l10.14 10.14"/></svg>
                    <span>Ban User</span>
                    <small>Ban ${r.targetOwner.name}</small>
                  </button>
                ` : ''}
                ${r.targetOwner && !r.targetOwner.banned ? `
                  <button class="admin-action-btn warning" data-action="warn-owner" data-report-id="${r.id}" data-owner-id="${r.targetOwner.id}" data-owner-name="${r.targetOwner.name}">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M10 2L1 18h18L10 2zM10 8v4M10 14h.01"/></svg>
                    <span>Warn User</span>
                    <small>Send a warning</small>
                  </button>
                ` : ''}
                ${r.target ? `
                  <button class="admin-action-btn neutral" data-action="view-target" data-target-id="${r.targetId}" data-target-type="${r.targetType}">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="3"/><path d="M1 10s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z"/></svg>
                    <span>View Content</span>
                    <small>Open reported item</small>
                  </button>
                ` : ''}
              </div>

              <div class="admin-report-resolution">
                <div class="admin-report-resolution-label">Resolution</div>
                <div class="admin-report-resolution-actions">
                  <button class="action-btn approve" data-action="resolve" data-report-id="${r.id}">✅ Mark Resolved</button>
                  <button class="action-btn reject" data-action="dismiss" data-report-id="${r.id}">Dismiss Report</button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    function formatReasonLabel(reason) {
      const labels = { fake: 'Fake / Misleading', scam: 'Suspected Scam', inappropriate: 'Inappropriate', duplicate: 'Duplicate', unavailable: 'Unavailable', other: 'Other' };
      return labels[reason] || reason;
    }

    // Expand/collapse
    tabContent.querySelectorAll('[data-expand]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.dataset.expand;
        const detail = tabContent.querySelector(`#report-detail-${idx}`);
        const card = btn.closest('.admin-report-card');
        const isOpen = detail.style.display !== 'none';
        detail.style.display = isOpen ? 'none' : '';
        card.classList.toggle('expanded', !isOpen);
        btn.style.transform = isOpen ? '' : 'rotate(180deg)';
      });
    });

    // Action handlers
    tabContent.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.action;
        const reportId = btn.dataset.reportId;

        if (action === 'takedown') {
          const targetId = btn.dataset.targetId;
          const targetType = btn.dataset.targetType;
          if (!confirm(`Are you sure you want to take down this ${targetType}? This will remove it from all public listings.`)) return;
          btn.disabled = true;
          btn.querySelector('span').textContent = 'Taking down...';
          if (targetType === 'property') {
            await rejectProperty(targetId);
          } else {
            await rejectTakeover(targetId);
          }
          await resolveReport(reportId, `${targetType} taken down by admin`);
          showToast('Content taken down ✅', 'success');
          renderReports();
        }

        else if (action === 'ban-owner') {
          const ownerId = btn.dataset.ownerId;
          const ownerName = btn.dataset.ownerName;
          if (!confirm(`Ban ${ownerName}? They will no longer be able to access Rentora.`)) return;
          btn.disabled = true;
          btn.querySelector('span').textContent = 'Banning...';
          await banUser(ownerId);
          await resolveReport(reportId, `User ${ownerName} banned by admin`);
          showToast(`${ownerName} has been banned`, 'error');
          renderReports();
        }

        else if (action === 'warn-owner') {
          const ownerId = btn.dataset.ownerId;
          const ownerName = btn.dataset.ownerName;
          const warningMsg = prompt(`Warning message for ${ownerName}:`, 'Your listing has been flagged by users for violating our community guidelines. Further violations may result in your account being suspended.');
          if (!warningMsg) return;
          btn.disabled = true;
          btn.querySelector('span').textContent = 'Sending...';
          await updateUser(ownerId, {
            warnings: [...(enriched.find(r => r.targetOwner?.id === ownerId)?.targetOwner?.warnings || []), {
              message: warningMsg,
              date: new Date().toISOString(),
              reportId
            }]
          });
          await resolveReport(reportId, `Warning sent to ${ownerName}`);
          showToast(`Warning sent to ${ownerName}`, 'success');
          renderReports();
        }

        else if (action === 'view-target') {
          const targetId = btn.dataset.targetId;
          const targetType = btn.dataset.targetType;
          if (targetType === 'property') navigate(`/property/${targetId}`);
          else navigate(`/takeover/${targetId}`);
        }

        else if (action === 'resolve') {
          if (!confirm('Mark this report as resolved?')) return;
          await resolveReport(reportId, 'Resolved by admin');
          showToast('Report resolved ✅', 'success');
          renderReports();
        }

        else if (action === 'dismiss') {
          if (!confirm('Dismiss this report? No action will be taken.')) return;
          await dismissReport(reportId);
          showToast('Report dismissed');
          renderReports();
        }
      });
    });
  }

  async function renderUsers() {
    const freshUsers = (await getUsers()).filter(u => u.role !== 'admin');
    tabContent.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch';
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Warnings</th><th>Status</th><th>Actions</th></tr></thead><tbody>${freshUsers.map(u => `<tr${u.banned ? ' class="admin-row-banned"' : ''}>
      <td style="font-weight:600">${u.name}</td>
      <td>${u.email}</td>
      <td><span class="status-badge ${u.role === 'landlord' ? 'approved' : 'pending'}">${u.role}</span></td>
      <td>${u.verified ? '<span style="color:var(--color-success)">✓ Verified</span>' : '—'}</td>
      <td>${u.warnings?.length ? `<span class="admin-warning-count">${u.warnings.length}</span>` : '—'}</td>
      <td>${u.banned ? '<span class="status-badge rejected">Banned</span>' : '<span class="status-badge approved">Active</span>'}</td>
      <td class="admin-user-actions">
        ${u.role === 'landlord' && !u.verified ? `<button class="action-btn verify" data-verify="${u.id}">Verify</button>` : ''}
        ${!u.banned ? `<button class="action-btn ban" data-ban="${u.id}" data-name="${u.name}">Ban</button>` : `<button class="action-btn approve" data-unban="${u.id}" data-name="${u.name}">Unban</button>`}
      </td>
    </tr>`).join('')}</tbody>`;
    wrapper.appendChild(table);
    tabContent.appendChild(wrapper);
    table.querySelectorAll('[data-verify]').forEach(b => b.addEventListener('click', async () => { await verifyLandlord(b.dataset.verify); showToast('Verified ✅'); renderUsers(); }));
    table.querySelectorAll('[data-ban]').forEach(b => b.addEventListener('click', async () => { if (confirm(`Ban ${b.dataset.name}? They will lose access to Rentora.`)) { await banUser(b.dataset.ban); showToast(`${b.dataset.name} banned`, 'error'); renderUsers(); } }));
    table.querySelectorAll('[data-unban]').forEach(b => b.addEventListener('click', async () => { if (confirm(`Unban ${b.dataset.name}?`)) { await updateUser(b.dataset.unban, { banned: false }); showToast(`${b.dataset.name} unbanned ✅`); renderUsers(); } }));
  }

  function renderAnalytics() {
    // Data preparation
    const maxArea = analytics.topAreas.length > 0 ? Math.max(...analytics.topAreas.map(a => a[1])) : 1;
    const barColors = [
      'linear-gradient(135deg, #3B5FD4, #5A7CE8)',
      'linear-gradient(135deg, #22C55E, #4ADE80)',
      'linear-gradient(135deg, #F59E0B, #FBBF24)',
      'linear-gradient(135deg, #EF4444, #F87171)',
      'linear-gradient(135deg, #8B5CF6, #A78BFA)'
    ];

    // Donut chart data
    const tenants = analytics.tenants || 0;
    const landlords = analytics.landlords || 0;
    const totalUsers = tenants + landlords || 1;
    const tenantPct = (tenants / totalUsers) * 100;
    const landlordPct = (landlords / totalUsers) * 100;

    // SVG donut calculations (circumference = 2πr = 2 * π * 50 ≈ 314.16)
    const circumference = 314.16;
    const tenantDash = (tenantPct / 100) * circumference;
    const landlordDash = (landlordPct / 100) * circumference;

    // Listing status
    const approved = analytics.approvedListings || 0;
    const pendingCount = analytics.pendingListings || 0;
    const rejected = analytics.totalListings - approved - pendingCount;

    tabContent.innerHTML = `
      <div class="analytics-grid">

        <!-- User Breakdown Donut -->
        <div class="analytics-card">
          <div class="analytics-card-title">User Breakdown</div>
          <div class="donut-chart-wrapper">
            <svg class="donut-chart" viewBox="0 0 120 120">
              <!-- Background circle -->
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F1F5F9" stroke-width="14"/>
              <!-- Tenant segment -->
              <circle cx="60" cy="60" r="50" fill="none" stroke="#3B5FD4" stroke-width="14"
                stroke-dasharray="0 ${circumference}"
                stroke-dashoffset="0"
                transform="rotate(-90 60 60)"
                class="donut-segment-tenant"/>
              <!-- Landlord segment -->
              <circle cx="60" cy="60" r="50" fill="none" stroke="#22C55E" stroke-width="14"
                stroke-dasharray="0 ${circumference}"
                stroke-dashoffset="${-tenantDash}"
                transform="rotate(-90 60 60)"
                class="donut-segment-landlord"/>
              <!-- Center text -->
              <text x="60" y="56" text-anchor="middle" font-size="20" font-weight="800" fill="#1E293B">${totalUsers}</text>
              <text x="60" y="72" text-anchor="middle" font-size="9" fill="#94A3B8" font-weight="600">TOTAL</text>
            </svg>
            <div class="donut-legend">
              <div class="donut-legend-item">
                <div class="donut-legend-dot" style="background:#3B5FD4"></div>
                Tenants<span class="donut-legend-value">${tenants}</span>
              </div>
              <div class="donut-legend-item">
                <div class="donut-legend-dot" style="background:#22C55E"></div>
                Landlords<span class="donut-legend-value">${landlords}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Listing Status -->
        <div class="analytics-card">
          <div class="analytics-card-title">Listing Status</div>
          <div style="display:flex;flex-direction:column;gap:20px">
            <div style="display:flex;align-items:baseline;gap:8px">
              <span style="font-size:2.5rem;font-weight:800;color:var(--color-gray-800)">${analytics.totalListings}</span>
              <span style="font-size:var(--font-size-sm);color:var(--color-gray-400)">total listings</span>
            </div>
            <div class="status-pills">
              <div class="status-pill green">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                ${approved} Approved
              </div>
              <div class="status-pill amber">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 1.5"/></svg>
                ${pendingCount} Pending
              </div>
              <div class="status-pill red">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                ${rejected >= 0 ? rejected : 0} Rejected
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px">
              <div class="booking-detail"><span>Room Takeovers</span><span class="booking-detail-value">${analytics.totalTakeovers}</span></div>
              <div class="booking-detail"><span>Total Reviews</span><span class="booking-detail-value">${analytics.totalReviews}</span></div>
              <div class="booking-detail"><span>Inspections</span><span class="booking-detail-value">${analytics.totalInspections}</span></div>
              <div class="booking-detail"><span>Total Views</span><span class="booking-detail-value">${analytics.totalViews.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        <!-- Popular Areas Bar Chart -->
        <div class="analytics-card analytics-card-full">
          <div class="analytics-card-title">Popular Areas</div>
          <div id="bar-chart-container">
            ${analytics.topAreas.map(([area, count], i) => `
              <div class="chart-bar-row">
                <div class="chart-bar-label">${area}</div>
                <div class="chart-bar-track">
                  <div class="chart-bar-fill" style="width:0%;background:${barColors[i % barColors.length]}" data-target-width="${Math.max((count / maxArea) * 100, 8)}">
                    <span class="chart-bar-value">${count}</span>
                  </div>
                </div>
              </div>
            `).join('')}
            ${analytics.topAreas.length === 0 ? '<div class="no-results"><p>No listing data yet</p></div>' : ''}
          </div>
        </div>

        <!-- Recent Activity Feed -->
        <div class="analytics-card analytics-card-full">
          <div class="analytics-card-title">Platform Overview</div>
          <div class="activity-feed">
            <div class="activity-item">
              <div class="activity-icon listing">🏠</div>
              <div>
                <div class="activity-text"><strong>${analytics.approvedListings}</strong> approved listings currently active</div>
                <div class="activity-time">${analytics.pendingListings} pending review</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon user">👥</div>
              <div>
                <div class="activity-text"><strong>${analytics.totalUsers}</strong> registered users on the platform</div>
                <div class="activity-time">${analytics.tenants} tenants · ${analytics.landlords} landlords</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon review">⭐</div>
              <div>
                <div class="activity-text"><strong>${analytics.totalReviews}</strong> reviews submitted by students</div>
                <div class="activity-time">${analytics.totalInspections} inspections completed</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon report">🚩</div>
              <div>
                <div class="activity-text"><strong>${analytics.totalReports}</strong> reports filed</div>
                <div class="activity-time">${analytics.pendingReports} needing attention</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    // Animate bar chart fills
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        tabContent.querySelectorAll('.chart-bar-fill[data-target-width]').forEach(bar => {
          bar.style.width = bar.dataset.targetWidth + '%';
        });
        // Animate donut segments
        const tenantSeg = tabContent.querySelector('.donut-segment-tenant');
        const landlordSeg = tabContent.querySelector('.donut-segment-landlord');
        if (tenantSeg) tenantSeg.setAttribute('stroke-dasharray', `${tenantDash} ${circumference}`);
        if (landlordSeg) landlordSeg.setAttribute('stroke-dasharray', `${landlordDash} ${circumference}`);
      });
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.tab === 'pending') renderPending();
      else if (tab.dataset.tab === 'takeovers') renderTakeovers();
      else if (tab.dataset.tab === 'reports') renderReports();
      else if (tab.dataset.tab === 'users') renderUsers();
      else renderAnalytics();
    });
  });

  renderPending();
  return page;
}
