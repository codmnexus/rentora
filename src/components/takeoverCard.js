import { getCurrentUser, isListingSaved, saveListing, removeSavedListing } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';

export async function createTakeoverCard(takeover) {
  const card = document.createElement('div');
  card.className = 'property-card takeover-card';
  const user = await getCurrentUser();
  const imageCount = takeover.images?.length || 0;
  const formatPrice = (p) => '₦' + p.toLocaleString();
  const closestGate = takeover.gateDistances
    ? (parseInt(takeover.gateDistances.southGate) <= parseInt(takeover.gateDistances.northGate)
      ? `🚶 ${takeover.gateDistances.southGate} to South Gate`
      : `🚶 ${takeover.gateDistances.northGate} to North Gate`)
    : '';

  card.innerHTML = `
    <div class="property-card-image-wrapper">
      <div class="carousel-images" style="transform:translateX(0%)" data-current="0">
        ${(takeover.images || []).map(img => `<img src="${img}" alt="${takeover.title}" loading="lazy" />`).join('')}
      </div>
      ${imageCount > 1 ? `
        <button class="carousel-btn prev" aria-label="Previous">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 1L2 5l5 4"/></svg>
        </button>
        <button class="carousel-btn next" aria-label="Next">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 1l5 4-5 4"/></svg>
        </button>
        <div class="carousel-dots">
          ${takeover.images.map((_, i) => `<div class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}"></div>`).join('')}
        </div>
      ` : ''}
      <div class="takeover-badge">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 6l5 5 5-5M6 1v10"/></svg>
        Takeover
      </div>
      <div class="incentive-card-badge">₦5k bonus</div>
    </div>
    <div class="property-card-info">
      <div class="property-card-header">
        <div class="property-card-title">${takeover.title}</div>
      </div>
      <div class="property-card-location">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 1C4 1 2.5 2.5 2.5 4.5c0 3 3.5 6.5 3.5 6.5s3.5-3.5 3.5-6.5C9.5 2.5 8 1 6 1z"/><circle cx="6" cy="4.5" r="1.2"/></svg>
        ${takeover.area}${closestGate ? ` · ${closestGate}` : ''}
      </div>
      <div class="property-card-meta">
        <span class="property-card-meta-item">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="10" height="8" rx="1"/><path d="M1 7h10"/></svg>
          ${takeover.apartmentType}
        </span>
        <span class="property-card-meta-item takeover-lease">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="5"/><path d="M6 3v3l2 1"/></svg>
          ${takeover.leaseRemaining} months left
        </span>
      </div>
      <div class="property-card-price">${formatPrice(takeover.rent)} <span>/ year</span></div>
      <div class="takeover-student-line">
        <span class="takeover-student-avatar">${takeover.studentName?.charAt(0) || '?'}</span>
        Posted by ${takeover.studentName?.split(' ')[0] || 'Student'}
      </div>
    </div>
  `;

  // Carousel
  if (imageCount > 1) {
    const imgs = card.querySelector('.carousel-images');
    const dots = card.querySelectorAll('.carousel-dot');
    const update = (i) => { imgs.dataset.current = i; imgs.style.transform = `translateX(-${i*100}%)`; dots.forEach((d,j) => d.classList.toggle('active', j===i)); };
    card.querySelector('.carousel-btn.prev')?.addEventListener('click', (e) => { e.stopPropagation(); let c = +imgs.dataset.current; update(c > 0 ? c-1 : imageCount-1); });
    card.querySelector('.carousel-btn.next')?.addEventListener('click', (e) => { e.stopPropagation(); let c = +imgs.dataset.current; update(c < imageCount-1 ? c+1 : 0); });
    dots.forEach(d => d.addEventListener('click', (e) => { e.stopPropagation(); update(+d.dataset.index); }));
  }

  // Click to detail
  card.addEventListener('click', () => navigate(`/takeover/${takeover.id}`));

  return card;
}
