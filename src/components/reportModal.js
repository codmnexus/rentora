import { getCurrentUser, createReport } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import { MAX_LENGTHS } from '../utils/authSecurity.js';

export async function showReportModal(targetId, targetType = 'property') {
  const user = await getCurrentUser();
  if (!user) { navigate('/login'); return; }

  // Remove existing modal
  document.querySelector('.report-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'report-overlay';

  overlay.innerHTML = `
    <div class="report-modal">
      <div class="report-modal-header">
        <h3>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;vertical-align:middle;margin-right:6px"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>
          Report ${targetType === 'property' ? 'Listing' : 'Takeover'}
        </h3>
        <button class="report-close" id="report-close">&times;</button>
      </div>
      <div class="report-modal-body">
        <div class="form-group">
          <label class="form-label">What's the issue?</label>
          <select class="form-select" id="report-reason">
            <option value="">Select a reason</option>
            <option value="fake">Fake or misleading listing</option>
            <option value="scam">Suspected scam</option>
            <option value="inappropriate">Inappropriate content</option>
            <option value="duplicate">Duplicate listing</option>
            <option value="unavailable">Property no longer available</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Additional details</label>
          <textarea class="form-textarea" id="report-details" placeholder="Describe the issue..." style="min-height:80px"></textarea>
        </div>
        <div class="form-error" id="report-error" style="display:none"></div>
        <div style="display:flex;gap:12px">
          <button class="auth-submit" id="report-submit" style="flex:1;background:var(--color-danger)">Submit Report</button>
          <button class="auth-submit" id="report-cancel" style="flex:1;background:var(--color-gray-300);color:var(--color-gray-700)">Cancel</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close
  const close = () => overlay.remove();
  overlay.querySelector('#report-close').addEventListener('click', close);
  overlay.querySelector('#report-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // Submit
  overlay.querySelector('#report-submit').addEventListener('click', async () => {
    const reason = overlay.querySelector('#report-reason').value;
    const details = overlay.querySelector('#report-details').value.trim();
    const errEl = overlay.querySelector('#report-error');

    if (!reason) { errEl.textContent = 'Please select a reason'; errEl.style.display = ''; return; }
    if (details.length > MAX_LENGTHS.reportDetails) { errEl.textContent = `Details must be under ${MAX_LENGTHS.reportDetails} characters`; errEl.style.display = ''; return; }

    await createReport({
      reporterId: user.id,
      reporterName: user.name,
      targetId,
      targetType,
      reason,
      details
    });

    close();
    showToast('Report submitted. Our team will review it. 🛡️');
  });
}
