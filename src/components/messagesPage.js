import { getCurrentUser, getConversations, getChatMessages, sendMessage, getUserById, getPropertyById } from '../utils/store.js';
import { navigate, getCurrentRoute } from '../utils/router.js';
import { escapeHTML, MAX_LENGTHS } from '../utils/authSecurity.js';

export async function createMessagesPage() {
  const user = await getCurrentUser();
  if (!user) { navigate('/login'); return document.createElement('div'); }

  const route = getCurrentRoute();
  const targetUserId = route.params.to;
  const targetPropertyId = route.params.property;
  const convos = await getConversations(user.id);

  const page = document.createElement('div');
  page.className = 'messages-page';

  page.innerHTML = `
    <div class="conversations-list">
      <div class="conversations-header">Messages</div>
      <div id="convo-list">
        ${convos.length === 0 ? '<div style="padding:24px;color:var(--color-gray-400);font-size:13px;text-align:center">No conversations yet</div>' : ''}
      </div>
    </div>
    <div class="chat-area" id="chat-area">
      <div class="chat-empty" style="flex:1">Select a conversation or contact a landlord to start chatting</div>
    </div>
  `;

  const convoList = page.querySelector('#convo-list');
  const chatArea = page.querySelector('#chat-area');

  async function renderConvoList() {
    if (convos.length === 0) return;
    convoList.innerHTML = '';
    for (const c of convos) {
      const other = await getUserById(c.otherUserId);
      const prop = await getPropertyById(c.propertyId);
      const item = document.createElement('div');
      item.className = `conversation-item${(targetUserId === c.otherUserId && targetPropertyId === c.propertyId) ? ' active' : ''}`;
      item.innerHTML = `
        <div class="conversation-avatar">${escapeHTML(other?.name?.charAt(0) || '?')}</div>
        <div class="conversation-info">
          <div class="conversation-name">${escapeHTML(other?.name || 'User')}</div>
          <div class="conversation-preview">${escapeHTML(prop?.title || 'Property')}</div>
        </div>
        <div class="conversation-time">${new Date(c.lastMessage.timestamp).toLocaleDateString()}</div>
      `;
      item.addEventListener('click', () => {
        navigate(`/messages?to=${c.otherUserId}&property=${c.propertyId}`);
        location.reload();
      });
      convoList.appendChild(item);
    }
  }

  async function renderChat(otherId, propId) {
    const other = await getUserById(otherId);
    const prop = await getPropertyById(propId);
    const messages = await getChatMessages(user.id, otherId, propId);

    chatArea.innerHTML = `
      <div class="chat-header">
        <div class="conversation-avatar" style="width:36px;height:36px;font-size:14px">${escapeHTML(other?.name?.charAt(0) || '?')}</div>
        <div>
          <div class="chat-header-name">${escapeHTML(other?.name || 'User')}</div>
          <div class="chat-property-ref">${escapeHTML(prop?.title || 'Property')} — ${escapeHTML(prop?.area || '')}</div>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages">
        ${messages.map(m => `
          <div class="chat-bubble ${m.senderId === user.id ? 'sent' : 'received'}">
            ${escapeHTML(m.message)}
            <div class="chat-bubble-time">${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        `).join('')}}
        ${messages.length === 0 ? '<div style="text-align:center;color:var(--color-gray-400);font-size:13px;margin:auto">Start the conversation</div>' : ''}
      </div>
      <div class="chat-input">
        <input type="text" placeholder="Type a message..." id="chat-message-input" />
        <button class="chat-send-btn" id="chat-send-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>
        </button>
      </div>
    `;

    // Scroll to bottom
    const msgsCont = chatArea.querySelector('#chat-messages');
    requestAnimationFrame(() => msgsCont.scrollTop = msgsCont.scrollHeight);

    // Send
    const input = chatArea.querySelector('#chat-message-input');
    const sendBtn = chatArea.querySelector('#chat-send-btn');
    const send = async () => {
      const msg = input.value.trim();
      if (!msg) return;
      if (msg.length > MAX_LENGTHS.message) {
        input.style.outline = '2px solid #EF4444';
        setTimeout(() => input.style.outline = '', 2000);
        return;
      }
      await sendMessage({ senderId: user.id, receiverId: otherId, propertyId: propId, message: msg });
      input.value = '';
      renderChat(otherId, propId);
    };
    sendBtn.addEventListener('click', send);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') send(); });
  }

  renderConvoList();

  if (targetUserId && targetPropertyId) {
    renderChat(targetUserId, targetPropertyId);
  }

  return page;
}
