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
import { getSkeletonCardHTML, getHomeSkeleton, getSearchSkeleton, getDetailSkeleton, getDashboardSkeleton, getMessagesSkeleton, getGeneralSkeleton } from './components/skeletonLoader.js';


let currentRenderId = 0;
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
  currentRenderId++;
  const renderId = currentRenderId;
  const route = getCurrentRoute();
  app.innerHTML = '';
  app.classList.remove('page-enter');
  void app.offsetWidth; // force reflow
  app.classList.add('page-enter');

  // Landing page routes — skip app header, use landing's own header
  const currentUser = await getCurrentUser();
  if (renderId !== currentRenderId) return;
  const isLandingRoute = route.path === '/welcome' || (route.path === '/' && !currentUser);
  if (isLandingRoute) {
    const { createLandingPage } = await loadLandingPage();
    if (renderId !== currentRenderId) return;
    app.appendChild(createLandingPage());
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Header (always present for app routes)
  const { createHeader } = await loadHeader();
  if (renderId !== currentRenderId) return;
  app.appendChild(await createHeader());
  if (renderId !== currentRenderId) return;

  // Route matching
  const propertyMatch = matchRoute('/property/:id', route.path);
  const takeoverMatch = matchRoute('/takeover/:id', route.path);
  const paymentMatch = matchRoute('/payment/:id', route.path);

  // Inject route-specific skeleton loaders instantly to prevent blank layout shifts
  const skeletonContainer = document.createElement('div');
  skeletonContainer.id = 'route-skeleton-loader';
  
  if (propertyMatch || takeoverMatch) {
    skeletonContainer.innerHTML = getDetailSkeleton();
  } else if (route.path === '/search' || route.path === '/takeovers') {
    skeletonContainer.innerHTML = getSearchSkeleton();
  } else if (route.path === '/dashboard' || route.path === '/landlord' || route.path === '/payments') {
    skeletonContainer.innerHTML = getDashboardSkeleton();
  } else if (route.path === '/messages') {
    skeletonContainer.innerHTML = getMessagesSkeleton();
  } else if (route.path === '/home' || route.path === '/') {
    skeletonContainer.innerHTML = getHomeSkeleton();
  } else if (
    route.path !== '/login' && 
    route.path !== '/welcome' && 
    route.path !== '/post-property' && 
    route.path !== '/post-takeover' &&
    route.path !== '/about' &&
    route.path !== '/contact' &&
    route.path !== '/privacy' &&
    route.path !== '/terms' &&
    route.path !== '/blog' &&
    route.path !== '/pricing' &&
    route.path !== '/verification' &&
    route.path !== '/help'
  ) {
    skeletonContainer.innerHTML = getGeneralSkeleton();
  }

  if (skeletonContainer.innerHTML) {
    app.appendChild(skeletonContainer);
  }

  const removeSkeleton = () => {
    const el = app.querySelector('#route-skeleton-loader');
    if (el) el.remove();
  };

  try {
  if (propertyMatch) {
    const { createPropertyDetail } = await loadPropertyDetail();
    if (renderId !== currentRenderId) return;
    const detailEl = await createPropertyDetail(propertyMatch.id);
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(detailEl);
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (takeoverMatch) {
    const { createTakeoverDetail } = await loadTakeoverDetail();
    if (renderId !== currentRenderId) return;
    const detailEl = await createTakeoverDetail(takeoverMatch.id);
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(detailEl);
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/payments') {
    const { createPaymentsHub } = await loadPaymentsHub();
    if (renderId !== currentRenderId) return;
    const el = await createPaymentsHub();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(el);
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (paymentMatch) {
    const { createPaymentPage } = await loadPaymentPage();
    if (renderId !== currentRenderId) return;
    const el = await createPaymentPage(paymentMatch.id);
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(el);
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/takeovers') {
    const { createTakeoverListings } = await loadTakeoverListings();
    if (renderId !== currentRenderId) return;
    const el = await createTakeoverListings();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(el);
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/post-takeover') {
    const { createPostTakeover } = await loadPostTakeover();
    if (renderId !== currentRenderId) return;
    const el = await createPostTakeover();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(el);
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/search') {
    const { createSearchResults } = await loadSearchResults();
    if (renderId !== currentRenderId) return;
    const el = await createSearchResults();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(el);
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/login') {
    const { createLoginPage } = await loadLoginPage();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(createLoginPage());

  } else if (route.path === '/dashboard') {
    const { createTenantDashboard } = await loadTenantDashboard();
    if (renderId !== currentRenderId) return;
    const el = await createTenantDashboard();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(el);
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/landlord') {
    const { createLandlordDashboard } = await loadLandlordDashboard();
    if (renderId !== currentRenderId) return;
    const el = await createLandlordDashboard();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(el);
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/post-property') {
    const { createPostProperty } = await loadPostProperty();
    if (renderId !== currentRenderId) return;
    const el = await createPostProperty();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(el);
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/messages') {
    const { createMessagesPage } = await loadMessagesPage();
    if (renderId !== currentRenderId) return;
    const el = await createMessagesPage();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(el);

  } else if (route.path === '/admin') {
    const { createAdminPanel } = await loadAdminPanel();
    if (renderId !== currentRenderId) return;
    const el = await createAdminPanel();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(el);
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/about') {
    const { createInfoPage } = await loadInfoPage();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(createInfoPage('about'));
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/contact') {
    const { createInfoPage } = await loadInfoPage();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(createInfoPage('contact'));
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/privacy') {
    const { createInfoPage } = await loadInfoPage();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(createInfoPage('privacy'));
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/terms') {
    const { createInfoPage } = await loadInfoPage();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(createInfoPage('terms'));
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/blog') {
    const { createInfoPage } = await loadInfoPage();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(createInfoPage('blog'));
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/pricing') {
    const { createInfoPage } = await loadInfoPage();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(createInfoPage('pricing'));
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/verification') {
    const { createInfoPage } = await loadInfoPage();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(createInfoPage('verification'));
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/help') {
    const { createInfoPage } = await loadInfoPage();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(createInfoPage('help'));
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else if (route.path === '/home') {
    const { createSearchBar } = await loadSearchBar();
    const { createCategoryFilter } = await loadCategoryFilter();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(createSearchBar());
    app.appendChild(createCategoryFilter(async (categoryId) => {
      const allProps = await getApprovedProperties();
      if (renderId !== currentRenderId) return;
      if (categoryId === 'all') {
        await renderHomeGrid(allProps, renderId);
      } else if (categoryId === 'near-campus') {
        await renderHomeGrid(allProps.filter(p => p.distanceFromCampus <= 1), renderId);
      } else if (categoryId === 'verified') {
        await renderHomeGrid(allProps.filter(p => p.verified), renderId);
      } else if (categoryId === 'budget') {
        await renderHomeGrid(allProps.filter(p => p.price <= 100000), renderId);
      } else if (categoryId === 'furnished') {
        await renderHomeGrid(allProps.filter(p => p.furnished), renderId);
      } else {
        const typeMap = {
          'self-con': 'Self-con', 'single-room': 'Single room', 'flat': 'Flat',
          'shared-room': 'Shared room', 'studio': 'Studio'
        };
        const type = typeMap[categoryId];
        if (type) await renderHomeGrid(allProps.filter(p => p.type === type), renderId);
        else await renderHomeGrid(allProps, renderId);
      }
    }));
    const homeProps = await getApprovedProperties();
    if (renderId !== currentRenderId) return;
    await renderHomeGrid(homeProps, renderId);
    if (renderId !== currentRenderId) return;
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());

  } else {
    // Home page (default — logged-in users only, landing is handled above)
    const { createSearchBar } = await loadSearchBar();
    const { createCategoryFilter } = await loadCategoryFilter();
    if (renderId !== currentRenderId) return;
    removeSkeleton();
    app.appendChild(createSearchBar());
    app.appendChild(createCategoryFilter(async (categoryId) => {
      const allProps = await getApprovedProperties();
      if (renderId !== currentRenderId) return;
      if (categoryId === 'all') {
        await renderHomeGrid(allProps, renderId);
      } else if (categoryId === 'near-campus') {
        await renderHomeGrid(allProps.filter(p => p.distanceFromCampus <= 1), renderId);
      } else if (categoryId === 'verified') {
        await renderHomeGrid(allProps.filter(p => p.verified), renderId);
      } else if (categoryId === 'budget') {
        await renderHomeGrid(allProps.filter(p => p.price <= 100000), renderId);
      } else if (categoryId === 'furnished') {
        await renderHomeGrid(allProps.filter(p => p.furnished), renderId);
      } else {
        const typeMap = {
          'self-con': 'Self-con', 'single-room': 'Single room', 'flat': 'Flat',
          'shared-room': 'Shared room', 'studio': 'Studio'
        };
        const type = typeMap[categoryId];
        if (type) await renderHomeGrid(allProps.filter(p => p.type === type), renderId);
        else await renderHomeGrid(allProps, renderId);
      }
    }));
    const defaultProps = await getApprovedProperties();
    if (renderId !== currentRenderId) return;
    await renderHomeGrid(defaultProps, renderId);
    if (renderId !== currentRenderId) return;
    const { createFooter } = await loadFooter();
    if (renderId !== currentRenderId) return;
    app.appendChild(createFooter());
  }
  } catch (routeError) {
    console.error('[Rentora] Route render error:', routeError);
    if (renderId !== currentRenderId) return;
    removeSkeleton();
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
    const { createFooter } = await loadFooter();
    app.appendChild(createFooter());
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function renderHomeGrid(properties, renderId) {
  if (renderId !== undefined && renderId !== currentRenderId) return;
  const old = app.querySelector('.main-content');
  const footer = app.querySelector('.footer');
  
  // Show temporary grid skeletons during load to keep UI responsive
  let tempGrid = app.querySelector('#temp-listing-skeleton-grid');
  if (!tempGrid) {
    tempGrid = document.createElement('div');
    tempGrid.id = 'temp-listing-skeleton-grid';
    tempGrid.className = 'main-content';
    tempGrid.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div class="skeleton" style="height: 24px; width: 180px; border-radius: var(--radius-sm);"></div>
        </div>
        <div class="property-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
          ${Array(3).fill(0).map(() => getSkeletonCardHTML()).join('')}
        </div>
      </div>
    `;
    if (old) {
      old.replaceWith(tempGrid);
    } else if (footer) {
      app.insertBefore(tempGrid, footer);
    } else {
      app.appendChild(tempGrid);
    }
  }

  const { createPropertyGrid } = await loadPropertyGrid();
  if (renderId !== undefined && renderId !== currentRenderId) return;
  const grid = await createPropertyGrid(properties);
  if (renderId !== undefined && renderId !== currentRenderId) return;
  
  // Clean up skeleton and mount real grid
  if (tempGrid) tempGrid.remove();
  const freshOld = app.querySelector('.main-content');
  if (freshOld) freshOld.remove();
  
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
