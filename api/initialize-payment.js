// POST /api/initialize-payment
// Body: { amount, email, metadata }
// Auth: Bearer <Firebase ID Token>

import { db, FieldValue, verifyAuth, cors, genRef, auditLog, checkRateLimit, paystackRequest } from './_lib/admin.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (!checkRateLimit(user.uid)) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  const { amount, email, metadata = {} } = req.body;

  if (!amount || typeof amount !== 'number' || amount < 100) {
    return res.status(400).json({ error: 'Amount must be at least ₦100.' });
  }
  if (!email) return res.status(400).json({ error: 'Email required.' });

  const reference = genRef('PAY');

  await db.collection('payments').doc(reference).set({
    userId: user.uid,
    provider: 'paystack',
    reference,
    amount,
    status: 'pending',
    metadata,
    createdAt: FieldValue.serverTimestamp(),
  });

  auditLog('payment_initiated', { userId: user.uid, amount, reference });

  const result = await paystackRequest('POST', '/transaction/initialize', {
    email,
    amount: amount * 100,
    reference,
    metadata: { userId: user.uid, ...metadata },
  });

  if (!result.status) {
    await db.collection('payments').doc(reference).update({ status: 'failed' });
    return res.status(500).json({ error: result.message || 'Payment initialization failed.' });
  }

  return res.status(200).json({
    authorization_url: result.data.authorization_url,
    access_code: result.data.access_code,
    reference,
  });
}
