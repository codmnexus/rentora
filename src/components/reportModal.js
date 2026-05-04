import { getCurrentUser, createReport } from '../utils/store.js';
import { navigate } from '../utils/router.js';
import { showToast } from './header.js';
import { MAX_LENGTHS } from '../utils/authSecurity.js';

// Report categories with their specific reasons
const REPORT_CATEGORIES = {
  safety: {
    label: 'Safety & Security',
    icon: '🛡️',
    reasons: [
      { value: 'scam', label: 'Suspected scam or fraud' },
      { value: 'unsafe_property', label: 'Unsafe living conditions' },
      { value: 'threatening', label: 'Threatening behaviour' },
      { value: 'identity_theft', label: 'Identity theft / impersonation' }
    ]
  },
  content: {
    label: 'Content Issues',
    icon: '📝',
    reasons: [
      { value: 'fake', label: 'Fake or misleading listing' },
      { value: 'inappropriate', label: 'Inappropriate content or images' },
      { value: 'duplicate', label: 'Duplicate listing' },
      { value: 'wrong_info', label: 'Incorrect pricing or details' }
    ]
  },
  availability: {
    label: 'Availability',
    icon: '🏠',
    reasons: [
      { value: 'unavailable', label: 'Property no longer available' },
      { value: 'already_rented', label: 'Already rented out' },
      { value: 'wrong_location', label: 'Wrong location listed' }
    ]
  },
  conduct: {
    label: 'User Conduct',
    icon: '👤',
    reasons: [
      { value: 'harassment', label: 'Harassment or abuse' },
      { value: 'spam', label: 'Spam or unsolicited contact' },
      { value: 'discrimination', label: 'Discrimination' }
    ]
  },
  other: {
    label: 'Other',
    icon: '📋',
    reasons: [
      { value: 'other', label: 'Other issue not listed above' }
    ]
  }
};

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', desc: 'Minor issue, not urgent', color: '#22C55E' },
  { value: 'medium', label: 'Medium', desc: 'Needs attention soon', color: '#F59E0B' },
  { value: 'high', label: 'High', desc: 'Serious issue, urgent', color: '#EF4444' },
  { value: 'critical', label: 'Critical', desc: 'Immediate danger / fraud', color: '#DC2626' }
];

