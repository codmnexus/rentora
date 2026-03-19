import { getCurrentUser, getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../utils/store.js';
import { escapeHTML } from '../utils/authSecurity.js';

export async function createNotificationBell() {
  const user = await getCurrentUser();
  if (!user) return null;

  const container = document.createElement('div');
  container.className = 'notification-container';

  const unread = await getUnreadCount(user.id);

  container.innerHTML = `
    <button class="notification-bell" id="notif-bell" aria-label="Notifications">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
      ${unread > 0 ? `<span class="notification-badge">${unread > 9 ? '9+' : unread}</span>` : ''}
    </button>
    <div class="notification-dropdown" id="notif-dropdown">
      <div class="notif-dropdown-header">
        <span>Notifications</span>
        ${unread > 0 ? `<button class="notif-mark-all" id="notif-mark-all">Mark all read</button>` : ''}
      </div>
      <div class="notif-list" id="notif-list"></div>
    </div>
  `;

  const bell = container.querySelector('#notif-bell');
  const dropdown = container.querySelector('#notif-dropdown');
  const listEl = container.querySelector('#notif-list');

  async function renderNotifications() {
    const notifs = (await getNotifications(user.id)).slice(0, 20);
    if (notifs.length === 0) {
      listEl.innerHTML = '<div class="notif-empty">No notifications yet</div>';
      return;
    }
    listEl.innerHTML = notifs.map(n => {
      const timeAgo = getTimeAgo(n.createdAt);
      const icon = getNotifIcon(n.type);
      return `
        <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
          <div class="notif-icon">${icon}</div>
          <div class="notif-content">
            <div class="notif-message">${escapeHTML(n.message)}</div>
            <div class="notif-time">${timeAgo}</div>
          </div>
          ${!n.read ? '<div class="notif-dot"></div>' : ''}
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.notif-item.unread').forEach(item => {
      item.addEventListener('click', async () => {
        await markNotificationRead(item.dataset.id);
        item.classList.remove('unread');
        item.querySelector('.notif-dot')?.remove();
        await updateBadge();
      });
    });
  }

  async function updateBadge() {
    const count = await getUnreadCount(user.id);
    const badge = container.querySelector('.notification-badge');
    if (count > 0) {
      if (badge) badge.textContent = count > 9 ? '9+' : count;
      else {
        const b = document.createElement('span');
        b.className = 'notification-badge';
        b.textContent = count > 9 ? '9+' : count;
        bell.appendChild(b);
      }
    } else {
      badge?.remove();
    }
  }

  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) renderNotifications();
  });

  document.addEventListener('click', () => dropdown.classList.remove('active'));
  dropdown.addEventListener('click', (e) => e.stopPropagation());

  container.querySelector('#notif-mark-all')?.addEventListener('click', async () => {
    await markAllNotificationsRead(user.id);
    await renderNotifications();
    await updateBadge();
  });

  return container;
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

function getNotifIcon(type) {
  switch (type) {
    case 'inspection': return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6h12M5 1v3M11 1v3"/></svg>';
    case 'message': return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 10a1.5 1.5 0 01-1.5 1.5H5l-3 3V4A1.5 1.5 0 013.5 2.5h9A1.5 1.5 0 0114 4z"/></svg>';
    case 'payment': return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 7h14"/></svg>';
    default: return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1"/></svg>';
  }
}
