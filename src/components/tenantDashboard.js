import { getCurrentUser, getSavedListings, getPropertyById, getConversations, getUserById, getTakeoversByStudent, getInspectionsByTenant, updateUser } from '../utils/store.js';
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
    </div>

    <div class="dashboard-tabs">
      <div class="dashboard-tab active" data-tab="saved">Saved Homes</div>
      <div class="dashboard-tab" data-tab="inspections">Inspections</div>
      <div class="dashboard-tab" data-tab="takeovers">My Takeovers</div>
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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.tab === 'saved') renderSaved();
      else if (tab.dataset.tab === 'inspections') renderInspections();
      else if (tab.dataset.tab === 'takeovers') renderTakeovers();
      else if (tab.dataset.tab === 'profile') renderEditProfile();
      else renderMessages();
    });
  });

  page.querySelector('#post-takeover-btn').addEventListener('click', () => navigate('/post-takeover'));
  renderSaved();
  return page;
}
