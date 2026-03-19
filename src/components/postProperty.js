import { getCurrentUser, createProperty } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';

export async function createPostProperty() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'landlord' && user.role !== 'admin')) { navigate('/login'); return document.createElement('div'); }

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
        Amenities
      </div>
      <div class="amenities-checkboxes" id="pp-amenities">
        ${['Water supply', 'Security', 'Tiled floors', 'Fence & gate', 'Parking space', 'Good ventilation', 'AC', 'Prepaid meter',
      'Kitchen', 'Furnished', 'Wifi ready', 'POP ceiling', 'Water heater', 'Generator backup', 'Ensuite rooms', 'Close to campus',
      'Reading room', 'Fire pit', 'Balcony', 'Good road'].map(a => `
          <label class="amenity-checkbox"><input type="checkbox" value="${a}" /> ${a}</label>
        `).join('')}
      </div>
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

  // Image upload
  const uploadArea = page.querySelector('#upload-area');
  const fileInput = page.querySelector('#pp-images');
  const previews = page.querySelector('#image-previews');
  let uploadedImages = [];

  uploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    Array.from(e.target.files).forEach(file => {
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
    });
  });

  // Submit
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

    if (!title || !address || !price || !rooms) {
      errEl.textContent = 'Please fill in all required fields (title, address, price, rooms)';
      errEl.style.display = '';
      return;
    }

    // Use uploaded images or fallback
    const images = uploadedImages.length > 0 ? uploadedImages : ['/images/property_1.png', '/images/property_2.png', '/images/property_3.png'];

    await createProperty({
      title, type, area, address, price, roomsAvailable: rooms,
      distanceFromCampus: distance || 1, furnished, description, amenities, images,
      landlordId: user.id,
      landlordName: user.name,
      landlordPhone: user.phone,
      verified: user.verified || false
    });

    showToast('Property submitted for review! 🎉');
    navigate('/landlord');
    location.reload();
  });

  return page;
}
