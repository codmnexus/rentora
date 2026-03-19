import { navigate } from '../utils/router.js';

export function createSearchBar() {
  const container = document.createElement('div');

  container.innerHTML = `
    <div class="hero">
      <div class="hero-inner">
        <div class="hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z"/></svg>
          Find Your Next Home
        </div>
        <h1 class="hero-title">Find your perfect <span>student housing</span> near FUTA</h1>
        <p class="hero-subtitle">A modern housing platform connecting students directly to landlords. Clean, simple, and designed for the way you search for homes.</p>

        <!-- Three Action Cards -->
        <div class="hero-action-cards">
          <div class="hero-action-card" id="action-apartments">
            <div class="hero-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12l9-9 9 9"/><path d="M5 10v9a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1v-9"/></svg>
            </div>
            <div class="hero-action-label">Find Apartment</div>
            <div class="hero-action-desc">Browse verified listings from landlords</div>
          </div>
          <div class="hero-action-card" id="action-takeovers">
            <div class="hero-action-icon takeover">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
            </div>
            <div class="hero-action-label">Take Over Room</div>
            <div class="hero-action-desc">Find rooms from outgoing students</div>
          </div>
          <div class="hero-action-card coming-soon" id="action-roommate">
            <div class="hero-action-icon roommate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div class="hero-action-label">Find Roommate</div>
            <div class="hero-action-desc">Coming Soon</div>
            <span class="coming-soon-badge">Soon</span>
          </div>
        </div>

        <div class="hero-search" id="hero-search-form">
          <div class="hero-search-row">
            <div class="hero-search-field full">
              <label class="hero-search-label">Location</label>
              <select class="hero-search-input" id="search-location" style="cursor:pointer">
                <option value="">All areas near FUTA</option>
                <option value="FUTA South Gate">FUTA South Gate</option>
                <option value="FUTA North Gate">FUTA North Gate</option>
                <option value="Roadblock">Roadblock</option>
                <option value="Ijapo Estate">Ijapo Estate</option>
                <option value="Oba Ile">Oba Ile</option>
                <option value="Aule">Aule</option>
              </select>
            </div>
          </div>
          <div class="hero-search-row">
            <div class="hero-search-field">
              <label class="hero-search-label">Room Type</label>
              <select class="hero-search-input" id="search-type" style="cursor:pointer">
                <option value="">Any type</option>
                <option value="Self-con">Self-con</option>
                <option value="Single room">Single Room</option>
                <option value="Flat">Flat</option>
                <option value="Shared room">Shared Room</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
            <div class="hero-search-field">
              <label class="hero-search-label">Max Budget (₦/year)</label>
              <select class="hero-search-input" id="search-budget" style="cursor:pointer">
                <option value="">Any budget</option>
                <option value="50000">Under ₦50,000</option>
                <option value="100000">Under ₦100,000</option>
                <option value="150000">Under ₦150,000</option>
                <option value="200000">Under ₦200,000</option>
                <option value="300000">Under ₦300,000</option>
                <option value="500000">Under ₦500,000</option>
              </select>
            </div>
          </div>
          <button class="hero-search-btn" id="hero-search-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="7"/><path d="M21 21l-5.2-5.2"/></svg>
            Search Apartments
          </button>
        </div>

        <div class="hero-quick-filters">
          <button class="hero-quick-filter" data-area="FUTA South Gate">🏫 South Gate</button>
          <button class="hero-quick-filter" data-area="Roadblock">📍 Roadblock</button>
          <button class="hero-quick-filter" data-area="Ijapo Estate">🏡 Ijapo</button>
          <button class="hero-quick-filter" data-area="Oba Ile">🗺️ Oba Ile</button>
          <button class="hero-quick-filter" data-area="Aule">🏘️ Aule</button>
          <button class="hero-quick-filter" data-area="FUTA North Gate">🎓 North Gate</button>
        </div>
      </div>
    </div>
  `;

  // Action card clicks
  container.querySelector('#action-apartments').addEventListener('click', () => navigate('/search'));
  container.querySelector('#action-takeovers').addEventListener('click', () => navigate('/takeovers'));
  // Roommate is disabled (coming soon)

  // Search button
  container.querySelector('#hero-search-btn').addEventListener('click', () => {
    const location = container.querySelector('#search-location').value;
    const type = container.querySelector('#search-type').value;
    const budget = container.querySelector('#search-budget').value;
    let query = '/search?';
    if (location) query += `location=${encodeURIComponent(location)}&`;
    if (type) query += `roomType=${encodeURIComponent(type)}&`;
    if (budget) query += `maxPrice=${budget}&`;
    navigate(query.slice(0, -1));
  });

  // Quick filters
  container.querySelectorAll('.hero-quick-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(`/search?location=${encodeURIComponent(btn.dataset.area)}`);
    });
  });

  return container;
}
