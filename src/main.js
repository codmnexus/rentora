import './index.css';
import { seedData } from './utils/store.js';
import { onRouteChange, getCurrentRoute, matchRoute } from './utils/router.js';
import { createHeader } from './components/header.js';
import { createSearchBar } from './components/searchBar.js';
import { createCategoryFilter } from './components/categoryFilter.js';
import { createPropertyGrid } from './components/propertyGrid.js';
import { createPropertyDetail } from './components/propertyDetail.js';
import { createSearchResults } from './components/searchResults.js';
import { createLoginPage } from './components/loginPage.js';
import { createTenantDashboard } from './components/tenantDashboard.js';
import { createLandlordDashboard } from './components/landlordDashboard.js';
import { createPostProperty } from './components/postProperty.js';
import { createMessagesPage } from './components/messagesPage.js';
import { createAdminPanel } from './components/adminPanel.js';
import { createFooter } from './components/footer.js';
import { createTakeoverListings } from './components/takeoverListings.js';
import { createTakeoverDetail } from './components/takeoverDetail.js';
import { createPostTakeover } from './components/postTakeover.js';
import { createPaymentPage } from './components/paymentPage.js';
import { getApprovedProperties, getCurrentUser } from './utils/store.js';
import { createLandingPage } from './components/landingPage.js';
import { createInfoPage } from './components/infoPages.js';

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
    app.appendChild(createLandingPage());
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Header (always present for app routes)
  app.appendChild(await createHeader());

  // Route matching
  const propertyMatch = matchRoute('/property/:id', route.path);
  const takeoverMatch = matchRoute('/takeover/:id', route.path);
  const paymentMatch = matchRoute('/payment/:id', route.path);

  if (propertyMatch) {
    app.appendChild(await createPropertyDetail(propertyMatch.id));
    app.appendChild(createFooter());

  } else if (takeoverMatch) {
    app.appendChild(await createTakeoverDetail(takeoverMatch.id));
    app.appendChild(createFooter());

  } else if (paymentMatch) {
    app.appendChild(await createPaymentPage(paymentMatch.id));
    app.appendChild(createFooter());

  } else if (route.path === '/takeovers') {
    app.appendChild(await createTakeoverListings());
    app.appendChild(createFooter());

  } else if (route.path === '/post-takeover') {
    app.appendChild(await createPostTakeover());
    app.appendChild(createFooter());

  } else if (route.path === '/search') {
    app.appendChild(await createSearchResults());
    app.appendChild(createFooter());

  } else if (route.path === '/login') {
    app.appendChild(createLoginPage());

  } else if (route.path === '/dashboard') {
    app.appendChild(await createTenantDashboard());
    app.appendChild(createFooter());

  } else if (route.path === '/landlord') {
    app.appendChild(await createLandlordDashboard());
    app.appendChild(createFooter());

  } else if (route.path === '/post-property') {
    app.appendChild(await createPostProperty());
    app.appendChild(createFooter());

  } else if (route.path === '/messages') {
    app.appendChild(await createMessagesPage());

  } else if (route.path === '/admin') {
    app.appendChild(await createAdminPanel());
    app.appendChild(createFooter());

  } else if (route.path === '/about') {
    app.appendChild(createInfoPage('about'));
    app.appendChild(createFooter());

  } else if (route.path === '/contact') {
    app.appendChild(createInfoPage('contact'));
    app.appendChild(createFooter());

  } else if (route.path === '/privacy') {
    app.appendChild(createInfoPage('privacy'));
    app.appendChild(createFooter());

  } else if (route.path === '/terms') {
    app.appendChild(createInfoPage('terms'));
    app.appendChild(createFooter());

  } else if (route.path === '/blog') {
    app.appendChild(createInfoPage('blog'));
    app.appendChild(createFooter());

  } else if (route.path === '/pricing') {
    app.appendChild(createInfoPage('pricing'));
    app.appendChild(createFooter());

  } else if (route.path === '/verification') {
    app.appendChild(createInfoPage('verification'));
    app.appendChild(createFooter());

  } else if (route.path === '/help') {
    app.appendChild(createInfoPage('help'));
    app.appendChild(createFooter());

  } else if (route.path === '/home') {
    app.appendChild(createSearchBar());
    app.appendChild(createCategoryFilter(async (categoryId) => {
      const allProps = await getApprovedProperties();
      if (categoryId === 'all') {
        renderHomeGrid(allProps);
      } else if (categoryId === 'near-campus') {
        renderHomeGrid(allProps.filter(p => p.distanceFromCampus <= 1));
      } else if (categoryId === 'verified') {
        renderHomeGrid(allProps.filter(p => p.verified));
      } else if (categoryId === 'budget') {
        renderHomeGrid(allProps.filter(p => p.price <= 100000));
      } else if (categoryId === 'furnished') {
        renderHomeGrid(allProps.filter(p => p.furnished));
      } else {
        const typeMap = {
          'self-con': 'Self-con', 'single-room': 'Single room', 'flat': 'Flat',
          'shared-room': 'Shared room', 'studio': 'Studio'
        };
        const type = typeMap[categoryId];
        if (type) renderHomeGrid(allProps.filter(p => p.type === type));
        else renderHomeGrid(allProps);
      }
    }));
    const homeProps = await getApprovedProperties();
    renderHomeGrid(homeProps);
    app.appendChild(createFooter());

  } else {
    // Home page (default — logged-in users only, landing is handled above)
    app.appendChild(createSearchBar());
    app.appendChild(createCategoryFilter(async (categoryId) => {
      const allProps = await getApprovedProperties();
      if (categoryId === 'all') {
        renderHomeGrid(allProps);
      } else if (categoryId === 'near-campus') {
        renderHomeGrid(allProps.filter(p => p.distanceFromCampus <= 1));
      } else if (categoryId === 'verified') {
        renderHomeGrid(allProps.filter(p => p.verified));
      } else if (categoryId === 'budget') {
        renderHomeGrid(allProps.filter(p => p.price <= 100000));
      } else if (categoryId === 'furnished') {
        renderHomeGrid(allProps.filter(p => p.furnished));
      } else {
        const typeMap = {
          'self-con': 'Self-con', 'single-room': 'Single room', 'flat': 'Flat',
          'shared-room': 'Shared room', 'studio': 'Studio'
        };
        const type = typeMap[categoryId];
        if (type) renderHomeGrid(allProps.filter(p => p.type === type));
        else renderHomeGrid(allProps);
      }
    }));
    const defaultProps = await getApprovedProperties();
    renderHomeGrid(defaultProps);
    app.appendChild(createFooter());
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHomeGrid(properties) {
  const old = app.querySelector('.main-content');
  if (old) old.remove();
  const footer = app.querySelector('.footer');
  const grid = createPropertyGrid(properties);
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

init();
