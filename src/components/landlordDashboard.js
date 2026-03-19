import { getCurrentUser, getPropertiesByLandlord, getConversations, getPropertyById, deleteProperty, markAsRented, markAsAvailable, getInspectionsByLandlord, approveInspection, rescheduleInspection } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import { escapeHTML } from '../utils/authSecurity.js';

export async function createLandlordDashboard() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'landlord' && user.role !== 'admin')) { navigate('/login'); return document.createElement('div'); }

  const properties = await getPropertiesByLandlord(user.id);
  const convos = await getConversations(user.id);
  const inspections = await getInspectionsByLandlord(user.id);
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
    </div>

    <div class="dashboard-tabs">
      <div class="dashboard-tab active" data-tab="listings">My Listings</div>
      <div class="dashboard-tab" data-tab="inspections">Inspection Requests (${inspections.filter(i => i.status === 'pending').length})</div>
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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.tab === 'listings') renderListings();
      else renderInspections();
    });
  });

  page.querySelector('#add-property-btn').addEventListener('click', () => navigate('/post-property'));
  renderListings();
  return page;
}
