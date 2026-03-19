import { getPropertyById, incrementPropertyViews, getCurrentUser, getUserById } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import { showReportModal } from './reportModal.js';
import { createReviewSection } from './reviewSection.js';
import { escapeHTML } from '../utils/authSecurity.js';
import { showInspectionModal } from './inspectionBooking.js';

export async function createPropertyDetail(propertyId) {
  const property = await getPropertyById(propertyId);
  if (!property) {
    const el = document.createElement('div');
    el.className = 'detail-view';
    el.innerHTML = '<div class="no-results"><h3>Property not found</h3><p>This listing may have been removed.</p></div>';
    return el;
  }

  await incrementPropertyViews(propertyId).catch(() => {});
  const user = await getCurrentUser();
  const formatPrice = (p) => '₦' + p.toLocaleString();

  const detail = document.createElement('div');
  detail.className = 'detail-view fade-in-up';

  detail.innerHTML = `
    <button class="detail-back-btn" id="detail-back">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 2L4 8l6 6"/></svg>
      Back to listings
    </button>

    <h1 class="detail-title">${escapeHTML(property.title)}</h1>
    <div class="detail-subtitle">
      <span class="detail-subtitle-item">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M7 1C5 1 3.5 2.5 3.5 4.5c0 3 3.5 8.5 3.5 8.5s3.5-5.5 3.5-8.5C10.5 2.5 9 1 7 1z"/><circle cx="7" cy="4.5" r="1.5"/></svg>
        ${escapeHTML(property.area)} · ${escapeHTML(property.distanceFromCampus)}km from FUTA
      </span>
      <span class="detail-subtitle-item">${escapeHTML(property.type)} · ${property.roomsAvailable} room${property.roomsAvailable !== 1 ? 's' : ''} available</span>
      ${property.verified ? '<span class="detail-subtitle-item" style="color:var(--color-primary);font-weight:600">✓ Verified Listing</span>' : ''}
    </div>

    <div class="detail-gallery">
      <div class="detail-gallery-main"><img src="${property.images[0]}" alt="${escapeHTML(property.title)}" /></div>
      ${(property.images || []).slice(1).map(img => `<div><img src="${img}" alt="${escapeHTML(property.title)}" /></div>`).join('')}
    </div>

    <div class="detail-body">
      <div class="detail-info">
        <!-- Landlord Profile -->
        <div class="landlord-profile">
          <div class="landlord-avatar">${property.landlordName ? property.landlordName.charAt(0) : 'L'}</div>
          <div class="landlord-info">
            <div class="landlord-name">
              ${property.landlordName || 'Landlord'}
              ${property.verified ? '<span class="landlord-verified"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l3 3 5-5"/></svg> Verified</span>' : ''}
            </div>
            <div class="landlord-meta">${property.type} · ${property.area} · ${property.views || 0} views</div>
          </div>
        </div>

        <!-- Distance to Gates -->
        ${property.gateDistances ? `
        <div class="detail-section">
          <h2 class="detail-section-title">Distance to Campus Gates</h2>
          <div class="gate-distances">
            <div class="gate-pill">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 13V4M3 7l4-4 4 4"/></svg>
              <div><strong>South Gate</strong><br/>${property.gateDistances.southGate}</div>
            </div>
            <div class="gate-pill">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 13V4M3 7l4-4 4 4"/></svg>
              <div><strong>North Gate</strong><br/>${property.gateDistances.northGate}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Description -->
        <div class="detail-section">
          <h2 class="detail-section-title">About this place</h2>
          <p class="detail-description">${escapeHTML(property.description)}</p>
        </div>

        <!-- Amenities -->
        <div class="detail-section">
          <h2 class="detail-section-title">What this place offers</h2>
          <div class="amenities-grid">
            ${(property.amenities || []).map(a => `
              <div class="amenity-item">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><path d="M7 10l2.5 2.5L13 8"/></svg>
                <span>${a}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Contact (In-App Only) -->
        <div class="detail-section">
          <h2 class="detail-section-title">Contact Landlord</h2>
          <div class="inapp-notice">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px;flex-shrink:0"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/><circle cx="8" cy="11.5" r="1"/></svg>
            <span>All communication on Rentora is in-app for your safety</span>
          </div>
          <div class="contact-actions">
            <button class="contact-btn message" id="contact-message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Message Landlord
            </button>
            <button class="contact-btn inspect" id="contact-inspect">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              Book Inspection
            </button>
          </div>
          <button class="contact-btn report-btn" id="contact-report">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>
            Report listing
          </button>
        </div>

        <!-- Reviews -->
        <div id="reviews-container"></div>
      </div>

      <!-- Booking/Info Card -->
      <div>
        <div class="booking-card">
          <div class="booking-price">${formatPrice(property.price)} <span>/ year</span></div>
          <div class="booking-details">
            <div class="booking-detail">
              <span class="booking-detail-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1C6 1 4.5 2.5 4.5 4.5c0 3 3.5 8.5 3.5 8.5s3.5-5.5 3.5-8.5C11.5 2.5 10 1 8 1z"/></svg>
                Location
              </span>
              <span class="booking-detail-value">${property.area}</span>
            </div>
            <div class="booking-detail">
              <span class="booking-detail-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></svg>
                Distance
              </span>
              <span class="booking-detail-value">${property.distanceFromCampus}km from FUTA</span>
            </div>
            <div class="booking-detail">
              <span class="booking-detail-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="12" height="10" rx="1"/><path d="M2 8h12"/></svg>
                Type
              </span>
              <span class="booking-detail-value">${property.type}</span>
            </div>
            <div class="booking-detail">
              <span class="booking-detail-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 10V8a3 3 0 016 0v2"/><rect x="3" y="10" width="10" height="4" rx="1"/></svg>
                Rooms
              </span>
              <span class="booking-detail-value">${property.roomsAvailable} available</span>
            </div>
            <div class="booking-detail">
              <span class="booking-detail-label">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="12" height="8" rx="1"/><path d="M5 5V3a3 3 0 016 0v2"/></svg>
                Furnished
              </span>
              <span class="booking-detail-value">${property.furnished ? 'Yes' : 'No'}</span>
            </div>
          </div>
          <button class="contact-btn message" style="width:100%;justify-content:center;padding:14px;margin-bottom:8px" id="card-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Send Message
          </button>
          <button class="contact-btn inspect" style="width:100%;justify-content:center;padding:14px;margin-bottom:8px" id="card-inspect">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            Book Inspection
          </button>
          <button class="contact-btn whatsapp" style="width:100%;justify-content:center;padding:14px" id="card-reserve">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/></svg>
            Reserve (Escrow)
          </button>
        </div>
      </div>
    </div>
  `;

  // Add reviews section
  try {
    detail.querySelector('#reviews-container').appendChild(await createReviewSection(propertyId));
  } catch (err) {
    console.warn('[Rentora] Could not load reviews:', err.message);
  }

  // Back
  detail.querySelector('#detail-back').addEventListener('click', () => window.history.back());

  // Message (in-app only)
  const msgHandler = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/messages?to=${property.landlordId}&property=${property.id}`);
  };
  detail.querySelector('#contact-message')?.addEventListener('click', msgHandler);
  detail.querySelector('#card-message')?.addEventListener('click', msgHandler);

  // Inspection booking
  const inspHandler = () => {
    if (!user) { navigate('/login'); return; }
    showInspectionModal(propertyId);
  };
  detail.querySelector('#contact-inspect')?.addEventListener('click', inspHandler);
  detail.querySelector('#card-inspect')?.addEventListener('click', inspHandler);

  // Report
  detail.querySelector('#contact-report')?.addEventListener('click', () => {
    showReportModal(property.id, 'property');
  });

  // Reserve (escrow)
  detail.querySelector('#card-reserve')?.addEventListener('click', () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/payment/${property.id}`);
  });

  return detail;
}
