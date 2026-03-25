const { db, FieldValue, verifyAuth, cors, genRef, auditLog, logTransaction } = require('./_lib/admin');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const adminDoc = await db.collection('users').doc(user.uid).get();
  if (!adminDoc.exists || adminDoc.data().role !== 'admin') return res.status(403).json({ error: 'Admin only.' });

  const { escrowId } = req.body;
  if (!escrowId) return res.status(400).json({ error: 'Escrow ID required.' });

  try {
    await db.runTransaction(async (t) => {
      const escrowRef = db.collection('escrow').doc(escrowId);
      const escrowSnap = await t.get(escrowRef);
      if (!escrowSnap.exists) throw new Error('Escrow not found.');
      const escrow = escrowSnap.data();
      if (escrow.status !== 'held') throw new Error(`Escrow is ${escrow.status}, cannot refund.`);

      const reference = genRef('RFD');
      const payerWalletRef = db.collection('wallets').doc(escrow.payerId);
      const payerSnap = await t.get(payerWalletRef);
      if (!payerSnap.exists) {
        t.set(payerWalletRef, { userId: escrow.payerId, balance: escrow.amount, createdAt: FieldValue.serverTimestamp() });
      } else {
        t.update(payerWalletRef, { balance: FieldValue.increment(escrow.amount) });
      }
      t.update(escrowRef, { status: 'refunded', refundedBy: user.uid, refundedAt: FieldValue.serverTimestamp() });
      logTransaction(t, { userId: escrow.payerId, type: 'refund', amount: escrow.amount, status: 'completed', reference, metadata: { escrowId, adminId: user.uid } });
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  auditLog('escrow_refunded', { escrowId, adminId: user.uid });
  return res.status(200).json({ success: true });
};
