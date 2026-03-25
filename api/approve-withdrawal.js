// POST /api/approve-withdrawal
// Body: { withdrawalId, action: 'approve' | 'reject' }
// Auth: Bearer <Firebase ID Token> — admin only

import { db, FieldValue, verifyAuth, cors, genRef, auditLog, logTransaction } from './_lib/admin.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const adminDoc = await db.collection('users').doc(user.uid).get();
  if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
    return res.status(403).json({ error: 'Admin only.' });
  }

  const { withdrawalId, action } = req.body;
  if (!withdrawalId) return res.status(400).json({ error: 'Withdrawal ID required.' });

  if (action === 'reject') {
    await db.collection('withdrawals').doc(withdrawalId).update({
      status: 'rejected', processedBy: user.uid, processedAt: FieldValue.serverTimestamp(),
    });
    auditLog('withdrawal_rejected', { withdrawalId, adminId: user.uid });
    return res.status(200).json({ success: true, status: 'rejected' });
  }

  try {
    await db.runTransaction(async (t) => {
      const wRef = db.collection('withdrawals').doc(withdrawalId);
      const wSnap = await t.get(wRef);
      if (!wSnap.exists) throw new Error('Withdrawal not found.');

      const w = wSnap.data();
      if (w.status !== 'pending') throw new Error(`Withdrawal is ${w.status}.`);

      const walletRef = db.collection('wallets').doc(w.userId);
      const walletSnap = await t.get(walletRef);
      if (!walletSnap.exists || (walletSnap.data().balance || 0) < w.amount) {
        throw new Error('Insufficient balance.');
      }

      const reference = genRef('WDR');
      t.update(walletRef, { balance: FieldValue.increment(-w.amount) });
      t.update(wRef, { status: 'approved', processedBy: user.uid, processedAt: FieldValue.serverTimestamp() });
      logTransaction(t, {
        userId: w.userId, type: 'withdraw', amount: -w.amount,
        status: 'completed', reference, metadata: { withdrawalId, adminId: user.uid },
      });
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  auditLog('withdrawal_approved', { withdrawalId, adminId: user.uid });
  return res.status(200).json({ success: true, status: 'approved' });
}
