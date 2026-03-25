// GET /api/wallet
// Auth: Bearer <Firebase ID Token>

import { db, FieldValue, verifyAuth, cors } from './_lib/admin.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const walletRef = db.collection('wallets').doc(user.uid);
  const snap = await walletRef.get();

  if (!snap.exists) {
    // Auto-create wallet
    await walletRef.set({
      userId: user.uid,
      balance: 0,
      createdAt: FieldValue.serverTimestamp(),
    });
    return res.status(200).json({ balance: 0 });
  }

  return res.status(200).json({ balance: snap.data().balance || 0 });
}
