import { escapeHTML } from '../utils/authSecurity.js';

// Premium Lightbox Component
export function showLightbox(images, startIndex = 0) {
  if (!images || images.length === 0) return;

  // 1. Inject Styles dynamically (keeping component modular and self-contained)
  injectStyles();

  // 2. State Management
  let currentIndex = startIndex;
  let scale = 1.0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  // 3. DOM Elements
  const overlay = document.createElement('div');
  overlay.className = 'rentora-lightbox-overlay';
  overlay.innerHTML = `
    <!-- Top Control Bar -->
    <div class="lightbox-top-bar">
      <div class="lightbox-counter">1 / 1</div>
      <div class="lightbox-actions">
        <button class="lightbox-btn zoom-out-btn" title="Zoom Out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <button class="lightbox-btn zoom-in-btn" title="Zoom In">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <button class="lightbox-btn reset-btn" title="Reset Scale">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </button>
        <button class="lightbox-btn close-btn" title="Close (Esc)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- Main Content viewport -->
    <div class="lightbox-viewport">
      <button class="lightbox-nav-arrow prev-arrow" title="Previous Image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      
      <div class="lightbox-img-container">
        <img class="lightbox-img" src="" alt="Listing photo" draggable="false" />
      </div>

      <button class="lightbox-nav-arrow next-arrow" title="Next Image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <!-- Bottom Thumbnail Strip -->
    <div class="lightbox-bottom-strip">
      <div class="lightbox-thumbnails">
        ${images.map((img, i) => `
          <div class="lightbox-thumb-item" data-index="${i}">
            <img src="${escapeHTML(img)}" alt="Thumbnail" />
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const img = overlay.querySelector('.lightbox-img');
  const imgContainer = overlay.querySelector('.lightbox-img-container');
  const counter = overlay.querySelector('.lightbox-counter');
  const prevBtn = overlay.querySelector('.prev-arrow');
  const nextBtn = overlay.querySelector('.next-arrow');
  const zoomInBtn = overlay.querySelector('.zoom-in-btn');
  const zoomOutBtn = overlay.querySelector('.zoom-out-btn');
  const resetBtn = overlay.querySelector('.reset-btn');
  const closeBtn = overlay.querySelector('.close-btn');
  const thumbsContainer = overlay.querySelector('.lightbox-thumbnails');
  const thumbItems = overlay.querySelectorAll('.lightbox-thumb-item');

  // 4. Methods & Render Logic
  function updateImage() {
    // Reset Zoom / Panning states before changing image
    scale = 1.0;
    panX = 0;
    panY = 0;
    applyTransform();

    // Set source
    img.src = images[currentIndex];
    counter.textContent = `${currentIndex + 1} / ${images.length}`;

    // Update Thumbs highlighting
    thumbItems.forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === currentIndex);
    });

    // Smoothly scroll active thumbnail to center of view
    const activeThumb = thumbsContainer.querySelector('.lightbox-thumb-item.active');
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // Toggle arrow visibilities
    prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
    prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'all';
    nextBtn.style.opacity = currentIndex === images.length - 1 ? '0.3' : '1';
    nextBtn.style.pointerEvents = currentIndex === images.length - 1 ? 'none' : 'all';
  }

  function applyTransform() {
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    imgContainer.style.cursor = scale > 1.0 ? 'grab' : 'default';
  }

  function handleZoomIn() {
    scale = Math.min(scale + 0.5, 4.0);
    applyTransform();
  }

  function handleZoomOut() {
    scale = Math.max(scale - 0.5, 1.0);
    if (scale === 1.0) {
      panX = 0;
      panY = 0;
    }
    applyTransform();
  }

  function handleReset() {
    scale = 1.0;
    panX = 0;
    panY = 0;
    applyTransform();
  }

  function handlePrev() {
    if (currentIndex > 0) {
      currentIndex--;
      updateImage();
    }
  }

  function handleNext() {
    if (currentIndex < images.length - 1) {
      currentIndex++;
      updateImage();
    }
  }

  function handleClose() {
    overlay.classList.add('fade-out');
    // Remove global keyboard/wheel listeners immediately to prevent memory leak
    window.removeEventListener('keydown', handleKeyDown);
    overlay.removeEventListener('wheel', handleWheel);

    setTimeout(() => {
      overlay.remove();
    }, 300); // match transition duration
  }

  // 5. Event Listeners - Navigation & Actions
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); handlePrev(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); handleNext(); });
  zoomInBtn.addEventListener('click', (e) => { e.stopPropagation(); handleZoomIn(); });
  zoomOutBtn.addEventListener('click', (e) => { e.stopPropagation(); handleZoomOut(); });
  resetBtn.addEventListener('click', (e) => { e.stopPropagation(); handleReset(); });
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); handleClose(); });

  // Thumbnail clicks
  thumbItems.forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = parseInt(thumb.dataset.index);
      updateImage();
    });
  });

  // Tap backdrop to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === overlay.querySelector('.lightbox-viewport') || e.target === imgContainer) {
      handleClose();
    }
  });

  // Double-click/double-tap to toggle zoom (premium feature)
  img.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    if (scale > 1.0) {
      handleReset();
    } else {
      scale = 2.0;
      // Zoom centered on click coordinate relative to viewport
      const rect = img.getBoundingClientRect();
      const clickX = e.clientX - rect.left - rect.width / 2;
      const clickY = e.clientY - rect.top - rect.height / 2;
      panX = -clickX;
      panY = -clickY;
      applyTransform();
    }
  });

  // 6. Interactive Drag & Pan Logic (Mouse)
  imgContainer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (scale <= 1.0) return;
    isDragging = true;
    imgContainer.style.cursor = 'grabbing';
    startX = e.clientX - panX;
    startY = e.clientY - panY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      imgContainer.style.cursor = scale > 1.0 ? 'grab' : 'default';
    }
  });

  // 7. Touch Pan & Gestures for Mobile
  imgContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;

      if (scale > 1.0) {
        isDragging = true;
        startX = touchStartX - panX;
        startY = touchStartY - panY;
      }
    }
  });

  imgContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;

      if (isDragging) {
        panX = clientX - startX;
        panY = clientY - startY;
        applyTransform();
      }
    }
  });

  imgContainer.addEventListener('touchend', (e) => {
    if (isDragging) {
      isDragging = false;
    }

    if (e.changedTouches.length === 1 && scale === 1.0) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Detect horizontal swipe
      if (Math.abs(diffX) > 60 && Math.abs(diffY) < 40) {
        if (diffX > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    }
  });

  // Double-tap implementation
  let lastTap = 0;
  img.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault();
      if (scale > 1.0) {
        handleReset();
      } else {
        scale = 2.0;
        applyTransform();
      }
    }
    lastTap = currentTime;
  });

  // 8. Wheel Zoom centered on cursor
  function handleWheel(e) {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const delta = -e.deltaY;
    const oldScale = scale;
    scale = Math.min(Math.max(scale + (delta > 0 ? 1 : -1) * zoomIntensity * scale, 1.0), 4.0);

    if (scale > 1.0) {
      // Offset panning slightly to focus on zoom center
      const rect = img.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const factor = scale / oldScale;

      panX = mouseX - (mouseX - panX) * factor;
      panY = mouseY - (mouseY - panY) * factor;
    } else {
      panX = 0;
      panY = 0;
    }
    applyTransform();
  }
  overlay.addEventListener('wheel', handleWheel, { passive: false });

  // 9. Keyboard controls
  function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') handleClose();
  }
  window.addEventListener('keydown', handleKeyDown);

  // Initial rendering
  updateImage();
}

