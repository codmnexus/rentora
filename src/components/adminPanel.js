import { getCurrentUser, getProperties, getPendingProperties, getUsers, approveProperty, rejectProperty, verifyLandlord, banUser, getAnalytics, getPendingTakeovers, approveTakeover, rejectTakeover, getPendingReports, resolveReport, dismissReport, getPropertyById, getTakeoverById } from '../utils/store.js';
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
    tabContent.innerHTML = items.length === 0 ? '<div class="no-results"><h3>No pending reports</h3><p>Users haven\'t reported any issues</p></div>' : '';
    if (items.length === 0) return;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch';
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
      <thead><tr><th>Reporter</th><th>Type</th><th>Reason</th><th>Details</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        ${items.map(r => `
          <tr>
            <td style="font-weight:600">${r.reporterName}</td>
            <td><span class="status-badge pending">${r.targetType}</span></td>
            <td>${r.reason}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${r.details || '—'}</td>
            <td>${new Date(r.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</td>
            <td>
              <button class="action-btn approve" data-resolve="${r.id}">Resolve</button>
              <button class="action-btn reject" data-dismiss="${r.id}">Dismiss</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;
    wrapper.appendChild(table);
    tabContent.appendChild(wrapper);
    table.querySelectorAll('[data-resolve]').forEach(b => b.addEventListener('click', async () => { await resolveReport(b.dataset.resolve, 'Action taken'); showToast('Report resolved ✅'); renderReports(); }));
    table.querySelectorAll('[data-dismiss]').forEach(b => b.addEventListener('click', async () => { await dismissReport(b.dataset.dismiss); showToast('Report dismissed'); renderReports(); }));
  }

  function renderUsers() {
    tabContent.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch';
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Actions</th></tr></thead><tbody>${allUsers.map(u => `<tr><td style="font-weight:600">${u.name}</td><td>${u.email}</td><td><span class="status-badge ${u.role === 'landlord' ? 'approved' : 'pending'}">${u.role}</span></td><td>${u.verified ? '✓' : '—'}</td><td>${u.role === 'landlord' && !u.verified ? `<button class="action-btn verify" data-verify="${u.id}">Verify</button>` : ''}${!u.banned ? `<button class="action-btn ban" data-ban="${u.id}">Ban</button>` : '<span style="color:var(--color-danger);font-size:12px">Banned</span>'}</td></tr>`).join('')}</tbody>`;
    wrapper.appendChild(table);
    tabContent.appendChild(wrapper);
    table.querySelectorAll('[data-verify]').forEach(b => b.addEventListener('click', async () => { await verifyLandlord(b.dataset.verify); showToast('Verified ✅'); renderUsers(); }));
    table.querySelectorAll('[data-ban]').forEach(b => b.addEventListener('click', async () => { if (confirm('Ban?')) { await banUser(b.dataset.ban); showToast('Banned', 'error'); renderUsers(); } }));
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
