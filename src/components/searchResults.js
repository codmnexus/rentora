import { searchProperties } from '../utils/store.js';
import { createPropertyCard } from './propertyCard.js';
import { navigate, getCurrentRoute } from '../utils/router.js';

export async function createSearchResults() {
  const route = getCurrentRoute();
  const container = document.createElement('div');

  // Parse filters from URL
  const filters = { ...route.params };
  const results = await searchProperties(filters);

  container.innerHTML = `
    <div class="search-page">
      <aside class="search-filters">
        <h3 style="font-size:1.125rem;font-weight:700;margin-bottom:16px">Filters</h3>
        
        <div class="filter-section">
          <div class="filter-section-title">Location</div>
          <select class="filter-select" id="filter-location">
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
          <div class="filter-section-title">Price Range (₦/year)</div>
          <div class="filter-range">
            <input type="number" placeholder="Min" id="filter-min-price" value="${filters.minPrice || ''}" />
            <span>–</span>
            <input type="number" placeholder="Max" id="filter-max-price" value="${filters.maxPrice || ''}" />
          </div>
        </div>

        <div class="filter-section">
          <div class="filter-section-title">Room Type</div>
          <label class="filter-checkbox"><input type="radio" name="roomType" value="" ${!filters.roomType ? 'checked' : ''} /> Any</label>
          <label class="filter-checkbox"><input type="radio" name="roomType" value="Self-con" ${filters.roomType === 'Self-con' ? 'checked' : ''} /> Self-con</label>
          <label class="filter-checkbox"><input type="radio" name="roomType" value="Single room" ${filters.roomType === 'Single room' ? 'checked' : ''} /> Single Room</label>
          <label class="filter-checkbox"><input type="radio" name="roomType" value="Flat" ${filters.roomType === 'Flat' ? 'checked' : ''} /> Flat</label>
          <label class="filter-checkbox"><input type="radio" name="roomType" value="Shared room" ${filters.roomType === 'Shared room' ? 'checked' : ''} /> Shared Room</label>
          <label class="filter-checkbox"><input type="radio" name="roomType" value="Studio" ${filters.roomType === 'Studio' ? 'checked' : ''} /> Studio</label>
        </div>

        <div class="filter-section">
          <div class="filter-section-title">Distance from FUTA</div>
          <select class="filter-select" id="filter-distance">
            <option value="">Any distance</option>
            <option value="1"${filters.maxDistance === '1' ? ' selected' : ''}>Within 1km</option>
            <option value="2"${filters.maxDistance === '2' ? ' selected' : ''}>Within 2km</option>
            <option value="3"${filters.maxDistance === '3' ? ' selected' : ''}>Within 3km</option>
            <option value="5"${filters.maxDistance === '5' ? ' selected' : ''}>Within 5km</option>
          </select>
        </div>

        <div class="filter-section">
          <div class="filter-toggle">
            <span style="font-size:0.875rem;font-weight:600">Furnished only</span>
            <div class="toggle${filters.furnished === 'true' ? ' active' : ''}" id="filter-furnished"></div>
          </div>
        </div>

        <button class="hero-search-btn" id="apply-filters" style="margin-top:8px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" width="18" height="18"><circle cx="10.5" cy="10.5" r="7"/><path d="M21 21l-5.2-5.2"/></svg>
          Apply Filters
        </button>
      </aside>

      <div>
        <div class="search-results-header">
          <span class="search-results-count">${results.length} properties found${filters.location ? ' in ' + filters.location : ''}</span>
          <select class="search-sort" id="search-sort">
            <option value="">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="distance">Nearest to FUTA</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
        <div class="property-grid" id="results-grid"></div>
        ${results.length === 0 ? `
          <div class="no-results">
            <h3>No properties found</h3>
            <p>Try adjusting your filters or search in a different area</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Render cards
  const grid = container.querySelector('#results-grid');
  for (const p of results) {
    grid.appendChild(await createPropertyCard(p));
  }

  // Apply filters
  container.querySelector('#apply-filters').addEventListener('click', () => {
    let q = '/search?';
    const loc = container.querySelector('#filter-location').value;
    const min = container.querySelector('#filter-min-price').value;
    const max = container.querySelector('#filter-max-price').value;
    const type = container.querySelector('input[name="roomType"]:checked')?.value;
    const dist = container.querySelector('#filter-distance').value;
    const furn = container.querySelector('#filter-furnished').classList.contains('active');
    if (loc) q += `location=${encodeURIComponent(loc)}&`;
    if (min) q += `minPrice=${min}&`;
    if (max) q += `maxPrice=${max}&`;
    if (type) q += `roomType=${encodeURIComponent(type)}&`;
    if (dist) q += `maxDistance=${dist}&`;
    if (furn) q += `furnished=true&`;
    navigate(q.slice(0, -1));
  });

  // Toggle
  container.querySelector('#filter-furnished')?.addEventListener('click', function () { this.classList.toggle('active'); });

  // Sort
  container.querySelector('#search-sort').addEventListener('change', async (e) => {
    const sorted = await searchProperties({ ...filters, sortBy: e.target.value });
    grid.innerHTML = '';
    for (const p of sorted) {
      grid.appendChild(await createPropertyCard(p));
    }
  });

  return container;
}
