import { getCurrentUser, getProperties, getPendingProperties, getUsers, approveProperty, rejectProperty, verifyLandlord, banUser, getAnalytics, getPendingTakeovers, approveTakeover, rejectTakeover, getReports, resolveReport, dismissReport, getPropertyById, getTakeoverById, deleteProperty, getUserById, updateUser, getTakeovers, updateProperty, updateTakeover, deleteTakeover } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import { escapeHTML } from '../utils/authSecurity.js';

export async function createAdminPanel() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') { navigate('/login'); return document.createElement('div'); }

  const analytics = await getAnalytics();
  const pending = await getPendingProperties();
  const pendingTakeovers = await getPendingTakeovers();
  const allReports = await getReports();
  const pendingReports = allReports.filter(r => r.status === 'pending');
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
      <div class="dashboard-tab active" data-tab="listings">All Listings (${analytics.totalListings})</div>
      <div class="dashboard-tab" data-tab="takeovers">Takeovers</div>
      <div class="dashboard-tab" data-tab="reports">Reports (${allReports.length})</div>
      <div class="dashboard-tab" data-tab="users">Users</div>
      <div class="dashboard-tab" data-tab="analytics">Analytics</div>
    </div>

    <div id="tab-content"></div>
  `;

  const tabContent = page.querySelector('#tab-content');
  const tabs = page.querySelectorAll('.dashboard-tab');

  let listingsFilter = 'all';
  let listingsSearch = '';
  let takeoverFilter = 'all';

  async function renderListings() {
    const allProps = await getProperties();
    let filtered = [...allProps];

    // Apply filters
    if (listingsFilter !== 'all') {
      if (listingsFilter === 'rented') filtered = filtered.filter(p => p.rented);
      else filtered = filtered.filter(p => p.status === listingsFilter && !p.rented);
    }
    if (listingsSearch) {
      const q = listingsSearch.toLowerCase();
      filtered = filtered.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.area || '').toLowerCase().includes(q) ||
        (p.landlordName || '').toLowerCase().includes(q)
      );
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Count by status
    const counts = { all: allProps.length, pending: 0, approved: 0, rejected: 0, rented: 0 };
    allProps.forEach(p => {
      if (p.rented) counts.rented++;
      else if (p.status === 'pending') counts.pending++;
      else if (p.status === 'approved') counts.approved++;
      else if (p.status === 'rejected') counts.rejected++;
    });

    tabContent.innerHTML = `
      <div class="admin-listing-controls">
        <div class="admin-filter-pills">
          <button class="admin-filter-pill ${listingsFilter === 'all' ? 'active' : ''}" data-filter="all">All (${counts.all})</button>
          <button class="admin-filter-pill ${listingsFilter === 'pending' ? 'active' : ''}" data-filter="pending">Pending (${counts.pending})</button>
          <button class="admin-filter-pill ${listingsFilter === 'approved' ? 'active' : ''}" data-filter="approved">Approved (${counts.approved})</button>
          <button class="admin-filter-pill ${listingsFilter === 'rejected' ? 'active' : ''}" data-filter="rejected">Rejected (${counts.rejected})</button>
          <button class="admin-filter-pill ${listingsFilter === 'rented' ? 'active' : ''}" data-filter="rented">Rented (${counts.rented})</button>
        </div>
        <div class="admin-search-box">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="9" cy="9" r="6"/><path d="M14 14l4 4"/></svg>
          <input type="text" placeholder="Search listings..." value="${listingsSearch}" id="admin-listing-search" />
        </div>
      </div>

      ${filtered.length === 0 ? '<div class="no-results"><h3>No listings found</h3><p>Try adjusting your filters</p></div>' : ''}

      <div class="admin-listings-grid">
        ${filtered.map((p, i) => {
          const statusClass = p.rented ? 'rented' : p.status;
          const statusLabel = p.rented ? 'Rented' : p.status;
          const thumb = p.images?.[0] || '';
          return `
          <div class="admin-listing-card" data-listing-idx="${i}">
            <div class="admin-listing-card-top">
              <div class="admin-listing-thumb" ${thumb ? `style="background-image:url('${thumb}')"` : ''}>
                ${!thumb ? '<span>🏠</span>' : ''}
              </div>
              <div class="admin-listing-card-body">
                <div class="admin-listing-title-row">
                  <h4>${escapeHTML(p.title || 'Untitled')}</h4>
                  <span class="admin-status-pill ${statusClass}">${statusLabel}</span>
                </div>
                <div class="admin-listing-meta-row">
                  <span>📍 ${escapeHTML(p.area || 'N/A')}</span>
                  <span>💰 ₦${(p.price || 0).toLocaleString()}</span>
                  <span>👁 ${p.views || 0} views</span>
                </div>
                <div class="admin-listing-meta-row secondary">
                  <span>👤 ${escapeHTML(p.landlordName || 'Unknown')}</span>
                  <span>📅 ${new Date(p.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>${p.type || ''} ${p.furnished ? '· Furnished' : ''}</span>
                </div>
              </div>
              <button class="admin-listing-expand" data-expand-listing="${i}" title="Details">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M6 8l4 4 4-4"/></svg>
              </button>
            </div>

            <div class="admin-listing-detail" id="listing-detail-${i}" style="display:none">
              <div class="admin-listing-detail-inner">
                ${p.description ? `<div class="admin-listing-desc"><strong>Description:</strong> ${escapeHTML(p.description)}</div>` : ''}
                ${p.amenities?.length ? `<div class="admin-listing-amenities"><strong>Amenities:</strong> ${p.amenities.map(a => `<span class="admin-amenity-tag">${escapeHTML(a)}</span>`).join('')}</div>` : ''}
                ${p.images?.length > 1 ? `
                  <div class="admin-listing-images">
                    ${p.images.slice(0, 5).map(img => `<img src="${img}" alt="listing" class="admin-listing-img" />`).join('')}
                  </div>
                ` : ''}
                <div class="admin-listing-detail-stats">
                  <div><strong>Type:</strong> ${p.type || 'N/A'}</div>
                  <div><strong>Furnished:</strong> ${p.furnished ? 'Yes' : 'No'}</div>
                  <div><strong>Distance:</strong> ${p.distanceFromCampus ? p.distanceFromCampus + ' km' : 'N/A'}</div>
                  <div><strong>Status:</strong> ${statusLabel}</div>
                </div>
              </div>
              <div class="admin-listing-detail-actions">
                ${p.status === 'pending' ? `<button class="action-btn approve" data-action-listing="approve" data-id="${p.id}">✅ Approve</button>` : ''}
                ${p.status === 'pending' ? `<button class="action-btn reject" data-action-listing="reject" data-id="${p.id}">❌ Reject</button>` : ''}
                ${p.status === 'approved' && !p.rented ? `<button class="action-btn reject" data-action-listing="reject" data-id="${p.id}">⛔ Take Down</button>` : ''}
                ${p.status === 'rejected' ? `<button class="action-btn approve" data-action-listing="approve" data-id="${p.id}">♻️ Reinstate</button>` : ''}
                <button class="action-btn ban" data-action-listing="delete" data-id="${p.id}">🗑 Delete</button>
                <button class="admin-action-btn neutral" data-action-listing="view" data-id="${p.id}" style="padding:8px 16px">
                  <span>View Page →</span>
                </button>
              </div>
            </div>
          </div>
        `}).join('')}
      </div>
    `;

    // Filter pills
    tabContent.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => { listingsFilter = btn.dataset.filter; renderListings(); });
    });

    // Search
    const searchInput = tabContent.querySelector('#admin-listing-search');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => { listingsSearch = searchInput.value; renderListings(); }, 300);
      });
    }

    // Expand/collapse
    tabContent.querySelectorAll('[data-expand-listing]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.dataset.expandListing;
        const detail = tabContent.querySelector(`#listing-detail-${idx}`);
        const card = btn.closest('.admin-listing-card');
        const isOpen = detail.style.display !== 'none';
        detail.style.display = isOpen ? 'none' : '';
        card.classList.toggle('expanded', !isOpen);
        btn.style.transform = isOpen ? '' : 'rotate(180deg)';
      });
    });

    // Actions
    tabContent.querySelectorAll('[data-action-listing]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.actionListing;
        const id = btn.dataset.id;
        if (action === 'approve') {
          await approveProperty(id);
          showToast('Listing approved ✅');
          renderListings();
        } else if (action === 'reject') {
          if (!confirm('Reject/take down this listing?')) return;
          await rejectProperty(id);
          showToast('Listing rejected');
          renderListings();
        } else if (action === 'delete') {
          if (!confirm('Permanently delete this listing? This cannot be undone.')) return;
          await deleteProperty(id);
          showToast('Listing deleted', 'error');
          renderListings();
        } else if (action === 'view') {
          navigate(`/property/${id}`);
        }
      });
    });
  }

  async function renderTakeovers() {
    const allTakeovers = await getTakeovers();
    let filtered = [...allTakeovers];

    if (takeoverFilter !== 'all') {
      filtered = filtered.filter(t => t.status === takeoverFilter);
    }
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const counts = { all: allTakeovers.length, pending: 0, approved: 0, rejected: 0 };
    allTakeovers.forEach(t => {
      if (t.status === 'pending') counts.pending++;
      else if (t.status === 'approved') counts.approved++;
      else if (t.status === 'rejected') counts.rejected++;
    });

    tabContent.innerHTML = `
      <div class="admin-listing-controls">
        <div class="admin-filter-pills">
          <button class="admin-filter-pill ${takeoverFilter === 'all' ? 'active' : ''}" data-tfilter="all">All (${counts.all})</button>
          <button class="admin-filter-pill ${takeoverFilter === 'pending' ? 'active' : ''}" data-tfilter="pending">Pending (${counts.pending})</button>
          <button class="admin-filter-pill ${takeoverFilter === 'approved' ? 'active' : ''}" data-tfilter="approved">Approved (${counts.approved})</button>
          <button class="admin-filter-pill ${takeoverFilter === 'rejected' ? 'active' : ''}" data-tfilter="rejected">Rejected (${counts.rejected})</button>
        </div>
      </div>

      ${filtered.length === 0 ? '<div class="no-results"><h3>No takeovers found</h3><p>Try adjusting your filters</p></div>' : ''}

      <div class="admin-listings-grid">
        ${filtered.map((t, i) => {
          const thumb = t.images?.[0] || '';
          return `
          <div class="admin-listing-card" data-takeover-idx="${i}">
            <div class="admin-listing-card-top">
              <div class="admin-listing-thumb takeover" ${thumb ? `style="background-image:url('${thumb}')"` : ''}>
                ${!thumb ? '<span>🔄</span>' : ''}
              </div>
              <div class="admin-listing-card-body">
                <div class="admin-listing-title-row">
                  <h4>${escapeHTML(t.title || 'Untitled Takeover')}</h4>
                  <span class="admin-status-pill ${t.status}">${t.status}</span>
                </div>
                <div class="admin-listing-meta-row">
                  <span>📍 ${escapeHTML(t.area || 'N/A')}</span>
                  <span>💰 ₦${(t.rent || 0).toLocaleString()}/mo</span>
                  <span>📆 ${t.leaseRemaining || '?'} months left</span>
                </div>
                <div class="admin-listing-meta-row secondary">
                  <span>👤 ${escapeHTML(t.studentName || 'Unknown')}</span>
                  <span>📅 ${new Date(t.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <button class="admin-listing-expand" data-expand-takeover="${i}" title="Details">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M6 8l4 4 4-4"/></svg>
              </button>
            </div>

            <div class="admin-listing-detail" id="takeover-detail-${i}" style="display:none">
              <div class="admin-listing-detail-inner">
                ${t.description ? `<div class="admin-listing-desc"><strong>Description:</strong> ${escapeHTML(t.description)}</div>` : ''}
                ${t.reason ? `<div class="admin-listing-desc"><strong>Reason for leaving:</strong> ${escapeHTML(t.reason)}</div>` : ''}
                ${t.images?.length ? `
                  <div class="admin-listing-images">
                    ${t.images.slice(0, 5).map(img => `<img src="${img}" alt="takeover" class="admin-listing-img" />`).join('')}
                  </div>
                ` : ''}
              </div>
              <div class="admin-listing-detail-actions">
                ${t.status === 'pending' ? `<button class="action-btn approve" data-action-takeover="approve" data-id="${t.id}">✅ Approve</button>` : ''}
                ${t.status === 'pending' ? `<button class="action-btn reject" data-action-takeover="reject" data-id="${t.id}">❌ Reject</button>` : ''}
                ${t.status === 'approved' ? `<button class="action-btn reject" data-action-takeover="reject" data-id="${t.id}">⛔ Take Down</button>` : ''}
                ${t.status === 'rejected' ? `<button class="action-btn approve" data-action-takeover="approve" data-id="${t.id}">♻️ Reinstate</button>` : ''}
                <button class="action-btn ban" data-action-takeover="delete" data-id="${t.id}">🗑 Delete</button>
                <button class="admin-action-btn neutral" data-action-takeover="view" data-id="${t.id}" style="padding:8px 16px">
                  <span>View Page →</span>
                </button>
              </div>
            </div>
          </div>
        `}).join('')}
      </div>
    `;

    // Filter pills
    tabContent.querySelectorAll('[data-tfilter]').forEach(btn => {
      btn.addEventListener('click', () => { takeoverFilter = btn.dataset.tfilter; renderTakeovers(); });
    });

    // Expand/collapse
    tabContent.querySelectorAll('[data-expand-takeover]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.dataset.expandTakeover;
        const detail = tabContent.querySelector(`#takeover-detail-${idx}`);
        const card = btn.closest('.admin-listing-card');
        const isOpen = detail.style.display !== 'none';
        detail.style.display = isOpen ? 'none' : '';
        card.classList.toggle('expanded', !isOpen);
        btn.style.transform = isOpen ? '' : 'rotate(180deg)';
      });
    });

    // Actions
    tabContent.querySelectorAll('[data-action-takeover]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.actionTakeover;
        const id = btn.dataset.id;
        if (action === 'approve') {
          await approveTakeover(id);
          showToast('Takeover approved ✅');
          renderTakeovers();
        } else if (action === 'reject') {
          if (!confirm('Reject this takeover?')) return;
          await rejectTakeover(id);
          showToast('Takeover rejected');
          renderTakeovers();
        } else if (action === 'delete') {
          if (!confirm('Permanently delete this takeover?')) return;
          await deleteTakeover(id);
          showToast('Takeover deleted', 'error');
          renderTakeovers();
        } else if (action === 'view') {
          navigate(`/takeover/${id}`);
        }
      });
    });
  }

  function formatReasonLabel(reason) {
    const labels = {
      scam: 'Suspected Scam', fake: 'Fake / Misleading', inappropriate: 'Inappropriate',
      duplicate: 'Duplicate', unavailable: 'Unavailable', harassment: 'Harassment',
      spam: 'Spam', discrimination: 'Discrimination', unsafe_property: 'Unsafe Conditions',
      threatening: 'Threatening', identity_theft: 'Identity Theft',
      wrong_info: 'Incorrect Info', already_rented: 'Already Rented',
      wrong_location: 'Wrong Location', other: 'Other'
    };
    return labels[reason] || reason;
  }

  let reportFilter = 'all';

  async function renderReports() {
    const allItems = await getReports();
    const counts = {
      all: allItems.length,
      pending: allItems.filter(r => r.status === 'pending').length,
      resolved: allItems.filter(r => r.status === 'resolved').length,
      dismissed: allItems.filter(r => r.status === 'dismissed').length
    };
    const items = reportFilter === 'all' ? allItems : allItems.filter(r => r.status === reportFilter);
    const sorted = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (allItems.length === 0) {
      tabContent.innerHTML = '<div class="no-results"><h3>No reports yet</h3><p>Users haven\'t reported any issues</p></div>';
      return;
    }

    const sevColors = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444', critical: '#DC2626' };
    const categoryLabels = { safety: '🛡️ Safety', content: '📝 Content', availability: '🏠 Availability', conduct: '👤 Conduct', other: '📋 Other' };

    // Enrich reports with target data
    const enriched = await Promise.all(sorted.map(async (r) => {
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
      <div class="admin-listing-controls">
        <div class="admin-filter-pills">
          <button class="admin-filter-pill ${reportFilter === 'all' ? 'active' : ''}" data-rfilter="all">All (${counts.all})</button>
          <button class="admin-filter-pill ${reportFilter === 'pending' ? 'active' : ''}" data-rfilter="pending" style="--pill-accent:#F59E0B">⏳ Pending (${counts.pending})</button>
          <button class="admin-filter-pill ${reportFilter === 'resolved' ? 'active' : ''}" data-rfilter="resolved" style="--pill-accent:#22C55E">✅ Resolved (${counts.resolved})</button>
          <button class="admin-filter-pill ${reportFilter === 'dismissed' ? 'active' : ''}" data-rfilter="dismissed" style="--pill-accent:#94A3B8">❌ Dismissed (${counts.dismissed})</button>
        </div>
      </div>

      ${sorted.length === 0 ? '<div class="no-results"><h3>No reports in this category</h3></div>' : ''}

      <div class="admin-reports-list">
        ${enriched.map((r, i) => {
          const statusClass = r.status === 'resolved' ? 'approved' : r.status === 'dismissed' ? 'rejected' : 'pending';
          const isPending = r.status === 'pending';
          return `
          <div class="admin-report-card" data-report-idx="${i}">
            <div class="admin-report-header">
              <div class="admin-report-meta">
                <span class="admin-report-type-badge ${r.targetType}">${r.targetType === 'property' ? '🏠 Listing' : '🔄 Takeover'}</span>
                ${r.category ? `<span class="admin-report-reason-badge" style="background:rgba(99,102,241,0.08);color:#6366F1">${categoryLabels[r.category] || r.category}</span>` : ''}
                <span class="admin-report-reason-badge">${formatReasonLabel(r.reason)}</span>
                ${r.severity ? `<span class="admin-report-reason-badge" style="background:${sevColors[r.severity]}18;color:${sevColors[r.severity]}">${r.severity}</span>` : ''}
                <span class="status-badge ${statusClass}">${r.status}</span>
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
                  ${r.resolution ? `<div style="margin-top:4px;font-size:11px;color:var(--color-success);font-weight:600">📋 ${r.resolution}</div>` : ''}
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

              ${isPending ? `
              <div class="admin-report-actions-grid">
                ${r.target && r.target.status !== 'rejected' ? `
                  <button class="admin-action-btn danger" data-action="takedown" data-report-id="${r.id}" data-target-id="${r.targetId}" data-target-type="${r.targetType}">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    <span>Take Down</span><small>Remove from platform</small>
                  </button>` : ''}
                ${r.targetOwner && !r.targetOwner.banned ? `
                  <button class="admin-action-btn danger-outline" data-action="ban-owner" data-report-id="${r.id}" data-owner-id="${r.targetOwner.id}" data-owner-name="${r.targetOwner.name}">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M4.93 4.93l10.14 10.14"/></svg>
                    <span>Ban User</span><small>Ban ${r.targetOwner.name}</small>
                  </button>
                  <button class="admin-action-btn warning" data-action="warn-owner" data-report-id="${r.id}" data-owner-id="${r.targetOwner.id}" data-owner-name="${r.targetOwner.name}">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M10 2L1 18h18L10 2zM10 8v4M10 14h.01"/></svg>
                    <span>Warn User</span><small>Send a warning</small>
                  </button>` : ''}
                ${r.target ? `
                  <button class="admin-action-btn neutral" data-action="view-target" data-target-id="${r.targetId}" data-target-type="${r.targetType}">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="3"/><path d="M1 10s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z"/></svg>
                    <span>View Content</span><small>Open reported item</small>
                  </button>` : ''}
              </div>
              <div class="admin-report-resolution">
                <div class="admin-report-resolution-label">Resolution</div>
                <div class="admin-report-resolution-actions">
                  <button class="action-btn approve" data-action="resolve" data-report-id="${r.id}">✅ Mark Resolved</button>
                  <button class="action-btn reject" data-action="dismiss" data-report-id="${r.id}">Dismiss Report</button>
                </div>
              </div>` : `
              <div style="padding:12px 0">
                ${r.target ? `<button class="admin-action-btn neutral" data-action="view-target" data-target-id="${r.targetId}" data-target-type="${r.targetType}" style="display:inline-flex">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="3"/><path d="M1 10s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z"/></svg>
                  <span>View Content</span></button>` : ''}
              </div>`}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

    // Filter pills
    tabContent.querySelectorAll('[data-rfilter]').forEach(btn => {
      btn.addEventListener('click', () => { reportFilter = btn.dataset.rfilter; renderReports(); });
    });

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
      if (tab.dataset.tab === 'listings') renderListings();
      else if (tab.dataset.tab === 'takeovers') renderTakeovers();
      else if (tab.dataset.tab === 'reports') renderReports();
      else if (tab.dataset.tab === 'users') renderUsers();
      else renderAnalytics();
    });
  });

  renderListings();
  return page;
}
