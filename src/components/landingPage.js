import { navigate } from '../utils/router.js';
import { createFooter } from './footer.js';

export function createLandingPage() {
  const page = document.createElement('div');
  page.className = 'landing-page';

  page.innerHTML = `
    <!-- Landing Header -->
    <header class="landing-header">
      <div class="landing-header-inner">
        <a class="header-logo" id="landing-logo" href="#/">
          <div class="header-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><path d="M9.5 11V9l2.5-2 2.5 2v2h-2v-1.5h-1V11z" fill="white" stroke="none"/></svg>
          </div>
          <div class="header-logo-text">Rentora</div>
        </a>
        <div class="landing-header-actions">
          <button class="landing-header-link" id="landing-login-btn">Log in</button>
          <button class="landing-header-cta" id="landing-signup-btn">Sign up</button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="landing-hero" id="landing-hero">
      <div class="landing-hero-glow" id="hero-glow"></div>
      <div class="landing-hero-particles" id="hero-particles"></div>
      <div class="landing-hero-bg-shapes" id="hero-bg-shapes">
        <div class="landing-shape landing-shape-1"></div>
        <div class="landing-shape landing-shape-2"></div>
        <div class="landing-shape landing-shape-3"></div>
      </div>
      <div class="landing-hero-content">
        <div class="landing-hero-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Trusted by 1,200+ FUTA Students
        </div>
        <h1 class="landing-hero-title">
          Find Your Next Home<br><span>Near Campus</span>
        </h1>
        <p class="landing-hero-subtitle">
          Rentora connects students directly with verified landlords. Browse safe, affordable apartments, self-cons, and rooms — all within walking distance of FUTA.
        </p>
        <div class="landing-hero-buttons">
          <button class="landing-btn-primary" id="hero-browse-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Browse Listings
          </button>
          <button class="landing-btn-secondary" id="hero-signup-btn">
            Get Started Free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
        <div class="landing-hero-stats">
          <div class="landing-hero-stat">
            <span class="landing-stat-number" data-target="500">0</span><span class="landing-stat-plus">+</span>
            <span class="landing-stat-label">Verified Listings</span>
          </div>
          <div class="landing-hero-stat-divider"></div>
          <div class="landing-hero-stat">
            <span class="landing-stat-number" data-target="1200">0</span><span class="landing-stat-plus">+</span>
            <span class="landing-stat-label">Happy Students</span>
          </div>
          <div class="landing-hero-stat-divider"></div>
          <div class="landing-hero-stat">
            <span class="landing-stat-number" data-target="98">0</span><span class="landing-stat-plus">%</span>
            <span class="landing-stat-label">Verified Landlords</span>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="landing-section landing-how-it-works">
      <div class="landing-section-inner">
        <div class="landing-section-header">
          <span class="landing-section-tag">Simple Process</span>
          <h2 class="landing-section-title">How Rentora Works</h2>
          <p class="landing-section-subtitle">From search to move-in, we've streamlined every step of your housing journey.</p>
        </div>
        <div class="landing-steps">
          <div class="landing-step" data-step="1">
            <div class="landing-step-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <div class="landing-step-connector"></div>
            <h3 class="landing-step-title">Search & Discover</h3>
            <p class="landing-step-text">Browse 500+ verified listings near FUTA. Filter by location, budget, and room type to find your perfect match.</p>
          </div>
          <div class="landing-step" data-step="2">
            <div class="landing-step-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>
            </div>
            <div class="landing-step-connector"></div>
            <h3 class="landing-step-title">Book Inspection</h3>
            <p class="landing-step-text">Schedule a visit directly through the app. Chat with landlords, ask questions, and confirm your inspection date.</p>
          </div>
          <div class="landing-step" data-step="3">
            <div class="landing-step-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h3 class="landing-step-title">Move In</h3>
            <p class="landing-step-text">Secure your space with our safe payment system. Get your keys and settle into your new home stress-free.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="landing-section landing-features-section">
      <div class="landing-section-inner">
        <div class="landing-section-header">
          <span class="landing-section-tag">Why Rentora</span>
          <h2 class="landing-section-title">Built for Student Life</h2>
          <p class="landing-section-subtitle">Every feature designed to make your housing search easier, safer, and faster.</p>
        </div>
        <div class="landing-features-grid">
          <div class="landing-feature-card">
            <div class="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <h3 class="landing-feature-title">Verified Listings</h3>
            <p class="landing-feature-text">Every property is verified by our team. No fake listings, no scams — just real homes from real landlords you can trust.</p>
            <div class="landing-feature-tag">Safety First</div>
          </div>
          <div class="landing-feature-card featured">
            <div class="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <h3 class="landing-feature-title">Takeover System</h3>
            <p class="landing-feature-text">Need to leave early? Transfer your lease to another student seamlessly. Earn bonuses for helping others find housing.</p>
            <div class="landing-feature-tag">Unique Feature</div>
          </div>
          <div class="landing-feature-card">
            <div class="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <h3 class="landing-feature-title">Direct Messaging</h3>
            <p class="landing-feature-text">Chat directly with landlords in-app. Ask questions, negotiate, and arrange inspections without sharing your number.</p>
            <div class="landing-feature-tag">Convenient</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="landing-section landing-testimonials-section">
      <div class="landing-section-inner">
        <div class="landing-section-header">
          <span class="landing-section-tag">Student Stories</span>
          <h2 class="landing-section-title">Loved by Students</h2>
          <p class="landing-section-subtitle">Hear from students who found their perfect home through Rentora.</p>
        </div>
        <div class="landing-testimonials">
          <div class="landing-testimonial-card">
            <div class="landing-testimonial-stars">★★★★★</div>
            <p class="landing-testimonial-text">"Rentora saved my 300-level year. I found a verified self-con near South Gate in 2 days! The landlord was responsive and everything matched the listing."</p>
            <div class="landing-testimonial-author">
              <div class="landing-testimonial-avatar" style="background: linear-gradient(135deg, #3B5FD4, #7C3AED);">A</div>
              <div>
                <div class="landing-testimonial-name">Adebayo O.</div>
                <div class="landing-testimonial-role">Computer Science, 300L</div>
              </div>
            </div>
          </div>
          <div class="landing-testimonial-card">
            <div class="landing-testimonial-stars">★★★★★</div>
            <p class="landing-testimonial-text">"The takeover feature is genius! I transferred my remaining 6-month lease when I had to go for IT. Even got a ₦5k bonus. Rentora thinks of everything."</p>
            <div class="landing-testimonial-author">
              <div class="landing-testimonial-avatar" style="background: linear-gradient(135deg, #F59E0B, #EF4444);">F</div>
              <div>
                <div class="landing-testimonial-name">Folake M.</div>
                <div class="landing-testimonial-role">Architecture, 400L</div>
              </div>
            </div>
          </div>
          <div class="landing-testimonial-card">
            <div class="landing-testimonial-stars">★★★★★</div>
            <p class="landing-testimonial-text">"As a landlord, Rentora has been incredible. I fill vacancies within a week now. The verification badge gives students confidence to book immediately."</p>
            <div class="landing-testimonial-author">
              <div class="landing-testimonial-avatar" style="background: linear-gradient(135deg, #22C55E, #3B5FD4);">K</div>
              <div>
                <div class="landing-testimonial-name">Mr. Kunle A.</div>
                <div class="landing-testimonial-role">Landlord, South Gate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Banner -->
    <section class="landing-stats-banner">
      <div class="landing-stats-banner-inner">
        <div class="landing-banner-stat">
          <span class="landing-banner-number" data-target="6">0</span>
          <span class="landing-banner-label">Campus Areas</span>
        </div>
        <div class="landing-banner-stat">
          <span class="landing-banner-number" data-target="200">0</span><span class="landing-banner-plus">+</span>
          <span class="landing-banner-label">Landlords</span>
        </div>
        <div class="landing-banner-stat">
          <span class="landing-banner-number" data-target="50">0</span><span class="landing-banner-plus">K+</span>
          <span class="landing-banner-label">Monthly Visits</span>
        </div>
        <div class="landing-banner-stat">
          <span class="landing-banner-number" data-target="4">0</span><span class="landing-banner-plus">.9★</span>
          <span class="landing-banner-label">Student Rating</span>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="landing-section landing-cta-section">
      <div class="landing-cta-inner">
        <div class="landing-cta-content">
          <h2 class="landing-cta-title">Ready to Find Your<br>Perfect Home?</h2>
          <p class="landing-cta-text">Join thousands of students who found safe, affordable housing near FUTA through Rentora.</p>
          <div class="landing-cta-buttons">
            <button class="landing-btn-primary landing-btn-lg" id="cta-student-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              I'm a Student
            </button>
            <button class="landing-btn-outline landing-btn-lg" id="cta-landlord-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              I'm a Landlord
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

  // Append footer
  page.appendChild(createFooter());

  // --- Event Listeners ---
  page.querySelector('#landing-login-btn').addEventListener('click', () => navigate('/login'));
  page.querySelector('#landing-signup-btn').addEventListener('click', () => navigate('/login'));
  page.querySelector('#hero-browse-btn').addEventListener('click', () => navigate('/home'));
  page.querySelector('#hero-signup-btn').addEventListener('click', () => navigate('/login'));
  page.querySelector('#cta-student-btn').addEventListener('click', () => navigate('/login'));
  page.querySelector('#cta-landlord-btn').addEventListener('click', () => navigate('/login'));

  // === MOUSE TRACKING EFFECT ===
  const hero = page.querySelector('#landing-hero');
  const glow = page.querySelector('#hero-glow');
  const bgShapes = page.querySelector('#hero-bg-shapes');
  const particlesContainer = page.querySelector('#hero-particles');

  // Generate floating particles
  const particleColors = [
    'rgba(90, 124, 232, 0.5)',   // accent blue
    'rgba(167, 139, 250, 0.45)', // purple
    'rgba(59, 95, 212, 0.4)',    // primary blue
    'rgba(245, 158, 11, 0.35)',  // amber
    'rgba(34, 197, 94, 0.3)',    // green
    'rgba(239, 68, 68, 0.25)',   // red
  ];
  const particles = [];
  const PARTICLE_COUNT = 35;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const dot = document.createElement('div');
    dot.className = 'landing-particle';
    const size = 2 + Math.random() * 4;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const color = particleColors[Math.floor(Math.random() * particleColors.length)];
    const depth = 0.3 + Math.random() * 0.7; // parallax depth factor

    dot.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${x}%; top: ${y}%;
        background: ${color};
        border-radius: 50%;
        position: absolute;
        pointer-events: none;
        transition: none;
        will-change: transform;
      `;
    particlesContainer.appendChild(dot);
    particles.push({ el: dot, baseX: x, baseY: y, depth });
  }

  // Mouse state
  let mouseX = 0.5, mouseY = 0.5; // normalized 0-1
  let currentGlowX = 0.5, currentGlowY = 0.5;
  let isMouseInHero = false;
  let rafId = null;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = (e.clientY - rect.top) / rect.height;
    isMouseInHero = true;
  });

  hero.addEventListener('mouseleave', () => {
    isMouseInHero = false;
  });

  // Smooth animation loop
  const lerp = (a, b, t) => a + (b - a) * t;

  function animateMouseTrack() {
    // Smooth interpolation towards mouse position
    const speed = 0.08;
    currentGlowX = lerp(currentGlowX, mouseX, speed);
    currentGlowY = lerp(currentGlowY, mouseY, speed);

    // 1. Radial glow follows cursor
    if (glow) {
      const opacity = isMouseInHero ? 1 : 0;
      glow.style.opacity = opacity;
      glow.style.background = `radial-gradient(600px circle at ${currentGlowX * 100}% ${currentGlowY * 100}%, rgba(90, 124, 232, 0.12), rgba(167, 139, 250, 0.06) 40%, transparent 70%)`;
    }

    // 2. Parallax background shapes
    if (bgShapes) {
      const offsetX = (currentGlowX - 0.5) * 30;
      const offsetY = (currentGlowY - 0.5) * 20;
      bgShapes.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    // 3. Particle parallax
    particles.forEach(p => {
      const dx = (currentGlowX - 0.5) * 40 * p.depth;
      const dy = (currentGlowY - 0.5) * 25 * p.depth;
      p.el.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    rafId = requestAnimationFrame(animateMouseTrack);
  }
  rafId = requestAnimationFrame(animateMouseTrack);

  // Interactive glow on feature & testimonial cards
  page.querySelectorAll('.landing-feature-card, .landing-testimonial-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--card-glow-x', `${x}px`);
      card.style.setProperty('--card-glow-y', `${y}px`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--card-glow-x');
      card.style.removeProperty('--card-glow-y');
    });
  });

  // --- Animated Counters ---
  const animateCounters = () => {
    const counters = page.querySelectorAll('[data-target]');
    counters.forEach(counter => {
      const target = +counter.dataset.target;
      const duration = 2000;
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        counter.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(updateCounter);
        else counter.textContent = target;
      };
      requestAnimationFrame(updateCounter);
    });
  };

  // --- Scroll Reveal Animations ---
  const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('landing-visible');
          // Trigger counters when stats come into view
          if (entry.target.classList.contains('landing-hero-stats') ||
            entry.target.classList.contains('landing-stats-banner')) {
            animateCounters();
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    // Observe animated elements
    page.querySelectorAll('.landing-step, .landing-feature-card, .landing-testimonial-card, .landing-hero-stats, .landing-stats-banner, .landing-cta-content').forEach(el => {
      el.classList.add('landing-animate');
      observer.observe(el);
    });
  };

  // Init observer after DOM insertion
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      observeElements();
      // Auto-trigger hero stats counter on load
      setTimeout(() => {
        const heroStats = page.querySelector('.landing-hero-stats');
        if (heroStats) {
          heroStats.classList.add('landing-visible');
          animateCounters();
        }
      }, 500);
    });
  });

  return page;
}
