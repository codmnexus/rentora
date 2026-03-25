// POST /api/release-escrow
// Body: { escrowId }
// Auth: Bearer <Firebase ID Token>

import { db, FieldValue, verifyAuth, cors, genRef, auditLog, logTransaction } from './_lib/admin.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { escrowId } = req.body;
  if (!escrowId) return res.status(400).json({ error: 'Escrow ID required.' });

  try {
    await db.runTransaction(async (t) => {
      const escrowRef = db.collection('escrow').doc(escrowId);
      const escrowSnap = await t.get(escrowRef);

      if (!escrowSnap.exists) throw new Error('Escrow not found.');
      const escrow = escrowSnap.data();
      if (escrow.status !== 'held') throw new Error(`Escrow is ${escrow.status}, not held.`);

      // Only payer or admin can release
      const userDoc = await t.get(db.collection('users').doc(user.uid));
      const isAdmin = userDoc.exists && userDoc.data().role === 'admin';
      if (escrow.payerId !== user.uid && !isAdmin) {
        throw new Error('Only the payer or an admin can release escrow.');
      }

      const reference = genRef('REL');
      const receiverWalletRef = db.collection('wallets').doc(escrow.receiverId);
      const receiverSnap = await t.get(receiverWalletRef);

      if (!receiverSnap.exists) {
        t.set(receiverWalletRef, { userId: escrow.receiverId, balance: escrow.amount, createdAt: FieldValue.serverTimestamp() });
      } else {
        t.update(receiverWalletRef, { balance: FieldValue.increment(escrow.amount) });
      }

      t.update(escrowRef, { status: 'released', releasedBy: user.uid, releasedAt: FieldValue.serverTimestamp() });

      logTransaction(t, {
        userId: escrow.receiverId, type: 'escrow_release', amount: escrow.amount,
        status: 'completed', reference,
        metadata: { escrowId, payerId: escrow.payerId, listingId: escrow.listingId },
      });
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  auditLog('escrow_released', { escrowId, releasedBy: user.uid });
  return res.status(200).json({ success: true });
}
