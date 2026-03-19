import { getCurrentUser, createReview, getReviewsByProperty, getAverageRating } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';

function renderStars(rating, interactive = false) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="review-star ${i <= rating ? 'filled' : ''}" ${interactive ? `data-star="${i}"` : ''}>★</span>`;
  }
  return html;
}

export async function createReviewSection(propertyId) {
  const user = await getCurrentUser();
  const reviews = await getReviewsByProperty(propertyId);
  const avg = await getAverageRating(propertyId);

  const section = document.createElement('div');
  section.className = 'detail-section review-section';

  const alreadyReviewed = user ? reviews.some(r => r.userId === user.id) : false;

  section.innerHTML = `
    <h2 class="detail-section-title">
      Reviews
      ${avg ? `<span class="review-avg">★ ${avg} <span class="review-count">(${reviews.length} review${reviews.length !== 1 ? 's' : ''})</span></span>` : '<span class="review-count">No reviews yet</span>'}
    </h2>

    ${user && !alreadyReviewed ? `
    <div class="review-form" id="review-form">
      <div class="review-form-stars" id="review-stars">
        ${renderStars(0, true)}
      </div>
      <input type="hidden" id="review-rating" value="0" />
      <textarea class="form-textarea" id="review-text" placeholder="Share your experience with this property..." style="min-height:60px;margin-top:8px"></textarea>
      <button class="hero-search-btn" id="review-submit" style="margin-top:8px;max-width:180px;font-size:13px;padding:10px 16px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z"/></svg>
        Submit Review
      </button>
    </div>
    ` : ''}

    <div class="reviews-list" id="reviews-list">
      ${reviews.length > 0 ? reviews.map(r => `
        <div class="review-item">
          <div class="review-item-header">
            <div class="review-avatar">${r.userName?.charAt(0) || '?'}</div>
            <div>
              <div class="review-name">${r.userName || 'User'}</div>
              <div class="review-date">${new Date(r.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
            <div class="review-item-stars">${renderStars(r.rating)}</div>
          </div>
          <p class="review-text">${r.text}</p>
        </div>
      `).join('') : '<div class="review-empty">Be the first to review this property</div>'}
    </div>
  `;

  // Interactive stars
  if (user && !alreadyReviewed) {
    const stars = section.querySelectorAll('.review-form-stars .review-star');
    const ratingInput = section.querySelector('#review-rating');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.star);
        ratingInput.value = val;
        stars.forEach((s, i) => s.classList.toggle('filled', i < val));
      });
      star.addEventListener('mouseenter', () => {
        const val = parseInt(star.dataset.star);
        stars.forEach((s, i) => s.classList.toggle('hover', i < val));
      });
      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hover'));
      });
    });

    // Submit
    section.querySelector('#review-submit')?.addEventListener('click', async () => {
      const rating = parseInt(ratingInput.value);
      const text = section.querySelector('#review-text').value.trim();
      if (rating < 1) { showToast('Please select a star rating', 'error'); return; }
      if (!text) { showToast('Please write a short review', 'error'); return; }

      await createReview({ userId: user.id, userName: user.name, propertyId, rating, text });
      showToast('Review submitted! ⭐');
      // Re-render
      const parent = section.parentElement;
      const newSection = await createReviewSection(propertyId);
      parent.replaceChild(newSection, section);
    });
  }

  return section;
}