// Dynamically injected styles using variables from Rentora Design System
let styleInjected = false;
function injectStyles() {
  if (styleInjected) return;
  styleInjected = true;

  const css = `
    .rentora-lightbox-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      color: var(--color-white);
      font-family: var(--font-family);
      animation: lightbox-fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
      user-select: none;
      -webkit-user-select: none;
    }

    .rentora-lightbox-overlay.fade-out {
      animation: lightbox-fade-out 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    /* Top Control Bar */
    .lightbox-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4) var(--space-6);
      background: linear-gradient(to bottom, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0) 100%);
      z-index: 10;
    }

    .lightbox-counter {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--color-gray-200);
      background: rgba(30, 41, 59, 0.6);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-pill);
      letter-spacing: 0.5px;
    }

    .lightbox-actions {
      display: flex;
      gap: var(--space-2);
    }

    .lightbox-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--color-gray-100);
      width: 42px;
      height: 42px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      outline: none;
    }

    .lightbox-btn:hover {
      background: var(--color-primary);
      color: var(--color-white);
      transform: scale(1.05);
      box-shadow: var(--shadow-sm);
    }

    .lightbox-btn svg {
      width: 20px;
      height: 20px;
    }

    /* Viewport Area */
    .lightbox-viewport {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      padding: 0 var(--space-4);
    }

    .lightbox-img-container {
      flex: 1;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    .lightbox-img {
      max-width: 90%;
      max-height: 85%;
      object-fit: contain;
      border-radius: var(--radius-md);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      transition: transform 150ms cubic-bezier(0.1, 0.8, 0.3, 1);
      transform-origin: center center;
    }

    /* Nav Arrows */
    .lightbox-nav-arrow {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--color-white);
      width: 52px;
      height: 52px;
      border-radius: var(--radius-pill);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-base);
      z-index: 10;
      outline: none;
    }

    .lightbox-nav-arrow:hover {
      background: var(--color-primary);
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(27, 46, 107, 0.4);
    }

    .lightbox-nav-arrow svg {
      width: 24px;
      height: 24px;
    }

    /* Bottom Thumbnails */
    .lightbox-bottom-strip {
      padding: var(--space-4) 0 var(--space-6) 0;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0) 100%);
      display: flex;
      justify-content: center;
      z-index: 10;
    }

    .lightbox-thumbnails {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-6);
      max-width: 90vw;
      overflow-x: auto;
      scroll-behavior: smooth;
    }

    /* hide scrollbar for thumbs strip */
    .lightbox-thumbnails::-webkit-scrollbar {
      height: 4px;
    }
    .lightbox-thumbnails::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-pill);
    }

    .lightbox-thumb-item {
      width: 76px;
      height: 52px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: pointer;
      opacity: 0.4;
      border: 2px solid transparent;
      transition: all var(--transition-base);
      flex-shrink: 0;
    }

    .lightbox-thumb-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .lightbox-thumb-item:hover {
      opacity: 0.8;
      transform: translateY(-2px);
    }

    .lightbox-thumb-item.active {
      opacity: 1;
      border-color: var(--color-accent);
      transform: scale(1.05) translateY(-2px);
      box-shadow: 0 4px 10px rgba(59, 95, 212, 0.3);
    }

    /* Animations */
    @keyframes lightbox-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes lightbox-fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @media (max-width: 768px) {
      .lightbox-nav-arrow {
        width: 44px;
        height: 44px;
        position: absolute;
      }
      .prev-arrow { left: var(--space-2); }
      .next-arrow { right: var(--space-2); }
      .lightbox-img {
        max-width: 95%;
        max-height: 75%;
      }
      .lightbox-thumb-item {
        width: 60px;
        height: 42px;
      }
    }
  `;

  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}
