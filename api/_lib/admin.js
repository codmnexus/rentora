// Shared Firebase Admin SDK singleton for Vercel Serverless Functions
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

let app;
if (!getApps().length) {
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'rentoral',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const adminAuth = getAuth(app);

// ---- Auth middleware ----
async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
  } catch { return null; }
}

// ---- Helpers ----
function genRef(prefix = 'PAY') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function logTransaction(t, { userId, type, amount, status, reference, metadata = {} }) {
  const txnRef = db.collection('transactions').doc();
  t.set(txnRef, { userId, type, amount, status, reference: reference || genRef('TXN'), metadata, createdAt: FieldValue.serverTimestamp() });
  return txnRef.id;
}

function auditLog(action, data) {
  console.log(JSON.stringify({ severity: 'INFO', action, timestamp: new Date().toISOString(), ...data }));
}

// ---- Rate limiting ----
const rateLimitMap = new Map();
function checkRateLimit(userId, maxReqs = 10, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitMap.set(userId, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= maxReqs) return false;
  entry.count++;
  return true;
}

// ---- CORS ----
function cors(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return true; }
  return false;
}

// ---- Paystack API ----
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

async function paystackRequest(method, path, body = null) {
  const res = await fetch(`https://api.paystack.co${path}`, {
    method,
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

module.exports = { db, adminAuth, FieldValue, verifyAuth, genRef, logTransaction, auditLog, checkRateLimit, cors, PAYSTACK_SECRET, paystackRequest };
