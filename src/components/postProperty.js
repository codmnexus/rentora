import { getCurrentUser, createProperty } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import { MAX_LENGTHS, escapeHTML } from '../utils/authSecurity.js';

export async function createPostProperty() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'landlord' && user.role !== 'admin')) { navigate('/login'); return document.createElement('div'); }

  // Inject component-specific styles dynamically
  injectPostPropertyStyles();

  const page = document.createElement('div');
  page.className = 'post-property';

  page.innerHTML = `
    <h1>List Your Property</h1>
    <p class="subtitle">Fill in the details below to list your property for FUTA students</p>

    <div class="form-card">
      <div class="form-card-title">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.17 7.83L10 1l6.83 6.83V17a2 2 0 01-2 2H5.17a2 2 0 01-2-2V7.83z"/></svg>
        Basic Information
      </div>
      <div class="form-group">
        <label class="form-label">Property Title</label>
        <input type="text" class="form-input" id="pp-title" placeholder="e.g. Spacious Self-Con near FUTA South Gate" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Property Type</label>
          <select class="form-select" id="pp-type">
            <option value="Self-con">Self-con</option>
            <option value="Single room">Single Room</option>
            <option value="Flat">Flat</option>
            <option value="Shared room">Shared Room</option>
            <option value="Studio">Studio</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Area / Location</label>
          <select class="form-select" id="pp-area">
            <option value="FUTA South Gate">FUTA South Gate</option>
            <option value="FUTA North Gate">FUTA North Gate</option>
            <option value="Roadblock">Roadblock</option>
            <option value="Ijapo Estate">Ijapo Estate</option>
            <option value="Oba Ile">Oba Ile</option>
            <option value="Aule">Aule</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Full Address</label>
        <input type="text" class="form-input" id="pp-address" placeholder="e.g. 14 Abiola Street, South Gate, Akure" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Price (₦ per year)</label>
          <input type="number" class="form-input" id="pp-price" placeholder="e.g. 150000" />
        </div>
        <div class="form-group">
          <label class="form-label">Rooms Available</label>
          <input type="number" class="form-input" id="pp-rooms" placeholder="e.g. 3" min="1" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Distance from FUTA (km)</label>
          <input type="number" class="form-input" id="pp-distance" placeholder="e.g. 0.5" step="0.1" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">Furnished?</label>
          <select class="form-select" id="pp-furnished">
            <option value="false">No</option>
            <option value="true">Yes - Furnished</option>
          </select>
        </div>
      </div>
    </div>

    <div class="form-card">
      <div class="form-card-title">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z"/><path d="M10 10h.01"/></svg>
        Description
      </div>
      <div class="form-group">
        <label class="form-label">Property Description</label>
        <textarea class="form-textarea" id="pp-description" placeholder="Describe your property, its features, and what makes it great for students..."></textarea>
      </div>
    </div>

    <div class="form-card">
      <div class="form-card-title">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M7 10l2.5 2.5L13 8"/></svg>
        Amenities & Offers
      </div>
      <div class="amenities-checkboxes" id="pp-amenities">
        ${['Water supply', 'Security', 'Tiled floors', 'Fence & gate', 'Parking space', 'Good ventilation', 'AC', 'Prepaid meter',
      'Kitchen', 'Furnished', 'Wifi ready', 'POP ceiling', 'Water heater', 'Generator backup', 'Ensuite rooms', 'Close to campus',
      'Reading room', 'Fire pit', 'Balcony', 'Good road'].map(a => `
          <label class="amenity-checkbox"><input type="checkbox" value="${a}" /> ${a}</label>
        `).join('')}
      </div>
    </div>

    <!-- Verification Videos Card -->
    <div class="form-card" id="pp-videos-card">
      <div class="form-card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
        Anti-Fraud Verification Videos
      </div>
      <p class="subtitle" style="font-size:13px;margin-bottom:16px;color:var(--color-gray-500)">
        To prevent student housing fraud, a general property walkthrough video is always required. Checking certain amenities will also trigger additional mandatory video proof uploads.
      </p>
      <div class="video-uploads-list" id="video-uploads-list"></div>
    </div>

    <div class="form-card">
      <div class="form-card-title">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="16" height="16" rx="2"/><circle cx="7" cy="7" r="2"/><path d="M18 14l-5-5L2 18"/></svg>
        Photos
      </div>
      <div class="image-upload-area" id="upload-area">
        <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="32" height="32" rx="4"/><circle cx="14" cy="14" r="4"/><path d="M36 28L26 18 4 36"/></svg>
        <p style="font-weight:600;margin-top:8px">Click to upload photos</p>
        <p style="font-size:12px">JPG, PNG up to 5MB each</p>
        <input type="file" id="pp-images" multiple accept="image/*" style="display:none" />
      </div>
      <div class="image-previews" id="image-previews"></div>
    </div>

    <div class="form-error" id="pp-error" style="display:none;margin-bottom:16px;font-size:14px"></div>
    <button class="form-submit" id="pp-submit">Submit Property for Review</button>
    <p style="text-align:center;margin-top:12px;font-size:12px;color:var(--color-gray-400)">Your listing will be reviewed by our team before going live</p>
  `;

  // Image Upload Logic
  const uploadArea = page.querySelector('#upload-area');
  const fileInput = page.querySelector('#pp-images');
  const previews = page.querySelector('#image-previews');
  let uploadedImages = [];

  uploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (!MAX_LENGTHS.allowedImageTypes.includes(file.type)) {
        showToast(`Invalid file type: ${file.name}. Only JPG, PNG, WebP, GIF allowed.`, 'error');
        continue;
      }
      if (file.size > MAX_LENGTHS.maxFileSize) {
        showToast(`File too large: ${file.name}. Max 5MB per file.`, 'error');
        continue;
      }
      if (uploadedImages.length >= MAX_LENGTHS.maxFiles) {
        showToast(`Maximum ${MAX_LENGTHS.maxFiles} images allowed.`, 'error');
        break;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        uploadedImages.push(ev.target.result);
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.innerHTML = `<img src="${ev.target.result}" alt="Preview" /><div class="image-preview-remove">×</div>`;
        preview.querySelector('.image-preview-remove').addEventListener('click', () => {
          const idx = uploadedImages.indexOf(ev.target.result);
          if (idx > -1) uploadedImages.splice(idx, 1);
          preview.remove();
        });
        previews.appendChild(preview);
      };
      reader.readAsDataURL(file);
    }
  });

  // Dynamic Video Verification States
  const videosList = page.querySelector('#video-uploads-list');
  const amenitiesContainer = page.querySelector('#pp-amenities');
  let uploadedVideos = {}; // map of key -> base64 data url

  // Set up video rules mapping
  const videoRules = [
    {
      key: 'general',
      label: 'General Property Walkthrough',
      triggerAmenities: [], // empty trigger means always active/visible!
      isOptional: false,
      description: 'Record a brief 15s to 30s video showing a tour of the overall property and room layout. This video is required for all listings.'
    },
    {
      key: 'water',
      label: 'Water running from the room taps',
      triggerAmenities: ['Water supply'],
      isOptional: false,
      description: 'Record a 10s video showing clear running water flowing from the kitchen/bathroom taps.'
    },
    {
      key: 'compound',
      label: 'Compound, perimeter fence & gates',
      triggerAmenities: ['Security', 'Fence & gate', 'Good road'],
      isOptional: false,
      description: 'Record a clip showing the compound landscape, secure gates, and perimeter fencing.'
    },
    {
      key: 'electricity',
      label: 'Electricity & power source (prepaid meter/generator check)',
      triggerAmenities: ['AC', 'Prepaid meter', 'Generator backup', 'Water heater'],
      isOptional: false,
      description: 'Record a clip verifying the prepaid meter reading, backup generator, or AC fittings in working order.'
    }
  ];

  function updateRequiredVideos() {
    const checkedAmenities = Array.from(amenitiesContainer.querySelectorAll('input:checked')).map(i => i.value);
    
    // Determine active requirements (include general walkthrough by default)
    const activeRules = videoRules.filter(rule => 
      rule.key === 'general' || rule.triggerAmenities.some(amenity => checkedAmenities.includes(amenity))
    );

    // Synchronize DOM elements (add new requirements, remove old ones)
    // To preserve uploaded files, we only redraw boxes if the requirements count changed
    const currentKeysInDOM = Array.from(videosList.querySelectorAll('.video-upload-row')).map(row => row.dataset.key);
    const activeKeys = activeRules.map(r => r.key);

    const isMatching = currentKeysInDOM.length === activeKeys.length && currentKeysInDOM.every(k => activeKeys.includes(k));
    if (isMatching) return;

    // Draw the required elements cleanly
    videosList.innerHTML = '';
    activeRules.forEach(rule => {
      const isUploaded = !!uploadedVideos[rule.key];
      const isOptional = !!rule.isOptional;
      const row = document.createElement('div');
      row.className = 'video-upload-row';
      row.dataset.key = rule.key;
      row.innerHTML = `
        <div class="video-row-header">
          <div class="video-row-info">
            <span class="video-row-title">${escapeHTML(rule.label)}</span>
            <span class="video-row-desc">${escapeHTML(rule.description)}</span>
          </div>
          <span class="video-status-badge ${isUploaded ? 'uploaded' : (isOptional ? 'optional' : 'required')}">
            ${isUploaded ? '✅ Uploaded' : (isOptional ? '💡 Optional' : '❌ Required')}
          </span>
        </div>

        ${isUploaded ? `
          <div class="video-preview-wrapper">
            <video class="video-preview-player" src="${uploadedVideos[rule.key]}" controls></video>
            <button class="video-remove-btn" data-key="${rule.key}">Delete Video</button>
          </div>
        ` : `
          <div class="video-dropzone" data-key="${rule.key}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            <span>Click to upload ${isOptional ? 'optional walkthrough' : 'verification video'}</span>
            <span style="font-size:11px;color:var(--color-gray-400)">MP4, WEBM up to 15MB</span>
            <input type="file" class="hidden-video-input" accept="video/*" style="display:none" />
          </div>
        `}
      `;

      // Wire up upload / delete triggers inside this row
      if (isUploaded) {
        row.querySelector('.video-remove-btn').addEventListener('click', (e) => {
          e.preventDefault();
          delete uploadedVideos[rule.key];
          updateRequiredVideos();
        });
      } else {
        const dropzone = row.querySelector('.video-dropzone');
        const vInput = row.querySelector('.hidden-video-input');
        
        dropzone.addEventListener('click', () => vInput.click());
        vInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;

          if (!MAX_LENGTHS.allowedVideoTypes.includes(file.type)) {
            showToast(`Invalid format: ${file.name}. Upload MP4 or WEBM only.`, 'error');
            return;
          }
          if (file.size > MAX_LENGTHS.maxVideoSize) {
            showToast(`Video too large: ${file.name}. Max 15MB allowed.`, 'error');
            return;
          }

          const reader = new FileReader();
          reader.onload = (ev) => {
            uploadedVideos[rule.key] = ev.target.result;
            showToast(`Uploaded ${rule.label}! ✅`, 'success');
            updateRequiredVideos();
          };
          reader.readAsDataURL(file);
        });
      }

      videosList.appendChild(row);
    });
  }

  // React to checkbox clicks
  amenitiesContainer.addEventListener('change', () => {
    updateRequiredVideos();
  });

  // Trigger initial slot rendering (renders the optional general tour immediately)
  updateRequiredVideos();

  // Submit Handler
  page.querySelector('#pp-submit').addEventListener('click', async () => {
    const errEl = page.querySelector('#pp-error');
    const title = page.querySelector('#pp-title').value.trim();
    const type = page.querySelector('#pp-type').value;
    const area = page.querySelector('#pp-area').value;
    const address = page.querySelector('#pp-address').value.trim();
    const price = parseInt(page.querySelector('#pp-price').value);
    const rooms = parseInt(page.querySelector('#pp-rooms').value);
    const distance = parseFloat(page.querySelector('#pp-distance').value);
    const furnished = page.querySelector('#pp-furnished').value === 'true';
    const description = page.querySelector('#pp-description').value.trim();
    const amenities = Array.from(page.querySelectorAll('#pp-amenities input:checked')).map(i => i.value);

    // Initial basic checks
    if (!title || !address || !price || !rooms) {
      errEl.textContent = 'Please fill in all required fields (title, address, price, rooms)';
      errEl.style.display = '';
      return;
    }
    if (title.length > MAX_LENGTHS.title) { errEl.textContent = `Title must be under ${MAX_LENGTHS.title} characters`; errEl.style.display = ''; return; }
    if (address.length > MAX_LENGTHS.address) { errEl.textContent = `Address must be under ${MAX_LENGTHS.address} characters`; errEl.style.display = ''; return; }
    if (description.length > MAX_LENGTHS.description) { errEl.textContent = `Description must be under ${MAX_LENGTHS.description} characters`; errEl.style.display = ''; return; }
    if (price > MAX_LENGTHS.maxPrice || price < 0) { errEl.textContent = 'Price must be between 0 and 50,000,000'; errEl.style.display = ''; return; }

    // STRICT ANTI-FRAUD VERIFICATION VIDEO GUARD (General walkthrough is always required)
    const checkedAmenities = Array.from(amenitiesContainer.querySelectorAll('input:checked')).map(i => i.value);
    const activeRules = videoRules.filter(rule => 
      rule.key === 'general' || rule.triggerAmenities.some(amenity => checkedAmenities.includes(amenity))
    );

    const missingVideos = [];
    activeRules.forEach(rule => {
      if (!uploadedVideos[rule.key]) {
        missingVideos.push(rule.label);
      }
    });

    if (missingVideos.length > 0) {
      errEl.innerHTML = `
        <strong>Verification Required</strong><br/>
        Please upload matching video proof for the selected amenities:<br/>
        <ul style="margin:6px 0 0 16px; text-align:left">
          ${missingVideos.map(m => `<li>${escapeHTML(m)}</li>`).join('')}
        </ul>
      `;
      errEl.style.display = '';
      showToast('Missing required verification videos!', 'error');
      errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    errEl.style.display = 'none';

    // Map verification videos payload
    const videos = Object.entries(uploadedVideos).map(([key, src]) => {
      let label = '';
      if (key === 'general') label = 'General Property Walkthrough';
      if (key === 'water') label = 'Water Running from taps';
      if (key === 'compound') label = 'Compound & Perimeter walkthrough';
      if (key === 'electricity') label = 'Prepaid meter / Power setup check';
      return { label, src };
    });

    const images = uploadedImages.length > 0 ? uploadedImages : ['/images/property_1.png', '/images/property_2.png', '/images/property_3.png'];

    // Post Property
    await createProperty({
      title, type, area, address, price, roomsAvailable: rooms,
      distanceFromCampus: distance || 1, furnished, description, amenities, images, videos,
      landlordId: user.id,
      landlordName: user.name,
      verified: user.verified || false
    });

    showToast('Property submitted with video proof! 🎉');
    navigate('/landlord');
    location.reload();
  });

  return page;
}

