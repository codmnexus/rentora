import { getTakeoverById, incrementTakeoverViews, getCurrentUser } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import { showReportModal } from './reportModal.js';

export async function createTakeoverDetail(takeoverId) {
  const takeover = await getTakeoverById(takeoverId);
  if (!takeover) {
    const el = document.createElement('div');
    el.className = 'detail-view';
    el.innerHTML = '<div class="no-results"><h3>Takeover not found</h3><p>This listing may have been removed</p></div>';
    return el;
  }

  await incrementTakeoverViews(takeoverId);
  const formatPrice = (p) => '₦' + p.toLocaleString();
  const user = await getCurrentUser();

  const detail = document.createElement('div');
  detail.className = 'detail-view';

  detail.innerHTML = `
    <button class="detail-back-btn" id="back-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Back to takeovers
    </button>

    <div class="takeover-badge-inline" style="margin-bottom:12px">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 6l5 5 5-5M6 1v10"/></svg>
      Room Takeover
    </div>

    <!-- ₦5k Incentive Banner -->
    <div class="incentive-banner">
      <div class="incentive-icon">₦5k</div>
      <div>
        <strong>₦5,000 Incentive</strong>
        <span>The outgoing student earns ₦5,000 when this room is successfully taken over</span>
      </div>
    </div>

    <h1 class="detail-title">${takeover.title}</h1>
    <div class="detail-subtitle">
      <span class="detail-subtitle-item">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 1C5 1 3.5 2.5 3.5 4.5c0 3 3.5 6.5 3.5 6.5s3.5-3.5 3.5-6.5C10.5 2.5 9 1 7 1z"/><circle cx="7" cy="4.5" r="1.5"/></svg>
        ${takeover.area}
      </span>
      <span class="detail-subtitle-item">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="12" height="9" rx="1"/><path d="M1 7h12"/></svg>
        ${takeover.apartmentType}
      </span>
      <span class="detail-subtitle-item" style="color:var(--color-warning);font-weight:600">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="6"/><path d="M7 4v3l2 1"/></svg>
        ${takeover.leaseRemaining} months remaining
      </span>
    </div>

    <div class="detail-gallery" style="grid-template-rows:300px">
      ${(takeover.images || []).map((img, i) => `
        <img src="${img}" alt="${takeover.title}" class="${i === 0 ? 'detail-gallery-main' : ''}" />
      `).join('')}
    </div>

    <div class="detail-body">
      <div class="detail-info">
        <div class="landlord-profile">
          <div class="landlord-avatar">${takeover.studentName?.charAt(0) || '?'}</div>
          <div class="landlord-info">
            <div class="landlord-name">${takeover.studentName || 'Student'}</div>
            <div class="landlord-meta">Current tenant · Looking for someone to take over</div>
          </div>
        </div>

        ${takeover.gateDistances ? `
        <div class="detail-section">
          <div class="detail-section-title">Distance to Campus Gates</div>
          <div class="gate-distances">
            <div class="gate-pill">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 13V4M3 7l4-4 4 4"/></svg>
              <div><strong>South Gate</strong><br/>${takeover.gateDistances.southGate}</div>
            </div>
            <div class="gate-pill">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 13V4M3 7l4-4 4 4"/></svg>
              <div><strong>North Gate</strong><br/>${takeover.gateDistances.northGate}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="detail-section">
          <div class="detail-section-title">About This Takeover</div>
          <p class="detail-description">${takeover.description}</p>
        </div>

        ${takeover.houseRules ? `
        <div class="detail-section">
          <div class="detail-section-title">House Rules</div>
          <p class="detail-description">${takeover.houseRules}</p>
        </div>
        ` : ''}

        ${takeover.amenities?.length ? `
        <div class="detail-section">
          <div class="detail-section-title">Amenities</div>
          <div class="amenities-grid">
            ${takeover.amenities.map(a => `
              <div class="amenity-item">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 8l4 4 8-8"/></svg>
                ${a}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- In-App Contact -->
        <div class="detail-section">
          <div class="detail-section-title">Contact Student</div>
          <div class="inapp-notice">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px;flex-shrink:0"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/><circle cx="8" cy="11.5" r="1"/></svg>
            <span>All communication is in-app for your safety</span>
          </div>
          <div class="contact-actions" style="grid-template-columns:1fr">
            <button class="contact-btn message" id="to-message" style="grid-column:1/-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Message Student
            </button>
          </div>
          <button class="contact-btn report-btn" id="to-report">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>
            Report listing
          </button>
        </div>
      </div>

      <!-- Sticky Card -->
      <div class="booking-card">
        <div class="booking-price">${formatPrice(takeover.rent)} <span>/ year</span></div>
        <div class="booking-details">
          <div class="booking-detail">
            <span class="booking-detail-label">Lease Remaining</span>
            <span class="booking-detail-value">${takeover.leaseRemaining} months</span>
          </div>
          <div class="booking-detail">
            <span class="booking-detail-label">Type</span>
            <span class="booking-detail-value">${takeover.apartmentType}</span>
          </div>
          <div class="booking-detail">
            <span class="booking-detail-label">Area</span>
            <span class="booking-detail-value">${takeover.area}</span>
          </div>
        </div>
        <div class="incentive-pill">
          <span>🎉</span> You earn ₦5,000 incentive upon successful takeover
        </div>
        <button class="contact-btn message" style="width:100%;justify-content:center;padding:14px;margin-bottom:8px" id="to-msg-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          Message Student
        </button>
        <button class="contact-btn whatsapp" style="width:100%;justify-content:center;padding:14px" id="to-reserve">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M5 8.5V7a3 3 0 016 0v1.5"/><rect x="3" y="8.5" width="10" height="6" rx="1.5"/></svg>
          Reserve Room (Escrow)
        </button>
      </div>
    </div>
  `;

  // Event handlers
  detail.querySelector('#back-btn').addEventListener('click', () => navigate('/takeovers'));

  const msgHandler = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/messages?to=${takeover.studentId}&property=${takeover.id}`);
    location.reload();
  };
  detail.querySelector('#to-message')?.addEventListener('click', msgHandler);
  detail.querySelector('#to-msg-card')?.addEventListener('click', msgHandler);

  detail.querySelector('#to-report')?.addEventListener('click', () => showReportModal(takeover.id, 'takeover'));

  detail.querySelector('#to-reserve')?.addEventListener('click', () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/payment/${takeover.id}`);
  });

  return detail;
}
