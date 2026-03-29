import { getCurrentUser, logoutUser, getWallet } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { createNotificationBell } from './notificationCenter.js';
import { escapeHTML } from '../utils/authSecurity.js';

export async function createHeader() {
  const user = await getCurrentUser();
  const wallet = user ? await getWallet() : null;
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <div class="header-inner">
      <a class="header-logo" id="header-logo" href="#/">
        <div class="header-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><path d="M9.5 11V9l2.5-2 2.5 2v2h-2v-1.5h-1V11z" fill="white" stroke="none"/></svg>
        </div>
        <div class="header-logo-text">Rentora</div>
      </a>
      <nav class="header-nav">
        <div class="header-nav-item active" data-route="/">Home</div>
        <div class="header-nav-item" data-route="/search">Browse</div>
        <div class="header-nav-item" data-route="/takeovers">Takeovers</div>
        <div class="header-nav-item" data-route="/post-property">List Property</div>
      </nav>
      <div class="header-actions">
        ${user ? `
          <button class="header-list-btn header-list-btn-desktop" id="post-property-btn">+ List Property</button>
        ` : ''}
        <div id="notification-slot"></div>
        <div style="position:relative;">
          <button class="user-menu-btn" id="user-menu-toggle">
            <div class="user-menu-hamburger"><span></span><span></span><span></span></div>
            <div class="user-menu-avatar${user ? ' logged-in' : ''}">${user ? escapeHTML(user.avatar || user.name.charAt(0)) : '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M8 8a3 3 0 100-6 3 3 0 000 6zM2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>'}</div>
          </button>
          <div class="account-panel" id="user-dropdown">
            ${user ? `
              <div class="account-panel-profile">
                <div class="account-panel-avatar-wrap">
                  <div class="account-panel-avatar">${escapeHTML(user.avatar || user.name.charAt(0))}</div>
                  <div class="account-panel-online"></div>
                </div>
                <div class="account-panel-info">
                  <div class="account-panel-name">${escapeHTML(user.name)}</div>
                  <div class="account-panel-role">${user.role === 'tenant' ? 'Tenant' : user.role === 'landlord' ? 'Landlord' : 'Admin'}</div>
                  <div class="account-panel-id">Account ID ${escapeHTML(user.id ? user.id.substring(0, 12) : '—')}</div>
                </div>
              </div>

              <div class="account-panel-divider"></div>

              <div class="account-panel-balance-row">
                <span class="account-panel-balance-label">Wallet Balance</span>
                <span class="account-panel-balance-value">₦${(wallet?.balance || 0).toLocaleString()}</span>
              </div>

              <div class="account-panel-balance-row">
                <span class="account-panel-balance-label">Rentora Points</span>
                <span class="account-panel-points-badge">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="8" y="11" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor">R</text></svg>
                  0
                </span>
              </div>

              <button class="account-panel-referral" data-route="/dashboard">
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 11v2a4 4 0 01-4 4H5a4 4 0 01-4-4v-2"/><path d="M12 3l4 4-4 4"/><path d="M16 7H6"/></svg>
                Invite friends & start earning!
              </button>

              <div class="account-panel-divider"></div>

              <nav class="account-panel-nav">
                <button class="account-panel-nav-item" data-route="${user.role === 'tenant' ? '/dashboard' : user.role === 'landlord' ? '/landlord' : '/admin'}">
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/></svg>
                  Overview
                </button>

                <button class="account-panel-nav-item" data-route="${user.role === 'tenant' ? '/dashboard' : '/landlord'}">
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l7-7 7 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M8 18V12h4v6"/></svg>
                  Dashboard
                </button>

                <button class="account-panel-nav-item" data-route="/messages">
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13a2 2 0 01-2 2H6l-4 4V5a2 2 0 012-2h12a2 2 0 012 2z"/></svg>
                  Messages
                </button>

                ${user.role === 'landlord' || user.role === 'admin' ? `
                <button class="account-panel-nav-item account-panel-nav-expandable" id="account-panel-selling">
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h12v12H4z"/><path d="M8 4v-2h4v2"/><path d="M4 8h12"/></svg>
                  Listings
                  <svg class="account-panel-chevron" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4l4 4-4 4"/></svg>
                </button>
                ` : ''}

                <button class="account-panel-nav-item" data-route="/payments">
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><circle cx="18" cy="14" r="2"/></svg>
                  Payments
                </button>

                <div class="account-panel-divider"></div>

                <button class="account-panel-nav-item" id="logout-btn">
                  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18H5a2 2 0 01-2-2V4a2 2 0 012-2h4"/><path d="M14 15l5-5-5-5"/><path d="M19 10H9"/></svg>
                  Log out
                </button>
              </nav>
            ` : `
              <div class="account-panel-guest">
                <div class="account-panel-guest-icon">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="5"/><path d="M3 21c0-4.97 4.03-9 9-9s9 4.03 9 9"/></svg>
                </div>
                <p class="account-panel-guest-text">Sign in to access your dashboard, wallet, and messages.</p>
              </div>
              <button class="account-panel-referral" data-route="/login" style="margin-top:8px">Sign Up</button>
              <button class="account-panel-nav-item" data-route="/login" style="margin-top:4px">
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>
                Log In
              </button>
              <div class="account-panel-divider"></div>
              <button class="account-panel-nav-item" data-route="/login">
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l7-7 7 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/></svg>
                List your property
              </button>
              <button class="account-panel-nav-item" data-route="/info/help">
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 14v-1"/><path d="M8 7.5a2.5 2.5 0 014.5 1.5c0 1.5-2 2-2 3"/></svg>
                Help Center
              </button>
            `}
          </div>
        </div>

        <!-- Mobile hamburger -->
        <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <!-- Mobile nav drawer -->
    <div class="mobile-nav-overlay" id="mobile-nav-overlay"></div>
    <nav class="mobile-nav-drawer" id="mobile-nav-drawer">
      <div class="mobile-nav-header">
        <div class="header-logo">
          <div class="header-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><path d="M9.5 11V9l2.5-2 2.5 2v2h-2v-1.5h-1V11z" fill="white" stroke="none"/></svg>
          </div>
          <div class="header-logo-text">Rentora</div>
        </div>
        <button class="mobile-nav-close" id="mobile-nav-close" aria-label="Close menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="mobile-nav-links">
        ${user ? `
          <div class="mobile-nav-user">
            <div class="mobile-nav-user-avatar">${user.avatar || user.name.charAt(0)}</div>
            <div>
              <div class="mobile-nav-user-name">${user.name}</div>
              <div class="mobile-nav-user-role">${user.role}</div>
            </div>
          </div>
          <div class="mobile-nav-divider"></div>
        ` : ''}
        <a class="mobile-nav-link" data-route="/">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </a>
        <a class="mobile-nav-link" data-route="/search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Browse Listings
        </a>
        <a class="mobile-nav-link" data-route="/takeovers">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
          Room Takeovers
        </a>
        <div class="mobile-nav-divider"></div>
        ${user ? `
          ${user.role === 'tenant' ? '<a class="mobile-nav-link" data-route="/dashboard"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>My Dashboard</a>' : ''}
          ${user.role === 'landlord' ? '<a class="mobile-nav-link" data-route="/landlord"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>Landlord Dashboard</a>' : ''}
          ${user.role === 'admin' ? '<a class="mobile-nav-link" data-route="/admin"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="3"/></svg>Admin Panel</a>' : ''}
          <a class="mobile-nav-link" data-route="/messages">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Messages
          </a>
          ${user.role === 'landlord' || user.role === 'admin' ? `
          <a class="mobile-nav-link" data-route="/post-property">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            List Property
          </a>
          ` : ''}
          <div class="mobile-nav-divider"></div>
          <a class="mobile-nav-link mobile-nav-link-danger" id="mobile-logout-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Log out
          </a>
        ` : `
          <a class="mobile-nav-link" data-route="/login">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
            Log in
          </a>
          <a class="mobile-nav-link" data-route="/login">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
            Sign up
          </a>
        `}
      </div>
    </nav>
  `;

  // Add notification bell
  if (user) {
    const bellEl = await createNotificationBell();
    if (bellEl) header.querySelector('#notification-slot').appendChild(bellEl);
  }

  // Nav clicks (desktop + mobile)
  header.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      header.querySelector('#user-dropdown')?.classList.remove('active');
      closeMobileNav();
      navigate(el.dataset.route);
    });
  });

  // Logo
  header.querySelector('#header-logo').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/');
  });

  // User menu toggle
  const toggle = header.querySelector('#user-menu-toggle');
  const dropdown = header.querySelector('#user-dropdown');
  toggle.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('active'); });
  document.addEventListener('click', () => dropdown.classList.remove('active'));

  // Post property btn
  header.querySelector('#post-property-btn')?.addEventListener('click', () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'landlord' && user.role !== 'admin') {
      showToast('Only landlords can list properties. Please sign up as a landlord.', 'error');
      return;
    }
    navigate('/post-property');
  });

  // Logout (desktop)
  header.querySelector('#logout-btn')?.addEventListener('click', async () => {
    await logoutUser();
    navigate('/');
    location.reload();
  });

  // Logout (mobile)
  header.querySelector('#mobile-logout-btn')?.addEventListener('click', async () => {
    closeMobileNav();
    await logoutUser();
    navigate('/');
    location.reload();
  });

  // Mobile nav drawer
  const mobileBtn = header.querySelector('#mobile-menu-btn');
  const mobileDrawer = header.querySelector('#mobile-nav-drawer');
  const mobileOverlay = header.querySelector('#mobile-nav-overlay');
  const mobileClose = header.querySelector('#mobile-nav-close');

  function openMobileNav() {
    mobileDrawer.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    mobileBtn.classList.add('active');
  }

  function closeMobileNav() {
    mobileDrawer.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
    mobileBtn.classList.remove('active');
  }

  mobileBtn.addEventListener('click', openMobileNav);
  mobileClose.addEventListener('click', closeMobileNav);
  mobileOverlay.addEventListener('click', closeMobileNav);

  return header;
}

export function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}
