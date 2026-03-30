// ============================================
// Rentora — Firebase Firestore Backend Store
// ============================================

import { db, auth } from './firebase.js';
import {
    collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
    query, where, orderBy, limit, serverTimestamp, increment, onSnapshot
} from 'firebase/firestore';


import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { startSessionTimer, stopSessionTimer, sanitizeInput } from './authSecurity.js';

// ---- Collection refs ----
const COL = {
    USERS: 'users',
    PROPERTIES: 'properties',
    TAKEOVERS: 'takeovers',
    MESSAGES: 'messages',
    SAVED: 'saved',
    INSPECTIONS: 'inspections',
    REVIEWS: 'reviews',
    REPORTS: 'reports',
    NOTIFICATIONS: 'notifications'
};

// ---- Cached current user ----
let _currentUser = null;
let _currentUserDoc = null;
let _authReady = false;
let _authReadyResolve;
const _authReadyPromise = new Promise(resolve => { _authReadyResolve = resolve; });

// Persistent auth listener — tracks login/logout throughout the session
onAuthStateChanged(auth, async (user) => {
    _currentUser = user;
    if (user) {
        try {
            const snap = await getDoc(doc(db, COL.USERS, user.uid));
            _currentUserDoc = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        } catch (err) {
            console.warn('[Rentora] Could not fetch user doc:', err.message);
            _currentUserDoc = null;
        }
    } else {
        _currentUserDoc = null;
    }
    if (!_authReady) {
        _authReady = true;
        _authReadyResolve();
    }
});

// Timeout fallback — app loads even if Firebase Auth is unreachable
setTimeout(() => {
    if (!_authReady) {
        console.warn('[Rentora] Auth timeout — continuing without auth');
        _authReady = true;
        _authReadyResolve();
    }
}, 5000);

// Wait for auth to be ready before any operations
export async function waitForAuth() {
    if (!_authReady) await _authReadyPromise;
}

// ---- Helpers ----
function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function getAllDocs(colName) {
    try {
        const snap = await getDocs(collection(db, colName));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error(`[Rentora] Failed to fetch ${colName}:`, err.message);
        return [];
    }
}

async function getDocById(colName, id) {
    try {
        const snap = await getDoc(doc(db, colName, id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
        console.error(`[Rentora] Failed to fetch ${colName}/${id}:`, err.message);
        return null;
    }
}

async function updateDocById(colName, id, updates) {
    try {
        const ref = doc(db, colName, id);
        await updateDoc(ref, updates);
        const snap = await getDoc(ref);
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
        console.error(`[Rentora] Failed to update ${colName}/${id}:`, err.message);
        return null;
    }
}

// ---- Users ----
export async function getUsers() {
    return getAllDocs(COL.USERS);
}

export async function createUser({ name, email, phone, password, role, ...extra }) {
    try {
        // Check if email already exists in Firestore
        const existing = await getDocs(query(collection(db, COL.USERS), where('email', '==', email)));
        if (!existing.empty) return { error: 'Email already exists' };

        // Create Firebase Auth account
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        // Send email verification
        try {
            await sendEmailVerification(cred.user);
        } catch (verifyErr) {
            console.warn('[Rentora] Could not send verification email:', verifyErr.message);
        }

        const userData = {
            name: sanitizeInput(name),
            email,
            phone: sanitizeInput(phone),
            role,
            ...extra,
            verified: role === 'admin',
            emailVerified: false,
            avatar: name.charAt(0).toUpperCase(),
            createdAt: new Date().toISOString()
        };

        // Store profile in Firestore (doc ID = auth uid) — never store password
        const { password: _, ...safeData } = { ...userData };
        await import('firebase/firestore').then(({ setDoc }) =>
            setDoc(doc(db, COL.USERS, uid), safeData)
        );

        const user = { id: uid, ...safeData };
        _currentUser = cred.user;
        _currentUserDoc = user;
        return { user, emailVerificationSent: true };
    } catch (err) {
        if (err.code === 'auth/email-already-in-use') return { error: 'Email already exists' };
        if (err.code === 'auth/weak-password') return { error: 'Password is too weak. Use at least 6 characters.' };
        return { error: err.message };
    }
}

export async function loginUser(email, password) {
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;
        const snap = await getDoc(doc(db, COL.USERS, uid));
        if (!snap.exists()) return { error: 'User profile not found' };

        // Check if user is banned
        const userData = snap.data();
        if (userData.banned) {
            await signOut(auth);
            return { error: 'This account has been suspended. Contact support.' };
        }

        // Check email verification (skip for demo/seed accounts)
        const isDemoAccount = ['admin@rentora.com', 'tunde@email.com', 'adekunle@email.com',
            'funke@email.com', 'emeka@email.com', 'bisi@email.com', 'adebayo@email.com'].includes(email);
        if (!cred.user.emailVerified && !isDemoAccount) {
            // Update Firestore emailVerified status
            return {
                user: { id: snap.id, ...userData },
                emailNotVerified: true,
                message: 'Please verify your email address. Check your inbox for a verification link.'
            };
        }

        // Sync emailVerified status to Firestore
        if (cred.user.emailVerified && !userData.emailVerified) {
            await updateDoc(doc(db, COL.USERS, uid), { emailVerified: true });
        }

        const user = { id: snap.id, ...userData, emailVerified: cred.user.emailVerified };
        _currentUser = cred.user;
        _currentUserDoc = user;

        // Start session timeout (auto-logout after 30 min idle)
        startSessionTimer(async () => {
            console.warn('[Rentora] Session expired due to inactivity');
            await logoutUser();
            window.location.hash = '#/login';
            window.location.reload();
        });

        return { user };
    } catch (err) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            return { error: 'Invalid email or password' };
        }
        if (err.code === 'auth/too-many-requests') {
            return { error: 'Too many failed attempts. Please try again later.' };
        }
        return { error: err.message };
    }
}

