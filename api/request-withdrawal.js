// POST /api/request-withdrawal
// Body: { amount }
// Auth: Bearer <Firebase ID Token>

import { db, FieldValue, verifyAuth, cors, auditLog, checkRateLimit } from './_lib/admin.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (!checkRateLimit(user.uid)) return res.status(429).json({ error: 'Too many requests.' });

  const { amount } = req.body;
  if (!amount || typeof amount !== 'number' || amount < 100) {
    return res.status(400).json({ error: 'Minimum withdrawal is ₦100.' });
  }

  // Check for pending withdrawals
  const pendingSnap = await db.collection('withdrawals')
    .where('userId', '==', user.uid)
    .where('status', '==', 'pending')
    .get();

  if (!pendingSnap.empty) {
    return res.status(400).json({ error: 'You already have a pending withdrawal.' });
  }

  const walletSnap = await db.collection('wallets').doc(user.uid).get();
  if (!walletSnap.exists || (walletSnap.data().balance || 0) < amount) {
    return res.status(400).json({ error: 'Insufficient balance.' });
  }

  const ref = await db.collection('withdrawals').add({
    userId: user.uid, amount, status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
  });

  auditLog('withdrawal_requested', { userId: user.uid, amount, withdrawalId: ref.id });
  return res.status(200).json({ withdrawalId: ref.id, status: 'pending' });
}
