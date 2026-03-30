import { getCurrentUser, getConversations, sendMessage, getUserById, getPropertyById, onChatMessages, onConversations } from '../utils/store.js';
import { navigate, getCurrentRoute } from '../utils/router.js';
import { escapeHTML, MAX_LENGTHS } from '../utils/authSecurity.js';

export async function createMessagesPage() {
  const user = await getCurrentUser();
  if (!user) { navigate('/login'); return document.createElement('div'); }

  const route = getCurrentRoute();
  const targetUserId = route.params.to;
  const targetPropertyId = route.params.property;

  const page = document.createElement('div');
  page.className = 'msg-page';

  // Track active unsubscribe functions for cleanup
  let _unsubChat = null;
  let _unsubConvos = null;

  page.innerHTML = `
    <div class="msg-sidebar">
      <div class="msg-sidebar-header">
        <h2 class="msg-sidebar-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          Messages
        </h2>
        <span class="msg-count" id="msg-count">0</span>
      </div>
      <div class="msg-search-wrap">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/></svg>
        <input type="text" class="msg-search" id="msg-search" placeholder="Search conversations..." />
      </div>
      <div class="msg-convo-list" id="msg-convo-list">
        <div class="msg-empty-convos">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M44 32a4 4 0 01-4 4H12l-8 8V8a4 4 0 014-4h32a4 4 0 014 4z"/></svg>
          <span>No conversations yet</span>
          <span class="msg-empty-sub">Contact a landlord to start chatting</span>
        </div>
      </div>
    </div>
    <div class="msg-main" id="msg-main">
      <div class="msg-no-chat">
        <div class="msg-no-chat-icon">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
            <path d="M56 40a4 4 0 01-4 4H16l-8 8V12a4 4 0 014-4h40a4 4 0 014 4z"/>
            <path d="M20 22h24M20 30h16" stroke-linecap="round"/>
          </svg>
        </div>
        <h3>Select a conversation</h3>
        <p>Choose a chat from the sidebar or contact a landlord from a property listing</p>
      </div>
    </div>
  `;

  const convoListEl = page.querySelector('#msg-convo-list');
  const mainArea = page.querySelector('#msg-main');
  const searchInput = page.querySelector('#msg-search');
  const countBadge = page.querySelector('#msg-count');

  // ===========================
  // RENDER CONVERSATION LIST (called on real-time updates)
  // ===========================
  let convoItems = [];
  let currentConvos = [];

  async function renderConvoList(convos) {
    currentConvos = convos;
    countBadge.textContent = convos.length;

    if (convos.length === 0) {
      convoListEl.innerHTML = `
        <div class="msg-empty-convos">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M44 32a4 4 0 01-4 4H12l-8 8V8a4 4 0 014-4h32a4 4 0 014 4z"/></svg>
          <span>No conversations yet</span>
          <span class="msg-empty-sub">Contact a landlord to start chatting</span>
        </div>
      `;
      return;
    }

    convoListEl.innerHTML = '';
    convoItems = [];

    for (const c of convos) {
      const other = await getUserById(c.otherUserId);
      const prop = await getPropertyById(c.propertyId);
      const isActive = (targetUserId === c.otherUserId && targetPropertyId === c.propertyId);
      const lastTime = c.lastMessage?.timestamp
        ? formatRelativeTime(new Date(c.lastMessage.timestamp))
        : '';
      const lastMsg = c.lastMessage?.message || '';

      const item = document.createElement('div');
      item.className = `msg-convo-item${isActive ? ' active' : ''}`;
      item.dataset.name = (other?.name || '').toLowerCase();
      item.dataset.property = (prop?.title || '').toLowerCase();
      item.dataset.otherId = c.otherUserId;
      item.dataset.propertyId = c.propertyId;

      item.innerHTML = `
        <div class="msg-convo-avatar">
          <span>${escapeHTML(other?.name?.charAt(0)?.toUpperCase() || '?')}</span>
          <div class="msg-convo-online"></div>
        </div>
        <div class="msg-convo-info">
          <div class="msg-convo-top">
            <span class="msg-convo-name">${escapeHTML(other?.name || 'User')}</span>
            <span class="msg-convo-time">${lastTime}</span>
          </div>
          <div class="msg-convo-preview">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12"><path d="M2 2h12v9H5l-3 3z"/></svg>
            ${escapeHTML(lastMsg).substring(0, 50)}${lastMsg.length > 50 ? '...' : ''}
          </div>
          <div class="msg-convo-property-tag">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="10" height="10"><path d="M2 14V6l6-4 6 4v8"/><rect x="5" y="9" width="6" height="5"/></svg>
            ${escapeHTML(prop?.title || 'Property')}
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        // Update URL and open chat without full reload
        window.history.replaceState(null, '', `#/messages?to=${c.otherUserId}&property=${c.propertyId}`);
        convoListEl.querySelectorAll('.msg-convo-item.active').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        renderChat(c.otherUserId, c.propertyId);
      });

      convoListEl.appendChild(item);
      convoItems.push(item);
    }
  }

  // Search filter
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    convoItems.forEach(item => {
      const match = item.dataset.name.includes(q) || item.dataset.property.includes(q);
      item.style.display = match ? '' : 'none';
    });
  });

  // ===========================
  // RENDER CHAT WITH REAL-TIME MESSAGES
  // ===========================
  async function renderChat(otherId, propId) {
    // Unsubscribe from previous chat listener
    if (_unsubChat) { _unsubChat(); _unsubChat = null; }

    const other = await getUserById(otherId);
    const prop = await getPropertyById(propId);

    const formatPrice = (p) => '₦' + (p || 0).toLocaleString();
    const propImage = prop?.images?.[0] || prop?.image || '';
    const propType = prop?.type || prop?.propertyType || 'Listing';

    mainArea.innerHTML = `
      <div class="msg-chat-header">
        <button class="msg-back-btn" id="msg-back-btn">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M15 10H5M5 10l5-5M5 10l5 5"/></svg>
        </button>
        <div class="msg-chat-header-avatar">
          <span>${escapeHTML(other?.name?.charAt(0)?.toUpperCase() || '?')}</span>
        </div>
        <div class="msg-chat-header-info">
          <div class="msg-chat-header-name">${escapeHTML(other?.name || 'User')}</div>
          <div class="msg-chat-header-status">
            <span class="msg-online-dot"></span>
            ${other?.role === 'landlord' ? 'Landlord' : 'Tenant'}
          </div>
        </div>
        <button class="msg-view-property-btn" id="msg-view-property-toggle">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 3h14v11H7l-4 4z"/></svg>
          View Listing
        </button>
      </div>

      <div class="msg-chat-body">
        <div class="msg-chat-messages-wrap">
          <!-- Property Context Card (pinned top) -->
          <div class="msg-property-context" id="msg-property-context">
            <div class="msg-property-card">
              ${propImage ? `<img class="msg-property-img" src="${propImage}" alt="${escapeHTML(prop?.title || '')}" />` : `
                <div class="msg-property-img-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                </div>
              `}
              <div class="msg-property-details">
                <div class="msg-property-type-badge">${escapeHTML(propType)}</div>
                <div class="msg-property-title">${escapeHTML(prop?.title || 'Property Listing')}</div>
                <div class="msg-property-location">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12"><path d="M8 14s5-4.5 5-8A5 5 0 003 6c0 3.5 5 8 5 8z"/><circle cx="8" cy="6" r="1.5"/></svg>
                  ${escapeHTML(prop?.area || prop?.location || 'Location')}
                </div>
                <div class="msg-property-price">${formatPrice(prop?.price)}<span>/yr</span></div>
              </div>
              <a class="msg-property-view-link" href="#/property/${propId}">
                View Listing →
              </a>
            </div>
          </div>

          <!-- Safety Tips -->
          <div class="msg-safety-tips">
            <div class="msg-safety-icon">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M10 2l7 4v5c0 4.5-7 7-7 7S3 15.5 3 11V6z"/><path d="M10 7v3M10 13h0"/></svg>
            </div>
            <div class="msg-safety-text">
              <strong>Stay Safe</strong>
              <span>Never share personal financial details. Use Rentora's escrow payment system for all transactions. Report suspicious behavior.</span>
            </div>
          </div>

          <!-- Messages (real-time) -->
          <div class="msg-chat-messages" id="msg-chat-messages">
            <div class="msg-loading">Loading messages...</div>
          </div>
        </div>
      </div>

      <div class="msg-chat-input-area">
        <div class="msg-chat-input-wrap">
          <input type="text" class="msg-chat-input" id="msg-chat-input" placeholder="Type a message..." maxlength="${MAX_LENGTHS.message}" />
          <button class="msg-send-btn" id="msg-send-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>
          </button>
        </div>
      </div>
    `;

    const msgsCont = mainArea.querySelector('#msg-chat-messages');

    // Subscribe to real-time messages
    _unsubChat = onChatMessages(user.id, otherId, propId, (messages) => {
      if (messages.length === 0) {
        msgsCont.innerHTML = `
          <div class="msg-start-convo">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1" width="40" height="40"><path d="M44 24c0 11-9 20-20 20a19.8 19.8 0 01-10-2.7L4 44l2.7-10A19.8 19.8 0 014 24C4 13 13 4 24 4s20 9 20 20z"/></svg>
            <span>Start the conversation about <strong>${escapeHTML(prop?.title || 'this property')}</strong></span>
          </div>
        `;
        return;
      }

      const wasAtBottom = msgsCont.scrollHeight - msgsCont.scrollTop - msgsCont.clientHeight < 60;

      msgsCont.innerHTML = messages.map(m => {
        const isMine = m.senderId === user.id;
        const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
          <div class="msg-bubble-row ${isMine ? 'sent' : 'received'}">
            ${!isMine ? `<div class="msg-bubble-avatar">${escapeHTML(other?.name?.charAt(0)?.toUpperCase() || '?')}</div>` : ''}
            <div class="msg-bubble ${isMine ? 'sent' : 'received'}">
              <div class="msg-bubble-text">${escapeHTML(m.message)}</div>
              <div class="msg-bubble-meta">
                <span class="msg-bubble-time">${time}</span>
                ${isMine ? '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M2 8l4 4L14 4"/></svg>' : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Auto-scroll if user was near bottom
      if (wasAtBottom) {
        requestAnimationFrame(() => msgsCont.scrollTop = msgsCont.scrollHeight);
      }
    });

    // Back button (mobile)
    mainArea.querySelector('#msg-back-btn').addEventListener('click', () => {
      page.classList.remove('chat-open');
    });

    // Toggle property card on mobile
    mainArea.querySelector('#msg-view-property-toggle')?.addEventListener('click', () => {
      const ctx = mainArea.querySelector('#msg-property-context');
      ctx.classList.toggle('collapsed');
    });

    // Send message
    const input = mainArea.querySelector('#msg-chat-input');
    const sendBtn = mainArea.querySelector('#msg-send-btn');
    const send = async () => {
      const msg = input.value.trim();
      if (!msg) return;
      if (msg.length > MAX_LENGTHS.message) {
        input.style.outline = '2px solid #EF4444';
        setTimeout(() => input.style.outline = '', 2000);
        return;
      }
      sendBtn.disabled = true;
      input.value = '';
      await sendMessage({ senderId: user.id, receiverId: otherId, propertyId: propId, message: msg });
      sendBtn.disabled = false;
      // No need to re-render — real-time listener will handle it
    };
    sendBtn.addEventListener('click', send);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') send(); });
    input.focus();

    // Mobile: show chat
    page.classList.add('chat-open');
  }

  // ===========================
  // HELPERS
  // ===========================
  function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  }

  // ===========================
  // INIT — Real-time subscriptions
  // ===========================

  // Subscribe to conversation list updates in real-time
  _unsubConvos = onConversations(user.id, (convos) => {
    renderConvoList(convos);
  });

  // If a specific chat was targeted, open it
  if (targetUserId && targetPropertyId) {
    renderChat(targetUserId, targetPropertyId);
  }

  // Cleanup when page is removed from DOM
  const observer = new MutationObserver(() => {
    if (!document.contains(page)) {
      if (_unsubChat) _unsubChat();
      if (_unsubConvos) _unsubConvos();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return page;
}
