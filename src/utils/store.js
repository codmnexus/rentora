// ============================================
// Rentora — Dual-Mode Store (localStorage ↔ Firebase)
// ============================================
// Toggle USE_FIREBASE to switch between localStorage (dev/demo) and Firestore (production)

export const USE_FIREBASE = true;

import * as fb from './firebaseStore.js';

// ---- localStorage helpers ----
const KEYS = {
  USERS: 'rentora_users',
  PROPERTIES: 'rentora_properties',
  TAKEOVERS: 'rentora_takeovers',
  MESSAGES: 'rentora_messages',
  SAVED: 'rentora_saved',
  INSPECTIONS: 'rentora_inspections',
  REVIEWS: 'rentora_reviews',
  REPORTS: 'rentora_reports',
  NOTIFICATIONS: 'rentora_notifications',
  CURRENT_USER: 'rentora_current_user',
  SEEDED: 'rentora_seeded_v3'
};

function _get(key) {
  try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
}
function _set(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function _genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ============================================
// USERS
// ============================================
export async function getUsers() {
  if (USE_FIREBASE) return fb.getUsers();
  return _get(KEYS.USERS) || [];
}

export async function createUser({ name, email, phone, password, role, ...extra }) {
  if (USE_FIREBASE) return fb.createUser({ name, email, phone, password, role, ...extra });
  const users = _get(KEYS.USERS) || [];
  if (users.find(u => u.email === email)) return { error: 'Email already exists' };
  const user = {
    id: _genId(), name, email, phone, password, role, ...extra,
    verified: role === 'admin', profileCompleted: false,
    avatar: name.charAt(0).toUpperCase(),
    createdAt: new Date().toISOString()
  };
  users.push(user);
  _set(KEYS.USERS, users);
  return { user };
}

export async function loginUser(email, password) {
  if (USE_FIREBASE) return fb.loginUser(email, password);
  const users = _get(KEYS.USERS) || [];
  // NOTE: localStorage fallback compares plaintext — for local dev only
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { error: 'Invalid email or password' };
  // Strip password before storing in session
  const { password: _, ...safeUser } = user;
  _set(KEYS.CURRENT_USER, safeUser);
  return { user: safeUser };
}

export async function resetPassword(email) {
  if (USE_FIREBASE) return fb.resetPassword(email);
  return { error: 'Password reset is not available in offline mode.' };
}

export async function resendVerificationEmail() {
  if (USE_FIREBASE) return fb.resendVerificationEmail();
  return { error: 'Email verification is not available in offline mode.' };
}

export async function getCurrentUser() {
  if (USE_FIREBASE) return fb.getCurrentUser();
  return _get(KEYS.CURRENT_USER);
}

export async function logoutUser() {
  if (USE_FIREBASE) return fb.logoutUser();
  localStorage.removeItem(KEYS.CURRENT_USER);
}

export async function updateUser(userId, updates) {
  if (USE_FIREBASE) return fb.updateUser(userId, updates);
  const users = _get(KEYS.USERS) || [];
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return;
  users[idx] = { ...users[idx], ...updates };
  _set(KEYS.USERS, users);
  const cu = _get(KEYS.CURRENT_USER);
  if (cu?.id === userId) _set(KEYS.CURRENT_USER, users[idx]);
  return users[idx];
}

export async function verifyLandlord(userId) {
  if (USE_FIREBASE) return fb.verifyLandlord(userId);
  return updateUser(userId, { verified: true });
}

export async function banUser(userId) {
  if (USE_FIREBASE) return fb.banUser(userId);
  return updateUser(userId, { banned: true });
}

export async function getUserById(id) {
  if (USE_FIREBASE) return fb.getUserById(id);
  return (_get(KEYS.USERS) || []).find(u => u.id === id);
}

// ============================================
// PROPERTIES
// ============================================
export async function getProperties() {
  if (USE_FIREBASE) return fb.getProperties();
  return _get(KEYS.PROPERTIES) || [];
}

export async function getPropertyById(id) {
  if (USE_FIREBASE) return fb.getPropertyById(id);
  return (_get(KEYS.PROPERTIES) || []).find(p => p.id === id);
}

export async function createProperty(data) {
  if (USE_FIREBASE) return fb.createProperty(data);
  const props = _get(KEYS.PROPERTIES) || [];
  const property = {
    id: _genId(), ...data, views: 0, savedBy: 0,
    status: 'pending', rented: false, createdAt: new Date().toISOString()
  };
  props.push(property);
  _set(KEYS.PROPERTIES, props);
  return property;
}

export async function updateProperty(id, updates) {
  if (USE_FIREBASE) return fb.updateProperty(id, updates);
  const props = _get(KEYS.PROPERTIES) || [];
  const idx = props.findIndex(p => p.id === id);
  if (idx === -1) return null;
  props[idx] = { ...props[idx], ...updates };
  _set(KEYS.PROPERTIES, props);
  return props[idx];
}

export async function deleteProperty(id) {
  if (USE_FIREBASE) return fb.deleteProperty(id);
  _set(KEYS.PROPERTIES, (_get(KEYS.PROPERTIES) || []).filter(p => p.id !== id));
}

export async function approveProperty(id) { return updateProperty(id, { status: 'approved' }); }
export async function rejectProperty(id) { return updateProperty(id, { status: 'rejected' }); }
export async function markAsRented(id) { return updateProperty(id, { rented: true }); }
export async function markAsAvailable(id) { return updateProperty(id, { rented: false }); }

export async function incrementPropertyViews(id) {
  if (USE_FIREBASE) return fb.incrementPropertyViews(id);
  const p = await getPropertyById(id);
  if (p) await updateProperty(id, { views: (p.views || 0) + 1 });
}

export async function getPropertiesByLandlord(landlordId) {
  if (USE_FIREBASE) return fb.getPropertiesByLandlord(landlordId);
  return (_get(KEYS.PROPERTIES) || []).filter(p => p.landlordId === landlordId);
}

export async function getApprovedProperties() {
  if (USE_FIREBASE) return fb.getApprovedProperties();
  return (_get(KEYS.PROPERTIES) || []).filter(p => p.status === 'approved' && !p.rented);
}

export async function getPendingProperties() {
  if (USE_FIREBASE) return fb.getPendingProperties();
  return (_get(KEYS.PROPERTIES) || []).filter(p => p.status === 'pending');
}

export async function searchProperties(filters = {}) {
  if (USE_FIREBASE) return fb.searchProperties(filters);
  let results = await getApprovedProperties();
  if (filters.location) results = results.filter(p => p.area.toLowerCase().includes(filters.location.toLowerCase()));
  if (filters.minPrice) results = results.filter(p => p.price >= filters.minPrice);
  if (filters.maxPrice) results = results.filter(p => p.price <= filters.maxPrice);
  if (filters.roomType) results = results.filter(p => p.type === filters.roomType);
  if (filters.furnished !== undefined && filters.furnished !== '') {
    results = results.filter(p => p.furnished === (filters.furnished === true || filters.furnished === 'true'));
  }
  if (filters.maxDistance) results = results.filter(p => p.distanceFromCampus <= filters.maxDistance);
  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(p =>
      p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (filters.sortBy === 'price-asc') results.sort((a, b) => a.price - b.price);
  else if (filters.sortBy === 'price-desc') results.sort((a, b) => b.price - a.price);
  else if (filters.sortBy === 'distance') results.sort((a, b) => a.distanceFromCampus - b.distanceFromCampus);
  else if (filters.sortBy === 'newest') results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return results;
}

// ============================================
// ROOM TAKEOVERS
// ============================================
export async function getTakeovers() {
  if (USE_FIREBASE) return fb.getTakeovers();
  return _get(KEYS.TAKEOVERS) || [];
}

export async function getTakeoverById(id) {
  if (USE_FIREBASE) return fb.getTakeoverById(id);
  return (_get(KEYS.TAKEOVERS) || []).find(t => t.id === id);
}

export async function createTakeover(data) {
  if (USE_FIREBASE) return fb.createTakeover(data);
  const list = _get(KEYS.TAKEOVERS) || [];
  const takeover = { id: _genId(), ...data, views: 0, status: 'pending', createdAt: new Date().toISOString() };
  list.push(takeover);
  _set(KEYS.TAKEOVERS, list);
  return takeover;
}

export async function updateTakeover(id, updates) {
  if (USE_FIREBASE) return fb.updateTakeover(id, updates);
  const list = _get(KEYS.TAKEOVERS) || [];
  const idx = list.findIndex(t => t.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  _set(KEYS.TAKEOVERS, list);
  return list[idx];
}

export async function deleteTakeover(id) {
  if (USE_FIREBASE) return fb.deleteTakeover(id);
  _set(KEYS.TAKEOVERS, (_get(KEYS.TAKEOVERS) || []).filter(t => t.id !== id));
}

export async function approveTakeover(id) { return updateTakeover(id, { status: 'approved' }); }
export async function rejectTakeover(id) { return updateTakeover(id, { status: 'rejected' }); }

export async function getApprovedTakeovers() {
  if (USE_FIREBASE) return fb.getApprovedTakeovers();
  return (_get(KEYS.TAKEOVERS) || []).filter(t => t.status === 'approved');
}

export async function getPendingTakeovers() {
  if (USE_FIREBASE) return fb.getPendingTakeovers();
  return (_get(KEYS.TAKEOVERS) || []).filter(t => t.status === 'pending');
}

export async function getTakeoversByStudent(studentId) {
  if (USE_FIREBASE) return fb.getTakeoversByStudent(studentId);
  return (_get(KEYS.TAKEOVERS) || []).filter(t => t.studentId === studentId);
}

export async function searchTakeovers(filters = {}) {
  if (USE_FIREBASE) return fb.searchTakeovers(filters);
  let results = await getApprovedTakeovers();
  if (filters.location) results = results.filter(t => t.area.toLowerCase().includes(filters.location.toLowerCase()));
  if (filters.maxPrice) results = results.filter(t => t.rent <= filters.maxPrice);
  if (filters.minLease) results = results.filter(t => t.leaseRemaining >= filters.minLease);
  if (filters.sortBy === 'price-asc') results.sort((a, b) => a.rent - b.rent);
  else if (filters.sortBy === 'price-desc') results.sort((a, b) => b.rent - a.rent);
  else if (filters.sortBy === 'newest') results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return results;
}

export async function incrementTakeoverViews(id) {
  if (USE_FIREBASE) return fb.incrementTakeoverViews(id);
  const t = await getTakeoverById(id);
  if (t) await updateTakeover(id, { views: (t.views || 0) + 1 });
}

// ============================================
// MESSAGES
// ============================================
export async function getMessages() {
  if (USE_FIREBASE) return fb.getMessages();
  return _get(KEYS.MESSAGES) || [];
}

export async function sendMessage({ senderId, receiverId, propertyId, message }) {
  if (USE_FIREBASE) return fb.sendMessage({ senderId, receiverId, propertyId, message });
  const msgs = _get(KEYS.MESSAGES) || [];
  msgs.push({ id: _genId(), senderId, receiverId, propertyId, message, timestamp: new Date().toISOString(), read: false });
  _set(KEYS.MESSAGES, msgs);
}

export async function getConversations(userId) {
  if (USE_FIREBASE) return fb.getConversations(userId);
  const msgs = (_get(KEYS.MESSAGES) || []).filter(m => m.senderId === userId || m.receiverId === userId);
  const convos = {};
  msgs.forEach(m => {
    const otherId = m.senderId === userId ? m.receiverId : m.senderId;
    const key = [m.propertyId, otherId].sort().join('-');
    if (!convos[key]) convos[key] = { otherUserId: otherId, propertyId: m.propertyId, messages: [] };
    convos[key].messages.push(m);
  });
  return Object.values(convos).map(c => {
    c.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    c.lastMessage = c.messages[c.messages.length - 1];
    return c;
  }).sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
}

export async function getChatMessages(userId, otherUserId, propertyId) {
  if (USE_FIREBASE) return fb.getChatMessages(userId, otherUserId, propertyId);
  return (_get(KEYS.MESSAGES) || [])
    .filter(m => m.propertyId === propertyId &&
      ((m.senderId === userId && m.receiverId === otherUserId) ||
        (m.senderId === otherUserId && m.receiverId === userId)))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// ============================================
// REAL-TIME LISTENERS
// ============================================
export function onChatMessages(userId, otherUserId, propertyId, callback) {
  if (USE_FIREBASE) return fb.onChatMessages(userId, otherUserId, propertyId, callback);
  return () => {}; // no-op unsubscribe for localStorage fallback
}

export function onNotifications(userId, callback) {
  if (USE_FIREBASE) return fb.onNotifications(userId, callback);
  return () => {};
}

export function onConversations(userId, callback) {
  if (USE_FIREBASE) return fb.onConversations(userId, callback);
  return () => {};
}

// ============================================
// SAVED LISTINGS
// ============================================
export async function getSavedListings(userId) {
  if (USE_FIREBASE) return fb.getSavedListings(userId);
  return (_get(KEYS.SAVED) || []).filter(s => s.userId === userId);
}

export async function saveListing(userId, propertyId) {
  if (USE_FIREBASE) return fb.saveListing(userId, propertyId);
  const saved = _get(KEYS.SAVED) || [];
  if (saved.find(s => s.userId === userId && s.propertyId === propertyId)) return;
  saved.push({ userId, propertyId });
  _set(KEYS.SAVED, saved);
  const p = await getPropertyById(propertyId);
  if (p) await updateProperty(propertyId, { savedBy: (p.savedBy || 0) + 1 });
}

export async function removeSavedListing(userId, propertyId) {
  if (USE_FIREBASE) return fb.removeSavedListing(userId, propertyId);
  const saved = (_get(KEYS.SAVED) || []).filter(s => !(s.userId === userId && s.propertyId === propertyId));
  _set(KEYS.SAVED, saved);
}

export async function isListingSaved(userId, propertyId) {
  if (USE_FIREBASE) return fb.isListingSaved(userId, propertyId);
  return !!(_get(KEYS.SAVED) || []).find(s => s.userId === userId && s.propertyId === propertyId);
}

// ============================================
// INSPECTIONS
// ============================================
export async function getInspections() {
  if (USE_FIREBASE) return fb.getInspections();
  return _get(KEYS.INSPECTIONS) || [];
}

export async function createInspection(data) {
  if (USE_FIREBASE) return fb.createInspection(data);
  const list = _get(KEYS.INSPECTIONS) || [];
  const inspection = {
    id: _genId(), ...data, status: 'pending', createdAt: new Date().toISOString()
  };
  list.push(inspection);
  _set(KEYS.INSPECTIONS, list);
  await addNotification(data.landlordId, `New inspection request for "${data.propertyTitle}" on ${data.date}`, 'inspection');
  return inspection;
}

export async function getInspectionsByTenant(tenantId) {
  if (USE_FIREBASE) return fb.getInspectionsByTenant(tenantId);
  return (_get(KEYS.INSPECTIONS) || []).filter(i => i.tenantId === tenantId);
}

export async function getInspectionsByLandlord(landlordId) {
  if (USE_FIREBASE) return fb.getInspectionsByLandlord(landlordId);
  return (_get(KEYS.INSPECTIONS) || []).filter(i => i.landlordId === landlordId);
}

export async function updateInspection(id, updates) {
  if (USE_FIREBASE) return fb.updateInspection(id, updates);
  const list = _get(KEYS.INSPECTIONS) || [];
  const idx = list.findIndex(i => i.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  _set(KEYS.INSPECTIONS, list);
  return list[idx];
}

export async function approveInspection(id) {
  if (USE_FIREBASE) return fb.approveInspection(id);
  const insp = await updateInspection(id, { status: 'confirmed' });
  if (insp) await addNotification(insp.tenantId, `Your inspection for "${insp.propertyTitle}" on ${insp.date} has been confirmed! ✅`, 'inspection');
  return insp;
}

export async function rescheduleInspection(id, newDate, newTime) {
  if (USE_FIREBASE) return fb.rescheduleInspection(id, newDate, newTime);
  const insp = await updateInspection(id, { status: 'rescheduled', date: newDate, time: newTime });
  if (insp) await addNotification(insp.tenantId, `Your inspection for "${insp.propertyTitle}" has been rescheduled to ${newDate} at ${newTime}`, 'inspection');
  return insp;
}

export async function cancelInspection(id) {
  if (USE_FIREBASE) return fb.cancelInspection(id);
  return updateInspection(id, { status: 'cancelled' });
}

// ============================================
// REVIEWS
// ============================================
export async function getReviews() {
  if (USE_FIREBASE) return fb.getReviews();
  return _get(KEYS.REVIEWS) || [];
}

export async function createReview(data) {
  if (USE_FIREBASE) return fb.createReview(data);
  const list = _get(KEYS.REVIEWS) || [];
  const review = { id: _genId(), ...data, createdAt: new Date().toISOString() };
  list.push(review);
  _set(KEYS.REVIEWS, list);
  return review;
}

export async function getReviewsByProperty(propertyId) {
  if (USE_FIREBASE) return fb.getReviewsByProperty(propertyId);
  return (_get(KEYS.REVIEWS) || []).filter(r => r.propertyId === propertyId);
}

export async function getAverageRating(propertyId) {
  if (USE_FIREBASE) return fb.getAverageRating(propertyId);
  const reviews = await getReviewsByProperty(propertyId);
  if (reviews.length === 0) return null;
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
}

// ============================================
// REPORTS
// ============================================
export async function getReports() {
  if (USE_FIREBASE) return fb.getReports();
  return _get(KEYS.REPORTS) || [];
}

export async function createReport(data) {
  if (USE_FIREBASE) return fb.createReport(data);
  const list = _get(KEYS.REPORTS) || [];
  const report = {
    id: _genId(), ...data,
    category: data.category || '',
    severity: data.severity || 'medium',
    evidenceFileName: data.evidenceFileName || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  list.push(report);
  _set(KEYS.REPORTS, list);
  return report;
}

export async function getPendingReports() {
  if (USE_FIREBASE) return fb.getPendingReports();
  return (_get(KEYS.REPORTS) || []).filter(r => r.status === 'pending');
}

export async function getReportsByUser(userId) {
  if (USE_FIREBASE) return fb.getReportsByUser(userId);
  return (_get(KEYS.REPORTS) || []).filter(r => r.reporterId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function resolveReport(id, resolution) {
  if (USE_FIREBASE) return fb.resolveReport(id, resolution);
  const list = _get(KEYS.REPORTS) || [];
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], status: 'resolved', resolution };
  _set(KEYS.REPORTS, list);
  return list[idx];
}

export async function dismissReport(id) {
  if (USE_FIREBASE) return fb.dismissReport(id);
  const list = _get(KEYS.REPORTS) || [];
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], status: 'dismissed' };
  _set(KEYS.REPORTS, list);
  return list[idx];
}

// ============================================
// NOTIFICATIONS
// ============================================
export async function getNotifications(userId) {
  if (USE_FIREBASE) return fb.getNotifications(userId);
  return (_get(KEYS.NOTIFICATIONS) || []).filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function addNotification(userId, message, type = 'general') {
  if (USE_FIREBASE) return fb.addNotification(userId, message, type);
  const list = _get(KEYS.NOTIFICATIONS) || [];
  list.push({ id: _genId(), userId, message, type, read: false, createdAt: new Date().toISOString() });
  _set(KEYS.NOTIFICATIONS, list);
}

export async function getUnreadCount(userId) {
  if (USE_FIREBASE) return fb.getUnreadCount(userId);
  return (await getNotifications(userId)).filter(n => !n.read).length;
}

export async function markNotificationRead(id) {
  if (USE_FIREBASE) return fb.markNotificationRead(id);
  const list = _get(KEYS.NOTIFICATIONS) || [];
  const idx = list.findIndex(n => n.id === id);
  if (idx !== -1) { list[idx].read = true; _set(KEYS.NOTIFICATIONS, list); }
}

export async function markAllNotificationsRead(userId) {
  if (USE_FIREBASE) return fb.markAllNotificationsRead(userId);
  const list = _get(KEYS.NOTIFICATIONS) || [];
  list.forEach(n => { if (n.userId === userId) n.read = true; });
  _set(KEYS.NOTIFICATIONS, list);
}

// ============================================
// ANALYTICS (Admin)
// ============================================
export async function getAnalytics() {
  if (USE_FIREBASE) return fb.getAnalytics();
  const [users, props, takeovers, reports, reviews, inspections] = await Promise.all([
    getUsers(), getProperties(), getTakeovers(), getReports(), getReviews(), getInspections()
  ]);
  const areas = {};
  props.forEach(p => { areas[p.area] = (areas[p.area] || 0) + 1; });
  const topAreas = Object.entries(areas).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return {
    totalUsers: users.length,
    tenants: users.filter(u => u.role === 'tenant').length,
    landlords: users.filter(u => u.role === 'landlord').length,
    totalListings: props.length,
    approvedListings: props.filter(p => p.status === 'approved').length,
    pendingListings: props.filter(p => p.status === 'pending').length,
    totalTakeovers: takeovers.length,
    pendingTakeovers: takeovers.filter(t => t.status === 'pending').length,
    approvedTakeovers: takeovers.filter(t => t.status === 'approved').length,
    totalViews: props.reduce((s, p) => s + (p.views || 0), 0),
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    totalReviews: reviews.length,
    totalInspections: inspections.length,
    topAreas
  };
}

// ============================================
// SEED DATA
// ============================================
export async function seedData() {
  if (USE_FIREBASE) return fb.seedData();
  // localStorage seed — original logic
  if (_get(KEYS.SEEDED)) return;

  function gateDistances(southWalk, northWalk) {
    return { southGate: `${southWalk} min walk`, northGate: `${northWalk} min walk` };
  }

  // Admin user
  const adminPw = import.meta.env.VITE_SEED_ADMIN_PASSWORD || 'admin123';
  const userPw = import.meta.env.VITE_SEED_USER_PASSWORD || 'pass123';
  await createUser({ name: 'Admin', email: 'admin@rentora.com', phone: '08000000000', password: adminPw, role: 'admin' });

  const landlords = [
    await createUser({ name: 'Adekunle Ajayi', email: 'adekunle@email.com', phone: '08012345678', password: userPw, role: 'landlord' }),
    await createUser({ name: 'Funke Oladipo', email: 'funke@email.com', phone: '08023456789', password: userPw, role: 'landlord' }),
    await createUser({ name: 'Emeka Nwosu', email: 'emeka@email.com', phone: '08034567890', password: userPw, role: 'landlord' }),
    await createUser({ name: 'Bisi Adeyemi', email: 'bisi@email.com', phone: '08045678901', password: userPw, role: 'landlord' }),
  ];

  for (let i = 0; i < 3; i++) {
    if (landlords[i]?.user) await verifyLandlord(landlords[i].user.id);
  }

  const tenantResult = await createUser({ name: 'Tunde Student', email: 'tunde@email.com', phone: '08056789012', password: userPw, role: 'tenant' });
  const tenant2Result = await createUser({ name: 'Adebayo Kolade', email: 'adebayo@email.com', phone: '08067890123', password: userPw, role: 'tenant' });

  const ll = landlords.map(l => l.user?.id).filter(Boolean);

  const propertyData = [
    { title: 'Spacious Self-Con near FUTA South Gate', type: 'Self-con', area: 'FUTA South Gate', address: '14 Abiola Street, South Gate, Akure', price: 150000, description: 'A well-finished self-contained apartment just 2 minutes walk from FUTA South Gate.', roomsAvailable: 3, distanceFromCampus: 0.3, furnished: false, gateDistances: gateDistances(3, 18), amenities: ['Water supply', 'Security', 'Tiled floors', 'Good ventilation', 'Parking space', 'Fence & gate'], images: ['/images/property_1.png', '/images/property_2.png', '/images/property_5.png'], landlordId: ll[0], landlordName: 'Adekunle Ajayi', landlordPhone: '08012345678', verified: true, status: 'approved' },
    { title: 'Furnished Studio Apartment at Ijapo', type: 'Studio', area: 'Ijapo Estate', address: '7B Ijapo Housing Estate, Akure', price: 250000, description: 'Fully furnished studio apartment in the serene Ijapo Estate.', roomsAvailable: 1, distanceFromCampus: 2.5, furnished: true, gateDistances: gateDistances(25, 30), amenities: ['Furnished', 'AC', 'Wifi ready', 'Kitchen', 'Water heater', 'Security', 'Parking space'], images: ['/images/property_5.png', '/images/property_1.png', '/images/property_2.png'], landlordId: ll[1], landlordName: 'Funke Oladipo', landlordPhone: '08023456789', verified: true, status: 'approved' },
    { title: 'Affordable Single Room at Roadblock', type: 'Single room', area: 'Roadblock', address: '22 Roadblock Area, FUTA Road, Akure', price: 80000, description: 'Clean single room in a well-maintained compound at Roadblock.', roomsAvailable: 5, distanceFromCampus: 1.0, furnished: false, gateDistances: gateDistances(10, 15), amenities: ['Water supply', 'Security', 'Shared kitchen', 'Fence & gate', 'Close to bus stop'], images: ['/images/property_2.png', '/images/property_4.png', '/images/property_6.png'], landlordId: ll[2], landlordName: 'Emeka Nwosu', landlordPhone: '08034567890', verified: true, status: 'approved' },
  ];

  const props = _get(KEYS.PROPERTIES) || [];
  propertyData.forEach(p => {
    props.push({ id: _genId(), views: Math.floor(Math.random() * 100) + 10, savedBy: Math.floor(Math.random() * 20), createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(), ...p });
  });
  _set(KEYS.PROPERTIES, props);

  // Demo messages
  const users = _get(KEYS.USERS) || [];
  const tenant = users.find(u => u.role === 'tenant');
  const landlord = users.find(u => u.role === 'landlord');
  const aprops = _get(KEYS.PROPERTIES) || [];
  if (tenant && landlord && aprops.length > 0) {
    await sendMessage({ senderId: tenant.id, receiverId: landlord.id, propertyId: aprops[0].id, message: 'Hello, is this apartment still available?' });
    await sendMessage({ senderId: landlord.id, receiverId: tenant.id, propertyId: aprops[0].id, message: 'Yes it is! When would you like to come for inspection?' });
  }

  _set(KEYS.SEEDED, true);
}

// ============================================
// WALLET & PAYMENTS
// ============================================
export async function getWallet() {
  if (USE_FIREBASE) return fb.getWallet();
  return { balance: 0 };
}

export async function initializePayment(data) {
  if (USE_FIREBASE) return fb.initializePayment(data);
  return { error: 'Payments not available in offline mode.' };
}

export async function getUserTransactions(userId) {
  if (USE_FIREBASE) return fb.getUserTransactions(userId);
  return [];
}

export async function createEscrow(data) {
  if (USE_FIREBASE) return fb.createEscrow(data);
  return { error: 'Escrow not available in offline mode.' };
}

export async function releaseEscrow(escrowId) {
  if (USE_FIREBASE) return fb.releaseEscrow(escrowId);
  return { error: 'Escrow not available in offline mode.' };
}

export async function getUserEscrows(userId) {
  if (USE_FIREBASE) return fb.getUserEscrows(userId);
  return [];
}

export async function requestWithdrawal(amount) {
  if (USE_FIREBASE) return fb.requestWithdrawal(amount);
  return { error: 'Withdrawals not available in offline mode.' };
}

export async function getUserWithdrawals(userId) {
  if (USE_FIREBASE) return fb.getUserWithdrawals(userId);
  return [];
}

export async function getAllEscrows() {
  if (USE_FIREBASE) return fb.getAllEscrows();
  return [];
}

export async function refundEscrow(escrowId) {
  if (USE_FIREBASE) return fb.refundEscrow(escrowId);
  return { error: 'Escrow not available in offline mode.' };
}

export async function getAllWithdrawals() {
  if (USE_FIREBASE) return fb.getAllWithdrawals();
  return [];
}

export async function approveWithdrawal(withdrawalId, action) {
  if (USE_FIREBASE) return fb.approveWithdrawal(withdrawalId, action);
  return { error: 'Withdrawals not available in offline mode.' };
}

