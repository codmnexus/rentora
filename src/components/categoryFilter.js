import { categories } from '../data/categories.js';

export function createCategoryFilter(onCategoryChange) {
  const wrapper = document.createElement('div');
  wrapper.className = 'category-filter-wrapper';

  wrapper.innerHTML = `
    <div class="category-filter-container">
      <button class="category-scroll-btn" id="cat-scroll-left" aria-label="Scroll left">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 1L2 5l5 4"/></svg>
      </button>
      <div class="category-scroll-wrapper">
        <div class="category-scroll" id="category-scroll">
          ${categories.map((cat, i) => `
            <div class="category-item${i === 0 ? ' active' : ''}" data-category="${cat.id}">
              <div class="category-icon">${cat.icon}</div>
              <span class="category-label">${cat.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <button class="category-scroll-btn" id="cat-scroll-right" aria-label="Scroll right">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 1l5 4-5 4"/></svg>
      </button>
    </div>
  `;

  const items = wrapper.querySelectorAll('.category-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      onCategoryChange && onCategoryChange(item.dataset.category);
    });
  });

  const scrollEl = wrapper.querySelector('#category-scroll');
  wrapper.querySelector('#cat-scroll-left').addEventListener('click', () => scrollEl.scrollBy({ left: -200, behavior: 'smooth' }));
  wrapper.querySelector('#cat-scroll-right').addEventListener('click', () => scrollEl.scrollBy({ left: 200, behavior: 'smooth' }));

  return wrapper;
}