export async function getCurrentUser() {
    await waitForAuth();
    return _currentUserDoc;
}

export async function logoutUser() {
    stopSessionTimer();
    await signOut(auth);
    _currentUser = null;
    _currentUserDoc = null;
}

// ---- Password Reset ----
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (err) {
        if (err.code === 'auth/user-not-found') return { error: 'No account found with this email.' };
        return { error: err.message };
    }
}

// ---- Resend Verification Email ----
export async function resendVerificationEmail() {
    if (_currentUser && !_currentUser.emailVerified) {
        try {
            await sendEmailVerification(_currentUser);
            return { success: true };
        } catch (err) {
            return { error: err.message };
        }
    }
    return { error: 'No unverified user or already verified.' };
}

export async function updateUser(userId, updates) {
    const result = await updateDocById(COL.USERS, userId, updates);
    if (_currentUserDoc?.id === userId) {
        _currentUserDoc = result;
    }
    return result;
}

export async function verifyLandlord(userId) {
    return updateUser(userId, { verified: true });
}

export async function banUser(userId) {
    return updateUser(userId, { banned: true });
}

export async function getUserById(id) {
    return getDocById(COL.USERS, id);
}

// ---- Properties ----
export async function getProperties() {
    return getAllDocs(COL.PROPERTIES);
}

export async function getPropertyById(id) {
    return getDocById(COL.PROPERTIES, id);
}

export async function createProperty(data) {
    const property = {
        ...data,
        title: sanitizeInput(data.title),
        description: sanitizeInput(data.description || ''),
        address: sanitizeInput(data.address || ''),
        area: sanitizeInput(data.area || ''),
        views: 0,
        savedBy: 0,
        status: 'pending',
        rented: false,
        createdAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, COL.PROPERTIES), property);
    return { id: ref.id, ...property };
}

export async function updateProperty(id, updates) {
    return updateDocById(COL.PROPERTIES, id, updates);
}

export async function deleteProperty(id) {
    await deleteDoc(doc(db, COL.PROPERTIES, id));
}

export async function approveProperty(id) { return updateProperty(id, { status: 'approved' }); }
export async function rejectProperty(id) { return updateProperty(id, { status: 'rejected' }); }
export async function markAsRented(id) { return updateProperty(id, { rented: true }); }
export async function markAsAvailable(id) { return updateProperty(id, { rented: false }); }

export async function incrementPropertyViews(id) {
    const p = await getPropertyById(id);
    if (p) await updateProperty(id, { views: (p.views || 0) + 1 });
}

