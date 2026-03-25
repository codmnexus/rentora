// POST /api/create-escrow
// Body: { amount, receiverId, listingId }
// Auth: Bearer <Firebase ID Token>

import { db, FieldValue, verifyAuth, cors, genRef, auditLog, logTransaction, checkRateLimit } from './_lib/admin.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (!checkRateLimit(user.uid)) return res.status(429).json({ error: 'Too many requests.' });

  const { amount, receiverId, listingId } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount.' });
  }
  if (!receiverId) return res.status(400).json({ error: 'Receiver ID required.' });
  if (!listingId) return res.status(400).json({ error: 'Listing ID required.' });
  if (receiverId === user.uid) return res.status(400).json({ error: 'Cannot escrow to yourself.' });

  let escrowId;

  try {
    await db.runTransaction(async (t) => {
      const walletRef = db.collection('wallets').doc(user.uid);
      const walletSnap = await t.get(walletRef);

      if (!walletSnap.exists || (walletSnap.data().balance || 0) < amount) {
        throw new Error('Insufficient balance.');
      }

      const reference = genRef('ESC');
      t.update(walletRef, { balance: FieldValue.increment(-amount) });

      const escrowRef = db.collection('escrow').doc();
      escrowId = escrowRef.id;

      t.set(escrowRef, {
        payerId: user.uid, receiverId, amount, status: 'held',
        listingId, reference, createdAt: FieldValue.serverTimestamp(),
      });

      logTransaction(t, {
        userId: user.uid, type: 'escrow_hold', amount: -amount,
        status: 'completed', reference,
        metadata: { escrowId, receiverId, listingId },
      });
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  auditLog('escrow_created', { payerId: user.uid, receiverId, amount, escrowId });
  return res.status(200).json({ escrowId, status: 'held' });
}
