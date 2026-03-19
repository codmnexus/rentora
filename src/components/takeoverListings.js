import { getApprovedTakeovers, searchTakeovers } from '../utils/store.js';
import { getCurrentRoute } from '../utils/router.js';
import { createTakeoverCard } from './takeoverCard.js';

export async function createTakeoverListings() {
  const route = getCurrentRoute();
  const page = document.createElement('div');
  page.className = 'search-page';

  const filters = {
    location: route.params.location || '',
    maxPrice: route.params.maxPrice ? parseInt(route.params.maxPrice) : null,
    sortBy: route.params.sortBy || 'newest'
  };

  const results = await searchTakeovers(filters);

  page.innerHTML = `
    <div class="search-filters">
      <h3 style="font-size:18px;font-weight:700;margin-bottom:16px">Filter Takeovers</h3>
      <div class="filter-section">
        <div class="filter-section-title">Area</div>
        <select class="filter-select" id="to-filter-area">
          <option value="">All areas</option>
          <option value="FUTA South Gate"${filters.location === 'FUTA South Gate' ? ' selected' : ''}>FUTA South Gate</option>
          <option value="FUTA North Gate"${filters.location === 'FUTA North Gate' ? ' selected' : ''}>FUTA North Gate</option>
          <option value="Roadblock"${filters.location === 'Roadblock' ? ' selected' : ''}>Roadblock</option>
          <option value="Ijapo Estate"${filters.location === 'Ijapo Estate' ? ' selected' : ''}>Ijapo Estate</option>
          <option value="Oba Ile"${filters.location === 'Oba Ile' ? ' selected' : ''}>Oba Ile</option>
          <option value="Aule"${filters.location === 'Aule' ? ' selected' : ''}>Aule</option>
        </select>
      </div>
      <div class="filter-section">
        <div class="filter-section-title">Max Rent (₦/year)</div>
        <div class="filter-range">
          <input type="number" placeholder="Max" id="to-filter-max-price" value="${filters.maxPrice || ''}" />
        </div>
      </div>
      <button class="hero-search-btn" id="to-apply-filters" style="margin-top:16px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" style="width:16px;height:16px"><circle cx="10.5" cy="10.5" r="7"/><path d="M21 21l-5.2-5.2"/></svg>
        Apply Filters
      </button>
    </div>
    <div>
      <div class="search-results-header">
        <div>
          <h2 style="font-size:20px;font-weight:700;margin-bottom:4px">Room Takeovers</h2>
          <div class="search-results-count">${results.length} takeover${results.length !== 1 ? 's' : ''} available</div>
        </div>
        <select class="search-sort" id="to-sort">
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </div>
      <div class="property-grid" id="to-results-grid"></div>
      ${results.length === 0 ? '<div class="no-results"><h3>No takeovers found</h3><p>Check back soon — students post new takeovers regularly</p></div>' : ''}
    </div>
  `;

  const grid = page.querySelector('#to-results-grid');
  for (const t of results) {
    grid.appendChild(await createTakeoverCard(t));
  }

  // Apply filters
  page.querySelector('#to-apply-filters').addEventListener('click', () => {
    const area = page.querySelector('#to-filter-area').value;
    const maxPrice = page.querySelector('#to-filter-max-price').value;
    let query = '/takeovers?';
    if (area) query += `location=${encodeURIComponent(area)}&`;
    if (maxPrice) query += `maxPrice=${maxPrice}&`;
    window.location.hash = query.slice(0, -1);
    location.reload();
  });

  // Sort
  page.querySelector('#to-sort').addEventListener('change', async (e) => {
    const sorted = await searchTakeovers({ ...filters, sortBy: e.target.value });
    grid.innerHTML = '';
    for (const t of sorted) {
      grid.appendChild(await createTakeoverCard(t));
    }
  });

  return page;
}
