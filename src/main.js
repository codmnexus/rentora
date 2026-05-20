// Core styles
import './index.css';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { seedData } from './utils/store.js';
import { onRouteChange, getCurrentRoute, matchRoute } from './utils/router.js';

// Lazy‑load component factories – each returns a promise resolving to the module
const loadHeader = () => import('./components/header.js');
const loadSearchBar = () => import('./components/searchBar.js');
const loadCategoryFilter = () => import('./components/categoryFilter.js');
const loadPropertyGrid = () => import('./components/propertyGrid.js');
const loadPropertyDetail = () => import('./components/propertyDetail.js');
const loadSearchResults = () => import('./components/searchResults.js');
const loadLoginPage = () => import('./components/loginPage.js');
const loadTenantDashboard = () => import('./components/tenantDashboard.js');
const loadLandlordDashboard = () => import('./components/landlordDashboard.js');
const loadPostProperty = () => import('./components/postProperty.js');
const loadMessagesPage = () => import('./components/messagesPage.js');
const loadAdminPanel = () => import('./components/adminPanel.js');
const loadFooter = () => import('./components/footer.js');
const loadTakeoverListings = () => import('./components/takeoverListings.js');
const loadTakeoverDetail = () => import('./components/takeoverDetail.js');
const loadPostTakeover = () => import('./components/postTakeover.js');
const loadPaymentPage = () => import('./components/paymentPage.js');
const loadPaymentsHub = () => import('./components/paymentsHub.js');
const loadLandingPage = () => import('./components/landingPage.js');
const loadInfoPage = () => import('./components/infoPages.js');

// Store helpers (remain eager – small footprint)
import { getApprovedProperties, getCurrentUser } from './utils/store.js';


const app = document.getElementById('app');

