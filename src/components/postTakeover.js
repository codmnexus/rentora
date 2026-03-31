import { getCurrentUser, createTakeover } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import { MAX_LENGTHS } from '../utils/authSecurity.js';

export async function createPostTakeover() {
  const user = await getCurrentUser();
  if (!user) { navigate('/login'); return document.createElement('div'); }

  // Only tenants can post room takeovers — landlords use "List Property" instead
  if (user.role === 'landlord') {
    const blocked = document.createElement('div');
    blocked.className = 'post-property';
    blocked.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;padding:40px 20px">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-400)" stroke-width="1.5" style="width:56px;height:56px;margin-bottom:16px">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        <h2 style="font-size:1.25rem;font-weight:700;color:var(--color-gray-800);margin-bottom:8px">Landlords Can't Post Takeovers</h2>
        <p style="font-size:14px;color:var(--color-gray-500);max-width:400px;margin-bottom:20px">
          Room takeovers are for tenants who want to transfer their room to another student.
          As a landlord, you can list your property instead.
        </p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
          <button onclick="window.location.hash='#/post-property'" style="padding:10px 24px;background:var(--color-primary-gradient);color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">List a Property</button>
          <button onclick="window.location.hash='#/landlord'" style="padding:10px 24px;background:var(--color-gray-100);color:var(--color-gray-700);border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">Go to Dashboard</button>
        </div>
      </div>
    `;
    return blocked;
  }

  const page = document.createElement('div');
  page.className = 'post-property';

  page.innerHTML = `
    <div class="takeover-badge-inline" style="margin-bottom:16px">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 6l5 5 5-5M6 1v10"/></svg>
      Room Takeover
    </div>

    <div class="incentive-banner" style="margin-bottom:20px">
      <div class="incentive-icon">₦5k</div>
      <div>
        <strong>Earn ₦5,000 Reward!</strong>
        <span>Get ₦5,000 when your takeover is successfully completed and the new tenant moves in. Verified via Rentora escrow.</span>
      </div>
    </div>

    <h1>Post a Room Takeover</h1>
    <p class="subtitle">Transfer your room to another student before your lease ends</p>

    <div class="form-card">
      <div class="form-card-title">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.17 7.83L10 1l6.83 6.83V17a2 2 0 01-2 2H5.17a2 2 0 01-2-2V7.83z"/></svg>
        Room Details
      </div>
      <div class="form-group">
        <label class="form-label">Listing Title</label>
        <input type="text" class="form-input" id="to-title" placeholder="e.g. Room in 2-bedroom flat — South Gate" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Apartment Type</label>
          <select class="form-select" id="to-type">
            <option value="Self-con">Self-con</option>
            <option value="Single room">Single Room</option>
            <option value="Flat">Flat</option>
            <option value="Shared room">Shared Room</option>
            <option value="Studio">Studio</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Area</label>
          <select class="form-select" id="to-area">
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
        <input type="text" class="form-input" id="to-address" placeholder="e.g. 9 South Gate Close, Akure" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Rent (₦ per year)</label>
          <input type="number" class="form-input" id="to-rent" placeholder="e.g. 150000" />
        </div>
        <div class="form-group">
          <label class="form-label">Lease Remaining (months)</label>
          <input type="number" class="form-input" id="to-lease" placeholder="e.g. 6" min="1" max="12" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Walk to South Gate (min)</label>
          <input type="number" class="form-input" id="to-south" placeholder="e.g. 5" min="1" />
        </div>
        <div class="form-group">
          <label class="form-label">Walk to North Gate (min)</label>
          <input type="number" class="form-input" id="to-north" placeholder="e.g. 15" min="1" />
        </div>
      </div>
    </div>

    <div class="form-card">
      <div class="form-card-title">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
        Description & Rules
      </div>
      <div class="form-group">
        <label class="form-label">Room Description</label>
        <textarea class="form-textarea" id="to-description" placeholder="Describe the room, its condition, and why you're leaving..."></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">House Rules</label>
        <textarea class="form-textarea" id="to-rules" placeholder="e.g. No loud music after 10pm. Keep common areas clean." style="min-height:60px"></textarea>
      </div>
    </div>

    <div class="form-card">
      <div class="form-card-title">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M7 10l2.5 2.5L13 8"/></svg>
        Amenities
      </div>
      <div class="amenities-checkboxes" id="to-amenities">
        ${['Water supply', 'Security', 'Tiled floors', 'Fence & gate', 'Good ventilation', 'Shared kitchen', 'Furnished', 'Prepaid meter', 'Close to campus', 'Reading room', 'Parking space', 'Generator backup'].map(a => `
          <label class="amenity-checkbox"><input type="checkbox" value="${a}" /> ${a}</label>
        `).join('')}
      </div>
    </div>

    <div class="form-card">
      <div class="form-card-title">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="16" height="16" rx="2"/><circle cx="7" cy="7" r="2"/><path d="M18 14l-5-5L2 18"/></svg>
        Room Photos
      </div>
      <div class="image-upload-area" id="to-upload-area">
        <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="32" height="32" rx="4"/><circle cx="14" cy="14" r="4"/><path d="M36 28L26 18 4 36"/></svg>
        <p style="font-weight:600;margin-top:8px">Click to upload photos</p>
        <p style="font-size:12px">Show the room's current condition</p>
        <input type="file" id="to-images" multiple accept="image/*" style="display:none" />
      </div>
      <div class="image-previews" id="to-previews"></div>
    </div>

    <div class="form-error" id="to-error" style="display:none;margin-bottom:16px;font-size:14px"></div>
    <button class="form-submit" id="to-submit">Post Room Takeover</button>
    <p style="text-align:center;margin-top:12px;font-size:12px;color:var(--color-gray-400)">Your listing will be reviewed before going live</p>
  `;

  // Image upload
  const uploadArea = page.querySelector('#to-upload-area');
  const fileInput = page.querySelector('#to-images');
  const previews = page.querySelector('#to-previews');
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

  // Submit
  page.querySelector('#to-submit').addEventListener('click', async () => {
    const errEl = page.querySelector('#to-error');
    const title = page.querySelector('#to-title').value.trim();
    const type = page.querySelector('#to-type').value;
    const area = page.querySelector('#to-area').value;
    const address = page.querySelector('#to-address').value.trim();
    const rent = parseInt(page.querySelector('#to-rent').value);
    const lease = parseInt(page.querySelector('#to-lease').value);
    const southMin = parseInt(page.querySelector('#to-south').value);
    const northMin = parseInt(page.querySelector('#to-north').value);
    const description = page.querySelector('#to-description').value.trim();
    const rules = page.querySelector('#to-rules').value.trim();
    const amenities = Array.from(page.querySelectorAll('#to-amenities input:checked')).map(i => i.value);

    if (!title || !address || !rent || !lease) {
      errEl.textContent = 'Please fill in title, address, rent, and lease remaining';
      errEl.style.display = '';
      return;
    }
    if (title.length > MAX_LENGTHS.title) { errEl.textContent = `Title must be under ${MAX_LENGTHS.title} characters`; errEl.style.display = ''; return; }
    if (address.length > MAX_LENGTHS.address) { errEl.textContent = `Address must be under ${MAX_LENGTHS.address} characters`; errEl.style.display = ''; return; }
    if (description.length > MAX_LENGTHS.description) { errEl.textContent = `Description must be under ${MAX_LENGTHS.description} characters`; errEl.style.display = ''; return; }
    if (rules.length > MAX_LENGTHS.houseRules) { errEl.textContent = `House rules must be under ${MAX_LENGTHS.houseRules} characters`; errEl.style.display = ''; return; }
    if (rent > MAX_LENGTHS.maxPrice || rent < 0) { errEl.textContent = 'Rent must be between 0 and 50,000,000'; errEl.style.display = ''; return; }

    const images = uploadedImages.length > 0 ? uploadedImages : ['/images/property_1.png', '/images/property_2.png'];

    await createTakeover({
      studentId: user.id,
      studentName: user.name,
      title, apartmentType: type, area, address, rent,
      leaseRemaining: lease,
      gateDistances: {
        southGate: `${southMin || '?'} min walk`,
        northGate: `${northMin || '?'} min walk`
      },
      description,
      houseRules: rules,
      amenities,
      images
    });

    showToast('Takeover posted for review! 🎉');
    navigate('/dashboard');
    location.reload();
  });

  return page;
}
