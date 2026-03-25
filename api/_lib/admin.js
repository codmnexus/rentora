// Shared Firebase Admin SDK singleton for Vercel Serverless Functions
// Initialized with service account credentials from environment variables

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app;

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

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

export const db = getFirestore(app);
export const adminAuth = getAuth(app);
export { FieldValue };

// ---- Auth middleware ----
export async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.split('Bearer ')[1];
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

// ---- Helpers ----
export function genRef(prefix = 'PAY') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function logTransaction(t, { userId, type, amount, status, reference, metadata = {} }) {
  const txnRef = db.collection('transactions').doc();
  t.set(txnRef, {
    userId, type, amount, status,
    reference: reference || genRef('TXN'),
    metadata,
    createdAt: FieldValue.serverTimestamp(),
  });
  return txnRef.id;
}

export function auditLog(action, data) {
  console.log(JSON.stringify({
    severity: 'INFO', action,
    timestamp: new Date().toISOString(),
    ...data,
  }));
}

// ---- Rate limiting (per-instance) ----
const rateLimitMap = new Map();
export function checkRateLimit(userId, maxReqs = 10, windowMs = 60000) {
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

// ---- CORS helper ----
export function cors(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

// ---- Paystack API ----
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE = 'https://api.paystack.co';

export async function paystackRequest(method, path, body = null) {
  const response = await fetch(`${PAYSTACK_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return response.json();
}

export { PAYSTACK_SECRET };
