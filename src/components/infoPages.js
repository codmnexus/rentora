// ============================================
// Rentora — Informational / Static Pages
// ============================================

export function createInfoPage(pageId) {
  const page = document.createElement('div');
  page.className = 'info-page';

  const content = getPageContent(pageId);

  page.innerHTML = `
    <div class="info-hero">
      <div class="info-hero-inner">
        <span class="info-hero-tag">${content.tag}</span>
        <h1 class="info-hero-title">${content.title}</h1>
        <p class="info-hero-subtitle">${content.subtitle}</p>
      </div>
    </div>
    <div class="info-body">
      <div class="info-body-inner">
        ${content.body}
      </div>
    </div>
  `;

  return page;
}

function getPageContent(pageId) {
  const pages = {
    about: {
      tag: 'Our Story',
      title: 'About Rentora',
      subtitle: 'A student-built platform transforming how FUTA students find homes near campus.',
      body: `
        <div class="info-section">
          <h2>Our Mission</h2>
          <p>Rentora was born out of frustration. Every academic session, over 30,000 FUTA students scramble to find affordable, safe housing near campus. The process was chaotic — WhatsApp groups filled with scams, agents charging unfair fees, and zero transparency about property conditions.</p>
          <p>We set out to change that. Rentora is a <strong>free, student-first housing platform</strong> that connects tenants directly with verified landlords. No middlemen, no hidden fees, no guesswork.</p>
        </div>

        <div class="info-section">
          <h2>What Makes Us Different</h2>
          <div class="info-features-grid">
            <div class="info-feature-card">
              <div class="info-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>Verified Landlords</h3>
              <p>Every landlord goes through our verification process. We check property ownership documents and confirm identities before they can list.</p>
            </div>
            <div class="info-feature-card">
              <div class="info-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              </div>
              <h3>Campus Gate Distances</h3>
              <p>Every listing shows exactly how many minutes it takes to walk to FUTA's South and North gates. No more guessing.</p>
            </div>
            <div class="info-feature-card">
              <div class="info-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3>In-App Messaging</h3>
              <p>Chat directly with landlords through Rentora. No need to share phone numbers until you're ready.</p>
            </div>
            <div class="info-feature-card">
              <div class="info-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8l-8 8M8 8l8 8"/></svg>
              </div>
              <h3>Zero Agent Fees</h3>
              <p>Rentora is completely free for students. We don't charge tenants anything — ever. Landlords pay a small optional fee for premium visibility.</p>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>Our Story</h2>
          <p>Rentora started in 2025 as a side project by a group of FUTA students who were tired of getting scammed by fake agents. What began as a simple spreadsheet of verified landlords grew into the platform you see today.</p>
          <p>In our first year, we helped over 1,200 students find safe, affordable housing near campus. We verified over 200 landlords and listed 500+ properties across Akure's most popular student neighbourhoods — from South Gate and Roadblock to Aule and Oba Ile.</p>
          <p>We're still students ourselves, and we build Rentora with the same urgency and care we'd want from a platform we use every day.</p>
        </div>

        <div class="info-section">
          <h2>The Team</h2>
          <div class="info-team-grid">
            <div class="info-team-card">
              <div class="info-team-avatar">O</div>
              <h4>Oluwaseun Adeyemi</h4>
              <p class="info-team-role">Founder & Lead Developer</p>
              <p>Computer Science, 400L</p>
            </div>
            <div class="info-team-card">
              <div class="info-team-avatar">A</div>
              <h4>Aisha Bello</h4>
              <p class="info-team-role">Head of Operations</p>
              <p>Business Administration, 300L</p>
            </div>
            <div class="info-team-card">
              <div class="info-team-avatar">C</div>
              <h4>Chinedu Okonkwo</h4>
              <p class="info-team-role">Product Designer</p>
              <p>Industrial Design, 500L</p>
            </div>
            <div class="info-team-card">
              <div class="info-team-avatar">F</div>
              <h4>Fatima Abdullahi</h4>
              <p class="info-team-role">Community Manager</p>
              <p>Mass Communication, 400L</p>
            </div>
          </div>
        </div>
      `
    },

    contact: {
      tag: 'Get in Touch',
      title: 'Contact Us',
      subtitle: 'Have a question, feedback, or partnership idea? We\'d love to hear from you.',
      body: `
        <div class="info-contact-grid">
          <div class="info-contact-form-wrap">
            <h2>Send Us a Message</h2>
            <form class="info-contact-form" id="contact-form">
              <div class="info-form-row">
                <div class="info-form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="Your name" required />
                </div>
                <div class="info-form-group">
                  <label>Email</label>
                  <input type="email" placeholder="you@email.com" required />
                </div>
              </div>
              <div class="info-form-group">
                <label>Subject</label>
                <select>
                  <option value="">Select a topic</option>
                  <option>General Inquiry</option>
                  <option>Report a Problem</option>
                  <option>Landlord Verification</option>
                  <option>Partnership & Sponsorship</option>
                  <option>Feature Request</option>
                  <option>Account Issue</option>
                </select>
              </div>
              <div class="info-form-group">
                <label>Message</label>
                <textarea rows="5" placeholder="Tell us how we can help..." required></textarea>
              </div>
              <button type="submit" class="info-submit-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
                Send Message
              </button>
            </form>
          </div>

          <div class="info-contact-sidebar">
            <div class="info-contact-card">
              <div class="info-contact-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg>
              </div>
              <h4>Email Us</h4>
              <p>support@rentora.ng</p>
              <p class="info-contact-note">We respond within 24 hours</p>
            </div>

            <div class="info-contact-card">
              <div class="info-contact-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <h4>Call Us</h4>
              <p>+234 812 345 6789</p>
              <p class="info-contact-note">Mon – Fri, 9AM – 5PM</p>
            </div>

            <div class="info-contact-card">
              <div class="info-contact-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              </div>
              <h4>Visit Us</h4>
              <p>FUTA South Gate, Akure<br>Ondo State, Nigeria</p>
              <p class="info-contact-note">By appointment only</p>
            </div>

            <div class="info-contact-card">
              <div class="info-contact-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <h4>Office Hours</h4>
              <p>Monday – Friday: 9:00 AM – 5:00 PM<br>Saturday: 10:00 AM – 2:00 PM<br>Sunday: Closed</p>
            </div>
          </div>
        </div>
      `
    },

    privacy: {
      tag: 'Legal',
      title: 'Privacy Policy',
      subtitle: 'Last updated: March 1, 2026. Your privacy matters to us — here\'s exactly how we handle your data.',
      body: `
        <div class="info-legal">
          <div class="info-legal-nav">
            <h3>Contents</h3>
            <ol>
              <li><a href="#info-s1">Information We Collect</a></li>
              <li><a href="#info-s2">How We Use Your Information</a></li>
              <li><a href="#info-s3">Information Sharing</a></li>
              <li><a href="#info-s4">Data Security</a></li>
              <li><a href="#info-s5">Your Rights</a></li>
              <li><a href="#info-s6">Cookies</a></li>
              <li><a href="#info-s7">Changes to This Policy</a></li>
              <li><a href="#info-s8">Contact Us</a></li>
            </ol>
          </div>

          <div class="info-legal-content">
            <section id="info-s1">
              <h2>1. Information We Collect</h2>
              <p>When you create a Rentora account, we collect the following information:</p>
              <ul>
                <li><strong>Account Information:</strong> Full name, email address, phone number, and password (encrypted). For students, we may also collect your department, level, and campus preferences.</li>
                <li><strong>Profile Information:</strong> Budget range, preferred areas, gender preference for roommates, and student ID (if uploaded for verification).</li>
                <li><strong>Property Data:</strong> If you're a landlord, we collect property details including location, pricing, photos, and amenities.</li>
                <li><strong>Usage Data:</strong> Pages viewed, searches performed, properties saved, and messages sent through the platform.</li>
                <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers for security purposes.</li>
              </ul>
            </section>

            <section id="info-s2">
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our housing platform</li>
                <li>Match students with suitable listings based on preferences</li>
                <li>Enable in-app messaging between tenants and landlords</li>
                <li>Send notifications about inspection bookings, new listings, and account activity</li>
                <li>Verify landlord identities and property ownership</li>
                <li>Detect and prevent fraud, scams, and fake listings</li>
                <li>Generate anonymized analytics to improve our service</li>
              </ul>
            </section>

            <section id="info-s3">
              <h2>3. Information Sharing</h2>
              <p>We do <strong>not</strong> sell your personal data. We share information only in these cases:</p>
              <ul>
                <li><strong>Between Users:</strong> Your name and messages are shared with users you interact with on our platform. Phone numbers are never shared without your explicit consent.</li>
                <li><strong>Service Providers:</strong> We use third-party services for hosting, analytics, and payment processing. These providers are contractually bound to protect your data.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by Nigerian law, court order, or to protect the safety of our users.</li>
              </ul>
            </section>

            <section id="info-s4">
              <h2>4. Data Security</h2>
              <p>We implement industry-standard security measures to protect your data:</p>
              <ul>
                <li>Passwords are hashed and salted — we never store plain-text passwords</li>
                <li>All data transmission uses HTTPS encryption</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access to user data is restricted to authorized team members only</li>
              </ul>
              <p>While we strive to protect your information, no method of electronic transmission is 100% secure. We encourage you to use strong, unique passwords.</p>
            </section>

            <section id="info-s5">
              <h2>5. Your Rights</h2>
              <p>Under the Nigeria Data Protection Regulation (NDPR), you have the right to:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request permanent deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Opt out of marketing communications at any time</li>
              </ul>
              <p>To exercise any of these rights, email us at <strong>privacy@rentora.ng</strong>.</p>
            </section>

            <section id="info-s6">
              <h2>6. Cookies</h2>
              <p>Rentora uses localStorage (not cookies) to store your session data and preferences locally on your device. This data is never transmitted to external servers and can be cleared at any time through your browser settings.</p>
            </section>

            <section id="info-s7">
              <h2>7. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. When we make changes, we'll update the "Last updated" date at the top and notify you via the platform. Continued use of Rentora after changes constitutes acceptance of the updated policy.</p>
            </section>

            <section id="info-s8">
              <h2>8. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy or our data practices, contact us at:</p>
              <ul>
                <li>Email: <strong>privacy@rentora.ng</strong></li>
                <li>Phone: <strong>+234 812 345 6789</strong></li>
                <li>Address: <strong>FUTA South Gate, Akure, Ondo State, Nigeria</strong></li>
              </ul>
            </section>
          </div>
        </div>
      `
    },

    terms: {
      tag: 'Legal',
      title: 'Terms of Service',
      subtitle: 'Last updated: March 1, 2026. By using Rentora, you agree to these terms.',
      body: `
        <div class="info-legal">
          <div class="info-legal-nav">
            <h3>Contents</h3>
            <ol>
              <li><a href="#info-t1">Acceptance of Terms</a></li>
              <li><a href="#info-t2">User Accounts</a></li>
              <li><a href="#info-t3">Property Listings</a></li>
              <li><a href="#info-t4">Messaging & Communication</a></li>
              <li><a href="#info-t5">Payments & Fees</a></li>
              <li><a href="#info-t6">Prohibited Conduct</a></li>
              <li><a href="#info-t7">Room Takeovers</a></li>
              <li><a href="#info-t8">Limitation of Liability</a></li>
              <li><a href="#info-t9">Dispute Resolution</a></li>
              <li><a href="#info-t10">Termination</a></li>
            </ol>
          </div>

          <div class="info-legal-content">
            <section id="info-t1">
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing or using Rentora ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Platform. These terms apply to all users — students, landlords, and visitors.</p>
              <p>Rentora reserves the right to modify these terms at any time. Continued use after changes constitutes acceptance.</p>
            </section>

            <section id="info-t2">
              <h2>2. User Accounts</h2>
              <ul>
                <li>You must provide accurate and complete information when creating an account.</li>
                <li>You are responsible for maintaining the security of your account credentials.</li>
                <li>You must be at least 16 years old to use Rentora.</li>
                <li>One account per person — duplicate accounts may be suspended.</li>
                <li>Landlord accounts require verification before listings are published.</li>
              </ul>
            </section>

            <section id="info-t3">
              <h2>3. Property Listings</h2>
              <p>Landlords who list properties on Rentora agree to the following:</p>
              <ul>
                <li>All listing information (price, photos, amenities, location) must be accurate and current.</li>
                <li>Photos must be of the actual property — stock images or photos of different properties are prohibited.</li>
                <li>Listings are subject to admin review and approval before going live.</li>
                <li>Rentora may remove or suspend listings that receive verified reports of inaccuracy or fraud.</li>
                <li>Prices listed must be the full annual rent — hidden fees are not permitted.</li>
              </ul>
            </section>

            <section id="info-t4">
              <h2>4. Messaging & Communication</h2>
              <ul>
                <li>All initial communication between tenants and landlords must happen through Rentora's in-app messaging system.</li>
                <li>Messages are stored on the platform and may be reviewed in case of disputes or reports.</li>
                <li>Harassment, threats, discriminatory language, and spam are strictly prohibited.</li>
                <li>Users who abuse the messaging system may be permanently banned.</li>
              </ul>
            </section>

            <section id="info-t5">
              <h2>5. Payments & Fees</h2>
              <ul>
                <li>Rentora is <strong>free for students</strong>. There are no fees for searching, messaging, or booking inspections.</li>
                <li>Landlords may optionally subscribe to a Premium plan for enhanced listing visibility.</li>
                <li>When payment features are active, Rentora acts as a facilitator — not a party to rental agreements between tenants and landlords.</li>
                <li>Escrow payments (when available) are held by our licensed payment partner until both parties confirm move-in.</li>
              </ul>
            </section>

            <section id="info-t6">
              <h2>6. Prohibited Conduct</h2>
              <p>The following activities are strictly prohibited on Rentora:</p>
              <ul>
                <li>Posting fake, misleading, or fraudulent listings</li>
                <li>Impersonating another person or entity</li>
                <li>Attempting to bypass the messaging system to collect or share personal contact information without consent</li>
                <li>Using the platform for illegal activities, including money laundering or advance-fee fraud</li>
                <li>Automated scraping, data harvesting, or bot activity</li>
                <li>Discriminating against tenants based on ethnicity, religion, gender, or disability</li>
              </ul>
              <p>Violations may result in immediate account termination and referral to law enforcement where applicable.</p>
            </section>

            <section id="info-t7">
              <h2>7. Room Takeovers</h2>
              <p>Rentora's Room Takeover feature allows students to transfer their lease to another student:</p>
              <ul>
                <li>The outgoing tenant must have the landlord's consent for the takeover.</li>
                <li>Takeover listings are subject to the same accuracy and review standards as property listings.</li>
                <li>The ₦5,000 incentive is paid to the outgoing tenant after successful takeover confirmation.</li>
                <li>Rentora does not guarantee the success of any takeover transaction.</li>
              </ul>
            </section>

            <section id="info-t8">
              <h2>8. Limitation of Liability</h2>
              <p>Rentora provides a platform to connect tenants and landlords. We do <strong>not</strong>:</p>
              <ul>
                <li>Own, manage, or inspect any listed properties</li>
                <li>Guarantee the accuracy of any listing information</li>
                <li>Act as a party to rental agreements</li>
                <li>Provide legal, financial, or real estate advice</li>
              </ul>
              <p>Users are encouraged to physically inspect properties and verify all claims before making any financial commitments. Rentora is not liable for any loss, damage, or dispute arising from transactions between users.</p>
            </section>

            <section id="info-t9">
              <h2>9. Dispute Resolution</h2>
              <p>If a dispute arises between users, Rentora encourages resolution through our in-app reporting system. Our admin team will review reported issues and may take the following actions:</p>
              <ul>
                <li>Issue warnings to offending parties</li>
                <li>Suspend or remove listings</li>
                <li>Ban users who repeatedly violate these terms</li>
              </ul>
              <p>For disputes that cannot be resolved through the platform, the laws of the Federal Republic of Nigeria shall apply, and the courts of Ondo State shall have jurisdiction.</p>
            </section>

            <section id="info-t10">
              <h2>10. Termination</h2>
              <p>Rentora reserves the right to suspend or terminate your account at any time, with or without notice, for conduct that we determine violates these Terms of Service or is harmful to other users or the platform.</p>
              <p>Upon termination, your right to use the platform ceases immediately. We may retain certain data as required by law or for legitimate business purposes.</p>
            </section>
          </div>
        </div>
      `
    },

    blog: {
      tag: 'Rentora Blog',
      title: 'Student Housing Tips & News',
      subtitle: 'Guides, updates, and stories from the Rentora community.',
      body: `
        <div class="info-blog-grid">
          <article class="info-blog-card info-blog-featured">
            <div class="info-blog-img" style="background: linear-gradient(135deg, #667eea30, #764ba230); display:flex; align-items:center; justify-content:center;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(102,126,234,0.6)" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            </div>
            <div class="info-blog-body">
              <span class="info-blog-tag">Guide</span>
              <h3>Complete Guide to Finding Housing Near FUTA in 2026</h3>
              <p>Everything you need to know about finding a room, self-con, or flat near campus — from budgeting to area comparisons, inspection tips, and common scams to avoid.</p>
              <div class="info-blog-meta">
                <span>Oluwaseun Adeyemi</span>
                <span>March 5, 2026</span>
                <span>12 min read</span>
              </div>
            </div>
          </article>

          <article class="info-blog-card">
            <div class="info-blog-img" style="background: linear-gradient(135deg, #f093fb30, #f5576c30); display:flex; align-items:center; justify-content:center;">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(240,147,251,0.6)" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="info-blog-body">
              <span class="info-blog-tag">Safety</span>
              <h3>7 Red Flags When Renting Off-Campus</h3>
              <p>Learn to spot scam landlords, fake listings, and hidden charges before they cost you money.</p>
              <div class="info-blog-meta">
                <span>Aisha Bello</span>
                <span>Feb 28, 2026</span>
                <span>6 min read</span>
              </div>
            </div>
          </article>

          <article class="info-blog-card">
            <div class="info-blog-img" style="background: linear-gradient(135deg, #4facfe30, #00f2fe30); display:flex; align-items:center; justify-content:center;">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(79,172,254,0.6)" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            </div>
            <div class="info-blog-body">
              <span class="info-blog-tag">Tips</span>
              <h3>How to Negotiate Rent Like a Pro</h3>
              <p>Practical strategies for getting the best deal on your next apartment, including when and how to ask.</p>
              <div class="info-blog-meta">
                <span>Chinedu Okonkwo</span>
                <span>Feb 20, 2026</span>
                <span>5 min read</span>
              </div>
            </div>
          </article>

          <article class="info-blog-card">
            <div class="info-blog-img" style="background: linear-gradient(135deg, #a8edea30, #fed6e330); display:flex; align-items:center; justify-content:center;">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(168,237,234,0.6)" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="info-blog-body">
              <span class="info-blog-tag">Community</span>
              <h3>Finding the Right Roommate: A FUTA Student's Guide</h3>
              <p>How to vet potential roommates, set expectations, and avoid common conflicts in shared housing.</p>
              <div class="info-blog-meta">
                <span>Fatima Abdullahi</span>
                <span>Feb 14, 2026</span>
                <span>7 min read</span>
              </div>
            </div>
          </article>

          <article class="info-blog-card">
            <div class="info-blog-img" style="background: linear-gradient(135deg, #ffecd230, #fcb69f30); display:flex; align-items:center; justify-content:center;">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(252,182,159,0.6)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            </div>
            <div class="info-blog-body">
              <span class="info-blog-tag">Update</span>
              <h3>Room Takeovers: How the ₦5k Incentive Works</h3>
              <p>We launched room takeovers! Here's how you can earn ₦5,000 by helping the next student find housing.</p>
              <div class="info-blog-meta">
                <span>Oluwaseun Adeyemi</span>
                <span>Feb 8, 2026</span>
                <span>4 min read</span>
              </div>
            </div>
          </article>

          <article class="info-blog-card">
            <div class="info-blog-img" style="background: linear-gradient(135deg, #c3cfe230, #f5f7fa30); display:flex; align-items:center; justify-content:center;">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(195,207,226,0.6)" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div class="info-blog-body">
              <span class="info-blog-tag">Area Guide</span>
              <h3>South Gate vs Roadblock vs Aule: Which Area is Best?</h3>
              <p>An honest comparison of Akure's top student neighbourhoods — prices, safety, distance, and nightlife.</p>
              <div class="info-blog-meta">
                <span>Aisha Bello</span>
                <span>Jan 30, 2026</span>
                <span>9 min read</span>
              </div>
            </div>
          </article>
        </div>
      `
    },

    pricing: {
      tag: 'Plans & Pricing',
      title: 'Simple, Transparent Pricing',
      subtitle: 'Free for students — always. Affordable plans for landlords who want more visibility.',
      body: `
        <div class="info-pricing-grid">
          <div class="info-pricing-card">
            <div class="info-pricing-header">
              <h3>Free</h3>
              <div class="info-pricing-price">₦0<span>/forever</span></div>
              <p class="info-pricing-desc">For students searching for housing</p>
            </div>
            <ul class="info-pricing-features">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Browse all verified listings</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Message landlords directly</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Book property inspections</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Save favourite listings</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Write reviews & ratings</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Room takeover access</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Campus gate distances</li>
            </ul>
            <a href="#/login" class="info-pricing-btn info-pricing-btn-secondary">Get Started Free</a>
          </div>

          <div class="info-pricing-card info-pricing-featured">
            <div class="info-pricing-badge">Most Popular</div>
            <div class="info-pricing-header">
              <h3>Landlord Basic</h3>
              <div class="info-pricing-price">₦0<span>/listing</span></div>
              <p class="info-pricing-desc">For landlords listing properties</p>
            </div>
            <ul class="info-pricing-features">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> List up to 3 properties</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> In-app messaging with tenants</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Inspection management</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Verified landlord badge</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Property analytics</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.4)" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> <span style="opacity:.5">Priority placement</span></li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.4)" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> <span style="opacity:.5">Featured badge</span></li>
            </ul>
            <a href="#/login" class="info-pricing-btn info-pricing-btn-primary">Create Account</a>
          </div>

          <div class="info-pricing-card">
            <div class="info-pricing-header">
              <h3>Landlord Premium</h3>
              <div class="info-pricing-price">₦5,000<span>/month</span></div>
              <p class="info-pricing-desc">For landlords who want maximum visibility</p>
            </div>
            <ul class="info-pricing-features">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Unlimited property listings</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Everything in Basic</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Priority placement in search</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Featured badge on listings</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Advanced analytics dashboard</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Dedicated support</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg> Social media promotion</li>
            </ul>
            <a href="#/login" class="info-pricing-btn info-pricing-btn-secondary">Contact Sales</a>
          </div>
        </div>

        <div class="info-section" style="text-align:center; margin-top: 3rem;">
          <h2>Frequently Asked Questions</h2>
          <div class="info-faq">
            <details class="info-faq-item">
              <summary>Is Rentora really free for students?</summary>
              <p>Yes, 100%. Students can browse listings, message landlords, book inspections, and leave reviews without paying a single naira. We will never charge students.</p>
            </details>
            <details class="info-faq-item">
              <summary>What do landlords get with the free plan?</summary>
              <p>Free landlord accounts get up to 3 property listings, in-app messaging, inspection management, and a verified badge. It's everything you need to fill your properties.</p>
            </details>
            <details class="info-faq-item">
              <summary>Can I cancel Premium anytime?</summary>
              <p>Absolutely. Premium is month-to-month with no long-term contracts. Cancel anytime and your plan will revert to Basic at the end of the billing period.</p>
            </details>
          </div>
        </div>
      `
    },

    verification: {
      tag: 'Trust & Safety',
      title: 'Landlord Verification',
      subtitle: 'How we verify landlords and protect students from scams.',
      body: `
        <div class="info-section">
          <h2>Why Verification Matters</h2>
          <p>Housing scams are a serious problem near university campuses. Students lose thousands of naira every year to fake listings, fraudulent agents, and unverified landlords. Rentora's verification system is designed to eliminate these risks.</p>
          <p>Verified landlords get a <span style="color:#10b981; font-weight:600;">✓ Verified</span> badge on their listings, giving students confidence that they're dealing with a real, accountable property owner.</p>
        </div>

        <div class="info-section">
          <h2>How It Works</h2>
          <div class="info-steps-vertical">
            <div class="info-step-v">
              <div class="info-step-v-num">1</div>
              <div class="info-step-v-content">
                <h3>Create a Landlord Account</h3>
                <p>Sign up on Rentora with your full name, email, and phone number. Select "Landlord" as your account type.</p>
              </div>
            </div>
            <div class="info-step-v">
              <div class="info-step-v-num">2</div>
              <div class="info-step-v-content">
                <h3>Submit Verification Documents</h3>
                <p>Upload a valid government-issued ID (NIN, driver's license, or international passport) and proof of property ownership or management authorization.</p>
              </div>
            </div>
            <div class="info-step-v">
              <div class="info-step-v-num">3</div>
              <div class="info-step-v-content">
                <h3>Admin Review</h3>
                <p>Our team reviews your documents within 24–48 hours. We verify your identity and confirm that the property information matches your submissions.</p>
              </div>
            </div>
            <div class="info-step-v">
              <div class="info-step-v-num">4</div>
              <div class="info-step-v-content">
                <h3>Get Verified</h3>
                <p>Once approved, your account receives the Verified badge. All your current and future listings will display the badge, and students will see you higher in search results.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>What We Check</h2>
          <div class="info-features-grid">
            <div class="info-feature-card">
              <div class="info-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
              </div>
              <h3>Identity Verification</h3>
              <p>We confirm that you are who you say you are using government-issued identification documents.</p>
            </div>
            <div class="info-feature-card">
              <div class="info-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h3>Property Ownership</h3>
              <p>We verify that you own or are authorized to rent out the property through documentation review.</p>
            </div>
            <div class="info-feature-card">
              <div class="info-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
              </div>
              <h3>Contact Verification</h3>
              <p>We confirm that the phone number and email on your account are active and reachable.</p>
            </div>
            <div class="info-feature-card">
              <div class="info-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>Ongoing Monitoring</h3>
              <p>Verified status can be revoked if a landlord receives multiple verified reports of fraud or misconduct.</p>
            </div>
          </div>
        </div>

        <div class="info-section" style="text-align:center;">
          <h2>Ready to Get Verified?</h2>
          <p style="max-width:500px; margin: 0 auto 1.5rem;">Join 200+ verified landlords on Rentora and start connecting with FUTA students looking for housing.</p>
          <a href="#/login" class="info-cta-btn">Create Landlord Account →</a>
        </div>
      `
    },

    help: {
      tag: 'Support',
      title: 'Help Center',
      subtitle: 'Find answers to common questions or get in touch with our support team.',
      body: `
        <div class="info-section">
          <h2>Frequently Asked Questions</h2>
          <div class="info-faq">
            <details class="info-faq-item" open>
              <summary>How do I create an account?</summary>
              <p>Click "Sign up" in the top right corner, fill in your name, email, phone number, and password. Select whether you're a student or landlord, and you're good to go! Students can also fill in their department, budget preferences, and preferred areas.</p>
            </details>
            <details class="info-faq-item">
              <summary>How do I search for properties?</summary>
              <p>Use the search bar on the homepage to search by area (e.g., "South Gate", "Roadblock"). You can also filter by room type, price range, distance from campus, and whether the property is furnished.</p>
            </details>
            <details class="info-faq-item">
              <summary>How do I contact a landlord?</summary>
              <p>On any property detail page, click "Message Landlord" to start a conversation. All messaging happens within Rentora — you don't need to share your phone number.</p>
            </details>
            <details class="info-faq-item">
              <summary>How do I book an inspection?</summary>
              <p>On the property detail page, click "Book Inspection". Choose a date and time, add any notes about your visit, and the landlord will receive a notification. You can track your inspection status in your dashboard.</p>
            </details>
            <details class="info-faq-item">
              <summary>What is a Room Takeover?</summary>
              <p>A room takeover lets you take over another student's lease when they move out. It's perfect for students who need housing mid-session. The outgoing student posts their room, and you can apply to take over. There's even a ₦5,000 incentive for successful takeovers!</p>
            </details>
            <details class="info-faq-item">
              <summary>How do I report a fake listing?</summary>
              <p>On any property or takeover detail page, click the "Report" button. Select a reason (Fake listing, Scam, Inappropriate, or Other) and provide details. Our admin team reviews every report within 24 hours.</p>
            </details>
            <details class="info-faq-item">
              <summary>How does landlord verification work?</summary>
              <p>Landlords submit government-issued ID and proof of property ownership. Our team reviews documents within 24–48 hours. Verified landlords get a green checkmark badge on their listings. <a href="#/verification">Learn more about verification →</a></p>
            </details>
            <details class="info-faq-item">
              <summary>Is Rentora free?</summary>
              <p>Yes! Rentora is completely free for students. Landlords can list up to 3 properties for free. We offer an optional Premium plan for landlords who want more visibility. <a href="#/pricing">See pricing →</a></p>
            </details>
            <details class="info-faq-item">
              <summary>How do reviews work?</summary>
              <p>After interacting with a property (booking an inspection or messaging the landlord), you can leave a star rating (1–5) and a written review on the property detail page. Reviews help other students make informed decisions.</p>
            </details>
            <details class="info-faq-item">
              <summary>Can I save listings for later?</summary>
              <p>Yes! Click the heart icon on any property card to save it. You can view all your saved listings in the "Saved" tab of your tenant dashboard.</p>
            </details>
          </div>
        </div>

        <div class="info-section">
          <h2>Still Need Help?</h2>
          <div class="info-features-grid" style="max-width: 700px;">
            <div class="info-feature-card">
              <div class="info-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg>
              </div>
              <h3>Email Support</h3>
              <p>Send us a message at <strong>support@rentora.ng</strong> and we'll respond within 24 hours.</p>
            </div>
            <div class="info-feature-card">
              <div class="info-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3>Live Chat</h3>
              <p>Chat with our support team Monday – Friday, 9 AM – 5 PM. Click the <a href="#/contact">Contact page</a> to start.</p>
            </div>
          </div>
        </div>
      `
    }
  };

  return pages[pageId] || {
    tag: 'Page',
    title: 'Page Not Found',
    subtitle: 'The page you\'re looking for doesn\'t exist.',
    body: '<div class="info-section" style="text-align:center"><p>Try going back to the <a href="#/">homepage</a>.</p></div>'
  };
}
