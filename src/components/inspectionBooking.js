import { getCurrentUser, createInspection, getPropertyById } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';

export async function showInspectionModal(propertyId) {
  const user = await getCurrentUser();
  if (!user) { navigate('/login'); return; }

  const property = await getPropertyById(propertyId);
  if (!property) return;

  document.querySelector('.report-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'report-overlay';

  // Generate next 7 days
  const days = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

  overlay.innerHTML = `
    <div class="report-modal inspection-modal">
      <div class="report-modal-header">
        <h3>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;vertical-align:middle;margin-right:6px"><rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 8h14M7 2v4M13 2v4"/></svg>
          Book Inspection
        </h3>
        <button class="report-close" id="insp-close">&times;</button>
      </div>
      <div class="report-modal-body">
        <div class="inspection-property-info">
          <strong>${property.title}</strong>
          <span>${property.area}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Select Date</label>
          <div class="inspection-dates" id="insp-dates">
            ${days.map(d => {
    const date = new Date(d);
    const dayName = date.toLocaleDateString('en-NG', { weekday: 'short' });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString('en-NG', { month: 'short' });
    return `<button class="inspection-date-btn" data-date="${d}">
                <span class="insp-day-name">${dayName}</span>
                <span class="insp-day-num">${dayNum}</span>
                <span class="insp-month">${month}</span>
              </button>`;
  }).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Select Time</label>
          <div class="inspection-times" id="insp-times">
            ${timeSlots.map(t => `<button class="inspection-time-btn" data-time="${t}">${t}</button>`).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Notes (optional)</label>
          <textarea class="form-textarea" id="insp-notes" placeholder="e.g. I'll be coming with a friend" style="min-height:50px"></textarea>
        </div>

        <div class="form-error" id="insp-error" style="display:none"></div>
        <button class="auth-submit" id="insp-submit" style="width:100%">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;vertical-align:middle;margin-right:6px"><rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 8h14M7 2v4M13 2v4"/><path d="M8 12l2 2 4-4"/></svg>
          Confirm Booking
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  let selectedDate = '';
  let selectedTime = '';

  // Date selection
  overlay.querySelectorAll('.inspection-date-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.inspection-date-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDate = btn.dataset.date;
    });
  });

  // Time selection
  overlay.querySelectorAll('.inspection-time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.inspection-time-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTime = btn.dataset.time;
    });
  });

  // Close
  const close = () => overlay.remove();
  overlay.querySelector('#insp-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // Submit
  overlay.querySelector('#insp-submit').addEventListener('click', async () => {
    const errEl = overlay.querySelector('#insp-error');
    if (!selectedDate) { errEl.textContent = 'Please select a date'; errEl.style.display = ''; return; }
    if (!selectedTime) { errEl.textContent = 'Please select a time'; errEl.style.display = ''; return; }

    await createInspection({
      tenantId: user.id,
      tenantName: user.name,
      landlordId: property.landlordId,
      landlordName: property.landlordName,
      propertyId: property.id,
      propertyTitle: property.title,
      date: selectedDate,
      time: selectedTime,
      notes: overlay.querySelector('#insp-notes').value.trim()
    });

    close();
    showToast('Inspection booked! The landlord will confirm shortly. 📅');
  });
}