export async function showReportModal(targetId, targetType = 'property') {
  const user = await getCurrentUser();
  if (!user) { navigate('/login'); return; }

  // Remove existing modal
  document.querySelector('.report-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'report-overlay';

  let selectedCategory = '';
  let selectedReason = '';
  let selectedSeverity = 'medium';
  let evidenceFile = null;
  let detailsText = '';
  let currentStep = 1;

  function renderStep() {
    const modal = overlay.querySelector('.report-modal');
    if (!modal) return;
    const body = modal.querySelector('.report-modal-body');

    // Update step indicators
    modal.querySelectorAll('.report-step-indicator').forEach(s => {
      const step = parseInt(s.dataset.step);
      s.classList.toggle('active', step <= currentStep);
      s.classList.toggle('done', step < currentStep);
    });

    // Update progress connector
    const connector1 = modal.querySelector('#rp-connector-1');
    const connector2 = modal.querySelector('#rp-connector-2');
    if (connector1) connector1.style.width = currentStep >= 2 ? '100%' : '0';
    if (connector2) connector2.style.width = currentStep >= 3 ? '100%' : '0';

    if (currentStep === 1) renderCategoryStep(body);
    else if (currentStep === 2) renderDetailsStep(body);
    else renderReviewStep(body);
  }

  function renderCategoryStep(body) {
    body.innerHTML = `
      <div class="report-step-content">
        <h4 class="report-step-title">What type of issue are you reporting?</h4>
        <p class="report-step-desc">Select the category that best describes the problem</p>
        <div class="report-category-grid">
          ${Object.entries(REPORT_CATEGORIES).map(([key, cat]) => `
            <button class="report-category-card ${selectedCategory === key ? 'selected' : ''}" data-cat="${key}">
              <span class="report-cat-icon">${cat.icon}</span>
              <span class="report-cat-label">${cat.label}</span>
              <span class="report-cat-check">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-3"/></svg>
              </span>
            </button>
          `).join('')}
        </div>
        ${selectedCategory ? `
          <div class="report-reason-section fade-in-up">
            <label class="report-field-label">Specific issue</label>
            <div class="report-reason-list">
              ${REPORT_CATEGORIES[selectedCategory].reasons.map(r => `
                <label class="report-reason-radio ${selectedReason === r.value ? 'selected' : ''}">
                  <input type="radio" name="report-reason" value="${r.value}" ${selectedReason === r.value ? 'checked' : ''} />
                  <span class="report-radio-dot"></span>
                  <span>${r.label}</span>
                </label>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <div class="report-step-actions">
          <button class="report-btn-next" id="rp-next-1" ${!selectedReason ? 'disabled' : ''}>
            <span>Next: Details</span>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
          </button>
          <button class="report-btn-cancel" id="rp-cancel">Cancel</button>
        </div>
      </div>
    `;

    // Category selection
    body.querySelectorAll('.report-category-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedCategory = card.dataset.cat;
        selectedReason = '';
        renderStep();
      });
    });

    // Reason selection
    body.querySelectorAll('input[name="report-reason"]').forEach(radio => {
      radio.addEventListener('change', () => {
        selectedReason = radio.value;
        renderStep();
      });
    });

    body.querySelector('#rp-next-1')?.addEventListener('click', () => {
      if (selectedReason) { currentStep = 2; renderStep(); }
    });
    body.querySelector('#rp-cancel')?.addEventListener('click', close);
  }

  function renderDetailsStep(body) {
    body.innerHTML = `
      <div class="report-step-content">
        <h4 class="report-step-title">Provide more details</h4>
        <p class="report-step-desc">Help our team investigate this issue effectively</p>

        <div class="report-field-group">
          <label class="report-field-label">Severity Level</label>
          <div class="report-severity-grid">
            ${SEVERITY_LEVELS.map(s => `
              <button class="report-severity-btn ${selectedSeverity === s.value ? 'selected' : ''}" data-severity="${s.value}" style="--sev-color: ${s.color}">
                <span class="report-sev-dot" style="background: ${s.color}"></span>
                <div>
                  <strong>${s.label}</strong>
                  <span>${s.desc}</span>
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="report-field-group">
          <label class="report-field-label">Describe the issue <span class="report-optional">(optional but helpful)</span></label>
          <textarea class="report-textarea" id="rp-details" placeholder="What happened? Include dates, times, or specific details that will help us investigate..." maxlength="${MAX_LENGTHS.reportDetails}">${''}</textarea>
          <div class="report-char-count" id="rp-char-count">0 / ${MAX_LENGTHS.reportDetails}</div>
        </div>

        <div class="report-field-group">
          <label class="report-field-label">Evidence <span class="report-optional">(optional)</span></label>
          <div class="report-evidence-drop" id="rp-evidence-zone">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Click or drag to upload a screenshot</span>
            <span class="report-evidence-formats">JPG, PNG, PDF — Max 5MB</span>
            <input type="file" id="rp-evidence-file" accept="image/*,.pdf" style="display:none" />
          </div>
          <div id="rp-evidence-preview"></div>
        </div>

        <div class="report-step-actions">
          <button class="report-btn-next" id="rp-next-2">
            <span>Review Report</span>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 10h10M11 6l4 4-4 4"/></svg>
          </button>
          <button class="report-btn-back" id="rp-back-2">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M15 10H5M9 14l-4-4 4-4"/></svg>
            <span>Back</span>
          </button>
        </div>
      </div>
    `;

    // Severity selection
    body.querySelectorAll('.report-severity-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSeverity = btn.dataset.severity;
        body.querySelectorAll('.report-severity-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // Character count
    const textarea = body.querySelector('#rp-details');
    const charCount = body.querySelector('#rp-char-count');
    textarea.addEventListener('input', () => {
      charCount.textContent = `${textarea.value.length} / ${MAX_LENGTHS.reportDetails}`;
    });

    // Evidence upload
    const dropzone = body.querySelector('#rp-evidence-zone');
    const fileInput = body.querySelector('#rp-evidence-file');
    const preview = body.querySelector('#rp-evidence-preview');

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault(); dropzone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); });

    function handleFile(file) {
      if (file.size > 5 * 1024 * 1024) {
        preview.innerHTML = '<div class="report-evidence-error">File must be under 5MB</div>';
        return;
      }
      evidenceFile = file;
      preview.innerHTML = `
        <div class="report-evidence-attached">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>
          <span>${file.name}</span>
          <button class="report-evidence-remove" id="rp-remove-evidence">&times;</button>
        </div>
      `;
      preview.querySelector('#rp-remove-evidence')?.addEventListener('click', () => {
        evidenceFile = null;
        preview.innerHTML = '';
      });
    }

    body.querySelector('#rp-next-2').addEventListener('click', () => {
      detailsText = body.querySelector('#rp-details')?.value?.trim() || '';
      currentStep = 3;
      renderStep();
    });
    body.querySelector('#rp-back-2').addEventListener('click', () => { currentStep = 1; renderStep(); });
  }

  function renderReviewStep(body) {
    const catInfo = REPORT_CATEGORIES[selectedCategory];
    const reasonLabel = catInfo?.reasons.find(r => r.value === selectedReason)?.label || selectedReason;
    const sevInfo = SEVERITY_LEVELS.find(s => s.value === selectedSeverity);

    body.innerHTML = `
      <div class="report-step-content">
        <h4 class="report-step-title">Review your report</h4>
        <p class="report-step-desc">Please confirm the details before submitting</p>

        <div class="report-review-card">
          <div class="report-review-row">
            <span class="report-review-label">Reporting</span>
            <span class="report-review-value">${targetType === 'property' ? '🏠 Property Listing' : '🔄 Room Takeover'}</span>
          </div>
          <div class="report-review-row">
            <span class="report-review-label">Category</span>
            <span class="report-review-value">${catInfo?.icon} ${catInfo?.label}</span>
          </div>
          <div class="report-review-row">
            <span class="report-review-label">Issue</span>
            <span class="report-review-value">${reasonLabel}</span>
          </div>
          <div class="report-review-row">
            <span class="report-review-label">Severity</span>
            <span class="report-review-value">
              <span class="report-sev-dot-sm" style="background:${sevInfo?.color}"></span>
              ${sevInfo?.label}
            </span>
          </div>
          ${detailsText ? `
            <div class="report-review-row details">
              <span class="report-review-label">Details</span>
              <span class="report-review-value">${detailsText.substring(0, 200)}${detailsText.length > 200 ? '...' : ''}</span>
            </div>
          ` : ''}
          ${evidenceFile ? `
            <div class="report-review-row">
              <span class="report-review-label">Evidence</span>
              <span class="report-review-value">📎 ${evidenceFile.name}</span>
            </div>
          ` : ''}
        </div>

        <div class="report-notice">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="10" cy="10" r="8"/><path d="M10 7v3M10 13h.01"/></svg>
          <span>Reports are reviewed within 24–48 hours. False reports may result in account restrictions.</span>
        </div>

        <div class="form-error" id="rp-error" style="display:none"></div>

        <div class="report-step-actions">
          <button class="report-btn-submit" id="rp-submit">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>
            <span>Submit Report</span>
          </button>
          <button class="report-btn-back" id="rp-back-3">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M15 10H5M9 14l-4-4 4-4"/></svg>
            <span>Back</span>
          </button>
        </div>
      </div>
    `;

    body.querySelector('#rp-submit').addEventListener('click', async () => {
      const submitBtn = body.querySelector('#rp-submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Submitting...</span>';

      try {
        await createReport({
          reporterId: user.id,
          reporterName: user.name,
          targetId,
          targetType,
          category: selectedCategory,
          reason: selectedReason,
          severity: selectedSeverity,
          details: detailsText,
          evidenceFileName: evidenceFile?.name || ''
        });

        close();
        showToast('Report submitted successfully. Our team will review it within 24–48 hours. 🛡️');
      } catch (err) {
        const errEl = body.querySelector('#rp-error');
        errEl.textContent = 'Failed to submit report. Please try again.';
        errEl.style.display = '';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit Report</span>';
      }
    });

    body.querySelector('#rp-back-3').addEventListener('click', () => { currentStep = 2; renderStep(); });
  }

  overlay.innerHTML = `
    <div class="report-modal">
      <div class="report-modal-header">
        <h3>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;vertical-align:middle;margin-right:6px"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>
          Report ${targetType === 'property' ? 'Listing' : 'Takeover'}
        </h3>
        <button class="report-close" id="report-close">&times;</button>
      </div>
      <div class="report-steps-bar">
        <div class="report-step-indicator active" data-step="1">
          <span class="report-step-num">1</span>
          <span class="report-step-label">Category</span>
        </div>
        <div class="report-step-connector"><div class="report-step-connector-fill" id="rp-connector-1"></div></div>
        <div class="report-step-indicator" data-step="2">
          <span class="report-step-num">2</span>
          <span class="report-step-label">Details</span>
        </div>
        <div class="report-step-connector"><div class="report-step-connector-fill" id="rp-connector-2"></div></div>
        <div class="report-step-indicator" data-step="3">
          <span class="report-step-num">3</span>
          <span class="report-step-label">Review</span>
        </div>
      </div>
      <div class="report-modal-body"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close
  const close = () => overlay.remove();
  overlay.querySelector('#report-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // Initial render
  renderStep();
}