export async function getPropertiesByLandlord(landlordId) {
    const snap = await getDocs(query(collection(db, COL.PROPERTIES), where('landlordId', '==', landlordId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getApprovedProperties() {
    const all = await getProperties();
    return all.filter(p => p.status === 'approved' && !p.rented);
}

export async function getPendingProperties() {
    const all = await getProperties();
    return all.filter(p => p.status === 'pending');
}

export async function searchProperties(filters = {}) {
    let results = await getApprovedProperties();
    if (filters.location) {
        results = results.filter(p => p.area.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.minPrice) {
        results = results.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
        results = results.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.roomType) {
        results = results.filter(p => p.type === filters.roomType);
    }
    if (filters.furnished !== undefined && filters.furnished !== '') {
        results = results.filter(p => p.furnished === (filters.furnished === true || filters.furnished === 'true'));
    }
    if (filters.maxDistance) {
        results = results.filter(p => p.distanceFromCampus <= filters.maxDistance);
    }
    if (filters.query) {
        const q = filters.query.toLowerCase();
        results = results.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.area.toLowerCase().includes(q) ||
            p.type.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
    }
    if (filters.sortBy === 'price-asc') results.sort((a, b) => a.price - b.price);
    else if (filters.sortBy === 'price-desc') results.sort((a, b) => b.price - a.price);
    else if (filters.sortBy === 'distance') results.sort((a, b) => a.distanceFromCampus - b.distanceFromCampus);
    else if (filters.sortBy === 'newest') results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return results;
}

// ---- Room Takeovers ----
export async function getTakeovers() {
    return getAllDocs(COL.TAKEOVERS);
}

export async function getTakeoverById(id) {
    return getDocById(COL.TAKEOVERS, id);
}

export async function createTakeover(data) {
    const takeover = {
        ...data,
        title: sanitizeInput(data.title),
        description: sanitizeInput(data.description || ''),
        address: sanitizeInput(data.address || ''),
        area: sanitizeInput(data.area || ''),
        houseRules: sanitizeInput(data.houseRules || ''),
        views: 0,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, COL.TAKEOVERS), takeover);
    return { id: ref.id, ...takeover };
}

export async function updateTakeover(id, updates) {
    return updateDocById(COL.TAKEOVERS, id, updates);
}

export async function deleteTakeover(id) {
    await deleteDoc(doc(db, COL.TAKEOVERS, id));
}

export async function approveTakeover(id) { return updateTakeover(id, { status: 'approved' }); }
export async function rejectTakeover(id) { return updateTakeover(id, { status: 'rejected' }); }

export async function getApprovedTakeovers() {
    const all = await getTakeovers();
    return all.filter(t => t.status === 'approved');
}

export async function getPendingTakeovers() {
    const all = await getTakeovers();
    return all.filter(t => t.status === 'pending');
}

export async function getTakeoversByStudent(studentId) {
    const snap = await getDocs(query(collection(db, COL.TAKEOVERS), where('studentId', '==', studentId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function searchTakeovers(filters = {}) {
    let results = await getApprovedTakeovers();
    if (filters.location) {
        results = results.filter(t => t.area.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.maxPrice) {
        results = results.filter(t => t.rent <= filters.maxPrice);
    }
    if (filters.minLease) {
        results = results.filter(t => t.leaseRemaining >= filters.minLease);
    }
    if (filters.sortBy === 'price-asc') results.sort((a, b) => a.rent - b.rent);
    else if (filters.sortBy === 'price-desc') results.sort((a, b) => b.rent - a.rent);
    else if (filters.sortBy === 'newest') results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return results;
}

export async function incrementTakeoverViews(id) {
    const t = await getTakeoverById(id);
    if (t) await updateTakeover(id, { views: (t.views || 0) + 1 });
}

// ---- Messages ----
// SECURE: Query only messages the current user is involved in (respects Firestore rules)
async function getMessagesByUser(userId) {
    const [sentSnap, receivedSnap] = await Promise.all([
        getDocs(query(collection(db, COL.MESSAGES), where('senderId', '==', userId))),
        getDocs(query(collection(db, COL.MESSAGES), where('receiverId', '==', userId)))
    ]);
    const msgs = new Map();
    sentSnap.docs.forEach(d => msgs.set(d.id, { id: d.id, ...d.data() }));
    receivedSnap.docs.forEach(d => msgs.set(d.id, { id: d.id, ...d.data() }));
    return Array.from(msgs.values());
}

export async function getMessages() {
    // If logged in, only fetch user's messages. Otherwise return empty.
    await waitForAuth();
    if (!_currentUserDoc) return [];
    return getMessagesByUser(_currentUserDoc.id);
}

export async function sendMessage({ senderId, receiverId, propertyId, message }) {
    await addDoc(collection(db, COL.MESSAGES), {
        id: genId(),
        senderId, receiverId, propertyId,
        message: sanitizeInput(message),
        timestamp: new Date().toISOString(),
        read: false
    });
}

export async function getConversations(userId) {
    const msgs = await getMessagesByUser(userId);
    const convos = {};
    msgs.forEach(m => {
        const otherId = m.senderId === userId ? m.receiverId : m.senderId;
        const key = [m.propertyId, otherId].sort().join('-');
        if (!convos[key]) {
            convos[key] = { otherUserId: otherId, propertyId: m.propertyId, messages: [] };
        }
        convos[key].messages.push(m);
    });
    return Object.values(convos).map(c => {
        c.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        c.lastMessage = c.messages[c.messages.length - 1];
        return c;
    }).sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
}

export async function getChatMessages(userId, otherUserId, propertyId) {
    const msgs = await getMessagesByUser(userId);
    return msgs
        .filter(m => m.propertyId === propertyId &&
            ((m.senderId === userId && m.receiverId === otherUserId) ||
                (m.senderId === otherUserId && m.receiverId === userId)))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}
// ---- Real-Time Listeners ----

/**
 * Subscribe to chat messages in real-time between two users about a property.
 * Returns an unsubscribe() function for cleanup.
 */
export function onChatMessages(userId, otherUserId, propertyId, callback) {
    // Listen to messages sent by current user to other user
    const q1 = query(
        collection(db, COL.MESSAGES),
        where('senderId', '==', userId),
        where('receiverId', '==', otherUserId),
        where('propertyId', '==', propertyId)
    );
    // Listen to messages sent by other user to current user
    const q2 = query(
        collection(db, COL.MESSAGES),
        where('senderId', '==', otherUserId),
        where('receiverId', '==', userId),
        where('propertyId', '==', propertyId)
    );

    let sentMsgs = [];
    let recvMsgs = [];
    let initialized = [false, false];

    function merge() {
        if (!initialized[0] || !initialized[1]) return;
        const all = [...sentMsgs, ...recvMsgs]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        callback(all);
    }

    const unsub1 = onSnapshot(q1, (snap) => {
        sentMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        initialized[0] = true;
        merge();
    }, (err) => console.error('[Rentora] onChatMessages sent error:', err.message));

    const unsub2 = onSnapshot(q2, (snap) => {
        recvMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        initialized[1] = true;
        merge();
    }, (err) => console.error('[Rentora] onChatMessages recv error:', err.message));

    return () => { unsub1(); unsub2(); };
}

/**
 * Subscribe to notifications for a user in real-time.
 * Returns an unsubscribe() function.
 */
export function onNotifications(userId, callback) {
    const q = query(
        collection(db, COL.NOTIFICATIONS),
        where('userId', '==', userId)
    );
    return onSnapshot(q, (snap) => {
        const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(notifs);
    }, (err) => console.error('[Rentora] onNotifications error:', err.message));
}

/**
 * Subscribe to all conversations for a user in real-time (sidebar updates).
 * Returns an unsubscribe() function.
 */
export function onConversations(userId, callback) {
    const q1 = query(collection(db, COL.MESSAGES), where('senderId', '==', userId));
    const q2 = query(collection(db, COL.MESSAGES), where('receiverId', '==', userId));

    let sentMsgs = [];
    let recvMsgs = [];
    let initialized = [false, false];

    function buildConvos() {
        if (!initialized[0] || !initialized[1]) return;
        const allMsgs = new Map();
        sentMsgs.forEach(m => allMsgs.set(m.id, m));
        recvMsgs.forEach(m => allMsgs.set(m.id, m));
        const msgs = Array.from(allMsgs.values());

        const convos = {};
        msgs.forEach(m => {
            const otherId = m.senderId === userId ? m.receiverId : m.senderId;
            const key = [m.propertyId, otherId].sort().join('-');
            if (!convos[key]) convos[key] = { otherUserId: otherId, propertyId: m.propertyId, messages: [] };
            convos[key].messages.push(m);
        });

        const result = Object.values(convos).map(c => {
            c.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            c.lastMessage = c.messages[c.messages.length - 1];
            return c;
        }).sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

        callback(result);
    }

    const unsub1 = onSnapshot(q1, (snap) => {
        sentMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        initialized[0] = true;
        buildConvos();
    }, (err) => console.error('[Rentora] onConversations sent error:', err.message));

    const unsub2 = onSnapshot(q2, (snap) => {
        recvMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        initialized[1] = true;
        buildConvos();
    }, (err) => console.error('[Rentora] onConversations recv error:', err.message));

    return () => { unsub1(); unsub2(); };
}

// ---- Saved Listings ----
export async function getSavedListings(userId) {
    const snap = await getDocs(query(collection(db, COL.SAVED), where('userId', '==', userId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveListing(userId, propertyId) {
    const existing = await getDocs(query(
        collection(db, COL.SAVED),
        where('userId', '==', userId),
        where('propertyId', '==', propertyId)
    ));
    if (!existing.empty) return;
    await addDoc(collection(db, COL.SAVED), { userId, propertyId });
    const p = await getPropertyById(propertyId);
    if (p) await updateProperty(propertyId, { savedBy: (p.savedBy || 0) + 1 });
}

export async function removeSavedListing(userId, propertyId) {
    const snap = await getDocs(query(
        collection(db, COL.SAVED),
        where('userId', '==', userId),
        where('propertyId', '==', propertyId)
    ));
    const batch = [];
    snap.docs.forEach(d => batch.push(deleteDoc(d.ref)));
    await Promise.all(batch);
}

export async function isListingSaved(userId, propertyId) {
    const snap = await getDocs(query(
        collection(db, COL.SAVED),
        where('userId', '==', userId),
        where('propertyId', '==', propertyId)
    ));
    return !snap.empty;
}

// ---- Inspections ----
export async function getInspections() {
    return getAllDocs(COL.INSPECTIONS);
}

export async function createInspection({ tenantId, tenantName, landlordId, landlordName, propertyId, propertyTitle, date, time, notes }) {
    const inspection = {
        tenantId, tenantName, landlordId, landlordName,
        propertyId, propertyTitle, date, time, notes,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, COL.INSPECTIONS), inspection);
    await addNotification(landlordId, `New inspection request for "${propertyTitle}" on ${date}`, 'inspection');
    return { id: ref.id, ...inspection };
}

export async function getInspectionsByTenant(tenantId) {
    const snap = await getDocs(query(collection(db, COL.INSPECTIONS), where('tenantId', '==', tenantId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getInspectionsByLandlord(landlordId) {
    const snap = await getDocs(query(collection(db, COL.INSPECTIONS), where('landlordId', '==', landlordId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateInspection(id, updates) {
    return updateDocById(COL.INSPECTIONS, id, updates);
}

export async function approveInspection(id) {
    const insp = await updateInspection(id, { status: 'confirmed' });
    if (insp) await addNotification(insp.tenantId, `Your inspection for "${insp.propertyTitle}" on ${insp.date} has been confirmed! ✅`, 'inspection');
    return insp;
}

export async function rescheduleInspection(id, newDate, newTime) {
    const insp = await updateInspection(id, { status: 'rescheduled', date: newDate, time: newTime });
    if (insp) await addNotification(insp.tenantId, `Your inspection for "${insp.propertyTitle}" has been rescheduled to ${newDate} at ${newTime}`, 'inspection');
    return insp;
}

export async function cancelInspection(id) {
    return updateInspection(id, { status: 'cancelled' });
}

// ---- Reviews ----
export async function getReviews() {
    return getAllDocs(COL.REVIEWS);
}

export async function createReview({ userId, userName, propertyId, rating, text }) {
    const review = {
        userId, userName: sanitizeInput(userName), propertyId, rating,
        text: sanitizeInput(text),
        createdAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, COL.REVIEWS), review);
    return { id: ref.id, ...review };
}

export async function getReviewsByProperty(propertyId) {
    const snap = await getDocs(query(collection(db, COL.REVIEWS), where('propertyId', '==', propertyId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAverageRating(propertyId) {
    const reviews = await getReviewsByProperty(propertyId);
    if (reviews.length === 0) return null;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
}

// ---- Reports ----
export async function getReports() {
    return getAllDocs(COL.REPORTS);
}

export async function createReport({ reporterId, reporterName, targetId, targetType, reason, details }) {
    const report = {
        reporterId, reporterName: sanitizeInput(reporterName),
        targetId, targetType,
        reason: sanitizeInput(reason),
        details: sanitizeInput(details || ''),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, COL.REPORTS), report);
    return { id: ref.id, ...report };
}

export async function getPendingReports() {
    const all = await getReports();
    return all.filter(r => r.status === 'pending');
}

export async function resolveReport(id, resolution) {
    return updateDocById(COL.REPORTS, id, { status: 'resolved', resolution });
}

export async function dismissReport(id) {
    return updateDocById(COL.REPORTS, id, { status: 'dismissed' });
}

// ---- Notifications ----
export async function getNotifications(userId) {
    const snap = await getDocs(query(collection(db, COL.NOTIFICATIONS), where('userId', '==', userId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function addNotification(userId, message, type = 'general') {
    await addDoc(collection(db, COL.NOTIFICATIONS), {
        userId, message, type,
        read: false,
        createdAt: new Date().toISOString()
    });
}

export async function getUnreadCount(userId) {
    const notifs = await getNotifications(userId);
    return notifs.filter(n => !n.read).length;
}

export async function markNotificationRead(id) {
    await updateDocById(COL.NOTIFICATIONS, id, { read: true });
}

export async function markAllNotificationsRead(userId) {
    const notifs = await getNotifications(userId);
    await Promise.all(notifs.filter(n => !n.read).map(n => updateDocById(COL.NOTIFICATIONS, n.id, { read: true })));
}

// ---- Analytics (Admin) ----
export async function getAnalytics() {
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

// ---- Seed Data ----
export async function seedData() {
    // Check if already seeded by looking for any properties
    const existing = await getDocs(query(collection(db, COL.PROPERTIES), limit(1)));
    if (!existing.empty) return;

    // Seed data uses the localStorage store for initial population
    // Import and run the localStorage seeder, then copy to Firestore
    console.log('[Rentora] Seeding Firestore with demo data...');

    const { setDoc } = await import('firebase/firestore');
    const uidMap = {};

    // Helper — gate distance
    function gateDistances(southWalk, northWalk) {
        return { southGate: `${southWalk} min walk`, northGate: `${northWalk} min walk` };
    }

    // ---- Create demo users in Firestore (skip Auth for seed users) ----
    const seedUsers = [
        { id: 'admin-001', name: 'Admin', email: 'admin@rentora.com', phone: '08000000000', role: 'admin', verified: true, avatar: 'A', createdAt: new Date().toISOString() },
        { id: 'landlord-001', name: 'Adekunle Ajayi', email: 'adekunle@email.com', phone: '08012345678', role: 'landlord', verified: true, avatar: 'A', createdAt: new Date().toISOString() },
        { id: 'landlord-002', name: 'Funke Oladipo', email: 'funke@email.com', phone: '08023456789', role: 'landlord', verified: true, avatar: 'F', createdAt: new Date().toISOString() },
        { id: 'landlord-003', name: 'Emeka Nwosu', email: 'emeka@email.com', phone: '08034567890', role: 'landlord', verified: true, avatar: 'E', createdAt: new Date().toISOString() },
        { id: 'landlord-004', name: 'Bisi Adeyemi', email: 'bisi@email.com', phone: '08045678901', role: 'landlord', verified: false, avatar: 'B', createdAt: new Date().toISOString() },
        { id: 'tenant-001', name: 'Tunde Student', email: 'tunde@email.com', phone: '08056789012', role: 'tenant', verified: false, avatar: 'T', createdAt: new Date().toISOString() },
        { id: 'tenant-002', name: 'Adebayo Kolade', email: 'adebayo@email.com', phone: '08067890123', role: 'tenant', verified: false, avatar: 'A', createdAt: new Date().toISOString() },
    ];

    for (const u of seedUsers) {
        const { id, ...data } = u;
        const password = id.startsWith('admin')
            ? (import.meta.env.VITE_SEED_ADMIN_PASSWORD || 'admin123')
            : (import.meta.env.VITE_SEED_USER_PASSWORD || 'pass123');
        let uid = id;
        try {
            const cred = await createUserWithEmailAndPassword(auth, u.email, password);
            uid = cred.user.uid;
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                try {
                    const cred = await signInWithEmailAndPassword(auth, u.email, password);
                    uid = cred.user.uid;
                } catch (e) { console.warn('Seed login failed:', u.email, e.message); }
            } else {
                console.warn('Seed auth error:', u.email, err.message);
            }
        }
        uidMap[id] = uid;
        await setDoc(doc(db, COL.USERS, uid), data);
    }

    // Sign in as admin for writing properties/takeovers/messages
    try {
        await signInWithEmailAndPassword(auth, 'admin@rentora.com', import.meta.env.VITE_SEED_ADMIN_PASSWORD || 'admin123');
    } catch (e) { console.warn('Admin sign-in failed:', e.message); }

    // ---- Seed properties ----
    const propertyData = [
        {
            title: 'Spacious Self-Con near FUTA South Gate', type: 'Self-con', area: 'FUTA South Gate',
            address: '14 Abiola Street, South Gate, Akure', price: 150000,
            description: 'A well-finished self-contained apartment just 2 minutes walk from FUTA South Gate. Tiled floors, modern bathroom, spacious room with good ventilation. Water and security included.',
            roomsAvailable: 3, distanceFromCampus: 0.3, furnished: false,
            gateDistances: gateDistances(3, 18),
            amenities: ['Water supply', 'Security', 'Tiled floors', 'Good ventilation', 'Parking space', 'Fence & gate'],
            images: ['/images/property_1.png', '/images/property_2.png', '/images/property_5.png'],
            landlordId: 'landlord-001', landlordName: 'Adekunle Ajayi', landlordPhone: '08012345678', verified: true, status: 'approved'
        },
        {
            title: 'Furnished Studio Apartment at Ijapo', type: 'Studio', area: 'Ijapo Estate',
            address: '7B Ijapo Housing Estate, Akure', price: 250000,
            description: 'Fully furnished studio apartment in the serene Ijapo Estate. Comes with bed, wardrobe, reading table, AC, and kitchen fittings.',
            roomsAvailable: 1, distanceFromCampus: 2.5, furnished: true,
            gateDistances: gateDistances(25, 30),
            amenities: ['Furnished', 'AC', 'Wifi ready', 'Kitchen', 'Water heater', 'Security', 'Parking space'],
            images: ['/images/property_5.png', '/images/property_1.png', '/images/property_2.png'],
            landlordId: 'landlord-002', landlordName: 'Funke Oladipo', landlordPhone: '08023456789', verified: true, status: 'approved'
        },
        {
            title: 'Affordable Single Room at Roadblock', type: 'Single room', area: 'Roadblock',
            address: '22 Roadblock Area, FUTA Road, Akure', price: 80000,
            description: 'Clean single room in a well-maintained compound at Roadblock. Shared kitchen and bathroom.',
            roomsAvailable: 5, distanceFromCampus: 1.0, furnished: false,
            gateDistances: gateDistances(10, 15),
            amenities: ['Water supply', 'Security', 'Shared kitchen', 'Fence & gate', 'Close to bus stop'],
            images: ['/images/property_2.png', '/images/property_4.png', '/images/property_6.png'],
            landlordId: 'landlord-003', landlordName: 'Emeka Nwosu', landlordPhone: '08034567890', verified: true, status: 'approved'
        },
        {
            title: 'Modern 2-Bedroom Flat at Oba Ile', type: 'Flat', area: 'Oba Ile',
            address: '5 Unity Road, Oba Ile, Akure', price: 350000,
            description: 'Brand new 2-bedroom flat with modern finishes. Each room is ensuite with POP ceiling, fitted kitchen, and spacious living room.',
            roomsAvailable: 2, distanceFromCampus: 4.0, furnished: false,
            gateDistances: gateDistances(35, 40),
            amenities: ['Ensuite rooms', 'POP ceiling', 'Fitted kitchen', 'Water supply', 'Security', 'Parking space', 'Fence & gate', 'Tiled floors'],
            images: ['/images/property_3.png', '/images/property_5.png', '/images/property_1.png'],
            landlordId: 'landlord-004', landlordName: 'Bisi Adeyemi', landlordPhone: '08045678901', verified: false, status: 'approved'
        },
        {
            title: 'Budget Shared Room for Students', type: 'Shared room', area: 'FUTA South Gate',
            address: '3 Student Lane, South Gate, Akure', price: 45000,
            description: 'Shared room accommodation perfect for budget-conscious students.',
            roomsAvailable: 8, distanceFromCampus: 0.2, furnished: false,
            gateDistances: gateDistances(2, 20),
            amenities: ['Water supply', 'Security', 'Close to campus', 'Reading room', 'Fence & gate'],
            images: ['/images/property_4.png', '/images/property_2.png', '/images/property_6.png'],
            landlordId: 'landlord-001', landlordName: 'Adekunle Ajayi', landlordPhone: '08012345678', verified: true, status: 'approved'
        },
        {
            title: 'Executive Self-Con with AC at Aule', type: 'Self-con', area: 'Aule',
            address: '10 Aule Road, Akure', price: 200000,
            description: 'Premium self-contained apartment with AC, tiled bathroom, and modern fittings.',
            roomsAvailable: 2, distanceFromCampus: 3.0, furnished: true,
            gateDistances: gateDistances(28, 22),
            amenities: ['AC', 'Prepaid meter', 'Tiled floors', 'Water heater', 'Security', 'Parking space', 'Good road', 'Fence & gate'],
            images: ['/images/property_1.png', '/images/property_3.png', '/images/property_5.png'],
            landlordId: 'landlord-002', landlordName: 'Funke Oladipo', landlordPhone: '08023456789', verified: true, status: 'approved'
        },
        {
            title: 'Cozy Single Room near FUTA North Gate', type: 'Single room', area: 'FUTA North Gate',
            address: '8 North Gate Road, Akure', price: 70000,
            description: 'Affordable single room close to FUTA North Gate. Clean compound with reliable water supply.',
            roomsAvailable: 4, distanceFromCampus: 0.5, furnished: false,
            gateDistances: gateDistances(15, 4),
            amenities: ['Water supply', 'Security', 'Close to campus', 'Fence & gate', 'Good ventilation'],
            images: ['/images/property_6.png', '/images/property_4.png', '/images/property_2.png'],
            landlordId: 'landlord-003', landlordName: 'Emeka Nwosu', landlordPhone: '08034567890', verified: true, status: 'approved'
        },
        {
            title: 'Luxury Mini Flat at Ijapo Estate', type: 'Flat', area: 'Ijapo Estate',
            address: '15A Ijapo Housing Estate, Akure', price: 300000,
            description: 'Beautiful mini flat in Ijapo Estate with separate bedroom, living room, kitchen, and bathroom.',
            roomsAvailable: 1, distanceFromCampus: 2.8, furnished: false,
            gateDistances: gateDistances(27, 32),
            amenities: ['POP ceiling', 'Tiled floors', 'Kitchen', 'Water supply', 'Security', 'Parking space', 'Fence & gate'],
            images: ['/images/property_5.png', '/images/property_3.png', '/images/property_1.png'],
            landlordId: 'landlord-004', landlordName: 'Bisi Adeyemi', landlordPhone: '08045678901', verified: false, status: 'approved'
        },
        {
            title: 'Self-Con with Prepaid Meter at Roadblock', type: 'Self-con', area: 'Roadblock',
            address: '17 FUTA Road, Roadblock, Akure', price: 120000,
            description: 'Neat self-contained apartment at Roadblock with own prepaid meter, water supply, and good security.',
            roomsAvailable: 3, distanceFromCampus: 0.8, furnished: false,
            gateDistances: gateDistances(8, 12),
            amenities: ['Prepaid meter', 'Water supply', 'Security', 'Close to campus', 'Fence & gate', 'Tiled floors'],
            images: ['/images/property_2.png', '/images/property_6.png', '/images/property_4.png'],
            landlordId: 'landlord-001', landlordName: 'Adekunle Ajayi', landlordPhone: '08012345678', verified: true, status: 'approved'
        },
        {
            title: 'Spacious Flat near Oba Ile Junction', type: 'Flat', area: 'Oba Ile',
            address: '3 Junction Road, Oba Ile, Akure', price: 280000,
            description: 'Newly built 2-bedroom flat near Oba Ile junction. Spacious rooms, modern kitchen, and ample parking.',
            roomsAvailable: 1, distanceFromCampus: 5.0, furnished: false,
            gateDistances: gateDistances(40, 45),
            amenities: ['Spacious rooms', 'Kitchen', 'Parking space', 'Water supply', 'Fence & gate', 'Good road'],
            images: ['/images/property_3.png', '/images/property_1.png', '/images/property_6.png'],
            landlordId: 'landlord-002', landlordName: 'Funke Oladipo', landlordPhone: '08023456789', verified: true, status: 'approved'
        },
        {
            title: 'Student Hostel — Shared Accommodation', type: 'Shared room', area: 'FUTA South Gate',
            address: '1 Hostel Close, South Gate, Akure', price: 35000,
            description: 'Well-managed student hostel right beside FUTA South Gate. 4-man rooms with bunk beds and reading area.',
            roomsAvailable: 20, distanceFromCampus: 0.1, furnished: true,
            gateDistances: gateDistances(1, 22),
            amenities: ['Bunk beds', 'Reading room', 'Water supply', 'Security', 'Close to campus', 'Fence & gate', 'Generator backup'],
            images: ['/images/property_4.png', '/images/property_2.png', '/images/property_5.png'],
            landlordId: 'landlord-003', landlordName: 'Emeka Nwosu', landlordPhone: '08034567890', verified: true, status: 'approved'
        },
        {
            title: 'Furnished Self-Con at Aule', type: 'Self-con', area: 'Aule',
            address: '25 Aule Housing Road, Akure', price: 180000,
            description: 'Fully furnished self-con with bed, wardrobe, gas cooker, and bathroom fittings.',
            roomsAvailable: 2, distanceFromCampus: 3.5, furnished: true,
            gateDistances: gateDistances(30, 25),
            amenities: ['Furnished', 'Gas cooker', 'Water supply', 'Prepaid meter', 'Security', 'Parking space', 'Tiled floors', 'Fence & gate'],
            images: ['/images/property_6.png', '/images/property_1.png', '/images/property_3.png'],
            landlordId: 'landlord-004', landlordName: 'Bisi Adeyemi', landlordPhone: '08045678901', verified: false, status: 'approved'
        }
    ];

    for (const p of propertyData) {
        p.landlordId = uidMap[p.landlordId] || p.landlordId;
        await addDoc(collection(db, COL.PROPERTIES), {
            ...p,
            views: Math.floor(Math.random() * 100) + 10,
            savedBy: Math.floor(Math.random() * 20),
            createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString()
        });
    }

    // ---- Seed Takeovers ----
    const takeoverData = [
        {
            studentId: 'tenant-001', studentName: 'Tunde Student', studentPhone: '08056789012',
            title: 'Room in 2-bedroom flat — South Gate',
            description: "I'm graduating and need someone to take over my room. The apartment is shared with one other person who is very quiet and respectful.",
            images: ['/images/property_1.png', '/images/property_2.png'],
            rent: 150000, leaseRemaining: 6, apartmentType: 'Self-con', area: 'FUTA South Gate',
            address: '9 South Gate Close, Akure', gateDistances: gateDistances(4, 19),
            houseRules: 'No loud music after 10pm. Keep common areas clean. No pets.',
            amenities: ['Water supply', 'Security', 'Tiled floors', 'Fence & gate'], status: 'approved'
        },
        {
            studentId: 'tenant-001', studentName: 'Tunde Student', studentPhone: '08056789012',
            title: 'Single room at Roadblock — 4 months left',
            description: 'Moving out for SIWES. Room is in very good condition with tiled floor and good ventilation.',
            images: ['/images/property_4.png', '/images/property_6.png'],
            rent: 80000, leaseRemaining: 4, apartmentType: 'Single room', area: 'Roadblock',
            address: '15 Roadblock Lane, Akure', gateDistances: gateDistances(9, 14),
            houseRules: 'No cooking in the room. Shared kitchen available.',
            amenities: ['Water supply', 'Shared kitchen', 'Good ventilation'], status: 'approved'
        },
        {
            studentId: 'tenant-002', studentName: 'Adebayo Kolade', studentPhone: '08067890123',
            title: 'Furnished self-con near North Gate — 8 months',
            description: "Fully furnished self-con that I've been living in for 4 months. Comes with everything — bed, wardrobe, reading table, fan, curtains.",
            images: ['/images/property_5.png', '/images/property_3.png'],
            rent: 170000, leaseRemaining: 8, apartmentType: 'Self-con', area: 'FUTA North Gate',
            address: '3 North Gate Avenue, Akure', gateDistances: gateDistances(16, 3),
            houseRules: 'Quiet compound. No visitors after 11pm. Keep bathroom clean.',
            amenities: ['Furnished', 'Water supply', 'Security', 'Close to campus', 'Tiled floors'], status: 'approved'
        }
    ];

    for (const t of takeoverData) {
        t.studentId = uidMap[t.studentId] || t.studentId;
        await addDoc(collection(db, COL.TAKEOVERS), {
            ...t, views: Math.floor(Math.random() * 50) + 5, createdAt: new Date().toISOString()
        });
    }

    // ---- Seed demo messages ----
    const msgData = [
        { senderId: 'tenant-001', receiverId: 'landlord-001', message: 'Hello, is this apartment still available?' },
        { senderId: 'landlord-001', receiverId: 'tenant-001', message: 'Yes it is! When would you like to come for inspection?' },
        { senderId: 'tenant-001', receiverId: 'landlord-001', message: 'Can I come this Saturday morning?' }
    ];

    // Get first property ID for message context
    const propsSnap = await getDocs(query(collection(db, COL.PROPERTIES), limit(1)));
    const firstPropId = propsSnap.docs[0]?.id || 'unknown';

    for (let i = 0; i < msgData.length; i++) {
        const m = { ...msgData[i] };
        m.senderId = uidMap[m.senderId] || m.senderId;
        m.receiverId = uidMap[m.receiverId] || m.receiverId;
        await addDoc(collection(db, COL.MESSAGES), {
            ...m,
            propertyId: firstPropId,
            timestamp: new Date(Date.now() - (msgData.length - i) * 60000).toISOString(),
            read: false
        });
    }

    // Sign out to leave clean state
    await signOut(auth);

    console.log('[Rentora] ✅ Firestore seed complete!');
}

// ============================================
// WALLET & PAYMENTS (Vercel Serverless API)
// ============================================

/** Get Firebase ID token for authenticated API calls */
async function getAuthHeaders() {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const token = await user.getIdToken();
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

/** Make authenticated API call to Vercel serverless function */
async function apiCall(path, options = {}) {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/${path}`, { ...options, headers: { ...headers, ...options.headers } });
    return res.json();
}

// ---- Wallet ----
export async function getWallet() {
    try {
        return await apiCall('wallet');
    } catch (err) {
        console.error('[Rentora] getWallet error:', err.message);
        return { balance: 0 };
    }
}

// ---- Initialize Payment (Paystack) ----
export async function initializePayment({ amount, email, metadata = {} }) {
    try {
        return await apiCall('initialize-payment', {
            method: 'POST',
            body: JSON.stringify({ amount, email, metadata }),
        });
    } catch (err) {
        console.error('[Rentora] initializePayment error:', err.message);
        return { error: err.message };
    }
}

// ---- Transactions (read from Firestore — allowed by RLS) ----
export async function getUserTransactions(userId) {
    try {
        const snap = await getDocs(query(
            collection(db, 'transactions'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        ));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error('[Rentora] getUserTransactions error:', err.message);
        return [];
    }
}

// ---- Escrow ----
export async function createEscrow({ amount, receiverId, listingId }) {
    try {
        return await apiCall('create-escrow', {
            method: 'POST',
            body: JSON.stringify({ amount, receiverId, listingId }),
        });
    } catch (err) {
        console.error('[Rentora] createEscrow error:', err.message);
        return { error: err.message };
    }
}

export async function releaseEscrow(escrowId) {
    try {
        return await apiCall('release-escrow', {
            method: 'POST',
            body: JSON.stringify({ escrowId }),
        });
    } catch (err) {
        console.error('[Rentora] releaseEscrow error:', err.message);
        return { error: err.message };
    }
}

export async function getUserEscrows(userId) {
    try {
        const data = await apiCall('get-escrows');
        return data.escrows || [];
    } catch (err) {
        console.error('[Rentora] getUserEscrows error:', err.message);
        return [];
    }
}

// ---- Withdrawals ----
export async function requestWithdrawal(amount) {
    try {
        return await apiCall('request-withdrawal', {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    } catch (err) {
        console.error('[Rentora] requestWithdrawal error:', err.message);
        return { error: err.message };
    }
}

export async function getUserWithdrawals(userId) {
    try {
        const data = await apiCall('get-withdrawals');
        return data.withdrawals || [];
    } catch (err) {
        console.error('[Rentora] getUserWithdrawals error:', err.message);
        return [];
    }
}

// ---- Admin: Escrows & Withdrawals ----
export async function getAllEscrows() {
    try {
        const data = await apiCall('get-escrows');
        return data.escrows || [];
    } catch (err) {
        console.error('[Rentora] getAllEscrows error:', err.message);
        return [];
    }
}

export async function refundEscrow(escrowId) {
    try {
        return await apiCall('refund-escrow', {
            method: 'POST',
            body: JSON.stringify({ escrowId }),
        });
    } catch (err) {
        console.error('[Rentora] refundEscrow error:', err.message);
        return { error: err.message };
    }
}

export async function getAllWithdrawals() {
    try {
        const data = await apiCall('get-withdrawals');
        return data.withdrawals || [];
    } catch (err) {
        console.error('[Rentora] getAllWithdrawals error:', err.message);
        return [];
    }
}

export async function approveWithdrawal(withdrawalId, action = 'approve') {
    try {
        return await apiCall('approve-withdrawal', {
            method: 'POST',
            body: JSON.stringify({ withdrawalId, action }),
        });
    } catch (err) {
        console.error('[Rentora] approveWithdrawal error:', err.message);
        return { error: err.message };
    }
}