// Show loading state
function showLoading() {
  app.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:var(--bg-primary,#0a0a0f);">
    <div style="text-align:center;color:var(--text-secondary,#94a3b8);">
      <div style="width:40px;height:40px;border:3px solid rgba(99,102,241,0.3);border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;"></div>
      <p style="font-family:Inter,sans-serif;font-size:14px;">Loading Rentora...</p>
    </div>
  </div>`;
}

async function render() {
  const route = getCurrentRoute();
  app.innerHTML = '';
  app.classList.remove('page-enter');
  void app.offsetWidth; // force reflow
  app.classList.add('page-enter');

  // Landing page routes — skip app header, use landing's own header
  const currentUser = await getCurrentUser();
  const isLandingRoute = route.path === '/welcome' || (route.path === '/' && !currentUser);
  if (isLandingRoute) {
    app.appendChild((await (await loadLandingPage()).createLandingPage)());
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Header (always present for app routes)
  app.appendChild((await (await loadHeader()).createHeader)());

  // Route matching
  const propertyMatch = matchRoute('/property/:id', route.path);
  const takeoverMatch = matchRoute('/takeover/:id', route.path);
  const paymentMatch = matchRoute('/payment/:id', route.path);

  try {
  if (propertyMatch) {
    app.appendChild((await (await loadPropertyDetail()).createPropertyDetail)(propertyMatch.id));
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (takeoverMatch) {
    app.appendChild((await (await loadTakeoverDetail()).createTakeoverDetail)(takeoverMatch.id));
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/payments') {
    app.appendChild((await (await loadPaymentsHub()).createPaymentsHub)());
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (paymentMatch) {
    app.appendChild((await (await loadPaymentPage()).createPaymentPage)(paymentMatch.id));
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/takeovers') {
    app.appendChild((await (await loadTakeoverListings()).createTakeoverListings)());
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/post-takeover') {
    app.appendChild((await (await loadPostTakeover()).createPostTakeover)());
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/search') {
    app.appendChild((await (await loadSearchResults()).createSearchResults)());
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/login') {
    app.appendChild((await (await loadLoginPage()).createLoginPage)());

  } else if (route.path === '/dashboard') {
    app.appendChild((await (await loadTenantDashboard()).createTenantDashboard)());
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/landlord') {
    app.appendChild((await (await loadLandlordDashboard()).createLandlordDashboard)());
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/post-property') {
    app.appendChild((await (await loadPostProperty()).createPostProperty)());
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/messages') {
    app.appendChild((await (await loadMessagesPage()).createMessagesPage)());

  } else if (route.path === '/admin') {
    app.appendChild((await (await loadAdminPanel()).createAdminPanel)());
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/about') {
    app.appendChild((await (await loadInfoPage()).createInfoPage)('about'));
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/contact') {
    app.appendChild((await (await loadInfoPage()).createInfoPage)('contact'));
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/privacy') {
    app.appendChild((await (await loadInfoPage()).createInfoPage)('privacy'));
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/terms') {
    app.appendChild((await (await loadInfoPage()).createInfoPage)('terms'));
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/blog') {
    app.appendChild((await (await loadInfoPage()).createInfoPage)('blog'));
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/pricing') {
    app.appendChild((await (await loadInfoPage()).createInfoPage)('pricing'));
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/verification') {
    app.appendChild((await (await loadInfoPage()).createInfoPage)('verification'));
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/help') {
    app.appendChild((await (await loadInfoPage()).createInfoPage)('help'));
    app.appendChild((await (await loadFooter()).createFooter)());

  } else if (route.path === '/home') {
    app.appendChild(createSearchBar());
    app.appendChild(createCategoryFilter(async (categoryId) => {
      const allProps = await getApprovedProperties();
      if (categoryId === 'all') {
        await renderHomeGrid(allProps);
      } else if (categoryId === 'near-campus') {
        await renderHomeGrid(allProps.filter(p => p.distanceFromCampus <= 1));
      } else if (categoryId === 'verified') {
        await renderHomeGrid(allProps.filter(p => p.verified));
      } else if (categoryId === 'budget') {
        await renderHomeGrid(allProps.filter(p => p.price <= 100000));
      } else if (categoryId === 'furnished') {
        await renderHomeGrid(allProps.filter(p => p.furnished));
      } else {
        const typeMap = {
          'self-con': 'Self-con', 'single-room': 'Single room', 'flat': 'Flat',
          'shared-room': 'Shared room', 'studio': 'Studio'
        };
        const type = typeMap[categoryId];
        if (type) await renderHomeGrid(allProps.filter(p => p.type === type));
        else await renderHomeGrid(allProps);
      }
    }));
    const homeProps = await getApprovedProperties();
    await renderHomeGrid(homeProps);
    app.appendChild((await (await loadFooter()).createFooter)());

  } else {
    // Home page (default — logged-in users only, landing is handled above)
    app.appendChild(createSearchBar());
    app.appendChild(createCategoryFilter(async (categoryId) => {
      const allProps = await getApprovedProperties();
      if (categoryId === 'all') {
        await renderHomeGrid(allProps);
      } else if (categoryId === 'near-campus') {
        await renderHomeGrid(allProps.filter(p => p.distanceFromCampus <= 1));
      } else if (categoryId === 'verified') {
        await renderHomeGrid(allProps.filter(p => p.verified));
      } else if (categoryId === 'budget') {
        await renderHomeGrid(allProps.filter(p => p.price <= 100000));
      } else if (categoryId === 'furnished') {
        await renderHomeGrid(allProps.filter(p => p.furnished));
      } else {
        const typeMap = {
          'self-con': 'Self-con', 'single-room': 'Single room', 'flat': 'Flat',
          'shared-room': 'Shared room', 'studio': 'Studio'
        };
        const type = typeMap[categoryId];
        if (type) await renderHomeGrid(allProps.filter(p => p.type === type));
        else await renderHomeGrid(allProps);
      }
    }));
    const defaultProps = await getApprovedProperties();
    await renderHomeGrid(defaultProps);
    app.appendChild((await (await loadFooter()).createFooter)());
  }
  } catch (routeError) {
    console.error('[Rentora] Route render error:', routeError);
    const errorEl = document.createElement('div');
    errorEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:40px 20px">
        <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5" style="width:48px;height:48px;margin-bottom:16px">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        <h2 style="font-size:1.25rem;font-weight:700;color:#1E293B;margin-bottom:8px">Something went wrong</h2>
        <p style="font-size:14px;color:#64748B;max-width:400px;margin-bottom:20px">We couldn't load this page. This may be due to a network issue or the content may no longer be available.</p>
        <button onclick="window.location.hash='#/';location.reload()" style="padding:10px 24px;background:#1E3A5F;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">Go Home</button>
      </div>
    `;
    app.appendChild(errorEl);
    app.appendChild((await (await loadFooter()).createFooter)());
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function renderHomeGrid(properties) {
  const old = app.querySelector('.main-content');
  if (old) old.remove();
  const footer = app.querySelector('.footer');
  const grid = (await (await loadPropertyGrid()).createPropertyGrid)(properties);
  if (footer) app.insertBefore(grid, footer);
  else app.appendChild(grid);
}

// Listen for route changes
onRouteChange(() => render());

// Initialize: seed data then render
async function init() {
  showLoading();
  // Seed data with timeout — don't block rendering if Firebase is unavailable
  try {
    await Promise.race([
      seedData(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Seed timeout')), 30000))
    ]);
  } catch (err) {
    console.warn('[Rentora] Seed skipped:', err.message);
  }
  await render();
}

// Initialize Vercel Speed Insights
injectSpeedInsights();

init();