// Injected styles for verification videos and upload slots
function injectPostPropertyStyles() {
  const id = 'post-property-video-styles';
  if (document.getElementById(id)) return;

  const css = `
    .video-uploads-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      margin-top: var(--space-2);
    }

    .video-upload-row {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      transition: all var(--transition-base);
    }

    .video-upload-row:hover {
      box-shadow: var(--shadow-sm);
      border-color: var(--color-gray-300);
    }

    .video-row-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
    }

    .video-row-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .video-row-title {
      font-weight: 600;
      font-size: var(--font-size-base);
      color: var(--color-gray-800);
    }

    .video-row-desc {
      font-size: var(--font-size-xs);
      color: var(--color-gray-400);
    }

    .video-status-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-pill);
      white-space: nowrap;
    }

    .video-status-badge.required {
      background: rgba(239, 68, 68, 0.08);
      color: var(--color-danger);
    }

    .video-status-badge.optional {
      background: rgba(59, 95, 212, 0.08);
      color: var(--color-accent);
    }

    .video-status-badge.uploaded {
      background: rgba(34, 197, 94, 0.08);
      color: var(--color-success);
    }

    .video-dropzone {
      border: 2px dashed var(--color-gray-200);
      border-radius: var(--radius-sm);
      padding: var(--space-6) var(--space-4);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-1);
      cursor: pointer;
      color: var(--color-gray-500);
      transition: all var(--transition-fast);
    }

    .video-dropzone:hover {
      border-color: var(--color-accent);
      color: var(--color-accent-dark);
      background: rgba(59, 95, 212, 0.02);
    }

    .video-preview-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-width: 320px;
    }

    .video-preview-player {
      width: 100%;
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-sm);
      max-height: 180px;
      background: var(--color-black);
    }

    .video-remove-btn {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.15);
      color: var(--color-danger);
      padding: var(--space-2);
      font-size: var(--font-size-xs);
      font-weight: 600;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .video-remove-btn:hover {
      background: var(--color-danger);
      color: var(--color-white);
    }
  `;

  const el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
