import { getCurrentUser, isListingSaved, saveListing, removeSavedListing } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { escapeHTML } from '../utils/authSecurity.js';
import { showToast } from './header.js';

export async function createPropertyCard(property) {
  const card = document.createElement('div');
  card.className = 'property-card';
  const user = await getCurrentUser();
  const isSaved = user ? await isListingSaved(user.id, property.id) : false;
  const imageCount = property.images?.length || 0;
  const formatPrice = (p) => '₦' + p.toLocaleString();

  // Gate distance — show closest gate
  const gd = property.gateDistances;
  let gateText = `${property.distanceFromCampus}km from FUTA`;
  if (gd) {
    const southMin = parseInt(gd.southGate);
    const northMin = parseInt(gd.northGate);
    gateText = southMin <= northMin
      ? `🚶 ${gd.southGate} to South Gate`
      : `🚶 ${gd.northGate} to North Gate`;
  }

  card.innerHTML = `
    <div class="property-card-image-wrapper">
      <div class="carousel-images" style="transform:translateX(0%)" data-current="0">
        ${(property.images || []).map(img => `<img src="${escapeHTML(img)}" alt="${escapeHTML(property.title)}" loading="lazy" />`).join('')}
      </div>
      ${imageCount > 1 ? `
        <button class="carousel-btn prev" aria-label="Previous">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 1L2 5l5 4"/></svg>
        </button>
        <button class="carousel-btn next" aria-label="Next">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 1l5 4-5 4"/></svg>
        </button>
        <div class="carousel-dots">
          ${property.images.map((_, i) => `<div class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}"></div>`).join('')}
        </div>
      ` : ''}
      ${property.verified ? `
        <div class="verified-badge">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l3 3 5-5"/></svg>
          Verified
        </div>
      ` : ''}
      <button class="save-btn${isSaved ? ' active' : ''}" aria-label="Save listing">
        <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </button>
    </div>
    <div class="property-card-info">
      <div class="property-card-header">
        <div class="property-card-title">${escapeHTML(property.title)}</div>
      </div>
      <div class="property-card-location">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 1C4 1 2.5 2.5 2.5 4.5c0 3 3.5 6.5 3.5 6.5s3.5-3.5 3.5-6.5C9.5 2.5 8 1 6 1z"/><circle cx="6" cy="4.5" r="1.2"/></svg>
        ${escapeHTML(property.area)} · ${gateText}
      </div>
      <div class="property-card-meta">
        <span class="property-card-meta-item">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="10" height="8" rx="1"/><path d="M1 7h10"/></svg>
          ${escapeHTML(property.type)}
        </span>
        <span class="property-card-meta-item">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8V6a2 2 0 014 0v2"/><rect x="2" y="8" width="8" height="3" rx="1"/></svg>
          ${property.roomsAvailable} room${property.roomsAvailable !== 1 ? 's' : ''}
        </span>
        ${property.furnished ? '<span class="property-card-meta-item">✓ Furnished</span>' : ''}
      </div>
      <div class="property-card-price">${formatPrice(property.price)} <span>/ year</span></div>
    </div>
  `;

  // Carousel
  if (imageCount > 1) {
    const imgs = card.querySelector('.carousel-images');
    const dots = card.querySelectorAll('.carousel-dot');
    const update = (i) => { imgs.dataset.current = i; imgs.style.transform = `translateX(-${i * 100}%)`; dots.forEach((d, j) => d.classList.toggle('active', j === i)); };
    card.querySelector('.carousel-btn.prev')?.addEventListener('click', (e) => { e.stopPropagation(); let c = +imgs.dataset.current; update(c > 0 ? c - 1 : imageCount - 1); });
    card.querySelector('.carousel-btn.next')?.addEventListener('click', (e) => { e.stopPropagation(); let c = +imgs.dataset.current; update(c < imageCount - 1 ? c + 1 : 0); });
    dots.forEach(d => d.addEventListener('click', (e) => { e.stopPropagation(); update(+d.dataset.index); }));
  }

  // Save
  const saveBtn = card.querySelector('.save-btn');
  saveBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (saveBtn.classList.contains('active')) {
      await removeSavedListing(user.id, property.id);
      saveBtn.classList.remove('active');
      showToast('Removed from saved');
    } else {
      await saveListing(user.id, property.id);
      saveBtn.classList.add('active');
      saveBtn.classList.add('pop');
      setTimeout(() => saveBtn.classList.remove('pop'), 400);
      showToast('Saved to your list! ❤️');
    }
  });

  // Click to detail
  card.addEventListener('click', () => navigate(`/property/${property.id}`));

  return card;
}
