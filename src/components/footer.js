export function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-brand-name">Rentora</div>
        <p class="footer-brand-desc">A modern housing platform connecting students directly to landlords. Find verified apartments, rooms, and self-cons near FUTA. Clean, simple, and designed for the way you search for homes.</p>
      </div>
      <div class="footer-column">
        <h3 class="footer-column-title">Quick Links</h3>
        <a href="#/search">Browse Listings</a>
        <a href="#/login">Sign Up</a>
        <a href="#/post-property">List Property</a>
        <a href="#/search?location=FUTA South Gate">South Gate Apartments</a>
        <a href="#/search?location=Roadblock">Roadblock Housing</a>
      </div>
      <div class="footer-column">
        <h3 class="footer-column-title">For Landlords</h3>
        <a href="#/login">Create Account</a>
        <a href="#/post-property">Post Property</a>
        <a href="#/pricing">Pricing</a>
        <a href="#/verification">Verification</a>
        <a href="#/help">Help Center</a>
      </div>
      <div class="footer-column">
        <h3 class="footer-column-title">Rentora</h3>
        <a href="#/about">About Us</a>
        <a href="#/contact">Contact</a>
        <a href="#/privacy">Privacy Policy</a>
        <a href="#/terms">Terms of Service</a>
        <a href="#/blog">Blog</a>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-copy">© 2026 Rentora. Find your next home. All rights reserved.</div>
    </div>
  `;
  return footer;
}
